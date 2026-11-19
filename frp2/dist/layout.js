const workspaceNavigation = [
  ['desk','desk.html','▦','Deal Desk'],
  ['queue','index.html','▤','Deal pipeline'],
  ['intake','intake.html','⊕','Fictional intake'],
  ['thesis','thesis.html','◎','Investment thesis'],
  ['committee','committee.html','▧','Investment committee'],
  ['watchlist','watchlist.html','☆','Watchlist'],
  ['compare','compare.html','◫','Compare deals'],
  ['closing','closing.html','▣','Closing'],
  ['evidence','evidence.html','▧','Evidence library'],
  ['portfolio','portfolio.html','◈','Portfolio'],
  ['activity','activity.html','≋','Activity']
];

class FinFlowSidebar extends HTMLElement {
  connectedCallback() {
    const links = workspaceNavigation.map(([id,path,icon,label]) =>
      '<a data-nav="' + id + '" href="./' + path + '"><span aria-hidden="true">' + icon + '</span> &nbsp; ' + label + '</a>'
    ).join('');
    this.innerHTML = '<a class="skip-link" href="#main-content">Skip to main content</a>' +
      '<div class="rail-top"><div class="brand"><span class="logo" aria-hidden="true">◈</span><div>FinFlow<span>DEAL LAB</span></div></div>' +
      '<button class="workspace-toggle" type="button" aria-controls="workspace-navigation" aria-expanded="false">Menu</button></div>' +
      '<p class="nav-label">WORKSPACE</p><nav id="workspace-navigation" aria-label="Workspace">' + links + '</nav>' +
      '<div class="rail-foot"><span class="avatar">AC</span><div>Alder Capital<small>Fictional demo firm</small></div></div>';
    const toggle = this.querySelector('.workspace-toggle');
    const setExpanded = expanded => {
      this.dataset.menuOpen = String(expanded);
      toggle.setAttribute('aria-expanded',String(expanded));
    };
    setExpanded(false);
    toggle.addEventListener('click',() => setExpanded(this.dataset.menuOpen !== 'true'));
    this.querySelector('#workspace-navigation').addEventListener('keydown',event => {
      if (event.key === 'Escape' && this.dataset.menuOpen === 'true') {
        setExpanded(false);
        toggle.focus();
      }
    });
  }
}
class FinFlowHeader extends HTMLElement {
  connectedCallback() {
    const search = document.body.dataset.page === 'terms' ? '' :
      '<button class="button header-search" type="button" data-action="open-deal-search" aria-label="Search deals" aria-haspopup="dialog" aria-keyshortcuts="Control+k Meta+k">' +
      'Search deals <kbd>Ctrl/⌘ K</kbd></button>';
    const dialog = search ?
      '<dialog id="deal-search-dialog" aria-labelledby="deal-search-title"><h2 id="deal-search-title">Find a fictional deal</h2>' +
      '<label for="global-deal-query">Company, sector, region, or lead</label>' +
      '<input id="global-deal-query" class="global-deal-query" type="search" maxlength="100" autocomplete="off" autofocus>' +
      '<div id="global-deal-results"></div><form method="dialog"><button class="button">Close search</button></form></dialog>' : '';
    this.innerHTML = '<header class="top"><div class="site-location"><a class="site-home" href="./index.html">FinFlow</a><span aria-hidden="true">/</span><span id="breadcrumb"></span></div>' +
      '<div class="actions header-tools">' + search + '<span class="demo">◆ &nbsp; Demo only · Use fictional data</span></div></header>' + dialog;
    this.querySelector('#breadcrumb').textContent = this.dataset.label;
  }
}

class FinFlowFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<footer class="site-footer"><span>FinFlow · Fictional deal lab</span><nav aria-label="Site information"><a href="https://www.finrow.pro/">Inspired by Finrow.pro</a><a href="https://mattyjacks.com/">Created by MattyJacks.com</a><a href="./terms.html">Terms of Use</a></nav></footer>';
    if (document.body.dataset.page === 'terms') {
      this.querySelector('[href="./terms.html"]').setAttribute('aria-current', 'page');
    }
  }
}

customElements.define('finflow-header', FinFlowHeader);
customElements.define('finflow-footer', FinFlowFooter);

customElements.define('finflow-sidebar', FinFlowSidebar);
