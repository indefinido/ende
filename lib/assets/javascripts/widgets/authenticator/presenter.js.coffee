'use strict'
define ->
  observable = require('observable').mixin

  (authenticator, recoverer, base) ->

    authenticator: observable Object.create null,
      status:
        configurable: true
        get: -> authenticator.status
        set: (status) -> authenticator.status = status
      message:
        configurable: true
        get: -> authenticator.message
        set: (message) -> authenticator.message = message
      classes:
        configurable: true
        value: ->
          "widget authenticator #{authenticator.status}"
      email:
        configurable: true
        set: (email) -> authenticator.email = email
        get: -> authenticator.email
      password:
        configurable: true
        set: (password) -> authenticator.password = password
        get: -> authenticator.password
      authenticate:
        configurable: true
        value: authenticator.authenticate

    # TODO split into two presenters
    recoverer: observable recoverer

    base: observable base