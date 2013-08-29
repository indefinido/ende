define 'aura/extensions/widget/lifecycleable', ->

  'use strict'

  # TODO Remove jquery and use core dependencies
  jQuery = require 'jquery'

  lifecycleable =
    injection: (definition) ->
      options           = definition.options

      # TODO check for existing widgets before convert options, and
      # not only if type is object
      for subwidget_name, suboptions of options
        # TODO if isWidget subwidget_name
        if $.type(suboptions) == 'object'

          for name, suboption of suboptions
            options["#{subwidget_name}#{@capitalize name}"] = suboption

          # TODO delete options[subwidget_name]

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
      options.name  = widgetName;

      unless options.el
        options.el  = jQuery '<div class="widget"></div>'
        @root.append options.el

      @find(options.el).attr options.attributes if options.attributes?

      definition

  (application) ->

    initialize: (application) ->
      core = application.core

      # TODO use indemma inflections module instead
      core.util.capitalize = (string) ->
        string.charAt(0).toUpperCase() + string.slice(1);


      # Cache usefull methods
      lifecycleable.sources    = application.config.widgets.sources
      lifecycleable.find       = core.dom.find
      lifecycleable.root       = core.dom.find app.startOptions.widgets
      lifecycleable.decamelize = core.util.decamelize
      lifecycleable.capitalize = core.util.capitalize


      # Add injection functiono for widgets
      core.inject = (name = options.name, options) ->
        if jQuery.isArray name
          widgets    = name
          injections = core.util._.map widgets, lifecycleable.injection, lifecycleable
          return core.start injections

        else if not name
          throw new TypeError "app.core.inject: No widget name provided" unless name?

        core.start = lifecycleable.injection options