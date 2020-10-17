import os

class Config(object):
	SECRET_KEY = 'g]fQU<XfE:5"%QkV'
	DEBUG = False
	TESTING = False
	MAIL_SERVER = 'smtp.googlemail.com'
	MAIL_PORT = 465
	MAIL_USE_TLS = False
	MAIL_USE_SSL = True
	MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
	MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")


class ProductionConfig(Config):
	pass

class DevelopmentConfig(Config):
	DEBUG = True

class TestingConfig(Config):
	TESTING = True
