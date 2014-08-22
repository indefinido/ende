'use strict'

define ->

  (accreditor, user) ->

    # TODO create view_model
    user: user
    user_errors: user.errors.messages
    accreditor: accreditor
