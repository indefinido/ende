define 'aura/extensions/states', ['application/states'], (states) ->

  'use strict'

  (application) ->
    core     = application.core
    logger   = application.logger
    mediator = core.mediator
    _        = core.util._


    state =
      current: 'default'
      list: []
      previous: null
      change: (transition) ->
        if state.current != transition.to
          from           = core.state
          to             = if transition.to == 'previous' then state.previous else transition.to
          state.previous = state.current
          state.current  = to
          mediator.emit 'state.changed', to: to, from: from
        else
          mediator.emit 'state.errored', to: transition.to, message: 'Application already in this state!'
      changed: (transition) ->
        core.dom.find('html').addClass(transition.to).removeClass(transition.from)

    # Set default intial state
    core.dom.find('html').addClass state.current

    # Application flow control
    flow =

      changed: (transition) ->
        widget_configurations = states[transition.to]
        if widget_configurations
          widgets = []

          for name, options of widget_configurations
            widgets.push
              name: options.name || name
              options: options

            delete options.name

          core.inject(widgets).fail flow.failed

          delete states[transition.to]
      failed: (exception) ->
        logger.error "states.flow.failed: Failed autostarting widget #{@} \n Message: #{exception.message}", exception


    initialize: (application) ->
      mediator.on 'state.change' , state.change
      mediator.on 'state.changed', state.changed

      # TODO load widgets before state.changed, load on state.change
      mediator.on 'state.changed', flow.changed

      Object.defineProperty core, 'state',
        set: (to) -> state.change to: to
        get: -> state.current
