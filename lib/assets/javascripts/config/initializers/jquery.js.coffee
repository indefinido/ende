# window.$  require 'jquery'
#
# window.$.ajaxSetup
#   beforeSend: (xhr) ->
#     token = $('meta[name="csrf-token"]').attr('content')
#     xhr.setRequestHeader 'X-CSRF-Token', token