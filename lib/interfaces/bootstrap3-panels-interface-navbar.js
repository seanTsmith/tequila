/**
 * tequila
 * bootstrap3-panels-interface-navbar
 */

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.renderNavBar = function () {

  // Main navbar
  this.navBar = document.createElement("header");
  this.navBar.id = "navBar";
//  this.navBar.className = "navbar navbar-fixed-top";
  this.navBar.className = "navbar navbar-inverse navbar-fixed-top";
  this.navBar.setAttribute('draggable', 'true'); // so you can't select text
  this.navBar.setAttribute('role', 'banner');
  document.body.appendChild(this.navBar);

  // Fake div to offset fixed navbar in body
  this.navBarShunt = document.createElement("div");
  this.navBarShunt.id = "navBarShunt";
  this.navBarShunt.className = "navbar-shunt";
  this.navBarShunt.setAttribute('draggable', 'true'); // so you can't select text
  document.body.appendChild(this.navBarShunt);

  // Container so bootstrap centers
  this.navContainer = document.createElement("div");
  this.navContainer.id = "navContainer";
  this.navContainer.className = "container";
  this.navBar.appendChild(this.navContainer);

  // Responsive header
  this.navResponsiveHeader = document.createElement("div");
  this.navResponsiveHeader.id = "navResponsiveHeader";
  this.navResponsiveHeader.className = "navbar-header";
  this.navContainer.appendChild(this.navResponsiveHeader);

  // Navbar toggle button when small presentation
  var iconBar = '<span class="icon-bar"></span>';
  this.navBarToggle = document.createElement("button");
  this.navBarToggle.id = "navBarToggle";
  this.navBarToggle.className = "navbar-toggle";
  this.navBarToggle.setAttribute('type', 'button');
  this.navBarToggle.setAttribute('data-toggle', 'collapse');
  this.navBarToggle.setAttribute('data-target', '.navbar-collapse');
  this.navBarToggle.innerHTML = iconBar + iconBar + iconBar;
  this.navResponsiveHeader.appendChild(this.navBarToggle);

  // Brand
  this.navBarBrand = document.createElement("a");
  this.navBarBrand.id = "navBarBrand";
  this.navBarBrand.className = "navbar-brand";
  this.navBarBrand.innerHTML = '<a href="javascript:b3p.homePanel()">' + app.get('brand') + '</a>';
  this.navResponsiveHeader.appendChild(this.navBarBrand);

  // Collapsible navbar
  this.collapsibleNavBar = document.createElement("div");
  this.collapsibleNavBar.id = "collapsibleNavBar";
  this.collapsibleNavBar.className = "navbar-collapse collapse";
  this.collapsibleNavBar.setAttribute('role', 'navigation');
  this.navContainer.appendChild(this.collapsibleNavBar);

  // navbar list
  this.navList = document.createElement("ul");
  this.navList.id = "navList";
  this.navList.className = "nav navbar-nav";
  this.collapsibleNavBar.appendChild(this.navList);

  // Render commands
  var pres;
  var menu = this.presentation.get('contents');
  for (pres in menu) {
    if (menu[pres].type == 'Menu') {
      var parentMenu = this.renderNavBarListMenu(this.navList, menu[pres].name);
      var subMenu = menu[pres].contents;
      for (subPres in subMenu) {
        if (subMenu.hasOwnProperty(subPres)) {
          if (typeof subMenu[subPres] == 'string') {
            this.renderNavBarListItem(parentMenu, subMenu[subPres]);
          } else {
            if (subMenu[subPres].type == 'Menu') {
              throw new Error('cant do nested submenus')
            } else {
              this.renderNavBarListItem(parentMenu, subMenu[subPres]);
            }
          }
        }
      }
    } else {
      this.renderNavBarListItem(this.navList, menu[pres]);
    }
  }


//  this.stooges = this.renderNavBarListMenu(this.navList, 'Contacts');
//  this.renderNavBarListItem(this.stooges, 'Moe');
//  this.renderNavBarListItem(this.stooges, 'Larry');
//  this.renderNavBarListItem(this.stooges, 'Curly');
//
//  this.fruit = this.renderNavBarListMenu(this.navList, 'Projects');
//  this.renderNavBarListItem(this.fruit, 'Apple');
//  this.renderNavBarListItem(this.fruit, 'Banana');
//  this.renderNavBarListItem(this.fruit, 'Cherry');
//  this.renderNavBarListItem(this.fruit, 'Peach');
//
//  this.superhero = this.renderNavBarListMenu(this.navList, 'Customers');
//  this.renderNavBarListItem(this.superhero, 'Superman');
//  this.renderNavBarListItem(this.superhero, 'Batman');
//  this.renderNavBarListItem(this.superhero, 'Spiderman');
//
//  this.vendor = this.renderNavBarListMenu(this.navList, 'Vendors');
//  this.renderNavBarListItem(this.vendor, 'Lex Luther');
//  this.renderNavBarListItem(this.vendor, 'Tom');
//  this.renderNavBarListItem(this.vendor, 'Jerry');
//
//  this.pns = this.renderNavBarListMenu(this.navList, 'Product');
//  this.renderNavBarListItem(this.pns, 'Meth');
//  this.renderNavBarListItem(this.pns, 'Crack');
//
//  this.fin = this.renderNavBarListMenu(this.navList, 'Financial');
//  this.renderNavBarListItem(this.fin, 'Wooden Nickel');
//  this.renderNavBarListItem(this.fin, 'Sawbuck');

//  // Message Icon
//  this.navEmail = document.createElement("li");
//  this.navEmail.className = "navbar-icons navbar-icon-gap";
//  this.navEmail.innerHTML = '<a href="#" class="navbar-icons"><i class="fa fa-envelope"> <span class="badge blue-badge">999</span></a>';
//  this.navList.appendChild(this.navEmail);
//
//  // Calendar Icon
//  this.navCalendar = document.createElement("li");
//  this.navCalendar.className = "navbar-icons";
//  this.navCalendar.innerHTML = '<a href="#" class="navbar-icons"><i class="fa fa-calendar"> <span class="badge blue-badge">999</span></a>';
//  this.navList.appendChild(this.navCalendar);
//
//  // User Drop Down
//  this.navListRight = document.createElement("ul");
//  this.navListRight.id = "navListRight";
//  this.navListRight.className = "nav navbar-nav navbar-right";
//  this.collapsibleNavBar.appendChild(this.navListRight);
//
//  this.user = this.renderNavBarListMenu(this.navListRight, '<i class="fa fa-user fa-lg"></i> <i class="fa navbar-user-name">Guest0123456789</i>');
//  this.renderNavBarListItem(this.user, 'Organization','<i class="fa fa-sitemap"></i> ');
//  this.renderNavBarListItem(this.user, 'Options','<i class="fa fa-gear"></i> ');
//  this.renderNavBarListItem(this.user, 'Logout','<i class="fa fa-sign-out"></i> ');

};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.navPicked = function (label) {
  // Prototype - delete whenever
  var action = {};
  action.label = label;
  switch (label) {
    case 'Contacts':
      action.style = 'info';
      break;
    case 'Customers':
      action.style = 'dude';
      break;
    case 'Vendors':
      action.style = 'danger';
      break;
    case 'Projects':
      action.style = 'sweet';
      break;
    case 'Products & Services':
      action.style = 'warning';
      break;
    case 'Financial':
      action.style = 'success';
      break;
    case 'Organization':
      action.style = 'primary';
      break;
    case 'System':
      action.style = 'default';
      action.type = 'options';
      break;
  }
  this.renderPanel(action);
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.renderNavBarListItem = function (parent, action, icon) {
  var self = this;
  var html;
  var listItem = document.createElement('li');
  icon = icon || '';
  if (action instanceof Command) {
    html = '<a>' + icon + action.name + '</a>';
    $(listItem).click(function (e) {
      self.navPicked(action);
      e.preventDefault();
    });
  } else {
    if (action == '-') {
      listItem.className = 'divider';
    } else {
      listItem.className = 'dropdown-header';
      html = action;
    }
  }
  listItem.innerHTML = html;
  parent.appendChild(listItem);
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Menu
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.renderNavBarListMenu = function (parent, name) {

  var dropDown = document.createElement('li');
  dropDown.className = "dropdown";
  dropDown.innerHTML = '<a href="#" class="dropdown-toggle navbar-menu" data-toggle="dropdown">' + name + '<b class="caret"></b></a>'
  parent.appendChild(dropDown);

  var dropDownMenu = document.createElement('ul');
  dropDownMenu.className = "dropdown-menu";
  dropDown.appendChild(dropDownMenu);

  return dropDownMenu;
};
