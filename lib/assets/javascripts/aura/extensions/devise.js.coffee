root = exports ? this

define 'aura/extensions/devise', () ->

  'use strict'

  sandbox  = null
  mediator = null
  core     = null

  # TODO create an indemma session model, or use apps default session
  # model, or the configured one
  session  =
    build: (user = {}) ->
      if core.models.user

        user_session = core.models.user
          email   : user.email
          password: user.password

      else

        # TODO create an indemma model
        # TODO deprecate this usage and always use app default model
        # TODO after that create a configuration for using a custom model
        user_session = core.models.record.call
          resource:
            name  : 'user'
          email   : user.email
          password: user.password

      user_session.route = '/users/sessions'

      user_session

    # TODO better and more formal way to restore
    restore: ->
      # We make a dummy request to the new session path and if user is
      # logged in, devise redirects us to the users/show.json path for
      # the current loged in user


      session.restoring = true

      # Also find a better way to publish events after all widgets are
      # loaded
      setTimeout (( ) -> session.create()), 3000
      # session.create()

    create: (user) ->

      user_session     = session.build user
      session.instance = user_session

      user_session.dirty = true

      user_session
        .save ->
          sandbox.current_user = @
          sandbox.signed_in = true
          mediator.emit 'user.signed_in', @

        .fail ->
          sandbox.current_user = null
          mediator.emit 'user.unauthorized', @ unless session.restoring
          sandbox.signed_in ||= false

        .always ->
          mediator.emit 'session.restore.tried', @ if session.restoring
          session.restoring  = false

  #      user_password POST   /users/password(.:format)                 devise/passwords#create
  #  new_user_password GET    /users/password/new(.:format)             devise/passwords#new
  # edit_user_password GET    /users/password/edit(.:format)            devise/passwords#edit
  #                    PATCH  /users/password(.:format)                 devise/passwords#update
  #                    PUT    /users/password(.:format)                 devise/passwords#updaet
  password =
    build: (user = {}) ->

      core.models.password
        email:    user.email
        password: user.password

    create: (user) ->

      user_password     = password.build user
      password.instance = user_password

      user_password.dirty = true

      user_password
        .save ->
          mediator.emit 'user.password_recovered', @
        .fail ->
          mediator.emit 'user.unauthorized', @



  # Extension definition
  name: 'devise'
  version: '0.1.0'
  initialize: (application) ->

    core     = application.core
    sandbox  = application.sandbox
    mediator = core.mediator

    # Define callbacks
    # TODO get json with features info from devise
    # gem and only use apropriated listeners
    mediator.on 'user.sign_in', session.create
    mediator.on 'user.recover_password', password.create

    # Define api
    Object.defineProperty sandbox, 'current_user',
      set: (user) -> session.current_user = user
      get: -> session.current_user

    sandbox.session = session

  define_resources: (model) ->

    # TODO define user session as a record too!
    # model
    #   resource: 'user'
    #   route   : '/users/sessions'
    #   email   : user.email
    #   password: user.password

    model.call
      resource:
        scope     : 'users'
        name      : 'password'
        param_name: 'user'
        singular  : true

      email: String

  afterAppStart: (application) ->
    @define_resources application.core.models

    # Restore session if not already
    # TODO Restore only when application is ready
    session.restore()


