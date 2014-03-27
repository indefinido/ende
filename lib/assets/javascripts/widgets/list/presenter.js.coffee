'use strict'

define ->

  (items, luna) ->

    resource = items[0].resource

    # TODO create view_model
    searcher:
      query: ''
      search: (event, models) ->

        {list, searcher} = models

        searcher.query = $(event.target).val()

        if searcher.query != ''
          list.items = luna.search searcher.query
        else
          list.items = luna.store.all

        false

    list: Object.create null,
      resource:
        set: (resource) -> null
        get: -> resource
        configurable: true
      items:
        set: (new_items) -> items = new_items
        get: -> items
        configurable: true
