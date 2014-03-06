var chai, root;

root = typeof exports !== "undefined" && exports !== null ? exports : window;

if (Object.prototype.defineProperty) {
  chai = require('chaijs-chai');
  root.should = chai.should();
}
