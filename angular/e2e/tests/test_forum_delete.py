from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


POST_URL = "/forum/post/308"


def test_author_can_see_delete_button(driver_player1, base_url):
    driver = driver_player1
    wait = WebDriverWait(driver, 15)

    driver.get(f"{base_url}{POST_URL}")

    delete_btn = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="forum-post-delete"]'))
    )

    assert delete_btn.is_displayed()


def test_non_author_cannot_see_delete_button(driver_player2, base_url):
    driver = driver_player2
    WebDriverWait(driver, 15)

    driver.get(f"{base_url}{POST_URL}")

    delete_buttons = driver.find_elements(By.CSS_SELECTOR, '[data-testid="forum-post-delete"]')
    assert len(delete_buttons) == 0
