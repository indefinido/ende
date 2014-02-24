root = exports ? this

define 'config/load_components', ['ende_build'], ->

  # if jQuery is already included in the default build, we need to load
  # it and globalize it, because aurajs does not know we are using
  # component.io loader and thinks jquery must be shipped within it
  # TODO think in away to not use a global jquery
  # try
  #   root.jQuery = root.$ = require 'component-jquery'
  # catch e
    # jQuery was not included in the component build, soo the application will fallback to the
    # jquery builded in aurajs

  define 'jquery', [], -> require 'component-jquery'
  root.jQuery = root.$ = require 'component-jquery'

  # This may be included in build, and loaded before aurajs requires for them
  # TODO also preload underscorejs
  # define 'underscore', require 'lodash'
  # TODO also preload eventemitter2
  # TODO also preload require-jstext

  # TODO!! Try to improve requirejs and components require integration

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