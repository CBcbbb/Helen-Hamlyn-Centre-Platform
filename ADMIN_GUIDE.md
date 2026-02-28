# Admin Panel - Local Development Guide

## How to run locally with direct save (no file download):

### Option 1: Run both servers together (Recommended)
```bash
npm run dev
```
This will start:
- Frontend on http://localhost:3000
- API server on http://localhost:3001

### Option 2: Run separately in two terminals
Terminal 1:
```bash
npm run start:api
```

Terminal 2:
```bash
npm start
```

## Usage:
1. Go to http://localhost:3000/admin
2. Login with password: hhcfd2025
3. Edit data
4. Click "Save All Changes"
5. Refresh http://localhost:3000 to see changes ✅

## Production (Vercel):
When deployed to Vercel, it will automatically save without needing the local API server.
