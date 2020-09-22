import os

class Config(object):
	SECRET_KEY = 'g]fQU<XfE:5"%QkV'
	DEBUG = False
	TESTING = False
    
class ProductionConfig(Config):
	pass

class DevelopmentConfig(Config):
	DEBUG = True

class TestingConfig(Config):
	TESTING = True
