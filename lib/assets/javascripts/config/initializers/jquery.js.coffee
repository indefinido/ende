root = exports ? @

# TODO figure out a better place to put the crsft token initialization
# root.$.ajaxSetup
#   beforeSend: (xhr) ->
#     token = $('meta[name="csrf-token"]').attr('content')
#     xhr.setRequestHeader 'X-CSRF-Token', token