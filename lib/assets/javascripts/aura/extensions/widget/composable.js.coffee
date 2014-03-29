'use strict';

define 'aura/extensions/widget/composable', ->


  version: '0.1.0'

  initialize: (application) ->
    stampit = require 'stampit/stampit'
    Widgets = application.core.Widgets

    # TODO replace Base.extend inheritance to stampit composition
    # Widgets.Base = Widgets.Base.extend eventable
    # eventable.super = Widgets.Base.__super__

    Widgets.composable  = (prototype, constructor, composition = stampit()) ->

      constructor.composition = composition

      extensible = (factory) ->
        factory.compose = ->
          constructor.composition = stampit.compose constructor.composition, arguments...

        factory.extend = (definition) ->
          {methods, state, enclose} = definition

          subfactory = stampit definition or methods, state, enclose

          factory.compose subfactory

          stamp

        factory

      stamp = extensible ->
        instance = @
        instance = constructor.apply instance, arguments if constructor?

        constructor.composition instance


    # THINK how to at the same time respect aura ways of instantiating
    # widgets and preserve widget logic composability
    Widgets.Default = Widgets.Base
    Widgets.Base    = Widgets.composable Widgets.Default.prototype, (options) -> new Widgets.Default options
