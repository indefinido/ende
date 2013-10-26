define ['./presenter', 'text!./template'], (presenter, template) ->

  type: 'Base'

  initialize: (options) ->
    sandbox = @sandbox
    sandbox.logger.log "initialized!"

    model   = sandbox.model options.resource
    record  = model options.record

    # Create defaults
    # TODO extract and vaidate options
    form    = sandbox.util.extend options,
      title: options.resource

    # Will also initialize sandbox!
    @html template

    # Bind presenter to template
    presentation = presenter form, record
    @$el.addClass 'form widget'
    @bind presentation