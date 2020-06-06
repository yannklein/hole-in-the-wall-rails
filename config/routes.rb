Rails.application.routes.draw do
  root to: 'pages#home'
  get "/live", to: "pages#live", as: :live
  get '/pattern.:format' => 'pages#pattern'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
