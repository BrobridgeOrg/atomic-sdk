
module.exports = class Context {

  constructor() {
    this.nodesByModule = {};
  }

  registerNodeOnModule(node, module) {
    if (!this.nodesByModule[module]) {
      this.nodesByModule[module] = [];
    }
    this.nodesByModule[module].push(node);
  }

  getNodesByModule(module) {
    return this.nodesByModule[module] || [];
  }

  releaseNode(node) {

    for (const module in this.nodesByModule) {
      const index = this.nodesByModule[module].indexOf(node);
      if (index !== -1) {
        this.nodesByModule[module].splice(index, 1);
        break;
      }
    }
  }
};
