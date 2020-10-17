from flask_socketio import emit, send, join_room, leave_room
from app import socketio
from app.models.session import Session

@socketio.on('join')
def handle_join(data):
    room = data.get("session_id")
    print(f"Join Room: {room}")
    join_room(room)
    send("User has entered the room")

@socketio.on('message')
def handle_message(msg):
    print(msg)

@socketio.on('post')
def handle_post(data):
    post = data['post']
    session_id = data['session_id']
    # save post
    session = Session().get(session_id)
    if session is not None:
        session.addPost(post)
    # broadcast post to other users in session
    emit("post", post, room=session_id)

@socketio.on('leave')
def handle_leave(data):
    room = data['session_id']
    leave_room(room)
    send("User has left the room")
