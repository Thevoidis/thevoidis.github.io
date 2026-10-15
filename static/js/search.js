/* /search/ — client-side search over a build-time JSON index (FlexSearch).
   No requests leave the browser; nothing is tracked. */
(function () {
  'use strict';

  var dataEl = document.getElementById('search-data');
  var input = document.getElementById('q');
  var list = document.getElementById('results');
  var count = document.getElementById('result-count');
  var form = document.querySelector('.search-form');
  if (!dataEl || !input || !list || !count || typeof FlexSearch === 'undefined') return;

  var docs = [];
  try { docs = JSON.parse(dataEl.textContent); } catch (e) { return; }
  if (!docs.length) { count.textContent = 'Nothing to search yet.'; return; }

  var index = new FlexSearch.Document({
    tokenize: 'forward',
    cache: true,
    document: {
      id: 'id',
      index: [
        { field: 'title', weight: 5 },
        { field: 'tags', weight: 3 },
        { field: 'text', weight: 1 }
      ],
      store: ['title', 'url', 'kind', 'sub', 'text']
    }
  });

  docs.forEach(function (d, i) { d.id = i; index.add(d); });

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function hl(s, q) {
    s = esc(s);
    if (!q || q.length < 2) return s;
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return s.replace(re, '<mark>$1</mark>');
  }

  function run(q) {
    if (!q) { list.innerHTML = ''; count.textContent = ''; return; }
    var seen = {};
    index.search(q, { limit: 10, enrich: true, suggest: true }).forEach(function (fieldRes) {
      fieldRes.result.forEach(function (r) { seen[r.id] = true; });
    });
    var hits = Object.keys(seen).slice(0, 10).map(function (id) { return docs[id]; });

    if (!hits.length) {
      list.innerHTML = '<li class="search-empty">Nothing matches &ldquo;' + esc(q) + '&rdquo;.</li>';
      count.textContent = '';
      return;
    }
    count.textContent = hits.length + (hits.length === 1 ? ' result' : ' results');
    list.innerHTML = hits.map(function (d) {
      return '<li><a class="search-hit" href="' + esc(d.url) + '">' +
        '<span class="hit-top"><span class="hit-kind">' + esc(d.kind) + '</span>' +
        (d.sub ? '<span class="hit-sub">' + esc(d.sub) + '</span>' : '') +
        '</span>' +
        '<span class="hit-title">' + hl(d.title, q) + '</span>' +
        (d.text ? '<span class="hit-text">' + hl(String(d.text).slice(0, 180), q) + '</span>' : '') +
        '</a></li>';
    }).join('');
  }

  var debounce;
  input.addEventListener('input', function () {
    clearTimeout(debounce);
    var q = input.value.trim();
    debounce = setTimeout(function () {
      run(q);
      try {
        history.replaceState(null, '', q ? '?q=' + encodeURIComponent(q) : location.pathname);
      } catch (e) { /* file:// or sandboxed */ }
    }, 120);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    run(input.value.trim());
    var first = list.querySelector('a');
    if (first && input.value.trim()) first.click();
  });

  var initial = new URLSearchParams(location.search).get('q');
  if (initial) { input.value = initial; run(initial.trim()); }
})();
