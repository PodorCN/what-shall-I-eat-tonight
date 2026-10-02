/**
 * Dishpatch by mzx — Toronto Food Decider
 * Features:
 * 1. Full Bilingual Support (EN / 中文):
 *    - Language toggle in top-right header (🌐 EN | 中文)
 *    - 100% English in EN mode (no Chinese characters anywhere)
 *    - 100% Chinese in ZH mode (all UI, chips, notes, and highlights in Chinese)
 *    - Persistent language state in localStorage & URL (?lang=zh / ?lang=en)
 * 2. Personal Dining Log:
 *    - Visit counter display & ratings (❤️ Loved / 👍 Liked / 👎 Disliked)
 *    - Filter by Tracker status: Unvisited, Visited, Loved, Liked, Disliked
 * 3. Collapsible Secondary Filters (Feature, Tracker & Source)
 * 4. Recommendation Source Tag (Red / Web / Other)
 * 5. Walking times calculated for all Downtown areas
 * 6. Tri-State Include/Exclude Filters (Click 1x: Include ✓, Click 2x: Exclude 🚫, Click 3x: Reset)
 * 7. Scannable 2-Item Highlights & Collapsible Insider Notes
 * 8. Decider Roulette with Shuffle, Re-roll, and Exclude
 * 9. URL Parameter Synchronization for bookmarking & sharing
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const STORAGE_THEME_KEY = 'eat_tonight_theme';
  const STORAGE_LANG_KEY = 'dishpatch_lang';

  // 9 Filter Groups (Tri-state include / exclude)
  const filterGroups = [
    'tracker',
    'category',
    'food_profile',
    'area',
    'cuisine',
    'price',
    'portion_size',
    'curation_source',
    'feature'
  ];

  // Preset Shortcuts
  const PRESETS = {
    'fast-cheap': {
      include: { price: ['<20'] }
    },
    'nearby-walk': {
      include: { area: ['All Downtown'] }
    },
    'bar': {
      include: { category: ['bar'] }
    },
    'cafe': {
      include: { category: ['cafe'] }
    },
    'brunch': {
      include: { category: ['brunch'] }
    },
    'more-veggie': {
      include: { food_profile: ['more-veggie'] }
    },
    'more-meat': {
      include: { food_profile: ['more-meat'] }
    },
    'light-carb': {
      include: { food_profile: ['light-carb'] }
    },
    'spicy': {
      include: { food_profile: ['spicy'] }
    },
    'sweet-dessert': {
      include: { category: ['dessert'] }
    },
    'unvisited': {
      include: { tracker: ['unvisited'] }
    },
    'favorites': {
      include: { tracker: ['super-like'] }
    }
  };

  // --- Internationalization Dictionary (i18n) ---
  const I18N = {
    en: {
      langLabel: '中文',
      langTitle: 'Switch to Chinese / 切换为中文',
      docTitle: 'Dishpatch by mzx — Toronto Food Decider',
      metaDesc: 'Dishpatch by mzx — Curated Toronto dining and dessert decider roulette. Filter by diet, area, visits, ratings, budget, and roll the dice!',
      brandAuthor: 'by mzx',
      heroTitle: 'What should I <em>eat</em> tonight?',
      pickForMe: 'Pick for me',
      searchPlaceholder: 'Search dish, restaurant, or cuisine (e.g. ramen, khao soi, hot pot)...',
      sortOptions: {
        'default': '🎲 True Random Recommendation',
        'walk': '🚶 Walking distance (Closest first)',
        'price-asc': '💵 Price: Low to High',
        'price-desc': '💎 Price: High to Low',
        'visits-desc': '🏆 Most Visited First',
        'name-asc': '🔤 Name: A to Z'
      },
      shuffleBtnTitle: 'Re-shuffle recommendations',
      resultsLabel: 'options matching',
      modeTipText: '1 click: Include ✓ · 2 clicks: Exclude 🚫',
      resetAll: '↺ Reset all',
      filterGroupLabels: {
        category: '🍽️ Category',
        food_profile: '🥗 Diet Style',
        area: '📍 Area',
        cuisine: '🥢 Cuisine',
        price: '💵 Price',
        portion_size: '🍽️ Portion',
        feature: '🔥 Feature',
        tracker: '⭐ My Tracker',
        curation_source: '📌 Source'
      },
      filterChips: {
        // category
        'meal': '🍱 Meal',
        'bar': '🍸 Bar',
        'cafe': '☕ Cafe',
        'brunch': '🥞 Brunch',
        'dessert': '🍰 Dessert',
        // food_profile
        'more-veggie': '🥬 Veggie-Rich',
        'more-meat': '🥩 Meat-Lover',
        'light-carb': '🍚 Low-Carb',
        'spicy': '🌶️ Spicy',
        // area
        'All Downtown': '🏙️ All Downtown',
        'Downtown (Yonge)': 'Downtown (Yonge) 🚶',
        'Downtown (Other)': 'Downtown (Other) 🚶',
        'Chinatown': 'Chinatown 🚶',
        'Queen West': 'Queen West 🚶',
        'Financial Core': 'Financial Core 🚶',
        'North': 'North',
        'Midtown': 'Midtown',
        'Other': 'Other',
        // cuisine
        'Japanese': 'Japanese',
        'Chinese': 'Chinese',
        'Thai': 'Thai',
        'Indian': 'Indian',
        'Korean': 'Korean',
        'Vietnamese': 'Vietnamese',
        'Middle Eastern': 'Middle Eastern',
        'Other': 'Other Asian / Fusion',
        // price
        '<20': '<$20',
        '>100': '>$100',
        // portion
        'light': '🥗 Light',
        'normal': '🍲 Normal',
        'heavy': '🍱 Heavy',
        // feature
        'hotpot': '🍲 Hot Pot',
        'bbq': '🥩 BBQ',
        'reservation': '📅 Reservation',
        // tracker
        'unvisited': '✨ Unvisited (New)',
        'visited': '✔️ Visited (1+)',
        'super-like': '❤️ Loved (Double Like)',
        'like': '👍 Liked',
        'dislike': '👎 Disliked / Meh',
        // source
        'web': '🌐 Web',
        'red': '📕 Red',
        'other': '🗣️ Other'
      },
      moreFiltersText: 'More Filters',
      excludedBannerText: 'You excluded <strong id="excludedCount">{count}</strong> restaurant(s) from random rolls this session.',
      restoreAll: 'Restore all',
      emptyTitle: 'No matches found',
      emptySub: 'No restaurants match all of your current inclusion and exclusion filters. Try clearing some filters or restoring excluded spots.',
      emptyReset: 'Reset all filters',
      rouletteTitle: '🎲 Dinner Decider',
      rouletteShuffling: 'Shuffling options...',
      rouletteWinnerBadge: "🎲 Tonight's Pick",
      reRollBtn: '🎲 Re-roll',
      excludeWinnerBtn: '❌ Exclude this one',
      acceptWinnerBtn: '😋 Sounds delicious!',
      openInMap: '📍 Google Maps',
      officialSite: '🌐 Official Site / Guide',
      highlightsHeader: 'Highlights',
      insiderNotesToggle: 'Insider Notes',
      drawerHeaders: {
        summary: 'Review Summary:',
        mustTry: 'Must-Order:',
        skip: 'Worth Noting:',
        tips: 'Insider Tips:',
        vibe: 'Atmosphere:',
        hours: 'Hours:',
        address: 'Address:'
      },
      portionBadge: {
        light: '🥗 Light',
        normal: '🍲 Normal',
        heavy: '🍱 Heavy'
      },
      walkBadge: (m) => m != null ? `🚶 ${m}m walk` : '🚇 Transit',
      walkChip: (m) => m != null ? `🚶 ${m}m` : '🚇 Transit',
      cardMapBtn: '📍 Map',
      cardSourceBtn: '🌐 Web',
      ratingLoved: '❤️ Loved',
      ratingLiked: '👍 Liked',
      ratingDisliked: '👎 Disliked',
      loggedVisits: (count, rating) => `📝 Logged: ${count === 1 ? '1 visit' : count + ' visits'}${rating ? ' • ' + rating : ''}`,
      notVisited: '✨ Not visited yet',
      backToTop: 'Back to top ↑'
    },
    zh: {
      langLabel: 'EN',
      langTitle: 'Switch to English / 切换为英文',
      docTitle: 'Dishpatch · 今晚吃什么 — 多伦多精选美食指南',
      metaDesc: 'Dishpatch 由 mzx 打造 — 多伦多精选亚洲美食与甜品决策轮盘。按饮食习惯、街区、打卡次数、评价筛选，一键摇号！',
      brandAuthor: 'mzx 精选',
      heroTitle: '今晚<em>吃什么</em>？',
      pickForMe: '帮我选',
      searchPlaceholder: '搜索店名、中文名、菜系、招牌菜或街区 (如 拉面、烤肉、火锅)...',
      sortOptions: {
        'default': '🎲 随机推荐 (True Random)',
        'walk': '🚶 步行距离 (从近到远)',
        'price-asc': '💵 价格：从低到高',
        'price-desc': '💎 价格：从高到低',
        'visits-desc': '🏆 打卡最多优先',
        'name-asc': '🔤 名称：A 到 Z'
      },
      shuffleBtnTitle: '换一批随机推荐',
      resultsLabel: '家餐厅匹配',
      modeTipText: '点击1次：包含 ✓ · 点击2次：排除 🚫',
      resetAll: '↺ 重置全部',
      filterGroupLabels: {
        category: '🍽️ 分类',
        food_profile: '🥗 饮食偏好',
        area: '📍 街区位置',
        cuisine: '🥢 菜系风味',
        price: '💵 人均价格',
        portion_size: '🍽️ 分量大小',
        feature: '🔥 特色',
        tracker: '⭐ 打卡标记',
        curation_source: '📌 推荐来源'
      },
      filterChips: {
        // category
        'meal': '🍱 正餐',
        'bar': '🍸 酒吧',
        'cafe': '☕ 咖啡',
        'brunch': '🥞 早午餐',
        'dessert': '🍰 甜品',
        // food_profile
        'more-veggie': '🥬 多蔬菜',
        'more-meat': '🥩 大口吃肉',
        'light-carb': '🍚 低碳轻食',
        'spicy': '🌶️ 嗜辣',
        // area
        'All Downtown': '🏙️ 市中心全部',
        'Downtown (Yonge)': '市中心 (Yonge沿线) 🚶',
        'Downtown (Other)': '市中心 (其他) 🚶',
        'Chinatown': '唐人街 🚶',
        'Queen West': 'Queen West 🚶',
        'Financial Core': '金融核心区 🚶',
        'North': '北区',
        'Midtown': '中城 (Midtown)',
        'Other': '其他',
        // cuisine
        'Japanese': '日料',
        'Chinese': '中餐',
        'Thai': '泰餐',
        'Indian': '印度菜',
        'Korean': '韩餐',
        'Vietnamese': '越餐',
        'Middle Eastern': '中东料理',
        'Other': '其他亚洲 / 融合料理',
        // price
        '<20': '<20刀',
        '>100': '>100刀',
        // portion
        'light': '🥗 少食轻量',
        'normal': '🍲 标准分量',
        'heavy': '🍱 大碗硬菜',
        // feature
        'hotpot': '🍲 火锅',
        'bbq': '🥩 烧烤',
        'reservation': '📅 需预约',
        // tracker
        'unvisited': '✨ 未打卡 (新店)',
        'visited': '✔️ 已打卡 (1次以上)',
        'super-like': '❤️ 双赞 (强烈推荐)',
        'like': '👍 点赞 (满意)',
        'dislike': '👎 踩雷 / 一般',
        // source
        'web': '🌐 网络精选',
        'red': '📕 小红书',
        'other': '🗣️ 亲友/探店'
      },
      moreFiltersText: '更多筛选',
      excludedBannerText: '本次已排除 <strong id="excludedCount">{count}</strong> 家餐厅。',
      restoreAll: '恢复全部',
      emptyTitle: '没有找到符合条件的餐厅',
      emptySub: '当前筛选或排除条件过多，请尝试清除部分条件或恢复已排除的餐厅。',
      emptyReset: '重置所有筛选',
      rouletteTitle: '🎲 今晚吃什么',
      rouletteShuffling: '正在为您挑选美味...',
      rouletteWinnerBadge: '🎲 今晚精选',
      reRollBtn: '🎲 再抽一次',
      excludeWinnerBtn: '❌ 排除这家',
      acceptWinnerBtn: '😋 看起来很棒！',
      openInMap: '📍 地图导航',
      officialSite: '🌐 官网 / 探店指南',
      highlightsHeader: '精选亮点',
      insiderNotesToggle: '探店笔记',
      drawerHeaders: {
        summary: '探店评价:',
        mustTry: '推荐必点:',
        skip: '避雷/注意:',
        tips: '探店贴士:',
        vibe: '探店氛围:',
        hours: '营业时间:',
        address: '详细地址:'
      },
      portionBadge: {
        light: '🥗 少食轻量',
        normal: '🍲 标准分量',
        heavy: '🍱 大碗硬菜'
      },
      walkBadge: (m) => m != null ? `🚶 步行${m}分钟` : '🚇 需乘车',
      walkChip: (m) => m != null ? `🚶 ${m}分钟` : '🚇 需乘车',
      cardMapBtn: '📍 地图导航',
      cardSourceBtn: '🌐 官网/菜单',
      ratingLoved: '❤️ 双赞',
      ratingLiked: '👍 点赞',
      ratingDisliked: '👎 踩雷',
      loggedVisits: (count, rating) => `📝 已打卡 ${count} 次${rating ? ' • ' + rating : ''}`,
      notVisited: '✨ 暂未打卡',
      backToTop: '返回顶部 ↑'
    }
  };

  // --- Translation Helpers ---
  function translateArea(area, lang) {
    if (lang === 'zh') {
      const map = {
        'Downtown (Yonge)': '市中心 (Yonge沿线)',
        'Downtown (Other)': '市中心 (其他)',
        'Chinatown': '唐人街',
        'Queen West': 'Queen West',
        'Financial Core': '金融核心区',
        'North': '北区',
        'Midtown': '中城 (Midtown)',
        'Other': '其他',
        'All Downtown': '市中心全部'
      };
      return map[area] || area;
    }
    return area;
  }

  function translateCuisine(cuisine, lang) {
    if (lang === 'zh') {
      const map = {
        'Japanese': '日料',
        'Chinese': '中餐',
        'Thai': '泰餐',
        'Indian': '印度菜',
        'Korean': '韩餐',
        'Vietnamese': '越餐',
        'Middle Eastern': '中东料理',
        'Other': '其他亚洲 / 融合料理'
      };
      return map[cuisine] || cuisine;
    }
    if (cuisine === 'Other') return 'Other Asian / Fusion';
    return cuisine;
  }

  function getFilterChipLabel(group, val, lang) {
    if (group === 'area') {
      if (val === 'Other') return lang === 'zh' ? '其他' : 'Other';
      if (val === 'North') return lang === 'zh' ? '北区' : 'North';
      if (val === 'Downtown (Yonge)') return lang === 'zh' ? '市中心 (Yonge沿线) 🚶' : 'Downtown (Yonge) 🚶';
      if (val === 'Downtown (Other)') return lang === 'zh' ? '市中心 (其他) 🚶' : 'Downtown (Other) 🚶';
      if (val === 'Chinatown') return lang === 'zh' ? '唐人街 🚶' : 'Chinatown 🚶';
      if (val === 'Queen West') return lang === 'zh' ? 'Queen West 🚶' : 'Queen West 🚶';
      if (val === 'Financial Core') return lang === 'zh' ? '金融核心区 🚶' : 'Financial Core 🚶';
      if (val === 'Midtown') return lang === 'zh' ? '中城 (Midtown)' : 'Midtown';
      return translateArea(val, lang);
    }
    if (group === 'cuisine') {
      return translateCuisine(val, lang);
    }
    const dict = I18N[lang].filterChips;
    if (dict && dict[val]) return dict[val];
    return val;
  }

  // --- Application State ---
  let allOptions = [];
  let excludedIds = new Set();
  let currentWinner = null;
  let shuffleInterval = null;
  let currentLang = 'en';

  const filters = {
    search: '',
    sort: 'default',
    include: {},
    exclude: {}
  };

  filterGroups.forEach(g => {
    filters.include[g] = new Set();
    filters.exclude[g] = new Set();
  });

  // --- DOM Elements ---
  const cardsGrid = document.getElementById('cardsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const sortSelect = document.getElementById('sortSelect');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const langToggleBtn = document.getElementById('langToggleBtn');
  const pickForMeBtn = document.getElementById('pickForMeBtn');
  const activePillsContainer = document.getElementById('activePillsContainer');
  const moreFiltersToggleBtn = document.getElementById('moreFiltersToggleBtn');
  const collapsibleFilters = document.getElementById('collapsibleFilters');
  const moreFiltersActiveBadge = document.getElementById('moreFiltersActiveBadge');

  // Modal elements
  const rouletteModal = document.getElementById('rouletteModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const reRollBtn = document.getElementById('reRollBtn');
  const excludeWinnerBtn = document.getElementById('excludeWinnerBtn');
  const acceptWinnerBtn = document.getElementById('acceptWinnerBtn');
  const rouletteAnimation = document.getElementById('rouletteAnimation');
  const animatorName = document.getElementById('animatorName');
  const winnerCardContainer = document.getElementById('winnerCardContainer');

  // Excluded banner elements
  const excludedBanner = document.getElementById('excludedBanner');
  const excludedCountSpan = document.getElementById('excludedCount');
  const resetExcludedBtn = document.getElementById('resetExcludedBtn');

  // --- Helper: Extract Food Profiles ---
  function getOptionProfiles(option) {
    const list = Array.isArray(option.food_profile) ? [...option.food_profile] : [];
    if (Array.isArray(option.dietary) && option.dietary.includes('spicy') && !list.includes('spicy')) {
      list.push('spicy');
    }
    return list;
  }

  // Helper: Extract Special Features
  function getOptionFeatures(option) {
    return Array.isArray(option.features) ? option.features : [];
  }

  // Helper: Get Price Tag (<20 or >100)
  function getPriceTag(option) {
    if (option.price === 1) return '<20';
    if (option.price === 4) return '>100';
    return null;
  }

  // Normalize filter value
  function normalizeFilterValue(group, val) {
    if (group === 'price') {
      if (val === '1' || val === '<20') return '<20';
      if (val === '4' || val === '>100') return '>100';
    }
    return val;
  }

  // Area matching logic
  function matchesArea(optionArea, targetArea) {
    if (targetArea === 'All Downtown') {
      return (
        optionArea === 'Downtown (Yonge)' ||
        optionArea === 'Downtown (Other)' ||
        optionArea === 'Chinatown' ||
        optionArea === 'Queen West' ||
        optionArea === 'Financial Core'
      );
    }
    return optionArea === targetArea;
  }

  // Tracker matching logic
  function matchTrackerStatus(option, statusKey) {
    const visits = typeof option.visit_count === 'number' ? option.visit_count : 0;
    const rating = option.user_rating || null;

    switch (statusKey) {
      case 'unvisited':
        return visits === 0;
      case 'visited':
        return visits > 0;
      case 'super-like':
        return rating === 'super-like';
      case 'like':
        return rating === 'like';
      case 'dislike':
        return rating === 'dislike';
      default:
        return false;
    }
  }

  // --- Filter Logic ---
  function getFilteredOptions() {
    return allOptions.filter(option => {
      // 1. Text Search (Matches code, name, name_zh, native_name, cuisine, dish, highlights, notes)
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const cleanQuery = query.replace(/^#/, '');
        const matchCode = option.code && (
          option.code.toLowerCase() === cleanQuery ||
          `#${option.code.toLowerCase()}` === query ||
          String(parseInt(option.code, 10)) === cleanQuery
        );
        const matchName = (option.name || '').toLowerCase().includes(query);
        const matchNameZh = (option.name_zh || '').toLowerCase().includes(query);
        const matchNative = (option.native_name || '').toLowerCase().includes(query);
        const matchCuisine = (option.cuisine || '').toLowerCase().includes(query);
        const matchDish = (option.signature_dish || '').toLowerCase().includes(query);
        const matchDishZh = (option.signature_dish_zh || '').toLowerCase().includes(query);
        const matchFlavor = (option.bullet_flavor || '').toLowerCase().includes(query);
        const matchHighlight = (option.bullet_highlight || '').toLowerCase().includes(query);
        const matchHl = (option.highlights || []).join(' ').toLowerCase().includes(query);
        const matchHlZh = (option.highlights_zh || []).join(' ').toLowerCase().includes(query);
        const matchAddr = (option.address || '').toLowerCase().includes(query);

        let matchNotes = false;
        if (option.review_notes) {
          const rn = option.review_notes;
          const notesText = `${rn.summary || ''} ${rn.must_try || ''} ${rn.tips || ''} ${rn.skip_or_neutral || ''} ${rn.vibe || ''}`.toLowerCase();
          matchNotes = notesText.includes(query);
        }
        if (!matchNotes && option.review_notes_en) {
          const rne = option.review_notes_en;
          const notesEnText = `${rne.summary || ''} ${rne.must_try || ''} ${rne.tips || ''} ${rne.skip_or_neutral || ''} ${rne.vibe || ''}`.toLowerCase();
          matchNotes = notesEnText.includes(query);
        }

        if (!matchCode && !matchName && !matchNameZh && !matchNative && !matchCuisine && !matchDish && !matchDishZh && !matchFlavor && !matchHighlight && !matchHl && !matchHlZh && !matchAddr && !matchNotes) {
          return false;
        }
      }

      // 2. Check Exclude Filters (反选 / 排除 🚫): If ANY excluded item matches, REJECT
      for (const group of filterGroups) {
        const excludedSet = filters.exclude[group];
        if (excludedSet.size === 0) continue;

        if (group === 'tracker') {
          for (const statusKey of excludedSet) {
            if (matchTrackerStatus(option, statusKey)) return false;
          }
        } else if (group === 'category') {
          if (excludedSet.has(option.category)) return false;
        } else if (group === 'food_profile') {
          const profiles = getOptionProfiles(option);
          if (profiles.some(p => excludedSet.has(p))) return false;
        } else if (group === 'area') {
          for (const val of excludedSet) {
            if (matchesArea(option.area, val)) return false;
          }
        } else if (group === 'cuisine') {
          if (excludedSet.has(option.cuisine)) return false;
        } else if (group === 'price') {
          const pTag = getPriceTag(option);
          if (pTag && excludedSet.has(pTag)) return false;
        } else if (group === 'portion_size') {
          if (excludedSet.has(option.portion_size)) return false;
        } else if (group === 'curation_source') {
          if (excludedSet.has(option.curation_source)) return false;
        } else if (group === 'feature') {
          const feats = getOptionFeatures(option);
          if (feats.some(f => excludedSet.has(f))) return false;
        }
      }

      // 3. Check Include Filters (正选 / 包含 ✓): Must match at least one in each active group
      for (const group of filterGroups) {
        const includedSet = filters.include[group];
        if (includedSet.size === 0) continue;

        if (group === 'tracker') {
          let matched = false;
          for (const statusKey of includedSet) {
            if (matchTrackerStatus(option, statusKey)) {
              matched = true;
              break;
            }
          }
          if (!matched) return false;
        } else if (group === 'category') {
          if (!includedSet.has(option.category)) return false;
        } else if (group === 'food_profile') {
          const profiles = getOptionProfiles(option);
          if (!profiles.some(p => includedSet.has(p))) return false;
        } else if (group === 'area') {
          let matched = false;
          for (const val of includedSet) {
            if (matchesArea(option.area, val)) {
              matched = true;
              break;
            }
          }
          if (!matched) return false;
        } else if (group === 'cuisine') {
          if (!includedSet.has(option.cuisine)) return false;
        } else if (group === 'price') {
          const pTag = getPriceTag(option);
          if (!pTag || !includedSet.has(pTag)) return false;
        } else if (group === 'portion_size') {
          if (!includedSet.has(option.portion_size)) return false;
        } else if (group === 'curation_source') {
          if (!includedSet.has(option.curation_source)) return false;
        } else if (group === 'feature') {
          const feats = getOptionFeatures(option);
          if (!feats.some(f => includedSet.has(f))) return false;
        }
      }

      return true;
    });
  }

  // --- True Random Recommendation Engine ---
  const randomOrderSeedMap = new Map();

  function trueRandomShuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      let rand;
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const buf = new Uint32Array(1);
        window.crypto.getRandomValues(buf);
        rand = buf[0] / (0xffffffff + 1);
      } else {
        rand = Math.random();
      }
      const j = Math.floor(rand * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function reshuffleOptions() {
    const shuffled = trueRandomShuffle(allOptions);
    randomOrderSeedMap.clear();
    shuffled.forEach((opt, idx) => {
      randomOrderSeedMap.set(opt.id, idx);
    });
  }

  // --- Sorting Logic ---
  function sortOptions(options) {
    const list = [...options];

    switch (filters.sort) {
      case 'walk':
        return list.sort((a, b) => {
          const timeA = a.walking_time_min != null ? a.walking_time_min : 999;
          const timeB = b.walking_time_min != null ? b.walking_time_min : 999;
          return timeA - timeB;
        });

      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);

      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);

      case 'visits-desc':
        return list.sort((a, b) => {
          const vA = typeof a.visit_count === 'number' ? a.visit_count : 0;
          const vB = typeof b.visit_count === 'number' ? b.visit_count : 0;
          return vB - vA;
        });

      case 'name-asc':
        return list.sort((a, b) => {
          const nameA = currentLang === 'zh' ? (a.name_zh || a.name) : a.name;
          const nameB = currentLang === 'zh' ? (b.name_zh || b.name) : b.name;
          return nameA.localeCompare(nameB);
        });

      case 'default':
      default:
        // True random recommendation order
        return list.sort((a, b) => {
          const rankA = randomOrderSeedMap.has(a.id) ? randomOrderSeedMap.get(a.id) : 0;
          const rankB = randomOrderSeedMap.has(b.id) ? randomOrderSeedMap.get(b.id) : 0;
          return rankA - rankB;
        });
    }
  }

  // --- Apply & Sync Filters ---
  function applyFilters() {
    const filtered = getFilteredOptions();
    const sorted = sortOptions(filtered);

    renderCards(sorted);
    resultsCount.textContent = sorted.length;
    renderActiveSummary();
    updateUrlParams();
    updatePresetChipsState();
    updateCollapsedFiltersBadge();
  }

  function updateCollapsedFiltersBadge() {
    if (!moreFiltersActiveBadge) return;
    const activeCount =
      (filters.search ? 1 : 0) +
      (filters.sort !== 'default' ? 1 : 0) +
      (filters.include['price'] ? filters.include['price'].size : 0) +
      (filters.exclude['price'] ? filters.exclude['price'].size : 0) +
      (filters.include['feature'] ? filters.include['feature'].size : 0) +
      (filters.exclude['feature'] ? filters.exclude['feature'].size : 0) +
      (filters.include['tracker'] ? filters.include['tracker'].size : 0) +
      (filters.exclude['tracker'] ? filters.exclude['tracker'].size : 0) +
      (filters.include['curation_source'] ? filters.include['curation_source'].size : 0) +
      (filters.exclude['curation_source'] ? filters.exclude['curation_source'].size : 0);

    if (activeCount > 0) {
      moreFiltersActiveBadge.textContent = activeCount;
      moreFiltersActiveBadge.classList.remove('hidden');
    } else {
      moreFiltersActiveBadge.classList.add('hidden');
    }
  }

  // --- Render Active Summary Pills ---
  function renderActiveSummary() {
    const isZh = currentLang === 'zh';
    let pills = [];

    // Includes
    for (const group of filterGroups) {
      filters.include[group].forEach(val => {
        const label = getFilterChipLabel(group, val, currentLang);
        pills.push(`
          <button type="button" class="summary-pill include-pill" data-action="clear-include" data-group="${group}" data-value="${val}">
            <span>✓ ${label}</span> <span class="pill-x">✕</span>
          </button>
        `);
      });
    }

    // Excludes
    for (const group of filterGroups) {
      filters.exclude[group].forEach(val => {
        const label = getFilterChipLabel(group, val, currentLang);
        const prefix = isZh ? '🚫 已排除: ' : '🚫 Excluded: ';
        pills.push(`
          <button type="button" class="summary-pill exclude-pill" data-action="clear-exclude" data-group="${group}" data-value="${val}">
            <span>${prefix}${label}</span> <span class="pill-x">✕</span>
          </button>
        `);
      });
    }

    activePillsContainer.innerHTML = pills.join('');
  }

  // --- Rendering Cards ---
  function renderCards(options) {
    if (options.length === 0) {
      cardsGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    const html = options.map(option => createCardHtml(option)).join('');
    cardsGrid.innerHTML = html;

    const images = cardsGrid.querySelectorAll('.card-image');
    images.forEach(img => {
      img.addEventListener('error', function () {
        this.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
      });
    });
  }

  function getCurationBadgeMeta(source, lang) {
    const isZh = lang === 'zh';
    switch (source) {
      case 'red':
      case 'xiaohongshu':
        return {
          icon: '📕',
          text: isZh ? '小红书' : 'Red',
          className: 'tag-red'
        };
      case 'other':
      case 'word-of-mouth':
        return {
          icon: '🗣️',
          text: isZh ? '亲友/探店' : 'Other',
          className: 'tag-other'
        };
      case 'web':
      default:
        return {
          icon: '🌐',
          text: isZh ? '网络精选' : 'Web',
          className: 'tag-web'
        };
    }
  }

  function formatReviewList(content) {
    if (!content) return '';
    if (Array.isArray(content)) {
      return content.map(item => `<div class="drawer-list-item">${escapeHtml(item)}</div>`).join('');
    }
    const lines = String(content).split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => `<div class="drawer-list-item">${escapeHtml(line)}</div>`).join('');
  }

  function renderCardHighlightsHtml(opt, lang) {
    const isZh = lang === 'zh';
    let list = [];
    if (isZh) {
      if (Array.isArray(opt.highlights_zh) && opt.highlights_zh.length === 2) {
        list = opt.highlights_zh;
      } else if (Array.isArray(opt.highlights) && opt.highlights.length > 0) {
        list = opt.highlights.slice(0, 2);
      }
    } else {
      if (Array.isArray(opt.highlights) && opt.highlights.length > 0) {
        list = opt.highlights.slice(0, 2);
      } else if (Array.isArray(opt.highlights_zh) && opt.highlights_zh.length > 0) {
        list = opt.highlights_zh.slice(0, 2);
      }
    }
    if (!list || list.length === 0) return '';

    const label = I18N[lang].highlightsHeader;

    return `
      <div class="card-highlights">
        <div class="highlights-header">
          <span class="highlights-icon">✨</span>
          <span class="highlights-label">${label}</span>
        </div>
        <div class="highlights-list">
          ${list.map(h => `
            <div class="highlights-item">
              <span class="highlights-bullet">•</span>
              <span class="highlights-text">${escapeHtml(h)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderNotesToggleHtml(lang) {
    const label = I18N[lang].insiderNotesToggle;
    return `
      <button type="button" class="notes-toggle" aria-expanded="false" aria-label="${label}" title="${label}">
        <span class="notes-arrow" aria-hidden="true">▾</span>
      </button>
    `;
  }

  function renderReviewDrawerHtml(opt, lang) {
    const isZh = lang === 'zh';
    const notes = isZh ? (opt.review_notes || {}) : (opt.review_notes_en || opt.review_notes || {});
    const hoursText = isZh ? (opt.hours_note_zh || opt.hours_note) : (opt.hours_note || opt.hours_note_zh);
    const headers = I18N[lang].drawerHeaders;

    let rows = '';

    if (notes.summary) {
      rows += `
        <div class="drawer-summary-snippet">
          <p class="drawer-summary-text">${escapeHtml(notes.summary)}</p>
        </div>
      `;
    }

    if (notes.must_try) {
      rows += `
        <div class="drawer-row must-try-row">
          <span class="drawer-row-icon">🌟</span>
          <div class="drawer-row-content">
            <strong class="drawer-row-title">${headers.mustTry}</strong>
            <div class="drawer-dish-list">${formatReviewList(notes.must_try)}</div>
          </div>
        </div>
      `;
    }

    if (notes.skip_or_neutral) {
      rows += `
        <div class="drawer-row skip-row">
          <span class="drawer-row-icon">⚠️</span>
          <div class="drawer-row-content">
            <strong class="drawer-row-title">${headers.skip}</strong>
            <div class="drawer-dish-list">${formatReviewList(notes.skip_or_neutral)}</div>
          </div>
        </div>
      `;
    }

    if (notes.tips) {
      rows += `
        <div class="drawer-row tip-row">
          <span class="drawer-row-icon">💡</span>
          <div class="drawer-row-content">
            <strong class="drawer-row-title">${headers.tips}</strong>
            <p class="drawer-tip-text">${escapeHtml(notes.tips)}</p>
          </div>
        </div>
      `;
    }

    if (notes.vibe) {
      rows += `
        <div class="drawer-row vibe-row">
          <span class="drawer-row-icon">🌿</span>
          <div class="drawer-row-content">
            <strong class="drawer-row-title">${headers.vibe}</strong>
            <span class="drawer-vibe-text">${escapeHtml(notes.vibe)}</span>
          </div>
        </div>
      `;
    }

    if (hoursText) {
      rows += `
        <div class="drawer-row hours-row">
          <span class="drawer-row-icon">🕒</span>
          <div class="drawer-row-content">
            <strong class="drawer-row-title">${headers.hours}</strong>
            <p class="drawer-hours-text">${escapeHtml(hoursText)}</p>
          </div>
        </div>
      `;
    }

    if (opt.address) {
      rows += `
        <div class="drawer-row address-row">
          <span class="drawer-row-icon">📍</span>
          <div class="drawer-row-content">
            <strong class="drawer-row-title">${headers.address}</strong>
            <p class="drawer-address-text">${escapeHtml(opt.address)}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="notes-panel hidden">
        ${rows}
      </div>
    `;
  }

  function createCardHtml(opt) {
    const isZh = currentLang === 'zh';

    const walkingBadge = opt.walking_time_min != null
      ? `<span class="badge-walk" title="${isZh ? '步行时间估算' : 'Estimated walking time'}">🚶 ${isZh ? `步行${opt.walking_time_min}分钟` : `${opt.walking_time_min}m walk`}</span>`
      : `<span class="badge-walk badge-walk-transit" title="${isZh ? '需乘车或驾车' : 'Transit / Outer Area'}">🚇 ${isZh ? '需乘车' : 'Transit'}</span>`;

    const walkChip = opt.walking_time_min != null
      ? `<span class="meta-chip walk-chip" title="${isZh ? '步行时间估算' : 'Estimated walking time'}">🚶 ${isZh ? `${opt.walking_time_min}分钟` : `${opt.walking_time_min}m`}</span>`
      : `<span class="meta-chip transit-chip" title="${isZh ? '需乘车或驾车' : 'Transit or drive'}">🚇 ${isZh ? '需乘车' : 'Transit'}</span>`;

    const codeBadge = opt.code
      ? `<span class="card-code-badge" title="#${escapeHtml(opt.code)}">#${escapeHtml(opt.code)}</span>`
      : '';

    let categoryBadge = '';
    if (opt.category === 'bar') {
      categoryBadge = `<span class="badge-cuisine badge-cat-bar">🍸 ${isZh ? '酒吧' : 'Bar'}</span>`;
    } else if (opt.category === 'cafe') {
      categoryBadge = `<span class="badge-cuisine badge-cat-cafe">☕ ${isZh ? '咖啡' : 'Cafe'}</span>`;
    } else if (opt.category === 'brunch') {
      categoryBadge = `<span class="badge-cuisine badge-cat-brunch">🥞 ${isZh ? '早午餐' : 'Brunch'}</span>`;
    } else if (opt.category === 'dessert') {
      categoryBadge = `<span class="badge-cuisine badge-cat-dessert">🍰 ${isZh ? '甜品' : 'Dessert'}</span>`;
    } else {
      categoryBadge = `<span class="badge-cuisine">${escapeHtml(isZh ? translateCuisine(opt.cuisine, 'zh') : opt.cuisine)}</span>`;
    }

    const cuisineChip = opt.category !== 'meal' && opt.cuisine !== 'Other'
      ? `<span class="meta-chip cuisine-chip">🥢 ${escapeHtml(isZh ? translateCuisine(opt.cuisine, 'zh') : opt.cuisine)}</span>`
      : '';

    const portionMap = {
      light: isZh ? '🥗 少食轻量' : '🥗 Light',
      normal: isZh ? '🍲 标准分量' : '🍲 Normal',
      heavy: isZh ? '🍱 大碗硬菜' : '🍱 Heavy'
    };
    const portionLabel = portionMap[opt.portion_size] || opt.portion_size;

    // Diet profile badges
    let profileBadges = '';
    const profiles = getOptionProfiles(opt);
    if (profiles.includes('more-veggie')) profileBadges += `<span class="meta-chip profile-chip-veggie">🥬 ${isZh ? '多蔬菜' : 'Veggie-Rich'}</span>`;
    if (profiles.includes('more-meat')) profileBadges += `<span class="meta-chip profile-chip-meat">🥩 ${isZh ? '大口吃肉' : 'Meat-Lover'}</span>`;
    if (profiles.includes('light-carb')) profileBadges += `<span class="meta-chip profile-chip-carb">🍚 ${isZh ? '低碳轻食' : 'Low-Carb'}</span>`;
    if (profiles.includes('spicy')) profileBadges += `<span class="meta-chip profile-chip-spicy">🌶️ ${isZh ? '嗜辣' : 'Spicy'}</span>`;

    // Feature badges
    let featureBadges = '';
    const feats = getOptionFeatures(opt);
    if (feats.includes('hotpot')) featureBadges += `<span class="meta-chip feature-chip-hotpot">🍲 ${isZh ? '火锅' : 'Hot Pot'}</span>`;
    if (feats.includes('bbq')) featureBadges += `<span class="meta-chip feature-chip-bbq">🥩 ${isZh ? '烧烤' : 'BBQ'}</span>`;
    if (feats.includes('reservation')) featureBadges += `<span class="meta-chip feature-chip-reservation">📅 ${isZh ? '需预约' : 'Reservation'}</span>`;

    // Curation Source badge
    const curationMeta = getCurationBadgeMeta(opt.curation_source, currentLang);

    // Personal rating
    const currentRating = opt.user_rating || null;
    let ratingTag = '';
    if (currentRating === 'super-like') {
      ratingTag = `<span class="rating-tag rating-tag-super" title="${isZh ? '双赞 (强烈推荐)' : 'Loved (Double Like)'}">❤️❤️</span>`;
    } else if (currentRating === 'like') {
      ratingTag = `<span class="rating-tag rating-tag-like" title="${isZh ? '点赞' : 'Liked'}">👍</span>`;
    } else if (currentRating === 'dislike') {
      ratingTag = `<span class="rating-tag rating-tag-dislike" title="${isZh ? '踩雷 / 一般' : 'Disliked / Meh'}">👎</span>`;
    }

    // Price tag: <20 or >100
    let priceChip = '';
    const pTag = getPriceTag(opt);
    if (pTag === '<20') {
      priceChip = `<span class="meta-chip budget-chip-low">${isZh ? '<20刀' : '<$20'}</span>`;
    } else if (pTag === '>100') {
      priceChip = `<span class="meta-chip budget-chip-high">${isZh ? '>100刀' : '>$100'}</span>`;
    }

    const mapButton = opt.maps_url
      ? `<a href="${escapeHtml(opt.maps_url)}" target="_blank" rel="noopener noreferrer" class="card-btn btn-map" title="${isZh ? '在Google地图中打开' : 'Open in Google Maps'}">${I18N[currentLang].cardMapBtn}</a>`
      : '';

    const sourceButton = opt.source_url
      ? `<a href="${escapeHtml(opt.source_url)}" target="_blank" rel="noopener noreferrer" class="card-btn btn-source" title="${isZh ? '访问官方网站/探店指南' : 'Visit official site / guide'}">${I18N[currentLang].cardSourceBtn}</a>`
      : '';

    const imageSrc = opt.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

    let titleHtml = '';
    if (isZh) {
      const mainName = opt.name_zh || opt.name;
      const subName = (opt.name_zh && opt.name !== opt.name_zh) ? ` <span class="native-name">(${escapeHtml(opt.name)})</span>` : '';
      titleHtml = `<h3 class="card-title">${escapeHtml(mainName)}${subName}</h3>`;
    } else {
      const mainName = opt.name;
      const subName = opt.native_name ? ` <span class="native-name">(${escapeHtml(opt.native_name)})</span>` : '';
      titleHtml = `<h3 class="card-title">${escapeHtml(mainName)}${subName}</h3>`;
    }

    const areaLabel = isZh ? translateArea(opt.area, 'zh') : opt.area;

    return `
      <article class="restaurant-card" id="card-${escapeHtml(opt.id)}" data-id="${escapeHtml(opt.id)}">
        <div class="card-image-wrap">
          <img 
            src="${escapeHtml(imageSrc)}" 
            alt="${escapeHtml(opt.name)}" 
            class="card-image" 
            loading="lazy"
          >
          <div class="card-overlay-badges">
            ${categoryBadge}
            ${walkingBadge}
          </div>
        </div>

        <div class="card-body">
          <div class="card-header-row">
            <div class="card-title-group">
              ${codeBadge}
              ${titleHtml}
              ${ratingTag}
            </div>
          </div>

          <!-- Highlights (2 items) -->
          ${renderCardHighlightsHtml(opt, currentLang)}

          <!-- Tags -->
          <div class="card-meta-chips">
            <span class="meta-chip area-chip">📍 ${escapeHtml(areaLabel)}</span>
            ${walkChip}
            ${cuisineChip}
            <span class="meta-chip portion-chip">${escapeHtml(portionLabel)}</span>
            ${priceChip}
            ${profileBadges}
            ${featureBadges}
          </div>

          <div class="card-footer">
            <div class="curation-tag-wrap">
              <span class="curation-badge ${escapeHtml(curationMeta.className)}" title="${escapeHtml(curationMeta.text)}">
                ${curationMeta.icon} ${escapeHtml(curationMeta.text)}
              </span>
            </div>
            <div class="card-links">
              ${mapButton}
              ${sourceButton}
            </div>
          </div>

          <!-- Collapsible Insider Notes -->
          ${renderReviewDrawerHtml(opt, currentLang)}

          <!-- Minimal expand chevron at the very bottom of the card -->
          ${renderNotesToggleHtml(currentLang)}
        </div>
      </article>
    `;
  }

  // --- Tri-State Chip Click Handler ---
  function handleChipClick(chip) {
    const group = chip.dataset.group;
    const rawVal = chip.dataset.value;
    const val = normalizeFilterValue(group, rawVal);

    const isIncluded = filters.include[group].has(val);
    const isExcluded = filters.exclude[group].has(val);

    if (!isIncluded && !isExcluded) {
      filters.include[group].add(val);
    } else if (isIncluded) {
      filters.include[group].delete(val);
      filters.exclude[group].add(val);
    } else {
      filters.exclude[group].delete(val);
    }

    syncChipsUI();
    applyFilters();
  }

  function syncChipsUI() {
    document.querySelectorAll('.tri-chip').forEach(chip => {
      const group = chip.dataset.group;
      const rawVal = chip.dataset.value;
      const val = normalizeFilterValue(group, rawVal);

      if (filters.include[group] && filters.include[group].has(val)) {
        chip.dataset.state = 'included';
        chip.classList.add('chip-included');
        chip.classList.remove('chip-excluded');
      } else if (filters.exclude[group] && filters.exclude[group].has(val)) {
        chip.dataset.state = 'excluded';
        chip.classList.add('chip-excluded');
        chip.classList.remove('chip-included');
      } else {
        chip.dataset.state = 'none';
        chip.classList.remove('chip-included', 'chip-excluded');
      }
    });
  }

  // --- Preset Application ---
  function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    filterGroups.forEach(g => {
      filters.include[g].clear();
      filters.exclude[g].clear();
    });

    if (preset.include) {
      for (const [g, arr] of Object.entries(preset.include)) {
        arr.forEach(v => filters.include[g].add(v));
      }
    }
    if (preset.exclude) {
      for (const [g, arr] of Object.entries(preset.exclude)) {
        arr.forEach(v => filters.exclude[g].add(v));
      }
    }

    syncChipsUI();
    applyFilters();
  }

  // --- Reset All Filters ---
  function resetAllFilters() {
    searchInput.value = '';
    filters.search = '';
    clearSearchBtn.classList.add('hidden');

    sortSelect.value = 'default';
    filters.sort = 'default';

    reshuffleOptions();

    filterGroups.forEach(g => {
      filters.include[g].clear();
      filters.exclude[g].clear();
    });

    syncChipsUI();
    applyFilters();
  }

  // --- URL Query String Sync ---
  function updateUrlParams() {
    const params = new URLSearchParams();

    if (currentLang !== 'en') {
      params.set('lang', currentLang);
    }
    if (filters.search) params.set('q', filters.search);
    if (filters.sort !== 'default') params.set('sort', filters.sort);

    // Includes
    for (const group of filterGroups) {
      if (filters.include[group].size > 0) {
        params.set(group, Array.from(filters.include[group]).join(','));
      }
    }

    // Excludes
    for (const group of filterGroups) {
      if (filters.exclude[group].size > 0) {
        params.set(`no_${group}`, Array.from(filters.exclude[group]).join(','));
      }
    }

    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  }

  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('lang')) {
      const pLang = params.get('lang');
      if (pLang === 'zh' || pLang === 'en') {
        currentLang = pLang;
      }
    }

    if (params.has('q')) {
      filters.search = params.get('q');
      searchInput.value = filters.search;
      clearSearchBtn.classList.remove('hidden');
    }

    if (params.has('sort')) {
      filters.sort = params.get('sort');
      sortSelect.value = filters.sort;
    }

    filterGroups.forEach(group => {
      if (params.has(group)) {
        params.get(group).split(',').forEach(v => {
          if (!v) return;
          const val = normalizeFilterValue(group, v);
          filters.include[group].add(val);
        });
      }
    });

    filterGroups.forEach(group => {
      const noKey = `no_${group}`;
      if (params.has(noKey)) {
        params.get(noKey).split(',').forEach(v => {
          if (!v) return;
          const val = normalizeFilterValue(group, v);
          filters.exclude[group].add(val);
        });
      }
    });
  }

  // Sync active state of preset buttons
  function updatePresetChipsState() {
    const isSingleActive = (targetGroup, targetVal) => {
      let activeCount = 0;
      let matched = false;
      for (const g of filterGroups) {
        activeCount += filters.include[g].size + filters.exclude[g].size;
        if (g === targetGroup && filters.include[g].has(targetVal)) {
          matched = true;
        }
      }
      return activeCount === 1 && matched;
    };

    document.querySelectorAll('.preset-chip').forEach(chip => {
      const key = chip.dataset.preset;
      let isActive = false;

      switch (key) {
        case 'fast-cheap':
          isActive = isSingleActive('price', '<20');
          break;
        case 'nearby-walk':
          isActive = isSingleActive('area', 'All Downtown');
          break;
        case 'bar':
          isActive = isSingleActive('category', 'bar');
          break;
        case 'cafe':
          isActive = isSingleActive('category', 'cafe');
          break;
        case 'brunch':
          isActive = isSingleActive('category', 'brunch');
          break;
        case 'sweet-dessert':
          isActive = isSingleActive('category', 'dessert');
          break;
        case 'more-veggie':
          isActive = isSingleActive('food_profile', 'more-veggie');
          break;
        case 'more-meat':
          isActive = isSingleActive('food_profile', 'more-meat');
          break;
        case 'light-carb':
          isActive = isSingleActive('food_profile', 'light-carb');
          break;
        case 'spicy':
          isActive = isSingleActive('food_profile', 'spicy');
          break;
        case 'unvisited':
          isActive = isSingleActive('tracker', 'unvisited');
          break;
        case 'favorites':
          isActive = isSingleActive('tracker', 'super-like');
          break;
      }

      chip.classList.toggle('active', isActive);
    });
  }

  // --- Roulette Decider ---
  function startRoulette() {
    const matching = getFilteredOptions().filter(opt => !excludedIds.has(opt.id));

    if (matching.length === 0) {
      alert(currentLang === 'zh'
        ? '当前筛选条件（或排除名单）下没有可用餐厅，请重置筛选或恢复已排除餐厅后再试！'
        : 'No available restaurants match your current filters (or all matching spots are excluded). Try resetting filters or restoring excluded spots!'
      );
      return;
    }

    rouletteModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    rouletteAnimation.classList.remove('hidden');
    winnerCardContainer.classList.add('hidden');

    let count = 0;
    const maxCycles = 15;
    const intervalTime = 70;

    if (shuffleInterval) clearInterval(shuffleInterval);

    shuffleInterval = setInterval(() => {
      const randOpt = matching[Math.floor(Math.random() * matching.length)];
      animatorName.textContent = currentLang === 'zh' ? (randOpt.name_zh || randOpt.name) : randOpt.name;
      count++;

      if (count >= maxCycles) {
        clearInterval(shuffleInterval);
        shuffleInterval = null;

        const winner = matching[Math.floor(Math.random() * matching.length)];
        currentWinner = winner;

        rouletteAnimation.classList.add('hidden');
        showWinnerModal(winner);
        winnerCardContainer.classList.remove('hidden');
      }
    }, intervalTime);
  }

  function showWinnerModal(winner) {
    const isZh = currentLang === 'zh';
    const winnerPTag = getPriceTag(winner);
    let winnerPriceChip = '';
    if (winnerPTag === '<20') {
      winnerPriceChip = `<span class="meta-chip budget-chip-low">${isZh ? '<20刀' : '<$20'}</span>`;
    } else if (winnerPTag === '>100') {
      winnerPriceChip = `<span class="meta-chip budget-chip-high">${isZh ? '>100刀' : '>$100'}</span>`;
    }

    const areaName = isZh ? translateArea(winner.area, 'zh') : winner.area;
    const walkNote = winner.walking_time_min != null
      ? `🚶 ${isZh ? `步行${winner.walking_time_min}分钟` : `${winner.walking_time_min}m walk`} (${areaName})`
      : `📍 ${areaName}`;

    const curationMeta = getCurationBadgeMeta(winner.curation_source, currentLang);
    const cuisineName = isZh ? translateCuisine(winner.cuisine, 'zh') : winner.cuisine;

    const visitCount = typeof winner.visit_count === 'number' ? winner.visit_count : 0;
    const currentRating = winner.user_rating || null;
    let ratingNote = '';
    if (currentRating === 'super-like') ratingNote = isZh ? ' • ❤️ 双赞' : ' • ❤️ Loved';
    else if (currentRating === 'like') ratingNote = isZh ? ' • 👍 点赞' : ' • 👍 Liked';
    else if (currentRating === 'dislike') ratingNote = isZh ? ' • 👎 踩雷' : ' • 👎 Disliked';

    let visitsText = '';
    if (isZh) {
      visitsText = visitCount > 0 ? `📝 已打卡 ${visitCount} 次${ratingNote}` : '✨ 暂未打卡';
    } else {
      const vWord = visitCount === 1 ? '1 visit' : `${visitCount} visits`;
      visitsText = visitCount > 0 ? `📝 Logged: ${vWord}${ratingNote}` : '✨ Not visited yet';
    }

    let winnerTitle = '';
    if (isZh) {
      const main = winner.name_zh || winner.name;
      const sub = (winner.name_zh && winner.name !== winner.name_zh) ? ` <span class="native-name">(${escapeHtml(winner.name)})</span>` : '';
      winnerTitle = `${escapeHtml(main)}${sub}`;
    } else {
      const main = winner.name;
      const sub = winner.native_name ? ` <span class="native-name">(${escapeHtml(winner.native_name)})</span>` : '';
      winnerTitle = `${escapeHtml(main)}${sub}`;
    }

    const badgeText = I18N[currentLang].rouletteWinnerBadge;

    winnerCardContainer.innerHTML = `
      <div class="winner-highlight">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; gap: 0.5rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.45rem;">
            <span class="winner-badge">${badgeText}</span>
            ${winner.code ? `<span class="card-code-badge" style="font-size: 0.78rem; padding: 0.2rem 0.5rem;">#${escapeHtml(winner.code)}</span>` : ''}
          </div>
          <span class="curation-badge ${escapeHtml(curationMeta.className)}">
            ${curationMeta.icon} ${escapeHtml(curationMeta.text)}
          </span>
        </div>
        <h4 class="winner-title">${winnerTitle}</h4>
        
        <div class="winner-details" style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0;">
          <span class="meta-chip area-chip">${escapeHtml(walkNote)}</span>
          <span class="meta-chip">${escapeHtml(cuisineName)}</span>
          ${winnerPriceChip}
          ${getOptionFeatures(winner).map(f => {
            if (f === 'hotpot') return `<span class="meta-chip feature-chip-hotpot">🍲 ${isZh ? '火锅' : 'Hot Pot'}</span>`;
            if (f === 'bbq') return `<span class="meta-chip feature-chip-bbq">🥩 ${isZh ? '烧烤' : 'BBQ'}</span>`;
            if (f === 'reservation') return `<span class="meta-chip feature-chip-reservation">📅 ${isZh ? '需预约' : 'Reservation'}</span>`;
            return '';
          }).join('')}
          <span class="meta-chip" style="font-weight: 700; color: var(--brand-primary);">${visitsText}</span>
        </div>

        <!-- Highlights (2 items) -->
        ${renderCardHighlightsHtml(winner, currentLang)}

        <!-- Collapsible Insider Notes -->
        <div class="notes-toggle-row">${renderNotesToggleHtml(currentLang)}</div>
        ${renderReviewDrawerHtml(winner, currentLang)}

        <div class="winner-links" style="margin-top: 0.85rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${winner.maps_url ? `<a href="${escapeHtml(winner.maps_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-map" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">${I18N[currentLang].openInMap}</a>` : ''}
          ${winner.source_url ? `<a href="${escapeHtml(winner.source_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-source" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">${I18N[currentLang].officialSite}</a>` : ''}
        </div>
      </div>
    `;
  }

  function closeRouletteModal() {
    if (shuffleInterval) {
      clearInterval(shuffleInterval);
      shuffleInterval = null;
    }
    rouletteModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function excludeCurrentWinner() {
    if (!currentWinner) return;

    excludedIds.add(currentWinner.id);
    updateExcludedBanner();
    startRoulette();
  }

  function acceptWinner() {
    if (!currentWinner) return;

    const targetId = currentWinner.id;
    closeRouletteModal();

    const cardEl = document.getElementById(`card-${targetId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('card-picked');
      setTimeout(() => {
        cardEl.classList.remove('card-picked');
      }, 3000);
    }
  }

  // --- Excluded Spots Handling ---
  function updateExcludedBanner() {
    if (!excludedBanner || !excludedCountSpan) return;
    const count = excludedIds.size;
    const isZh = currentLang === 'zh';

    if (count > 0) {
      excludedCountSpan.textContent = count;
      excludedBanner.classList.remove('hidden');
      const bannerSpan = excludedBanner.querySelector('span');
      if (bannerSpan) {
        bannerSpan.innerHTML = isZh
          ? `本次已排除 <strong id="excludedCount">${count}</strong> 家餐厅。`
          : `You excluded <strong id="excludedCount">${count}</strong> restaurant(s) from random rolls this session.`;
      }
      if (resetExcludedBtn) {
        resetExcludedBtn.textContent = I18N[currentLang].restoreAll;
      }
    } else {
      excludedBanner.classList.add('hidden');
    }
  }

  function resetExcluded() {
    excludedIds.clear();
    updateExcludedBanner();
    applyFilters();
  }

  // --- Apply Language Engine ---
  function updatePresetChipsText(lang) {
    const chips = document.querySelectorAll('#presetChipsContainer .preset-chip');
    chips.forEach(chip => {
      const key = chip.dataset.preset;
      const labelSpan = chip.querySelector('span');
      if (labelSpan && I18N[lang].presets[key]) {
        labelSpan.textContent = I18N[lang].presets[key];
      }
    });
  }

  function updateFilterChipsText(lang) {
    // Update group labels
    document.querySelectorAll('.filter-group').forEach(fg => {
      const g = fg.dataset.group;
      const labelEl = fg.querySelector('.filter-group-label');
      if (labelEl && I18N[lang].filterGroupLabels[g]) {
        labelEl.textContent = I18N[lang].filterGroupLabels[g];
      }
    });

    // Update chip labels
    document.querySelectorAll('.filter-chip').forEach(chip => {
      const group = chip.dataset.group;
      const val = chip.dataset.value;
      const labelSpan = chip.querySelector('.chip-label');
      if (labelSpan) {
        const translated = getFilterChipLabel(group, val, lang);
        if (translated) {
          labelSpan.textContent = translated;
        }
      }
      if (group === 'area' && val === 'North') {
        chip.title = lang === 'zh' ? '北约克 & 万锦 (Markham)' : 'North York & Markham';
      }
    });
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.title = I18N[lang].docTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', I18N[lang].metaDesc);

    const langLabel = document.getElementById('langToggleLabel');
    if (langLabel) langLabel.textContent = I18N[lang].langLabel;
    if (langToggleBtn) {
      langToggleBtn.setAttribute('title', I18N[lang].langTitle);
      langToggleBtn.setAttribute('aria-label', I18N[lang].langTitle);
    }

    // Brand author
    const brandAuthor = document.querySelector('.brand-author');
    if (brandAuthor) brandAuthor.textContent = I18N[lang].brandAuthor;

    // Hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.innerHTML = I18N[lang].heroTitle;
    const pickBtnText = document.getElementById('pickBtnText');
    if (pickBtnText) pickBtnText.textContent = I18N[lang].pickForMe;

    // Search & sort
    if (searchInput) searchInput.placeholder = I18N[lang].searchPlaceholder;
    if (sortSelect) {
      Array.from(sortSelect.options).forEach(opt => {
        if (I18N[lang].sortOptions[opt.value]) {
          opt.textContent = I18N[lang].sortOptions[opt.value];
        }
      });
    }
    if (shuffleBtn && I18N[lang].shuffleBtnTitle) {
      shuffleBtn.setAttribute('title', I18N[lang].shuffleBtnTitle);
      shuffleBtn.setAttribute('aria-label', I18N[lang].shuffleBtnTitle);
    }

    // Filter controls header
    const resultsLabel = document.querySelector('.results-label');
    if (resultsLabel) resultsLabel.textContent = I18N[lang].resultsLabel;
    const modeTipText = document.querySelector('.mode-tip-text');
    if (modeTipText) modeTipText.textContent = I18N[lang].modeTipText;
    if (resetFiltersBtn) resetFiltersBtn.textContent = I18N[lang].resetAll;

    // Filter groups & chips
    updateFilterChipsText(lang);

    // More filters toggle
    const toggleText = document.querySelector('.btn-toggle-more .toggle-text');
    if (toggleText) toggleText.textContent = I18N[lang].moreFiltersText;

    // Empty state
    const emptyH3 = document.querySelector('#emptyState h3');
    if (emptyH3) emptyH3.textContent = I18N[lang].emptyTitle;
    const emptyP = document.querySelector('#emptyState p');
    if (emptyP) emptyP.textContent = I18N[lang].emptySub;
    if (emptyResetBtn) emptyResetBtn.textContent = I18N[lang].emptyReset;

    // Excluded banner
    updateExcludedBanner();

    // Roulette modal static strings
    const rTitle = document.getElementById('rouletteTitle');
    if (rTitle) rTitle.textContent = I18N[lang].rouletteTitle;
    const animName = document.getElementById('animatorName');
    if (animName && !shuffleInterval) animName.textContent = I18N[lang].rouletteShuffling;
    const reRollSpan = document.querySelector('#reRollBtn span');
    if (reRollSpan) reRollSpan.textContent = I18N[lang].reRollBtn;
    const exclSpan = document.querySelector('#excludeWinnerBtn span');
    if (exclSpan) exclSpan.textContent = I18N[lang].excludeWinnerBtn;
    const accSpan = document.querySelector('#acceptWinnerBtn span');
    if (accSpan) accSpan.textContent = I18N[lang].acceptWinnerBtn;

    // Footer
    const backToTop = document.getElementById('backToTopLink');
    if (backToTop) backToTop.textContent = I18N[lang].backToTop;

    // Re-render cards & active summary with proper sorting
    if (allOptions.length > 0) {
      applyFilters();
      if (currentWinner && !rouletteModal.classList.contains('hidden')) {
        showWinnerModal(currentWinner);
      }
    }
  }

  // --- Utility: Escape HTML ---
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- App Initialization ---
  async function init() {
    // 1. Theme Setup
    const savedTheme = localStorage.getItem(STORAGE_THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);

    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_THEME_KEY, next);
    });

    // 2. Language Setup
    const savedLang = localStorage.getItem(STORAGE_LANG_KEY);
    const browserLang = (navigator.language && navigator.language.startsWith('zh')) ? 'zh' : 'en';
    currentLang = savedLang || browserLang || 'en';

    // Parse URL params which may override language
    parseUrlParams();

    // 3. Language Toggle Click
    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', () => {
        const nextLang = currentLang === 'en' ? 'zh' : 'en';
        localStorage.setItem(STORAGE_LANG_KEY, nextLang);
        applyLanguage(nextLang);
        updateUrlParams();
      });
    }

    // Apply language texts to initial DOM
    applyLanguage(currentLang);

    // 4. Fetch Options Data
    try {
      const res = await fetch('data/options.json');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      allOptions = data.options || [];

      reshuffleOptions();
      syncChipsUI();
      applyFilters();
    } catch (err) {
      console.error('Failed to load options data:', err);
      cardsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>${currentLang === 'zh' ? '数据加载失败' : 'Failed to load dining options'}</h3>
          <p>${escapeHtml(err.message)}</p>
        </div>
      `;
    }

    // 5. Search & Sort Event Listeners
    let debounceTimer = null;
    searchInput.addEventListener('input', e => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        filters.search = e.target.value;
        if (filters.search) {
          clearSearchBtn.classList.remove('hidden');
        } else {
          clearSearchBtn.classList.add('hidden');
        }
        applyFilters();
      }, 150);
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      filters.search = '';
      clearSearchBtn.classList.add('hidden');
      searchInput.focus();
      applyFilters();
    });

    sortSelect.addEventListener('change', e => {
      filters.sort = e.target.value;
      if (filters.sort === 'default') {
        reshuffleOptions();
      }
      applyFilters();
    });

    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        filters.sort = 'default';
        sortSelect.value = 'default';
        reshuffleOptions();
        applyFilters();
      });
    }

    resetFiltersBtn.addEventListener('click', resetAllFilters);
    emptyResetBtn.addEventListener('click', resetAllFilters);

    // Tri-State Filter Chips
    document.querySelectorAll('.tri-chip').forEach(chip => {
      chip.addEventListener('click', () => handleChipClick(chip));
    });

    // Presets
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => applyPreset(chip.dataset.preset));
    });

    // Active summary pills click to remove individual filter
    activePillsContainer.addEventListener('click', e => {
      const btn = e.target.closest('.summary-pill');
      if (!btn) return;

      const action = btn.dataset.action;
      const group = btn.dataset.group;
      const rawVal = btn.dataset.value;
      const val = normalizeFilterValue(group, rawVal);

      if (action === 'clear-include') {
        filters.include[group].delete(val);
      } else if (action === 'clear-exclude') {
        filters.exclude[group].delete(val);
      }

      syncChipsUI();
      applyFilters();
    });

    // Toggle collapsible secondary filters (My Tracker & Source)
    if (moreFiltersToggleBtn && collapsibleFilters) {
      moreFiltersToggleBtn.addEventListener('click', () => {
        const isExpanded = moreFiltersToggleBtn.getAttribute('aria-expanded') === 'true';
        const newExpanded = !isExpanded;
        moreFiltersToggleBtn.setAttribute('aria-expanded', newExpanded ? 'true' : 'false');
        moreFiltersToggleBtn.classList.toggle('expanded', newExpanded);
        collapsibleFilters.classList.toggle('hidden', !newExpanded);
      });
    }

    // Pick for me / Roulette
    pickForMeBtn.addEventListener('click', startRoulette);
    reRollBtn.addEventListener('click', startRoulette);
    excludeWinnerBtn.addEventListener('click', excludeCurrentWinner);
    acceptWinnerBtn.addEventListener('click', acceptWinner);
    closeModalBtn.addEventListener('click', closeRouletteModal);

    rouletteModal.addEventListener('click', e => {
      if (e.target === rouletteModal) {
        closeRouletteModal();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !rouletteModal.classList.contains('hidden')) {
        closeRouletteModal();
      }
    });

    resetExcludedBtn.addEventListener('click', resetExcluded);

    // Insider Notes toggle — delegated so it works for cards and the winner modal
    document.addEventListener('click', e => {
      const toggle = e.target.closest('.notes-toggle');
      if (!toggle) return;
      const scope = toggle.closest('.card-body') || toggle.closest('.winner-highlight') || toggle.parentElement;
      const panel = scope ? scope.querySelector('.notes-panel') : null;
      if (!panel) return;
      const isOpen = panel.classList.toggle('hidden') === false;
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
