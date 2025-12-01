import json
import os
import sys

# Add current directory to sys.path so we can import main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

def export_openapi():
    """
    Export the OpenAPI schema to a JSON file.
    This file can be used by frontend tools (like orval or openapi-typescript)
    to auto-generate strict TypeScript types.
    """
    print("🔄 Generating OpenAPI Schema...")
    
    openapi_data = app.openapi()
    
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "openapi.json")
    
    with open(output_path, "w") as f:
        json.dump(openapi_data, f, indent=2)
        
    print(f"✅ Schema exported to: {output_path}")

if __name__ == "__main__":
    export_openapi()
