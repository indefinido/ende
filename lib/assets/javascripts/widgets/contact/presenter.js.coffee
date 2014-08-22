'use strict'

lazy_require = 'observable'
define [lazy_require], (observable) ->

  (message, sender) ->

    # TODO create view_model
    message       : message
    message_errors: message.errors.messages
    sender        : sender
