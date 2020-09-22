from flask import Flask
from flask_restful import Api
from .config import ProductionConfig
from redis import Redis
from rq import Queue
from rq_scheduler import Scheduler
import os
from flask_mail import Mail

redis = Redis().from_url(os.environ.get("REDIS_URL"))
api = Api()
queue = Queue(connection=redis)
scheduler = Scheduler(connection=redis)
mail = Mail()


def create_app(debug=False, config=ProductionConfig):
	app = Flask(__name__, static_folder="client/app/build/static")
	with app.app_context():
		# Load app config
		app.config.from_object(config)

		api.init_app(app)
		mail.init_app(app)

		from .session import session as session_blueprint
		app.register_blueprint(session_blueprint)


		from .models.session import Session
		@app.shell_context_processor
		def make_shell_context():
			return {
				"Session": Session,
				"scheduler": scheduler,
			}

	return app
