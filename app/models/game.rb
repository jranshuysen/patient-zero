class Game < ApplicationRecord
  has_many :locations
  has_many :hordes

  scope :running, -> { where(finished: false) }
end
