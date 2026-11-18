import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

os.makedirs("screenshots", exist_ok=True)

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--window-size=1440,900")

print("Initializing Chrome WebDriver...")
driver = webdriver.Chrome(options=options)

try:
    # 1. Capture Home / Chat Interface
    print("Navigating to live app...")
    driver.get("https://darglobal-assistant.vercel.app")
    time.sleep(3)
    driver.save_screenshot("screenshots/1_chatbot_home.png")
    print("Saved screenshots/1_chatbot_home.png")

    # 2. Click a suggested prompt to get a full grounded response
    buttons = driver.find_elements(By.TAG_NAME, "button")
    dg1_btn = None
    for b in buttons:
        if "DG1" in b.text:
            dg1_btn = b
            break
            
    if dg1_btn:
        print("Clicking DG1 suggested prompt...")
        dg1_btn.click()
        time.sleep(4)  # wait for RAG retrieval and answer
        driver.save_screenshot("screenshots/2_ai_grounded_response.png")
        print("Saved screenshots/2_ai_grounded_response.png")

    # 3. Switch to Properties Catalog Tab
    nav_buttons = driver.find_elements(By.TAG_NAME, "button")
    for b in nav_buttons:
        if "Properties" in b.text:
            print("Switching to Properties Catalog tab...")
            b.click()
            time.sleep(2)
            driver.save_screenshot("screenshots/3_properties_catalog.png")
            print("Saved screenshots/3_properties_catalog.png")
            break

    # 4. Switch to Scraper Engine Tab
    nav_buttons = driver.find_elements(By.TAG_NAME, "button")
    for b in nav_buttons:
        if "Scraper" in b.text:
            print("Switching to Scraper Studio tab...")
            b.click()
            time.sleep(2)
            driver.save_screenshot("screenshots/4_scraper_studio.png")
            print("Saved screenshots/4_scraper_studio.png")
            break

    print("All screenshots successfully captured!")

finally:
    driver.quit()
