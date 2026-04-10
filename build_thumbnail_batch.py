import json
import re
from pathlib import Path


RECIPES_PATH = Path("recipes-data.js")
OUTPUT_PATH = Path("tmp/imagegen/recipe-thumbnails.jsonl")
IMAGE_MODEL = "gpt-image-1.5"

BASE_STYLE = {
    "use_case": "photorealistic-natural",
    "style": "editorial food photography, clean professional culinary magazine style",
    "constraints": "food only, realistic portion, no cutlery if unnecessary, no text, no watermark, no collage, no split layout",
    "negative": "no packaging, no menu text, no extra dishes, no people, no floating ingredients, no illustration"
}

COMPOSITIONS = [
    "square crop, close overhead angle, plated dish offset from center with loose editorial framing",
    "square crop, low three-quarter dining angle, dish slightly off-center like a magazine feature",
    "square crop, near top-down cafe table view, dish filling most of the frame with irregular spacing around it",
    "square crop, eye-level close table angle, intimate restaurant-style framing with a little crop into the edge of the plate",
    "square crop, overhead but not flat, bowl or plate captured with natural asymmetry and no strict centering",
    "square crop, three-quarter angle with shallow depth of field and tight editorial framing",
    "square crop, dramatic partial crop with the dish entering the frame from one side, artful but realistic",
    "square crop, slightly tilted restaurant-table angle, imperfect and natural rather than symmetrical",
    "square crop, close side angle with foreground blur and a looser magazine-style crop"
]

LIGHTING_SETUPS = [
    "soft north-facing daylight, airy and bright with gentle shadows",
    "late afternoon window light, warm highlights and soft contrast",
    "moody restaurant side light, deeper shadows but still realistic and appetizing",
    "clean diffused studio-daylight mix, crisp detail and restrained contrast",
    "cool morning light with subtle shadow falloff and fresh clarity",
    "golden early-evening light with rich texture and moderate contrast"
]

PALETTES = [
    "muted editorial palette, warm neutrals, natural food tones, restrained blacks and whites",
    "clean black-and-white culinary palette with stone, linen, and natural ingredient color",
    "soft chalky neutrals with gentle wood tones and realistic saturated food color",
    "minimal dark-accent palette with ceramic whites, matte blacks, and natural highlights",
    "warm contemporary bistro palette with oat, cream, charcoal, and natural produce color",
    "cool modern kitchen palette with pale stone, brushed steel accents, and realistic food tones"
]

MATERIAL_SCENES = [
    "served on matte stoneware over a pale limestone table, minimal styling",
    "served on a simple white ceramic plate over a dark walnut table with restrained props",
    "served in a shallow off-white bowl on brushed stone with a folded linen napkin nearby",
    "served on rustic glazed pottery over a worn wooden cafe table, quietly elegant",
    "served on a modern charcoal plate over light oak with very minimal table setting",
    "served in refined porcelain on a cool grey marble surface with understated styling",
    "served in a handmade ceramic bowl with slightly irregular edges on a textured cafe table",
    "served on a small stacked setting with one bowl or plate overlapping another surface naturally"
]

SETTING_DETAILS = [
    "include only a subtle linen napkin, no extra table clutter",
    "allow one understated water glass in the background if it feels natural",
    "minimal cutlery can appear softly out of focus if appropriate to the dish",
    "keep the setting sparse and architectural with almost no supporting objects",
    "allow a quiet restaurant-table feel with one discreet glass or side plate",
    "keep the scene intimate and uncluttered, with props only if they support realism",
    "favor odd-number garnish placement and natural imperfection over symmetry",
    "allow a casually placed napkin or spoon if it supports a more candid editorial feel"
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


def prompt_for(recipe):
    return (
        f"{recipe['title']}. "
        f"{recipe['summary']} "
        f"Visible ingredients should plausibly reflect: {', '.join(recipe['ingredients'][:6])}."
    )


def choose(options, index, offset=0):
    return options[(index + offset) % len(options)]


def style_fields_for(recipe, index):
    slug = recipe.get("id") or slugify(recipe["title"])
    seed = sum(ord(char) for char in slug)
    cuisine = recipe.get("cuisine", "").lower()
    summary = recipe.get("summary", "").lower()

    composition = choose(COMPOSITIONS, seed, index)
    lighting = choose(LIGHTING_SETUPS, seed, index * 2)
    palette = choose(PALETTES, seed, index * 3)
    materials = choose(MATERIAL_SCENES, seed, index * 4)
    setting = choose(SETTING_DETAILS, seed, index * 5)

    if "bistro" in cuisine or "french" in cuisine:
        materials += "; slightly more classic restaurant plating"
    if "british" in cuisine:
        materials += "; hearty home-style plating that still feels editorial"
    if "japanese" in cuisine or "korean" in cuisine or "thai" in cuisine or "asian" in cuisine:
        materials += "; plating can reflect modern Asian restaurant presentation"
    if "soup" in summary or "stew" in summary or "broth" in summary:
        composition = "square crop, slightly elevated dining angle to show depth of broth and surface detail"
    if "tart" in summary or "pie" in summary or "baked" in summary:
        composition = "square crop, three-quarter angle with enough view to show structure and browned top"

    return {
        "composition": composition,
        "lighting": lighting,
        "palette": palette,
        "materials": f"{materials}; {setting}"
    }


def main():
    recipes = load_recipes()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_PATH.open("w", encoding="utf-8") as handle:
        for index, recipe in enumerate(recipes):
            slug = recipe.get("id") or slugify(recipe["title"])
            payload = {
                "model": IMAGE_MODEL,
                "prompt": prompt_for(recipe),
                "size": "1024x1024",
                "quality": "medium",
                "out": f"{slug}.png",
                **BASE_STYLE,
                **style_fields_for(recipe, index),
            }
            handle.write(json.dumps(payload) + "\n")

    print(f"Wrote {len(recipes)} thumbnail prompts to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
