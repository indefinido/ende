root = exports ? this

# Prevent aura from defining jquery erroniously
define 'jquery'    , ['config/load_components'], -> require 'component-jquery'
# TODO define 'underscore', ['config/load_components'], -> require 'lodash'

# TODO figure out how to use rjs optmizer to include component builds
# Use call method to avoid optmization at all
define 'ende_components', ['ende_build'], {}
define 'application_components', ['ende_components', 'build'], {}

requirejs.config
  shim:
    build:
      # FIXME check that the build was loaded in a more elegant way
      # probably create a undefined plug-in for component builder
      exports: 'require.modules.seminovos/vendor/loaded'
      deps: ['ende_build']
    ende_build:
      exports: 'require.register'

# In order to start, application and ende components must be loaded
define 'config/load_components', ['application_components'], ->

  # TODO remove and use r.js optmizer wrapShim option, when
  # optimizer gets updated
  define 'jquery.inview'                  , ['jquery'], ->
    require 'ened/vendor/assets/javascripts/jquery/inview.js'

  define 'jquery.mask'                    , ['jquery'], ->
    inner_lazy_require = 'ened/vendor/assets/javascripts/jquery/inputmask.js'
    require inner_lazy_require

  define 'jquery.mask_extensions'         , ['jquery'], ->
    inner_lazy_require = 'ened/vendor/assets/javascripts/jquery/inputmask.extensions.js'
    require inner_lazy_require

  define 'jquery.mask_numeric_extensions' , ['jquery'], ->
    inner_lazy_require = 'ened/vendor/assets/javascripts/jquery/inputmask.numeric.extensions.js'
    require inner_lazy_require

  # Object.defineProperty window, 'jQuery',
  #   get: -> require 'component-jquery'
  #   set: -> debugger

  # This may be included in build, and loaded before aurajs requires for them
  # TODO also preload eventemitter2
  # TODO also preload require-jstext

  # Little object class to merge component require and requirejs require
  loader =
    shim: ->
      # Store loaders functions
      loader.loaders.component = require
      loader.loaders.requirejs = requirejs
      loader.activate.define   = root.define

      # Expand require fuction with requirejs configurations
      # so we can require without great problems
      loader.require.config  = requirejs.config
      loader.require.s       = requirejs.s

    initialize: ->
      with_component = 'segmentio-extend'
      extend = require with_component
      extend loader.require, require

      # Override global require for ower one
      root.require = loader.require
      root.loader = loader

    # Resource loaders compatibility
    loaders:
      requirejs : null
      component : null
      discovered: null

    discover: (params...) ->

      if params[0] instanceof Array
        requirer = 'requirejs'
      else
        requirer = 'component'

      @activate (requirer) and requirer

    activate: (requirer) ->
      switch requirer
        when 'component'
          root.define = null
        when 'requirejs'
          root.define = @activate.define
        else
          false

      @loaders.discovered = @loaders[requirer]

      true

    require: (params...) ->
      using = loader.discover params...

      try

        module = loader.loaders.discovered.apply @, params

      catch e
        console.warn 'Failed to load \'', params[0], "' with #{using}: Error: '", e.message, '\'. Trying with requirejs.'
        loader.activate 'requirejs'
        module = loader.loaders.discovered.apply @, params unless module

      # Always let requirjs active by default
      loader.activate 'requirejs'

      module

  loader.shim()
  loader.initialize()