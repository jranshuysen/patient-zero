require 'test_helper'

class HordesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @horde = hordes(:one)
  end

  test "should get index" do
    get hordes_url
    assert_response :success
  end

  test "should get new" do
    get new_horde_url
    assert_response :success
  end

  test "should create horde" do
    assert_difference('Horde.count') do
      post hordes_url, params: { horde: { game_id: @horde.game_id, lat: @horde.lat, long: @horde.long, radius: @horde.radius } }
    end

    assert_redirected_to horde_path(Horde.last)
  end

  test "should show horde" do
    get horde_url(@horde)
    assert_response :success
  end

  test "should get edit" do
    get edit_horde_url(@horde)
    assert_response :success
  end

  test "should update horde" do
    patch horde_url(@horde), params: { horde: { game_id: @horde.game_id, lat: @horde.lat, long: @horde.long, radius: @horde.radius } }
    assert_redirected_to horde_path(@horde)
  end

  test "should destroy horde" do
    assert_difference('Horde.count', -1) do
      delete horde_url(@horde)
    end

    assert_redirected_to hordes_path
  end
end
