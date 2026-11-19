(function () {
  try {
    const savedTheme = localStorage.getItem('finflow-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch {}
})();

const svgIcons = {
  desk: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>',
  queue: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12M2 8h12M2 12h8"/></svg>',
  board: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2.5" width="3.2" height="11" rx="0.8"/><rect x="6.4" y="2.5" width="3.2" height="8" rx="0.8"/><rect x="10.8" y="2.5" width="3.2" height="10" rx="0.8"/></svg>',
  intake: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5.8"/><path d="M8 5.2v5.6M5.2 8h5.6"/></svg>',
  thesis: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5.8"/><circle cx="8" cy="8" r="2.2"/></svg>',
  'diligence-queue': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4h10M3 8h6M3 12h5"/><circle cx="12" cy="11" r="2.3"/></svg>',
  committee: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 13h11M4 10.5V6M8 10.5V4M12 10.5V7"/></svg>',
  watchlist: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2.2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"/></svg>',
  compare: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="5" height="10" rx="1"/><rect x="9" y="3" width="5" height="10" rx="1"/></svg>',
  closing: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="M5.5 8.2l1.8 1.8 3.4-3.6"/></svg>',
  evidence: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2.2h5.5L12.5 5v8.8H4z"/><path d="M9.5 2.2V5h3M6 8h4M6 10.5h4"/></svg>',
  portfolio: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 12.5L6 8.5l3 2 4.5-5.5"/><path d="M10.5 5h3v3"/></svg>',
  activity: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8h2.5l1.5-4 2.5 8 1.8-4H14"/></svg>'
};

const workspaceNavigation = [
  ['COMMAND', [
    ['desk', 'desk.html', 'Deal Desk'],
    ['queue', 'index.html', 'Deal pipeline'],
    ['board', 'board.html', 'Pipeline board']
  ]],
  ['DEAL FLOW', [
    ['intake', 'intake.html', 'Fictional intake'],
    ['watchlist', 'watchlist.html', 'Watchlist'],
    ['diligence-queue', 'diligence-queue.html', 'Diligence queue'],
    ['compare', 'compare.html', 'Compare deals']
  ]],
  ['DECISIONS', [
    ['thesis', 'thesis.html', 'Investment thesis'],
    ['committee', 'committee.html', 'Investment committee'],
    ['evidence', 'evidence.html', 'Evidence library']
  ]],
  ['PORTFOLIO', [
    ['closing', 'closing.html', 'Closing'],
    ['portfolio', 'portfolio.html', 'Portfolio'],
    ['activity', 'activity.html', 'Activity']
  ]]
];

class FinFlowSidebar extends HTMLElement {
  connectedCallback() {
    const navHtml = workspaceNavigation.map(([group, items]) =>
      '<p class="nav-group">' + group + '</p>' +
      items.map(([id, path, label]) =>
        '<a data-nav="' + id + '" href="./' + path + '">' +
        '<span aria-hidden="true">' + (svgIcons[id] || '') + '</span>' +
        '<span>' + label + '</span>' +
        '<span class="nav-badge" data-nav-badge="' + id + '"></span></a>'
      ).join('')
    ).join('');

    this.innerHTML = '<a class="skip-link" href="#main-content">Skip to main content</a>' +
      '<div class="rail-top"><div class="brand"><span class="logo" aria-hidden="true">◈</span><div>FinFlow<span>DEAL LAB</span></div></div>' +
      '<button class="workspace-toggle" type="button" aria-controls="workspace-navigation" aria-expanded="false">Menu</button></div>' +
      '<nav id="workspace-navigation" aria-label="Workspace">' + navHtml + '</nav>' +
      '<div class="rail-foot"><span class="avatar">AC</span><div>Alder Capital<small>Fund III · Fictional Lab</small></div></div>';

    const toggle = this.querySelector('.workspace-toggle');
    const setExpanded = expanded => {
      this.dataset.menuOpen = String(expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
    };
    setExpanded(false);
    toggle.addEventListener('click', () => setExpanded(this.dataset.menuOpen !== 'true'));
    this.querySelector('#workspace-navigation').addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.dataset.menuOpen === 'true') {
        setExpanded(false);
        toggle.focus();
      }
    });
  }
}

