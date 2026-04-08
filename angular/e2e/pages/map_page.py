from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException


class MapPage:
    MAP_CANVAS = (By.CSS_SELECTOR, '[data-testid="map-canvas"]')
    OPEN_CREATE_PIN_BUTTON = (By.CSS_SELECTOR, '[data-testid="open-create-pin"]')

    CREATE_PIN_POPUP = (By.CSS_SELECTOR, '[data-testid="choose-pin-popup"]')
    ON_MAP_OPTION = (By.CSS_SELECTOR, '[data-testid="choose-location-map"]')
    CURRENT_LOCATION_OPTION = (By.CSS_SELECTOR, '[data-testid="choose-location-geo"]')
    SELECTED_COORDS = (By.CSS_SELECTOR, '[data-testid="selected-coords"]')

    PIN_KIND_INFORMATION = (By.CSS_SELECTOR, '[data-testid="pin-kind-information"]')
    PIN_KIND_CATCH = (By.CSS_SELECTOR, '[data-testid="pin-kind-catch"]')

    INFO_MODAL = (By.CSS_SELECTOR, '[data-testid="info-pin-modal"]')
    INFO_BODY = (By.CSS_SELECTOR, '[data-testid="info-pin-body"]')
    INFO_PUBLISH = (By.CSS_SELECTOR, '[data-testid="info-pin-publish"]')

    CATCH_MODAL = (By.CSS_SELECTOR, '[data-testid="catch-pin-modal"]')
    CATCH_FORM = (By.CSS_SELECTOR, '[data-testid="catch-pin-form"]')
    CATCH_IMAGE_INPUT = (By.CSS_SELECTOR, '[data-testid="catch-image-input"]')
    CATCH_BODY = (By.CSS_SELECTOR, '[data-testid="catch-pin-body"]')
    CATCH_SPECIES = (By.CSS_SELECTOR, '[data-testid="catch-species"]')
    CATCH_BAIT = (By.CSS_SELECTOR, '[data-testid="catch-bait"]')
    CATCH_HOOK = (By.CSS_SELECTOR, '[data-testid="catch-hook"]')
    CATCH_PUBLISH = (By.CSS_SELECTOR, '[data-testid="catch-pin-publish"]')
    CATCH_ERROR = (By.CSS_SELECTOR, '[data-testid="catch-pin-error"], [data-testid="catch-image-error"]')

    PIN_DETAILS_CARD = (By.CSS_SELECTOR, '[data-testid="pin-details-card"]')
    PIN_SIDE_PANEL = (By.CSS_SELECTOR, '[data-testid="pin-side-panel"]')
    PIN_VOTE_UP = (By.CSS_SELECTOR, '[data-testid="pin-vote-up"]')
    PIN_VOTE_DOWN = (By.CSS_SELECTOR, '[data-testid="pin-vote-down"]')
    PIN_SCORE = (By.CSS_SELECTOR, '[data-testid="pin-score"]')

    def __init__(self, driver, base_url: str):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 15)

        # Ajusta estes valores se o clique não acertar no ponto certo do mapa
        self.pin_click_x = 150
        self.pin_click_y = 150

    def open(self):
        self.driver.get(f"{self.base_url}/map")

    def wait_until_loaded(self):
        self.wait.until(EC.visibility_of_element_located(self.MAP_CANVAS))

    def click_map_at_offset(self, x_offset: int, y_offset: int):
        canvas = self.wait.until(
            EC.visibility_of_element_located(self.MAP_CANVAS)
        )
        ActionChains(self.driver).move_to_element_with_offset(
            canvas, x_offset, y_offset
        ).click().perform()

    def click_same_fixed_map_point(self):
        self.click_map_at_offset(self.pin_click_x, self.pin_click_y)

    def open_create_pin_popup(self):
        self.wait.until(
            EC.element_to_be_clickable(self.OPEN_CREATE_PIN_BUTTON)
        ).click()

        self.wait.until(
            EC.visibility_of_element_located(self.CREATE_PIN_POPUP)
        )

    def toggle_create_pin_popup(self):
        self.wait.until(
            EC.element_to_be_clickable(self.OPEN_CREATE_PIN_BUTTON)
        ).click()

    def wait_for_create_pin_popup_visible(self):
        self.wait.until(
            EC.visibility_of_element_located(self.CREATE_PIN_POPUP)
        )

    def wait_for_create_pin_popup_hidden(self):
        self.wait.until(
            EC.invisibility_of_element_located(self.CREATE_PIN_POPUP)
        )

    def is_create_pin_popup_visible(self) -> bool:
        elements = self.driver.find_elements(*self.CREATE_PIN_POPUP)
        return len(elements) > 0 and elements[0].is_displayed()

    def select_on_map_mode(self):
        self.wait.until(
            EC.element_to_be_clickable(self.ON_MAP_OPTION)
        ).click()

    def click_on_map_to_select_coordinates(self):
        self.click_map_at_offset(self.pin_click_x, self.pin_click_y)

    def wait_for_coordinates_selection(self):
        self.wait.until(
            EC.visibility_of_element_located(self.SELECTED_COORDS)
        )

    def has_selected_coordinates(self) -> bool:
        elements = self.driver.find_elements(*self.SELECTED_COORDS)
        return len(elements) > 0 and elements[0].is_displayed()

    def select_information_pin_type(self):
        element = self.wait.until(
            EC.presence_of_element_located(self.PIN_KIND_INFORMATION)
        )
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});", element
        )
        self.driver.execute_script("arguments[0].click();", element)

        self.wait.until(
            EC.visibility_of_element_located(self.INFO_MODAL)
        )

    def select_catch_pin_type(self):
        element = self.wait.until(
            EC.presence_of_element_located(self.PIN_KIND_CATCH)
        )
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});", element
        )
        self.driver.execute_script("arguments[0].click();", element)

        self.wait.until(
            EC.visibility_of_element_located(self.CATCH_MODAL)
        )

    def fill_info_body(self, text: str):
        field = self.wait.until(
            EC.visibility_of_element_located(self.INFO_BODY)
        )
        field.clear()
        field.send_keys(text)

    def publish_info_pin(self):
        self.wait.until(
            EC.element_to_be_clickable(self.INFO_PUBLISH)
        ).click()

    def wait_for_info_modal_to_close(self):
        self.wait.until(
            EC.invisibility_of_element_located(self.INFO_MODAL)
        )

    def is_info_modal_closed(self) -> bool:
        elements = self.driver.find_elements(*self.INFO_MODAL)
        return len(elements) == 0 or not elements[0].is_displayed()

    def is_catch_modal_visible(self) -> bool:
        elements = self.driver.find_elements(*self.CATCH_MODAL)
        return len(elements) > 0 and elements[0].is_displayed()

    def upload_catch_image(self, file_path: str):
        absolute_path = str(Path(file_path).resolve())
        self.wait.until(
            EC.presence_of_element_located(self.CATCH_IMAGE_INPUT)
        ).send_keys(absolute_path)

    def fill_catch_body(self, text: str):
        field = self.wait.until(
            EC.visibility_of_element_located(self.CATCH_BODY)
        )
        field.clear()
        field.send_keys(text)

    def select_catch_species_by_index(self, index: int = 1):
        select = Select(self.wait.until(
            EC.visibility_of_element_located(self.CATCH_SPECIES)
        ))
        select.select_by_index(index)

    def select_catch_bait_by_index(self, index: int = 1):
        select = Select(self.wait.until(
            EC.visibility_of_element_located(self.CATCH_BAIT)
        ))
        select.select_by_index(index)

    def fill_catch_hook(self, text: str):
        field = self.wait.until(
            EC.visibility_of_element_located(self.CATCH_HOOK)
        )
        field.clear()
        field.send_keys(text)

    def publish_catch_pin(self):
        self.wait.until(
            EC.element_to_be_clickable(self.CATCH_PUBLISH)
        ).click()

    def wait_for_catch_modal_to_close(self):
        self.wait.until(
            EC.invisibility_of_element_located(self.CATCH_MODAL)
        )

    def is_catch_modal_closed(self) -> bool:
        elements = self.driver.find_elements(*self.CATCH_MODAL)
        return len(elements) == 0 or not elements[0].is_displayed()

    def get_catch_error_text(self) -> str | None:
        elements = self.driver.find_elements(*self.CATCH_ERROR)
        if not elements:
            return None
        return elements[0].text.strip()

    def wait_for_alert_and_accept(self) -> str:
        alert = self.wait.until(EC.alert_is_present())
        text = alert.text
        alert.accept()
        return text

    def has_open_alert(self) -> bool:
        try:
            self.driver.switch_to.alert
            return True
        except NoAlertPresentException:
            return False

    def wait_for_pin_details_panel(self):
        self.wait.until(
            EC.visibility_of_element_located(self.PIN_DETAILS_CARD)
        )

    def is_pin_details_panel_visible(self) -> bool:
        elements = self.driver.find_elements(*self.PIN_DETAILS_CARD)
        return len(elements) > 0 and elements[0].is_displayed()

    def click_vote_up(self):
        self.wait.until(
            EC.element_to_be_clickable(self.PIN_VOTE_UP)
        ).click()

    def click_vote_down(self):
        self.wait.until(
            EC.element_to_be_clickable(self.PIN_VOTE_DOWN)
        ).click()

    def is_upvote_active(self) -> bool:
        btn = self.wait.until(
            EC.presence_of_element_located(self.PIN_VOTE_UP)
        )
        classes = btn.get_attribute("class") or ""
        return "active-up" in classes

    def is_downvote_active(self) -> bool:
        btn = self.wait.until(
            EC.presence_of_element_located(self.PIN_VOTE_DOWN)
        )
        classes = btn.get_attribute("class") or ""
        return "active-down" in classes

    def get_pin_score(self) -> int:
        text = self.wait.until(
            EC.visibility_of_element_located(self.PIN_SCORE)
        ).text.strip()
        return int(text)

    def wait_until_vote_state_changes(self, previous_up: bool, previous_down: bool):
        self.wait.until(
            lambda d: self.is_upvote_active() != previous_up
            or self.is_downvote_active() != previous_down
        )

    def wait_until_score_changes(self, previous_score: int):
        self.wait.until(
            lambda d: self.get_pin_score() != previous_score
        )
