import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

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

    WebDriverWait(driver, 15).until(
        lambda d: "/map" in d.current_url or "/signin/verify" in d.current_url
    )

    assert "/map" in driver.current_url
    return driver


@pytest.fixture
def driver_player1(driver, base_url):
    return login_as(driver, base_url, "player1", "123456@")


@pytest.fixture
def driver_player2(driver, base_url):
    return login_as(driver, base_url, "player2", "123456@")
