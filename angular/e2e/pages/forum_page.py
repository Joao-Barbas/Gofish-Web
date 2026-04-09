from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class ForumPage:
    def __init__(self, driver, base_url="http://localhost:4200"):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    def open_post(self, post_id: int):
        self.driver.get(f"{self.base_url}/forum/post/{post_id}")
        self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".gf-card-forum-post"))
        )

    def get_post_card(self):
        return self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".gf-card-forum-post"))
        )

    def get_upvote_button(self):
        return self.get_post_card().find_element(By.CSS_SELECTOR, "button[title='Upvote']")

    def get_downvote_button(self):
        return self.get_post_card().find_element(By.CSS_SELECTOR, "button[title='Downvote']")

    def get_report_button(self):
        buttons = self.get_post_card().find_elements(By.CSS_SELECTOR, "button[title='Report post']")
        return buttons[0] if buttons else None

    def get_delete_button(self):
        buttons = self.get_post_card().find_elements(By.CSS_SELECTOR, "button[title='Delete post']")
        return buttons[0] if buttons else None

    def get_comments_button(self):
        return self.get_post_card().find_element(By.CSS_SELECTOR, "button[title='Comments']")

    def get_score_element(self):
        vote_wrapper = self.get_post_card().find_element(
            By.CSS_SELECTOR, ".gf-badge-vote.post-interact-wrapper"
        )
        return vote_wrapper.find_element(By.CSS_SELECTOR, "span.post-stats.post-fishing-points")

    def get_score_value(self):
        return int(self.get_score_element().text.strip())

    def click_upvote(self):
        btn = self.get_upvote_button()
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        btn.click()

    def click_downvote(self):
        btn = self.get_downvote_button()
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        btn.click()

    def click_report(self):
        btn = self.get_report_button()
        if btn is None:
            raise Exception("Botão de report não encontrado.")
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        btn.click()

    def click_delete(self):
        btn = self.get_delete_button()
        if btn is None:
            raise Exception("Botão de delete não encontrado.")
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        btn.click()

    def click_comments(self):
        btn = self.get_comments_button()
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        btn.click()

    def is_upvote_active(self):
        return "active-up" in self.get_upvote_button().get_attribute("class")

    def is_downvote_active(self):
        return "active-down" in self.get_downvote_button().get_attribute("class")

    def has_report_button(self):
        return self.get_report_button() is not None

    def has_delete_button(self):
        return self.get_delete_button() is not None
