#= require 'jquery/inputmask'
#= require 'jquery/inputmask.extensions'
#= require 'jquery/inputmask.numeric.extensions'

$.extend $.inputmask.defaults.aliases.integer,
    groupSeparator : '.'
    autoGroup      : true
    autoUnmask     : true

$.extend $.inputmask.defaults.aliases.decimal,
    groupSeparator : '.'
    radixPoint     : ','
    autoGroup      : true
    autoUnmask     : true


$.extend $.inputmask.defaults.aliases,
    price:
      alias          : 'decimal'
      digits         : 2
      allowMinus     : false
      allowPlus      : false
      
    plate:
      mask           : 'AAA-9999'
      
    meters:
      alias          : 'integer'
      allowMinus     : false
      allowPlus      : false
      integerDigits  : 6
      
    cpf:
      mask           : '999.999.999-99'
      
    cnpj:
      mask           : '99.999.999/9999-99'
      
    phone:
      mask           : '(99) 9999[9]-9999'
    


define 'aura/extensions/mask', (mask) ->

  'use strict'


  (application) ->
    
    
    mask = (selector, mask, options) ->
      $(selector).inputmask mask, options
    

    # version: '0.1.0'

    initialize: (application) ->
      application.sandbox.ui.mask = mask

    afterAppStart: (application) ->
      #






  # 
  # 
  # 
  # 
  # # TODO Remove .call null
  # # TODO Remove .call null
  # loader.require.call null, 'modernizr'
  # loader.require.call null, 'ened/vendor/assets/javascripts/lennon/lennon.js'
  # query  = loader.require.call null, 'querystring'
  # router = null
  # 
  # # TODO rename to router stationg
  # (application) ->
  #   core     = application.core
  #   mediator = core.mediator
  # 
  #   # TODO unify router api
  #   router = new Lennon
  #     # TODO implement logger api for lennon or change lennon library
  #     # logger: application.logger
  #     publishEvent: (name, params) ->
  # 
  #       current_route = window.location.href
  #       if router.last_route != current_route
  #         mediator.emit 'route.changed'
  #         router.last_route = current_route
  # 
  #       # TODO method parsing (get, delete, put, post)
  #       mediator.emit name, params
  # 
  #   router.location = (href, process = true) ->
  #     if Modernizr.history
  #       window.history.pushState null, null, href
  #     else
  #       # TODO parse href and extract path!
  #       window.location.hash = href
  # 
  #     process and router.process()
  # 
  # 
  #   application.core.router = router
  # 
  #   location = Object.create null,
  #     # TODO cache query parsing
  #     query:
  #       get: -> query.parse window.location.search.substring(1)
  # 
  #     toString: -> window.location
  # 
  #   version: '0.2.1'
  # 
  #   initialize: (application) ->
  #     application.sandbox.ui.mask = mask
  # 
  #   afterAppStart: (application) ->
  #     router.process()
  # 
