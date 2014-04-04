'use strict'

define 'aura/extensions/widget/flowable', ->

  # The purpose of this extension is have a formalized widget type to
  # put domain comunication logic between other widgets
  (application) ->

    instantiation =
      composite_with: ->

        stampit  = require 'stampit/stampit'

        # TODO Move each composable to its file
        eventable  = stampit().enclose ->
          @on       = @sandbox.on
          @off      = @sandbox.off
          @once     = @sandbox.once
          @many     = @sandbox.many
          @emit     = @sandbox.emit
          @unlisten = @sandbox.removeAllListeners

          @

        filterable = stampit()

        routeable  = stampit()

        stateable  = stampit(transit: (state) -> application.state = state).enclose ->
          Object.defineProperty @, 'state',
            set: @transit
            get: -> application.state
            configurable: false

          @stateless()

        elementless = stampit ->
          marker  = " #{@name}.#{@identifier} flow "
          node    = document.createComment marker
          @$el.replaceWith node
          @$el    = $ node

        stampit.compose filterable, routeable, eventable, stateable, elementless

      create_widget_type: (flowable, application) ->
        {core: {Widgets}}   = application

        Widgets.Flow  = Widgets.composable Widgets.Default.prototype, null, (options) -> Widgets.Default.call @, options
        Widgets.Flow.compose flowable

    version: '0.1.0'

    initialize: (application) ->
      flowable = instantiation.composite_with application
      instantiation.create_widget_type flowable, application

    afterAppStart: (application) ->
      application.components.addSource 'flow', 'flows'







