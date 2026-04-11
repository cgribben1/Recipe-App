import json
import os
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))
MODEL = "text-embedding-3-small"
DIMENSIONS = 256
API_URL = "https://api.openai.com/v1/embeddings"
ALTER_MODEL = "gpt-4.1-mini"
ALTER_API_URL = "https://api.openai.com/v1/chat/completions"


class PaletteHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/alter-recipe":
            self.handle_recipe_alteration()
            return

        if self.path != "/api/embed":
            self.send_error(404, "Not found")
            return

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self.respond_json({"error": "OPENAI_API_KEY is not set on the server."}, status=500)
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            self.respond_json({"error": "Invalid JSON body."}, status=400)
            return

        user_input = (payload.get("input") or "").strip()
        if not user_input:
            self.respond_json({"error": "Input is required."}, status=400)
            return

        request = urllib.request.Request(
            API_URL,
            data=json.dumps(
                {
                    "input": user_input,
                    "model": MODEL,
                    "dimensions": DIMENSIONS,
                    "encoding_format": "float",
                }
            ).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                embedding_payload = json.loads(response.read().decode("utf-8"))
        except Exception as error:
            self.respond_json({"error": f"Embedding request failed: {error}"}, status=502)
            return

        embedding = embedding_payload["data"][0]["embedding"]
        self.respond_json(
            {
                "embedding": embedding,
                "model": MODEL,
                "dimensions": DIMENSIONS,
            }
        )

    def handle_recipe_alteration(self):
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self.respond_json({"error": "OPENAI_API_KEY is not set on the server."}, status=500)
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            self.respond_json({"error": "Invalid JSON body."}, status=400)
            return

        recipe = payload.get("recipe") or {}
        instruction = (payload.get("instruction") or "").strip()
        if not recipe or not instruction:
            self.respond_json({"error": "Both recipe and instruction are required."}, status=400)
            return

        schema = {
            "name": "altered_recipe",
            "schema": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "title": {"type": "string"},
                    "cuisine": {"type": "string"},
                    "summary": {"type": "string"},
                    "moodTags": {"type": "array", "items": {"type": "string"}},
                    "ingredients": {"type": "array", "items": {"type": "string"}},
                    "shoppingList": {"type": "array", "items": {"type": "string"}},
                    "steps": {"type": "array", "items": {"type": "string"}},
                    "servings": {"type": "integer"},
                    "prepTime": {"type": "integer"},
                    "cookTime": {"type": "integer"},
                    "estimatedCalories": {"type": "integer"},
                    "complexity": {"type": "string"}
                },
                "required": [
                    "title",
                    "cuisine",
                    "summary",
                    "moodTags",
                    "ingredients",
                    "shoppingList",
                    "steps",
                    "servings",
                    "prepTime",
                    "cookTime",
                    "estimatedCalories",
                    "complexity"
                ]
            }
        }

        system_prompt = (
            "You rewrite recipe objects for a cooking app. "
            "Keep the output practical, cookable, and concise. "
            "Return only valid JSON matching the required schema. "
            "Preserve the spirit of the original recipe but apply the user's requested change. "
            "Keep ingredients measured, steps clear and instructional, and shoppingList aligned with ingredients. "
            "Maintain the original difficulty bucket unless the user's request clearly demands a simpler or harder version. "
            "Complexity must be one of: lazy, balanced, challenging."
        )

        user_prompt = (
            "Alter this recipe according to the user's request.\n\n"
            f"User request:\n{instruction}\n\n"
            "Current recipe JSON:\n"
            f"{json.dumps(recipe, ensure_ascii=False)}"
        )

        request = urllib.request.Request(
            ALTER_API_URL,
            data=json.dumps(
                {
                    "model": ALTER_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "response_format": {
                        "type": "json_schema",
                        "json_schema": schema,
                    },
                }
            ).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                completion_payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="ignore")
            self.respond_json({"error": f"Recipe alteration request failed: {detail or error.reason}"}, status=502)
            return
        except Exception as error:
            self.respond_json({"error": f"Recipe alteration request failed: {error}"}, status=502)
            return

        try:
            content = completion_payload["choices"][0]["message"]["content"]
            altered_recipe = json.loads(content)
        except Exception as error:
            self.respond_json({"error": f"Recipe alteration response could not be parsed: {error}"}, status=502)
            return

        self.respond_json(
            {
                "recipe": altered_recipe,
                "model": ALTER_MODEL,
            }
        )

    def do_GET(self):
        if self.path == "/api/health":
            self.respond_json(
                {
                    "ok": True,
                    "embeddingsConfigured": bool(os.environ.get("OPENAI_API_KEY")),
                    "model": MODEL,
                    "dimensions": DIMENSIONS,
                }
            )
            return
        super().do_GET()

    def respond_json(self, payload, status=200):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


if __name__ == "__main__":
    print(f"Serving Palette at http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), PaletteHandler).serve_forever()
