from flask_restful import Resource
from flask import request
from app.models.session import Session, SessionSchema
import json

class Sessions(Resource):

    def get(self, session_id):
        session = Session().get(session_id)
        if session is None:
            return {'error': 'Not found'}, 404
        else:
            # log IP address of all visitors to get an appx. count of unique users in each session
            session.addIPAddress(request.remote_addr)
            schema = SessionSchema(only=['id', 'title', 'description', 'created_at', 'duration', 'posts'])
            return schema.dump(session), 200

    def post(self):
        data = request.get_json()
        session = Session()
        if any([key not in data for key in Session.requiredFields]):
            return {'error': f'Missing required fields. Request must include: {Session.requiredFields}'}, 400
        if any([key not in session.fields() for key in data.keys()]):
            return {'error': f"Unrecognized key, allowed keys: {session.fields()}"}
        else:
            session = Session(**data)
            session.create()

            return {'session_id': session.id}, 201
            

    def put(self, session_id):
        session = Session().get(session_id)
        if session is None:
            return {'error': 'Not found'}, 404
        else:
            data = request.get_json()
            if any([key not in session.fields() for key in data.keys()]):
                return {'error': f"Unrecognized key, allowed keys: {session.fields()}"}
            for k, v in data.items():
                try:
                    setattr(session, k, v)
                except Exception:
                    return {'error': f'Cannot update field: {k}'}, 400
            session.update()
            schema = SessionSchema(only=['id', 'title', 'description', 'created_at', 'duration', 'posts'])
            return schema.dump(session), 200

    def delete(self, session_id):
        session = Session().get(session_id)
        if session is None:
            return {'error': 'Not found'}, 404
        else:
            session.delete()
            return '', 204


class Posts(Resource):
    def post(self, session_id):
        session = Session().get(session_id)
        if session is None:
            return {'error': 'Not found'}, 404
        else:
            post = request.data
            session.addPost(post)
            return 'Ok', 201


class Emails(Resource):
    def post(self, session_id):
        session = Session().get(session_id)
        if session is None:
            return {'error': 'Not found'}, 404
        else:
            email = request.data
            session.addEmail(email)
            return 'Ok', 201
