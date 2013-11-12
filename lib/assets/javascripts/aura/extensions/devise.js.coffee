root = exports ? this

define 'aura/extensions/devise', () ->

  'use strict'

  sandbox  = null
  mediator = null
  core     = null

  # TODO create an indemma session model, or use apps default session
  # model, or the configured one
  session  =
    # TODO add support for authentication keys
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

      user_session.route = "/#{user_session.resource}s/sessions"

      user_session

    # TODO better and more formal way to restore
    # Devise::SessionsController#show would be a great solution!
    restore: ->
      # We make a dummy request to the new session path and if user is
      # logged in, devise redirects us to the users/show.json path for
      # the current loged in user
      attempt = core.data.deferred()

      # Also find a better way to publish events after all widgets are
      # loaded
      session.restoring = true # TODO implement #show on devise/sessions_controller

      setTimeout ( () ->
        restoration = session.create()
        restoration.done   -> attempt.resolveWith @, arguments
        restoration.progress -> attempt.notifyWith @, arguments
        restoration.fail   ->
          # TODO think what this method should do with other response codes
          sandbox.signed_in = false
          mediator.emit 'session.restoration_failed'

          attempt.rejectWith @, arguments

        restoration.always ->
          # TODO implement #show on devise/sessions_controller, and
          # try to restore session not by creating a new one, but
          # trying to retrieve the current one
          setTimeout ->
            session.restoring = false
          , 100
          mediator.emit 'session.restoration_tried'

      ), 3000

      attempt

    create: (user) ->

      user_session     = session.build user
      session.instance = user_session

      user_session.dirty = true

      user_session
        .save (response, status, xhr) ->
          sandbox.current_user = @
          sandbox.signed_in = true
          mediator.emit 'session.created', @
          mediator.emit 'user.signed_in', @

          # When the user logs in, the csrf token changes, so we need
          # to update it too! The ende gem extends the controller when
          # devise is included to send it to us
          # TODO implement as a indemma extension
          token = xhr.getResponseHeader 'X-CSRF-Token'
          console.warn "Server did not send the new csrf token.\n User may not be logged in!" unless token
          $('meta[name="csrf-token"]').attr 'content', token

        .fail (xhr) ->
          switch xhr.status
            when 401
              mediator.emit 'session.creation_unauthorized', @ unless session.restoring  # TODO implement #show on devise/sessions_controller
            else
              # TODO move session.restoring check outside this method
              mediator.emit 'session.creation_failed', @

    destroy: ->
      # TODO update the csrf token with the new one!
      # TODO better resource deletion control, create interface to
      # make delete requests
      session.instance.id = 0
      session.instance.destroy()
        .done ->
          sandbox.current_user = null
          sandbox.signed_in    = false
          mediator.emit 'user.signed_out', @
        .fail (xhr) ->
          mediator.emit 'session.destruction_failed', @


  #      user_password POST   /users/password(.:format)                 devise/passwords#create
  #  new_user_password GET    /users/password/new(.:format)             devise/passwords#new
  # edit_user_password GET    /users/password/edit(.:format)            devise/passwords#edit
  #                    PATCH  /users/password(.:format)                 devise/passwords#update
  #                    PUT    /users/password(.:format)                 devise/passwords#update
  # Command handlers
  password =
    model: null
    build: (user = {}) ->

      # TODO change to user model
      password.model
        email:    user.email

        password: user.password
        password_confirmation: user.password_confirmation

        reset_password_token: user.reset_password_token

    create: (user) ->
      user_password     = password.build user
      password.instance = user_password

      user_password.dirty = true

      user_password
        .save ->
          # TODO add models event emission to the models extension
          # TODO detect model event emission need based on
          # subscriptions to resource events
          mediator.emit 'password.created', @
          mediator.emit 'user.password_created' , user

        .fail (xhr) ->
          # TODO improve event naming
          # TODO treat other failure cases
          # TODO auto publish events
          switch xhr.status
            when 401
              mediator.emit 'password.creation_unauthorized', @
            when 422
              mediator.emit 'password.creation_unprocessable', @
            else
              # TODO move session.restoring check outside this method
              mediator.emit 'session.creation_failed', @


    update: (user) ->
      user_password  = password.build(user)
      update = {}
      param = user_password.resource.param_name || user_password.resource.toString()
      password.instance = user_password

      update[param] = user_password.json()
      update.reset_password_token = user.reset_password_token

      password.model
        .put.call(user_password)
        .done ->
          # TODO add models event emission to the models extension
          # TODO detect model event emission need based on
          # subscriptions to resource events
          mediator.emit 'password.updated', @
          mediator.emit 'user.password_updated', user

          session.restore()

        .fail (xhr) ->
          # TODO actually implement automatic put restful support on indemma
          # Calling manualy the put request, so forward the failure to
          # the default handler
          xhr.fail @failed

          # TODO improve event naming
          # TODO treat other failure cases
          # TODO insert indemma hook for autopublishing this events
          switch xhr.status
            when 401
              mediator.emit 'password.update_unauthorized' , @
            when 422
              mediator.emit 'password.update_unprocessable', @
            else
              # TODO move session.restoring check outside this method
              mediator.emit 'password.update_failed'       , @



  domain =
    action_unauthorized: ->
      # Try to restore session in case of forbindness
      #
      # TODO Think if its really necessary to try to restore now its
      # used only to get initial user
      #
      # TODO remove the session.restoring check and implement devise/sessions_controller#show
      if not session.restoring and (sandbox.signed_in or sandbox.current_user)
        mediator.off 'action.unauthorized', domain.action_unauthorized
        session.restore()
          .done ->
            mediator.on 'action.unauthorized', domain.action_unauthorized

          .fail (xhr) ->
            # When the restoration was forbidden by the server, order to
            # destroy current user session, because if there is one, it
            # is probably invalid
            session.destroy() if xhr.status == 401



  # Extension definition
  name: 'devise'
  version: '1.0.0'
  initialize: (application) ->
    {core, sandbox} = application
    {mediator} = core

    # TODO add ajax control into an extension and stop using jquery directly
    jQuery(document).ajaxError (event, xhr) ->
      if xhr.status == 401
        mediator.emit 'action.unauthorized', sandbox.current_user unless session.restoring

    # Define api
    Object.defineProperty sandbox, 'current_user',
      set: (user) -> session.current_user = user
      get: -> session.current_user

    sandbox.session = session

  define_routes: (router) ->
    # TODO pass authenticable resource as a parameter to extension
    router.define '/users/sign_in'     , 'session.new'
    router.define '/users/sign_out'    , 'session.destroy'

    # TODO get devise configuration for password recovery
    router.define '/users/password/new' , 'password.new'
    router.define '/users/password/edit', 'password.edit'

    # TODO get devise configuration for user registry
    router.define '/users/new'         , 'registration.new'

  define_resources: (model) ->

    # TODO define user session as a record too!
    # model
    #   resource: 'user'
    #   route   : '/users/sessions'
    #   email   : user.email
    #   password: user.password

    password.model = model.call
      resource:
        scope     : 'users'
        name      : 'password'
        param_name: 'user'
        singular  : true

      email: String

      password: String
      password_confirmation: String

  define_handlers: ->
    # TODO get json with features info from devise
    # gem and only use apropriated listeners
    mediator.on 'user.restore_session' , session.restore
    mediator.on 'user.sign_in' , session.create
    mediator.on 'user.sign_out', session.destroy

    mediator.on 'user.create_password', password.create
    mediator.on 'user.update_password', password.update

    mediator.on 'action.unauthorized', domain.action_unauthorized


  afterAppStart: (application) ->
    {router, models} = application.core
    @define_resources models

    # We must define handlers only after resources have been
    # acknowledged
    @define_handlers()

    # TODO move to an external module
    @define_routes router if router?

    # Restore session if not already
    # TODO Restore only when application is ready
    session.restore()


