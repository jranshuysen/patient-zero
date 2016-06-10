json.array!(@locations) do |location|
  json.extract! location, :id, :lat, :long, :game_id
  json.url location_url(location, format: :json)
end
