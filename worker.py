import os

import redis
from rq import Worker, Queue, Connection
from app import create_app

listen = ['low','default','high']

redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')

conn = redis.from_url(redis_url)

app = create_app()
app.app_context().push()

if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        worker.work()
