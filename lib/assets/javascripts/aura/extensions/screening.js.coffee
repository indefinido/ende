'use strict'

define 'aura/extensions/screening', ->


  screener =
    versionalize: (string) ->
      version = []
      version.push +member for member in string.split '.'
      version

    test: ->
      return @result if @result

      ua = navigator.userAgent
      M  = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];

      if /trident/i.test M[1]
          tem =  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || []
          return @result = alias: 'MSIE', version: @versionalize tem[1]

      M    = if M[2] then [M[1], M[2]] else [navigator.appName, navigator.appVersion, '-?']
      M[2] = tem[1] if (tem = ua.match(/version\/([\.\d]+)/i)) != null

      return @result = alias: M[0], version: @versionalize M[1]

    screen: ->
      window.location = '/screened'

  version: '0.1.0'
  initialize: ->
    browser = screener.test()
    screener.screen() if browser.alias == 'MSIE' and browser.version[0] < 9

  afterAppStart: (application) ->
    application.core.screener = screener



