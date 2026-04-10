import json
import os
import re
import time
import urllib.error
import urllib.request
from pathlib import Path


MODEL = "gpt-4.1-mini"
API_URL = "https://api.openai.com/v1/chat/completions"
RECIPES_PATH = Path("recipes-data.js")
BATCH_SIZE = 15
SLEEP_SECONDS = 0.4
TAXONOMY = [
    "one-pot", "one-pan", "traybake", "pasta", "rice", "noodles", "soup", "stew", "salad", "flatbread",
    "pie", "bake", "braise", "roast", "grill", "fried", "crispy", "creamy", "brothy", "fresh", "cozy",
    "spicy", "herby", "tomatoey", "cheesy", "smoky", "saucy", "beans", "mushroom", "seafood", "chicken",
    "beef", "lamb", "pork", "sausage", "tofu", "paneer", "potato", "greens", "quick", "weeknight",
    "project", "party", "comfort", "bright", "british", "french", "italian", "spanish", "greek",
    "hungarian", "mexican", "caribbean", "indian", "persian", "japanese", "korean", "thai", "chinese",
    "vietnamese", "middle-eastern", "north-african"
]


def load_recipes():
    raw = RECIPES_PATH.read_text(encoding="utf-8")
    _, payload = raw.split("=", 1)
    payload = payload.strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    jsonish = re.sub(r'(^\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', payload, flags=re.MULTILINE)
    return json.loads(jsonish)


def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def build_recipe_brief(recipe):
    return {
        "id": recipe.get("id") or slugify(recipe["title"]),
        "title": recipe["title"],
        "cuisine": recipe.get("cuisine", ""),
        "summary": recipe.get("summary", ""),
        "moodTags": recipe.get("moodTags", []),
        "ingredients": recipe.get("ingredients", [])[:10],
        "steps": recipe.get("steps", [])[:6],
    }


def classify_batch(batch):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")

    schema = {
        "name": "recipe_search_features",
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "recipes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "id": {"type": "string"},
                            "searchFeatures": {
                                "type": "array",
                                "items": {"type": "string", "enum": TAXONOMY}
                            }
                        },
                        "required": ["id", "searchFeatures"]
                    }
                }
            },
            "required": ["recipes"]
        }
    }

    system_prompt = (
        "You assign search tags to recipes for a recipe discovery app. "
        "Choose only tags that are genuinely helpful and clearly supported by the recipe. "
        "Be reasonably comprehensive, but do not over-tag. "
        "Aim for roughly 5 to 12 tags per recipe. "
        "Use only the allowed taxonomy. "
        "Prefer tags that help users search for structure, texture, dish format, protein, or cuisine. "
        "Return only valid JSON matching the schema."
    )

    user_prompt = (
        f"Allowed taxonomy:\n{', '.join(TAXONOMY)}\n\n"
        "Tag the following recipes.\n"
        f"{json.dumps([build_recipe_brief(recipe) for recipe in batch], ensure_ascii=False)}"
    )

    body = json.dumps(
        {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": schema,
            },
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

    with urllib.request.urlopen(request, timeout=120) as response:
        payload = json.loads(response.read().decode("utf-8"))

    content = payload["choices"][0]["message"]["content"]
    return json.loads(content)["recipes"]


def write_recipes(recipes):
    RECIPES_PATH.write_text(
        "window.RECIPE_CACHE_DATA = " + json.dumps(recipes, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


def main():
    recipes = load_recipes()
    features_by_id = {}

    for start in range(0, len(recipes), BATCH_SIZE):
        batch = recipes[start:start + BATCH_SIZE]
        attempt = 0
        while True:
            attempt += 1
            try:
                results = classify_batch(batch)
                break
            except urllib.error.HTTPError as error:
                detail = error.read().decode("utf-8", errors="ignore")
                if attempt >= 3:
                    raise RuntimeError(f"Search feature annotation failed: {detail or error.reason}") from error
                time.sleep(2 * attempt)
            except Exception:
                if attempt >= 3:
                    raise
                time.sleep(2 * attempt)

        for item in results:
            unique = []
            for tag in item["searchFeatures"]:
                if tag not in unique:
                    unique.append(tag)
            features_by_id[item["id"]] = unique

        print(f"Tagged {min(start + BATCH_SIZE, len(recipes))}/{len(recipes)} recipes...")
        time.sleep(SLEEP_SECONDS)

    for recipe in recipes:
        recipe_id = recipe.get("id") or slugify(recipe["title"])
        recipe["searchFeatures"] = features_by_id.get(recipe_id, [])

    write_recipes(recipes)
    print(f"Wrote explicit searchFeatures for {len(recipes)} recipes.")


if __name__ == "__main__":
    main()
