'use strict';

define 'aura/extensions/widget/composable', ->

  composable =
    # TODO pass this extensions to the identifiable extension
    # TODO use widget.extend with the constructor property
    constructor: (options) ->
      composable.super.constructor.call @, options

      # TODO implement option composition
      # TODO options.composed_of 'scopable, searchable'
      @


  (application) ->

    initialize: (application) ->
      Widgets = application.core.Widgets

      # TODO replace Base.extend inheritance to stampit composition
      Widgets.Base = Widgets.Base.extend composable
      composable.super = Widgets.Base.__super__
