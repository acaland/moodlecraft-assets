(function () {
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

  // Moodle's own page bootstrap (RequireJS core modules, the reactive course
  // index drawer, etc.) runs concurrently with anything we load
  // asynchronously (dynamically-created <script> tags, fetch()+eval). That
  // overlap silently breaks unrelated Moodle page chrome -- observed: the
  // course index drawer stays stuck on its loading placeholder, with no
  // console error at all. A classic, statically-authored `<script src>` tag
  // does NOT have this problem, because the HTML parser blocks on it,
  // guaranteeing it finishes (fetch + execute) before the parser reaches
  // Moodle's own footer bootstrap scripts later in the page -- no overlap is
  // possible. `document.write` from within a synchronously-executing classic
  // script re-creates that same blocking, in-order behaviour for a stack of
  // dependencies from a single external file, without listing every
  // dependency inline in the page source.
  window.__moodlecraftRender = render;

  document.write('<script src="https://cdn.jsdelivr.net/npm/marked@15.0.7/marked.min.js"><\/script>');
  document.write('<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"><\/script>');
  document.write('<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js"><\/script>');
  document.write('<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js"><\/script>');
  document.write('<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-sql.min.js"><\/script>');
  document.write('<script src="https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js"><\/script>');
  document.write('<script>window.__moodlecraftRender();<\/script>');
})();
