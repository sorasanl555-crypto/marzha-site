# Сайт «Маржа»

Статичный лендинг, который собирается из `content.json` (тексты и блоки из редактора) и `config.json` (домен, SEO, форма, реквизиты) и публикуется на GitHub Pages при каждом изменении в ветке `main` (`.github/workflows/deploy.yml`).

## Как обновить тексты
1. В редакторе сайта в Claude: **Редактировать → Сохранить → JSON → Скопировать**.
2. Здесь откройте `content.json` → карандаш → выделите всё → вставьте → **Commit changes**.
3. Через 1–2 минуты изменения на сайте (статус — вкладка **Actions**).

## Настройки (`config.json`)
- `domain` — адрес сайта без https:// (сейчас github.io; после покупки домена — например `marzha.ru`).
- `noindex` — `true` закрывает сайт от поисковиков (для тестового адреса). Поставьте `false` после подключения домена.
- `web3formsKey` — ключ с web3forms.com: заявки из формы придут на вашу почту.
- `leadEmailForFallback` — почта, которую сайт покажет, если форма не подключена.
- `yandexMetrikaId`, `yandexVerification`, `googleVerification` — Метрика и подтверждение в Вебмастере / Search Console.
- `legal` — реквизиты для политики конфиденциальности (`privacy.html`, шаблон — покажите юристу).

## Свой домен
DNS у регистратора: A-записи `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; CNAME `www` → `sorasanl555-crypto.github.io`. Затем **Settings → Pages → Custom domain**, **Enforce HTTPS**, и `domain` в `config.json`.

Сборка локально (по желанию): `node build.mjs` → папка `dist/`. Шрифт Onest (SIL OFL) скачивается при сборке в Actions.
