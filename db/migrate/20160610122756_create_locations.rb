class CreateLocations < ActiveRecord::Migration[5.0]
  def change
    create_table :locations do |t|
      t.string :lat
      t.string :long

      t.timestamps
    end
  end
end
