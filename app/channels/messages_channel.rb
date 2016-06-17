class MessagesChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'messages'
  end

  def create_horde(data)
    horde = Horde.create(lat: data['lat'], long: data['long'], radius: data['radius'], game: Game.running.first)
    horde.save

    send_horde_message 'create_horde', horde
  end

  def move_horde(data)
    horde = Horde.find(data['id'])
    horde.lat = data['lat']
    horde.long = data['long']
    horde.radius = data['radius']

    send_horde_message 'update_horde', horde
  end

  def update_horde(data)
    horde = Horde.find(data['id'])
    horde.lat = data['lat']
    horde.long = data['long']
    horde.radius = data['radius']
    horde.save

    send_horde_message 'update_horde', horde
  end

  private

  def send_horde_message action, horde
    ActionCable.server.broadcast 'messages',
      action: action,
      horde: horde
  end
end