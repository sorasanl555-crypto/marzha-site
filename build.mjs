// Сборка сайта «Маржа»: content.json + config.json  ->  dist/
// Запуск: node build.mjs   (Node 18+, без зависимостей)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";

const content = JSON.parse(readFileSync("content.json", "utf8"));
const cfg = JSON.parse(readFileSync("config.json", "utf8"));
const OUT = "dist";
const domain = String(cfg.domain || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
const SITE = domain ? "https://" + domain : "";
const abs = (p) => (SITE ? SITE + "/" + p : p);
const warn = [];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync("src/fonts", OUT + "/fonts", { recursive: true });
for (const f of ["favicon.svg", "apple-touch-icon.png", "og-image.jpg"]) if (existsSync("src/" + f)) cpSync("src/" + f, OUT + "/" + f);

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const T = (m, p, tag = "span", cls = "") => { const v = get(m, p); return v === "" || v == null ? "" : `<${tag}${cls ? ` class="${cls}"` : ""}>${esc(v)}</${tag}>`; };
const href = (h) => esc(h || "#");
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const plural = (n, forms) => { const f = String(forms || "").split("|"); if (f.length < 3) return f[0] || ""; const a = n % 100, b = n % 10; if (a > 10 && a < 20) return f[2]; if (b === 1) return f[0]; if (b > 1 && b < 5) return f[1]; return f[2]; };
const IC = {
  logo: '<circle cx="12" cy="12" r="10"/><path d="M7 9.5h7.5M7 14.5h7.5M12 6.5 17.5 12 12 17.5"/>',
  truck: '<path d="M2 6h12v10H2z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  network: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M5 16v-3h14v3M12 13V8"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17v-4M12 17V8M16 17v-6M20 17V5"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
  sparkles: '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 2v4M17 4h4"/><circle cx="5" cy="20" r="1.3"/>',
  clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H17a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  chevdown: '<path d="m6 9 6 6 6-6"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12v4"/><path d="M16 14h.01"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
};
const ic = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || IC.check}</svg>`;
const each = (arr, fn) => (arr || []).map(fn).join("");
const h2 = (m, secondCls = "accent") => `<h2 class="h2">${T(m, "title")}${T(m, "titleAccent", "span", secondCls)}</h2>`;

/* hero photo: a data: URI from the editor becomes a real file */
function heroImage(m) {
  const img = m.image || "";
  const mm = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/.exec(img);
  if (mm) { const ext = mm[1].replace("jpeg", "jpg"); writeFileSync(`${OUT}/hero.${ext}`, Buffer.from(mm[2], "base64")); return `hero.${ext}`; }
  return img;
}

/* ---------- renderers (production: no editor) ---------- */
const R = {};
let firstH1 = true;
const logo = (m) => `<a class="logo" href="./" aria-label="${esc(cfg.siteName)} — на главную">${ic("logo")}<span>${esc(m.brand)}<i>.</i></span></a>`;
R.header = (m) => `<header class="m-header"><div class="wrap row">${logo(m)}<nav aria-label="Основное меню">${each(m.links, (l) => `<a href="${href(l.href)}">${esc(l.text)}</a>`)}</nav><a class="btn btn-light" href="${href(m.cta.href)}">${esc(m.cta.text)}${ic("arrow")}</a></div></header>`;
R.hero = (m) => {
  const img = heroImage(m), tag = firstH1 ? "h1" : "h2"; firstH1 = false;
  return `<section class="m-hero dark"><div class="wrap hero-grid"><div>
