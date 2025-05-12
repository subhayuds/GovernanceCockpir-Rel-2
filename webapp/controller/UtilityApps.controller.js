sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/Container"
], (Controller, Container) => {
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

        },

        onPressAdjustMonitor: async function (oEvent) {
            const Navigation = await Container.getServiceAsync("Navigation");
            const sHref = await Navigation.getHref({
                target: {
                    semanticObject: "accounts",
                    action: "manage"
                }
            });
            sap.m.URLHelper.redirect(sHref, true);
        },

        onPressAccounts: async function (oEvent) {
            const Navigation = await Container.getServiceAsync("Navigation");
            const sHref = await Navigation.getHref({
                target: {
                    semanticObject: "accounts",
                    action: "manage"
                }
            });
            sap.m.URLHelper.redirect(sHref, true);
        },

        pressAccessAuth: async function (oEvent) {
            const Navigation = await Container.getServiceAsync("Navigation");
            const sHref = await Navigation.getHref({
                target: {
                    semanticObject: "accounts",
                    action: "manage"
                }
            });
            sap.m.URLHelper.redirect(sHref, true);
        },

        onPressAuditLogs: async function (oEvent) {
            const Navigation = await Container.getServiceAsync("Navigation");
            const sHref = await Navigation.getHref({
                target: {
                    semanticObject: "AuditLog_Object",
                    action: "AuditLog_Action"
                }
            });
            sap.m.URLHelper.redirect(sHref, true);
        },

        onPressIntegrationLogs: async function (oEvent) {
            const Navigation = await Container.getServiceAsync("Navigation");
            const sHref = await Navigation.getHref({
                target: {
                    semanticObject: "integrationLog",
                    action: "view"
                }
            });
            sap.m.URLHelper.redirect(sHref, true);
        },
    });
});