'use strict'
observable = require('observable').mixin

define ->

  (form, record) ->


    # TODO create view_model
    form: observable Object.create null,
      title:
        set: (title) -> record.title = title
        get: -> record.title
        configurable: true
      body:
        set: (body) -> record.body = body
        get: -> record.body
        configurable: true
