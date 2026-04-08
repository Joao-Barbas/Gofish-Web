from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class SigninPage:
    EMAIL_OR_USERNAME = (By.CSS_SELECTOR, '[data-testid="signin-email-or-username"]')
    PASSWORD = (By.CSS_SELECTOR, '[data-testid="signin-password"]')
    SUBMIT = (By.CSS_SELECTOR, '[data-testid="signin-submit"]')
    ERROR = (By.CSS_SELECTOR, '[data-testid="signin-error"]')

    def __init__(self, driver, base_url: str):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(f"{self.base_url}/signin")

    def fill_email_or_username(self, value: str):
        field = self.wait.until(EC.visibility_of_element_located(self.EMAIL_OR_USERNAME))
        field.clear()
        field.send_keys(value)

    def fill_password(self, value: str):
        field = self.wait.until(EC.visibility_of_element_located(self.PASSWORD))
        field.clear()
        field.send_keys(value)

    def submit(self):
        button = self.wait.until(EC.element_to_be_clickable(self.SUBMIT))
        button.click()

    def login(self, email_or_username: str, password: str):
        self.fill_email_or_username(email_or_username)
        self.fill_password(password)
        self.submit()

    def wait_for_error(self):
        return self.wait.until(EC.visibility_of_element_located(self.ERROR))
