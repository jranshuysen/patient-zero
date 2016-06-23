class GamesController < ApplicationController
  before_action :set_game, only: [:show, :edit, :update, :destroy, :finish]

  # GET /games
  # GET /games.json
  def index
    # go to running game / show button
    if Game.running.first
      respond_to do |format|
        format.html { redirect_to game_path Game.running.first  }
        format.json { redirect_to game_path Game.running.first, format: :json }
      end
    end
  end

  # GET /games/1
  # GET /games/1.json
  def show
  end

  # GET /games/new
  def new
    @game = Game.new
  end

  # GET /games/1/edit
  def edit
  end

  # POST /games/new
  def create_new
    redirect_to game_path Game.running.first if Game.running.first

    game = Game.new(finished: false)
    game.save

    redirect_to game_path game
  end

  # POST /games/1/finish
  def finish
    @game.update_attribute(:finished, true)

    ActionCable.server.broadcast 'messages',
      action: 'game_finished',
      game: @game

    redirect_to action: "index"
  end

  # POST /games/1/found_target
  def found_target
    ActionCable.server.broadcast 'messages',
      action: 'game_target_found',
      game: @game
  end

  # POST /games
  # POST /games.json
  def create
    @game = Game.new(game_params)
    respond_to do |format|
      if @game.save
        format.html { redirect_to @game, notice: 'Game was successfully created.' }
        format.json { render :show, status: :created, location: @game }
      else
        format.html { render :new }
        format.json { render json: @game.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /games/1
  # PATCH/PUT /games/1.json
  def update
    respond_to do |format|
      if @game.update(game_params)
        format.html { redirect_to @game, notice: 'Game was successfully started.' }
        format.json { render :show, status: :ok, location: @game }
      else
        format.html { render :edit }
        format.json { render json: @game.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /games/1
  # DELETE /games/1.json
  def destroy
    respond_to do |format|
      format.html { redirect_to games_url, notice: 'Game was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_game
      @game = Game.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def game_params
      params.require(:game).permit(:name, :lat, :long, :cdc_lat, :cdc_long, :finished)
    end
end
