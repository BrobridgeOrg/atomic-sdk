const Atomic = require('./atomic');
const { SessionManager } = require('./session_manager');
const Context = require('./context');

let ctx = new Context();

module.exports = {
  getContext() {
    return ctx;
  },
  registerAtomicComponent(node) {
    node.atomic = new Atomic;
  },
  enableSessionManager(node) {
    let sm = new SessionManager(node);
    node.atomic.registerModule('SessionManager', sm);

    ctx.registerNodeOnModule(node, 'SessionManager');
  },
  releaseNode(node) {
    return ctx.releaseNode(node);
  },
};
