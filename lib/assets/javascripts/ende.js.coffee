# TODO think if require jquery and jquery inview in this place is actualy a good idead

# TODO use requirejs alias / packing modules definition for this
define 'ende', ['config/load_components', 'config/initializers'], ->

  # Override defaults components definition
  # TODO better way to forward component modules to application
  define 'observable', [], -> require("indefinido-observable").mixin
  define 'advisable' , [], -> require("indefinido-advisable").mixin

  # TODO FIX THIS!
  require.register('observable', (r, e, module) -> module.exports = require("indefinido-observable").mixin)
  require.register('advisable' , (r, e, module) -> module.exports = require("indefinido-advisable").mixin )
