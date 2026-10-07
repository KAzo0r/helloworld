from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from contextlib import asynccontextmanager

# Database setup
def init_db():
    conn = sqlite3.connect('hackathon.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS registrations
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         email TEXT NOT NULL,
         track TEXT NOT NULL,
         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
    ''')
    conn.commit()
    conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Registration(BaseModel):
    name: str
    email: str
    track: str

@app.post("/api/register")
async def register_participant(reg: Registration):
    try:
        conn = sqlite3.connect('hackathon.db')
        c = conn.cursor()
        c.execute("INSERT INTO registrations (name, email, track) VALUES (?, ?, ?)", 
                  (reg.name, reg.email, reg.track))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Регистрация успешна!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/registrations")
async def get_registrations():
    conn = sqlite3.connect('hackathon.db')
    c = conn.cursor()
    c.execute("SELECT name, email, track, timestamp FROM registrations")
    rows = c.fetchall()
    conn.close()
    return [{"name": r[0], "email": r[1], "track": r[2], "timestamp": r[3]} for r in rows]
