'use strict'
define () ->

  observable = require('observable').mixin
  extend     = require 'segmentio-extend'
  self       = null
  view       = null


  normalizer =
    normalize: (model) ->
      observable extend
        name : model.code
        image : null
        selected : false
        model : model
        normalized : true
        , self.handlers.item

    drawings: ->
      selection = view.select (binding) ->
        binding.keypath == 'items'

      items_binding = selection[0]

      for item_view in items_binding.iterated
        selection = item_view.select (binding) ->
          binding.keypath == 'image'

        image_binding  = selection[0]
        drawing        = self.drawing $(image_binding.el), image_binding.model.model
        drawing.width  = (parseInt(drawing.width ) / 4) + 'px'
        drawing.height = (parseInt(drawing.height) / 4) + 'px'



  self = (items) ->

    # TODO create view_model
    presentation =
      presented: (v) -> view = v
      viewer: observable
        items: self._.map items, normalizer.normalize

    presentation.viewer.subscribe 'items', (items) ->
      for item in items
        unless item.normalized
          index = @items.indexOf item
          console.debug item, item.code, item.name, index
          @observed.items[index] = normalizer.normalize item

      normalizer.drawings()

    presentation