<p class="eyebrow"><span class="dot"></span>${esc(m.eyebrow)}</p>
<${tag} class="display">${T(m, "title")}${T(m, "titleAccent", "span", "accent")}</${tag}>
${T(m, "lead", "p", "lead")}
<div class="actions"><a class="btn btn-accent" href="${href(m.primary.href)}">${esc(m.primary.text)}${ic("arrow")}</a><a class="link-more" href="${href(m.secondary.href)}">${esc(m.secondary.text)}${ic("chev")}</a></div>
<div class="notes">${each(m.notes, (n) => `<span class="li">${esc(n.text)}</span>`)}</div></div>
<div class="hero-visual" aria-label="Пример интерфейса Маржи" role="img"><div class="photo"${img ? ` style="background-image:url('${esc(img)}')"` : ""}></div><div class="pulse-card" aria-hidden="true">
<div class="pc-top"><span class="live"><i></i>${esc(m.card.label)}</span><span>${esc(m.card.time)}</span></div>
<div class="pc-head"><div>${T(m, "card.kicker", "p", "lbl")}${T(m, "card.total", "p", "big")}${T(m, "card.caption", "p", "cap")}</div><div class="gauge">${ic("gauge")}<span>${esc(m.card.score)}</span></div></div>
${each(m.card.rows, (r) => `<div class="pc-row"><span class="ri">${ic("route")}</span><div class="txt"><b>${esc(r.title)}</b><small><em class="tone-${esc(r.tone)}">${esc(r.status)}</em> · ${esc(r.meta)}</small></div><span class="amt tone-${esc(r.tone)}">${esc(r.amount)}</span></div>`)}
<div class="pc-foot"><span class="ok">${ic("shield")}<span>${esc(m.card.footL)}</span></span><span>${esc(m.card.footR)}</span></div>
</div></div></div></section>`;
};
R.strip = (m) => `<section class="m-strip"><div class="wrap strip">${T(m, "label", "p", "eyebrow")}${each(m.items, (it) => `<span class="strip-item">${ic(it.icon)}${esc(it.text)}</span>`)}</div></section>`;
R.steps = (m) => `<section class="sec ${esc(m.variant || "stone")}"><div class="wrap">${T(m, "eyebrow", "p", "eyebrow")}<div class="split">${h2(m)}${T(m, "text", "p", "side")}</div>
<ol class="steps" style="list-style:none;padding:0">${each(m.items, (it, i) => `<li class="step"><div class="step-top"><span>${String(i + 1).padStart(2, "0")}</span>${ic(it.icon)}</div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></li>`)}</ol></div></section>`;
R.ledger = (m) => {
  const c = m.card, n = Math.max(1, Math.min(12, +c.alternatives || 1));
  let bars = ""; for (let i = 1; i <= n; i++) bars += `<i class="${i === +c.chosen ? "on" : ""}"></i>`;
  return `<section class="sec forest"><div class="wrap two"><div>${T(m, "eyebrow", "p", "eyebrow acc")}${h2(m)}${T(m, "text", "p", "body")}
<a class="link-acc" href="${href(m.link.href)}">${esc(m.link.text)}${ic("arrow")}</a></div>
<div class="ledger-card" aria-hidden="true"><div class="lc-top"><span class="acc">${ic("shield")}<span>${esc(c.badge)}</span></span><span>${esc(c.record)}</span></div>
<div class="lc-main"><span class="okc">${ic("check")}</span><div class="txt">${T(c, "kicker", "p", "lbl")}<b>${esc(c.title)}</b><small>${esc(c.meta)}</small></div><span class="amt">${esc(c.amount)}</span></div>
<div class="lc-bar"><span>${esc(c.altLabel)}</span><div class="bars">${bars}</div><span>${esc(c.chosenLabel)}</span></div>
<div class="lc-foot"><span>${esc(c.hash)}</span><span>${esc(c.signed)}</span></div></div></div></section>`;
};
R.calc = (m) => {
  const c = m.calc, v = Math.min(+c.max, Math.max(+c.min, +c.value)), p = (((v - c.min) / ((c.max - c.min) || 1)) * 100).toFixed(1);
  return `<section class="sec paperbg"><div class="wrap two"><div>${T(m, "eyebrow", "p", "eyebrow")}${h2(m)}${T(m, "text", "p", "body")}<p class="checknote">${ic("check")}<span>${esc(m.note)}</span></p></div>
