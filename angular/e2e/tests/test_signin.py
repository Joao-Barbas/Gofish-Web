from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from e2e.pages.signin_page import SigninPage


def test_signin_invalid_credentials_shows_error(driver, base_url):
    page = SigninPage(driver, base_url)
    page.open()

    page.login("utilizador-invalido", "password-errada")

    error = page.wait_for_error()

    assert error.is_displayed()
    assert "Invalid credentials" in error.text
