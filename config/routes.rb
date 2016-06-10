Rails.application.routes.draw do
  mount ActionCable.server => '/cable'

  resources :games
  resources :locations

  root 'games#index'
end
