json.(@game, :id, :name, :lat, :long, :finished)
json.hordes @game.hordes, :id, :lat, :long, :radius
