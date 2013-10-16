require "ende/version"

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
#    authenticity (csrf) token
#    config.initializer :blah do
    #      UsersController.send :include, UsersControllerExtensions if devise
#    end
  end

  def Ende.assets
    assets = Railtie.config.assets rescue nil
    assets or Rails.application.config.assets
  end
end