class FinFlowHeader extends HTMLElement {
  connectedCallback() {
    const isTerms = document.body.dataset.page === 'terms';
    const isDark = document.documentElement.dataset.theme === 'dark';
    const search = isTerms ? '' :
      '<button class="button sm header-search" type="button" data-action="open-deal-search" aria-label="Search deals and commands" aria-haspopup="dialog" aria-keyshortcuts="Control+k Meta+k">' +
      'Search &amp; commands <kbd>Ctrl/⌘ K</kbd></button>' +
      '<button class="button sm" type="button" data-action="open-workspace-tools" title="Demo Snapshot & Backup">Workspace</button>' +
      '<button class="button sm" type="button" data-action="open-shortcuts" title="Keyboard shortcuts">?</button>' +
      '<span id="header-ai-pill" class="ai-pill"><span class="ai-pill-dot"></span><span>AI</span></span>';
    const themeBtn = '<button class="button sm" type="button" data-action="toggle-theme" aria-label="Toggle dark mode">' +
      (isDark ? '☀ Light' : '☾ Dark') + '</button>';

    const dialog = isTerms ? '' :
      '<dialog id="deal-search-dialog" aria-labelledby="deal-search-title"><h2 id="deal-search-title">Command Palette</h2>' +
      '<label for="global-deal-query">Search fictional deals, pages, or workspace actions</label>' +
      '<input id="global-deal-query" class="global-deal-query" type="search" maxlength="100" autocomplete="off" placeholder="Type company name, sector, or command…">' +
      '<div id="global-deal-results"></div><form method="dialog"><button class="button">Close</button></form></dialog>' +
      '<dialog id="shortcuts-dialog" aria-labelledby="shortcuts-title"><h2 id="shortcuts-title">Keyboard Shortcuts</h2>' +
      '<div class="finding"><strong>Ctrl / ⌘ + K</strong><p class="muted">Open Command Palette (search deals, jump pages, run actions)</p></div>' +
      '<div class="finding"><strong>?</strong><p class="muted">Open this shortcuts guide (outside inputs)</p></div>' +
      '<div class="finding"><strong>Escape</strong><p class="muted">Close active modal or AI Analyst drawer</p></div>' +
      '<form method="dialog" style="margin-top:14px"><button class="button primary">Done</button></form></dialog>' +
      '<dialog id="workspace-dialog" aria-labelledby="workspace-title"><h2 id="workspace-title">Workspace Tools</h2>' +
      '<p class="muted">Manage your fictional Alder Capital workspace, load a populated Fund III snapshot, or export/restore JSON state.</p>' +
      '<div id="workspace-tools-body"></div>' +
      '<form method="dialog" style="margin-top:14px"><button class="button">Close</button></form></dialog>';

    this.innerHTML = '<header class="top"><div class="site-location"><a class="site-home" href="./index.html">FinFlow</a><span aria-hidden="true">/</span><span id="breadcrumb"></span></div>' +
      '<div class="actions header-tools">' + search + themeBtn + '<span class="demo">◆ Demo · Fictional data</span></div></header>' + dialog;
    this.querySelector('#breadcrumb').textContent = this.dataset.label;
  }
}

class FinFlowFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<footer class="site-footer"><span>FinFlow · Institutional Deal Lab</span><nav aria-label="Site information"><a href="https://www.finrow.pro/">Inspired by Finrow.pro</a><a href="https://mattyjacks.com/">Created by MattyJacks.com</a><a href="./terms.html">Terms of Use</a></nav></footer>';
    if (document.body.dataset.page === 'terms') {
      this.querySelector('[href="./terms.html"]').setAttribute('aria-current', 'page');
    }
  }
}

customElements.define('finflow-header', FinFlowHeader);
customElements.define('finflow-footer', FinFlowFooter);
customElements.define('finflow-sidebar', FinFlowSidebar);
