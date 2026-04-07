import json
import os
import re
import urllib.request
from pathlib import Path


MODEL = "text-embedding-3-small"
DIMENSIONS = 256
RECIPES_PATH = Path("recipes-data.js")
OUTPUT_PATH = Path("recipe-embeddings.js")
API_URL = "https://api.openai.com/v1/embeddings"


def load_recipes():
    raw = RECIPES_PATH.read_text(encoding="utf-8")
    _, payload = raw.split("=", 1)
    payload = payload.strip()
    if payload.endswith(";"):
      payload = payload[:-1]
    jsonish = re.sub(r'(^\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', payload, flags=re.MULTILINE)
    return json.loads(jsonish)


def build_embedding_input(recipe):
    parts = [
        recipe["title"],
        recipe["cuisine"],
        recipe["summary"],
        "Mood tags: " + ", ".join(recipe.get("moodTags", [])),
        "Ingredients: " + ", ".join(recipe.get("ingredients", [])),
        "Steps: " + " ".join(recipe.get("steps", [])),
    ]
    return "\n".join(part for part in parts if part.strip())


def fetch_embeddings(texts):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")

    body = json.dumps(
        {
            "input": texts,
            "model": MODEL,
            "dimensions": DIMENSIONS,
            "encoding_format": "float",
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=60) as response:
        payload = json.loads(response.read().decode("utf-8"))

    return [item["embedding"] for item in payload["data"]]


def main():
    recipes = load_recipes()
    texts = [build_embedding_input(recipe) for recipe in recipes]
    embeddings = fetch_embeddings(texts)

    payload = {
        "model": MODEL,
        "dimensions": DIMENSIONS,
        "vectors": {
            re.sub(r"[^a-z0-9]+", "-", recipe["title"].lower()).strip("-"): [round(value, 6) for value in embedding]
            for recipe, embedding in zip(recipes, embeddings)
        },
    }

    OUTPUT_PATH.write_text(
        "window.RECIPE_EMBEDDINGS = " + json.dumps(payload, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote embeddings for {len(recipes)} recipes to {OUTPUT_PATH}.")


if __name__ == "__main__":
    main()
