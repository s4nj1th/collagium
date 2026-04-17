# Setup Guide

Welcome to the installation guide for the Collagium Creative Workstation. Follow these steps to get your local environment ready for creation.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)
- A **Supabase** account (Free tier works perfectly)

## Step 1: Clone the Repository

Open your terminal and pull the latest code:

```bash
git clone https://github.com/s4nj1th/collagium.git
cd collagium
```

## Step 2: Install Dependencies

We use a streamlined set of high-performance libraries (Konva, Zustand, Supabase):

```bash
npm install
```

## Step 3: Configure Environment

Copy the example environment file and fill in your unique project keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your details:

- `NEXT_PUBLIC_SUPABASE_URL`: Found in Project Settings > API.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Project Settings > API.
- `SUPABASE_SERVICE_ROLE_KEY`: Required for admin operations (Keep this secret!).
- `COLLAGIUM_ADMIN_PASSWORD`: A unique password for accessing `/admin`.
- `COLLAGIUM_STORAGE_BUCKET`: Create a public bucket in Supabase Storage named `images`.

## Step 4: Prepare the Database

1. Go to the **SQL Editor** in your Supabase dashboard.
2. Content from `supabase/schema.sql` (found in the root of this repo) and run it. This will create the `images` table and necessary security policies.

## Step 5: Launch the Station

Now, ignite the local server:

```bash
npm run dev
```

Your workstation is now live at **localhost:3000**!

---

## Verification

To ensure everything is working correctly:

1. Visit the home page and try selecting a small photo.
2. Drag it around, rotate it, and click "Add to Board".
3. Navigate to `/admin`, enter your password, and verify the pending submission appears.
4. Approve the item and watch it appear on the main canvas in real-time.
