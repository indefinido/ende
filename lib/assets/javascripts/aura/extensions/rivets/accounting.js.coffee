#= require accounting/accounting

define 'aura/extensions/rivets/accounting', ['vendor/accounting'], (accounting) ->

  rivets = require 'mikeric-rivets/dist/rivets'

  # ### currency
  # ```data-text="user.accountBalance | currency"```
  #
  # You must include [accounting.js](http://josscrowcroft.github.com/accounting.js/) on your page to use this. It is not bundled.
  #
  # Returns the value currency formatted by accounting.js
  rivets.formatters.currency = (v) -> accounting.formatMoney v

  initialize: (application) ->
    {core} = application

    core.util.extend accounting.settings.currency,
      symbol: 'R$'
      format: '%s %v'
      thousand: '.'
      decimal: ','

    core.util.extend accounting.settings.number,
      thousand: '.'
      decimal: ','

