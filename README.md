# 👋 Hi there  

I’m **Sarah** — [YouTube](https://www.youtube.com/@sarahliyt) | [Instagram](https://instagram.com/sarahli.mp3)

**Outfit98** is a nostalgic Windows 98–style outfit picker. Try it, remix it, and enjoy the retro vibes.  

---

## 🧠 What It Is  

A cozy Windows 98-inspired desktop app that lets you choose tops and bottoms, upload your own clothes, and see AI-generated outfit previews.  

---

## 🚀 Quick Start  

1. **Clone and install**
   ```bash
   git clone <your-fork-url> outfit98 && cd outfit98
   npm install

2. **Run the app**
```npm run dev```
Your retro window should pop up! 
Note: a electron popup might show up and not work so you can just open it in the browser.

The app works out of the box with a set of built-in outfits — no `.env` required.

3. **(Optional) Add your .env file**

The keys below unlock the *extra* features. The app runs fine without them — you just won't be able to upload your own clothes (Supabase) or generate AI previews (Google).
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_API_KEY=your_google_api_key
```
Then restart the app. See the sections below for how to set each one up. 

---

## 🧺 Supabase Setup (For Uploading Clothes)

To upload your own tops and bottoms, set up Supabase in a few easy steps:

### Step 1: Create a Project

Go to https://supabase.com, sign in, and click New Project.
Copy your Project URL and Anon Key — you’ll use them in your .env file.

### Step 2: Enable Storage

In your Supabase dashboard, go to Storage → Create bucket.
Name it clothing-images and make sure it’s public.

### Step 3 — Create a Table

Go to SQL Editor → New Query and paste this:

```
create table if not exists clothing_items (
  id bigint generated always as identity primary key,
  name text,
  category text check (category in ('tops','bottoms')),
  image_url text not null,
  created_at timestamp with time zone default now()
);

alter table clothing_items enable row level security;

create policy "anon can read" on clothing_items
for select using (true);

create policy "anon can insert" on clothing_items
for insert with check (true);
```

Then click Run.

### Step 4: Upload Your Clothes

Open the app, click the folder icon, then choose Upload Tops or Upload Bottoms.
Your images will upload to Supabase and appear in the carousel automatically.

If items don’t show, double-check that your bucket is public and the table policies are correct.

---

### 🤖 AI Outfit Previews 

Outfit98 generates realistic outfit previews using Google's **Gemini 2.5 Flash Image** ("Nano Banana") model, accessed through **[OpenRouter](https://openrouter.ai)**. This is optional — the app still runs with the built-in outfits without it.

Important: image generation is paid (a small cost per image, billed through your OpenRouter credits). OpenRouter also offers a rate-limited free tier of the model if you'd rather not pay.

### Step 1: Get an API Key

Go to https://openrouter.ai/keys, sign in, and create a key. Add some credits under **Settings → Credits** (or use the free model tier).

### Step 2: Add Your Key

Copy your key into the `.env` file:
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### Step 3 — Restart the App

Once you restart, click **Select** (with a top and bottom chosen) and the AI preview will generate onto the model.

> Want the free tier? Change the model id in `src/services/outfitGenerator.ts` from `google/gemini-2.5-flash-image` to `google/gemini-2.5-flash-image-preview:free`.

---

### 🧩 Built With

Electron · React · TypeScript · Vite · 98.css · Supabase · OpenRouter (Gemini 2.5 Flash Image)

---

###  🎬 Watch the Build

Watch on YouTube

Follow for more cozy coding projects → @sarahli.mp3

