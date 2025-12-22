import requests
from bs4 import BeautifulSoup
import json
import os
import time

# Config
BASE_URL = "https://spl-lpi.nrcan-rncan.gc.ca/en-US/product/"
PRODUCT_ID = "HP.SplitSystemSingle"
OUTPUT_FILE = "data/seeds/nrcan_cold_climate.json"

HEADERS_REQ = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.5"
}

def get_page(page_num):
    params = {"product": PRODUCT_ID, "page": page_num}
    try:
        response = requests.get(BASE_URL, params=params, headers=HEADERS_REQ, timeout=30)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"Error fetching page {page_num}: {e}")
        return None

def standardize_row(headers, row_data):
    # Mapping dynamic headers to our keys
    # Helper to find index
    def get_idx(keywords):
        for idx, h in enumerate(headers):
            h_lower = h.lower()
            if all(k in h_lower for k in keywords):
                return idx
        return -1

    # Define indices once per page (optimization: do this outside but for safety we do it here or pass map)
    # Actually, let's map it based on pass headers
    
    # We need: brand, outdoor_model, indoor_model, ahri_ref, seer2, hspf2_region_v, hspf2_region_iv, cop_at_-15c
    
    def get_val(keywords, default=""):
        idx = get_idx(keywords)
        if idx != -1 and idx < len(row_data):
            return row_data[idx].strip()
        return default

    ahri_ref = get_val(["ahri", "reference"])
    if not ahri_ref: # Filter empty AHRI
        return None

    outdoor_model = get_val(["outdoor", "model"])
    indoor_model = get_val(["indoor", "model"])
    brand = get_val(["brand", "name"])
    
    # Numeric parsing
    def extract_float(keywords, default=0.0):
        val = get_val(keywords)
        if not val: return default
        try:
            return float(val.replace(',', ''))
        except:
            return default

    seer2 = extract_float(["seer2"])
    hspf2_v = extract_float(["hspf2", "region", "v"])
    hspf2_iv = extract_float(["hspf2", "region", "iv"])
    cop_15 = extract_float(["cop", "-15"])

    return {
        "brand": brand,
        "outdoor_model": outdoor_model,
        "indoor_model": indoor_model,
        "ahri_ref": ahri_ref,
        "seer2": seer2,
        "hspf2_region_v": hspf2_v,
        "hspf2_region_iv": hspf2_iv,
        "cop_at_-15c": cop_15
    }

def scrape_nrcan():
    all_rows = []
    page = 1
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    print(f"Starting scrape for {PRODUCT_ID}...")

    while True:
        content = get_page(page)
        if not content: break
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Find table
        tables = soup.find_all('table')
        target_table = None
        for table in tables:
            th_texts = [th.get_text(strip=True).lower() for th in table.find_all('th')]
            # Check if any header contains 'brand' AND any contains 'model'
            has_brand = any('brand' in t for t in th_texts)
            has_model = any('model' in t for t in th_texts)
            
            if has_brand and has_model:
                target_table = table
                break
        
        if not target_table:
            print(f"No matching data table on page {page}. (Headers check failed)")
            # Debug: Print headers of all tables
            for i, tbl in enumerate(tables):
                h = [th.get_text(strip=True) for th in tbl.find_all('th')]
                print(f"Table {i} Headers: {h}")
            break
            
        headers = [th.get_text(strip=True) for th in target_table.find_all('th')]
        print(f"Found Headers: {headers}") # DEBUG

        tbody = target_table.find('tbody')
        if not tbody: break
        
        rows = tbody.find_all('tr')
        if rows:
             # DEBUG: Print first row cols
             first_row = [td.get_text(strip=True) for td in rows[0].find_all(['td', 'th'])]
             print(f"First Row Data: {first_row}")

        tbody = target_table.find('tbody')
        if not tbody: break
        
        rows = tbody.find_all('tr')
        if not rows: 
            print("Empty tbody. Stopping.")
            break
            
        page_count = 0
        for row in rows:
            cols = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])] # Sometimes th in rows
            if not any(cols): continue
            
            data = standardize_row(headers, cols)
            if data:
                all_rows.append(data)
                page_count += 1
                
        print(f"Page {page}: Got {page_count} valid records. Total: {len(all_rows)}")
        
        # Pagination: Check for disabled Next button
        # <li class="page-item disabled"><a class="page-link" ... aria-label="Next" ...>
        # OR just rely on empty table/rows as above.
        # But NRCan often returns empty table on page N+1.
        # Let's check specifically for "Next" button state.
        
        nav = soup.find('nav', attrs={'aria-label': 'Pagination'})
        if nav:
            # Find the 'Next' link
            next_link = nav.find('a', string='›') # Or aria-label Next
            if not next_link:
                 next_link = nav.find('a', attrs={'aria-label': 'Next'})
            
            if next_link:
                # If parent li is disabled, stop
                parent = next_link.find_parent('li')
                if parent and ('disabled' in parent.get('class', [])):
                    print("Next button disabled. Stopping.")
                    break
        
        page += 1
        time.sleep(0.5)
        
        if page > 50: # Safety cap for testing, maybe user wants full? 
            # I'll set it high enough for "Cold Climate" which is smaller than "All".
            # But let's keep it robust.
            pass

    print(f"Saving {len(all_rows)} records to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_rows, f, indent=2)
    print("Done.")

if __name__ == "__main__":
    scrape_nrcan()
