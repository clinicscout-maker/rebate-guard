import requests
from bs4 import BeautifulSoup
import json
import time
import random
import argparse
import sys
import os

# Configuration
URL = "https://oee.nrcan-rncan.gc.ca/product/?product=ASHP1_GH"
OUTPUT_FILE = "rebate_guard_data.json"

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/115.0"
]

def get_random_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive"
    }

def clean_text(text):
    if not text:
        return ""
    return text.strip()

def parse_html_content(content, source_name=""):
    print(f"Parsing content from: {source_name}")
    soup = BeautifulSoup(content, 'html.parser')
    
    # Try to locate the main data table
    table = soup.find('table')
    if not table:
         # Fallback to id specific if needed
         table = soup.find(id="wb-auto-4")
    
    if not table:
        print("ERROR: No data table found.")
        return [], None
        
    # Extract headers
    headers = []
    header_row = table.find('thead')
    if header_row:
        headers = [th.get_text(strip=True).lower() for th in header_row.find_all('th')]
    else:
        # Check first tr
        first_tr = table.find('tr')
        if first_tr:
             headers = [th.get_text(strip=True).lower() for th in first_tr.find_all(['th', 'td'])]

    print(f"Detected Headers: {headers}")
    
    # map headers to keys
    header_map = {
        'brand': -1,
        'outdoor': -1,
        'indoor': -1,
        'ahri': -1,
        'seer2': -1,
        'hspf2': -1,
        'climate': -1
    }
    
    for idx, h in enumerate(headers):
        if 'brand' in h: header_map['brand'] = idx
        elif 'outdoor' in h: header_map['outdoor'] = idx
        elif 'indoor' in h: header_map['indoor'] = idx
        elif 'ahri' in h: header_map['ahri'] = idx
        elif 'seer2' in h: header_map['seer2'] = idx
        elif 'hspf2' in h: header_map['hspf2'] = idx
        elif 'cold' in h or 'climate' in h: header_map['climate'] = idx

    print(f"Header Map: {header_map}")
    
    results = []
    tbody = table.find('tbody')
    rows = tbody.find_all('tr') if tbody else table.find_all('tr')[1:]
    
    for row in rows:
        cols = [ele.get_text(strip=True) for ele in row.find_all(['td', 'th'])]
        if len(cols) < max(header_map.values(), default=0):
            continue
            
        entry = {
            "Brand": cols[header_map['brand']] if header_map['brand'] != -1 else "",
            "Outdoor_Model": cols[header_map['outdoor']] if header_map['outdoor'] != -1 else "",
            "Indoor_Model": cols[header_map['indoor']] if header_map['indoor'] != -1 else "",
            "AHRI_Ref_Number": cols[header_map['ahri']] if header_map['ahri'] != -1 else "",
            "SEER2": cols[header_map['seer2']] if header_map['seer2'] != -1 else "",
            "HSPF2": cols[header_map['hspf2']] if header_map['hspf2'] != -1 else "",
            "Cold_Climate_Designation": cols[header_map['climate']] if header_map['climate'] != -1 else "No"
        }
        results.append(entry)
        
    print(f"Extracted {len(results)} records.")
    
    # Check for next page
    next_link = None
    pagination = soup.find(class_='pagination')
    if pagination:
        # Search for 'next' link
        n_link = pagination.find('a', attrs={'rel': 'next'})
        if not n_link:
             # loose text search
             n_link = pagination.find('a', string=lambda t: t and 'next' in t.lower())
        
        if n_link and n_link.get('href'):
            next_link = n_link.get('href')
            if not next_link.startswith('http'):
                 next_link = "https://oee.nrcan-rncan.gc.ca" + next_link
    
    return results, next_link

def harvest_web():
    all_data = []
    current_url = URL
    page_count = 0
    
    session = requests.Session()
    session.headers.update(get_random_headers())
    
    try:
        while current_url and page_count < 10: # Limit pages for demo
            page_count += 1
            print(f"Fetching Page {page_count}: {current_url}")
            
            # Random delay
            time.sleep(random.uniform(2.0, 5.0))
            
            response = session.get(current_url, timeout=20)
            if response.status_code != 200:
                print(f"Failed to fetch page: {response.status_code}")
                break
                
            data, next_url = parse_html_content(response.content, f"Page {page_count}")
            all_data.extend(data)
            
            if next_url:
                current_url = next_url
            else:
                print("No next page found.")
                break
                
    except Exception as e:
        print(f"Network Extraction Error: {e}")
        
    return all_data

def harvest_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        data, _ = parse_html_content(content, "Local File")
        return data
    except Exception as e:
        print(f"File Error: {e}")
        return []

def main():
    parser = argparse.ArgumentParser(description="RebateGuard Data Harvester")
    parser.add_argument('--file', help="Path to local HTML file to parse (for testing/offline)")
    args = parser.parse_args()
    
    data = []
    if args.file:
        print(f"Running in OFFLINE mode using {args.file}")
        data = harvest_file(args.file)
    else:
        print("Running in ONLINE mode")
        data = harvest_web()
        
    print(f"Total Records Collected: {len(data)}")
    
    # Save to JSON
    output_path = os.path.join(os.path.dirname(__file__), '..', OUTPUT_FILE)
    output_path = os.path.abspath(output_path)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print(f"Data saved to {output_path}")

if __name__ == "__main__":
    main()
