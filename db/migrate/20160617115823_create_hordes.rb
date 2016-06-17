class CreateHordes < ActiveRecord::Migration[5.0]
  def change
    create_table :hordes do |t|
      t.float :lat
      t.float :long
      t.integer :radius
      t.references :game, foreign_key: true

      t.timestamps
    end
  end
end
