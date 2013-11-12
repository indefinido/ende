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
#    initializer :user_controller_extensions do |config|
#      UsersController.class_eval do
#         include, UsersControllerExtensions if devise_controller?
#      end
#    end
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
