# TODO think if require jquery and jquery inview in this place is actualy a good idead
# TODO use requirejs alias / packing modules definition for this
define 'ende', ['config/load_components', 'config/initializers', 'jquery.ujs', 'es6-shim'], ->

  # TODO FIX THIS!
  require.register('observable', (r, e, module) -> module.exports = require("indefinido-observable").mixin)
  require.register('advisable' , (r, e, module) -> module.exports = require("indefinido-advisable").mixin )

# TODO rename ened to ende, move shims to an extension
define 'es5-shim'     , ['config/load_components'], -> require "ened/vendor/assets/javascripts/polyfills/es5-shim.js"
define 'es6-map-shim' , ['es5-shim'  , 'config/load_components'], ->
  require "indefinido-observable/vendor/shims/object.create.js"

  # TODO improve map shimming
  if (!Object.defineProperties)
    undefine = true
    Object.defineProperties = (object, properties) ->
      for name, descriptor of properties
        object[name] = descriptor.value

      object

  require "ened/vendor/assets/javascripts/polyfills/es6-map-shim.js"

  delete Object.defineProperties if undefine

define 'es6-shim'     , ['es6-map-shim', 'es5-shim'  , 'config/load_components'], ->
  # Fix wrong object order definition in internet explorer
  # TODO send a pull request to use dependency only after object definition
  require "paulmillr-es6-shim"

  # TODO only load relevante polyfills for getter and setters
  require "indefinido-observable"


# Override defaults components definition, and force observable
# loading after es6-shim, so it does not define collectionShims
#
# TODO better way to forward component modules to application
define 'observable'    , ['es6-shim', 'config/load_components'], -> require("indefinido-observable").mixin
define 'advisable'     , ['config/load_components'], -> require("indefinido-advisable").mixin