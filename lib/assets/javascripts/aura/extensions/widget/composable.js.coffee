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
        advice.callbacks.reverse() if advice.name == 'before'

        # Advice with all callbacks
        widget[advice.name] advice.adviced, callback for callback in advice.callbacks

      widget

    advisor.advisable = (factory) ->
      original = factory.compose

      stamp.mixIn factory,
        compose: (stamps...) ->
          {fixed: {methods: composition_methods}} = @composition
          advices = extract_advices composition_methods

          for stamped in stamps
            {fixed: {methods: stamp_methods}} = stamped
            advices = advices.concat extract_advices stamp_methods

          adviced_stamp = {}
          for advice in advices
            adviced_stamp[advice.key] ||= []
            adviced_stamp[advice.key] = adviced_stamp[advice.key].concat advice.callbacks

          # Create a ultimate stamp with all advices arrays or functions merged
          # TODO do not store advices definitions in the prototype chain
          stamps.push stamp adviced_stamp

          original.apply factory, stamps

        advice: advisor.advice

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

    Widgets = composerable advisorable Widgets

    # THINK how to at the same time respect aura ways of instantiating
    # widgets and preserve widget logic composability
    Widgets.Default = Widgets.Base
    delete Widgets.Default.extend

    Widgets.Base    = Widgets.advisable Widgets.composable advisable(Widgets.Default.prototype), null, (options) ->
      Object.defineProperty @, 'constructor', value: Widgets.Default, enumerable: false, configurable: false, writable: false
      Widgets.Default.call Widgets.advice(@), options


