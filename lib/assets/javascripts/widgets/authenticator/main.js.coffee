define ['./states/index', './presenter'], (templates, presenter) ->

  # If some extension provides you can use the type defined in there
  # to extend your widget. Defaults to Base constructor.
  #
  # type: 'Base'

  # Default values for the options passed to this widget
  #
  # Note: the options are passed thorught the html element data
  # attributes for this widget: <div data-aura-amount="3"></div>
  #
  # options: {}


  # Widget initialization method, will be called upon loading, options
  # are already filled with defaults
  initialize: (options) ->
    sandbox = @sandbox
    sandbox.logger.log "initialized!"

    base =
      status: null
      classes: =>
        "#{@state} #{@status} authenticator"
      toggle_state: (event) =>
        @state = if @state == 'default' then 'passwords' else 'default'
        false

    # Forward the models to the presenter
    authenticator =
      message: null
      email: null
      password: null
      # TODO copiar do modacad
      # button_label: 'Entrar'

      # Authentication state
      authenticate: (event) ->
        base.status  = "loading" # replace all status
        sandbox.emit 'user.sign_in', authentication

      # Listeners
      authenticated: (session) ->
        base.status  = "success"

      unauthorized: ->
        authentication.message = "Ops... seu e-mail ou senha estão incorretos. Tente mais uma vez!<br><a href='#'>Esqueceu sua senha? Clique aqui.</a>"
        base.status  = "error"


    recoverer =
      email: null
      message: null

      # TODO copiar do modacad
      # button_label: 'Entrar'

      # Recovery state
      recover: (event, models) ->
        base.status = 'loading'
        sandbox.emit 'user.recover_password', recovery

      recovered: (password) ->
        base.status = 'success'


    # Bind and unbind events depending on state
    sandbox.on 'user.signed_in'          , authenticator.authenticated
    sandbox.on 'user.unauthorized'       , authenticator.unauthorized
    sandbox.on 'user.password_recovered' , recoverer.recovered


    # Will also initialize sandbox!
    @$el.attr 'data-class', 'base.classes < base.status'
    @presentation  = presenter authenticator, recoverer, base
    authentication = @presentation.authenticator
    recovery       = @presentation.recoverer

    # TODO Extract to stateable widget
    # TODO use observable
    @observed ||= {}
    Object.defineProperty @, 'state',
      get: => @observed.state
      set: @transition

    @state = 'default'


  # TODO Extract to stateable widget
  # TODO use observable
  transition: (to) ->
    @html templates[to]
    @bind @presentation
    @observed.state = to
