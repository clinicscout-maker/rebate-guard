import requests
from bs4 import BeautifulSoup
import csv
import sys
import os

# Target URL for NRCan Air-Source Heat Pumps (Canada Greener Homes Grant eligible)
URL = "https://oee.nrcan-rncan.gc.ca/product/?product=ASHP1_GH"

def scrape_nrcan_data():
    """
    Scrapes the NRCan website for Heat Pump data.
    Note: This is a basic implementation. Real scraping might require handling pagination,
    form submissions, or dynamic content loading (e.g. via Selenium/Puppeteer) if straightforward GET requests fail.
    """
    print(f"Fetching data from {URL}...")
    
    try:
        # headers to mimic a browser
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
        }
        
        response = requests.get(URL, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # This selector is a best-guess based on standard NRCan table layouts.
        # Often data is in a table with id 'wb-auto-4' or similar, or just a generic table.
        # We will look for any table and try to identify columns.
        tables = soup.find_all('table')
        
        if not tables:
            print("No tables found on the page. The content might be dynamically loaded.")
            # Fallback: Create mock data for checking functionality if scraping fails
            # In a real scenario, we would use Selenium or inspect the network calls for the API.
            create_mock_data()
            return

        # Attempt to find the specific table
        target_table = None
        for table in tables:
            # Check for header keywords
            header_text = table.get_text().lower()
            if "outdoor" in header_text and "indoor" in header_text:
                target_table = table
                break
        
        if not target_table:
            print("Could not identify the specific product table. Using mock data.")
            create_mock_data()
            return

        print("Found potential data table. Extracting rows...")
        rows = target_table.find_all('tr')
        
        data = []
        # Basic parsing strategy - adjust indices based on actual table layout
        # Assuming headers are in first row
        headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
        print(f"Headers detected: {headers}")

        for row in rows[1:]:
            cols = row.find_all(['td', 'th'])
            cols_text = [ele.get_text(strip=True) for ele in cols]
            if len(cols_text) > 4: # concise check
                data.append(cols_text)
                
        print(f"Extracted {len(data)} rows.")
        
        # Save to CSV
        output_path = os.path.join(os.path.dirname(__file__), 'equipment.csv')
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(headers) # Write detected headers
            writer.writerows(data)
            
        print(f"Data saved to {output_path}")

    except Exception as e:
        print(f"Error occurred: {e}")
        print("Falling back to mock data generation.")
        create_mock_data()

def create_mock_data():
    """Genereates a mock CSV file for testing the frontend/validation logic."""
    print("Generating mock equipment.csv...")
    headers = ["Brand", "Outdoor Unit", "Indoor Unit", "SEER2", "HSPF2", "Region"]
    data = [
        ["Coolex", "GUL-36-OUT", "GUL-36-IN", "16.5", "8.2", "Canada"],
        ["HeatMaster", "HM-18-HP", "HM-18-AIR", "14.0", "7.0", "Canada"], # Should fail
        ["NordicComfort", "NC-24-CC", "NC-24-BL", "18.0", "9.5", "Canada"],
        ["CheapAir", "CA-12-X", "CA-12-Y", "20.0", "6.5", "Canada"], # HSPF fail
    ]
    
    output_path = os.path.join(os.path.dirname(__file__), 'equipment.csv')
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)
        writer.writerows(data)
    print(f"Mock data saved to {output_path}")

if __name__ == "__main__":
    scrape_nrcan_data()
