from e2e.pages.map_page import MapPage


def test_create_info_pin_on_map(logged_driver, base_url):
    page = MapPage(logged_driver, base_url)

    page.open()
    page.wait_until_loaded()
    assert "/map" in logged_driver.current_url

    page.open_create_pin_popup()
    assert page.is_create_pin_popup_visible()

    page.select_on_map_mode()
    page.click_on_map_to_select_coordinates()
    page.wait_for_coordinates_selection()
    assert page.has_selected_coordinates()

    page.select_info_pin_type()
    assert page.is_info_modal_visible()

    page.fill_info_body("Info pin criado automaticamente por Selenium.")
    page.publish_info_pin()

    page.wait_for_info_modal_to_close()
    assert page.is_info_modal_closed()
