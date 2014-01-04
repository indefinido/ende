define 'aura/extensions/widget/lifecycleable', ->

  'use strict'

  # TODO Remove jquery and use core dependencies
  jQuery = require 'jquery'
  core   = null

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

      unless options.el
        options.el  = jQuery '<div class="widget"></div>'
        @root.append options.el

      @find(options.el).attr options.attributes if options.attributes?

      definition

  recyclable =
    constructor: (options) ->

      # TODO only listen to this specific sandbox stop
      @sandbox.on 'aura.sandbox.stop', (sandbox) =>
        @stopped() if @sandbox.ref == sandbox.ref

      @sandbox.on 'aura.sandbox.start', (sandbox) =>
        @started() if @sandbox.ref == sandbox.ref

      recyclable.super.constructor.call @, options

      @initialized()

    inject: (name, options) ->
      core.inject name, options

    initialized: ->
      @sandbox.emit "#{@name}.#{@identifier}.initialized", @

    started: ->
      @sandbox.emit "#{@name}.#{@identifier}.started", @

    # TODO Remove when updating to aura 0.9
    stopped: ->
      @$el.remove()

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
      lifecycleable.root       = core.dom.find app.startOptions.widgets
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

      # Add support for element removal after stoping widget
      # TODO replace Base.extend inheritance to stampit composition
      core.Widgets.Base = core.Widgets.Base.extend recyclable
      recyclable.super  = core.Widgets.Base.__super__