<div class="calc"><div class="calc-head">${T(c, "label", "p", "lbl")}<span title="${esc(c.help)}" aria-label="${esc(c.help)}">${ic("help")}</span></div>
<div class="calc-size"><label for="calc-${esc(m.id)}">${esc(c.sizeLabel)}</label><b><span class="cv">${v}</span> <span class="cu">${esc(plural(v, c.units))}</span></b></div>
<input class="range" type="range" id="calc-${esc(m.id)}" min="${+c.min}" max="${+c.max}" value="${v}" step="1" style="--p:${p}%" data-per="${+c.perVehicle}" data-units="${esc(c.units)}">
<div class="minmax"><span>${+c.min}</span><span>${+c.max}</span></div>
${T(c, "resultLabel", "p", "res-l")}<p class="res" aria-live="polite"><span class="rv">${fmt(v * c.perVehicle)}</span> ${esc(c.currency)}</p>${T(c, "disclaimer", "p", "disc")}
<a class="btn btn-accent btn-block" href="${href(c.href)}">${esc(c.button)}${ic("arrow")}</a></div></div></section>`;
};
R.band = (m) => `<section class="sec orange m-band"><div class="wrap band-grid">${h2(m, "second")}<div><div class="stats">${each(m.stats, (s) => `<div class="stat"><b>${esc(s.value)}</b><small>${esc(s.label)}</small></div>`)}</div>${T(m, "text", "p", "body")}</div></div></section>`;
R.faq = (m) => `<section class="sec stone"><div class="wrap two two-top"><div>${T(m, "eyebrow", "p", "eyebrow")}${h2(m)}${T(m, "text", "p", "body")}</div><div class="faq">
${each(m.items, (it, i) => `<div class="qa${i === 0 ? " open" : ""}"><h3 style="margin:0;font:inherit"><button class="q" type="button" aria-expanded="${i === 0}" aria-controls="a-${esc(m.id)}-${i}" id="q-${esc(m.id)}-${i}"><span>${esc(it.q)}</span>${ic("chevdown")}</button></h3><p class="a" id="a-${esc(m.id)}-${i}" role="region" aria-labelledby="q-${esc(m.id)}-${i}">${esc(it.a)}</p></div>`)}
</div></div></section>`;
R.cards = (m) => `<section class="sec ${esc(m.variant || "paperbg")}"><div class="wrap">${T(m, "eyebrow", "p", "eyebrow")}${h2(m)}<div class="cards">${each(m.items, (it) => `<article class="card">${ic(it.icon)}<h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`)}</div></div></section>`;
R.text = (m) => `<section class="sec textblock ${esc(m.variant || "stone")}"><div class="wrap">${T(m, "eyebrow", "p", "eyebrow")}${h2(m)}${T(m, "text", "p", "body")}${m.showButton ? `<a class="btn btn-accent" href="${href(m.button.href)}">${esc(m.button.text)}${ic("arrow")}</a>` : ""}</div></section>`;
R.form = (m) => {
  const id = esc(m.id);
  return `<section class="sec forest m-form"><div class="wrap two"><div>${T(m, "eyebrow", "p", "eyebrow acc")}
