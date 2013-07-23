#!/usr/bin/ruby
require 'sinatra'
require 'lightwaverf'

Process.daemon

lightwaverf = LightWaveRF.new
config = lightwaverf.get_config
rooms = config['room']
sequences = config['sequence']

def authorised params
  return params['key'] === 'foo' # obviously todo still...
end

before do
  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Allow-Methods'] = 'GET, PUT, OPTIONS'
  content_type :json
  if request.path_info != '/user'
    if ! authorised( params )
      halt 401, { error: 'not authorised, see paul' }.to_json
    end
  end
end

get '/room/?:room?' do
  if params['room']
    config['room'].each do | room |
      if room['name'] == params['room']
        return room.to_json
      end
    end
    halt 404, { error: 'no such room', rooms: config['room'] }.to_json
  end
  config['room'].to_json
end

put '/room/:room/:device' do
  status = params['status'] || 'on'
  config['room'].each do | room |
    if room['name'] == params['room']
      if params['device'] == 'all'
        result = lightwaverf.send params['room'], 'all', status
        return { result: result }.to_json
      end
      room['device'].each do | device |
        if device == params['device']
          result = lightwaverf.send params['room'], device, status
          return { result: result }.to_json
        end
      end
    end
  end
  halt 404, { error: 'no such room or device', rooms: config['room'] }.to_json
end

get '/sequence/?:sequence?' do
  if params['sequence']
    if config['sequence'][ params['sequence'] ]
      return config['sequence'][ params['sequence'] ].to_json
    end
    halt 404, { error: 'no such sequence', sequences: config['sequence'] }.to_json
  end
  config['sequence'].to_json
end

put '/sequence/?:sequence?' do
  if config['sequence'][ params['sequence'] ]
    result = lightwaverf.sequence params['sequence'], true
    return { result: result }.to_json
  end
  halt 404, { error: 'no such sequence', sequences: config['sequence'] }.to_json
end

get '/config/?' do
  config['url'] = 'http://' + request.host
  config.to_json
end

post '/user/?' do
  key = SecureRandom.base64
  { key: key }.to_json
end

options '/' do
  { GET: [ '/room', '/sequence' ], POST: [ '/user' ] }.to_json
end
