/**
 * tequila
 * framework7-interface-page
 */

// -------------------------------------------------------------------------------------------------------------------
// Render Pages
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderPages = function () {

  var self = this; // self is interface

  // F7 Pages container, because we use fixed-through navbar and toolbar, it has additional appropriate classes
  this.pages = document.createElement("div");
  this.pages.id = "pages";
  this.pages.className = "pages navbar-through toolbar-through";
  this.viewMain.appendChild(this.pages);

  // F7 data-page
  this.dataPage = document.createElement("div");
  this.dataPage.id = "dataPage";
  this.dataPage.setAttribute('data-page', 'index');
  this.dataPage.className = "page";
  this.pages.appendChild(this.dataPage);

  // F7 page-content
  this.pageContent = document.createElement("div");
  this.pageContent.id = "pageContent";
  this.pageContent.className = "page-content";
  this.dataPage.appendChild(this.pageContent);

  // F7 tabs div
  this.tabs = document.createElement("div");
  this.tabs.id = "tabs";
  this.tabs.className = "tabs";
  this.pageContent.appendChild(this.tabs);

  this.indexTabPages = [];
  this.indexTabNumber = 1;
  this.addStarterPage();
  this.addIndexTabPage(this.pageHandlers[0].text, this.pageHandlers[0].icon);
  for (var p = 1; p < this.pageHandlers.length; p++)
    this.addIndexTabPage(this.pageHandlers[p].text, this.pageHandlers[p].icon, this.pageHandlers[p].callback);

};

// -------------------------------------------------------------------------------------------------------------------
// Add starter page (not used currently since page defaults but could be a good "new user" starting point)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addStarterPage = function () {
  var tab = document.createElement("div");
  tab.id = "tabStarter";
  tab.className = "tab active";
  this.tabs.appendChild(tab);
  tab.innerHTML = '<div class="content-block-title">WELCOME</div>' +
    '<div class="content-block">' +
    '<p>Touch the icons below to explore.</p>' +
    '</div>';
};

// -------------------------------------------------------------------------------------------------------------------
// Add a page to index tabs
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addIndexTabPage = function (shortcutText, shortcutIcon, callback) {
  var tab = document.createElement("div");
  tab.id = "tab" + this.indexTabNumber;
  tab.className = "tab";
  this.tabs.appendChild(tab);
  this.indexTabPages.push({div: tab, shortcutText: shortcutText, shortcutIcon: shortcutIcon});
  this.indexTabNumber++;
  if (callback)
    callback(this, tab);
};

// -------------------------------------------------------------------------------------------------------------------
// Add Page Handler
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addPageHandler = function (text, icon, callback) {
  var page = {};
  page.text = text ? text : 'page';
  page.icon = icon ? icon : 'fa-question-circle';
  page.callback = callback ? callback : function (self, tab, action) {
    // if no callback
    tab.innerHTML = '<div class="content-block-title">' + page.text + '</div>' +
      '<div class="content-block">' +
      '<p>There is no code handler for this page!</p>' +
      '</div>';
  };
  this.pageHandlers.push(page);
};

// -------------------------------------------------------------------------------------------------------------------
// Select Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.selectPage = function (text) {
  var p;
  for (p = 0; p < this.pageHandlers.length; p++) {
    if (this.pageHandlers[p].text == text) {
      this.f7.showTab('#' + this.indexTabPages[p].div.id);
    }
  }
};

// -------------------------------------------------------------------------------------------------------------------
// Add Sliding Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addStubPage = function (command) {
  var text = '<H4>This feature is not available at this time.</H4><p>'+ command.description +'</p>';


  this.f7mainView.hideToolbar();
  this.f7mainView.loadContent(
      '<div class="navbar">' +
      '  <div class="navbar-inner">' +
      '    <div class="left"><a href="#" class="back link"><i class="icon icon-back-blue"></i><span>Back</span></a></div>' +
      '    <div class="center sliding">' + command.name + '</div>' +
      '  </div>' +
      '</div>' +
      '<div class="pages">' +
      '  <div data-page="dynamic-pages" class="page">' +
      '    <div class="page-content">' +
      '      <div class="content-block">' +
      text +
      '          <p></p>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
  );