<h2 class="h2">${T(m, "title")}${T(m, "titleItalic", "em")}${T(m, "titleEnd")}</h2>${T(m, "text", "p", "body")}</div>
<div class="form-card"><form class="lead-form" novalidate data-success="${esc(m.success)}">
<label class="fld"><span>${esc(m.nameLabel)}</span><input name="name" type="text" autocomplete="name" placeholder="${esc(m.namePh)}" required maxlength="120"></label>
<label class="fld"><span>${esc(m.emailLabel)}</span><input name="email" type="email" autocomplete="email" placeholder="${esc(m.emailPh)}" required maxlength="160"></label>
<label class="fld"><span>${esc(m.fleetLabel)}</span><select name="fleet"><option value="">${esc(m.fleetPh)}</option>${each(m.options, (o) => `<option>${esc(o.text)}</option>`)}</select></label>
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="consent"><input type="checkbox" name="consent" required><span>Согласен(на) на обработку персональных данных в соответствии с <a href="privacy.html" target="_blank" rel="noopener">политикой конфиденциальности</a></span></label>
<button class="btn btn-accent btn-block" type="submit">${esc(m.button)}${ic("arrow")}</button>
<p class="form-err" role="alert" hidden></p></form></div></div></section>`;
};
R.footer = (m) => `<footer class="m-footer"><div class="wrap row">${logo(m)}<span>${esc(m.tagline)}</span><span>${esc(m.copy)} · <a href="privacy.html" style="text-decoration:underline">Политика конфиденциальности</a></span></div></footer>`;

/* ---------- page ---------- */
let body = "";
for (const m of content.modules) {
  if (!R[m.type]) { warn.push("Неизвестный тип блока пропущен: " + m.type); continue; }
  const anchor = m.anchor && /^[A-Za-z0-9._~-]+$/.test(m.anchor) ? ` id="${m.anchor}"` : "";
  body += `<div class="mod"${anchor}>${R[m.type](m)}</div>\n`;
}
if (firstH1) warn.push("На странице нет блока «Первый экран» — у страницы не будет заголовка H1.");

const faqItems = content.modules.filter((m) => m.type === "faq").flatMap((m) => m.items || []);
const ld = [
  { "@context": "https://schema.org", "@type": "Organization", name: cfg.siteName, url: SITE || undefined, logo: SITE ? abs("apple-touch-icon.png") : undefined, email: cfg.legal?.email || undefined },
  { "@context": "https://schema.org", "@type": "WebSite", name: cfg.siteName, url: SITE || undefined, inLanguage: "ru" },
];
if (faqItems.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
const ldJSON = JSON.stringify(ld).replace(/</g, "\\u003c");

const metrika = /^\d+$/.test(String(cfg.yandexMetrikaId || "")) ? String(cfg.yandexMetrikaId) : "";
const metrikaTag = metrika ? `<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${metrika},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});</script><noscript><div><img src="https://mc.yandex.ru/watch/${metrika}" style="position:absolute;left:-9999px" alt=""></div></noscript>` : "";

function head({ title, description, path = "", robots = cfg.noindex ? "noindex,nofollow" : "index,follow", extra = "", base = "" }) {
  const url = abs(path);
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
${base}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
${SITE ? `<link rel="canonical" href="${esc(url)}">` : ""}
<meta name="theme-color" content="#111922">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="${esc(cfg.siteName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${SITE ? `<meta property="og:url" content="${esc(url)}">` : ""}
<meta property="og:image" content="${esc(abs("og-image.jpg"))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${cfg.yandexVerification ? `<meta name="yandex-verification" content="${esc(cfg.yandexVerification)}">` : ""}
${cfg.googleVerification ? `<meta name="google-site-verification" content="${esc(cfg.googleVerification)}">` : ""}
<link rel="preload" href="fonts/onest-cyrillic-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="styles.css?v=${Date.now().toString(36)}">
${extra}
</head>`;
}

const cfgRuntime = JSON.stringify({ key: cfg.web3formsKey || "", subject: cfg.leadSubject || "Заявка с сайта", from: cfg.siteName, fallback: cfg.leadEmailForFallback || "", metrika }).replace(/</g, "\\u003c");
const index = `${head({ title: cfg.title, description: cfg.description, extra: `<script type="application/ld+json">${ldJSON}</script>\n${metrikaTag}` })}
<body>
<a class="skip" href="#main">К содержанию</a>
<main id="main">
${body}</main>
<script>window.SITE_CFG=${cfgRuntime};</script>
<script src="app.js?v=${Date.now().toString(36)}" defer></script>
</body>
</html>
`;
writeFileSync(`${OUT}/index.html`, index);

