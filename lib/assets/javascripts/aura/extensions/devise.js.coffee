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
      session.instance.destroy()
        .done ->
          sandbox.current_user = null
          sandbox.signed_in    = false
          mediator.emit 'user.signed_out', @
        .fail (xhr) ->
          mediator.emit 'session.destruction_failed', @


  #      user_password POST   /users/password(.:format)                 devise/passwords#create
  #  new_user_password GET    /users/password/new(.:format)             devise/passwords#new
  # edit_user_password GET    /userss/password/edit(.:format)            devise/passwords#edit
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
          # TODO improve event naming
          mediator.emit 'user.unauthorized', @

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
  version: '0.2.1'
  initialize: (application) ->

    core     = application.core
    sandbox  = application.sandbox
    mediator = core.mediator

    # Define callbacks
    # TODO get json with features info from devise
    # gem and only use apropriated listeners
    mediator.on 'user.sign_in' , session.create
    mediator.on 'user.sign_out', session.destroy
    mediator.on 'user.recover_password', password.create


    mediator.on 'action.unauthorized', domain.action_unauthorized

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
    router.route '/users/sessions', 'session.new'

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

    # TODO move to an external module
    @define_routes application if application.router?

    # Restore session if not already
    # TODO Restore only when application is ready
    session.restore()


