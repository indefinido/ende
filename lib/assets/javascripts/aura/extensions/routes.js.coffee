define 'aura/extensions/routes', (routes) ->

  'use strict'

  # TODO Remove .call null
  # TODO Remove .call null
  loader.require.call null, 'modernizr'
  loader.require.call null, 'ened/vendor/assets/javascripts/lennon/lennon.js'
  query  = loader.require.call null, 'querystring'
  router = null

  # TODO rename to router stationg
  (application) ->
    core     = application.core
    mediator = core.mediator

    # TODO unify router api
    router = new Lennon
      # TODO implement logger api for lennon or change lennon library
      # logger: application.logger
      publishEvent: (name, params) ->

        # TODO method parsing (get, delete, put, post)
        mediator.emit name, params

    router.location = (href) ->
      if Modernizr.history
        window.history.pushState null, null, href
      else
        # TODO parse href and extract path!
        window.location.hash = href

      router.process()



    application.core.router = router

    location = Object.create null,
      # TODO cache query parsing
      query:
        get: -> query.parse window.location.search.substring(1)

      toString: -> window.location

    version: '0.2.0'

    initialize: (application) ->
      application.sandbox.location = location

    afterAppStart: (application) ->
      router.process()

