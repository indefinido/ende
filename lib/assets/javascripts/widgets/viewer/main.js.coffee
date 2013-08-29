define ['./states/index', './presenter'], (templates, presenter) ->

  observable = require('observable').mixin

  presentation = null
  sandbox = null

  handlers =
    item:
      clicked: (event, models) ->
        models.item.selected = true

    list:
      stabilized: (selected) =>
        viewer        = presentation.viewer
        viewer.items  = []
        presented_ids = []

        # TODO generalise this filtering option
        presented = for item in selected
          item.models.all (records) =>
            for record in records
              viewer.items.push record if presented_ids.indexOf(record._id) == -1

            presented_ids = _.union presented_ids, _.pluck(records, '_id')

        $.when(presented...).then -> presented_ids = []

  # If some extension provides you can use the type defined in there
  # to extend your widget. Defaults to Base constructor.
  #
  # type: 'Base'

  # Default values for the options passed to this widget
  #
  # Note: the options are passed thorught the html element data
  # attributes for this widget: <div data-aura-widget="viewer" data-aura-amount="3"></div>
  #
  # options: {}


  # Widget initialization method, will be called upon loading, options
  # are already filled with defaults
  initialize: (options) ->
    model        = @sandbox.models[options.model]
    presentation = null

    # Extend presentation
    presenter._ = _ = @sandbox.util._
    presenter.handlers = handlers
    presenter.drawing = @sandbox.modacad.drawing

    @sandbox.logger.log "initialized!"

    # Initialize dependencies
    list   = ''
    if options.listModel
      list = "<div data-aura-widget=\"list\" data-model=\"#{options.listModel}\"></div>"
      @sandbox.on 'list.stabilized'  , handlers.list.stabilized


    # Will also initialize sandbox!
    @$el.addClass 'viewer widget'
    @html list + templates.default

    # Fetch default data
    model.all (records) =>
      presentation = presenter records
      @bind presentation



    true

    # You can now update the presentation to update the widget
    # presentation.title = 'Hello World!'

    # Remember to access functionality and to provide your
    # events throught the sandbox!
    #
    # Built-in properties of sandbox
    #
    #  emit '{entity.name}.{event.name}.{entity.id}', handler_parameters...
    #  off name, listener
    #  on name, listener, context
    #  stopListening()                                   # Remove all event handlers for this widget
    #
    #  start ['calendar', 'payments']                    # widgets_list
    #  stop()                                            # Stop this widget and destroy its sandbox
    #
    #  data.deferred()                                   # Create a new deferred object
    #  data.when promises..., callback                   # Execute callback upon deferred resolution
    #  dom.data selector, [attribute]                    # Return object for selected element
    #  dom.find selector, context                        # Return framework maped dom element for
    #                                                    # the selector (usually jQuery Object)
    #  events.bindAll context, functions...              # Bind all functions to the same context
    #  events.listen context, events, selector, callback # Listen to dom events, all parameters are string, except callback
    #  template.parse
    #  util._                                            # UnderscoreJS like object
    #  util.decamelize camelCase, delimiter
    #  util.each object, callback, arguments
    #  util.extend objects...
    #  util.uniq array, isSorted, iterator, context
    #
    #
    # e.g.: @sandbox.events.listen 'click', '.menu', (e) -> alert 'selected'
    #
    #
    # Extensions properties of sandbox
    #
    #  view.bind element, models # Bind DOM element to models (rivets extension)
    #
    #
    # The sandbox should contain all extensions features, if the extension
    # feature does not suite you and it's only needed by this widget,
    # require it as dependency on the define call:
    #
    # define [ 'three' ], (three) ->


    # Models access if needed, is also provided through the sandbox
    # person = @sandbox.domain.person
    #
    # arthur = person({
    #   name: "Arthur Philip Dent",
    #   species  : "Humam"
    # });
    #

    # For the 'Base' type widget you can access some useful
    # properties:
    #
    # @$el         # Widgets HTML DOM Element
    # @options     # All options passed to this widget thorugh dom and merged defaults
    # @html markup # Helper function to update widget template
    #
    # Also some extensions extend the Base widget:
    #
    # @bind models    # Equivalent to @sandbox.view.bind @$el, models