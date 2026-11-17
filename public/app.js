(() => {
  const $ = (id) => document.getElementById(id);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  // ---------- i18n ----------
  const T = {
    en: {},
    uk: {
      hero: 'Твоє фото — <span>твоя найкраща форма</span>',
      sub: 'Підтягни фігуру, додай м’язів, приміряй новий образ, виправ поставу та ретушуй шкіру — реалістичні AI-правки за секунди.',
      b1: '🔒 Фото не зберігаються', b2: '🛡️ Вбудований фільтр безпеки', b3: '⚡ Результат за ~10 секунд',
      choose: 'Обери правку', intensity: 'Інтенсивність',
      consent: 'Мені 18+, це моє фото або я маю дозвіл людини на фото, і я погоджуюсь з <a href="/terms" target="_blank">Умовами</a> та <a href="/guidelines" target="_blank">Правилами контенту</a>.',
      apply: '✨ Застосувати', note: 'Правки робить AI і вони можуть бути неідеальними. При завантаженні фото позначається «AI-edited». Не використовуйте відредаговані фото для обману чи цькування.',
      upload: 'Завантаж фото', uploadHint: 'Натисни або перетягни JPEG/PNG. Найкраще: одна людина, в повний зріст або по пояс, гарне світло.',
      before: 'До', after: 'Після', download: '⬇ Завантажити', continue: '↻ Редагувати далі', new: 'Нове фото', report: '⚑ Поскаржитись',
      working: 'AI редагує фото…',
      f1t: '💪 Тіло та фітнес', f1: 'Схуднення й тонус, рельєф рук, грудей чи ніг, тонша талія — завжди реалістично.',
      f2t: '👔 Примірка образу', f2: 'Діловий костюм, стрітвір, вечірній образ, вишиванка та інше.',
      f3t: '📏 Зріст і постава', f3: 'Гармонійні пропорції, рівна спина, впевнена постава.',
      f4t: '🎨 Шкіра та тату', f4: 'Природна ретуш, примірка тату або видалення наявних.',
      ageT: 'Вітаємо 👋', ageP: 'Сервіс для дорослих (18+). Ми не зберігаємо фото, а правки, що знімають одяг чи сексуалізують людей, блокуються.',
      ageYes: 'Мені є 18', ageNo: 'Мені менше 18',
      repT: 'Повідомити про проблему', repP: 'Повідом, якщо результат був недоречним, образливим чи шкідливим. Ми розглядаємо кожну скаргу протягом 24 годин.',
      send: 'Надіслати', cancel: 'Скасувати',
      tools: { slim: 'Схуднути', muscles: 'М’язи', abs: 'Талія', outfit: 'Образ', height: 'Зріст', posture: 'Постава', skin: 'Шкіра', tattoo: 'Тату', remove_tattoo: 'Прибрати тату' },
      opts: { arms: 'Руки', chest: 'Груди', full: 'Верх тіла', legs: 'Ноги', business: 'Костюм', casual: 'Кежуал', smart: 'Смарт-кежуал', evening: 'Вечірній', sport: 'Спорт', winter: 'Зима', streetwear: 'Стрітвір', traditional: 'Вишиванка', forearm_floral: 'Квіти (передпліччя)', forearm_geo: 'Геометрія', hand_small: 'Мала на кисті', arm_sleeve: 'Рукав' },
      under18: 'Вибач, сервіс доступний лише з 18 років.', pickOpt: 'Обери варіант', reported: 'Дякуємо, скаргу надіслано.',
    },
    ru: {
      hero: 'Твоё фото — <span>твоя лучшая форма</span>',
      sub: 'Подтяни фигуру, добавь мышц, примерь новый образ, исправь осанку и отретушируй кожу — реалистичные AI-правки за секунды.',
      b1: '🔒 Фото не сохраняются', b2: '🛡️ Встроенный фильтр безопасности', b3: '⚡ Результат за ~10 секунд',
      choose: 'Выбери правку', intensity: 'Интенсивность',
      consent: 'Мне 18+, это моё фото или у меня есть разрешение человека, и я согласен с <a href="/terms" target="_blank">Условиями</a> и <a href="/guidelines" target="_blank">Правилами контента</a>.',
      apply: '✨ Применить', note: 'Правки делает AI, они могут быть неидеальны. При скачивании фото помечается «AI-edited». Не используйте отредактированные фото для обмана или травли.',
      upload: 'Загрузи фото', uploadHint: 'Нажми или перетащи JPEG/PNG. Лучше всего: один человек, в полный рост или по пояс, хороший свет.',
      before: 'До', after: 'После', download: '⬇ Скачать', continue: '↻ Редактировать дальше', new: 'Новое фото', report: '⚑ Пожаловаться',
      working: 'AI редактирует фото…',
      f1t: '💪 Тело и фитнес', f1: 'Похудение и тонус, рельеф рук, груди или ног, тонкая талия — всегда реалистично.',
      f2t: '👔 Примерка образа', f2: 'Деловой костюм, стритвир, вечерний образ, вышиванка и другое.',
      f3t: '📏 Рост и осанка', f3: 'Гармоничные пропорции, ровная спина, уверенная поза.',
      f4t: '🎨 Кожа и тату', f4: 'Естественная ретушь, примерка тату или удаление имеющихся.',
      ageT: 'Привет 👋', ageP: 'Сервис для взрослых (18+). Мы не храним фото, а правки, которые снимают одежду или сексуализируют людей, блокируются.',
      ageYes: 'Мне есть 18', ageNo: 'Мне меньше 18',
      repT: 'Сообщить о проблеме', repP: 'Сообщи, если результат был неуместным, оскорбительным или вредным. Мы рассматриваем каждую жалобу в течение 24 часов.',
      send: 'Отправить', cancel: 'Отмена',
      tools: { slim: 'Похудеть', muscles: 'Мышцы', abs: 'Талия', outfit: 'Образ', height: 'Рост', posture: 'Осанка', skin: 'Кожа', tattoo: 'Тату', remove_tattoo: 'Убрать тату' },
      opts: { arms: 'Руки', chest: 'Грудь', full: 'Верх тела', legs: 'Ноги', business: 'Костюм', casual: 'Кэжуал', smart: 'Смарт-кэжуал', evening: 'Вечерний', sport: 'Спорт', winter: 'Зима', streetwear: 'Стритвир', traditional: 'Вышиванка', forearm_floral: 'Цветы (предплечье)', forearm_geo: 'Геометрия', hand_small: 'Мини на кисти', arm_sleeve: 'Рукав' },
      under18: 'Извини, сервис доступен только с 18 лет.', pickOpt: 'Выбери вариант', reported: 'Спасибо, жалоба отправлена.',
    },
  };
  const EN = {
    tools: { slim: 'Slim & tone', muscles: 'Muscles', abs: 'Fit waist', outfit: 'Outfit', height: 'Height', posture: 'Posture', skin: 'Skin retouch', tattoo: 'Tattoo try-on', remove_tattoo: 'Remove tattoos' },
    opts: { arms: 'Arms', chest: 'Chest', full: 'Upper body', legs: 'Legs', business: 'Business', casual: 'Casual', smart: 'Smart casual', evening: 'Evening', sport: 'Sport', winter: 'Winter', streetwear: 'Streetwear', traditional: 'Vyshyvanka', forearm_floral: 'Floral (forearm)', forearm_geo: 'Geometric', hand_small: 'Small on hand', arm_sleeve: 'Sleeve' },
    under18: 'Sorry, this service is only for people aged 18 and over.', pickOpt: 'Pick an option', reported: 'Thanks, your report was sent.',
  };
  const ICONS = { slim: '🏃', muscles: '💪', abs: '⏳', outfit: '👔', height: '📏', posture: '🧍', skin: '✨', tattoo: '🖋️', remove_tattoo: '🧽' };

  const defaults = {};
  document.querySelectorAll('[data-i]').forEach((el) => (defaults[el.dataset.i] = el.innerHTML));
  let lang = store.get('lang') || ((navigator.language || 'en').startsWith('uk') ? 'uk' : (navigator.language || '').startsWith('ru') ? 'ru' : 'en');
  const t = (k) => (T[lang] && T[lang][k]) || EN[k] || defaults[k] || k;
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i]').forEach((el) => (el.innerHTML = (T[lang] && T[lang][el.dataset.i]) || defaults[el.dataset.i]));
    document.querySelectorAll('#lang button').forEach((b) => b.classList.toggle('on', b.dataset.l === lang));
    renderTools();
  }
  $('lang').addEventListener('click', (e) => { const l = e.target.dataset?.l; if (l) { lang = l; store.set('lang', l); applyLang(); } });

  // ---------- state ----------
  let catalog = {};
  let tool = 'slim', option = null;
  let source = null; // data URI currently being edited
  let result = null;

  function toast(msg, err) {
    const el = $('toast'); el.textContent = msg; el.className = 'toast on' + (err ? ' err' : '');
    clearTimeout(toast.t); toast.t = setTimeout(() => (el.className = 'toast'), 4500);
  }

  function renderTools() {
    const tl = (T[lang]?.tools || EN.tools), ol = (T[lang]?.opts || EN.opts);
    $('tools').innerHTML = Object.keys(catalog).map((id) =>
      `<button class="tool${id === tool ? ' on' : ''}" data-t="${id}"><span class="ic">${ICONS[id] || '•'}</span>${tl[id] || catalog[id].label}</button>`).join('');
    const c = catalog[tool];
    $('opts').innerHTML = c?.options ? c.options.map((o) => `<button class="opt${o === option ? ' on' : ''}" data-o="${o}">${ol[o] || o}</button>`).join('') : '';
    $('levelBox').style.display = c?.hasLevel ? '' : 'none';
    updateApply();
  }
  $('tools').addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]'); if (!b) return;
    tool = b.dataset.t; option = catalog[tool]?.options ? catalog[tool].options[0] : null; renderTools();
  });
  $('opts').addEventListener('click', (e) => { const b = e.target.closest('[data-o]'); if (b) { option = b.dataset.o; renderTools(); } });
  $('level').addEventListener('input', (e) => ($('levelVal').textContent = e.target.value));
  $('consent').addEventListener('change', updateApply);
  function updateApply() { $('apply').disabled = !(source && $('consent').checked && (!catalog[tool]?.options || option)); }

  // ---------- image loading (resize + strip metadata) ----------
  function loadFile(file) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return toast('JPEG, PNG or WebP only', true);
    if (file.size > 20 * 1024 * 1024) return toast('Max 20 MB', true);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1536, s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      setSource(c.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => toast('Could not read this image', true);
    img.src = url;
  }
  function setSource(dataUri) {
    source = dataUri; result = null;
    $('imgBefore').src = dataUri; $('imgAfter').src = dataUri;
    $('drop').style.display = 'none'; $('view').style.display = '';
    $('download').disabled = true; $('useResult').disabled = true;
    setSplit(1); updateApply();
  }
  $('file').addEventListener('change', (e) => loadFile(e.target.files[0]));
  const drop = $('drop');
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => loadFile(e.dataTransfer.files[0]));
  $('newPhoto').addEventListener('click', () => { source = result = null; $('file').value = ''; $('view').style.display = 'none'; $('drop').style.display = ''; updateApply(); });

  // ---------- compare slider ----------
  function setSplit(f) {
    f = Math.max(0, Math.min(1, f));
    $('afterWrap').style.clipPath = `inset(0 0 0 ${f * 100}%)`;
    $('bar').style.left = f * 100 + '%';
  }
  const cmp = $('compare'); let dragging = false;
  const move = (e) => { const r = cmp.getBoundingClientRect(); setSplit(((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width); };
  cmp.addEventListener('pointerdown', (e) => { dragging = true; cmp.setPointerCapture(e.pointerId); move(e); });
  cmp.addEventListener('pointermove', (e) => dragging && move(e));
  cmp.addEventListener('pointerup', () => (dragging = false));

  // ---------- edit ----------
  $('apply').addEventListener('click', async () => {
    if (!catalog[tool]?.options || option) {} else return toast(t('pickOpt'), true);
    $('loading').classList.add('on'); $('apply').disabled = true;
    try {
      const r = await fetch('/api/edit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: source, tool, option, level: +$('level').value, consent: $('consent').checked }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.message || 'Something went wrong');
      result = j.image;
      $('imgAfter').src = result;
      setSplit(0.5);
      $('download').disabled = false; $('useResult').disabled = false;
    } catch (e) { toast(e.message, true); }
    finally { $('loading').classList.remove('on'); updateApply(); }
  });
  $('useResult').addEventListener('click', () => { if (result) setSource(result); });

  // Download with a visible "AI-edited" label (transparency for viewers)
  $('download').addEventListener('click', () => {
    if (!result) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const fs = Math.max(14, Math.round(img.width / 45));
      x.font = `600 ${fs}px system-ui,sans-serif`;
      const label = 'AI-edited'; const w = x.measureText(label).width + fs;
      x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(c.width - w - fs * 0.6, c.height - fs * 2.1, w, fs * 1.6);
      x.fillStyle = '#fff'; x.fillText(label, c.width - w - fs * 0.1, c.height - fs * 0.95);
      c.toBlob((b) => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ai-edited.jpg';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }, 'image/jpeg', 0.92);
    };
    img.src = result;
  });

  // ---------- report ----------
  $('report').addEventListener('click', () => $('reportModal').classList.add('on'));
  $('repCancel').addEventListener('click', () => $('reportModal').classList.remove('on'));
  $('repSend').addEventListener('click', async () => {
    await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: $('repReason').value, details: $('repDetails').value }) }).catch(() => {});
    $('reportModal').classList.remove('on'); $('repDetails').value = ''; toast(t('reported'));
  });

  // ---------- age gate ----------
  if (store.get('age_ok') !== '1') $('ageGate').classList.add('on');
  $('ageYes').addEventListener('click', () => { store.set('age_ok', '1'); $('ageGate').classList.remove('on'); });
  $('ageNo').addEventListener('click', () => {
    $('ageGate').querySelector('.card').innerHTML = `<h2>🙏</h2><p>${t('under18')}</p>`;
  });

  // ---------- init ----------
  fetch('/api/catalog').then((r) => r.json()).then((c) => { catalog = c; applyLang(); }).catch(() => toast('Network error', true));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
