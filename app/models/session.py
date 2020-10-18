from app import redis, scheduler, queue
from datetime import datetime, timedelta
from uuid import uuid4
from marshmallow import Schema, fields
import app.email as email

class Session:
    """
    ADT for Brainstorming Sessions

    All data is stored in redis

    Attributes
        * requiredFields: array of required fields
        * id: unique id for the session
        * title: title of the session
        * description: description of the session
        * created_at: timestamp when the session was created
        * duration: length of session in seconds
        * emails: set of emails subscribed to session
        * posts: list of posts generated during the session
        * ip_addresses: set of ip addresses that visited the session

    Methods
        * get()
        * create()
        * update()
        * delete()
        * addEmail()
        * addPost()
        * addIPAddress()
        * endTime()
        * timeToEnd()
        * isEnded()
        * fromDict()
        * toDict()
    """
    requiredFields = ['title', 'duration']
    def __init__(self, **kwargs):
        # defaults
        self._data = {
            "id": None,
            "title": '',
            "description": '',
            "created_at": '',
            "duration": 0,
            "emails": set(),
            "posts": [],
            "ip_addresses": set()
        }

        # overrides
        for k,v in kwargs.items():
            if k in self._data.keys():
                setattr(self, k, v)
            else:
                raise AttributeError(f"Invalid field name '{k}'")

    def __repr__(self):
        if self.title != '':
            return f"Session(id='{self.id}', title='{self.title}')"
        else:
            return "Session()"

    # Members
    @property
    def id(self):
        return self._data['id']

    @property
    def title(self):
        return self._data['title']
    @title.setter
    def title(self, title):
        self._data['title'] = title

    @property
    def description(self):
        return self._data['description']
    @description.setter
    def description(self, description):
        self._data['description'] = description

    @property
    def created_at(self):
        return self._data['created_at']

    @property
    def duration(self):
        return self._data['duration']
    @duration.setter
    def duration(self, duration):
        if self.duration != 0:
            raise AttributeError('duration is already set')
        self._data['duration'] = int(duration)

    @property
    def emails(self):
        return self._data['emails']

    @property
    def posts(self):
        return self._data['posts']

    @property
    def ip_addresses(self):
        return self._data['ip_addresses']


    # Methods
    def fromDict(self, dict):
        """
        Construct a Session object from a full dictionary

        """
        if any([key not in dict.keys() for key in self._data.keys()]):
            raise ValueError(f"Input dictionary is missing keys, all fields required: {self._data.keys()}")
        if any([key not in self._data.keys() for key in dict.keys()]):
            raise ValueError(f"Unrecognized key in input, allowed keys: {self.fields()}")
        session = Session()
        session._data['id'] = dict.pop('id')
        session._data['created_at'] = float(dict.pop('created_at'))
        session._data['emails'] = set(dict.pop('emails'))
        session._data['posts'] = dict.pop('posts')
        session._data['ip_addresses'] = set(dict.pop('ip_addresses'))
        for k, v in dict.items():
            if k in self._data.keys():
                setattr(session, k, v)
        self._data = session._data
        return self

    def toDict(self):
        return self._data

    def endTime(self):
        # Session end time as datetime object
        return datetime.fromtimestamp(self.created_at) + timedelta(seconds=self.duration)

    def timeToEnd(self):
        # return seconds to end
        return self.endTime() - datetime.now()

    def isEnded(self):
        # return true if session is already ended
        return datetime.now() > self.endTime()

    def fields(self):
        return [key for key in self._data.keys()]

    def create(self):
        """
        Create a new session
        """
        # Generate a unique id
        self._data['id'] = str(uuid4())

        # Set created_at to now
        self._data['created_at'] = datetime.now().timestamp()

        # Save session settings
        redis.hset(f"session::{self.id}", mapping={
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at,
            "duration": self.duration
        })

        # Set ttl of session settings (expire this redis key 500 seconds after the session ends)
        redis.expire(f'session::{self.id}', self.timeToEnd().seconds + (500))

        # enqueue a job to close the session at the session end time
        scheduler.enqueue_in(timedelta(seconds=self.duration), closeSession, self.id)

        print(f"Session created: {self.id}")

    def update(self):
        """
        Update a session's settings
        """
        if self.isEnded():
            raise Exception('This session has ended.')
        return redis.hset(f"session::{self.id}", mapping={
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at,
            "duration": self.duration
        })

    def get(self, id):
        """
        Get a session by id from redis, populate data members or return None if not found
        """
        sessionSettings = redis.hgetall(f"session::{id}")
        if len(sessionSettings) == 0:
            return None
        tmp = {"id": id}
        for k,v in sessionSettings.items():
            tmp[k.decode('utf-8')] = v.decode('utf-8')

        emailList = redis.smembers(f"session::{id}::emails")
        tmp['emails'] = {email.decode('utf-8') for email in emailList}

        ipAddressList = redis.smembers(f"session::{id}::ip_addresses")
        tmp['ip_addresses'] = {ip.decode('utf-8') for ip in ipAddressList}

        postList = redis.lrange(f"session::{id}::posts", 0, -1)
        tmp['posts'] = [post.decode('utf-8') for post in postList]

        self.fromDict(tmp)
        return self


    def delete(self):
        """
        Delete a session (does not send final results)
        """
        # Delete all data associated with this session
        redis.delete(f'session::{self.id}::emails')
        redis.delete(f'session::{self.id}::posts')
        redis.delete(f'session::{self.id}::ip_addresses')
        redis.delete(f'session::{self.id}')
        self.__init__()
        print("Session deleted")

    def close(self):
        """
        Send final results and delete the session
        """
        print(f"Closing session {self.id}")
        # Save aggregate stats about the session
        redis.rpush('session::stats::duration', self.duration)
        redis.rpush('session::stats::emails', len(self.emails))
        redis.rpush('session::stats::posts', len(self.posts))
        redis.rpush('session::stats::ip_addresses', len(self.ip_addresses))
        redis.rpush('session::stats::created_at', self.created_at)

        # Email the results of the session
        self.email_results()

        # Delete the session
        self.delete()

    def addEmail(self, email):
        """
        Add email to email list, emails on this list will be sent a message with the final results
        """
        # Don't allow modifications to data after the session has ended
        if self.isEnded():
            raise Exception('This session has ended.')

        # Force emails to lowercase
        email = email.lower()

        # Add email address to this session's email set
        self._data['emails'].add(email)

        # Save to redis
        keyExists = True
        if redis.exists(f'session::{self.id}::emails') == 0:
            keyExists = False
        redis.sadd(f'session::{self.id}::emails', email)
        ## set ttl on the key if it was just created
        if not keyExists:
            redis.expire(f'session::{self.id}::emails', self.timeToEnd().seconds + (500))

    def addPost(self, post):
        """
        Add a post to the post list
        """
        if self.isEnded():
            raise Exception('This session has ended.')
        self._data['posts'].append(post)
        keyExists = True
        if redis.exists(f'session::{self.id}::posts') == 0:
            keyExists = False
        redis.lpush(f'session::{self.id}::posts', post)
        if not keyExists:
            redis.expire(f'session::{self.id}::posts', self.timeToEnd().seconds + (500))

    def addIPAddress(self, ip_address):
        """
        Add an IP address to the IP address list
        """
        self._data['ip_addresses'].add(ip_address)
        keyExists = True
        if redis.exists(f'session::{self.id}::ip_addresses') == 0:
            keyExists = False
        redis.sadd(f'session::{self.id}::ip_addresses', ip_address)
        if not keyExists:
            redis.expire(f'session::{self.id}::ip_addresses', self.timeToEnd().seconds + (500))

    def email_results(self):
        """
        Send the final results to all registered email addresses
        """
        email.send_results(self.toDict())


def closeSession(session_id):
    """
    Close a session with this id

    This function is defined outside of the scope of the Session class in order to pass it to redis queue
    """
    session = Session().get(session_id)
    if session is not None:
        session.close()

class SessionSchema(Schema):
    id = fields.Str()
    title = fields.Str(required=True)
    description = fields.Str()
    created_at = fields.Float()
    duration = fields.Integer(required=True)
    emails = fields.List(fields.Str())
    posts = fields.List(fields.Str())
    ip_addresses = fields.List(fields.Str())
