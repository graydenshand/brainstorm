from flask import Blueprint, request, session, redirect

client = Blueprint('client', __name__, static_folder='./app/build', template_folder='./app/build')

from .routes import *
