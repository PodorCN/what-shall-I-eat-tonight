"""Run the same data checks locally and in GitHub Actions."""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def validate(path=ROOT / "data/options.json"):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    assert all(key in data for key in ("generated_at", "location", "options"))
    allowed = {
        "type": {"restaurant", "recipe"},
        "category": {"meal", "dessert", "cafe", "brunch", "bar"},
        "cuisine": {"Chinese", "Japanese", "Korean", "Vietnamese", "Thai", "Indian", "Middle Eastern", "Italian", "Mexican", "American", "Other"},
        "price": {1, 2, 3, 4},
        "time": {"quick", "medium", "long"},
        "area": {"Downtown (Yonge)", "Downtown (Other)", "Chinatown", "Queen West", "Financial Core", "North", "Midtown", "Other"},
        "portion_size": {"light", "normal", "heavy", "dessert"},
        "travel_mode": {"walk", "ttc", "drive"},
    }
    arrays = {
        "food_profile": {"more-veggie", "more-meat", "light-carb", "spicy"},
        "features": {"hotpot", "bbq", "reservation"},
        "format": {"dine-in", "takeout", "delivery", "cook-at-home"},
        "dietary": {"vegetarian", "vegan", "halal", "gluten-free", "spicy"},
        "mood": {"comfort", "healthy", "light", "indulgent", "date-night", "solo", "group"},
        "weather_fit": {"cold", "hot", "any"},
    }
    ids, codes = set(), set()
    for row in data["options"]:
        rid, code = row.get("id", ""), str(row.get("code", ""))
        assert re.fullmatch(r"[a-z0-9-]+", rid) and rid not in ids, f"Invalid/duplicate id: {rid}"
        assert re.fullmatch(r"\d{1,4}", code) and code not in codes, f"Invalid/duplicate code: {rid}"
        ids.add(rid)
        codes.add(code)
        for key, values in allowed.items():
            assert row.get(key) in values, f"{rid}: invalid {key}"
        for key, values in arrays.items():
            assert isinstance(row.get(key, []), list) and set(row.get(key, [])) <= values, f"{rid}: invalid {key}"
        assert len(row.get("description", "").split()) <= 20, f"{rid}: long description"
        assert type(row.get("travel_time_min")) is int and row["travel_time_min"] >= 0, f"{rid}: invalid travel time"
        assert row.get("curation_source") in {None, "web", "red", "reddit", "other", "xiaohongshu", "word-of-mouth"}, f"{rid}: invalid source"
        assert type(row.get("visit_count", 0)) is int and row.get("visit_count", 0) >= 0, f"{rid}: invalid visits"
        assert row.get("user_rating") in {None, "dislike", "like", "super-like"}, f"{rid}: invalid rating"
        for key in ("highlights", "highlights_zh"):
            if key in row:
                assert isinstance(row[key], list) and len(row[key]) == 2, f"{rid}: expected 2 {key}"
        # Evidence is required for new Reddit-curated entries, while legacy entries keep their schema.
        if row.get("curation_source") == "reddit":
            for key in ("name_zh", "description_zh", "signature_dish_zh", "highlights", "highlights_zh", "review_notes", "review_notes_en", "image_source_url", "last_verified_at"):
                assert row.get(key), f"{rid}: missing {key}"
            image = Path(row.get("image_url", ""))
            assert str(image).startswith("assets/images/") and image.suffix == ".webp" and (ROOT / image).is_file(), f"{rid}: missing local WebP"
            assert row.get("review_sources"), f"{rid}: missing Reddit evidence"
        for source in row.get("review_sources", []):
            url = urlparse(source.get("url", ""))
            assert url.scheme == "https" and url.hostname == "www.reddit.com" and "/comments/" in url.path, f"{rid}: invalid Reddit permalink"
            assert source.get("summary") and source.get("summary_zh"), f"{rid}: missing bilingual evidence summary"
    return len(ids)


if __name__ == "__main__":
    print(f"SUCCESS: All {validate()} options passed schema validation.")
