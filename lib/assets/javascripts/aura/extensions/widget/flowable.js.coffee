'use strict'

define 'aura/extensions/widget/flowable', ->

  # The purpose of this extension is have a formalized widget type to
  # put domain comunication logic between other widgets
  (application) ->

    stampit = null

    instantiation =
      composite_with: (application) ->

        # TODO Move each composable to its file
        eventable  = stampit().enclose ->
          @on       = @sandbox.on
          @off      = @sandbox.off
          @once     = @sandbox.once
          @many     = @sandbox.many
          @unlisten = @sandbox.removeAllListeners

          @on "#{@name}.#{@identifier}.initialized", @stateless, @

          @

        filterable = stampit()

        routeable  = stampit()

        initializable  = stampit()


        stampit.compose filterable, routeable, eventable, initializable

      create_widget_type: (flowable, application) ->
        {core: {Widgets}}   = application

        Widgets.Flow  = Widgets.composable Widgets.Default.prototype, ((options) -> new Widgets.Default options), flowable

    version: '0.1.0'

    initialize: (application) ->
      stampit  = require 'stampit/stampit'
      flowable = instantiation.composite_with application
      instantiation.create_widget_type flowable, application

    afterAppStart: (application) ->
      application.components.addSource 'flow', 'flows'







