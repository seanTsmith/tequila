/**
 * tequila
 * bootstrap3-panels-interface-client
 */

// -------------------------------------------------------------------------------------------------------------------
// Methods (Client Side Only)
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.start = function (application, presentation, callBack) {
  if (!(application instanceof Application)) throw new Error('Application required');
  if (!(presentation instanceof Presentation)) throw new Error('Presentation required');
  if (typeof callBack != 'function') throw new Error('callback required');
  this.startCallback = callBack;

  // Stuff we care about
  this.panelHandlers = [];
  this.eleCount = 0;
  this.presentation = presentation;

  // Register Panels
  this.addPanelHandler('home', this.registerAppBar);
  this.addPanelHandler('stub', this.registerStubPanel);

  // Create html elements for framework
  this.renderFramework();

  // Remover loading panel
  try {
    var loadingPanel = document.getElementById("loadingPanel");
    loadingPanel.parentNode.removeChild(loadingPanel);
  } catch (e) {
  }

  // Change background from white in loader
  document.body.style.backgroundColor = "#e0e0e0";
};

// -------------------------------------------------------------------------------------------------------------------
// Dispatch request
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.dispatch = function (request, response) {
  if (false === (request instanceof Request)) throw new Error('Request required');
  if (response && typeof response != 'function') throw new Error('response callback is not a function');
  if (!this.application || !this.application.dispatch(request)) {
    if (request.type == 'Command' && request.command.type == 'Stub') {
      this.renderPanel({label: request.command.name, type: 'stub', style: 'info', icon: 'fa-square-o', request: request});
    } else {
      if (this.startCallback) {
        this.startCallback(request);
      }
    }
  }
};

// -------------------------------------------------------------------------------------------------------------------
// Render Framework
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.renderFramework = function () {
  this.renderNavBar();
  this.homePanel();
//  myInterface.renderPageFooter();
//  myInterface.renderPanel({label:'Eat'});
//  myInterface.renderPanel({label:'More'});
//  myInterface.renderPanel({label:'Chiken'});
};
