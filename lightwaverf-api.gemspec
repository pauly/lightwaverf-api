Gem::Specification.new do |s|
  s.name        = 'lightwaverf-api'
  s.version     = '0.1'
  s.date        = Time.now.strftime '%Y-%m-%d'
  s.summary     = 'restful api for lightwaverf wifi link'
  s.description = <<-end
    A web front end for my lightwaverf gem.
    Interact with lightwaverf wifi-link from the web.
    Control your lights, heating, sockets, sprinkler etc.
  end
  s.authors     = [ 'Paul Clarke' ]
  s.email       = 'pauly@clarkeology.com'
  s.files       = [ 'lightwaverf-api.rb' ]
  s.homepage    = 'http://www.clarkeology.com/wiki/lightwaverf+api'
  s.executables << 'lightwaverf-api'
  s.add_dependency 'sinatra'
  s.add_dependency 'json'
end

