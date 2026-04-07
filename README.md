# Palette

A lightweight prototype recipe app built with plain HTML, CSS, JavaScript, and a small Python server.

## What is included

- A clean black-and-white culinary UI
- 100 cached recipes with authored ingredients and cooking steps
- Difficulty plus semantic vibe search
- Difficulty-aware treadmill prompt suggestions
- Recipe cards with thumbnails, detail view, shopping list, and saved recipes
- Full-screen step-by-step cooking mode
- AI-powered `Alter recipe` flow backed by the OpenAI API

## Run locally

Start the local server:

```powershell
python server.py
```

Then open:

```text
http://127.0.0.1:8000
```

To regenerate the cached recipe embeddings after changing the recipe cache:

```powershell
python build_recipe_embeddings.py
```

## Deploy as a web app

This repo is now set up for Render with GitHub auto-deploy via [render.yaml](./render.yaml).

Recommended flow:

1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from that GitHub repo.
3. Set the `OPENAI_API_KEY` environment variable in Render.
4. Keep auto-deploy enabled.

After that, pushes to the connected branch will automatically redeploy the live app.

## Notes

Recipe instructions should be stored in their final play-screen form at cache-generation time. Do not layer extra instructional text on top of shorter placeholder steps at runtime.

The recipe cache lives in [recipes-data.js](./recipes-data.js), and the precomputed recipe vectors live in [recipe-embeddings.js](./recipe-embeddings.js).

Semantic ranking uses the precomputed recipe embeddings when the Python server is running. If the embedding endpoint is unavailable, the app falls back to a local lexical ranking.
