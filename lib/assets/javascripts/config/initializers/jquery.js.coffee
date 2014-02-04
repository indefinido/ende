require ['jquery'], ($) ->
  # TODO use prefilter instead of beforeSend
  # $.ajaxPrefilter(function(options, originalOptions, xhr){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});
  $.ajaxSetup
    beforeSend: (xhr) ->
      token = $('meta[name="csrf-token"]').attr('content')
      token and xhr.setRequestHeader 'X-CSRF-Token', token