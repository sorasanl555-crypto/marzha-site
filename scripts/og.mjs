// Генерирует картинки для превью ссылки (1200×630) и иконку iOS (180×180). Запускается в Actions.
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(pathToFileURL(resolve("src/og.html")).href);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: "src/og-image.jpg", type: "jpeg", quality: 85 });
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent('<body style="margin:0"><div style="width:180px;height:180px;background:#111922;display:flex;align-items:center;justify-content:center"><svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ec7a3c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7 9.5h7.5M7 14.5h7.5M12 6.5 17.5 12 12 17.5"/></svg></div></body>');
await p.screenshot({ path: "src/apple-touch-icon.png" });
await b.close();
console.log("og-image.jpg и apple-touch-icon.png готовы");
