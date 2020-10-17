from app.models.session import Session

if __name__ == "__main__":
    # Unit tests
    try:
        session = Session()
        testTitle = "hello world!"
        session.title= testTitle
        session.duration = 20
        session.create()
        session_id = session.id
        session = session.get(session_id)
        assert session.id == session_id
        assert session.title == testTitle
        session.title = testTitle + "1234"
        session.update()
        session = session.get(session_id)
        assert session.title == testTitle + "1234"
        session.addEmail('graydenshand@gmail.com')
        session.addPost('Testing testing 123')
        session = session.get(session_id)
        assert (len(session.emails) > 0 and len(session.posts) > 0)
    finally:
        session.delete()
        session = session.get(session_id)
        assert session is None
        print('Ok')
