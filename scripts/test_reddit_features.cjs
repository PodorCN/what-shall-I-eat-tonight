// Exercise the actual app functions without running a browser or fetching data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('app.js', 'utf8');
const marker = "  if (document.readyState === 'loading') {";
assert(source.includes(marker));
const context = {
  URL,
  document: { readyState: 'loading', getElementById: () => null, addEventListener() {} },
};
vm.createContext(context);
vm.runInContext(source.replace(marker, `
  globalThis.appTest = {
    filters, PRESETS, getFilteredOptions, renderReviewSourcesHtml, createCardHtml, updatePresetChipsText,
    setData: rows => { allOptions = rows; },
    setLanguage: lang => { currentLang = lang; }
  };
${marker}`), context);
const app = context.appTest;
const data = JSON.parse(fs.readFileSync('data/options.json', 'utf8'));
const newIds = ['saigon-lotus-kensington', 'vegedelight-dundas', 'kings-cafe-kensington', 'salad-king-yonge'];
const sample = data.options.find(row => row.curation_source === 'reddit');
assert(sample, 'Keep at least one community-backed example');
// Isolated fixtures allow the live collection to grow or retire restaurants.
const fixture = (id, changes = {}) => ({ ...sample, id, area: 'Chinatown', category: 'meal', food_profile: ['more-veggie'], features: ['warm-food'], ...changes });
const fixtures = [
  fixture('eligible'),
  fixture('outside-downtown', {area: 'North'}),
  fixture('cold-food', {features: []}),
  fixture('meat-only', {food_profile: ['more-meat']}),
  fixture('dessert', {category: 'dessert'}),
];
const clear = () => {
  app.filters.search = '';
  for (const mode of ['include', 'exclude']) {
    for (const set of Object.values(app.filters[mode])) set.clear();
  }
};
app.setData(fixtures);
for (const [group, values] of Object.entries(app.PRESETS['downtown-warm-veggie'].include)) {
  values.forEach(value => app.filters.include[group].add(value));
}
assert.deepEqual(Array.from(app.getFilteredOptions(), row => row.id), ['eligible']);
app.filters.exclude.curation_source.add('reddit');
assert.equal(app.getFilteredOptions().length, 0, 'Excluding Reddit must override the preset');
clear();
app.setData(data.options);
app.filters.include.curation_source.add('reddit');
assert(app.getFilteredOptions().length >= 1);
app.filters.exclude.feature.add('warm-food');
assert(!app.getFilteredOptions().some(row => row.features?.includes('warm-food')));
clear();
app.setData([fixture('search-fixture', {signature_dish_zh: '顺化素汤粉'})]);
app.filters.search = '顺化';
assert.equal(app.getFilteredOptions()[0].id, 'search-fixture', 'Chinese dish search');

for (const lang of ['en', 'zh']) {
  app.setLanguage(lang);
  for (const row of data.options.filter(row => row.curation_source === 'reddit')) {
    const card = app.createCardHtml(row);
    assert(card.includes('tag-reddit'));
    assert(card.includes(row.review_sources[0].url));
    assert(card.includes(row.image_url));
    assert(card.includes(lang === 'zh' ? '热乎饭菜' : 'Hot Food'));
  }
}
const label = { textContent: '' };
context.document.querySelectorAll = () => [{dataset: {preset: 'downtown-warm-veggie'}, querySelector: () => label}];
app.updatePresetChipsText('zh');
assert(label.textContent.includes('市中心'));
app.updatePresetChipsText('en');
assert(label.textContent.includes('Downtown'));
const unsafe = { review_sources: [{ url: 'javascript:alert(1)' }, { url: 'https://www.reddit.com.evil.example/r/test/comments/1' }] };
assert.equal(app.renderReviewSourcesHtml(unsafe, 'en'), '');
const escaped = app.renderReviewSourcesHtml({review_sources: [{url: 'https://www.reddit.com/r/FoodToronto/comments/test/', summary: '<script>bad</script>', summary_zh: '摘要'}]}, 'en');
assert(escaped.includes('&lt;script&gt;'));
assert(!escaped.includes('<script>'));
console.log('PASS: downtown hot-meal filters, Reddit include/exclude, bilingual cards, source links and escaping.');
