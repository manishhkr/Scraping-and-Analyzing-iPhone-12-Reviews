from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd

def scrape_reviews(url):
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(service=service, options=options)

    reviews = []
    
    while True:
        driver.get(url)

        try:
            # Wait for the reviews to load
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-hook='review']")))
            review_elements = driver.find_elements(By.CSS_SELECTOR, "div[data-hook='review']")

            for review in review_elements:
                title = review.find_element(By.CSS_SELECTOR, "a[data-hook='review-title']").text.strip()
                text = review.find_element(By.CSS_SELECTOR, "span[data-hook='review-body']").text.strip()
                storage_size = "128GB"
                color = "Black"
                verified_purchase = "Verified Purchase" in review.text

                reviews.append({
                    'Review Title': title,
                    'Review Text': text,
                    'Storage Size': storage_size,
                    'Colour': color,
                    'Verified Purchase': verified_purchase
                })

            # Check for next page
            next_button = driver.find_elements(By.CSS_SELECTOR, "li.a-last a")
            if next_button:
                next_button[0].click()
            else:
                break  # No more pages

        except Exception as e:
            print(f"Error: {e}")
            break

    driver.quit()

    if reviews:
        df = pd.DataFrame(reviews)
        df.to_csv('iphone_12_reviews.csv', index=False)
        print("Scraping completed, data saved to iphone_12_reviews.csv")
    else:
        print("No reviews found.")

if __name__ == '__main__':
    scrape_reviews("https://www.amazon.in/Apple-New-iPhone-12-128GB/dp/B08L5TNJHG/")