//  this.f7mainView.showPreloader('Loading');
//  this.f7mainView.loadContent(
//      '<div class="navbar">' +
//      '  <div class="navbar-inner">' +
//      '    <div class="left sliding"><a href="#" class="back link"><i class="icon icon-back-blue"></i><span>Back</span></a></div>' +
//      '    <div class="center sliding">' +
//      '      <div class="buttons-row">' +
//      '        <a href="#tab1" class="button active tab-link">Tab 1</a>' +
//      '        <a href="#tab2" class="button tab-link">Tab 2</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 3</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 4</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 5</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 6</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
//      '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
//      '      </div>' +
//      '    </div>' +
//      '    <div class="right"><a href="#" class="link open-panel icon-only"><i class="icon icon-bars-blue"></i></a></div>' +
//      '  </div>' +
//      '</div>' +
//      '<div class="pages navbar-through">' +
//      '  <div data-page="tabs" class="page">' +
//      '    <div class="page-content">' +
//      '      <div class="tabs">' +
//      '        <div id="tab1" class="tab active">' +
//      '          <div class="content-block">' +
//      '            <p>This is tab 1 content</p>' +
//      '            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum mi quis felis scelerisque faucibus. Aliquam ut commodo justo. Mauris vitae pharetra arcu. Sed tincidunt dui et nibh auctor pretium. Nam accumsan fermentum sem. Suspendisse potenti. Nulla sed orci malesuada, pellentesque elit vitae, cursus lorem. Praesent et vehicula sapien, ut rhoncus quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vitae mi nec lorem aliquet venenatis quis nec nibh. Aenean sit amet leo ligula. Fusce in massa et nisl dictum ultricies et vitae dui. Sed sagittis quis diam sed lobortis. Donec in massa pharetra, tristique purus vitae, consequat mauris. Aliquam tellus ante, pharetra in mattis ut, dictum quis erat.</p>' +
//      '            <p>Ut ac lobortis lacus, non pellentesque arcu. Quisque sodales sapien malesuada, condimentum nunc at, viverra lacus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eu pulvinar turpis, id tristique quam. Aenean venenatis molestie diam, sit amet condimentum nisl pretium id. Donec diam tortor, mollis in vehicula id, vehicula consectetur nulla. Quisque posuere rutrum mauris, eu rutrum turpis blandit at. Proin volutpat tortor sit amet metus porttitor accumsan. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut dapibus posuere dictum.</p>' +
//      '          </div>' +
//      '        </div>' +
//      '        <div id="tab2" class="tab">' +
//      '          <div class="content-block">' +
//      '            <p>This is tab 2 content</p>' +
//      '            <p>Ut ac lobortis lacus, non pellentesque arcu. Quisque sodales sapien malesuada, condimentum nunc at, viverra lacus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eu pulvinar turpis, id tristique quam. Aenean venenatis molestie diam, sit amet condimentum nisl pretium id. Donec diam tortor, mollis in vehicula id, vehicula consectetur nulla. Quisque posuere rutrum mauris, eu rutrum turpis blandit at. Proin volutpat tortor sit amet metus porttitor accumsan. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut dapibus posuere dictum.</p>' +
//      '            <p>Fusce luctus turpis nunc, id porta orci blandit eget. Aenean sodales quam nec diam varius, in ornare ipsum condimentum. Aenean eleifend, nulla sit amet volutpat adipiscing, ligula nulla pharetra risus, vitae consequat leo tortor eu nunc. Vivamus at fringilla metus. Duis neque lectus, sagittis in volutpat a, pretium vel turpis. Nam accumsan auctor libero, quis sodales felis faucibus quis. Etiam vestibulum sed nisl vel aliquet. Aliquam pellentesque leo a lacus ultricies scelerisque. Vestibulum vestibulum fermentum tincidunt. Proin eleifend metus non quam pretium, eu vehicula ipsum egestas. Nam eget nibh enim. Etiam sem leo, pellentesque a elit vel, egestas rhoncus enim. Morbi ultricies adipiscing tortor, vitae condimentum lacus hendrerit nec. Phasellus laoreet leo quis purus elementum, ut fringilla justo eleifend. Nunc ultricies a sapien vitae auctor. Aliquam id erat elementum, laoreet est et, dapibus ligula.</p>' +
//      '          </div>' +
//      '        </div>' +
//      '        <div id="tab3" class="tab">' +
//      '          <div class="content-block">' +
//      '            <p>This is tab 3 content</p>' +
//      '            <p>Nulla gravida libero eget lobortis iaculis. In sed elit eu nibh adipiscing faucibus. Sed ac accumsan lacus. In ut diam quis turpis fringilla volutpat. In ultrices dignissim consequat. Cras pretium tortor et lorem condimentum posuere. Nulla facilisi. Suspendisse pretium egestas lacus ac laoreet. Mauris rhoncus quis ipsum quis tristique. Vivamus ultricies urna quis nunc egestas, in euismod turpis fringilla. Nam tellus massa, vehicula eu sapien non, dapibus tempor lorem. Fusce placerat orci arcu, eu dignissim enim porttitor vel. Nullam porttitor vel dolor sed feugiat. Suspendisse potenti. Maecenas ac mattis odio. Sed vel ultricies lacus, sed posuere libero.</p>' +
//      '            <p>Nulla gravida libero eget lobortis iaculis. In sed elit eu nibh adipiscing faucibus. Sed ac accumsan lacus. In ut diam quis turpis fringilla volutpat. In ultrices dignissim consequat. Cras pretium tortor et lorem condimentum posuere. Nulla facilisi. Suspendisse pretium egestas lacus ac laoreet. Mauris rhoncus quis ipsum quis tristique. Vivamus ultricies urna quis nunc egestas, in euismod turpis fringilla. Nam tellus massa, vehicula eu sapien non, dapibus tempor lorem. Fusce placerat orci arcu, eu dignissim enim porttitor vel. Nullam porttitor vel dolor sed feugiat. Suspendisse potenti. Maecenas ac mattis odio. Sed vel ultricies lacus, sed posuere libero.</p>' +
//      '          </div>' +
//      '        </div>' +
//      '      </div>' +
//      '    </div>' +
//      '  </div>' +
//      '</div>'
//  );
//  setTimeout(function () {
//    app.hidePreloader();
//  }, 250);
};

