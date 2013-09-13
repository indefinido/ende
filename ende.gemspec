# cofding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'ende/version'

Gem::Specification.new do |spec|
  spec.name          = "ende"
  spec.version       = Ende::VERSION
  spec.authors       = ["Heitor Salazar"]
  spec.email         = ["heitor@indefini.do"]
  spec.description   = %q{A modular web application engine for rails. Using aurajs for architecture and indemma for resource management by default. The goal is to provide seamlessly integration for web applications and various standard domains by providing default extensions and components for aura.}
  spec.summary       = %q{Endë (core, middle) a web application engine for rails with aurajs.}
  spec.homepage      = ""
  spec.license       = "WTFPL"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
