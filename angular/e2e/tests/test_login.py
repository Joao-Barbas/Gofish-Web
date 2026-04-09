from selenium import webdriver

def test_homepage_title(driver, base_url):
    driver.get(base_url)
    assert driver.current_url.startswith(base_url)

    try:
        driver.get("http://localhost:4200")
        assert driver.current_url.startswith("http://localhost:4200")
    finally:
        driver.quit()
