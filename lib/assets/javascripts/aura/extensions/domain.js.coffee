'use strict'

define 'aura/extensions/domain', ->

  # The purpose of this extension is have a business domain practice
  # integrated with the core application functionality

  version: '0.1.0'

  initialize: (application) ->
    {core: {mediator}} = application
    stampit = require 'stampit/stampit'

    eventable  = stampit
      on      : mediator.on
      off     : mediator.off
      once    : mediator.once
      many    : mediator.many
      emit    : mediator.emit
      unlisten: mediator.removeAllListeners

    domainable = stampit()

    # application.use('extensions/models').use 'extensions/widget/flows'
    # TODO detect if flows extension and models extension have already been loaded

    # TODO require domain commands
    application.domain ||= eventable()

  afterAppStart: (application) ->
    {core: {resourceable: {every: resourceables}, Widgets: {Flow}}} = application

    extensions = {}
    for resourceable in resourceables
      resource = resourceable.resource.toString()

      namespaces = resource.split '/'
      method     = namespaces.pop() + 'able'

      # Create namespaces
      node       = extensions
      for namespace in namespaces
        node[namespace] ||= {}
        node = node[namespace]

      node[method] = resourceable

    Flow.composition.methods extensions





