sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/hcl/btp/governance/cockpit/util/ajaxCall",
    "sap/m/MessageToast"
], (Controller, JSONModel, ajaxCall, MessageToast) => {
    "use strict";

    return Controller.extend("com.hcl.btp.governance.cockpit.controller.CommercialDashboard", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteCommercialDashboard").attachMatched(this._onRouteMatched, this);

            if (!this._oRouter) {
                this._oRouter = oRouter;
            }
        },

        /**
         * 
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {
            this.processSubaccountCost();
        },

        processSubaccountCost: function () {
            var that = this;
           
            var subaccountCostCard = that.getView().byId("cardSubaccountCost");
            var subaccountCostModel = that.getOwnerComponent().getModel("monthlySubaccountsCostCardModel");
            that._subaccountCostModel = JSON.parse(subaccountCostModel.getJSON());
 
           
            var serviceCostCard = that.getView().byId("cardServcieCost");
            var serviceCostModel = that.getOwnerComponent().getModel("serviceCostCardModel");
            that._serviceCostModel = JSON.parse(serviceCostModel.getJSON());
 
            var subAccountsDataModel = that.getOwnerComponent().getModel("subAccountsCostDataModel");
            that._SubAccountsCostDataModel = JSON.parse(subAccountsDataModel.getJSON());
            var subaccounts = that._SubAccountsCostDataModel.content;
 
            var subaccountCostMap = {};
            for (var i = 0; i < subaccounts.length; i++) {
                var subaccount = subaccounts[i];
                var subaccountName = subaccount.subaccountName;
                var cost = subaccount.cost || 0;
 
                if (!subaccountCostMap[subaccountName]) {
                    subaccountCostMap[subaccountName] = 0;
                }
                subaccountCostMap[subaccountName] += cost;
            }
 
            var result = [];
            for (var subaccountName in subaccountCostMap) {
                result.push({
                    subaccountName: subaccountName,
                    totalCost: Math.round(subaccountCostMap[subaccountName] * 100) / 100
                });
            }
 
            result.sort(function (a, b) {
                return b.totalCost - a.totalCost;
            });
            var top5Subaccounts = result.slice(0, 5);
 
            //servicecost
            var serviceCosts = [];
 
            subaccounts.forEach(function (subaccount) {
                var existingService = serviceCosts.find(function (item) {
                    return item.serviceName === subaccount.serviceName;
                });
 
                var costs = Array.isArray(subaccount.cost) ? subaccount.cost : [subaccount.cost || 0];
                var sum = 0;
                for (var j = 0; j < costs.length; j++) {
                    sum += costs[j];
                }
 
                if (existingService) {
                    existingService.totalCost += sum;
                } else {
                    serviceCosts.push({ serviceName: subaccount.serviceName, totalCost: sum });
                }
            });
 
            serviceCosts.forEach(function (service) {
                service.totalCost = parseFloat(service.totalCost.toFixed(2));
            });
 
            serviceCosts.sort(function (a, b) {
                return b.totalCost - a.totalCost;
            });
            var top5CostlyServices = serviceCosts.slice(0, 5);
 
 
            that._subaccountCostModel["sap.card"].content.data.json.list = top5Subaccounts;
            subaccountCostCard.setManifest(that._subaccountCostModel);
 
            that._serviceCostModel["sap.card"].content.data.json.list = top5CostlyServices;
            serviceCostCard.setManifest(that._serviceCostModel);
        }
    });
});