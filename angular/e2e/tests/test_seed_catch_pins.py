from pathlib import Path
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
VALID_IMAGE = ASSETS_DIR / "fish-valid.jpg"

MAP_CANVAS = (By.CSS_SELECTOR, '[data-testid="map-canvas"]')
OPEN_CREATE_PIN_BUTTON = (By.CSS_SELECTOR, '[data-testid="open-create-pin"]')

CREATE_PIN_POPUP = (By.CSS_SELECTOR, '[data-testid="choose-pin-popup"]')
ON_MAP_OPTION = (By.CSS_SELECTOR, '[data-testid="choose-location-map"]')
SELECTED_COORDS = (By.CSS_SELECTOR, '[data-testid="selected-coords"]')

PIN_KIND_CATCH = (By.CSS_SELECTOR, '[data-testid="pin-kind-catch"]')

CATCH_MODAL = (By.CSS_SELECTOR, '[data-testid="catch-pin-modal"]')
CATCH_IMAGE_INPUT = (By.CSS_SELECTOR, '[data-testid="catch-image-input"]')
CATCH_BODY = (By.CSS_SELECTOR, '[data-testid="catch-pin-body"]')
CATCH_SPECIES = (By.CSS_SELECTOR, '[data-testid="catch-species"]')
CATCH_BAIT = (By.CSS_SELECTOR, '[data-testid="catch-bait"]')
CATCH_HOOK = (By.CSS_SELECTOR, '[data-testid="catch-hook"]')
CATCH_PUBLISH = (By.CSS_SELECTOR, '[data-testid="catch-pin-publish"]')
CATCH_ERROR = (By.CSS_SELECTOR, '[data-testid="catch-pin-error"]')


def click_map_at_offset(driver, wait, x_offset: int, y_offset: int):
    canvas = wait.until(EC.visibility_of_element_located(MAP_CANVAS))
    ActionChains(driver).move_to_element_with_offset(
        canvas, x_offset, y_offset
    ).click().perform()


def ensure_map_open(driver, base_url, wait):
    driver.get(f"{base_url}/map")
    wait.until(EC.visibility_of_element_located(MAP_CANVAS))


def open_create_pin_popup(wait):
    wait.until(EC.element_to_be_clickable(OPEN_CREATE_PIN_BUTTON)).click()
    wait.until(EC.visibility_of_element_located(CREATE_PIN_POPUP))


def select_on_map_mode(wait):
    wait.until(EC.element_to_be_clickable(ON_MAP_OPTION)).click()


def wait_for_coordinates(wait):
    wait.until(EC.visibility_of_element_located(SELECTED_COORDS))


def select_catch_pin_type(driver, wait):
    element = wait.until(EC.presence_of_element_located(PIN_KIND_CATCH))
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    driver.execute_script("arguments[0].click();", element)
    wait.until(EC.visibility_of_element_located(CATCH_MODAL))


def upload_catch_image(wait, file_path: Path):
    absolute_path = str(file_path.resolve())
    wait.until(EC.presence_of_element_located(CATCH_IMAGE_INPUT)).send_keys(absolute_path)


def fill_catch_form(wait, body_text: str, hook_text: str = "2/0"):
    body = wait.until(EC.visibility_of_element_located(CATCH_BODY))
    body.clear()
    body.send_keys(body_text)

    species = Select(wait.until(EC.visibility_of_element_located(CATCH_SPECIES)))
    if len(species.options) > 1:
        species.select_by_index(1)

    bait = Select(wait.until(EC.visibility_of_element_located(CATCH_BAIT)))
    if len(bait.options) > 1:
        bait.select_by_index(1)

    hook = wait.until(EC.visibility_of_element_located(CATCH_HOOK))
    hook.clear()
    hook.send_keys(hook_text)


def select_visibility_group_mode(wait):
    wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="catch-visibility-2"]'))
    ).click()


def wait_for_group_visible(wait, group_id: int):
    selector = f'[data-testid="catch-group-{group_id}"]'
    wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, selector))
    )


def select_group(driver, wait, group_id: int):
    selector = f'[data-testid="catch-group-{group_id}"]'

    element = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
    )

    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    driver.execute_script("arguments[0].click();", element)

    wait.until(
        lambda d: "selected" in (
            d.find_element(By.CSS_SELECTOR, selector).get_attribute("class") or ""
        )
    )


def publish_catch_pin(wait):
    wait.until(EC.element_to_be_clickable(CATCH_PUBLISH)).click()


def wait_for_catch_modal_to_close(wait):
    wait.until(EC.invisibility_of_element_located(CATCH_MODAL))


def get_catch_error_text(driver):
    elements = driver.find_elements(*CATCH_ERROR)
    if not elements:
        return None

    text = elements[0].text.strip()
    return text if text else None


def test_seed_20_catch_pins_in_specific_group(logged_driver, base_url):
    """
    Cria 20 catch pins em posições diferentes no mapa, todos associados ao mesmo grupo.
    Altera GROUP_ID para o id do grupo que queres usar.
    """
    driver = logged_driver
    wait = WebDriverWait(driver, 20)

    GROUP_ID = 1
    TOTAL_PINS = 20

    assert VALID_IMAGE.exists(), f"Imagem não encontrada: {VALID_IMAGE}"

    ensure_map_open(driver, base_url, wait)

    positions = []
    start_x = 120
    start_y = 120
    step_x = 22
    step_y = 16

    for i in range(TOTAL_PINS):
        x = start_x + (i % 5) * step_x
        y = start_y + (i // 5) * step_y
        positions.append((x, y))

    for index, (x_offset, y_offset) in enumerate(positions, start=1):
        print(f"\n[Seed] A criar catch pin {index}/{TOTAL_PINS} em offset ({x_offset}, {y_offset})")

        ensure_map_open(driver, base_url, wait)

        open_create_pin_popup(wait)
        select_on_map_mode(wait)

        click_map_at_offset(driver, wait, x_offset, y_offset)
        wait_for_coordinates(wait)

        select_catch_pin_type(driver, wait)

        upload_catch_image(wait, VALID_IMAGE)
        fill_catch_form(
            wait,
            body_text=f"Catch pin #{index} criado automaticamente por Selenium.",
            hook_text=f"{index}/0" if index < 10 else str(index)
        )

        select_visibility_group_mode(wait)
        wait_for_group_visible(wait, GROUP_ID)
        select_group(driver, wait, GROUP_ID)

        publish_catch_pin(wait)
        wait_for_catch_modal_to_close(wait)

        error_text = get_catch_error_text(driver)
        assert not error_text, f"Erro ao criar pin #{index}: {error_text}"

        time.sleep(0.4)
