import csv
import json
import os

RAW_CSV = "data/seeds/raw_nrcan.csv"
OUTPUT_FILE = "data/seeds/nrcan_cold_climate.json"

def reprocess():
    if not os.path.exists(RAW_CSV):
        print(f"Error: {RAW_CSV} not found.")
        return

    print(f"Reading {RAW_CSV}...")
    
    # Identify encoding - standard NRCan often ISO-8859-1 or utf-8-sig
    try:
        f = open(RAW_CSV, 'r', encoding='utf-8-sig')
        f.read(100)
        f.seek(0)
    except:
        f = open(RAW_CSV, 'r', encoding='ISO-8859-1')

    reader = csv.DictReader(f)
    print(f"Headers found: {reader.fieldnames}")
    
    # Normalize headers for safer lookup (strip spaces, lower)
    # Actually DictReader uses exact keys. Let's just use exact keys since we know them from 'head'.
    # Headers: ﻿Brand Name, Outside Model, Inside model, Furnace model, Rated heating capacity (Btu/hour), AHRI / Verification reference, ...
    
    # Mappings
    # Brand Name -> brand
    # Outside Model -> outdoor_model
    # Inside model -> indoor_model
    # AHRI / Verification reference -> ahri_ref
    
    processed_data = []
    
    for row in reader:
        # We need to handle potential BOM in key if strictly accessing
        # But commonly we iterates.
        
        # Helper to find key case-insensitive
        def get_val(key_part):
            for k in row.keys():
                if key_part.lower() in k.lower():
                    return row[k].strip()
            return ""

        brand = get_val("brand name")
        outdoor = get_val("outside model")
        indoor = get_val("inside model")
        ahri = get_val("ahri") or get_val("verification reference")
        
        if not ahri: continue
        
        # Metrics are missing in this CSV, so 0.0
        
        processed_data.append({
            "brand": brand,
            "outdoor_model": outdoor,
            "indoor_model": indoor,
            "ahri_ref": ahri,
            "seer2": 0.0,
            "hspf2_region_v": 0.0,
            "hspf2_region_iv": 0.0,
            "cop_at_-15c": 0.0
        })
        
    f.close()
    
    print(f"Saving {len(processed_data)} records...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=2)
    print("Done.")

if __name__ == "__main__":
    reprocess()
