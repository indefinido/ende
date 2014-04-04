'use strict'

define 'aura/extensions/widget/lifecycleable', ->

  # TODO Remove jquery and use core dependencies
  with_component = 'jquery'
  jQuery         = require with_component

  with_component = 'stampit/stampit'
  stampit        = require with_component

  core           = null

  # TODO transform into a composable
  lifecycleable =
    injection: (definition) ->
      options           = definition.options

      # TODO check for existing widgets before convert options, and
      # not only if type is object
      unless options.nested
        for subwidget_name, suboptions of options
          # TODO if isWidget subwidget_name
          if $.type(suboptions) == 'object' and not (suboptions instanceof jQuery)

            for name, suboption of suboptions

              if $.type(suboption) == 'object' and not (suboption instanceof jQuery)

                for subname, subsuboption of suboption
                  options["#{subwidget_name}#{@capitalize name}#{@capitalize subname}"] = subsuboption

              else

                options["#{subwidget_name}#{@capitalize name}"] = suboption

            # TODO delete options[subwidget_name]

      delete options.nested

      ref               = definition.name.split "@"
      widgetName        = @decamelize ref[0]
      widgetSource      = ref[1] || "default"

      requireContext    = require.s.contexts._
      widgetsPath       = @sources[widgetSource] || "widgets"

      # Register the widget a s requirejs package...
      # TODO: packages are not supported by almond, should we find another way to do this ?
      options.ref               = '__widget__$' + widgetName + "@" + widgetSource
      options.baseUrl           = widgetsPath + "/" + widgetName
      options.require           = options.require || {}
      options.require.packages  = options.require.packages || []
      options.require.packages.push name: options.ref, location: widgetsPath + "/" + widgetName
      options.name  = widgetName

      unless options.el?
        options.el  = jQuery '<div class="widget"></div>'
        @root.append options.el

      @find(options.el).attr options.attributes if options.attributes?

      definition

  recyclable = stampit(
    inject: (name, options) ->
      core.inject name, options

    injection: -> lifecycleable.injection arguments...

    before_initialize: ->
      # TODO only listen to this specific sandbox stop
      @sandbox.on 'aura.sandbox.stop', (sandbox) ->
        @stopped() if @sandbox.ref == sandbox.ref
      , @

      @sandbox.on 'aura.sandbox.start', (sandbox) ->
        @started() if @sandbox.ref == sandbox.ref
      , @

    initialized: ->
      # TODO think how to access parent widget in children ones
      @sandbox._widget ||= @

      @sandbox.emit "#{@name}.#{@identifier}.initialized", @

    started: ->
      @sandbox.emit "#{@name}.#{@identifier}.started", @

    # TODO Remove when updating to aura 0.9
    stopped: ->
      @$el.remove()

  ).enclose -> @initialized()

  (application) ->

    version: '0.2.0'

    initialize: (application) ->
      {core} = application

      # TODO use indemma inflections module instead
      core.util.capitalize = (string) ->
        string.charAt(0).toUpperCase() + string.slice(1);

      # Cache usefull methods
      lifecycleable.sources    = application.config.widgets.sources
      lifecycleable.find       = core.dom.find

      Object.defineProperty lifecycleable, 'root',
        get: ->
          root = core.dom.find app.startOptions.widgets
          throw new TypeError "No root node found for selector '#{app.startOptions.widgets}'." unless root.length != 0

          # Cache and override root when found
          Object.defineProperty lifecycleable, 'root', value: root

          root

        configurable: true


      lifecycleable.decamelize = core.util.decamelize
      lifecycleable.capitalize = core.util.capitalize

      # Add injection function for widgets
      # TODO create a paremeter parser method
      core.inject = (name, options, parent = core) ->

        switch arguments.length
          when 1
            if jQuery.isArray name
              widgets    = name
              injections = core.util._.map widgets, lifecycleable.injection, lifecycleable
              return parent.start injections
            else
              options = name
              parent.start [lifecycleable.injection name: options.name, options: options]

          when 2
            options.name ||= name
            parent.start [lifecycleable.injection name: options.name, options: options]
          when 3
            if options?
              options.name ||= name
            else
              options = name

            parent.start [lifecycleable.injection name: options.name, options: options]

      # TODO instead of using inject function, overwrite start function
      application.sandbox.inject = (params...) ->
        console.warn 'sandbox.inject will be deprecated, then you will use sandbox.start with object parameters'
        params[2] = @ if params.length < 3
        core.inject params...

      core.Widgets.Base.compose recyclable
