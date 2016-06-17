json.array!(@hordes) do |horde|
  json.extract! horde, :id, :lat, :long, :radius, :game_id
  json.url horde_url(horde, format: :json)
end
