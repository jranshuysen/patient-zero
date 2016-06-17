Rails.application.routes.draw do
  mount ActionCable.server => '/cable'

  resources :games
  post 'games/new' => 'games#create_new', as: :post_new_game

  resources :locations

  root 'games#index'
end
