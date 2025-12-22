import requests

BASE_URL = "https://oee.nrcan.gc.ca/pml-lmp/index.cfm"
APPLIANCE = "ASHP1_OHPA" # Oil to Heat Pump Affordability (likely Cold Climate)

actions = [
    "app.download-telecharger", 
    "app.download-downloaddata", 
    "app.search-recherche",
]

for action in actions:
    url = f"{BASE_URL}?action={action}&lang=en&appliance={APPLIANCE}"
    print(f"Testing: {url}")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        resp = requests.head(url, headers=headers, timeout=10, allow_redirects=True)
        ct = resp.headers.get("Content-Type", "")
        print(f"  Status: {resp.status_code}, Content-Type: {ct}")
        
        if "text/csv" in ct or "application/vnd.ms-excel" in ct or "text/plain" in ct:
            print("  [SUCCESS] Found probable CSV/Text stream!")
        elif "text/html" not in ct:
             print(f"  [INTERESTING] {ct}")
             
    except Exception as e:
        print(f"  Error: {e}")
