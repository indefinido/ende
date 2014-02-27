'use strict'

# TODO implement default presenter
# define ['aura/presenterable'], (presenterable) ->
#  presenterable()
lazy_require = 'observable'
define ['stampit/stampit', lazy_require], (stampit, observable) ->

  itemable = stampit().enclose -> observable @

  viewer   = (items) ->
    observable items: _.map items, itemable

  (items) ->

    presentation =
      viewer: viewer items
