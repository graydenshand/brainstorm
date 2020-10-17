

def closeSession(session):
    """
    Close a session with this id

    This function is defined outside of the scope of the Session class in order to pass it to redis queue
    """
    session.close()
