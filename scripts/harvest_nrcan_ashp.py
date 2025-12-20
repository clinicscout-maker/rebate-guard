import requests
from bs4 import BeautifulSoup
import csv
import time
import os

# Configuration
BASE_URL = "https://spl-lpi.nrcan-rncan.gc.ca/en-US/product/"
PRODUCT_ID = "ASHP1_OHPA"
OUTPUT_FILE = "data/nrcan_ashp_raw.csv"

# Headers for the request
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5"
}

def get_page(page_num):
    """Fetches a single page of results."""
    params = {
        "product": PRODUCT_ID,
        "page": page_num
    }
    print(f"Fetching page {page_num}...")
    try:
        response = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return response.content
    except requests.exceptions.RequestException as e:
        print(f"Error fetching page {page_num}: {e}")
        return None

def parse_page(content, page_num):
    """Parses HTML content and extracts table data."""
    soup = BeautifulSoup(content, 'html.parser')
    
    # Identify the main table - looking for one with headers that match our expectations
    # or just the first substantial table
    tables = soup.find_all('table')
    target_table = None
    
    for table in tables:
        th_texts = [th.get_text(strip=True).lower() for th in table.find_all('th')]
        if "brand name" in th_texts or "model" in th_texts:
            target_table = table
            break
            
    if not target_table:
        print(f"No valid data table found on page {page_num}.")
        return [], []

    # Extract Headers if it's the first page
    headers = [th.get_text(strip=True) for th in target_table.find_all('th')]
    
    # Extract Rows
    rows_data = []
    tbody = target_table.find('tbody')
    if tbody:
        rows = tbody.find_all('tr')
        for row in rows:
            cols = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])]
            # Basic validation: ensure row has content
            if any(cols):
                rows_data.append(cols)
    
    return headers, rows_data

def scrape_nrcan():
    """Main scraping loop."""
    all_data = []
    headers = []
    page = 1
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    while True:
        content = get_page(page)
        if not content:
            break
            
        page_headers, page_rows = parse_page(content, page)
        
        if not page_rows:
            print(f"No data found on page {page}. Stopping.")
            break
            
        # Capture headers from the first page
        if page == 1:
            headers = page_headers
        
        # Verify headers match (optional but good for safety)
        # For now, we trust the structure is consistent
        
        all_data.extend(page_rows)
        print(f"Page {page}: Scraped {len(page_rows)} rows. Total: {len(all_data)}")
        
        # Pagination Check
        # Inspect for 'Next' button enablement or just reliance on empty table
        # Based on typical pagination, if we got rows, we try the next page.
        # But let's check for 'next' link to be sure we don't loop forever if empty pages return 200 with no table
        soup = BeautifulSoup(content, 'html.parser')
        next_link = soup.find('a', attrs={'aria-label': 'Next'}) # Common pattern, adjust if needed based on inspection
        # If explicit next button isn't found/disabled, we might rely on empty rows check above.
        # Let's inspect the pagination structure printed in the inspect script:
        # It's usually a list of links.
        # For safety, let's stop if < 25 rows (default page size often) or if we repeat data?
        # Let's trust the "No data found" check for now, but also check for typical "disabled" next button.
        
        # Basic rate limiting
        time.sleep(1) 
        page += 1

        # SAFETY LIMIT for testing - Remove this for full run
        if page > 5: # Start small to verify
             print("Hit safety limit of 5 pages. Stopping for verification.")
             break

    if all_data:
        print(f"Saving {len(all_data)} records to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if headers:
                writer.writerow(headers)
            writer.writerows(all_data)
        print("Done.")
    else:
        print("No data collected.")

if __name__ == "__main__":
    scrape_nrcan()
