FROM python

WORKDIR /home/app
# WORKDIR /home # for gunicorn
# INSTALL PACKAGES

RUN python3 -m pip install flask flask-restful redis gunicorn rq rq-scheduler flask-mail marshmallow

COPY ./app /home/app

# CMD ["gunicorn", "-b", "0.0.0.0:8000", "--access-logfile", "-", "app.run_web:app"]
CMD ["flask", "run", "--host=0.0.0.0"]
