#!/bin/env python
from app import create_app, socketio
import os
from app.config import DevelopmentConfig, ProductionConfig

if os.environ.get("ENVIRONMENT") == "DEV":
	app = create_app(debug=True, config=DevelopmentConfig)
else:
	app = create_app(config=ProductionConfig)

if __name__ =='__main__':
	debug = os.environ.get('FLASK_DEBUG', 0) == "1"
	socketio.run(app, host='0.0.0.0', port=os.environ.get('PORT', 5000), debug=debug)
