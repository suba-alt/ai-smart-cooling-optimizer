import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.api import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(api_bp)

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "name": "AI-Based Water-Efficient Cooling Optimization API",
            "prototype": "SIH Smart Cooling Optimizer",
            "version": "2.0.0",
            "status": "RUNNING",
            "horizon": f"{Config.PREDICTION_HORIZON_MINUTES} minutes",
            "disclaimer": "Software-only prototype using simulated data-center telemetry."
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "Endpoint not found", "code": 404}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"status": "error", "message": "Internal server error", "code": 500}), 500

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"status": "error", "message": "Bad request", "code": 400}), 400

    return app

app = create_app()

if __name__ == "__main__":
    print(f"Starting AI Smart Cooling Optimizer Backend on http://localhost:{Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
