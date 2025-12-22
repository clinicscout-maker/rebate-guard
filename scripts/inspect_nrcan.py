import requests
import csv
import io

NRCAN_URL = "https://oee.nrcan.gc.ca/pml-lmp/index.cfm?action=app.download-telecharger&lang=en&appliance=ASHP_CC_SC"

def inspect_headers():
    print(f"Fetching data from {NRCAN_URL}...")
    try:
        response = requests.get(NRCAN_URL, timeout=30)
        response.raise_for_status()
        response.encoding = 'ISO-8859-1'
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    csv_content = response.text
    reader = csv.reader(io.StringIO(csv_content))
    
    # Print first 5 rows to see headers and some data
    for i, row in enumerate(reader):
        print(f"Row {i}: {row}")
        if i >= 5:
            break

if __name__ == "__main__":
    inspect_headers()
