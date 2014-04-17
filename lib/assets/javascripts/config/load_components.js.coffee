root = exports ? this

requirejs.config
  shim:
    'jquery.ujs':
      deps: ['jquery', 'config/load_components']
      exports: 'jQuery.rails'

    build:
      # FIXME check that the build was loaded in a more elegant way
      # probably create a undefined plug-in for component builder
      exports: 'require.modules.seminovos/vendor/loaded'
      deps: ['ende_build']

    ende_build:
      exports: 'require.register'

  paths:
    'jquery.ujs': 'jquery_ujs'

# Prevent aura from defining jquery erroniously
define 'jquery'    , ['config/load_components'], ->
  window.jQuery = window.$ = require 'component-jquery'

define 'modernizr' , ['config/load_components'], ->
  require 'modernizr'
  window.Modernizr

define 'rivets', ['config/load_components'], -> require 'rivets'

# TODO define 'underscore', ['config/load_components'], -> require 'lodash'

# TODO figure out how to use rjs optmizer to include component builds
# Use call method to avoid optmization at all
define 'ende_components', ['ende_build'], {}
define 'application_components', ['ende_components', 'build'], {}

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
      component = require

      # Store loaders functions
      loader.loaders.component = component
      loader.loaders.requirejs = requirejs
      loader.activate.define   = root.define

      # Expand require fuction with requirejs configurations
      # so we can require without great problems
      aliases = ['config', 's']
      loader.require[alias] = requirejs[alias] for alias in aliases

      aliases = ['aliases', 'modules', 'alias', 'normalize', 'resolve', 'relative', 'register']
      loader.require[alias] = component[alias] for alias in aliases


    initialize: ->
      # Override global require for ouer one
      root.require = loader.require

      # TODO remove global loader and use requirejs instead
      root.loader  = @

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

      @activate requirer

      requirer

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
        # TODO rename mod to module
        mod = loader.loaders.discovered.apply @, params

      catch e
        if e.require
          # TODO better loggin support
          if app.debug
            (app?.logger || console).warn "loader: Failed to load '#{params[0]}' with #{using}: \n Exception: '#{e.message}'. Trying with requirejs."

          # Since it failed to load with component, try to load with requirejs
          loader.activate 'requirejs'
          unless mod
            mod = loader.loaders.discovered.apply @, params
        else
          throw e

        # Always let requirejs active by default
      loader.activate 'requirejs'

      mod

  loader.shim()
  loader.initialize()