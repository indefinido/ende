define ['./states/index', './presenter'], (templates, presenter) ->

  # If some extension provides you can use the type defined in there
  # to extend your widget. Defaults to Base constructor.
  #
  # type: 'Base'

  # Default values for the options passed to this widget
  #
  # Note: the options are passed thorught the html element data
  # attributes for this widget: <div data-aura-widget="overlay" data-aura-amount="3"></div>
  #
  # options: {}


  # Widget initialization method, will be called upon loading, options
  # are already filled with defaults
  initialize: (options) ->
    sandbox = @sandbox
    sandbox.logger.log "initialized!"

    # Will also initialize sandbox!
    @html templates.default

    # Forward the models to the presenter
    model =
      title: 'Overlay'
      body : "find me at overlay/states/default.html"

    # Bind presenter to template
    presentation = presenter model
    @$el.addClass 'overlay'
    @bind presentation

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
