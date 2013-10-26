define 'aura/extensions/states', ['application/states'], (states) ->

  'use strict'

  (application) ->
    {core, logger}  = application
    {dom, mediator} = core

    state =
      current: 'initializing'
      list: []
      previous: null
      change: (transition) ->

        unless transition.to == transition.from
          # The application transition consists in simply store the
          # old state and updating the current one
          state.previous  = state.current
          state.current   = transition.to

          mediator.emit 'state.changed', transition
        else
          mediator.emit 'state.errored', to: transition.to, message: 'Application already in this state!'

      changed: (transition) ->
        dom.find('html').addClass(transition.to).removeClass(transition.from)

    # Set default intial state
    dom.find('html').addClass state.current

    # Application flow control
    flow =

      changed: (transition) ->
        unormalized_widget_options = states[transition.to]

        # TODO cache rendered widgets!

        if unormalized_widget_options
          widgets = []

          for name, options of unormalized_widget_options
            widget_name    = options.name || name

            # To allow user controlling the application change the
            # widget configuration at runtime, we check the transition
            # for widget options
            widgets.push
              name: widget_name
              options: core.util.extend transition[widget_name], options

            # TODO document why we delete this?
            delete options.name

          # TODO update aura and use native start method
          core.inject(widgets).fail flow.failed

          # To prevent reinstation upon changing to this state for the
          # second time, delete stored configuration for this state
          delete states[transition.to]

      failed: (exception) ->
        logger.error "states.flow.failed: Failed autostarting widget! \n Message: #{exception.message}", exception


    version: '0.2.1'

    initialize: (application) ->
      mediator.on 'state.change' , state.change
      mediator.on 'state.changed', state.changed

      # TODO load widgets before state.changed, load on state.change
      mediator.on 'state.changed', flow.changed

      # TODO store meta information about application states
      # application.states = Object.keys states

      Object.defineProperty core, 'state',
        set: (to) ->
          console.warn 'Changing state through the core object is no longer supported. Use application.state = \"other_state\" instead.'
          application.state = to
        get: ->
          console.warn 'Getting state through the core object is no longer supported. Use application.state instead.'
          application.state

      Object.defineProperty application, 'state',
        set: (to) ->
          # To use a unified internal api, transform the setter call
          # into the transition api

          # app.state = name: 'new_state', ...
          unless $.type(to) == 'string'
            transition = to: to.name
            delete to.name

          # app.state = 'new_state'
          else
            transition = to: to

          # app.state = 'previous'
          transition.to   = if transition.to == 'previous' then state.previous else transition.to

          # To change the application state, must invoke the change
          # function with the apropriated transition object
          transition.from = state.current
          state.change transition

        get: -> state.current

    afterAppStart: (application) -> application.state = "default"