define ['./states/index', './presenter'], (templates, presenter) ->

  type: 'Base'

  # TODO add devise extension as requirement

  # Widget initialization method, will be called upon loading, options
  # are already filled with defaults
  initialize: (options) ->
    sandbox = @sandbox
    @scope  = @sandbox.resource 'user'
    sandbox.logger.log "initialized!"

    # Will also initialize sandbox!
    @html templates.default

    # Bind presenter to template
    @user = @scope()

    ui =
      status: 'idle'

      classes: =>
        "widget #{ui.status} accreditor"

      button_label: "Cadastrar"
      # TODO add support for custom resources on devise to move
      # accreditation logic to devi=se
      # TODO move accreditation logic to devise extension!
      accredit: (event, models) ->
        return false if ui.status.match 'loading'

        {user} = models

        ui.status = 'loading blocked'
        ui.button_label = "Validando dados..."
        user.validate().done (record) ->
          if !record.errors.length
            user.save accreditation.done, accreditation.failed
          else
            ui.status = "error blocked"
            ui.button_label = "Ops... confira os dados acima."

            setTimeout ->
              ui.status = "error"
              ui.button_label = "Cadastrar"
            , 2000

        event.preventDefault()

      changed: (event, models) -> models.user.dirty = true

    accreditation =
      done: (attributes, status, xhr) =>
        setTimeout =>

          # TODO move accreditation logic to devise extension!
          # TODO figure out why mongoid renders incorrect id!
          attributes._id = attributes._id['$oid'] if attributes._id['$oid']

          # TODO move accreditation logic to devise extension!
          app.sandbox.signed_in = true
          current_user = sandbox.models.user()
          current_user.assign_attributes attributes
          sandbox.current_user = current_user
          sandbox.signed_in    = true

          # TODO implement as a indemma extension
          token = xhr.getResponseHeader 'X-CSRF-Token'
          console.error "Server did not send the new csrf token.\n User may not be logged in!" unless token
          $('meta[name="csrf-token"]').attr 'content', token

          sandbox.emit 'session.created', current_user
          sandbox.emit 'user.signed_in' , current_user

          sandbox.emit "accreditor.#{@identifier}.accredited", @
        , 2000

        ui.status = "success blocked"
        ui.button_label = "Cadastro concluído, redirecionando..."

      failed: =>
        sandbox.emit "accreditor.#{@identifier}.accreditation_failed", @errors

        ui.status = "error blocked"
        ui.button_label = "Erro ao efetuar cadastro!"

        setTimeout ->
          ui.status = "error"
          ui.button_label = 'Cadastrar'
        , 2000

    @user.dirty = true
    presentation = presenter ui, @user
    @$el.attr 'data-class', 'accreditor.classes < accreditor.status'
    @bind presentation
