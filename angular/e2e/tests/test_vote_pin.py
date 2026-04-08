from e2e.pages.map_page import MapPage


def test_upvote_created_info_pin(logged_driver, base_url):
    page = MapPage(logged_driver, base_url)

    page.open()
    page.wait_until_loaded()

    page.open_create_pin_popup()
    assert page.is_create_pin_popup_visible()

    page.select_on_map_mode()
    page.click_on_map_to_select_coordinates()
    page.wait_for_coordinates_selection()
    assert page.has_selected_coordinates()

    page.select_information_pin_type()
    page.fill_info_body("Pin para teste de voto com Selenium.")
    page.publish_info_pin()
    page.wait_for_info_modal_to_close()
    assert page.is_info_modal_closed()

    page.toggle_create_pin_popup()
    page.wait_for_create_pin_popup_hidden()

    page.click_same_fixed_map_point()
    page.wait_for_pin_details_panel()
    assert page.is_pin_details_panel_visible()

    initial_score = page.get_pin_score()
    previous_up = page.is_upvote_active()
    previous_down = page.is_downvote_active()

    page.click_vote_up()
    page.wait_until_vote_state_changes(previous_up, previous_down)

    assert page.is_upvote_active()
    assert not page.is_downvote_active()

    updated_score = page.get_pin_score()
    assert updated_score >= initial_score


def test_downvote_created_info_pin(logged_driver, base_url):
    page = MapPage(logged_driver, base_url)

    page.open()
    page.wait_until_loaded()

    page.open_create_pin_popup()
    assert page.is_create_pin_popup_visible()

    page.select_on_map_mode()
    page.click_on_map_to_select_coordinates()
    page.wait_for_coordinates_selection()
    assert page.has_selected_coordinates()

    page.select_information_pin_type()
    page.fill_info_body("Pin para teste de downvote com Selenium.")
    page.publish_info_pin()
    page.wait_for_info_modal_to_close()
    assert page.is_info_modal_closed()

    page.toggle_create_pin_popup()
    page.wait_for_create_pin_popup_hidden()

    page.click_same_fixed_map_point()
    page.wait_for_pin_details_panel()
    assert page.is_pin_details_panel_visible()

    initial_score = page.get_pin_score()
    previous_up = page.is_upvote_active()
    previous_down = page.is_downvote_active()

    page.click_vote_down()
    page.wait_until_vote_state_changes(previous_up, previous_down)

    assert page.is_downvote_active()
    assert not page.is_upvote_active()

    updated_score = page.get_pin_score()
    assert updated_score <= initial_score
