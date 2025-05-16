const Atomic = require('./atomic');
const { SessionManager } = require('./session_manager');

module.exports = {
  registerAtomicComponent(node) {
    node.atomic = new Atomic;
  },
  enableSessionManager(node) {
    let sm = new SessionManager(node);
    node.atomic.registerModule('SessionManager', sm);
  }
};
