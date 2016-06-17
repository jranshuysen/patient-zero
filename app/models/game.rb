class Game < ApplicationRecord
  has_many :locations

  scope :running, -> { where(finished: false) }
end
