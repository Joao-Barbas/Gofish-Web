from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


POST_URL = "/forum/post/218"


def test_add_comment_to_forum_post(driver_player2, base_url):
    driver = driver_player2
    wait = WebDriverWait(driver, 15)

    driver.get(f"{base_url}{POST_URL}")

    comment_text = "Comentario criado automaticamente por Selenium no forum."

    body = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="comment-body"]'))
    )
    body.clear()
    body.send_keys(comment_text)

    wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="comment-publish"]'))
    ).click()

    wait.until(
        lambda d: comment_text in d.page_source
    )

    assert comment_text in driver.page_source
