'use strict'

define 'aura/extensions/routes', ['modernizr'], (routes) ->

  # TODO Remove .call null
  # TODO Remove modernizr global variable dependency from this extension
  # loader.require.call null, 'modernizr'

  # TODO rename from ened to ende
  # TODO Remove jquery global variable dependency from this extension
  with_component = 'jquery'
  window.jQuery = window.$ = require with_component
  # TODO Remove .call null
  loader.require.call null, 'ende/vendor/assets/javascripts/lennon/lennon.js'

  query  = loader.require.call null, 'component~querystring@1.3.0'
  router = null

  # TODO rename to router stationg
  (application) ->
    core     = application.core
    mediator = core.mediator
    history  = Modernizr.history

    # TODO use diferent routers depending if history is enabled or not
    lennon_extensions =
      publishEvent: (name, params) ->

        if router.last_route != router.current_route
          mediator.emit 'route.changed', router.current_route

        # TODO method parsing (get, delete, put, post)
        mediator.emit name, params

      process: ->
        context    = {}
        {location} = window

        if history
          path   = location.pathname
          search = location.search
        else
          path = location.hash.replace('#!', '') || '/'
          [path, search]  = path.split('?') if path.indexOf('?') != -1

        #-- If we land on the page with a hash value and history is enabled, redirect to the non-hash page
        if location.hash.indexOf('#!') != -1 && history
          return location.href = location.hash.replace '#!', ''

        #-- If we land on the page with a path and history is disabled, redirect to the hash page
        else if '/' != location.pathname && !history

          part  = location.pathname
          part += location.search   if location.search
          part += location.hash     if location.hash

          return location.href = '/#!' + part


        #-- Process the route
        application.logger.info('Processing path', path)
        for route in @routes

            #-- See if the currently evaluated route matches the current path
            params = path.match route.pattern

            #-- If there is a match, extract the path values and match them to their variable names for context
            if ( params )
                paramKeys = route.path.match /:(\w*)/g,"(\\w*)"

                j = 1
                while j <= route.paramCount
                    context[paramKeys[j - 1].replace(/:/g, '')] = params[j]
                    j++

                if @current_route

                    #-- Don't dispatch the route we are already on
                    if ( @current_route.path == route.path && @current_route.search == search)
                        return false

                    #-- Dispatch the exit event for the route we are leaving
                    if (  @current_route.exitEventName )

                        application.logger.info('Exiting', @current_route.path, 'with', context || {})

                        #-- Execute the callback
                        if 'function' == typeof @current_route.exitEventName
                            @current_route.exitEventName context || {}
                        else
                        #-- Run the publish event
                            @publishEvent(@current_route.exitEventName, context || {})

                #-- Update the current route
                @last_route    = @current_route
                @current_route = route

                #-- Update the current route search string
                @current_route.search                   = search
                @current_route.last_contextualized_path = path

                #-- Dispatch
                return @dispatch route, context


        #-- No route has been found, hence, nothing dispatched
        application.logger.warn 'No route dispatched'

      location: (href, process = true) ->
        # TODO load router depending of history api
        if history
          window.history.pushState null, null, href
        else
          # TODO parse href and extract path!
          window.location.hash = '!' + href

        process and @process()

    # TODO unify router api
    router = new Lennon
      # TODO implement logger api for lennon or change lennon library
      # logger: application.logger
      publishEvent: lennon_extensions.publishEvent

    application.core.router = core.util.extend router, lennon_extensions

    location = Object.create null,
      # TODO cache query parsing
      query:
        get: ->
          # TODO move routers implementation outside this file
          if history
            query.parse window.location.search.substring(1)
          else
            query.parse window.location.hash.split('?')[1]


      toString: -> window.location

    version: '0.2.2'

    initialize: (application) ->
      {logger} = application
      application.sandbox.location = location
