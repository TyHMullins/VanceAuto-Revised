
# Vance Auto Static Site (with Inventory)

This is a static rebuild of vanceauto.com with an added inventory system powered by a JSON file.

## Files
- `index.html` – Home
- `inventory.html` – Inventory browser (reads `data/inventory.json`)
- `admin.html` – Offline helper to build/export `inventory.json` (no server needed)
- `location.html`, `contact.html`, `privacy.html`, `terms.html` – Supporting pages
- `assets/` – CSS/JS and placeholder image
- `data/inventory.json` – Vehicle data

## How to update inventory
1. Open `admin.html` in your browser (locally is fine).
2. Add vehicles and click **Download JSON**.
3. Upload the downloaded `inventory.json` to your server at `data/inventory.json` (replace the existing file).
4. Refresh `inventory.html` to see changes.

## Vehicle JSON format
Each vehicle is an object with keys like:
```json
{
  "id": "stk-101",
  "year": 2016,
  "make": "Toyota",
  "model": "Camry",
  "trim": "SE",
  "price": 11995,
  "mileage": 97850,
  "body": "Sedan",
  "transmission": "Automatic",
  "drivetrain": "FWD",
  "exterior": "White",
  "interior": "Black",
  "vin": "4T1BF1FK1GU123456",
  "stock": "101",
  "images": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
  "features": ["Bluetooth", "Backup Camera"],
  "description": "Good condition.",
  "createdAt": "2025-08-19T12:00:00.000Z"
}
```
> `images` can point to absolute URLs (e.g., from your CDN) or files you host in `assets/img/`.

## Deploy
- Upload the entire folder to your hosting provider.
- Make sure `data/inventory.json` is publicly readable.
- No build step or backend required.

## Notes
- This is intentionally minimal so you can overhaul later.
- If you want a true admin (username/password + image upload), you'll need a small backend or a Git-backed CMS like Netlify CMS.
