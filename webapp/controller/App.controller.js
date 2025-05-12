sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("com.hcl.btp.governance.cockpit.controller.App", {
    onInit() {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      if (!this._oRouter) {
        this._oRouter = oRouter;
      }
    },

    onAfterRendering: function () {
      var oSideNav = this.byId("sideNavGovernanceCockpit");
      oSideNav.setExpanded(false);
    },

    onToggleNav: function () {
      var oSideNav = this.byId("sideNavGovernanceCockpit");
      oSideNav.setExpanded(!oSideNav.getExpanded());
    },

    onNavItemSelect: function (oEvent) {
      var sKey = oEvent.getParameter("item").getKey();

      switch (sKey) {
        case "PLATFORM":
          this._oRouter.navTo("RoutePlatformDashboard");
          break;
        case "COMMERCIALS":
          this._oRouter.navTo("RouteCommercialDashboard");
          break;
        case "INTEGRATION":
          this._oRouter.navTo("RouteIntegrationDashboard");
          break;
        // case "AUTOMATION":
        //   this._oRouter.navTo("Automation");
        //   break;
        case "DATA":
          this._oRouter.navTo("RouteDataAnalyticsDashboard");
          break;
        case "REPORTS":
          this._oRouter.navTo("RouteReports");
          break;
        case "UTILITIES":
          this._oRouter.navTo("RouteUtilityApps");
          break;
        default:
          break;
      }
    }
  });
});