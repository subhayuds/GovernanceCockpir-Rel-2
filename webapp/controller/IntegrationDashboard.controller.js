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
            this.loadIntegrationDetails();
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

            apiUsageList.sort((a, b) => (a.usage > b.usage ? 1 : -1));
            apiUsageList.reverse();
            apiUsageList.splice(5);

            this._apiCardData["sap.card"].content.data.json = apiUsageList;
            apiUsageCard.setManifest(this._apiCardData);
        },

        loadIntegrationDetails: function() {
            // var that = this;
            // var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            // var sUrl = prefix + "api/v1/IntegrationRuntimeArtifacts?$format=json";

            // ajaxCall.makeAjaxReadCall(sUrl, that.getIntegrationDetailsSuccessCallBack, that.errorCallBack, that);
            var integrationRintimeArtifactsData = this.getOwnerComponent().getModel("integrationRintimeArtifactsDataModel").getData();
            this.getIntegrationDetailsSuccessCallBack(integrationRintimeArtifactsData, this);
        },

        getIntegrationDetailsSuccessCallBack: function(data, that) {
            var typeCounts = {};
            var statusCounts = {};  // To count statuses
            var integrTypeCard = that.getView().byId("cardContentTypes");
            var integrTypeModel = that.getOwnerComponent().getModel("integrationContentTypeBarCardDataModel");
            that._integrTypeModel = JSON.parse(integrTypeModel.getJSON());

            var integrStatusCard = that.getView().byId("cardContentStatus");
            var integrStatusModel = that.getOwnerComponent().getModel("integrationContentStatusDonutCardDataModel");
            that._integrStatusModel = JSON.parse(integrStatusModel.getJSON());

            data.d.results.forEach(function (item) {
                var type = item.Type;
                var status = item.Status;

                // Type count logic
                if (type) {
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                }

                // Status count logic
                if (status) {
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                }
            });

            // Create chart data for the stacked column chart
            var chartData = [];
            for (var type in typeCounts) {
                chartData.push({
                    Type: type,
                    Count: typeCounts[type]
                });
            }

            // Create data for donut chart (status count)
            var donutData = [];
            for (var status in statusCounts) {
                donutData.push({
                    Status: status,
                    Count: statusCounts[status]  // Status count
                });
            }

            that._integrTypeModel["sap.card"].content.data.json.list = chartData;
            integrTypeCard.setManifest(that._integrTypeModel);

            that._integrStatusModel["sap.card"].content.data.json.list = donutData;
            integrStatusCard.setManifest(that._integrStatusModel);
        },

        errorCallBack: function (errMsg, viewObj) {
            MessageToast.show(errMsg);
        },
    });
});