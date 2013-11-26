'use strict'
observable = require('observable').mixin

define (model) ->

  (model) ->

    
    # TODO create view_model
    modal: observable Object.create null,
      title:
        set: (title) -> model.title = title
        get: -> model.title
        configurable: true
      body:
        set: (body) -> model.body = body
        get: -> model.body
        configurable: true
