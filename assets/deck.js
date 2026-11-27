/* IGCSE Science Hub — shared slide engine. Each deck: <div id="vp"><div id="stage"> <section>… </section>… </div></div> then this script. */
(function () {
  const S = [...document.querySelectorAll('#stage > section')], st = document.getElementById('stage');
  document.body.insertAdjacentHTML('beforeend',
    '<div id="prog"></div><div id="notes"></div><div id="nav"><button id="prev" aria-label="Previous slide">◀</button><span id="count"></span>' +
    '<button id="next" aria-label="Next slide">▶</button><span id="ttl"></span><button id="nbtn">Notes</button><button id="fs">Full screen</button></div>');
  document.getElementById('ttl').textContent = document.title;
  let i = 0;
  try { const h = parseInt(location.hash.slice(1)); if (h > 0 && h <= S.length) i = h - 1; } catch (e) {}
  function fit() { const vp = document.getElementById('vp'); const s = Math.min(vp.clientWidth / 1920, vp.clientHeight / 1080); st.style.transform = 'scale(' + s + ')'; }
  /* make each slide's content fill the space: grow short content, shrink content that overflows */
  function autofit(sec) {
    if (sec.dataset.fit) return; sec.dataset.fit = 1;
    if (sec.classList.contains('cover') || sec.classList.contains('divider')) return;
    const body = sec.querySelector(':scope > .body'); if (!body || !body.children.length || body.querySelector('svg,img,canvas,video')) return;
    const fz = document.createElement('div'); fz.className = 'fz';
    while (body.firstChild) fz.appendChild(body.firstChild);
    body.appendChild(fz);
    const W = body.clientWidth, H = body.clientHeight;
    const set = z => { fz.style.width = (W / z) + 'px'; fz.style.transform = 'scale(' + z + ')'; };
    const fits = z => { set(z); return fz.offsetHeight * z <= H - 2; };
    if (fits(1)) { if (fz.offsetHeight > H * 0.82) { set(1); return; } let lo = 1, hi = 1.5; if (fits(hi)) lo = hi; else for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2; if (fits(m)) lo = m; else hi = m; } set(lo); }
    else { let lo = 0.7, hi = 1; for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2; if (fits(m)) lo = m; else hi = m; } set(lo); }
  }
  function show(n) {
    i = Math.max(0, Math.min(S.length - 1, n));
    S.forEach((s, k) => s.classList.toggle('on', k === i));
    try { autofit(S[i]); } catch (e) {}
    document.getElementById('count').textContent = (i + 1) + ' / ' + S.length;
    document.getElementById('prog').style.width = ((i + 1) / S.length * 100) + '%';
    const a = S[i].querySelector('aside'); document.getElementById('notes').textContent = a ? a.textContent : 'No notes for this slide.';
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
  }
  window.__deck = { count: S.length, show, get index() { return i; } };
  document.getElementById('prev').onclick = () => show(i - 1);
  document.getElementById('next').onclick = () => show(i + 1);
  document.getElementById('nbtn').onclick = () => { const n = document.getElementById('notes'); n.style.display = n.style.display === 'block' ? 'none' : 'block'; };
  document.getElementById('fs').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {} };
  document.addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { show(i + 1); e.preventDefault(); }
    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { show(i - 1); e.preventDefault(); }
    if (e.key === 'Home') show(0); if (e.key === 'End') show(S.length - 1);
  });
  /* quick-check slides: first click reveals answers, next click moves on */
  document.getElementById('vp').addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const hid = S[i].querySelector('.qc.hide');
    if (hid && e.clientX > innerWidth / 2) { hid.classList.remove('hide'); return; }
    show(e.clientX > innerWidth / 2 ? i + 1 : i - 1);
  });
  let tx = null;
  addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  addEventListener('touchend', e => { if (tx == null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 40) show(d < 0 ? i + 1 : i - 1); tx = null; });
  try { if (window.self !== window.top) document.getElementById('fs').style.display = 'none'; } catch (e) {}
  addEventListener('resize', fit); fit(); show(i);
})();
