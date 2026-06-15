from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import datetime

# Note: In a production environment with Supabase, you would import supabase client
from supabase import create_client, Client
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
if url and key:
    supabase: Client = create_client(url, key)
else:
    supabase = None

app = FastAPI(title="Varunexa Technology API", description="API for Varunexa Portfolio")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to Netlify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    business: Optional[str] = None
    requirements: str

@app.post("/api/contact")
async def submit_contact(form: ContactForm):
    try:
        # Validate data
        if len(form.name) < 2:
            raise HTTPException(status_code=400, detail="Name is too short")
        if len(form.requirements) < 10:
            raise HTTPException(status_code=400, detail="Requirements description is too short")
            
        # Here you would typically insert into Supabase:
        if supabase:
            data = {
                "name": form.name,
                "email": form.email,
                "phone": form.phone,
                "business": form.business,
                "requirements": form.requirements,
                "created_at": datetime.datetime.now().isoformat()
            }
            supabase.table("contacts").insert(data).execute()

        
        # Simulated success
        return {
            "status": "success", 
            "message": "Contact form submitted successfully",
            "data_received": {
                "name": form.name,
                "email": form.email
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Varunexa API"}
