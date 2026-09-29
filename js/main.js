(function () {
  'use strict';
  var CFG = window.LEAD_CONFIG || {};
  var PAGE_TS = Date.now();
  function ga(name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); }

  // デモURLを一か所から差し込む
  document.querySelectorAll('.js-demo').forEach(function (a) { a.href = CFG.DEMO_URL || '#'; });

  // ボタンのクリックを計測
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      ga(el.classList.contains('js-demo') ? 'demo_open' : 'cta_click', { position: el.dataset.cta });
    });
  });

  // 追従バー：FVを過ぎたら出す
  var bar = document.getElementById('stickyBar'), hero = document.getElementById('hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { bar.classList.toggle('is-visible', !e[0].isIntersecting); },
      { rootMargin: '-40% 0px 0px 0px' }).observe(hero);
  } else if (bar) { bar.classList.add('is-visible'); }

  // フォーム
  var form = document.getElementById('leadForm');
  if (!form) return;
  var btn = form.querySelector('button[type=submit]'), label = btn.textContent, started = false, widget = null;
  form.addEventListener('focusin', function () { if (!started) { started = true; ga('form_start'); } });

  if (CFG.CAPTCHA_SITEKEY) {
    window.__onTS = function () {
      if (window.turnstile) widget = window.turnstile.render('#cf-turnstile', { sitekey: CFG.CAPTCHA_SITEKEY });
    };
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__onTS&render=explicit';
    s.async = true; document.head.appendChild(s);
  }

  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function err(id, on) { var c = document.getElementById('f-' + id); if (c) c.classList.toggle('field--error', on); }
  function msg(html) {
    var old = form.querySelector('.form-msg'); if (old) old.remove();
    var p = document.createElement('p'); p.className = 'form-msg form-msg--err'; p.setAttribute('role', 'alert');
    p.innerHTML = html; btn.insertAdjacentElement('afterend', p);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var kind = (form.querySelector('input[name=kind]:checked') || {}).value || '';
    var name = v('name'), email = v('email'), grade = v('grade'), message = v('message');
    var agreed = document.getElementById('agree').checked;
    var ok = { name: !!name, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), message: !!message, agree: agreed };
    Object.keys(ok).forEach(function (k) { err(k, !ok[k]); });
    if (!(ok.name && ok.email && ok.message && ok.agree)) {
      var f = form.querySelector('.field--error'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
    }
    if (!CFG.LEAD_ENDPOINT) { msg('現在、フォームを一時的にご利用いただけません。'); return; }
    var captcha = '';
    if (CFG.CAPTCHA_SITEKEY) {
      captcha = (window.turnstile && widget !== null) ? window.turnstile.getResponse(widget) : '';
      if (!captcha) { msg('「私はロボットではありません」の確認を完了してから送ってください。'); return; }
    }
    btn.disabled = true; btn.textContent = '送信中…';
    var body = '【' + kind + '】\n学年：' + (grade || '未記入') + '\n\n' + message;
    fetch(CFG.LEAD_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: CFG.SHARED_TOKEN || '', type: 'lead', hp: v('company'), ts: PAGE_TS, captcha_token: captcha,
        lead: { name: name, tel: '', email: email, message: body, agree: true, case_id: CFG.CASE_ID || '', ref: location.href } })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok) {
        ga('generate_lead', { kind: kind });
        form.parentNode.innerHTML = '<div class="done"><b>送信しました。ありがとうございます。</b>' +
          (kind.indexOf('先行予約') === 0 ? '先着順に、メールでご案内します。' : '内容を確認して、メールでお返事します。') + '</div>';
      } else { throw new Error((d && d.error) || 'unknown'); }
    }).catch(function () {
      btn.disabled = false; btn.textContent = label;
      if (window.turnstile && widget !== null) { try { window.turnstile.reset(widget); } catch (x) {} }
      msg('送信に失敗しました。通信環境をご確認のうえ、もう一度お試しください。');
    });
  });
})();
