'use strict'

lazy_require = 'observable'
define [lazy_require], (observable) ->

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
      email:
        configurable: true
        set: (email) -> authenticator.email = email
        get: -> authenticator.email
      button_label:
        configurable: true
        set: (button_label) -> authenticator.button_label = button_label
        get: -> authenticator.button_label
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