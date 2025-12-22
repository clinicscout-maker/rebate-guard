import os
from supabase import create_client, Client

# Load env variables manually or use dotenv if available
# I'll just try to read .env.local pattern
def load_env():
    env = {}
    if os.path.exists(".env.local"):
        with open(".env.local") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    env[k] = v.strip('"').strip("'")
    return env

env = load_env()
url = env.get("NEXT_PUBLIC_SUPABASE_URL")
key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Missing Supabase credentials in .env.local")
    exit(1)

supabase: Client = create_client(url, key)

print("Fetching one record from 'equipment' to inspect schema...")
try:
    response = supabase.table("equipment").select("*").limit(1).execute()
    if response.data:
        print("Schema Keys:", response.data[0].keys())
        print("Sample Data:", response.data[0])
    else:
        print("Table is empty or not accessible.")
except Exception as e:
    print(f"Error: {e}")
