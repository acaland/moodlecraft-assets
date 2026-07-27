(function () {
  function loadScript(src) {
    return fetch(src).then(function (r) {
      if (!r.ok) throw new Error('Failed to fetch ' + src + ' (' + r.status + ')');
      return r.text();
    }).then(function (code) {
      // Execute with `define`/`module`/`exports` shadowed as local
      // parameters (always undefined here), not the real globals, so
      // UMD-wrapped libraries like marked.js take their plain-global
      // branch instead of registering as an AMD module. We deliberately
      // never touch the real `window.define`: Moodle's own RequireJS sets
      // it only transiently while loading Moodle's own AMD modules
      // (including well after initial page load, e.g. when the course
      // index drawer lazily loads its modules), so any approach that
      // hides/restores the real global -- even briefly -- races against
      // Moodle's own module loading and can break unrelated page chrome.
      (new Function('define', 'module', 'exports', code))(undefined, undefined, undefined);
    });
  }

  function render() {
    var source = document.getElementById('gfm-source');
    var content = document.getElementById('gfm-moodle-content');
    if (!source || !content) return;

    var markdown = source.textContent.replace(/^\n/, '');
    var renderer = new marked.Renderer();

    renderer.code = function (codeOrToken, infostring) {
      var code = codeOrToken && typeof codeOrToken === 'object' ? String(codeOrToken.text || '') : String(codeOrToken || '');
      var langSource = codeOrToken && typeof codeOrToken === 'object' ? (codeOrToken.lang || codeOrToken.language || '') : (infostring || '');
      var lang = String(langSource).trim().toLowerCase();
      if (lang === 'mermaid') return '<div class="mermaid">' + code + '</div>';
      var escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return '<pre><code' + (lang ? ' class="language-' + lang + '"' : '') + '>' + escaped + '</code></pre>';
    };

    renderer.link = function (hrefOrToken, title, text) {
      var href = hrefOrToken && typeof hrefOrToken === 'object' ? hrefOrToken.href : hrefOrToken;
      var linkText = hrefOrToken && typeof hrefOrToken === 'object' ? (hrefOrToken.text || text) : text;
      var titleAttr = title ? ' title="' + title.replace(/"/g, '&quot;') + '"' : '';
      return '<a href="' + href + '"' + titleAttr + ' target="_blank" rel="noopener noreferrer">' + linkText + '</a>';
    };

    marked.use({ gfm: true, breaks: true, renderer: renderer });
    content.innerHTML = marked.parse(markdown);

    if (window.Prism) window.Prism.highlightAllUnder(content);
    if (window.mermaid) {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      mermaid.run({ nodes: content.querySelectorAll('.mermaid') });
    }
  }

  Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/marked@15.0.7/marked.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js').then(function () {
      return Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-sql.min.js')
      ]);
    }),
    loadScript('https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js')
  ]).then(render).catch(function (err) {
    console.error('moodlecraft render error:', err);
  });
})();
