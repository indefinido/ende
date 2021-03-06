'use strict'

define 'aura/extensions/states', ['states'], (states) ->

  (application) ->
    {core, logger}  = application
    {dom, mediator} = core

    state =
      current: 'initialization'
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
    # TODO think of a more specific name, like a machine!
    flow =

      changed: (transition) ->
        {domain}                   = application
        unormalized_widget_options = states[transition.to]

        # TODO update aura and use native start method
        # TODO move domain flow logic to a domain extension
        #
        domain_flow                = domain?[transition.to]

        # TODO cache rendered widgets!
        if unormalized_widget_options
          widgets_options = @normalize_widget_options unormalized_widget_options, transition

          injection = core.inject(widgets_options).fail flow.failed

          # TODO let this code more legible
          domain_flow?.ready ||= injection.then((widgets...) ->
            # TODO use es6-shim promises
            $.Deferred().resolveWith domain_flow, widgets
          ).done

          # To prevent reinstation upon changing to this state for the
          # second time, delete stored configuration for this state
          delete states[transition.to]

        if domain_flow and not domain_flow.ready
          # TODO use es6-shim promises
          domain_flow.ready = $.Deferred().resolveWith(domain_flow, []).done


      normalize_widget_options: (unormalized_widget_options, transition_widgets_options) ->
        widgets = []

        for name, options of unormalized_widget_options
          widget_name        = options.name || name
          options.resource ||= name                 unless name == widget_name

          # To allow user controlling the application change the
          # widget configuration at runtime, we check the transition
          # for widget options
          widgets.push
            name: widget_name
            options: core.util.extend transition_widgets_options[widget_name], options

          # TODO document why we delete this?
          delete options.name

        widgets

      failed: (exception) ->
        logger.error "states.flow.failed: Failed autostarting widget! \n Message: #{exception.message}", exception


    version: '0.2.4'

    initialize: (application) ->
      mediator.on 'state.change' , state.change
      mediator.on 'state.changed', state.changed

      # TODO load widgets before state.changed, load on state.change
      # TODO use function hanlder
      mediator.on 'state.changed', -> flow.changed arguments...

      # TODO better integration with router to remove initial states widgets
      mediator.on 'states.list', ->
        @emit 'states.listed', states

      # TODO store meta information about application states
      # application.states = Object.keys states

      Object.defineProperty core, 'state',
        set: (to) ->
          console.warn 'Changing state through the core object is no longer supported. Use application.state = \"other_state\" instead.'
          application.state = to
        get: ->
          console.warn 'Getting state through the core object is no longer supported. Use application.state instead.'
          application.state

      # TODO ask aura to use Object.create when instantiating a new
      # application and stop accessing the global object
      Object.defineProperty window.app, 'state',
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

      # TODO clearer startup sequence
      application.core.metabolize = (root = 'body') ->
        # If any initialized flow changed the application state
        # before the widgets initialization, store its state pass
        # through the default state and go back to the old state
        # created by the flows
        #
        # TODO initialize the first flow in flows extension
        current_state = application.state if application.state != 'initialization'
        application.startOptions.widgets ||= root
        application.state = "default"

        startup = application.core.start arguments...

        # TODO move to domain extension
        # TODO let this code more legible
        domain_flow = application.domain.default
        domain_flow?.ready ||= injection.then((widgets...) ->
          # TODO use es6-shim promises
          $.Deferred().resolveWith domain_flow, widgets
        ).done

        application.state = current_state if current_state?

        startup


    afterAppStart: (application) ->
      # TODO Change the application to default state in flows extension
      application.state = "default" if application.startOptions.widgets
