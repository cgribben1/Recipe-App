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
BATCH_SIZE = 20
SLEEP_SECONDS = 0.4


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
        "summary": recipe.get("summary", ""),
        "cuisine": recipe.get("cuisine", ""),
        "ingredientsCount": len(recipe.get("ingredients", [])),
        "stepCount": len(recipe.get("steps", [])),
        "prepTime": int(recipe.get("prepTime") or 0),
        "cookTime": int(recipe.get("cookTime") or 0),
        "ingredients": recipe.get("ingredients", [])[:10],
        "steps": recipe.get("steps", [])[:6],
    }


def classify_batch(batch):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")

    schema = {
        "name": "recipe_difficulty_labels",
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
                            "difficulty": {"type": "string", "enum": ["easy", "medium", "hard"]},
                            "reason": {"type": "string"}
                        },
                        "required": ["id", "difficulty", "reason"]
                    }
                }
            },
            "required": ["recipes"]
        }
    }

    system_prompt = (
        "You classify recipe difficulty for a consumer cooking app. "
        "Your labels are easy, medium, or hard. "
        "Be realistic and slightly conservative: if a recipe is borderline, prefer the harder label rather than the easier one. "
        "Only call a recipe easy if it is genuinely easy for an average home cook on a normal weeknight. "
        "Consider total time, number of ingredients, number of steps, coordination, technique, and whether the dish asks the cook to manage multiple components. "
        "Return only valid JSON matching the schema."
    )

    user_prompt = (
        "Classify each recipe below.\n\n"
        "Guidance:\n"
        "- easy: genuinely simple, low coordination, short or straightforward cooking\n"
        "- medium: moderate effort, some coordination or technique, but very achievable\n"
        "- hard: notable project, more technique, more time, or multiple moving parts\n\n"
        f"Recipes:\n{json.dumps([build_recipe_brief(recipe) for recipe in batch], ensure_ascii=False)}"
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
    labels_by_id = {}

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
                    raise RuntimeError(f"Difficulty relabel request failed: {detail or error.reason}") from error
                time.sleep(2 * attempt)
            except Exception:
                if attempt >= 3:
                    raise
                time.sleep(2 * attempt)

        for item in results:
            labels_by_id[item["id"]] = item["difficulty"]

        print(f"Labeled {min(start + BATCH_SIZE, len(recipes))}/{len(recipes)} recipes...")
        time.sleep(SLEEP_SECONDS)

    for recipe in recipes:
        recipe_id = recipe.get("id") or slugify(recipe["title"])
        recipe["complexity"] = labels_by_id.get(recipe_id, "medium")

    write_recipes(recipes)

    counts = {"easy": 0, "medium": 0, "hard": 0}
    for recipe in recipes:
        counts[recipe["complexity"]] = counts.get(recipe["complexity"], 0) + 1

    print(f"Rewrote {len(recipes)} recipes with new difficulty labels: {counts}")


if __name__ == "__main__":
    main()
