'use strict';

define ['./states/index', './presenters/default', '/assets/jquery/inview'], (templates, presenter) ->

  observable = require('indefinido-observable').mixin

  boo =
    cache: {}
    initialize: (container) ->
      container.children('.item')
        .each(@identify)
        .on('inview', @viewed)

    identify: (index, element) ->
      element  = $ element
      identity = _.uniqueId()
      element.data 'boo', identity
      boo.cache[identity] = element

    shame: (element) ->
      element  = $ element
      identity = element.data 'boo'
      child    = element.children()

      # We must store the current element state, we do so by storing a
      # custom tailored object in our object cache
      ghost =
        child: child
        shamed: true

      boo.cache[identity] = ghost

      element.css
        width: element.width()
        height: element.height()
        visibility: 'hidden'

      # child.detach()

    pride: (element) ->
      element  = $ element
      identity = element.data 'boo'
      ghost    = boo.cache[identity]

      if ghost and ghost.shamed
        ghost.shamed = false
        # In order to remove staticaly set width and height we pass
        # empty strings to css jquery method
        element.css(width: '', height: '', visibility: '')


    viewed: (event, in_view, horizontal, vertical) ->
      boo[if in_view then 'pride' else 'shame'] event.target

  version: '0.1.3'

  # TODO better separation of concerns
  # TODO Current remote page that is beign displayed
  options:
    resource: 'default'
    records: null
  #   page:
  #     current: 1
  #     per    : 5

  type: 'Base'

  presenter: presenter

  select: (item) ->
    @selected_item?.selected = false
    @selected_item           = item
    item.selected            = true

    # We extend presentation.selected just to assign all values of the item model
    # TODO call presenter to do this job
    @sandbox.util.extend @presentation.selected   , item.model
    @sandbox.emit "viewer.#{@identifier}.selected", item.model

  scope_to: (scope, child_scope) ->
    throw new TypeError "Invalid scope sent to viewer@#{@identifier} sent: #{scope.resource}, expected: #{@scope.resource}" if scope.resource != @scope.resource
    @scope = scope

    # TODO better hierachical event distribution
    for { _widget: widget } in @sandbox._children?
      widget.scope_to? child_scope

    @repopulate()
    @sandbox.emit "viewer.#{@identifier}.scope_changed", @scope

  repopulate: ->
    if @load?
      @load.stop()
      @load = null

    # TODO store spinner instance, instead of creating a new one every time
    @load = @sandbox.ui.loader @$el.find '.results .items' unless @load?

    viewer        = @presentation.viewer
    viewer.items  = []

    # ✔ Generalize this filtering option
    # TODO make scope.all method use scope too, and replace @scope.fetch by it
    presented = @scope.fetch null, (records) ->
      records = _.map records, @, @

      # TODO implement Array.concat ou Array.merge in observer, and
      # use it here instead of pushing each record
      viewer.items.push record for record in records

    presented.then =>
      if viewer.items.length
        # boo.initialize @$el.find '.results .items'
        @$el.addClass 'filled'
        @$el.removeClass 'empty'
      else
        # TODO implement state support for viewer widget
        @$el.addClass 'empty'
        @$el.removeClass 'filled'

      if @load?
        @load.stop()
        @load = null


  populate: (handlers) ->
    sandbox = @sandbox

    @load   = @sandbox.ui.loader @results

    if @options.records?
      deferred = jQuery.Deferred()
      deferred.resolveWith @scope, [@options.records]
    else
      deferred = @scope.all()

    # Initialize dependencies
    deferred.done (records) =>

      @load.stop()

      @presentation = @presenter records

      @html templates[@options.resource]

      if records.length
        # boo.initialize @$el.find '.results .items'
        @$el.addClass 'filled'
      else
        @$el.addClass 'empty'

      # TODO move binders to application
      @bind @presentation, presenter.presentation

      @handles 'click', 'back', '.back'

  initialize: (options) ->
    # TODO import core extensions in another place
    @scope = model = @sandbox.resource options.resource
    cssify         = @sandbox.util.inflector.cssify
    @sandbox.on "viewer.#{@identifier}.scope", @scope_to, @

    # Extend presentation
    # TODO execute only one time
    presenter.drawing = @sandbox.modacad.drawing

    # TODO Initialize pagination settings
    # @page  = options.page

    # Fetch custom templates
    # TODO better custom templates structure and custom presenter
    # TODO better segregation of concerns on this code
    require [
      "text!./widgets/viewer/templates/default/#{options.resource}.html"
      "./widgets/viewer/presenters/#{options.resource}"
      ], (custom_default_template, custom_presenter) =>

      # TODO Better way to preserve widgets handlers
      handlers     =
        item:
          clicked: (event, models) =>
            @select models.item

      presenter.handlers = handlers

      custom_default_template and templates[options.resource] = custom_default_template
      @presenter = @sandbox.util.extend custom_presenter, presenter if custom_presenter

      # Will also initialize sandbox!
      @$el.addClass "viewer widget #{cssify(options.resource)}"
      @$results = @$el.find '.results .items'

      # Fetch default data
      @populate handlers

    @sandbox.logger.log "initialized!"

    true