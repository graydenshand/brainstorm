#!/bin/env python
from app import create_app
import os
from app.config import DevelopmentConfig, ProductionConfig

# print(f"REDIS --- {os.environ.get("REDIS_URL")}")

if os.environ.get("ENVIRONMENT") == "DEV":
	app = create_app(debug=True, config=DevelopmentConfig)
else:
	app = create_app(config=ProductionConfig)

if __name__ =='__main__':
	app.run(host='0.0.0.0')
