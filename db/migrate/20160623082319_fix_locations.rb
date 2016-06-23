class FixLocations < ActiveRecord::Migration[5.0]
  def change
    change_column :games, :lat, :float, precision: 15, scale: 12
    change_column :games, :long, :float, precision: 15, scale: 12
    change_column :games, :cdc_lat, :float, precision: 15, scale: 12
    change_column :games, :cdc_long, :float, precision: 15, scale: 12

    change_column :locations, :lat, :float, precision: 15, scale: 12
    change_column :locations, :long, :float, precision: 15, scale: 12
  end
end
