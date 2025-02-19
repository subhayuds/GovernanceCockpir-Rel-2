sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/hcl/btp/governance/cockpit/util/ajaxCall",
    "sap/m/MessageToast"
], (Controller, JSONModel, ajaxCall, MessageToast) => {
    "use strict";

    return Controller.extend("com.hcl.btp.governance.cockpit.controller.IntegrationDashboard", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteIntegrationDashboard").attachMatched(this._onRouteMatched, this);

            if (!this._oRouter) {
                this._oRouter = oRouter;
            }
        },

        /**
         * 
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {
            this.loadMonthlyAPIUsageDashboard();
        },

        loadMonthlyAPIUsageDashboard: function () {
            var monthlyUsageData = this.getOwnerComponent().getModel("monthlyResourceUsageModel").getData().content;
            var apiUsageCard = this.getView().byId("apiCallsMonthlyUsage");
            this._apiCardData = JSON.parse(this.getOwnerComponent().getModel("apiUsageBubbleCardDataModel").getJSON());
            var apiUsageList = [];

            for (var i = 0; i < monthlyUsageData.length; i++) {
                //Capture service counts
                if (monthlyUsageData[i].dataCenterName.indexOf('neo') >= 0) {

                } else {
                    //API calls
                    if (monthlyUsageData[i].measureId === 'api_calls') {
                        apiUsageList.push({
                            "subAccount": monthlyUsageData[i].subaccountName,
                            "service": monthlyUsageData[i].serviceName,
                            "usage": monthlyUsageData[i].usage
                        });
                    }
                }
            }

            var apiData = {
                "d": apiUsageList
            };
            this._apiCardData["sap.card"].content.data.json = apiData;
            apiUsageCard.setManifest(this._apiCardData);
        }
    });
});