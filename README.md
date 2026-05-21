<<<<<<< HEAD
# Car Tender Web System

A full-stack car tender management system built with React, Node.js, and SQLite.

## Features
- **Public**: Browse open tenders, view car specs, download documents, and view videos.
- **Admin**: Manage tenders (CRUD), toggle status (open/closed/draft), and upload media.
- **Security**: JWT authentication for admin access, bcrypt password hashing.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express, better-sqlite3, Multer.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
Install dependencies for both client and server:
```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Database Seeding
Create the database and seed the default admin account:
```bash
cd server
npm run seed
```
**Default Admin Credentials:**
- **Username**: admin
- **Password**: admin123

### 4. Running the Application
Run both frontend and backend concurrently from the root directory:
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## Project Structure
- `/client`: React frontend
- `/server`: Express backend
- `/server/uploads`: Local storage for images, videos, and documents
=======
# Auto-Tender
>>>>>>> bb6061593028f7821dc3d270e21dc34bf9a52619
