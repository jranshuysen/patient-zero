Rails.application.routes.draw do
  mount ActionCable.server => '/cable'

  resources :games
  post 'games/new' => 'games#create_new', as: :post_new_game
  post 'games/:id/finish' => 'games#finish', as: :post_stop_game

  resources :locations

  root 'games#index'
end
