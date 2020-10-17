from . import client
from flask import render_template, send_from_directory, session
import os

@client.route('/', defaults={'path': ''})
@client.route('/<path:path>')
def catch_all(path):
	if path and path != "" and os.path.exists(client.static_folder + '/' + path):
		return send_from_directory(client.static_folder, path)
	return render_template("index.html")
