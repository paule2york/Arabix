(function clientCode(){
  const SHOP_DATA_URL = './data/products.json';
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  let shopData = null;
  let currentCurrency = localStorage.getItem('arabixShopCurrency') || 'SAR';
  let currentLang = localStorage.getItem('arabixShopLang') || 'en';

  const currencies = [
    { code: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal', rate: 1 },
    { code: 'USD', flag: '🇺🇸', name: 'US Dollar', rate: 0.27 },
    { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham', rate: 0.98 },
    { code: 'QAR', flag: '🇶🇦', name: 'Qatari Riyal', rate: 0.97 },
    { code: 'KWD', flag: '🇰🇼', name: 'Kuwaiti Dinar', rate: 0.081 },
    { code: 'BHD', flag: '🇧🇭', name: 'Bahraini Dinar', rate: 0.10 },
    { code: 'OMR', flag: '🇴🇲', name: 'Omani Rial', rate: 0.10 }
  ];

  const arCategories = {
    all: ['كل القوالب', 'كل قوالب أرابيكس الجاهزة في مكان واحد.'],
    ecommerce: ['المتاجر الإلكترونية', 'قوالب متاجر للكتالوجات والإطلاقات وعروض المنتجات.'],
    restaurant: ['المطاعم', 'قوالب للمطاعم والقوائم والحجوزات والعلامات الغذائية.'],
    hotel: ['الفنادق والسفر', 'قوالب للفنادق والرحلات والحجوزات والوجهات.'],
    clinic: ['العيادات', 'قوالب للرعاية الصحية والعيادات والتجميل والويلنس.'],
    realestate: ['العقارات', 'قوالب للعقارات والإيجارات والعروض الفاخرة.'],
    legal: ['المحاماة', 'قوالب احترافية لمكاتب المحاماة والخدمات القانونية.'],
    business: ['الأعمال', 'قوالب للشركات والفرق والملفات التعريفية.'],
    education: ['التعليم', 'قوالب للدورات والمعاهد ومنصات التعلم.'],
    portfolio: ['الأعمال الإبداعية', 'قوالب بورتفوليو للمصممين والمبدعين والاستوديوهات.']
  };

  const i18n = {
    en: {
      categories: 'Categories', wishlist: 'Wishlist', cart: 'Cart', homeHeroTitle: 'Premium website templates for fast launches.',
      homeHeroCopy: 'Browse responsive templates for stores, clinics, hotels, restaurants, law offices and portfolios.',
      searchPlaceholder: 'Search templates, e.g. "clinic"', searchTemplates: 'Search templates', searchInCategory: 'Search in category',
      viewAllTemplates: 'View all templates', newAdded: 'New Added', newAddedBlurb: 'Fresh templates added to the Arabix library.',
      popular: 'Popular Picks', popularBlurb: 'Strong marketplace-style templates customers can understand quickly.', latestIn: 'Latest in',
      viewAll: 'View all', templateCategory: 'Template category', view: 'View', liveDemo: 'Live Demo', details: 'Details', buyNow: 'Buy now',
      description: 'Description', chooseLicense: 'Choose a license', singleLicense: 'Single Website License', exclusiveLicense: 'Exclusive Buyout License',
      singleTip: 'Use this template for one website only. You can customize it for your own brand, but you cannot resell, redistribute, or use it for multiple websites.',
      exclusiveTip: 'This template becomes exclusive to you. After purchase, Arabix removes it from the shop and will not sell the same template again.',
      addons: 'Optional add-ons', multilingual: 'Multilingual Add-on', multilingualTip: 'Add a second language version. If the template is English, we prepare Arabic. If it is Arabic, we prepare English.',
      seo: 'SEO Setup', seoTip: 'Basic on-page SEO setup for the purchased template: page titles, meta descriptions, heading structure, image alt text guidance, and clean indexing basics.',
      allInOne: 'All-in-One Setup Pack', allInOneTip: 'Includes installation guidance, SEO setup, second language version, and one month of support for the purchased template.',
      support: '1 month support', save: 'Save SAR 400', hosting: 'Hosting + Domain', hostingTip: 'One year hosting and domain setup support for the purchased template. Domain availability and extension rules may apply.',
      total: 'Total', requestPurchase: 'Request purchase', paymentNote: 'Payment is handled by secure invoice or payment link. We send access after payment confirmation.',
      demoTag: 'Live template preview', demoHero: 'Launch a polished {category} website faster.', requestTemplate: 'Request this template',
      demoBandTitle: 'Built around conversion, speed and clean presentation.', demoBandCopy: 'Includes responsive sections, strong spacing and a structure you can adapt for your brand.',
      builtClear: 'Built to feel clear, responsive and ready for a real business launch.', footerCopy: 'Ready-made website templates, UI layouts and digital themes by Arabix.',
      terms: 'Terms', privacy: 'Privacy', refunds: 'Refunds', license: 'License', contact: 'Contact'
    },
    ar: {
      categories: 'التصنيفات', wishlist: 'المفضلة', cart: 'السلة', homeHeroTitle: 'قوالب مواقع احترافية لإطلاق أسرع.',
      homeHeroCopy: 'تصفح قوالب متجاوبة للمتاجر والعيادات والفنادق والمطاعم ومكاتب المحاماة والبورتفوليو.',
      searchPlaceholder: 'ابحث عن قالب، مثال: عيادة', searchTemplates: 'ابحث في القوالب', searchInCategory: 'ابحث داخل التصنيف',
      viewAllTemplates: 'عرض كل القوالب', newAdded: 'أضيف حديثاً', newAddedBlurb: 'قوالب جديدة تمت إضافتها إلى مكتبة أرابيكس.',
      popular: 'الأكثر طلباً', popularBlurb: 'قوالب واضحة وسهلة الفهم ومناسبة للبيع بسرعة.', latestIn: 'الأحدث في',
      viewAll: 'عرض الكل', templateCategory: 'تصنيف القالب', view: 'عرض', liveDemo: 'معاينة مباشرة', details: 'التفاصيل', buyNow: 'اشتر الآن',
      description: 'الوصف', chooseLicense: 'اختر الترخيص', singleLicense: 'ترخيص موقع واحد', exclusiveLicense: 'ترخيص شراء حصري',
      singleTip: 'استخدم هذا القالب لموقع واحد فقط. يمكنك تعديله لعلامتك، لكن لا يمكنك إعادة بيعه أو استخدامه لأكثر من موقع.',
      exclusiveTip: 'يصبح القالب حصرياً لك. بعد الشراء، تقوم أرابيكس بإزالته من المتجر ولا تبيعه مرة أخرى.',
      addons: 'إضافات اختيارية', multilingual: 'إضافة لغة ثانية', multilingualTip: 'نضيف نسخة بلغة ثانية. إذا كان القالب إنجليزياً نجهز العربية، وإذا كان عربياً نجهز الإنجليزية.',
      seo: 'تهيئة SEO', seoTip: 'تهيئة أساسية لمحركات البحث تشمل العناوين والوصف وترتيب العناوين وإرشادات الصور والفهرسة.',
      allInOne: 'باقة الإعداد الكاملة', allInOneTip: 'تشمل إرشاد التثبيت، تهيئة SEO، نسخة لغة ثانية، وشهر دعم للقالب المشترى.',
      support: 'دعم شهر', save: 'وفر 400 ريال', hosting: 'استضافة + دومين', hostingTip: 'دعم إعداد استضافة ودومين لمدة سنة. يخضع الدومين للتوفر ونوع الامتداد.',
      total: 'الإجمالي', requestPurchase: 'طلب الشراء', paymentNote: 'الدفع يتم عبر فاتورة أو رابط دفع آمن. نرسل الملفات بعد تأكيد الدفع.',
      demoTag: 'معاينة مباشرة للقالب', demoHero: 'أطلق موقع {category} احترافي بسرعة أكبر.', requestTemplate: 'اطلب هذا القالب',
      demoBandTitle: 'مصمم للوضوح والسرعة وتحويل الزوار إلى عملاء.', demoBandCopy: 'يتضمن أقساماً متجاوبة ومسافات نظيفة وهيكلاً يمكنك تعديله لعلامتك.',
      builtClear: 'مصمم ليكون واضحاً ومتجاوباً وجاهزاً لإطلاق حقيقي.', footerCopy: 'قوالب مواقع جاهزة وواجهات رقمية من أرابيكس.',
      terms: 'الشروط', privacy: 'الخصوصية', refunds: 'الاسترجاع', license: 'الترخيص', contact: 'تواصل معنا'
    }
  };


  const flagSvg = (code) => {
    const flags = {
      SAR: '<svg class="currency-flag-svg" viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" rx="4" fill="#006c35"/><path d="M13 14h34M13 18h34M18 28h24" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M38 31h9" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
      USD: '<svg class="currency-flag-svg" viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" rx="4" fill="#b22234"/><path stroke="#fff" stroke-width="3.23" d="M0 3.2h60M0 9.7h60M0 16.2h60M0 22.6h60M0 29.1h60M0 35.5h60"/><rect width="27" height="23" fill="#3c3b6e"/><g fill="#fff"><circle cx="5" cy="5" r="1"/><circle cx="11" cy="5" r="1"/><circle cx="17" cy="5" r="1"/><circle cx="23" cy="5" r="1"/><circle cx="8" cy="11" r="1"/><circle cx="14" cy="11" r="1"/><circle cx="20" cy="11" r="1"/><circle cx="5" cy="17" r="1"/><circle cx="11" cy="17" r="1"/><circle cx="17" cy="17" r="1"/><circle cx="23" cy="17" r="1"/></g></svg>',
      AED: '<svg class="currency-flag-svg" viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" rx="4" fill="#fff"/><path fill="#009739" d="M0 0h60v14H0z"/><path fill="#000" d="M0 28h60v14H0z"/><path fill="#ef3340" d="M0 0h17v42H0z"/></svg>',
      QAR: '<svg class="currency-flag-svg" viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" rx="4" fill="#8a1538"/><path fill="#fff" d="M0 0h20l7 2.33-7 2.34 7 2.33-7 2.33 7 2.34-7 2.33 7 2.33-7 2.34 7 2.33-7 2.33 7 2.34-7 2.33 7 2.33-7 2.34 7 2.33-7 2.33 7 2.34-7 2.33H0z"/></svg>',
      KWD: '<svg class="currency-flag-svg" viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" rx="4" fill="#fff"/><path fill="#007840" d="M0 0h60v14H0z"/><path fill="#ce1126" d="M0 28h60v14H0z"/><path fill="#000" d="M0 0l21 14v14L0 42z"/></svg>',
      BHD: '<svg class="currency-flag-svg" viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" rx="4" fill="#ce1126"/><path fill="#fff" d="M0 0h22l-8 4.2 8 4.2-8 4.2 8 4.2-8 4.2 8 4.2-8 4.2 8 4.2-8 4.2 8 4.2H0z"/></svg>',
      OMR: '<svg class="currency-flag-svg" viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" rx="4" fill="#fff"/><path fill="#c8102e" d="M0 14h60v14H0z"/><path fill="#00753b" d="M0 28h60v14H0z"/><path fill="#c8102e" d="M0 0h18v42H0z"/></svg>'
    };
    return flags[code] || flags.SAR;
  };
  const chevronIcon = '<svg class="dropdown-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  const icon = (name) => {
    const map = { grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', bag:'M6 8h12l-1 12H7L6 8zM9 8a3 3 0 0 1 6 0', utensils:'M7 4v7M5 4v7M9 4v7M5 11h4v9M15 4v16M15 4c3 1 4 3 4 6s-1 5-4 6', hotel:'M4 20V5h10v15M14 10h6v10M7 8h3M7 12h3M17 14h1', medical:'M12 5v14M5 12h14M7 7h10v10H7z', home:'M4 11 12 4l8 7v9H4zM9 20v-6h6v6', scale:'M12 4v16M6 7h12M7 7l-3 6h6L7 7zM17 7l-3 6h6l-3-6z', briefcase:'M4 8h16v11H4zM9 8V6h6v2M4 12h16', book:'M5 5h10a4 4 0 0 1 4 4v10H9a4 4 0 0 0-4 0zM5 5v14', spark:'M12 3l2.2 6 6 2.2-6 2.2-2.2 6-2.2-6-6-2.2 6-2.2z' };
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (map[name] || map.grid) + '"/></svg>';
  };

  async function load(){ if (shopData) return shopData; shopData = await fetch(SHOP_DATA_URL).then(r => r.json()); return shopData; }
  const t = (key) => (i18n[currentLang] && i18n[currentLang][key]) || i18n.en[key] || key;
  const catById = (id) => shopData.categories.find(c => c.id === id) || shopData.categories[0];
  const catName = (id) => { const c = catById(id); return currentLang === 'ar' ? (c.nameAr || (arCategories[id] && arCategories[id][0]) || c.name) : c.name; };
  const catBlurb = (id) => { const c = catById(id); return currentLang === 'ar' ? (c.blurbAr || (arCategories[id] && arCategories[id][1]) || c.blurb) : c.blurb; };
  const productTitle = (p) => currentLang === 'ar' ? (p.titleAr || ('قالب ' + String(p.title || '').replace(' Website Template', ''))) : p.title;
  const productBadge = (p) => currentLang === 'ar' ? (p.badgeAr || p.badge || 'جاهز') : (p.badge || 'Ready');
  const productDetails = (p) => currentLang === 'ar' ? (p.detailsAr || p.summaryAr || 'قالب جاهز بتصميم متجاوب وأقسام منظمة يمكنك تعديلها لعلامتك وإطلاقها بسرعة. مناسب للعرض الاحترافي وتجربة مستخدم واضحة.') : p.details;
  const safeAttr = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const demoPageHref = (p) => './demo.html?slug=' + encodeURIComponent(p.slug);
  const demoEmbedUrl = (p) => String(p.demoUrl || '').trim();
  const money = (amount) => {
    const c = currencies.find(x => x.code === currentCurrency) || currencies[0];
    const value = Number(amount) * c.rate;
    const digits = ['KWD','BHD','OMR'].includes(c.code) ? 3 : 0;
    return c.code + ' ' + value.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
  };

  function applyLanguage(){
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('is-ar', currentLang === 'ar');
    qsa('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    qsa('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    const langLabel = qs('[data-lang-label]'); const langFlag = qs('[data-lang-flag]');
    if (langLabel) langLabel.textContent = currentLang === 'ar' ? 'AR' : 'EN';
    if (langFlag) { langFlag.textContent = ''; langFlag.removeAttribute('class'); }
    qsa('.market-footer p').forEach(p => p.textContent = t('footerCopy'));
    const footerKeys = ['terms','privacy','refunds','license','contact'];
    qsa('.market-footer nav a').forEach((a, i) => { if (footerKeys[i]) a.textContent = t(footerKeys[i]); });
  }

  function updateCurrencyLabel(){
    const c = currencies.find(x => x.code === currentCurrency) || currencies[0];
    const flag = qs('[data-currency-flag]'); const label = qs('[data-currency-label]');
    if (flag) { flag.className = 'currency-flag-shell'; flag.innerHTML = flagSvg(c.code); }
    if (label) label.textContent = c.code;
  }

  function setupHeaderControls(){
    const menu = qs('[data-currency-menu]'); const list = qs('[data-currency-list]'); const toggle = qs('[data-currency-toggle]');
    if (list) {
      list.innerHTML = currencies.map(c => `<button type="button" data-currency="${c.code}"><span class="currency-flag-shell">${flagSvg(c.code)}</span><b>${c.code}</b><small>${c.name}</small></button>`).join('');
      qsa('[data-currency]', list).forEach(btn => btn.addEventListener('click', () => {
        currentCurrency = btn.dataset.currency;
        localStorage.setItem('arabixShopCurrency', currentCurrency);
        menu?.classList.remove('is-open');
        rerender();
      }));
    }
    toggle?.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', e => { if (menu && !menu.contains(e.target)) menu.classList.remove('is-open'); });
    qs('[data-lang-toggle]')?.addEventListener('click', () => {
      currentLang = currentLang === 'ar' ? 'en' : 'ar';
      localStorage.setItem('arabixShopLang', currentLang);
      rerender();
    });
    updateCurrencyLabel();
  }

  function card(p){
    const c = catById(p.category);
    return `<a class="product-card shop-card" href="./theme.html?slug=${p.slug}" style="--accent:${c.color}"><div class="mockup"><div class="mock-browser"><div class="mock-top"><i></i><i></i><i></i></div><div class="mock-body"><b></b><span style="width:86%"></span><span style="width:58%"></span><div class="mock-cards"><i></i><i></i><i></i></div></div></div></div><div class="card-body"><em class="badge">${productBadge(p)}</em><h3>${productTitle(p)}</h3><div class="price-row price-row--large"><span><del>${money(p.oldPrice)}</del> ${money(p.price)}</span><b>${t('view')}</b></div></div></a>`;
  }

  function renderHeaderDropdown(){
    const menu = qs('[data-category-menu]'); const drop = qs('[data-category-dropdown]'); const btn = qs('[data-category-toggle]');
    if (!menu || !drop || !btn) return;
    drop.innerHTML = shopData.categories.filter(c => c.id !== 'all').map(c => `<a href="./category.html?cat=${c.id}"><span class="cat-mini" style="--cat:${c.color}">${icon(c.icon)}</span><strong>${catName(c.id)}</strong>${chevronIcon}</a>`).join('') + `<a class="dropdown-feature" href="./license.html"><strong>${t('license')}</strong>${chevronIcon}</a>`;
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => { const open = menu.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
      document.addEventListener('click', e => { if (!menu.contains(e.target)) { menu.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); } });
    }
  }

  function renderCategories(){
    const el = qs('[data-categories]'); if (!el) return;
    el.innerHTML = shopData.categories.map(c => `<a class="cat-tile" href="${c.id === 'all' ? './index.html' : './category.html?cat=' + c.id}" data-cat="${c.id}" style="--cat:${c.color}"><span class="cat-icon">${icon(c.icon)}</span><strong>${catName(c.id)}</strong></a>`).join('');
  }

  function renderRows(){
    const el = qs('[data-home-rows]'); if (!el) return;
    const cats = shopData.categories.filter(c => c.id !== 'all');
    const products = shopData.products || [];
    const recent = products.slice(-4).reverse();
    const popular = products.filter((p, i) => /popular|best/i.test(p.badge || '') || i % 3 === 1).slice(0,4);
    const daySeed = Math.floor(Date.now() / 86400000);
    const dailyPicks = products.map((p, i) => ({ p, score: Math.sin((i + 1) * (daySeed + 17)) })).sort((a, b) => b.score - a.score).slice(0, 3).map(item => item.p);
    const section = (title, blurb, items, link, cls = '') => items.length ? `<section class="product-row ${cls}"><div class="row-head"><div><h2>${title}</h2><p>${blurb}</p></div><a href="${link}">${t('viewAll')} ${chevronIcon}</a></div><div class="row-grid">${items.map(card).join('')}</div></section>` : '';
    const categoryRows = cats.slice(0, 5).map(c => section(`${t('latestIn')} ${catName(c.id)}`, catBlurb(c.id), products.filter(p => p.category === c.id).slice(0,4), './category.html?cat=' + c.id, 'product-row--compact'));
    const moreRecent = products.slice(Math.max(0, products.length - 8), products.length - 4).reverse();
    const dailyCard = (p) => `<a class="daily-pick" href="./theme.html?slug=${p.slug}" style="--accent:${catById(p.category).color}"><span class="badge">${productBadge(p)}</span><h3>${productTitle(p)}</h3><p>${catName(p.category)}</p><div class="price-row"><span><del>${money(p.oldPrice)}</del> ${money(p.price)}</span><b>${t('view')} ${chevronIcon}</b></div></a>`;
    const dayBlock = dailyPicks.length ? `<section class="product-day product-day--trio"><div class="daily-head"><p class="eyebrow">${currentLang === 'ar' ? '\u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u064a\u0648\u0645' : 'Daily picks'}</p><h2>${currentLang === 'ar' ? '\u062b\u0644\u0627\u062b\u0629 \u0642\u0648\u0627\u0644\u0628 \u0645\u062e\u062a\u0627\u0631\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645.' : 'Three fresh picks for today.'}</h2><p>${currentLang === 'ar' ? '\u062a\u062a\u063a\u064a\u0631 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0643\u0644 \u064a\u0648\u0645 \u0644\u062a\u0628\u0642\u0649 \u0627\u0644\u0648\u0627\u062c\u0647\u0629 \u062c\u062f\u064a\u062f\u0629.' : 'A rotating set of templates that changes automatically every day.'}</p></div><div class="daily-grid">${dailyPicks.map(dailyCard).join('')}</div></section>` : '';
    const stats = `<section class="market-stats"><article><b>7,000+</b><span>ready sections across the library</span></article><article><b>10+</b><span>business categories</span></article><article><b>SAR</b><span>GCC-friendly pricing</span></article><article><b>Fast</b><span>static pages for Vercel hosting</span></article></section>`;
    const catalog = `<section class="mini-catalog"><div class="row-head"><div><h2>Explore by category</h2><p>Quick links for the most requested website template types.</p></div></div><div class="catalog-pills">${cats.map(c => `<a href="./category.html?cat=${c.id}" style="--cat:${c.color}">${icon(c.icon)}<span>${catName(c.id)}</span></a>`).join('')}</div></section>`;
    el.innerHTML = [
      section('Recently viewed style picks', 'Templates with clear layouts, strong spacing and fast launch structure.', recent, './category.html?cat=all', 'product-row--compact'),
      dayBlock,
      section('Popular templates', 'The layouts most useful for stores, service brands and local businesses.', popular, './category.html?cat=all', 'product-row--compact'),
      section('Recently added', 'Fresh designs added to the Arabix shop.', moreRecent.length ? moreRecent : recent, './category.html?cat=all', 'product-row--compact'),
      ...categoryRows,
      stats,
      section('Bestsellers', 'Polished templates that feel easy to understand and simple to adapt.', products.slice(0,4), './category.html?cat=all', 'product-row--compact'),
      catalog
    ].join('');
  }

  function renderFooterCatalog(){
    const el = qs('[data-footer-catalog]'); if (!el || !shopData) return;
    const cats = shopData.categories.filter(c => c.id !== 'all');
    const chunks = [cats.slice(0,3), cats.slice(3,6), cats.slice(6,9)];
    el.innerHTML = chunks.map((group, i) => `<section><h3>${['Templates','Business Types','Shop'][i]}</h3>${group.map(c => `<a href="./category.html?cat=${c.id}">${catName(c.id)}</a>`).join('')}</section>`).join('') + `<section class="footer-support"><h3>Support</h3><a href="./license.html">License</a><a href="./terms.html">Terms</a><a href="./privacy.html">Privacy</a><a href="./refund-policy.html">Refunds</a></section>`;
  }
  function filterCards(){
    const input = qs('[data-search]'); if (!input) return;
    input.addEventListener('input', () => { const term = input.value.trim().toLowerCase(); qsa('.shop-card').forEach(a => { a.style.display = a.textContent.toLowerCase().includes(term) ? 'flex' : 'none'; }); });
  }

  function renderCategory(){
    const hero = qs('[data-category-hero]'); const grid = qs('[data-category-grid]'); if (!hero || !grid) return;
    const id = params.get('cat') || 'all'; const c = catById(id); const items = id === 'all' ? shopData.products : shopData.products.filter(p => p.category === id);
    hero.innerHTML = `<div class="category-hero-inner"><span class="cat-icon" style="--cat:${c.color}">${icon(c.icon)}</span><div><p class="eyebrow">${t('templateCategory')}</p><h1>${catName(id)}</h1><p>${catBlurb(id)}</p></div></div>`;
    grid.innerHTML = items.map(card).join('');
  }

  function shareMarkup(){
    return `<div class="share-group" aria-label="Share template"><a class="share-icon share-facebook" href="#" data-share-link="facebook" aria-label="Share on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.2h2V5h-2.4C10.9 5 9.8 6.7 9.8 8.8V11H8v3.2h1.8V20H13v-5.8h2.4L16 11h-3V9c0-.5.4-.8 1-.8Z"/></svg></a><button class="share-icon share-instagram" type="button" data-share-copy aria-label="Copy link for Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="4"/><circle cx="12" cy="12" r="3.2"/><circle cx="16.2" cy="7.8" r=".8"/></svg></button><a class="share-icon share-linkedin" href="#" data-share-link="linkedin" aria-label="Share on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 10.2V19M6.5 7.2v.1M10.5 19v-8.8M10.5 14.1c0-2.4 1.4-4 3.5-4 2 0 3.5 1.4 3.5 4V19"/></svg></a><a class="share-icon share-x" href="#" data-share-link="x" aria-label="Share on X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg></a><a class="share-icon share-whatsapp" href="#" data-share-link="whatsapp" aria-label="Share on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 0 0-6.8 12.2L4 20l3.9-1A8 8 0 1 0 12 4Z"/><path d="M9.2 8.8c.2 3 2.1 5 5 5.8l1.2-1.2-2-1-1 .7c-.9-.4-1.7-1.2-2.1-2.1l.7-1-1-2Z"/></svg></a></div>`;
  }

  function setupShare(root, pageTitle){
    const pageUrl = location.href; const copyBtn = qs('[data-share-copy]', root);
    if (copyBtn) copyBtn.addEventListener('click', async () => { await navigator.clipboard?.writeText(pageUrl); copyBtn.classList.add('is-copied'); setTimeout(() => copyBtn.classList.remove('is-copied'), 1200); });
    qsa('[data-share-link]', root).forEach(a => { const type = a.dataset.shareLink; const url = encodeURIComponent(pageUrl); const text = encodeURIComponent(pageTitle); if (type === 'x') a.href = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text; if (type === 'facebook') a.href = 'https://www.facebook.com/sharer/sharer.php?u=' + url; if (type === 'linkedin') a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url; if (type === 'whatsapp') a.href = 'https://wa.me/?text=' + text + '%20' + url; a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  }

  function renderDetail(){
    const root = qs('[data-detail-page]'); if (!root) return;
    const slug = params.get('slug') || shopData.products[0].slug; const p = shopData.products.find(x => x.slug === slug) || shopData.products[0]; const c = catById(p.category);
    root.style.setProperty('--accent', c.color);
    root.innerHTML = `<nav class="breadcrumb"><a href="./index.html">Templates</a><span>/</span><a href="./category.html?cat=${c.id}">${catName(c.id)}</a><span>/</span><span>${productTitle(p)}</span></nav><section class="detail-layout"><article class="detail-main"><div class="detail-content-head"><p class="eyebrow">${catName(c.id)}</p><h1>${productTitle(p)}</h1><div class="detail-content-actions"><div class="detail-platform share-only">${shareMarkup()}</div><a class="live-demo-button detail-demo-content" href="${demoPageHref(p)}" target="_blank" rel="noopener">${t('liveDemo')}</a></div></div><div class="mockup"><div class="mock-browser"><div class="mock-top"><i></i><i></i><i></i></div><div class="mock-body"><b></b><span style="width:86%"></span><span style="width:62%"></span><div class="mock-cards"><i></i><i></i><i></i></div></div></div></div><div class="detail-copy" id="preview"><h2>${t('description')}</h2><p>${productDetails(p)}</p><div class="feature-grid">${p.features.concat(p.includes).map(f => `<span>${currentLang === 'ar' ? 'ميزة جاهزة وقابلة للتعديل' : f}</span>`).join('')}</div></div></article><aside class="buy-panel"><h2>${t('chooseLicense')}</h2><div class="option-list license-list"><label><input type="radio" name="license" value="single website" data-price="${p.singleLicensePrice || p.price}" checked><span><b>${t('singleLicense')} <i class="license-help" tabindex="0">i<small>${t('singleTip')}</small></i></b><em>${money(p.singleLicensePrice || p.price)}</em></span></label><label><input type="radio" name="license" value="exclusive buyout" data-price="1499"><span><b>${t('exclusiveLicense')} <i class="license-help" tabindex="0">i<small>${t('exclusiveTip')}</small></i></b><em>${money(1499)}</em></span></label></div><h2>${t('addons')}</h2><div class="option-list addon-list"><label><input type="checkbox" data-addon="Multilingual Add-on" data-price="200"><span><b>${t('multilingual')} <i class="license-help" tabindex="0">i<small>${t('multilingualTip')}</small></i></b><em>${money(200)}</em></span></label><label><input type="checkbox" data-addon="SEO Setup" data-price="150"><span><b>${t('seo')} <i class="license-help" tabindex="0">i<small>${t('seoTip')}</small></i></b><em>${money(150)}</em></span></label><label class="featured-addon"><input type="checkbox" data-addon="All-in-One Setup Pack" data-price="800"><span><b>${t('allInOne')} <i class="license-help" tabindex="0">i<small>${t('allInOneTip')}</small></i><small class="support-pill">${t('support')}</small><small class="support-pill discount-pill">${t('save')}</small></b><em class="sale-price"><del>${money(1200)}</del>${money(800)}</em></span></label><label><input type="checkbox" data-addon="Hosting + Domain" data-price="250"><span><b>${t('hosting')} <i class="license-help" tabindex="0">i<small>${t('hostingTip')}</small></i></b><em>${money(250)}</em></span></label></div><div class="total"><span>${t('total')}</span><strong class="total-price" data-total>${money(p.singleLicensePrice || p.price)}</strong></div><button class="buy-button" data-buy>${t('requestPurchase')}</button><p class="manual-note">${t('paymentNote')}</p></aside></section>`;
    const selectedAddons = () => qsa('[data-addon]:checked', root).map(i => i.dataset.addon);
    const update = () => { let total = Number(qs('input[name="license"]:checked', root).dataset.price); qsa('[data-addon]:checked', root).forEach(i => { total += Number(i.dataset.price); }); qs('[data-total]', root).textContent = money(total); };
    qsa('input', root).forEach(i => i.addEventListener('change', update));
    qs('[data-buy]', root).addEventListener('click', () => { const license = qs('input[name="license"]:checked', root).value; const total = qs('[data-total]', root).textContent; const subject = encodeURIComponent('Purchase request: ' + p.title); const body = encodeURIComponent(`Hello Arabix,\n\nI want to purchase:\nProduct: ${p.title}\nLicense: ${license}\nAdd-ons: ${selectedAddons().join(', ') || 'None'}\nTotal: ${total}\n\nPlease send payment instructions and delivery details.`); location.href = `mailto:hello@arabixweb.com?subject=${subject}&body=${body}`; });
    setupShare(root, p.title);
  }

  function renderDemo(){
    const root = qs('[data-demo-page]'); if (!root) return;
    const slug = params.get('slug') || shopData.products[0].slug; const p = shopData.products.find(x => x.slug === slug) || shopData.products[0]; const c = catById(p.category);
    const externalUrl = demoEmbedUrl(p);
    const internalPreview = `<div class="demo-site"><nav class="demo-nav"><b>${productTitle(p).split(' ')[0]}</b><span>Home</span><span>Services</span><span>Work</span><span>Contact</span></nav><main class="demo-hero"><div><em>${catName(c.id)}</em><h1>${t('demoHero').replace('{category}', catName(c.id).toLowerCase())}</h1><p>${productDetails(p)}</p><a href="./theme.html?slug=${p.slug}">${t('requestTemplate')}</a></div><aside><i></i><b></b><span></span><span></span><div><small></small><small></small><small></small></div></aside></main><section class="demo-grid">${p.features.slice(0,3).map((f,i) => `<article><small>0${i+1}</small><h2>${currentLang === 'ar' ? 'قسم جاهز' : f}</h2><p>${t('builtClear')}</p></article>`).join('')}</section><section class="demo-band"><h2>${t('demoBandTitle')}</h2><p>${t('demoBandCopy')}</p></section></div>`;
    const previewBody = externalUrl ? `<iframe class="demo-frame" src="${safeAttr(externalUrl)}" title="${safeAttr(productTitle(p))} live demo" loading="eager" referrerpolicy="no-referrer-when-downgrade"></iframe>` : internalPreview;
    document.title = productTitle(p) + ' Live Demo | Arabix'; root.style.setProperty('--accent', c.color);
    root.innerHTML = `<header class="preview-bar"><a class="preview-brand" href="./index.html" aria-label="Arabix shop"><img src="./assets/logo-white.png" alt="Arabix" /></a><nav class="preview-actions" aria-label="Preview actions"><span class="preview-price">${money(p.singleLicensePrice || p.price)}</span><a class="preview-details" href="./theme.html?slug=${p.slug}">${t('details')}</a><a class="preview-buy" href="./theme.html?slug=${p.slug}">${t('buyNow')}</a></nav></header><section class="demo-stage ${externalUrl ? 'demo-stage--frame' : ''}">${previewBody}</section>`;
  }
  function rerender(){
    updateCurrencyLabel(); applyLanguage(); renderHeaderDropdown(); renderCategories(); renderRows(); renderFooterCatalog(); renderCategory(); renderDetail(); renderDemo(); filterCards();
  }

  load().then(() => { setupHeaderControls(); rerender(); });
})();
