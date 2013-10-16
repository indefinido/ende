define 'aura/extensions/routes', ['application/routes'], (routes) ->

  'use strict'

  router = new require('lennon')()

  (application) ->
    core     = application.core
    logger   = application.logger
    mediator = core.mediator
    _        = core.util._

    application.router = router
    application.route  = (params) -> router.apply router, params

    version: '0.1.0'

    initialize: (application) ->


    afterAppStart: (application) ->
