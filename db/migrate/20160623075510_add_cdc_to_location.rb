class AddCdcToLocation < ActiveRecord::Migration[5.0]
  def change
    add_column :games, :cdc_lat, :float
    add_column :games, :cdc_long, :float
    remove_column :games, :name
  end
end