// -------------------------------------------------------------------------------------------------------------------
// Register More Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.registerMorePage = function (self, tab, action) {
  var topPart = '<div class="content-block"><div class="list-block"><ul>';
  var midPart = '';
  var botPart = '</ul></div></div>';
  var i;
  for (i = 0; i < self.indexTabPages.length; i++) {
    if (!self.indexTabPages[i].iconShowing) {
      midPart += '<li><a id="' + self.indexTabPages[i].div.id + 'Link" class="item-link tq-more-link"><div class="item-content"><div class="item-media"><i class="fa ' +
        self.indexTabPages[i].shortcutIcon +
        ' fa-lg"></i></div><div class="item-inner"><div class="item-title">' +
        self.indexTabPages[i].shortcutText +
        '</div></div></div></a></li>';
    }
  }
  $(document).on('click', '.tq-more-link', function () {
    var link = this.id;
    if (link.slice(-4) == 'Link') {
      link = link.substring(0, link.length - 4)
      self.f7.showTab('#' + link);
    }
  });
  tab.innerHTML = topPart + midPart + botPart;
};

// -------------------------------------------------------------------------------------------------------------------
// Register App Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.registerAppPage = function (self, tab, action) {
  var topPart = '<div class="content-block content-block-menu">';
  var midPart; // set by setInnerHTML
  var botPart = '</div>';
  var mainMenu = self.presentation.get('contents');
  var curCol; // set by setInnerHTML
  var maxCol = 3;
  var menuContents; // set by setInnerHTML
  var menuStack = [];

  // Set main menu
  setInnerHTML(mainMenu);

  /***
   * Click Handler for app icons
   ***/
  function setInnerHTML(contents) {
    curCol = 1;
    midPart = '';
    menuContents = contents;

    // Back Button
    if (menuStack.length > 0) {
      var backCommand = new Command({name: 'Back', description: 'Back to previous selections', theme: 'primary', icon: 'fa-undo'});
      midPart += '<div class="row">';
      curCol++;
      midPart += self.makeAppIcon(backCommand, 420);
    }

    // Now the rest
    for (var menuItem = 0; menuItem < menuContents.length; menuItem++) {
      if (menuContents[menuItem] instanceof Command) {
        if (curCol == 1)
          midPart += '<div class="row">';
        midPart += self.makeAppIcon(menuContents[menuItem], menuItem);
        if (curCol++ == maxCol || menuItem == menuContents.length - 1) {
          if (curCol - 1 <= 2) midPart += '<div class="col-33"></div>';
          if (curCol - 1 <= 1) midPart += '<div class="col-33"></div>';
          curCol = 1;
          midPart += '</div>';
        }
      }
    }
    tab.innerHTML = topPart + midPart + botPart;
  }

  /***
   * Click Handler for app icons
   ***/
  $(document).on('click', '.tq-app-button', function (event) {
    var id = this.id;
    id = id.substring(2, 99);
    // Back Button ?
    if (id == 420) {
      setInnerHTML(menuStack.pop());
      event.preventDefault();
      return;
    }
    var command = menuContents[id];
    if (command.type == 'Menu') {
      menuStack.push(menuContents);
      setInnerHTML(command.contents);
    } else {
      self.dispatch(new Request({type: 'Command', command: command}));
    }
    event.preventDefault();
  });

}

// -------------------------------------------------------------------------------------------------------------------
// Make App Icon
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.makeAppIcon = function (action, menuItem) {

  var icon = action.icon;
  var className = action.theme || 'default';

  if (!icon) {
    switch (action.type) {
      case "Menu":
        icon = 'fa-th-large';
        break;
      case "Presentation":
        icon = 'fa-building';
        break;
      case "Function":
        icon = 'fa-gear';
        break;
      case "Procedure":
        icon = 'fa-gears';
        break;
      default:
        icon = 'fa-square-o';
        break;
    }
  }

  return '<div class="col-33">' +
    '<a href="#" id="tq' + menuItem + '" class="button button-round button-' + className + ' tq-app-button">' +
    '<i class="fa button-' + className + ' ' +
    icon +
    ' tq-app-icon "></i><br>' +
    action.name +
    '</a></div>'
};

// -------------------------------------------------------------------------------------------------------------------
// Register Device Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.registerDevicePage = function (self, tab, action) {
  tab.innerHTML = '<div class="content-block-title">DEVICE INFORMATION</div>' +
    '<div class="content-block">' +
    '<p>Here is what bowser detects:</p>' +
    '<p>' + JSON.stringify(bowser, null, '\t') + '</p>' +
    '<p>Here is what f7 detects:</p>' +
    '<p>' + JSON.stringify(self.f7.support, null, '\t') + '</p>' +
    '</div>';
};
