from flask_mail import Message
from flask import render_template
from app import mail

sender = ("Timed Brainstorm", "hello@timedbrainstorm.com")

def build_message(subject, sender, recipients, text_body, html_body):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    return msg

def send_test_message():
    msg = build_message('test', sender, ['shandgp@clarkson.edu'], 'test', "<p>test</p>")
    mail.send(msg)

def send_results(session):
    # for each email, send session data
    with mail.connect() as conn:
        for email in session['emails']:
            print(f"Sending results to {email}")
            html = render_template('results.html', session=session)
            text = f'Your brainstorm results are in.\n'
            text += f"{session['title']}\n {session['description']}"
            text += '----\n'.join([post for post in session['posts']])
            text += 'Thanks for using Timed Brainstorm!'
            subject = "Your brainstorm results"
            msg = build_message(subject, sender, [email], text, html)
            conn.send(msg)
