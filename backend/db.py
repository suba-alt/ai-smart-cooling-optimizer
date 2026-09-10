import os
import sqlite3
import threading
from datetime import datetime
from config import Config

try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

class Database:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.use_mysql = False
        self.sqlite_path = os.path.join(os.path.dirname(__file__), 'cooling_optimizer.db')
        self._init_connection()

    @classmethod
    def get_instance(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = cls()
        return cls._instance

    def _init_connection(self):
        if MYSQL_AVAILABLE and Config.DB_PASSWORD:
            try:
                conn = mysql.connector.connect(
                    host=Config.DB_HOST,
                    port=Config.DB_PORT,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    database=Config.DB_NAME,
                    connect_timeout=2
                )
                if conn.is_connected():
                    self.use_mysql = True
                    conn.close()
                    print("[DB] Connected to MySQL successfully.")
                    self._init_mysql_schema()
                    return
            except Exception as e:
                print(f"[DB Notice] MySQL connection failed ({e}). Using local SQLite database.")
        
        self.use_mysql = False
        print(f"[DB] Initializing local SQLite database at {self.sqlite_path}")
        self._init_sqlite_schema()

    def _get_connection(self):
        if self.use_mysql:
            return mysql.connector.connect(
                host=Config.DB_HOST,
                port=Config.DB_PORT,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                database=Config.DB_NAME
            )
        else:
            conn = sqlite3.connect(self.sqlite_path, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            return conn

    def _init_sqlite_schema(self):
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.executescript("""
        CREATE TABLE IF NOT EXISTS server_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            server_id TEXT NOT NULL,
            cpu_usage REAL NOT NULL,
            gpu_usage REAL NOT NULL,
            memory_usage REAL NOT NULL,
            server_load REAL NOT NULL,
            gpu_temperature REAL NOT NULL,
            server_temperature REAL NOT NULL,
            ambient_temperature REAL NOT NULL,
            humidity REAL NOT NULL,
            power_consumption REAL NOT NULL,
            cooling_level REAL NOT NULL,
            water_availability REAL NOT NULL,
            water_consumption REAL NOT NULL,
            outside_temperature REAL NOT NULL,
            cooling_efficiency REAL NOT NULL,
            dielectric_temperature REAL NOT NULL,
            dielectric_efficiency REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            server_id TEXT NOT NULL,
            predicted_temperature REAL NOT NULL,
            predicted_workload REAL NOT NULL,
            predicted_cooling_demand REAL NOT NULL,
            prediction_horizon_minutes INTEGER NOT NULL,
            confidence_score REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            server_id TEXT NOT NULL,
            current_cooling_mode TEXT NOT NULL,
            recommended_cooling_mode TEXT NOT NULL,
            current_cooling_level REAL NOT NULL,
            recommended_cooling_level REAL NOT NULL,
            thermal_risk TEXT NOT NULL,
            recommendation_text TEXT NOT NULL,
            reason TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cooling_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            thermal_effectiveness REAL NOT NULL,
            water_consumption_factor REAL NOT NULL,
            energy_consumption_factor REAL NOT NULL,
            min_operating_temp REAL NOT NULL,
            max_operating_temp REAL NOT NULL,
            suitability_description TEXT NOT NULL,
            is_active INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS water_savings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            baseline_water_consumption REAL NOT NULL,
            optimized_water_consumption REAL NOT NULL,
            water_saved REAL NOT NULL,
            saving_percentage REAL NOT NULL,
            water_stress_score REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS energy_savings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            baseline_energy_consumption REAL NOT NULL,
            optimized_energy_consumption REAL NOT NULL,
            energy_saved REAL NOT NULL,
            saving_percentage REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            server_id TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            message TEXT NOT NULL,
            is_active INTEGER DEFAULT 1
        );
        """)
        
        cur.execute("SELECT COUNT(*) FROM cooling_profiles")
        if cur.fetchone()[0] == 0:
            for p_id, p in Config.COOLING_PROFILES.items():
                cur.execute("""
                INSERT INTO cooling_profiles 
                (name, display_name, thermal_effectiveness, water_consumption_factor, energy_consumption_factor, min_operating_temp, max_operating_temp, suitability_description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (p['id'], p['display_name'], p['thermal_effectiveness'], p['water_consumption_factor'], p['energy_consumption_factor'], p['min_operating_temp'], p['max_operating_temp'], p['suitability_description']))
        
        conn.commit()
        conn.close()

    def _init_mysql_schema(self):
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            schema_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'schema.sql')
            if os.path.exists(schema_file):
                with open(schema_file, 'r', encoding='utf-8') as f:
                    statements = f.read().split(';')
                    for stmt in statements:
                        if stmt.strip():
                            cur.execute(stmt)
                conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            print(f"[DB Notice] MySQL schema init error: {e}")

    def execute_insert(self, table, data):
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            columns = list(data.keys())
            ph = '%s' if self.use_mysql else '?'
            placeholders = ', '.join([ph for _ in columns])
            col_names = ', '.join(columns)
            sql = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
            values = tuple(data[col] for col in columns)
            cur.execute(sql, values)
            conn.commit()
            last_id = cur.lastrowid
            cur.close()
            return last_id
        finally:
            conn.close()

    def get_recent_metrics(self, limit=20, server_id=None):
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            ph = '%s' if self.use_mysql else '?'
            sql = "SELECT * FROM server_metrics"
            params = []
            if server_id:
                sql += f" WHERE server_id = {ph}"
                params.append(server_id)
            sql += f" ORDER BY id DESC LIMIT {ph}"
            params.append(limit)
            
            cur.execute(sql, tuple(params))
            if self.use_mysql:
                cols = [desc[0] for desc in cur.description]
                rows = [dict(zip(cols, row)) for row in cur.fetchall()]
            else:
                rows = [dict(row) for row in cur.fetchall()]
            cur.close()
            return rows
        finally:
            conn.close()

    def get_latest_metric(self, server_id=None):
        metrics = self.get_recent_metrics(limit=1, server_id=server_id)
        return metrics[0] if metrics else None

    def get_recent_alerts(self, limit=10):
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            ph = '%s' if self.use_mysql else '?'
            sql = f"SELECT * FROM alerts ORDER BY id DESC LIMIT {ph}"
            cur.execute(sql, (limit,))
            if self.use_mysql:
                cols = [desc[0] for desc in cur.description]
                rows = [dict(zip(cols, row)) for row in cur.fetchall()]
            else:
                rows = [dict(row) for row in cur.fetchall()]
            cur.close()
            return rows
        finally:
            conn.close()

    def get_cooling_profiles(self):
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM cooling_profiles WHERE is_active = 1")
            if self.use_mysql:
                cols = [desc[0] for desc in cur.description]
                rows = [dict(zip(cols, row)) for row in cur.fetchall()]
            else:
                rows = [dict(row) for row in cur.fetchall()]
            cur.close()
            return rows
        finally:
            conn.close()

db = Database.get_instance()
