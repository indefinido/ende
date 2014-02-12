define 'aura/extensions/routes', (routes) ->

  'use strict'

  # TODO Remove .call null
  # TODO Remove .call null
  loader.require.call null, 'modernizr'
  # TODO rename from ened to ende
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

        current_route = window.location.href
        if router.last_route != current_route
          mediator.emit 'route.changed'
          router.last_route = current_route

        # TODO method parsing (get, delete, put, post)
        mediator.emit name, params

    lennon_extensions =
      location: (href, process = true) ->
        if Modernizr.history
          window.history.pushState null, null, href
        else
          # TODO parse href and extract path!
          window.location.hash = href

        process and router.process()

      define: ->
        return false


    application.core.router = core.util.extend router, lennon_extensions

    location = Object.create null,
      # TODO cache query parsing
      query:
        get: -> query.parse window.location.search.substring(1)

      toString: -> window.location

    version: '0.2.1'

    initialize: (application) ->
      application.sandbox.location = location

    afterAppStart: (application) ->
      # router.process()

