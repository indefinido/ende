require "ende/version"

# TODO add csrf extensions to autoloadpaths
require "ende/csrf_extensions"

module Ende
  class Railtie < Rails::Railtie
    config.to_prepare do
      current_dir = Pathname.new(__FILE__).parent.parent

      assets      = Ende.assets

      assets.paths << current_dir.join('lib', 'assets', 'javascripts').to_s
      # assets.paths << current_dir.join('lib', 'assets', 'stylesheets').to_s uncomment if you use
      assets.paths << current_dir.join('vendor', 'assets', 'javascripts').to_s
      # assets.paths << current_dir.join('vendor', 'assets', 'stylesheets').to_s uncomment if you use
    end

    # Check if devise exists and extend devise controllers to send
    # authenticity (csrf) token
    # TODO move each extension to its own folder
    initializer :csrf_extensions do |app|
      app.config.to_prepare do
        # TODO map devise configurations and seek for show route for
        # each defined resource
        if defined? UsersController
          UsersController.class_eval do
            include ::CsrfExtensions
            after_filter :add_new_csrf_token, only: :show
          end
        end

        Devise::SessionsController.class_eval do
          include ::CsrfExtensions
          after_filter :add_new_csrf_token, only: [:create, :destroy]
        end
      end
    end
  end

  def Ende.load_widget_extensions
    current_dir = Pathname.new(__FILE__).parent.parent
    Dir.glob(current_dir.join 'lib', 'assets', '**', '*.rb').each do |extension|
      require extension
    end
  end

  def Ende.assets
    assets = Railtie.config.assets rescue nil
    assets or Rails.application.config.assets
  end
end

Ende.load_widget_extensions
