
'use strict';

# TODO require formatters through aura instead of directly loding a module
define 'aura/extensions/rivets', ['aura/extensions/rivets/formatters'], (formatters) ->

  extend                   = null

  with_component           = 'mikeric~rivets@v0.5.12'
  rivets                   = require with_component
  Rivets                   = rivets._

  with_component           = 'indefinido~observable@es6-modules/lib/adapters/rivets.js'
  observable_adapter       = require with_component

  with_component           = 'segmentio~extend@1.0.0'
  extend                   = require with_component

  extend rivets.formatters, formatters

  rivets.configure
    adapter: observable_adapter
    prefix: ''
    templateDelimiters: ['{{', '}}']


  # Create Node Types list for legacy browsers
  #
  # TODO externalize this to a shims file and pehaps put it on
  # platform extension
  try
    throw true if (Node.ELEMENT_NODE != 1)
  catch e
    window.Node = document.Node =
      ELEMENT_NODE          : 1
      ATTRIBUTE_NODE        : 2
      TEXT_NODE             : 3
      CDATA_SECTION_NODE    : 4
      ENTITY_REFERENCE_NODE : 5
      ENTITY_NODE           : 6

  # TOOD move rivets view to another file
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

        if @models[key] and keypath
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
      @options.publisher ||= (event) =>
        value  = Rivets.Util.getInputValue @el

        # TODO more controllable enter handling
        return if event.which == 13

        for formatter in @formatters.slice(0).reverse()
          args = formatter.split /\s+/
          id = args.shift()

          if @view.formatters[id]?.publish
            value = @view.formatters[id].publish value, args...

        @view.config.adapter.publish @model, @keypath, value
        event.preventDefault()

      # TODO Rivets.Util.bindEvent el, 'keypress change', @options.publisher
      Rivets.Util.bindEvent el, 'keyup'   , @options.publisher
      Rivets.Util.bindEvent el, 'change'  , @publish


    unbind: (el) ->

      Rivets.Util.unbindEvent el, 'keyup' , @options.publisher
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

  Rivets.Binding::keypath_from_dependency = (dependency) ->
    if dependency.startsWith '.'
      dependency.substring 1
    else
      path = dependency.split '.'
      path.shift()
      path.join '.'

  Rivets.Binding::sync = ->
    if @model isnt @observer?.object_
      current_model = @observer?.object_
      @observer = @model.observation.observers[@keypath]

      if @options.dependencies?.length
        if current_model
          for dependency in @options.dependencies
            current_model.unsubscribe @keypath_from_dependency(dependency), @sync

          for dependency in @options.dependencies
            @model.subscribe @keypath_from_dependency(dependency), @sync

    @set if @options.bypass
      @model[@keypath]
    else
      @view.config.adapter.read @model, @keypath

  Rivets.Binding::bind = ->
    @binder.bind?.call @, @el

    if @options.bypass
      @sync()
    else
      @view.config.adapter.subscribe @model, @keypath, @sync
      @observer = @model.observation.observers[@keypath]
      @sync() if @view.config.preloadData


    if @options.dependencies?.length
      for dependency in @options.dependencies
        if /^\./.test dependency
          model = @model
          keypath = dependency.substr 1
        else
          dependency = dependency.split '.'
          model = @view.models[dependency.shift()]
          keypath = dependency.join '.'

        @view.config.adapter.subscribe model, keypath, @sync

  require:
    paths:
      # TODO optimize formatters with r.js
      # formatters: 'aura/extensions/rivets/formatters'
      observable: true

  version: '0.1.2'

  initialize: (application) ->
    # TODO optimize formatters with r.js, and put module names under
    # rivets namespace
    # with_aura      = 'formatters'
    # formatters     = require with_aura

    # TODO check if it is needed to do earliear formatters loading
    # extend rivets.formatters, formatters

    # TODO implement compatibility between observable and aura loader
    observable     = requirejs 'observable'

    # TODO implement small view interface
    original_bind = rivets.bind
    rivets.bind = (selector, presentation) ->
      for name, model of presentation
        unless model?
          console.warn "Model object not specified for key #{name}"
          model = {}

        presentation[name] = observable model unless model.observed?

      original_bind.apply rivets, arguments

    extend application.sandbox, view: rivets
    extend application.core   , view: rivets

    extend application.core.Widgets.Base.prototype,
      bind: (presentation, options) ->
        if presentation.presented
          presented = presentation.presented
          delete presentation.presented

        @sandbox._view = @view = rivets.bind @$el, presentation, options

        presented(@view) if presented?

