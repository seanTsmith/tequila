/**
 * tequila
 * bootstrap3-panels-interface-appbar
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: options
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.registerAppBar = function (self, panel) {

  var panelBody = panel.panelBody;
  var panelTitle = panel.panelTitle;
  var newPanel = panelBody.parentNode;

  var txtTitle = '' +
    '<a class="btn btn-primary" id="homeSlice1" href="javascript:b3p.homeSlice(1)"><i class="fa fa-th fa-2x"></i><span class="hidden-xs">' + app.get('brand') + '</span></a>' +
    '<a class="btn btn-primary" id="homeSlice2" href="javascript:b3p.homeSlice(2)"><i class="fa fa-search fa-2x"></i><span class="hidden-xs">Find</span></a>' +
    '<a class="btn btn-primary" id="homeSlice3" href="javascript:b3p.homeSlice(3)"><i class="fa fa-bookmark fa-2x"></i><span class="hidden-xs">Bookmarks</span></a>' +
    '<a class="btn btn-primary" id="homeSlice4" href="javascript:b3p.homeSlice(4)"><i class="fa fa-book fa-2x"></i><span class="hidden-xs">History</span></a>' +
    '<a class="btn btn-primary" id="homeSlice5" href="javascript:b3p.homeSlice(5)"><i class="fa fa-info-circle fa-2x"></i><span class="hidden-xs">Info</span></a>' +
    '<a class="btn btn-primary" id="homeSlice6" href="javascript:b3p.homeSlice(6)"><i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">More</span></a>';

  var panelHomeButtonGroup = document.createElement("div");
  panelHomeButtonGroup.className = "btn-group btn-group-justified";
  panelHomeButtonGroup.innerHTML = txtTitle;
  panelTitle.appendChild(panelHomeButtonGroup);

  // wtf this is shitty code ...
  panelBody.className = "panel-body panel-body-home";
  panelBody.id = "homePanel1";

  var panelBodyInsert2 = document.createElement("div");
  panelBodyInsert2.className = "panel-body panel-body-home-inside";
  panelBodyInsert2.id = "homePanel2";
  newPanel.appendChild(panelBodyInsert2);
  $.get('text/find.md', function (data) {
    panelBodyInsert2.innerHTML = '<div class="well-panel">' + markdown.toHTML(data) + '</div>';
  });

  var panelBodyInsert3 = document.createElement("div");
  panelBodyInsert3.className = "panel-body panel-body-home-inside";
  panelBodyInsert3.id = "homePanel3";
  newPanel.appendChild(panelBodyInsert3);
  $.get('text/bookmarks.md', function (data) {
    panelBodyInsert3.innerHTML = '<div class="well-panel">' + markdown.toHTML(data) + '</div>';
  });

  var panelBodyInsert4 = document.createElement("div");
  panelBodyInsert4.className = "panel-body panel-body-home-inside";
  panelBodyInsert4.id = "homePanel4";
  newPanel.appendChild(panelBodyInsert4);
  $.get('text/history.md', function (data) {
    panelBodyInsert4.innerHTML = '<div class="well-panel">' + markdown.toHTML(data) + '</div>';
  });

  var panelBodyInsert5 = document.createElement("div");
  panelBodyInsert5.className = "panel-body panel-body-home-inside";
  panelBodyInsert5.id = "homePanel5";
  newPanel.appendChild(panelBodyInsert5);
  $.get('text/info.md', function (data) {
    panelBodyInsert5.innerHTML = '<div class="well-panel">' + markdown.toHTML(data) + '</div>';
  });

  self.panelToolbar = document.createElement("div");
  self.panelToolbar.className = "panel-footer-home";

  self.panelToolbar.innerHTML = '<div class="btn-group btn-group-justified">' +
    self.toolBar('fa-home', 'Home View') +
    self.toolBar('fa-chevron-circle-left', 'Collapse All Panels') +
    self.toolBar('fa-chevron-circle-up', 'Expand All Panels') +
    self.toolBar('fa-plus-circle', 'Show Active') +
    self.toolBar('fa-minus-circle', 'Close Inactive') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    '</div>';

  newPanel.appendChild(self.panelToolbar);
  $(self.panelToolbar).hide();


  // Home Command
  self.homeSlice(1, true);

  return true;
};

// -------------------------------------------------------------------------------------------------------------------
// ToolBar
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.toolBar = function (icon, tooltip) {
  var click = "javascript:b3p.toolBarClicked('" + icon + "')";
  if (tooltip)
    return '<a class="btn btn-primary btn-toolbar" href="' + click + '" data-toggle="tooltip" title="' + tooltip + '"><i class="fa ' + icon + ' fa-2x"></i></a>';
  else
    return '<a class="btn btn-primary btn-toolbar" href="' + click + '"><i class="fa ' + icon + ' fa-2x"></i></a>';
};

// -------------------------------------------------------------------------------------------------------------------
// ToolBar
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.toolBarClicked = function (action) {
  switch (action) {
    case 'fa-home':
      this.homePanel();
      break;
  }
};

// -------------------------------------------------------------------------------------------------------------------
// Home Panel
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.homePanel = function () {
  if (!this.homePanelID) {
    this.homePanelID = this.renderPanel({label: 'Home', type: 'home', style: 'primary', icon: 'fa-home'});
  } else {
    var num = this.panels[this.homePanelID].eleCount;
    this.panelContract(num);
    this.panelClicked(num);
    this.closeHome();
  }
};

// -------------------------------------------------------------------------------------------------------------------
// home Buttons on top
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.homeSlice = function (num, quick) {

  if (num == 6) {
    var hp6 = document.getElementById('homeSlice6');
    var tb = $(this.panelToolbar);
    if (tb.is(":visible")) {
      hp6.innerHTML = '<i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">More</span>';
      tb.hide();
    } else {
      hp6.innerHTML = '<i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">Less</span>';
      tb.show();
    }
    return;
  }

  // First reset all home panels and hide
  var hsButton = document.getElementById('homeSlice' + num);
  var wasActive = (hsButton.className == "btn btn-primary active");
  document.getElementById('homeSlice1').className = "btn btn-primary";
  document.getElementById('homeSlice2').className = "btn btn-primary";
  document.getElementById('homeSlice3').className = "btn btn-primary";
  document.getElementById('homeSlice4').className = "btn btn-primary";
  document.getElementById('homeSlice5').className = "btn btn-primary";
  var anim = 250
  if (quick) anim = 0;
  $('#homePanel1').hide(anim);
  $('#homePanel2').hide(anim);
  $('#homePanel3').hide(anim);
  $('#homePanel4').hide(anim);
  $('#homePanel5').hide(anim);

  // If we clicked on open one then just leave while all closed
  if (wasActive) {
    return;
  }

  // Make clicked button active and
  hsButton.className = "btn btn-primary active";

  // Render panel then display
  var html = '';
  var panelBody = document.getElementById("homePanel" + num);
  switch (num) {

    case 1: // Home

//      var menu = [];
//      menu.push(['Contacts', 'fa-group', 'btn-info']);
//      menu.push(['Customers', 'fa-user', 'btn-dude']);
//      menu.push(['Vendors', 'fa-truck', 'btn-danger']);
//      menu.push(['Projects', 'fa-suitcase', 'btn-sweet']);
//      menu.push(['Products & Services', 'fa-gears', 'btn-warning']);
//      menu.push(['Financial', 'fa-money', 'btn-success']);
//      menu.push(['Organization', 'fa-sitemap', 'btn-primary']);
//      menu.push(['System', 'fa-power-off', 'btn-default']);
//      // Render commands
//      var menu = [];
//      var pres;
//      var menuContents = this.presentation.get('contents');
//      for (pres in menuContents) {
//        menu.push([menuContents[pres], 'fa-question', 'btn-default']);
//      }
//      for (var m in menu) {
////        html += '<a class="btn ' + menu[m][2] + ' ti-shortcut-button" href="javascript:b3p.navPicked(\'' + menu[m][0] + '\')">';
//        // html += '<a class="btn ' + menu[m][2] + ' ti-shortcut-button">';
//        var anchor = document.createElement('a');
//        anchor.className = 'btn ' + menu[m][2] + ' ti-shortcut-button';
//        html = '<i class="fa ' + menu[m][1] + ' fa-2x"></i>';
//        html += '<div style="white-space: normal; word-wrap: break-word" class="">' + menu[m][0] + '</div>';
//        anchor.innerHTML = html;
//        $(anchor).click(function (e) {
//          console.log('eat my ass');
//          e.preventDefault();
//        });
//        panelBody.appendChild(anchor);
//        // html += '</a>';
//      }
//      // panelBody.innerHTML = html;

      // Render commands for App
      panelBody.innerHTML = '';
      var menuItem;
      var menuContents = this.presentation.get('contents');
      for (menuItem in menuContents) {
        this.renderAppBarListItem(panelBody, menuContents[menuItem]);
      }
      break;
    case 2: // Find
      break;
    case 3: // Starred
      break;
    case 4: // History
      break;
    case 5: // Info
      break;
  }
  $(panelBody).show(250);
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.renderAppBarListItem = function (parent, action) {

  if (!(action instanceof Command))
    return;

  var self = this;
  var html;
  var icon = action.icon; // || 'fa-square-o';
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

//  if (menuContents[menuItem].type == 'Menu')
//    this.renderAppBarListItem(panelBody, menuContents[menuItem], 'fa-th-large');
//  else
//    this.renderAppBarListItem(panelBody, menuContents[menuItem]);

  var anchor = document.createElement('a');
  anchor.className = 'btn btn-' + className + ' ti-shortcut-button';
  html = '<i class="fa ' + icon + ' fa-2x"></i>';
  html += '<div style="white-space: normal; word-wrap: break-word" class="">' + action.name + '</div>';
  anchor.innerHTML = html;
  $(anchor).click(function (e) {
    if (action.type == 'Menu' || (action.type == 'Stub' && action.name == 'Back')) {
      parent.innerHTML = '';
      var menuItem;
      var menuContents = action.contents;
      if (action.type == 'Stub' && action.name == 'Back')
        menuContents = self.presentation.get('contents');
      for (menuItem in menuContents) {
        self.renderAppBarListItem(parent, menuContents[menuItem]);
      }
      if (!(action.type == 'Stub' && action.name == 'Back')) {
        var backCommand = new Command({name: 'Back', description: 'Back to previous selections', theme:'primary', icon:'fa-undo'});
        backCommand.name = 'Back';
        self.renderAppBarListItem(parent, backCommand, 'fa-undo', 'btn-primary');
      }
    } else {
      self.dispatch(new Request({type:'Command', command:action}));
      // console.log(JSON.stringify(action));
    }
    e.preventDefault();
  });
  anchor.innerHTML = html;
  parent.appendChild(anchor);

  $(anchor).tooltip({
    placement: "bottom",
    delay: {show: 500, hide: 100},
    title: action.description
  });

};

// -------------------------------------------------------------------------------------------------------------------
// Close Home
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.closeHome = function () {
  if (this.homePanelID) {
    document.getElementById('homeSlice1').className = "btn btn-primary";
    document.getElementById('homeSlice2').className = "btn btn-primary";
    document.getElementById('homeSlice3').className = "btn btn-primary";
    document.getElementById('homeSlice4').className = "btn btn-primary";
    document.getElementById('homeSlice5').className = "btn btn-primary";
    $('#homePanel1').hide(250);
    $('#homePanel2').hide(250);
    $('#homePanel3').hide(250);
    $('#homePanel4').hide(250);
    $('#homePanel5').hide(250);
  }
};
