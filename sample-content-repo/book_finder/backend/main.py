from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"

@app.get("/")
def read_root():
    return {"message": "Welcome to the Book Finder API"}

@app.get("/search")
def search_books(query: str = Query(..., min_length=1)):
    # Search for books using the Google Books API.
    params = {"q": query}
    try:
        logger.info(f"Searching for: {query}")
        response = requests.get(GOOGLE_BOOKS_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        items = data.get("items", [])
        results = []
        for item in items:
            info = item.get("volumeInfo", {})
            image_links = info.get("imageLinks", {})
            thumbnail = image_links.get("thumbnail", "") if image_links else ""
            
            # Fallback for missing authors
            authors = info.get("authors", ["Unknown Author"])
            
            results.append({
                "id": item.get("id"),
                "title": info.get("title", "Unknown Title"),
                "authors": authors,
                "description": info.get("description", "No description available."),
                "thumbnail": thumbnail
            })
            
        return {"results": results}
    except requests.RequestException as e:
        logger.error(f"External API error: {e}")
        raise HTTPException(status_code=503, detail="External API unavailable")
    except Exception as e:
        logger.error(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")