# Installation

## Local setup

### Requirements

- Node.js 20 or newer
- npm
- A Supabase project

### Environment file

Copy the example file to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in these values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `COLLAGIUM_ADMIN_PASSWORD`
- `COLLAGIUM_STORAGE_BUCKET` is optional and defaults to `collagium-images`

### Supabase setup

1. Open the Supabase SQL editor.
2. Run [supabase/schema.sql](supabase/schema.sql).
3. Create a storage bucket that matches `COLLAGIUM_STORAGE_BUCKET`.
4. Make sure files in that bucket can be read through public URLs.

### Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Local checks

Run these while the app is running:

```bash
curl -i http://localhost:3000/api/images
curl -i "http://localhost:3000/api/admin/images?status=pending"
curl -i "http://localhost:3000/api/admin/images?status=pending" \
  -H "x-collagium-admin-password: YOUR_PASSWORD"
```

Before deploying, run:

```bash
npm run lint
npm run build
```

## Railway deployment

1. Push the repository to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add the same environment variables you use locally.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` private.
5. Set a strong production value for `COLLAGIUM_ADMIN_PASSWORD`.
6. Deploy the project.

Railway should use these commands:

- Build: `npm run build`
- Start: `npm run start`

After deployment, check the Railway URL with:

```bash
curl -i https://YOUR_RAILWAY_DOMAIN/api/images
curl -i "https://YOUR_RAILWAY_DOMAIN/api/admin/images?status=pending"
```
