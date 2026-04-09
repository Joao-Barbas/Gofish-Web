from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


POST_URL = "/forum/post/106"


def test_report_forum_post(driver_player2, base_url):
    driver = driver_player2
    wait = WebDriverWait(driver, 15)

    driver.get(f"{base_url}{POST_URL}")

    wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="forum-post-report"]'))
    ).click()

    wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="report-modal"]'))
    )

    reason = Select(wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="report-reason"]'))
    ))
    reason.select_by_index(1)

    description = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="report-description"]'))
    )
    description.clear()
    description.send_keys("Report criado automaticamente por Selenium.")

    wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="report-submit"]'))
    ).click()

    wait.until(
        EC.invisibility_of_element_located((By.CSS_SELECTOR, '[data-testid="report-modal"]'))
    )

    assert True
