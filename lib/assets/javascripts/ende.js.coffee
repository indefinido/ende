# TODO think if require jquery and jquery inview in this place is actualy a good idead

# TODO use requirejs alias / packing modules definition for this
define 'ende', ['config/load_components', 'config/initializers', 'jquery.ujs'], ->

  # Override defaults components definition
  # TODO better way to forward component modules to application
  define 'observable'   , [], -> require("indefinido-observable").mixin
  define 'advisable'    , [], -> require("indefinido-advisable").mixin

  # TODO FIX THIS!
  require.register('observable', (r, e, module) -> module.exports = require("indefinido-observable").mixin)
  require.register('advisable' , (r, e, module) -> module.exports = require("indefinido-advisable").mixin )

  # TODO rename ened to ende, move shims to an extension
  define 'es5-shim'     , [], -> require "ened/vendor/assets/javascripts/polyfills/es5-shim.js"
  define 'es6-map-shim' , [], -> require "ened/vendor/assets/javascripts/polyfills/es6-map-shim.js"
  define 'es6-shim'     , [], -> require "paulmillr-es6-shim"

