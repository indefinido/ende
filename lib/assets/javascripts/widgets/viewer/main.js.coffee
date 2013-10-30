'use strict';

define ['./states/index', './presenters/default', '/assets/jquery/inview.js'], (templates, presenter) ->

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
      element.data('boo', identity)
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

      child.detach()

    pride: (element) ->
      element  = $ element
      identity = element.data 'boo'
      ghost    = boo.cache[identity]

      if ghost and ghost.shamed
        ghost.shamed = false
        # In order to remove staticaly set width and height we pass
        # empty strings to css jquery method
        element.css(width: '', height: '').append ghost.child


    viewed: (event, in_view, horizontal, vertical) ->
      boo[if in_view then 'pride' else 'shame'] event.target

  version: '0.1.1'

  # TODO better separation of concerns
  # TODO Current remote page that is beign displayed
  options:
    resource: 'default'
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
    @sandbox.util.extend @presentation.selected, item.model
    @sandbox.emit "viewer.#{@identifier}.selected", item.model

  scope_to: (scope, child_scope) ->
    throw new TypeError "Invalid scope sent to viewer@#{@identifier} sent: #{scope.resource}, expected: #{@scope.resource}" if scope.resource != @scope.resource
    @scope = scope

    # TODO better hierachical event distribution
    for { _widget: widget } in @sandbox._children
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
    presented_ids = []

    # TODO generalise this filtering option
    presented = #for item in selected
      # if @scope?.scope.data.by_type_id
      #   querier = item.models.by_type_id.apply item.models, @scope.scope.data.by_type_id
      # else
      #   querier = item.models

      # TODO make scope.all method use scope too!
      @scope.fetch null, (records) ->
        _.map records, @       # TODO make scope.all method use scope too!

        for record in records
          viewer.items.push record if presented_ids.indexOf(record._id) == -1

          presented_ids = _.union presented_ids, _.pluck(records, '_id')

    $.when(presented...).then =>
      boo.initialize @$el.find '.results .items'
      presented_ids = []

      if @load?
        @load.stop()
        @load = null


  populate: (handlers) ->
    # Initialize dependencies
    @scope.all (records) =>
      @load.stop()

      @presentation = @presenter records

      @html templates[@options.resource]
      boo.initialize @$el.find '.results .items'

      sandbox = @sandbox

      # TODO move binders to application
      @bind @presentation,
         binders:
           unfolding: (element) ->
             drawing = sandbox.modacad.drawing $(element), @model.model
             setTimeout ->
               drawing.redisplay
                 doll:
                   front: 'hide'
                   back : 'hide'
                 unfolding:
                   back : 'hide'

      @handles 'click', 'back', '.back'

  initialize: (options) ->
    # TODO rename all options model to options.resource
    options.model     ||= options.resource

    # TODO import core extensions in another place
    @scope = model = @sandbox.models[options.resource]
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

      custom_default_template and templates[options.model] = custom_default_template
      @presenter = @sandbox.util.extend custom_presenter, presenter if custom_presenter

      # Will also initialize sandbox!
      @$el.addClass "viewer widget #{cssify(options.resource)}"
      @$results = @$el.find '.results .items'

      # Fetch default data
      @load = @sandbox.ui.loader @results
      # TODO better scoping support by viewer

      @populate handlers

    @sandbox.logger.log "initialized!"

    true