class HordesController < ApplicationController
  before_action :set_horde, only: [:show, :edit, :update, :destroy]

  # GET /hordes
  # GET /hordes.json
  def index
    @hordes = Horde.all
  end

  # GET /hordes/1
  # GET /hordes/1.json
  def show
  end

  # GET /hordes/new
  def new
    @horde = Horde.new
  end

  # GET /hordes/1/edit
  def edit
  end

  # POST /hordes
  # POST /hordes.json
  def create
    @horde = Horde.new(horde_params)

    respond_to do |format|
      if @horde.save
        format.html { redirect_to @horde, notice: 'Horde was successfully created.' }
        format.json { render :show, status: :created, location: @horde }
      else
        format.html { render :new }
        format.json { render json: @horde.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /hordes/1
  # PATCH/PUT /hordes/1.json
  def update
    respond_to do |format|
      if @horde.update(horde_params)
        format.html { redirect_to @horde, notice: 'Horde was successfully updated.' }
        format.json { render :show, status: :ok, location: @horde }
      else
        format.html { render :edit }
        format.json { render json: @horde.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /hordes/1
  # DELETE /hordes/1.json
  def destroy
    @horde.destroy
    respond_to do |format|
      format.html { redirect_to hordes_url, notice: 'Horde was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_horde
      @horde = Horde.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def horde_params
      params.require(:horde).permit(:lat, :long, :radius, :game_id)
    end
end
