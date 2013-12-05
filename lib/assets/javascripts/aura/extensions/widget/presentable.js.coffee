'use strict'

# TODO finish this extension
# TODO initialize dependent extensions
define 'aura/extensions/widget/presentable', ['advisable']  ->

  presentable =
    constructor: (options) ->
      presentable.super.constructor.call @, options

      @after 'initialized', =>
        @presenter?.sandbox = @sandbox

  (application) ->

    version: '0.2.0'

    initialize: (application) ->
      {core} = application

      # Add support for element removal after stoping widget
      # TODO replace Base.extend inheritance to stampit composition
      core.Widgets.Base = core.Widgets.Base.extend presentable
      recyclable.super  = core.Widgets.Base.__super__
