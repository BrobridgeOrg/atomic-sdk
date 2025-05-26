const Atomic = require('./atomic');
const { SessionManager } = require('./session_manager');
const Context = require('./context');

let ctx = global.atomicContext;
if (!ctx) {
  ctx = new Context();
  global.atomicContext = ctx;
}

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
