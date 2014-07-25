define ['./states/index', './presenter'], (templates, presenter) ->

  # If some extension provides you can use the type defined in there
  # to extend your widget. Defaults to Base constructor.
  #
  type: 'Base'

  # Default values for the options passed to this widget
  #
  # Note: the options are passed thorught the html element data
  # attributes for this widget: <div data-aura-widget="contact" data-aura-amount="3"></div>
  #
  # options: {}


  # Widget initialization method, will be called upon loading, options
  # are already filled with defaults
  initialize: (options) ->
    widget  = @
    sandbox = @sandbox
    sandbox.logger.log "initialized!"

    # Will also initialize sandbox!
    @html templates.default

    # Forward the models to the presenter
    message = sandbox.resource('message')()

    sender  =
      button_label: 'Enviar mensagem'

      status: 'idle'
      classes: ->
        "widget #{sender.status} contact"

      send: (event) =>
        sender.status = "loading blocked" # replace all status
        sender.button_label = 'Enviando sua mensagem...'
        if message.valid
          message.save().done ->
            widget.emit 'sent'
          .fail (event) ->
            if event.status == 422
              widget.emit 'send_errored'
            else
              widget.emit 'send_failed'
        else
          widget.emit 'send_errored'
        event.preventDefault()

      sent: ->
        sender.status = 'success blocked'
        sender.button_label = 'Sua mensagem foi enviada com sucesso! Vamos responder logo.'
        message.reset() # TODO reset only the presenter?
        setTimeout ->
          sender.status = 'idle'
          sender.button_label = 'Enviar outra mensagem'
        , 5000

      send_errored: ->
        sender.status = 'error blocked'
        sender.button_label = 'Ops... confira os dados acima e tente novamente.'
        setTimeout ->
          sender.status = 'error'
          sender.button_label = 'Enviar mensagem'
        , 4000

      send_failed: ->
        sender.status = 'error blocked'
        sender.button_label = 'Ops... ocorreu um erro no servidor e já fomos avisados. Que tal tentar novamente mais tarde?.'
        setTimeout ->
          sender.status = 'error'
          sender.button_label = 'Tentar novamente'
        , 7000


    @$el.attr 'data-class', 'sender.classes < sender.status'

    # Bind presenter to template
    presentation = presenter message, sender
    @$el.addClass 'contact'
    @bind presentation

    # TODO implement widget.on
    @on 'sent'        , sender.sent
    @on 'send_failed' , sender.send_failed
    @on 'send_errored', sender.send_errored
