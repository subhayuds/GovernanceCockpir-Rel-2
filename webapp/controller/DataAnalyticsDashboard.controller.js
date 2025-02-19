sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/hcl/btp/governance/cockpit/util/ajaxCall",
    "sap/m/MessageToast"
], (Controller, JSONModel, ajaxCall, MessageToast) => {
    "use strict";

    return Controller.extend("com.hcl.btp.governance.cockpit.controller.DataAnalyticsDashboard", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteDataAnalyticsDashboard").attachMatched(this._onRouteMatched, this);

            if (!this._oRouter) {
                this._oRouter = oRouter;
            }
        },

        /**
         * 
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {
            this.loadMonthlyHanaDBUsageDashboard();
        },

        loadMonthlyHanaDBUsageDashboard: function () {
            var monthlyUsageData = this.getOwnerComponent().getModel("monthlyResourceUsageModel").getData().content;
            var gbHourList = [];
            var gbHourBackupList = [];
            var gbHourUsageCard = this.getView().byId("gbHourMonthlyUsage");
            var gbHourBackupUsageCard = this.getView().byId("gbHourBackupMonthlyUsage");
            this._gbHourCardData = JSON.parse(this.getOwnerComponent().getModel("gbHourUsageBubbleCardDataModel").getJSON());
            this._gbHourBackupCardData = JSON.parse(this.getOwnerComponent().getModel("gbHourBackupUsageBubbleCardDataModel").getJSON());

            for (var i = 0; i < monthlyUsageData.length; i++) {
                //Capture service counts
                if (monthlyUsageData[i].dataCenterName.indexOf('neo') >= 0) {
                    
                } else {
                    //GB Hour
                    if (monthlyUsageData[i].measureId === 'hc_storage_GiB_hours') {
                        gbHourList.push({
                            "subAccount": monthlyUsageData[i].subaccountName,
                            "service": monthlyUsageData[i].serviceName,
                            "usage": monthlyUsageData[i].usage
                        });
                    } else if (monthlyUsageData[i].measureId === 'hc_backup_GiB_hours') {
                        gbHourBackupList.push({
                            "subAccount": monthlyUsageData[i].subaccountName,
                            "service": monthlyUsageData[i].serviceName,
                            "usage": monthlyUsageData[i].usage
                        });
                    }
                }
            }

            var gbHourData = {
                "d": gbHourList
            };
            this._gbHourCardData["sap.card"].content.data.json = gbHourData;
            gbHourUsageCard.setManifest(this._gbHourCardData);

            var gbHourBackupData = {
                "d": gbHourBackupList
            };
            this._gbHourBackupCardData["sap.card"].content.data.json = gbHourBackupData;
            gbHourBackupUsageCard.setManifest(this._gbHourBackupCardData);
        }
    });
})