# 🤖 AGENT & CONTRIBUTOR GUIDE (`agent.md`)

Welcome to the **Dishpatch by mzx — Toronto Asian & Dessert Food Decider** repository.

This document serves as the single source of truth for AI agents (and human contributors) on:
1. **System Architecture & Data Philosophy**
2. **Schema & Tagging Rules for `data/options.json`**
3. **How to Update the Dining Log directly on your computer**
4. **Step-by-Step Guide to Add a New Restaurant**
5. **Schema Validation & Automated CI Checks**
6. **Copy-and-Paste Starter Template**

---

## 1. System Architecture & Data Philosophy

* **Static, Serverless & Pure Vanilla**: The app consists of `index.html`, `style.css`, `app.js`, `data/options.json`, and locally stored WebP images in `assets/images/`. There are no external npm dependencies, build steps, or backend servers.
* **Hostable Anywhere**: Fully compatible with GitHub Pages.
* **Local Asset Hosting (Plan A - Mandatory)**: All restaurant images are locally stored in `assets/images/{id}.webp`. This eliminates external CDN downtime, CORS issues, anti-hotlink 403 blocks, and guarantees 10ms - 20ms instantaneous edge loading.
* **Computer-Controlled Dining Log**:
  * Instead of storing personal check-ins and ratings in browser `localStorage` (which easily gets wiped when cache is cleared and cannot be edited in a code editor), **`visit_count` and `user_rating` are stored directly in `data/options.json`**.
  * The user edits their dining history directly in VS Code / Cursor on their computer and commits to git.
  * The webpage displays these records **read-only** (badges like `❤️ Loved (Double Like)`, `👍 Liked`, `👎 Disliked / Meh`, or `✨ Not visited yet`) while retaining full **filtering and sorting** capabilities in the **⭐ My Tracker** filter drawer.
* **Strict Schema Verification**: Every entry must pass the Python schema validator in `.github/workflows/validate-data.yml`.

---

## 2. Schema & Tagging Reference (`data/options.json`)

All restaurants and dessert parlors live in the `options` array in `data/options.json`.

### 2.1 Core Identity Fields

| Field | Type | Allowed Values / Format | Description & Tagging Guide |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Regex `^[a-z0-9-]+$` | Unique kebab-case identifier. Must be unique across all 50+ entries. If a chain, append the branch/street name (e.g. `miku-waterfront`, `hokkaido-ramen-santouka-dundas`). |
| `name` | `string` | Text | Official English trading name (e.g. `Kinka Izakaya Original`). |
| `native_name` | `string \| null` | Chinese / Japanese text | Native script name. **Mandatory for Chinese (e.g. `粤东酒家`, `鲜芋仙`) and Japanese (e.g. `らーめん山頭火`, `辻利`) restaurants**; `null` for other cuisines. Displayed in parentheses on cards and searchable in the search bar. |
| `type` | `string` | `"restaurant"` \| `"recipe"` | Almost always `"restaurant"`. |
| `category` | `string` | `"meal"` \| `"dessert"` \| `"cafe"` \| `"brunch"` \| `"bar"` | Main classification. Can be `"meal"`, `"dessert"`, `"cafe"`, `"brunch"`, or `"bar"`. |

---

### 2.2 Filter Classification Fields (Used by UI Buttons)

#### A. `portion_size` (Serving Size / Course Type)
* `"dessert"`: Sweet treats, bakeries, ice cream, bubble tea, patisserie, matcha café (e.g., *Meet Fresh, Butter Baker, Tsujiri*). **Note: If this is selected, `category` must also be `"dessert"`**.
* `"light"`: Light snacks, skewers, wonton soups, small-portion noodles, salads (e.g., *Chiu Chow Boy, Sang-Ji Bao*).
* `"normal"`: Standard single-portion meal (ramen bowl, pho bowl, bento box, personal pasta).
* `"heavy"`: Large feasts, table-sharing hot pot, Korean BBQ platters, all-you-can-eat.

