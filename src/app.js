/* Маржа — интерактив сайта: FAQ, калькулятор, форма заявки, cookie-уведомление */
(function () {
  "use strict";
  var CFG = window.SITE_CFG || {};

  /* FAQ-аккордеон */
  document.querySelectorAll(".qa .q").forEach(function (b) {
    b.addEventListener("click", function () {
      var qa = b.closest(".qa"), open = !qa.classList.contains("open");
      qa.classList.toggle("open", open);
      b.setAttribute("aria-expanded", String(open));
    });
  });

  /* Калькулятор */
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function plural(n, forms) {
    var f = String(forms || "").split("|"); if (f.length < 3) return f[0] || "";
    var a = n % 100, b = n % 10; if (a > 10 && a < 20) return f[2]; if (b === 1) return f[0]; if (b > 1 && b < 5) return f[1]; return f[2];
  }
  document.querySelectorAll(".calc .range").forEach(function (r) {
    var box = r.closest(".calc");
    r.addEventListener("input", function () {
      var v = +r.value, min = +r.min, max = +r.max;
      r.style.setProperty("--p", ((v - min) / ((max - min) || 1) * 100).toFixed(1) + "%");
      box.querySelector(".cv").textContent = v;
      box.querySelector(".cu").textContent = plural(v, r.dataset.units);
      box.querySelector(".rv").textContent = fmt(v * (+r.dataset.per || 0));
    });
  });

  /* Форма заявки → Web3Forms → почта */
  function goal(name) { try { if (CFG.metrika && window.ym) window.ym(+CFG.metrika, "reachGoal", name); } catch (e) {} }
  document.querySelectorAll("form.lead-form").forEach(function (f) {
    var err = f.querySelector(".form-err"), btn = f.querySelector('button[type="submit"]');
    function fail(msg, el) { err.hidden = false; err.textContent = msg; if (el) el.focus(); }
    f.addEventListener("submit", function (e) {
      e.preventDefault(); err.hidden = true;
      var name = f.elements.name.value.trim(), email = f.elements.email.value.trim();
      if (!name) return fail("Укажите, как к вам обращаться.", f.elements.name);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Проверьте адрес почты — нужен формат name@company.ru.", f.elements.email);
      if (!f.elements.consent.checked) return fail("Отметьте согласие на обработку персональных данных.", f.elements.consent);
      if (f.elements.botcheck.checked) return;
      if (!CFG.key) return fail("Форма пока не подключена. Напишите нам: " + (CFG.fallback || "на почту компании") + ".");
      var old = btn.innerHTML; btn.disabled = true; btn.textContent = "Отправляем…";
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: CFG.key, subject: CFG.subject, from_name: CFG.from,
          "Имя": name, email: email, "Размер парка": f.elements.fleet.value || "не указан",
          "Страница": location.href, botcheck: false
        })
      }).then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (d) {
          if (!d || !d.success) throw new Error((d && d.message) || "error");
          goal("lead");
          f.parentNode.innerHTML = '<div class="form-ok" role="status"><span class="okc"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span><p></p></div>';
          document.querySelector(".form-ok p").textContent = f.dataset.success || "Спасибо! Заявка отправлена.";
        })
        .catch(function () {
          btn.disabled = false; btn.innerHTML = old;
          fail("Не получилось отправить заявку. Проверьте интернет и попробуйте ещё раз" + (CFG.fallback ? " или напишите на " + CFG.fallback : "") + ".");
        });
    });
  });

  /* Уведомление о cookie (только если подключена Метрика) */
  if (CFG.metrika) {
    var seen = null; try { seen = localStorage.getItem("cookie-ok"); } catch (e) {}
    if (!seen) {
      var c = document.createElement("div"); c.className = "cookie"; c.setAttribute("role", "region"); c.setAttribute("aria-label", "Cookie");
      c.innerHTML = '<p>Мы используем cookie и Яндекс Метрику, чтобы понимать, как работает сайт. Подробнее — в <a href="privacy.html">политике конфиденциальности</a>.</p><button type="button">Понятно</button>';
      c.querySelector("button").onclick = function () { try { localStorage.setItem("cookie-ok", "1"); } catch (e) {} c.remove(); };
      document.body.appendChild(c);
    }
  }
})();
