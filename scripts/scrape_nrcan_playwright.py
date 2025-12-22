import asyncio
import json
import os
import re
from playwright.async_api import async_playwright

# Config
BASE_URL = "https://spl-lpi.nrcan-rncan.gc.ca/en-US/product/?product=ASHP1_OHPA"
OUTPUT_FILE = "data/seeds/nrcan_cold_climate.json"

async def scrape_nrcan_playwright():
    print("Starting NRCan Scraper (Playwright) - List Membership Mode...")
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    all_data = []

    async with async_playwright() as p:
        # Launch browser (headless=True default, use False to see it for debugging)
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
             user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        print(f"Navigating to {BASE_URL}...")
        try: 
            await page.goto(BASE_URL, timeout=60000)
        except Exception as e:
            print(f"Navigation error: {e}")
            await browser.close()
            return
            
        print("Waiting for data table...")
# ... (rest of the file remains similar regarding button logic, just ensuring URL is back)

# ... (We keep the download logic identical as it was working for ASHP1_OHPA)
        try:
            await page.wait_for_selector("table", timeout=30000)
        except Exception as e:
            print(f"Timeout waiting for table: {e}")
            await browser.close()
            return

        # Extract Headers first (Assume they don't change)
        # We need to find the specific table. 
        # Strategy: Find table with 'Model' or 'Brand' in header
        headers = []
        target_table_loc = None
        
        tables = await page.locator("table").all()
        for table in tables:
            header_texts = await table.locator("th").all_inner_texts()
            # fuzzy check
            h_str = " ".join([h.lower() for h in header_texts])
            if "model" in h_str and "brand" in h_str:
                target_table_loc = table
                headers = [h.strip() for h in header_texts]
                print(f"Found Headers: {headers}")
                break
        
        if not target_table_loc:
            print("Could not locate data table, but checking for download button...")

        # Try to find and click Download CSV button
        try:
            # Wait for button to be potentially interactable
            # ID from debug HTML: #download-csv
            download_btn = page.locator("#download-csv")
            await download_btn.wait_for(state="visible", timeout=10000)
            
            print("Found Download CSV button! Clicking...")
            
            # Setup download listener with LONG timeout (5 mins) for large files
            async with page.expect_download(timeout=300000) as download_info:
                await download_btn.click()
            
            print("Download started... waiting for completion...")
            download = await download_info.value
            
            # Save to temporary path first
            temp_path = os.path.join(os.path.dirname(OUTPUT_FILE), "raw_nrcan.csv")
            await download.save_as(temp_path)
            print(f"Downloaded CSV to {temp_path}")
            
            # Close browser quickly to free resources
            await browser.close()
            
            # Now process the CSV
            import csv
            
            print("Processing downloaded CSV...")
            with open(temp_path, 'r', encoding='ISO-8859-1') as f:
                # Read content to check headers (dictreader might need clean keys)
                # Filter null bytes if any
                content = f.read().replace('\0', '')
                
            from io import StringIO
            reader = csv.reader(StringIO(content))
            headers = next(reader)
            print(f"CSV Headers: {headers}")
            
            processed_data = []
            
            # Map headers dynamically
            # We need standardizer logic here again
            
            for row in reader:
               if not row: continue
               # Create a mock dict for existing standardizer
               # or just rewrite extractor
               
               # Helper to get by header name
               def get_col(name_keywords):
                   for i, h in enumerate(headers):
                       if all(k in h.lower() for k in name_keywords):
                           return row[i] if i < len(row) else ""
                   return ""
               
               # Required
               ahri = get_col(["ahri"]) or get_col(["reference"])
               if not ahri: continue
               
               brand = get_col(["brand"])
               outdoor = get_col(["outdoor"])
               indoor = get_col(["indoor"])
               
               def parse_f(val):
                   try: return float(val.replace(',', '').replace(' ', ''))
                   except: return 0.0

               seer2 = parse_f(get_col(["seer2"]))
               hspf2_v = parse_f(get_col(["hspf2", "region", "v"]))
               
               # Try various Region IV headers
               hspf2_iv = parse_f(get_col(["hspf2", "region", "iv"]))
               if hspf2_iv == 0: hspf2_iv = parse_f(get_col(["hspf2", "region", "4"]))
               
               cop15 = parse_f(get_col(["cop", "-15"]))
               if cop15 == 0: cop15 = parse_f(get_col(["cop", "15"]))

               processed_data.append({
                    "brand": brand,
                    "outdoor_model": outdoor,
                    "indoor_model": indoor,
                    "ahri_ref": ahri,
                    "seer2": seer2,
                    "hspf2_region_v": hspf2_v,
                    "hspf2_region_iv": hspf2_iv,
                    "cop_at_-15c": cop15
               })

            print(f"saving {len(processed_data)} records to {OUTPUT_FILE}...")
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(processed_data, f, indent=2)
            print("Done.")
            
            return

        except Exception as e:
            print(f"Download blocked or failed: {e}")
            # If download fails, we fall back to row scraping?
            # But we know row scraping is useless without columns.
            # So we stick to reporting failure if download fails.
            pass

        # ... (Removed row scraping loop as it was useless) ...
        
        await browser.close()

def standardize_row(headers, row_data):
    # Map index
    def get_idx(keywords):
        for idx, h in enumerate(headers):
            h_lower = h.lower()
            if all(k in h_lower for k in keywords):
                return idx
        return -1

    def get_val(keywords, default=""):
        idx = get_idx(keywords)
        if idx != -1 and idx < len(row_data):
            return row_data[idx]
        return default

    # Required Columns
    ahri = get_val(["ahri", "reference"]) or get_val(["reference"])
    if not ahri: return None

    # Brand / Model
    brand = get_val(["brand"])
    outdoor = get_val(["outdoor", "model"])
    indoor = get_val(["indoor", "model"])
    
    # Metrics
    # Handle numbers: "12,000" -> 12000.0
    def parse_float(val):
        if not val: return 0.0
        try:
            return float(val.replace(",", "").replace(" ", ""))
        except:
            return 0.0

    seer2 = parse_float(get_val(["seer2"]))
    hspf2_v = parse_float(get_val(["hspf2", "region", "v"]))
    
    # Region IV (often combined or specific col)
    # If explicit col exists:
    hspf2_iv = parse_float(get_val(["hspf2", "region", "iv"]))
    if hspf2_iv == 0.0:
        # Fallback? Maybe it's "HSPF Region 4"?
        hspf2_iv = parse_float(get_val(["hspf2", "region", "4"]))

    # COP @ -15 (Crucial)
    # Header likely "COP at -15°C (5°F) at max" or similar
    cop15 = parse_float(get_val(["cop", "-15"]))
    if cop15 == 0.0:
         cop15 = parse_float(get_val(["cop", "15"])) # fuzzy

    return {
        "brand": brand,
        "outdoor_model": outdoor,
        "indoor_model": indoor,
        "ahri_ref": ahri,
        "seer2": seer2,
        "hspf2_region_v": hspf2_v,
        "hspf2_region_iv": hspf2_iv,
        "cop_at_-15c": cop15
    }

if __name__ == "__main__":
    asyncio.run(scrape_nrcan_playwright())
