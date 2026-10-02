# 🤝 Contributing to Dishpatch by mzx (多伦多今晚吃什么)

感谢你对 **Dishpatch by mzx** 的关注与支持！我们非常欢迎大家一起共建这个多伦多本地真实美食指南。

你可以通过以下两种方式参与贡献：

---

## 方式一：推荐新餐厅（无需懂代码，只需填写表单）

如果你有一家私藏的宝藏餐厅想分享，不需要懂代码或 Git：

1. 打开项目的 [Issues 页面](../../issues)；
2. 点击 **New Issue** 按钮；
3. 选择 **🍜 推荐多伦多新餐厅 / Recommend a Restaurant**；
4. 填写店名、地址、必点招牌菜、推荐亮点，并可直接粘贴你的手机实拍照片；
5. 点击提交，维护者审核后会转换收录进官方数据库！

---

## 方式二：提交 Pull Request（开发者贡献）

如果你熟悉 Git 和 JSON，欢迎直接提交 PR：

### 1. Fork 并克隆仓库
```bash
git clone https://github.com/<your-username>/what-shall-I-eat-tonight.git
cd what-shall-I-eat-tonight
```

### 2. 遵循方案 A 图片规范与数据规范
* 详细的字段规范、评分指南和加店流程请严格阅读：[agent.md](agent.md)。
* **图片规则（方案 A）**：严禁使用 Unsplash 等网图，必须采集真实探店/官方实拍，转换为 WebP 存入 `assets/images/{id}.webp`。
* **数据规则**：在 `data/options.json` 中添加中英双语字段，`highlights` 英文与中文各严格保留 2 条。

### 3. 本地验证数据有效性
在提交前运行仓库内置的验证脚本：
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

### 4. 提交 Pull Request
* 提交改动并推送到你的 Fork 仓库；
* 在 GitHub 上对主仓库的 `main` 分支发起 Pull Request；
* GitHub Actions 会自动运行 CI 测试，测试通过后由项目负责人 Review 并合并！
