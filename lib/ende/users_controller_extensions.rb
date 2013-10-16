# TODO move to DeviseSessions controller and figure out how to set
# headers after a redirect. Or even, if this is the right approach
module UsersControllerExtensions
  extend ActiveSupport::Concern

  included do
    before_filter :add_new_csrf_token, only: :show

    private
    def add_new_csrf_token
      response.headers['X-CSRF-Token'] = form_authenticity_token
    end
  end
end
