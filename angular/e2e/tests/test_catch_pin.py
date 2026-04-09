from pathlib import Path
from e2e.pages.map_page import MapPage


ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
VALID_IMAGE = ASSETS_DIR / "fish-valid.jpg"
INVALID_FILE = ASSETS_DIR / "invalid-file.txt"


def test_create_catch_pin_with_valid_image(map_driver, base_url):
    page = MapPage(map_driver, base_url)

    page.wait_until_loaded()
    assert "/map" in map_driver.current_url

    page.open_create_pin_popup()
    assert page.is_create_pin_popup_visible()

    page.select_on_map_mode()
    page.click_on_map_to_select_coordinates()
    page.wait_for_coordinates_selection()
    assert page.has_selected_coordinates()

    page.select_catch_pin_type()
    assert page.is_catch_modal_visible()

    page.upload_catch_image(str(VALID_IMAGE))
    page.fill_catch_body("Catch pin criado automaticamente por Selenium.")
    page.select_catch_species_by_index(1)
    page.select_catch_bait_by_index(1)
    page.fill_catch_hook("2/0")

    page.publish_catch_pin()
    page.wait_for_catch_modal_to_close()

    assert page.is_catch_modal_closed()


def test_create_catch_pin_with_invalid_file_shows_alert(map_driver, base_url):
    page = MapPage(map_driver, base_url)

    page.wait_until_loaded()
    assert "/map" in map_driver.current_url

    page.open_create_pin_popup()
    page.select_on_map_mode()
    page.click_on_map_to_select_coordinates()
    page.wait_for_coordinates_selection()

    page.select_catch_pin_type()
    assert page.is_catch_modal_visible()

    page.upload_catch_image(str(INVALID_FILE))

    alert_text = page.wait_for_alert_and_accept()

    assert "Only PNG or JPEG or JPG images are allowed" in alert_text
    assert page.is_catch_modal_visible()
