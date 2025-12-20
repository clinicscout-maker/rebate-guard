import requests
from bs4 import BeautifulSoup

# Try the main entry point first to see if we can get a session or just access it
URL_MAIN = "https://spl-lpi.nrcan-rncan.gc.ca/en-US/product/?product=ASHP1_OHPA&page=1"
URL_DIRECT = "https://spl-lpi.nrcan-rncan.gc.ca/en-US/product/?product=ASHP1_OHPA"

def inspect_page():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive"
    }
    
    print(f"Fetching {URL_MAIN}...")
    try:
        session = requests.Session()
        session.headers.update(headers)
        
        response = session.get(URL_MAIN, timeout=15)
        print(f"Main Page Status: {response.status_code}")
        
        if response.status_code == 200:
            print("Successfully accessed main search page.")
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Print title to confirm page content
            print(f"Page Title: {soup.title.string.strip() if soup.title else 'No Title'}")
            
            # Look for ANY download links
            links = soup.find_all('a', href=True)
            print(f"Found {len(links)} links. Scanning for keywords (csv, xls, download, report)...")
            
            download_found = False
            for link in links:
                href = link['href'].lower()
                text = link.get_text(strip=True).lower()
                if any(x in href or x in text for x in ['csv', 'xls', 'download', 'report', 'liste', 'export']):
                    print(f"POTENTIAL DOWNLOAD: {link.get_text(strip=True)} -> {link['href']}")
                    download_found = True
            
            if not download_found:
                print("No obvious download links found.")
                
            # Print distinct appliance links to verify category
            print("\nScanning for 'product' links:")
            for link in links:
                if 'product=' in link['href']:
                     print(f"Product Link: {link.get_text(strip=True)} -> {link['href']}")

            # Do NOT try to fetch the data page again if it failed before, just stop here.


    except Exception as e:
        print(f"Error: {e}")

def parse_table(content):
    soup = BeautifulSoup(content, 'html.parser')
    tables = soup.find_all('table')
    print(f"Found {len(tables)} tables on data page.")
    
    for i, table in enumerate(tables):
        print(f"\n--- Table {i} ---")
        headers = [th.get_text(strip=True) for th in table.find_all('th')]
        print(f"Headers: {headers}")
        
        tbody = table.find('tbody')
        if tbody:
            rows = tbody.find_all('tr')
            print(f"Rows in body: {len(rows)}")
            if rows:
                cols = [td.get_text(strip=True) for td in rows[0].find_all(['td', 'th'])]
                print(f"Sample Row: {cols}")

    # Pagination
    pagination = soup.find(class_='pagination')
    if pagination:
        print("\nPagination found.")
        print(pagination.get_text(strip=True)[:100] + "...")
    else:
        print("\nNo pagination class found.")

if __name__ == "__main__":
    inspect_page()
