'use strict';

lazy_require = 'observable'
define ['stampit/stampit', lazy_require], (stampit, observable) ->

  handlers =
    adapter_loaded: (composable) ->
      builder  = stampit.compose(adaptable, composable)
      @adapter = builder options: @options.adapter

      handlers.adapter_initialized.call @

    # Event handlers and state restoring
    adapter_initialized: ->

      if @sandbox.signed_in
        @adapter.user = @sandbox.current_user
      else
        @sandbox.once 'user.signed_in', handlers.user_signed_in, @

      @sandbox.on 'support.default.focus', @focus, @


    user_signed_in: (user) -> @adapter.user = @sandbox.current_user

  adaptable = stampit().methods(
    focus: -> throw new Error "Not implemented by this interface."
  ).enclose -> observable @

  type: 'Base'

  focus: -> @adapter.focus()

  initialize: (options) ->

    unless @options.adapter?
      throw new TypeError "No adapter specified for support widget '#{@identifier}'."

    @options.adapter = @sandbox.util.extend @options.adapter,
      name : options.adapterName
      token: options.adapterToken

    require ["widgets/support/adapters/#{options.adapter.name}"], (composable) => handlers.adapter_loaded.call @, composable

    # TODO implement a type of widget that does not require element
    @$el.remove();


