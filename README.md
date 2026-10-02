# 🍜 Dishpatch by mzx — Toronto Food Decider

A fast, interactive, mobile-friendly web application designed to help you instantly decide where and what to eat and drink in Toronto. Hand-curated by **mzx** with 71 verified, currently open Asian dining spots, North America's Top 50/100 craft bars, cafes, brunch, and specialty dessert destinations.

Featuring walking times from central downtown, personal dining log & visit check-in tracker, dynamic tri-state filters (inclusion & exclusion), quick presets, and a random **"Pick for me 🎲"** decider roulette with re-roll and exclusion controls.

---

## 🌟 Key Features

* **🎲 Instant "Pick for me" Roulette:** Randomly selects a winning spot from your *currently filtered* results with a smooth shuffle animation. Don't like a pick? Tap **Re-roll** or **Exclude this one**.
* **📝 Personal Dining Log & Visit Tracker (Computer-Managed):**
  * Easily tracked directly on your computer in `data/options.json` (`visit_count` and `user_rating`).
  * Displays read-only badges on cards: **❤️ Loved (Double Like)**, **👍 Liked**, **👎 Disliked (Meh)**, or **✨ Not visited yet**.
  * Filter anytime by your dining history in the **⭐ My Tracker** filter drawer: view **✨ Unvisited Spots**, your **❤️ Favorites**, or exclude places you **👎 Disliked**.
* **📌 Source Tags (Why in Database):**
  * 🌐 **Web:** Verified by Michelin Bib Gourmand, Toronto Life, blogTO, and local food guides.
  * 📕 **Red:** High-engagement community favorites from Xiaohongshu (RED).
  * 🗣️ **Other:** Tried-and-tested word-of-mouth favorites loved by Toronto locals.
* **📋 2-Column Scannable Summary Bullets:**
  * **⭐️ Signature Dish** (must-order item) & **🍲 Flavor Profile** (taste notes, broth, spices)
  * **✨ Highlights** (reputation, atmosphere) & **🕒 Hours**
* **⚡ Tri-State Include / Exclude Filters (反选排除):**
  * **Click 1x:** Include (`✓`) — e.g. only Veggie-rich, only Downtown.
  * **Click 2x:** **Exclude (`🚫`)** — e.g. filter OUT all spicy foods, filter OUT desserts, filter OUT `$$$$` expensive spots, or exclude places you marked `👎 Disliked`.
  * **Click 3x:** Reset to neutral.
* **🚶 Walking Distance Badges:** Walking times for all downtown-accessible spots (Downtown Yonge, Downtown Other, Chinatown, Queen West, Financial Core).
* **🍽️ Clean Portion Controls:** `🍰 Dessert` placed directly to the left of `🥗 Light`, followed by `🍲 Normal` and `🍱 Heavy`.
* **Zero Dependencies:** Pure vanilla HTML5, CSS3, and modern JavaScript. No build step, no npm, no backend required. Hostable directly on GitHub Pages.
* **Accessible & Theme-Aware:** Dark / light mode with automatic system preference detection and manual toggle; keyboard navigation; WCAG contrast compliant (≥ 4.5:1).

---

## 🚀 How to Run Locally

Because the application fetches `data/options.json` using the standard browser `fetch()` API, **opening `index.html` directly from your file manager (`file:///path/index.html`) will fail** due to browser security restrictions on the `file://` protocol.

To run locally, start a lightweight local HTTP server:

```bash
# In the project root directory:
python3 -m http.server 8000
```

Then open your browser and navigate to:
```
http://localhost:8000
# or
http://127.0.0.1:8000
```

---

## 🌐 Step-by-Step GitHub Pages Deployment

You can host this website for free on GitHub Pages:

1. **Commit and push your code:**
   ```bash
   git add .
   git commit -m "feat: complete Toronto food decider"
   git push origin main
   ```

2. **Open Repository Settings on GitHub:**
   * Go to your repository on GitHub: `https://github.com/PodorCN/what-shall-I-eat-tonight`
   * Click on the **Settings** tab.

3. **Enable GitHub Pages:**
   * In the left sidebar, click **Pages**.
   * Under **Build and deployment**:
     * **Source:** Select `Deploy from a branch`.
     * **Branch:** Select `main` and `/(root)`.
     * Click **Save**.

4. **Access your live website:**
   * GitHub Pages will deploy your site in ~30–60 seconds at:
     ```
     https://podorcn.github.io/what-shall-I-eat-tonight/
     ```

---

## 📂 Repository Structure

```
├── .github/
│   └── workflows/
│       └── validate-data.yml    # Automated CI schema validation on push/PR
├── .nojekyll                    # Tells GitHub Pages to skip Jekyll processing
├── data/
│   └── options.json             # 59 verified Toronto dining & dessert records
├── index.html                   # Semantic HTML5 single-page application
├── style.css                    # Responsive CSS, light/dark themes, components
├── app.js                       # Decider roulette, filter logic, local tracker
├── agent.md                     # Contributor & Agent Guide: tagging, schema & dining log
└── README.md                    # Project documentation and deployment guide
```

---

## 📝 How to Add or Edit an Entry in `data/options.json`

Each entry follows this schema:

```json
{
  "id": "restaurant-kebab-id",
  "name": "Restaurant Name",
  "type": "restaurant",
  "category": "meal",
  "cuisine": "Japanese",
  "price": 2,
  "time": "quick",
  "format": ["dine-in", "takeout"],
  "dietary": [],
  "mood": ["comfort"],
  "weather_fit": ["any"],
  "signature_dish": "Signature dish name",
  "description": "Short description under 20 words.",
  "bullet_flavor": "Mouth-watering flavor profile summary",
  "bullet_highlight": "Must-know dining highlight or feature",
  "curation_source": "web",
  "source_platform": "Web Guide",
  "address": "Street Address, Toronto, ON",
  "hours_note": "Mon-Sun 11:30 AM - 10:00 PM",
  "image_url": "assets/images/restaurant-id.webp",
  "maps_url": "https://maps.google.com/?q=...",
  "source_url": "https://...",
  "area": "Downtown (Yonge)",
  "walking_time_min": 6,
  "portion_size": "normal",
  "food_profile": ["more-meat"],
  "unverified": []
}
```

---

## 🤝 参与贡献 / Contributing

我们非常欢迎社区和朋友们一起共建多伦多美食库！
* **想推荐餐厅（无需代码）**：前往 [Issues](../../issues/new?template=recommend_restaurant.yml) 填写推荐表单，附上招牌菜和实拍照片即可。
* **想提交代码 / 丰富数据**：请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [agent.md](agent.md) 提交 Pull Request。

