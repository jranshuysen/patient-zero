json.(@game, :id, :lat, :long, :cdc_lat, :cdc_long, :finished)
json.hordes @game.hordes, :id, :lat, :long, :radius
