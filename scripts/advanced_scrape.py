import requests
import os

URL_BASE = "https://oee.nrcan.gc.ca/pml-lmp/index.cfm"
APPLIANCE = "ASHP1_OHPA"

def scrape_with_session():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    })

    # 1. Visit Search Page to init session
    print("1. Visiting search page...")
    search_url = f"{URL_BASE}?action=app.search-recherche&appliance={APPLIANCE}&lang=en"
    resp = session.get(search_url)
    print(f"   Status: {resp.status_code}")

    # 2. Perform Search (Empty criteria to get all)
    # Inspecting the form (mentally or via browser tools previously) suggests simple POST
    # We might need to handle form hidden fields later, but let's try basic first.
    print("2. Submitting search...")
    # Usually the form posts to the same URL or specific action
    # We'll assume it posts to action=app.search-recherche
    post_data = {
        "action": "app.search-recherche",
        "appliance": APPLIANCE,
        "lang": "en",
        # "submit": "Search" # standard?
    }
    resp = session.post(search_url, data=post_data)
    print(f"   Status: {resp.status_code}")

    # 3. Try Download with same session
    print("3. Attempting download...")
    download_url = f"{URL_BASE}?action=app.download-downloaddata&appliance={APPLIANCE}&lang=en"
    resp = session.get(download_url)
    ct = resp.headers.get("Content-Type", "")
    print(f"   Status: {resp.status_code}, Type: {ct}")
    
    if "text/csv" in ct or "text/plain" in ct:
        print("   [SUCCESS] CSV Data Found!")
        print(resp.text[:200]) # Preview
    else:
        print("   [FAIL] Still HTML")

if __name__ == "__main__":
    scrape_with_session()
