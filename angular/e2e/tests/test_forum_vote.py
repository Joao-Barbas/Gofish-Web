from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


POST_URL = "/forum/post/218"


def test_forum_post_upvote(driver_player2, base_url):
    driver = driver_player2
    wait = WebDriverWait(driver, 15)

    driver.get(f"{base_url}{POST_URL}")

    upvote = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="forum-post-vote-up"]'))
    )

    upvote.click()

    wait.until(
        lambda d: "active-up" in (
            d.find_element(By.CSS_SELECTOR, '[data-testid="forum-post-vote-up"]').get_attribute("class") or ""
        )
    )

    classes = driver.find_element(By.CSS_SELECTOR, '[data-testid="forum-post-vote-up"]').get_attribute("class") or ""
    assert "active-up" in classes


def test_forum_post_downvote(driver_player2, base_url):
    driver = driver_player2
    wait = WebDriverWait(driver, 15)

    driver.get(f"{base_url}{POST_URL}")

    downvote = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="forum-post-vote-down"]'))
    )

    downvote.click()

    wait.until(
        lambda d: "active-down" in (
            d.find_element(By.CSS_SELECTOR, '[data-testid="forum-post-vote-down"]').get_attribute("class") or ""
        )
    )

    classes = driver.find_element(By.CSS_SELECTOR, '[data-testid="forum-post-vote-down"]').get_attribute("class") or ""
    assert "active-down" in classes
