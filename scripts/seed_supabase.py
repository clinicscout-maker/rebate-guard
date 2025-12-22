import os
import json
import time
from supabase import create_client, Client

JSON_FILE = "data/seeds/nrcan_cold_climate.json"
TABLE_NAME = "equipment"
BATCH_SIZE = 100

def load_env():
    env = {}
    path = ".env.local"
    if not os.path.exists(path):
        print(f"Warning: {path} not found.")
        return env
        
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"): continue
            
            # Remove 'export ' if present
            if line.startswith("export "):
                line = line[7:]
                
            if "=" in line:
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                env[k] = v
    return env

def seed_database():
    env = load_env()
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    # Try Service Role first, then Anon
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key:
        print("ERROR: Missing Supabase credentials.")
        print(f"  Found URL: {'Yes' if url else 'No'}")
        print(f"  Found Key: {'Yes' if key else 'No'}")
        print("Please check .env.local")
        return

    print(f"Connecting to Supabase at {url}...")
    try:
        supabase: Client = create_client(url, key)
    except Exception as e:
        print(f"Failed to create client: {e}")
        return

    # Load JSON
    if not os.path.exists(JSON_FILE):
        print(f"JSON file not found: {JSON_FILE}")
        return
        
    print(f"Loading data from {JSON_FILE}...")
    with open(JSON_FILE, 'r') as f:
        data = json.load(f)
    
    print(f"Found {len(data)} records.")
    
    # TRUNCATE / CLEANUP
    print("Cleaning existing data from 'equipment' table...")
    try:
        # Delete all records. We use a condition that is always true for existing records.
        # Assuming 'id' is not null.
        supabase.table(TABLE_NAME).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("Table cleaned.")
    except Exception as e:
        print(f"Cleanup warning (might be empty or RLS): {e}")

    # Prepare data for insertion
    # Map fields to DB schema. 
    # Assumptions based on 'search-equipment.ts' (id, brand, model_number)
    # and typical HVAC schemas (ahri_number, seer2, etc.)
    
    # We'll construct a list of dicts. 
    # Ideally, we should check what columns exist first to avoid 400 errors.
    # But standard Supabase insert might ignore extra keys if configured? 
    # No, it usually errors on unknown columns.
    
    # Let's try to map to a "Standard" schema we expect the User to have.
    # If this fails, we'll need to ask for the schema definition.
    
    cleaned_data = []
    
    # Track metrics for boolean flag
    for item in data:
        # User agreed to "List Membership" strategy:
        # If it's in this list, is_cold_climate = True
        
        row = {
            "brand": item.get("brand"),
            # Map outdoor_model to model_number (primary lookup)
            "model_number": item.get("outdoor_model"), 
            "indoor_model_number": item.get("indoor_model"),
            "ahri_number": item.get("ahri_ref"),
            "seer2": item.get("seer2", 0.0),
            "hspf2_region_v": item.get("hspf2_region_v", 0.0),
            "hspf2_region_iv": item.get("hspf2_region_iv", 0.0),
            "cop_at_minus_15": item.get("cop_at_-15c", 0.0),
            "is_cold_climate": True, # It's from the Cold Climate list
            "source": "NRCan_ASHP1_OHPA" 
        }
        
        # Remove empty keys if DB doesn't like them? 
        # Better to keep them as None/null depending on DB definition.
        # Let's clean empty strings to None
        for k, v in row.items():
            if v == "":
                row[k] = None
                
        cleaned_data.append(row)

    # Batch Insert
    total = len(cleaned_data)
    print(f"Starting insert of {total} records in batches of {BATCH_SIZE}...")
    
    success_count = 0
    error_count = 0
    
    for i in range(0, total, BATCH_SIZE):
        batch = cleaned_data[i: i + BATCH_SIZE]
        try:
            # upsert=True if we want to update duplicates? 
            # on_conflict="ahri_number" or "model_number"?
            # Let's try basic insert first, maybe upsert if needed.
            
            response = supabase.table(TABLE_NAME).upsert(batch).execute()
            
            # response.data might be the inserted rows
            success_count += len(batch)
            print(f"  Inserted {min(i + BATCH_SIZE, total)}/{total}")
            
        except Exception as e:
            print(f"  Error inserting batch {i}: {e}")
            error_count += 1
            # If schema mismatch, we fail fast
            if "column" in str(e) and "does not exist" in str(e):
                print("ABORTING: Database schema mismatch. Please add missing columns.")
                break
                
    print(f"Finished. Success: {success_count}, Errors: {error_count * BATCH_SIZE} (approx)")

if __name__ == "__main__":
    seed_database()
