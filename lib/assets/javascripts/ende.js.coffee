# require ende_build
# require config/load_components
# require_tree ./config/initializers
# TODO think if require jquery and jquery inview in this place is actualy a good idead

# TODO use requirejs alias / packing modules definition for this
define 'ende', ['config/load_components', 'config/initializers', 'ende_build'], {}