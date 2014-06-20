'use strict';

define 'aura/extensions/widget/composable', ->
  stamp = extend = null

  advisorable = (advisor) ->
    # TODO merge advices in the composition chain
    advice_names = ['before', 'after', 'around']

    extract_advices = (object) ->
      found = []
      for key of object when key.indexOf('_') isnt -1
        [name, adviced] = key.split '_'

        if advice_names.indexOf(name) != -1
          callbacks = if object[key].length then object[key] else [object[key]]

          delete object[key]

          found.push
            key: key
            name: name
            adviced: adviced
            callbacks: callbacks

      found

    advisor.advice = (widget) ->

      advices = extract_advices widget

      for advice in advices

        # in order to preserve declaration order, we must reverse the callbacks order
        # TODO rename advice.name to advice.type
        advice.callbacks.reverse() if advice.name == 'before'

        # Advice with all callbacks
        widget[advice.name] advice.adviced, callback for callback in advice.callbacks

      widget

    advisor.advisable = (factory) ->
      original = factory.compose

      compose_advices = (advices, composed_advices = {}) ->
        for advice in advices
          composed_advices[advice.key] ||= []
          composed_advices[advice.key] = composed_advices[advice.key].concat advice.callbacks

        composed_advices

      composable_advices  = (stamps...) ->
        advices = []
        for stamped in stamps
          {fixed: {methods: stamp_methods}} = stamped
          advices = advices.concat extract_advices stamp_methods

        # Create a ultimate stamp with all advices arrays or functions
        # merged, that will ultimatly override the prototype chain
        # definitions
        #
        # TODO do not store advices definitions in the prototype chain
        stamps.push stamp compose_advices advices

        stamps

      # Move current factory composition advices to a composable form
      # {fixed: {methods: composition_methods}} = factory.composition
      # compose_advices extract_advices(composition_methods), composition_methods

      stamp.mixIn factory,
        compose: (stamps...) ->
          stamps.unshift factory.composition
          original.apply factory, composable_advices stamps...

        advice: advisor.advice


    composable = advisor.composable
    advisor.composable = ->
      advisor.advisable composable.apply advisor, arguments

    advisor

  composerable = (compositor) ->
    compositor.composable  = (methods, state, enclose) ->
      factory = (options) ->

        # Inherit defaults from widget
        options = _.defaults options, factory.composition.fixed.methods.options

        # Composition only will compose methods and state!
        instance = factory.composition options: options
        enclose.call instance, options

      # TODO check if it is needed to inherit compositions
      # if methods.composition
      #   composition = methods.composition
      #   delete methods.composition
      #   composition = stamp.compose composition, stamp methods, state
      # else
      #   composition = stamp methods, state

      stamp.mixIn factory,
        composition: stamp methods, state
        # Suport an extension with multiple compositions
        compose: -> @composition = stamp.compose @composition, arguments...

        extend: ->
          `var methods, state`
          {fixed}      = @composition
          initializers = [enclose]
          methods      = {}
          state        = {}

          for definition in arguments
            {methods: definition_methods, state: definition_state} = definition

            methods = extend methods, fixed.methods, definition_methods or definition
            state   = extend state  , fixed.state  , definition_state

            initializers = initializers.concat fixed.enclose      if fixed.enclose
            initializers = initializers.concat definition.enclose if definition.enclose

          enclosed = (properties) ->
            initializers.forEach (initializer) => initializer.call @, properties
            @

          compositor.composable methods, state, enclosed or enclose

    compositor

  version: '0.1.2'

  initialize: (application) ->
    advisable = require 'advisable'

    {core: {Widgets, util: {extend}, stamp}} = application

    Widgets = advisorable composerable Widgets

    # THINK how to at the same time respect aura ways of instantiating
    # widgets and preserve widget logic composability
    Widgets.Default = Widgets.Base
    delete Widgets.Default.extend

    Widgets.Base    = Widgets.advisable Widgets.composable advisable(Widgets.Default.prototype), null, (options) ->
      Object.defineProperty @, 'constructor', value: Widgets.Default, enumerable: false, configurable: false, writable: false
      Widgets.Default.call Widgets.advice(@), options


