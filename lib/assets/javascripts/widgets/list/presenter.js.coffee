'use strict'
observable = require('indefinido-observable').mixin

define (model) ->

  (items, luna) ->

    resource = items[0].resource

    searcher: observable
      query: ''
      search: (event, models) ->

        {list, searcher} = models

        searcher.query = $(event.target).val()

        if searcher.query != ''
          list.items = luna.search searcher.query
        else
          list.items = luna.store.all

        false

    # TODO create view_model
    list: observable Object.create null,
      resource:
        set: (resource) -> null
        get: -> resource
        configurable: true
      items:
        set: (new_items) -> items = new_items
        get: -> items
        configurable: true
