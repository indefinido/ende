'use strict'

# TODO implement default presenter
# define ['aura/presenterable'], (presenterable) ->
#  presenterable()
# TODO move observable to requirejs
observable = require('observable').mixin

define ['stampit/stampit'], (stampit) ->

  itemable = stampit().enclose -> observable @

  viewer   = (items) ->
    observable items: _.map items, itemable

  (items) ->

    presentation =
      viewer: viewer items
