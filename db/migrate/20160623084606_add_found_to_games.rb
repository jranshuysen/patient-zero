class AddFoundToGames < ActiveRecord::Migration[5.0]
  def change
    add_column :games, :found, :boolean, default: false
  end
end
