const events = require('events');

class SessionManager {

  constructor(node) {
    this.node = node;
    this.sessionCounter = 0;
    this.sessions = {};

    node.next = this.resumeSession.bind(this);
    node.close = this.closeSession.bind(this);
    node.getSession = this.getSession.bind(this);
  }

  createSession() {
    let session = new Session(this.node.id + '-' + Date.now() + '-' + ++this.sessionCounter);
    this.sessions[session.id] = session;

    session.once('close', () => {
      delete this.sessions[session.id];
    });

    return session;
  }

  getSession(sessionId) {
    return this.sessions[sessionId];
  }

  closeSession(sessionId) {
    let session = this.sessions[sessionId];
    if (!session) {
      return new Error('Session not found:', sessionId);
    }

    session.close();

    return null;
  }

  resumeSession(sessionId) {
    let session = this.sessions[sessionId];
    if (!session) {
      return new Error('Session not found:', sessionId);
    }

    session.resume();

    return null;
  }
}

class Session extends events.EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.isClosed = false;
    this.resumeCounter = 0;
  }

  resume() {
    this.resumeCounter++;
    this.emit('resume');
  }

  close() {
    this.isClosed = true;
    this.emit('close');
  }

  bindMessage(msg) {

    if (msg.sessions instanceof Array) {
      msg.sessions.push(this.id);
    } else {
      msg.sessions = [ this.id ];
    }

    return msg;
  }

  unbindMessage(msg) {
    if (msg.sessions instanceof Array) {
      msg.sessions = msg.sessions.filter(id => id !== this.id);
    }
    return msg;
  }
}

module.exports = {
  SessionManager: SessionManager,
  Session: Session
}
