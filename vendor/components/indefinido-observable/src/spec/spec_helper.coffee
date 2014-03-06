root = exports ? window

if Object.prototype.defineProperty
  chai = require 'chaijs-chai'
  root.should = chai.should()