FROM python

WORKDIR /home/app
# WORKDIR /home # for gunicorn
# INSTALL PACKAGES

RUN python3 -m pip install flask flask-restful flask-mail flask-cors redis gunicorn rq rq-scheduler  marshmallow eventlet flask-socketio

COPY ./ /home/app

# CMD ["gunicorn", "-b", "0.0.0.0:8000", "--access-logfile", "-", "app.run_web:app"]
CMD ["python", "main.py"]
