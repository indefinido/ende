# TODO move to DeviseSessions controller and figure out how to set
# headers after a redirect. Or even, if this is the right approach
module CsrfExtensions
  extend ActiveSupport::Concern

  included do

    private
    def add_new_csrf_token
      response.headers['X-CSRF-Token'] = form_authenticity_token if request.xhr?
    end
  end
end
