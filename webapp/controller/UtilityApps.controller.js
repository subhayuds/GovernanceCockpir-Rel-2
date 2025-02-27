sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/hcl/btp/governance/cockpit/util/ajaxCall",
    "sap/m/MessageToast"
], (Controller, JSONModel, ajaxCall, MessageToast) => {
    "use strict";

    return Controller.extend("com.hcl.btp.governance.cockpit.controller.UtilityApps", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteUtilityApps").attachMatched(this._onRouteMatched, this);

            if (!this._oRouter) {
                this._oRouter = oRouter;
            }
        },

        /**
         * 
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {

        }
    });
});