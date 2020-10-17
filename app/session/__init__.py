from flask import Blueprint, current_app
from flask_restful import Api


session = Blueprint('auth', __name__)
api = Api(session)


from .resources import Sessions, Posts, Emails
api.add_resource(Sessions, '/', '/<string:session_id>')
api.add_resource(Posts, '/<string:session_id>/post')
api.add_resource(Emails, '/<string:session_id>/email')

from .events import *