#### B. `food_profile` (Diet Style / Nutrition Focus)
Array containing 0 or more of the following:
* `"more-veggie"`: Abundant fresh greens, salads, vegetable-forward broth, tofu, vegetarian-friendly options.
* `"more-meat"`: Heavy meat focus: steaks, pork ribs, char siu, pork cutlet, yakitori, skewers.
* `"light-carb"`: Low or minimal refined carbohydrates: sashimi, shabu-shabu without noodles, protein plates, salads.
* `"spicy"`: Prominently spicy or peppercorn heat (Sichuan mala, Thai bird's eye chili, Korean gochujang).

#### C. `area` (Neighborhood & Walking Distance)
Must be strictly one of these 8 allowed values:
1. `"Downtown (Yonge)"`: Yonge & Dundas, Bay corridor, Church St, Ryerson/TMU area.
2. `"Downtown (Other)"`: Harbourfront, Annex, Kensington Market, St. Lawrence, Entertainment District.
3. `"Chinatown"`: Spadina Ave & Dundas St W corridor.
4. `"Queen West"`: Queen St W, King St W, Trinity Bellwoods vicinity.
5. `"Financial Core"`: Bay St, Wellington, PATH system, Union / King subway stations.
6. `"North"`: North York (Yonge/Sheppard/Finch), Markham, Richmond Hill, Scarborough.
7. `"Midtown"`: Yonge & Eglinton, Bloor-Yorkville, St. Clair.
8. `"Other"`: East York, Etobicoke, Mississauga, outer GTA.

> **🚶 Walking Time Rule & "All Downtown" Filter:**
> * The 5 Downtown-accessible areas (`Downtown (Yonge)`, `Downtown (Other)`, `Chinatown`, `Queen West`, `Financial Core`) represent the downtown core. The UI provides a **`🏙️ All Downtown`** filter chip that matches any of these 5 areas (or excludes them when inverted). For these 5 areas, you **must** provide a realistic walking time integer in minutes (e.g. `4`, `12`, `22`).
> * For outer areas (`North`, `Midtown`, `Other`), set `"walking_time_min": null` to avoid misleading walking estimates.

#### D. `cuisine` (Culinary Origin)
Must be strictly one of these 11 allowed values:
* `"Chinese"`
* `"Japanese"`
* `"Korean"`
* `"Vietnamese"`
* `"Thai"`
* `"Indian"`
* `"Middle Eastern"`
* `"Italian"`
* `"Mexican"`
* `"American"`
* `"Other"`

#### E. `price` (Price Range per Person)
* `1`: `$` (<$15 CAD) — Quick street food, buns, fast casual snacks.
* `2`: `$$` ($15–$30 CAD) — Standard sit-down ramen, pho, rice bowls, casual dining.
* `3`: `$$$` ($30–$60 CAD) — Izakaya, hot pot, premium Korean BBQ, upscale dining.
* `4`: `$$$$` ($60+ CAD) — Fine dining, waterfront seafood, omakase sushi.

#### F. `curation_source` & `source_platform` (Why in Database)
Indicates why this spot was selected:
* `"web"`: Verified by prominent publications (Michelin Guide / Bib Gourmand, Toronto Life, blogTO, Eater Toronto).
  * `source_platform`: Set to `"Web"`.
* `"red"`: Trending community favorite on Xiaohongshu (RED / 小红书) with strong user reviews.
  * `source_platform`: Set to `"Red"`.
* `"other"`: Trusted word-of-mouth recommendation or local neighborhood staple.
  * `source_platform`: Set to `"Other"`.

---

### 2.3 The Personal Dining Log Fields

The user directly records their visits and personal opinions on their computer:

| Field | Type | Allowed Values | Usage Guide |
| :--- | :--- | :--- | :--- |
| `visit_count` | `integer` | `>= 0` | How many times you've dined here. `0` means you haven't visited yet. |
| `user_rating` | `string \| null` | `null`, `"dislike"`, `"like"`, `"super-like"` | Your personal reaction:<br>• `null`: Unrated / haven't visited yet.<br>• `"dislike"`: 👎 Disliked / Meh (will display red badge; excluded when filtering out dislikes).<br>• `"like"`: 👍 Liked / Solid spot.<br>• `"super-like"`: ❤️ Loved / Super Like / Double Like (top-tier favorite). |

---

### 2.4 Bilingual Fields & Scannable Highlights (Rule: Exactly 2 Highlights)

The platform supports full bilingual switching between English and Chinese (`🌐 EN | 中文` toggle in header):
* **English Mode (`lang == 'en'`)**:
  * `name`: Official English name.
  * `description`: Concise summary in English. **Rule: Must be strictly under 20 words!**
  * `highlights`: **Mandatory array of exactly 2 items in English** (e.g. `["Tender pork jowl, prime solo comfort", "Rich slow-simmered tonkotsu pork broth"]`).
    * Item 1: The concept, vibe, setting, or accolade.
    * Item 2: The signature flavor, specialty dish, or must-try profile.
    * **Rule for Xiaohongshu sources (`curation_source == 'red'`)**: Distill and translate the reviewer's authentic praises, must-order dishes, and ordering tips directly into English (`"everything in eng"`).
  * `signature_dish`: Name of the must-order dish in English.
  * `hours_note`: Standard hours note in English (e.g. `"Mon-Sun 11:30 AM - 10:00 PM"`).
  * `review_notes_en`: Authentic English review notes (`summary`, `must_try`, `tips`, `vibe`, and optional `skip_or_neutral`).
* **Chinese Mode (`lang == 'zh'`)**:
  * `name_zh`: Proper Chinese name (e.g. `歌志轩名古屋油拉面`).
  * `description_zh`: Natural, concise summary in Chinese.
  * `highlights_zh`: **Mandatory array of exactly 2 items in Chinese**.
  * `signature_dish_zh`: Name of the must-order dish in Chinese.
  * `hours_note_zh`: Opening hours in Chinese (e.g. `"周一至周日 11:30 - 22:00"`).
  * `review_notes`: Detailed Chinese review notes (`summary`, `must_try`, `tips`, `vibe`, and optional `skip_or_neutral`).
* `address`: Full street address with city and postal code.
* `maps_url`: Valid Google Maps query URL (`https://maps.google.com/?q=...`).
* `image_url`: Local relative path to the authentic on-site / editorial WebP image (e.g. `assets/images/{id}.webp`). **Mandatory Rule (Plan A)**: Always search for real on-site / editorial photography (BlogTO, Michelin Guide, or official restaurant channels), convert to optimized WebP (~1200x630, ~60–100KB) into `assets/images/{id}.webp`, and point `image_url` to this local relative path. **Never use generic Unsplash stock photos or external hotlinks.**
* `source_url`: Link to official website, menu, or review article.
* `xhs_url`: Xiaohongshu search URL (optional convenience link).

---

### 2.5 Secondary Metadata Fields

* `time`: `"quick"` (<20 min), `"medium"` (20–45 min), or `"long"` (45+ min).
* `format`: Array with subset of `["dine-in", "takeout", "delivery"]`.
* `dietary`: Array with subset of `["vegetarian", "vegan", "halal", "gluten-free", "spicy"]`.
* `mood`: Array with subset of `["comfort", "healthy", "light", "indulgent", "date-night", "solo", "group"]`.
* `weather_fit`: Array with subset of `["cold", "hot", "any"]`.
* `unverified`: Array of strings flagging unverified attributes (keep `[]` for verified spots).

---

## 3. How to Update Your Personal Dining Log

You do **not** need to click buttons on the website to change your dining log. You control it right in this repository on your computer.

### Step-by-Step Log Update:
1. Open `data/options.json` in your editor.
2. Search (`Ctrl+F` / `Cmd+F`) for the restaurant name (e.g. `"Hokkaido Ramen Santouka"`).
3. Update the two fields:
   ```json
   "visit_count": 3,
   "user_rating": "super-like"
   ```
4. Save the file.
5. If you are previewing locally (`http://localhost:8000`), simply refresh your browser.
6. Commit and push to git to update your live GitHub Pages site:
   ```bash
   git add data/options.json
   git commit -m "log: update visit count for Santouka"
   git push origin main
   ```

---

## 4. Step-by-Step Guide to Add a New Restaurant

When adding a new dining spot to the database:

### Step 1: Verify Restaurant Details
* Verify that the restaurant is **currently operating** in the Greater Toronto Area.
* Gather exact street address, signature dish, opening hours, and official/maps link.

### Step 2: Determine All Tags Accurately
* Pick the `cuisine` from the 11 allowed values.
* Determine `portion_size` (`dessert`, `light`, `normal`, `heavy`).
* Set `category`: `"dessert"` if dessert, otherwise `"meal"`.
* Add `food_profile` tags if applicable (`more-veggie`, `more-meat`, `light-carb`, `spicy`).
* Set `area` and calculate `walking_time_min` if located downtown (or `null` if North/Midtown/Other).
* Set `curation_source` (`"web"`, `"red"`, or `"other"`).
* Initialize `"visit_count": 0` and `"user_rating": null` (or your actual rating if you've already been).

### Step 3: Source & Optimize Real On-Site Photo (Plan A - Mandatory)
* **No Generic Stock Photos**: Do **not** use Unsplash or generic stock images.
* **Find Real Editorial / On-Site Photos**:
  * Search BlogTO editorial listings (`site:blogto.com/restaurants/ [name]`), Michelin Guide Toronto, or official restaurant photography.
  * Pick an authentic on-site photo clearly displaying the restaurant's signature dish or venue atmosphere.
* **Save as Local WebP**:
  * Download and save the image into `assets/images/{id}.webp` (optimized to ~1200×630, target size ~60–100KB).
  * Set `"image_url": "assets/images/{id}.webp"`.
  * **Never hotlink external URLs** — all images must reside in `assets/images/` for instant edge caching and permanent stability.

### Step 4: Insert into `data/options.json`
* Append the new JSON object into the `"options"` array in `data/options.json`.
* Ensure exact compliance with the bilingual schema (both English and Chinese fields).
* Ensure `highlights` has **exactly 2 items in English**, and `highlights_zh` has **exactly 2 items in Chinese**.
* Make sure commas between objects are valid JSON.

### Step 5: Run the Schema Validator
Run this one-liner command in your terminal from the project root:

```bash
python3 - << 'EOF'
import json, re, sys

with open("data/options.json", "r", encoding="utf-8") as f:
    data = json.load(f)

ALLOWED_CUISINES = {"Chinese", "Japanese", "Korean", "Vietnamese", "Thai", "Indian", "Middle Eastern", "Italian", "Mexican", "American", "Other"}
ALLOWED_PRICES = {1, 2, 3, 4}
ALLOWED_AREAS = {"Downtown (Yonge)", "Downtown (Other)", "Chinatown", "Queen West", "Financial Core", "North", "Midtown", "Other"}
ALLOWED_PORTIONS = {"light", "normal", "heavy", "dessert"}
ALLOWED_CATEGORIES = {"meal", "dessert", "cafe", "brunch", "bar"}
ALLOWED_FOOD_PROFILES = {"more-veggie", "more-meat", "light-carb", "spicy"}

errors = []
seen = set()
for i, r in enumerate(data["options"]):
    rid = r.get("id")
    if not rid or rid in seen or not re.match(r"^[a-z0-9-]+$", str(rid)):
        errors.append(f"Row {i}: Invalid or duplicate id '{rid}'")
    seen.add(rid)
    if r.get("category") not in ALLOWED_CATEGORIES:
        errors.append(f"Row {i} ({rid}): invalid category")
    if r.get("cuisine") not in ALLOWED_CUISINES:
        errors.append(f"Row {i} ({rid}): invalid cuisine {r.get('cuisine')}")
    if r.get("area") not in ALLOWED_AREAS:
        errors.append(f"Row {i} ({rid}): invalid area {r.get('area')}")
    if r.get("portion_size") not in ALLOWED_PORTIONS:
        errors.append(f"Row {i} ({rid}): invalid portion_size")
    if len(r.get("description", "").split()) > 20:
        errors.append(f"Row {i} ({rid}): description exceeds 20 words")
    if r.get("curation_source") not in {"web", "red", "other"}:
        errors.append(f"Row {i} ({rid}): invalid curation_source")
    if "visit_count" in r and (not isinstance(r["visit_count"], int) or r["visit_count"] < 0):
        errors.append(f"Row {i} ({rid}): invalid visit_count")
    if "user_rating" in r and r["user_rating"] not in {None, "dislike", "like", "super-like"}:
        errors.append(f"Row {i} ({rid}): invalid user_rating")
    if "highlights" in r and (not isinstance(r["highlights"], list) or len(r["highlights"]) != 2):
        errors.append(f"Row {i} ({rid}): highlights must be a list of exactly 2 items")
    if "highlights_zh" in r and (not isinstance(r["highlights_zh"], list) or len(r["highlights_zh"]) != 2):
        errors.append(f"Row {i} ({rid}): highlights_zh must be a list of exactly 2 items")

if errors:
    print(f"FAILED with {len(errors)} error(s):")
    for e in errors: print(" -", e)
    sys.exit(1)
print(f"PASSED! All {len(data['options'])} options are valid.")
EOF
```

### Step 6: Test Locally
Refresh your local server at `http://localhost:8000` to verify:
* The card renders smoothly and the local WebP image loads instantly.
* The Google Maps link opens properly.
* The tags and walking distance badges display correctly.
* Bilingual toggle works cleanly for the new card.

### Step 7: Commit and Push
```bash
git add assets/images/ data/options.json
git commit -m "feat: add [Restaurant Name] with local WebP photo"
git push origin main
```

---

## 5. Copy-and-Paste Starter Template

Copy this template when creating a new record:

```json
{
  "id": "new-restaurant-name-location",
  "code": "082",
  "name": "New Restaurant Name",
  "native_name": "原生语言店名",
  "type": "restaurant",
  "category": "meal",
  "cuisine": "Japanese",
  "price": 2,
  "time": "quick",
  "format": [
    "dine-in",
    "takeout"
  ],
  "dietary": [],
  "mood": [
    "comfort",
    "solo"
  ],
  "weather_fit": [
    "cold"
  ],
  "signature_dish": "Signature Dish Name",
  "description": "Short appetizing description under 20 English words highlighting what makes it special.",
  "address": "123 Street St, Toronto, ON M5B 1A1",
  "hours_note": "Mon-Sun 11:30 AM - 10:00 PM",
  "image_url": "assets/images/new-restaurant-name-location.webp",
  "maps_url": "https://maps.google.com/?q=New+Restaurant+Name+Toronto",
  "source_url": "https://example.com/",
  "unverified": [],
  "area": "Downtown (Yonge)",
  "walking_time_min": 8,
  "portion_size": "normal",
  "food_profile": [
    "more-meat"
  ],
  "highlights": [
    "Authentic on-site highlight 1: atmosphere, heritage, or vibe",
    "Authentic on-site highlight 2: signature dish flavor or must-try item"
  ],
  "name_zh": "新餐厅中文名",
  "description_zh": "中文简短介绍，生动描述餐厅风味特色与核心亮点。",
  "highlights_zh": [
    "中文特色亮点 1：环境氛围、传承历史或出圈口碑",
    "中文特色亮点 2：招牌必点菜品、独家风味或口感体验"
  ],
  "signature_dish_zh": "招牌必点菜品名",
  "hours_note_zh": "周一至周日 11:30 - 22:00",
  "review_notes": {
    "summary": "一句话地道探店总结。",
    "must_try": "🔥 必点菜品 1\n🍜 必点菜品 2",
    "tips": "实用点单与防踩坑小贴士。",
    "vibe": "用餐空间氛围描述"
  },
  "review_notes_en": {
    "summary": "Authentic concise review summary.",
    "must_try": "🔥 Must-try Dish 1\n🍜 Must-try Dish 2",
    "tips": "Practical ordering and dining tips.",
    "vibe": "Dining space atmosphere and seating vibe"
  },
  "source_platform": "Web",
  "curation_source": "web",
  "visit_count": 0,
  "user_rating": null
}
```
