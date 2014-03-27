# TODO read all files from initializer folder and add require call
define 'config/initializers', ['config/load_components'], ->
  require ['config/initializers/jquery', 'config/initializers/requirejs']
