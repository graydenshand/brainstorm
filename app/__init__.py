from flask import Flask
from flask_restful import Api
from .config import ProductionConfig
from redis import Redis
from rq import Queue
from rq_scheduler import Scheduler
import os
from flask_mail import Mail
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sslify import SSLify

# Initialize services
redis = Redis().from_url(os.environ.get("REDIS_URL"))
api = Api()
queue = Queue(connection=redis)
scheduler = Scheduler(connection=redis)
mail = Mail()
cors = CORS()
socketio = SocketIO(cors_allowed_origins="*")


def create_app(debug=False, config=ProductionConfig):
	app = Flask(__name__, static_folder="client/app/build/static")
	with app.app_context():
		# Load app config
		app.config.from_object(config)

		# Mount flask-extensions to application
		api.init_app(app)
		mail.init_app(app)
		cors.init_app(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})
		socketio.init_app(app)
		sslify = SSLify(app)

		# Register Blueprints
		from .session import session as session_blueprint
		app.register_blueprint(session_blueprint)

		from .client import client as client_blueprint
		app.register_blueprint(client_blueprint)


		# Set up shell context
		from .models.session import Session
		import app.email as email
		@app.shell_context_processor
		def make_shell_context():
			return {
				"Session": Session,
				"scheduler": scheduler,
				"email": email
			}



	return app
