# TODO move shims to an extension
define 'es5-shim'     , ['config/load_components'], -> require "ende/vendor/assets/javascripts/polyfills/es5-shim.js"
define 'es6-map-shim' , ['es5-shim'  , 'config/load_components'], ->
  # TODO use a better require
  require "indefinido~observable@es6-modules/vendor/shims/object.create.js"


  # TODO improve map shimming
  if (!Object.defineProperties)
    undefine = true
    Object.defineProperties = (object, properties) ->
      for name, descriptor of properties
        object[name] = descriptor.value

      object

  require "ende/vendor/assets/javascripts/polyfills/es6-map-shim.js"

  delete Object.defineProperties if undefine

# TODO extract this es6-shim to a component
define 'es6-shim'     , ['es6-map-shim', 'es5-shim'  , 'config/load_components'], ->
  # Fix wrong object order definition in internet explorer
  # TODO send a pull request to use dependency only after object definition
  require "paulmillr~es6-shim@0.14.0"

  require "indefinido~observable@es6-modules"

# Override defaults components definition, and force observable
# loading after es6-shim, so it does not define collectionShims
#
# TODO better way to forward component modules to application
define 'observable'    , ['es6-shim', 'config/load_components'], -> require("indefinido~observable@es6-modules").mixin
define 'advisable'     , ['config/load_components'], -> require("indefinido~advisable@master").mixin

# TODO think if require jquery and jquery inview in this place is actualy a good idea
# TODO use requirejs alias / packing modules definition for this
define 'ende', ['config/load_components', 'config/initializers', 'es6-shim'], ->
  require ['jquery.ujs']

  # TODO FIX THIS!
  require.register('observable', (e, module) -> module.exports = require "indefinido~observable@es6-modules"  )
  require.register('advisable' , (e, module) -> module.exports = require("indefinido~advisable@master").mixin )

