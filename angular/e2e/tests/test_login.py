from selenium import webdriver

def test_homepage_title():
    driver = webdriver.Chrome()

    try:
        driver.get("http://localhost:4200")
        assert driver.current_url.startswith("http://localhost:4200")
    finally:
        driver.quit()