/* ---------- privacy policy (шаблон — проверьте с юристом) ---------- */
const L = cfg.legal || {};
const need = (v, label) => { if (!v) warn.push(`config.json → legal.${label} не заполнено (политика конфиденциальности)`); return esc(v || `[${label}]`); };
const operator = `${need(L.company, "company")}, ИНН ${need(L.inn, "inn")}, ОГРН ${need(L.ogrn, "ogrn")}, адрес: ${need(L.address, "address")}`;
const header = content.modules.find((m) => m.type === "header");
const footer = content.modules.find((m) => m.type === "footer");
const privacy = `${head({ title: "Политика конфиденциальности — " + cfg.siteName, description: "Политика обработки персональных данных на сайте " + (domain || cfg.siteName), path: "privacy.html" })}
<body class="paperbg">
${header ? R.header({ ...header, links: [] }).replace('href="#', 'href="./#') : ""}
<main class="wrap legal">
<h1>Политика конфиденциальности</h1>
<p class="upd">Редакция от ${esc(L.policyDate || "")}</p>
<h2>1. Общие положения</h2>
<p>Настоящая политика определяет порядок обработки персональных данных посетителей сайта ${esc(domain || cfg.siteName)} (далее — Сайт) в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных». Оператор персональных данных: ${operator}.</p>
<h2>2. Какие данные мы обрабатываем</h2>
<ul><li>имя и адрес рабочей электронной почты, размер автопарка — если вы отправляете заявку через форму на Сайте;</li>
<li>технические данные о посещении (cookie, IP-адрес, сведения о браузере и устройстве, действия на Сайте) — если на Сайте включена Яндекс Метрика.</li></ul>
<h2>3. Цели обработки</h2>
<ul><li>связаться с вами по заявке, согласовать и провести демонстрацию продукта;</li><li>анализировать посещаемость и улучшать Сайт.</li></ul>
<h2>4. Правовое основание</h2>
<p>Данные из формы обрабатываются на основании вашего согласия, которое вы даёте, отмечая соответствующий пункт перед отправкой заявки. Согласие можно отозвать в любой момент, написав на ${need(L.email, "email")}.</p>
<h2>5. Передача данных третьим лицам</h2>
<p>Для доставки заявок на почту Оператора используется сервис отправки форм Web3Forms; для анализа посещаемости — Яндекс Метрика (ООО «Яндекс»). Иным третьим лицам данные не передаются, кроме случаев, предусмотренных законом.</p>
<h2>6. Сроки и защита</h2>
<p>Данные хранятся не дольше, чем этого требуют цели обработки, либо до отзыва согласия. Оператор принимает организационные и технические меры для защиты данных от неправомерного доступа.</p>
<h2>7. Ваши права</h2>
<p>Вы вправе получить сведения об обработке своих данных, потребовать их уточнения, блокирования или удаления, а также отозвать согласие. Запросы направляйте на ${need(L.email, "email")}.</p>
<h2>8. Изменения политики</h2>
<p>Оператор может обновлять настоящую политику. Актуальная редакция всегда опубликована на этой странице.</p>
<p style="margin-top:40px"><a href="./">← Вернуться на главную</a></p>
</main>
${footer ? R.footer(footer) : ""}
</body>
</html>
`;
writeFileSync(`${OUT}/privacy.html`, privacy);

const notfound = `${head({ title: "Страница не найдена — " + cfg.siteName, description: cfg.description, path: "404.html", robots: "noindex", base: SITE ? `<base href="${new URL(SITE + "/").pathname}">` : "" })}
<body class="dark"><main class="wrap notfound"><p class="eyebrow"><span class="dot"></span>Ошибка 404</p><h1 class="display">Такой страницы нет.<span class="accent">Маршрут перестроен.</span></h1><p><a class="btn btn-accent" href="./">На главную${ic("arrow")}</a></p></main></body></html>
`;
writeFileSync(`${OUT}/404.html`, notfound);

/* ---------- css / js / seo files ---------- */
const fontFace = [400, 500, 600, 700].map((w) =>
  `@font-face{font-family:"Onest";font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/onest-cyrillic-${w}-normal.woff2) format("woff2");unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:"Onest";font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/onest-latin-${w}-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`).join("\n");
writeFileSync(`${OUT}/styles.css`, fontFace + "\n" + readFileSync("src/_base.css", "utf8") + readFileSync("src/_extra.css", "utf8"));
cpSync("src/app.js", `${OUT}/app.js`);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(`${OUT}/robots.txt`, cfg.noindex ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n${SITE ? `\nSitemap: ${abs("sitemap.xml")}\n` : ""}`);
if (SITE) writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${abs("")}</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${abs("privacy.html")}</loc><lastmod>${today}</lastmod><priority>0.2</priority></url>
</urlset>
`);
if (domain && !/github\.io(\/|$)/.test(domain)) writeFileSync(`${OUT}/CNAME`, domain + "\n");
writeFileSync(`${OUT}/.nojekyll`, "");

if (!cfg.web3formsKey) warn.push("config.json → web3formsKey пуст: форма покажет посетителю адрес почты вместо отправки заявки.");
if (!domain) warn.push("config.json → domain пуст: не будет canonical, sitemap и абсолютных ссылок для превью.");
console.log(`Готово: ${OUT}/ (${content.modules.length} блоков)`);
for (const w of warn) console.log("⚠ " + w);
