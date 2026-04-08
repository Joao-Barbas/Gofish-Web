from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from e2e.pages.signin_page import SigninPage


def test_signin_success(driver, base_url):
    page = SigninPage(driver, base_url)
    page.open()

    page.login("player1", "123456@")

    WebDriverWait(driver, 15).until(
        lambda d: "/map" in d.current_url or "/signin/verify" in d.current_url
    )

    assert "/map" in driver.current_url or "/signin/verify" in driver.current_url



def test_signin_invalid_credentials_shows_error(driver, base_url):
    page = SigninPage(driver, base_url)
    page.open()

    page.login("utilizador-invalido", "password-errada")

    error = page.wait_for_error()

    assert error.is_displayed()
    assert "Invalid credentials" in error.text
