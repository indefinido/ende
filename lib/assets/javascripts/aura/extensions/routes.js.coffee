define 'aura/extensions/routes', (routes) ->

  'use strict'

  # TODO Remove .call null
  # TODO Remove .call null
  loader.require.call null, 'modernizr'
  loader.require.call null, 'ened/vendor/assets/javascripts/lennon/lennon.js'
  router = null

  (application) ->
    core     = application.core
    mediator = core.mediator
    _        = core.util._
    router = new Lennon
      # TODO implement logger api for lennon or change lennon library
      # logger: application.logger
      publishEvent: (name, params) ->
        # TODO better method parsing
        params.method = "get"
        mediator.emit name, params

    application.core.router = router

    version: '0.1.0'

    afterAppStart: (application) ->
      router.process()

