define 'aura/extensions/rivets', ->

  'use strict';

  extend = require 'segmentio-extend'

  rivets = require 'mikeric-rivets/dist/rivets'

  Rivets = rivets._

  observable_configuration = require 'indefinido-observable/lib/adapters/rivets'

  rivets.configure observable_configuration
  rivets.configure
    templateDelimiters: ['{{', '}}']

  # Custom rivets view because we don't want to prefix attributes
  # Rivets.View
  # -----------
  # A collection of bindings built from a set of parent nodes.
  class Rivets.View
    # The DOM elements and the model objects for binding are passed into the
    # constructor along with any local options that should be used throughout the
    # context of the view and it's bindings.
    constructor: (@els, @models, @options = {}) ->
      @els = [@els] unless (@els.jquery || @els instanceof Array)

      for option in ['config', 'binders', 'formatters']
        @[option] = {}
        @[option][k] = v for k, v of @options[option] if @options[option]
        @[option][k] ?= v for k, v of Rivets[option]

      @build()

    # Regular expression used to match binding attributes.
    bindingRegExp: =>
      prefix = @config.prefix
      if prefix then new RegExp("^data-#{prefix}-") else /^data-/

    # Regular expression used to match component nodes.
    componentRegExp: =>
      new RegExp "^#{@config.prefix?.toUpperCase() ? 'RV'}-"

    # Parses the DOM tree and builds `Rivets.Binding` instances for every matched
    # binding declaration.
    build: =>
      @bindings = []
      skipNodes = []
      bindingRegExp = @bindingRegExp()
      componentRegExp = @componentRegExp()


      buildBinding = (binding, node, type, declaration) =>
        options = {}

        pipes = (pipe.trim() for pipe in declaration.split '|')
        context = (ctx.trim() for ctx in pipes.shift().split '<')
        path = context.shift()
        splitPath = path.split /\.|:/
        options.formatters = pipes
        options.bypass = path.indexOf(':') != -1

        if splitPath[0]
          key = splitPath.shift()
        else
          key = null
          splitPath.shift()

        keypath = splitPath.join '.'

        if dependencies = context.shift()
          options.dependencies = dependencies.split /\s+/

        if @models[key]
          @bindings.push new Rivets[binding] @, node, type, key, keypath, options
        else
          console.warn "Model with key '#{key}' not found for binding of type '#{type}' on keypath '#{keypath}'.", @

      parse = (node) =>
        unless node in skipNodes
          if node.nodeType is Node.TEXT_NODE
            parser = Rivets.TextTemplateParser

            if delimiters = @config.templateDelimiters
              if (tokens = parser.parse(node.data, delimiters)).length
                unless tokens.length is 1 and tokens[0].type is parser.types.text
                  [startToken, restTokens...] = tokens
                  node.data = startToken.value

                  if startToken.type is 0
                    node.data = startToken.value
                  else
                    buildBinding 'TextBinding', node, null, startToken.value

                  for token in restTokens
                    text = document.createTextNode token.value
                    node.parentNode.appendChild text

                    if token.type is 1
                      buildBinding 'TextBinding', text, null, token.value
          else if componentRegExp.test node.tagName
            type = node.tagName.replace(componentRegExp, '').toLowerCase()
            @bindings.push new Rivets.ComponentBinding @, node, type

          else if node.attributes?
            for attribute in node.attributes
              if bindingRegExp.test attribute.name
                type = attribute.name.replace bindingRegExp, ''
                unless binder = @binders[type]
                  for identifier, value of @binders
                    if identifier isnt '*' and identifier.indexOf('*') isnt -1
                      regexp = new RegExp "^#{identifier.replace('*', '.+')}$"
                      if regexp.test type
                        binder = value

                binder or= @binders['*']

                if binder.block
                  skipNodes.push n for n in node.childNodes
                  attributes = [attribute]

            for attribute in attributes or node.attributes
              if bindingRegExp.test attribute.name
                type = attribute.name.replace bindingRegExp, ''
                buildBinding 'Binding', node, type, attribute.value

          parse childNode for childNode in node.childNodes

      parse el for el in @els

      return

    # Returns an array of bindings where the supplied function evaluates to true.
    select: (fn) =>
      binding for binding in @bindings when fn binding

    # Binds all of the current bindings for this view.
    bind: =>
      binding.bind() for binding in @bindings

    # Unbinds all of the current bindings for this view.
    unbind: =>
      binding.unbind() for binding in @bindings

    # Syncs up the view with the model by running the routines on all bindings.
    sync: =>
      binding.sync() for binding in @bindings

    # Publishes the input values from the view back to the model (reverse sync).
    publish: =>
      binding.publish() for binding in @select (b) -> b.binder.publishes

    # Updates the view's models along with any affected bindings.
    update: (models = {}) =>
      @models[key] = model for key, model of models
      binding.update models for binding in @bindings


  # Treat backspace, enter and other case
  rivets.binders.spell ||=
    publishes: true
    bind: (el) ->

      @options.publisher ||=  (event) =>
        value  = Rivets.Util.getInputValue @el

        # TODO more controllable enter handling
        return if event.which == 13

        value += String.fromCharCode event.which || event.keyCode || event.charCode

        for formatter in @formatters.slice(0).reverse()
          args = formatter.split /\s+/
          id = args.shift()

          if @view.formatters[id]?.publish
            value = @view.formatters[id].publish value, args...

        @view.config.adapter.publish @model, @keypath, value
        event.preventDefault()

      if window.jQuery?
        # TODO Rivets.Util.bindEvent el, 'keypress change', @options.publisher
        Rivets.Util.bindEvent el, 'keypress', @options.publisher
        Rivets.Util.bindEvent el, 'change'  , @publish
      else
        Rivets.Util.bindEvent el, 'keypress', @options.publisher
        Rivets.Util.bindEvent el, 'change'  , @publish

    unbind: (el) ->

      if window.jQuery?
        # TODO Rivets.Util.unbindEvent el, 'keypress change', @options.publisher
        Rivets.Util.unbindEvent el, 'keypress', @options.publisher
        Rivets.Util.unbindEvent el, 'change', @publish
      else
        # TODO Rivets.Util.unbindEvent el, 'change'  , @options.publisher
        Rivets.Util.unbindEvent el, 'keypress', @options.publisher
        Rivets.Util.unbindEvent el, 'change', @publish

    routine: (el, value) ->
      if window.jQuery?
        el = jQuery el

        if value?.toString() isnt el.val()?.toString()
          el.val if value? then value else ''
      else

        if el.type is 'select-multiple'
          o.selected = o.value in value for o in el if value?
        else if value?.toString() isnt el.value?.toString()
          el.value = if value? then value else ''



  rivets.formatters.float = (value) ->
    throw new TypeError "Invalid value passed to float formatter: #{value}" unless value?

    # Blank value and impossible to convert to string
    (!value || !(value + '')) && (value = 0)

    # Force getter reading on IE
    value = parseFloat value + ''

    # Handle NaN
    (isNaN(value)) && (value = 0)

    # Format value
    value.toFixed(2).toString().replace '.', ','

  rivets.formatters.currency = (value) ->
    'R$ ' + rivets.formatters.float value


  (application) ->

    initialize: (application) ->

      extend application.sandbox,
        view: rivets

      extend application.core.Widgets.Base.prototype,
        bind: (presentation, options) ->
          if presentation.presented
            presented = presentation.presented
            delete presentation.presented

          @view = rivets.bind @$el, presentation, options

          presented(@view) if presented?

