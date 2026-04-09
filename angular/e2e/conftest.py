import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By

from e2e.pages.signin_page import SigninPage

BASE_URL = "http://localhost:4200"


@pytest.fixture
def driver():
    options = Options()
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(1920, 1080)
    driver.set_page_load_timeout(20)
    yield driver
    driver.quit()


@pytest.fixture
def base_url():
    return BASE_URL


def login_as(driver, base_url: str, username: str, password: str):
    page = SigninPage(driver, base_url)
    page.open()
    page.login(username, password)

    WebDriverWait(driver, 20).until(
        lambda d: "/map" in d.current_url
        or "/forum/discover" in d.current_url
        or "/signin/verify" in d.current_url
    )

    return driver


@pytest.fixture
def logged_driver(driver, base_url):
    # fixture genérica para testes autenticados
    return login_as(driver, base_url, "player1", "123456@")


@pytest.fixture
def driver_player1(driver, base_url):
    return login_as(driver, base_url, "player1", "123456@")


@pytest.fixture
def driver_player2(driver, base_url):
    return login_as(driver, base_url, "player2", "123456@")


@pytest.fixture
def map_driver(driver, base_url):
    driver = login_as(driver, base_url, "player1", "123456@")

    for _ in range(3):
        driver.get(f"{base_url}/map")
        try:
            WebDriverWait(driver, 8).until(
                lambda d: len(d.find_elements(By.CSS_SELECTOR, '[data-testid="map-canvas"]')) > 0
            )
            return driver
        except Exception:
            pass

    raise AssertionError("Não foi possível abrir a página do mapa.")
