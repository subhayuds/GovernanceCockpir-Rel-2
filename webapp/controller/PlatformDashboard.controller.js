sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/hcl/governancecockpit/util/ajaxCall",
    "sap/m/MessageToast"
], (Controller, JSONModel, ajaxCall, MessageToast) => {
    "use strict";

    return Controller.extend("com.hcl.btp.governance.cockpit.controller.PlatformDashboard", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RoutePlatformDashboard").attachMatched(this._onRouteMatched, this);

            if (!this._oRouter) {
                this._oRouter = oRouter;
            }

            this.loadSubAccount();
            this.loadEntitlement();
            this.loadResourceMonthlyUsage();
            // this.loadAuditLogs();
            // this.loadProvisioning();
            // this.loadResourceMonthlyDirectory();
            // this.loadResourceMonthlySubaccount();-
            // this.loadResourceSubAccountUsage();
        },

        /**
         * 
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {

        },

        /**
         * Get All Sub Account
         */
        loadSubAccount: function () {
            var that = this;
            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var sUrl = prefix + "accounts/v1/subaccounts";

            ajaxCall.makeAjaxReadCall(sUrl, that.getSubAccountSuccessCallBack, that.errorCallBack, this);
        },

        getSubAccountSuccessCallBack: function (data, that) {
            var subAccountModel = new JSONModel(data);
            that.getOwnerComponent().setModel(subAccountModel, "subAccountModel");
            that._subaccountCount = data.value.length;

            var subAccountMap = {};
            for (var i = 0; i < data.value.length; i++) {
                subAccountMap[data.value[i].guid] = data.value[i];
            }
            that.getOwnerComponent()._subAccountMap = subAccountMap;

            var cardSubAccountTable = that.getView().byId("cardTableSubAccounts");
            var tableCardModel = that.getOwnerComponent().getModel("subAccountsTableCardModel");
            that._tableCardModel = JSON.parse(tableCardModel.getJSON());
            var arrData = [];

            for (var i = 0; i < data.value.length; i++) {
                var obJson = {
                    "displayName": data.value[i].displayName,
                    "region": data.value[i].region?.toUpperCase(),
                    "createdBy": data.value[i].createdBy?.toLowerCase(),
                    "createdDate": sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MMM-yyyy" }).format(new Date(data.value[i].createdDate)),
                }
                arrData.push(obJson);
            }

            that._tableCardModel["sap.card"].data.json = arrData;
            cardSubAccountTable.setManifest(that._tableCardModel);
        },

        errorCallBack: function (errMsg, viewObj) {
            MessageToast.show(errMsg);
        },

        /**
         * Get Entitlements
         */
        loadEntitlement: function () {
            var that = this;
            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var sUrl = prefix + "entitlements/v1/assignments";

            ajaxCall.makeAjaxReadCall(sUrl, that.getView().getController().getEntitlementSuccessCallBack,
                that.getView().getController().errorCallBack, that);
        },

        getEntitlementSuccessCallBack: function (data, that) {
            var entitlementModel = new JSONModel(data);
            that.getOwnerComponent().setModel(entitlementModel, "entitlementModel");

            var cardTableEntitlement = that.getView().byId("cardTableEntitlement");
            var tableCardModel = that.getOwnerComponent().getModel("entitlementTableCardModel");
            that._tableCardModel = JSON.parse(tableCardModel.getJSON());

            var entitlements = data.entitledServices;
            var arrData = [];

            for (var i = 0; i < entitlements.length; i++) {
                var obJson = {
                    "displayName": entitlements[i].displayName,
                    "category": entitlements[i].businessCategory.displayName,
                    "plan": entitlements[i].servicePlans[0].sourceEntitlements != null ? entitlements[i].servicePlans[0].sourceEntitlements[0].commercialModel?.displayName : "Not available",
                    "quota": entitlements[i].servicePlans[0].amount,
                }
                arrData.push(obJson);
            }

            that._tableCardModel["sap.card"].data.json = arrData;
            cardTableEntitlement.setManifest(that._tableCardModel);
        },

        /**
         * 
         */
        loadResourceMonthlyUsage: function () {
            var that = this;
            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var sUrl = prefix + "reports/v1/monthlyUsage";
            sUrl = sUrl + "?fromDate=202404&toDate=202404";
            ajaxCall.makeAjaxReadCall(sUrl, that.getView().getController().getResourceMonthlyUsageSuccessCallBack,
                that.getView().getController().errorCallBack, that);
        },

        getResourceMonthlyUsageSuccessCallBack: function (data, that) {
            var monthlyResourceUsageModel = new JSONModel(data);
            that.getOwnerComponent().setModel(monthlyResourceUsageModel, "monthlyResourceUsageModel");

            var serviceCountCard = that.getView().byId("resourceMonthlyCount");
            var serviceUsageCard = that.getView().byId("resourceMonthlyUsage");
            var gbHourUsageCard = that.getView().byId("gbHourMonthlyUsage");
            var gbHourBackupUsageCard = that.getView().byId("gbHourBackupMonthlyUsage");
            var apiUsageCard = that.getView().byId("apiCallsMonthlyUsage");

            that._serviceCountCardData = JSON.parse(that.getOwnerComponent().getModel("subaccountServiceCountColumnChartAnalyticCardModel").getJSON());
            that._serviceUsageCardData = JSON.parse(that.getOwnerComponent().getModel("subaccountServiceUsageColumnChartAnalyticCardModel").getJSON());
            that._gbHourCardData = JSON.parse(that.getOwnerComponent().getModel("gbHourUsageBubbleCardDataModel").getJSON());
            that._gbHourBackupCardData = JSON.parse(that.getOwnerComponent().getModel("gbHourBackupUsageBubbleCardDataModel").getJSON());
            that._apiCardData = JSON.parse(that.getOwnerComponent().getModel("apiUsageBubbleCardDataModel").getJSON());
            var monthlyUsageData = data.content;

            var neoServiceslist = [];
            var subaccountList = [];
            var subaccountServiceCountList = [];
            var usageTypes = [];
            var usageList = [];
            var gbHourList = [];
            var gbHourBackupList = [];
            var apiUsageList = [];

            for (var i = 0; i < monthlyUsageData.length; i++) {
                //Capture service counts
                if (monthlyUsageData[i].dataCenterName.indexOf('neo') >= 0) {
                    neoServiceslist.push(monthlyUsageData[i]);
                } else {
                    let index = subaccountList.indexOf(monthlyUsageData[i].subaccountId);
                    if (index >= 0) {
                        subaccountServiceCountList[index].serviceCount++;
                    } else {
                        subaccountList.push(monthlyUsageData[i].subaccountId);
                        subaccountServiceCountList.push({
                            "subaccountName": monthlyUsageData[i].subaccountName,
                            "serviceCount": 1,
                            "usage": 0
                        });
                    }
                }

                //Usage list
                let index = usageTypes.indexOf(monthlyUsageData[i].measureId);
                if (index >= 0) {
                    usageList[index].usageAmount = usageList[index].usageAmount + monthlyUsageData[i].usage;
                } else {
                    usageTypes.push(monthlyUsageData[i].measureId);
                    usageList.push({
                        "usageUnit": monthlyUsageData[i].unitPlural,
                        "usageAmount": 0
                    });
                }

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

                //API calls
                if (monthlyUsageData[i].measureId === 'api_calls') {
                    apiUsageList.push({
                        "subAccount": monthlyUsageData[i].subaccountName,
                        "service": monthlyUsageData[i].serviceName,
                        "usage": monthlyUsageData[i].usage
                    });
                }
            }

            var servicesCountData = {
                "d": subaccountServiceCountList
            };
            that._serviceCountCardData["sap.card"].content.data.json = servicesCountData;
            serviceCountCard.setManifest(that._serviceCountCardData);

            var servicesUsagetData = {
                "d": usageList
            };
            that._serviceUsageCardData["sap.card"].content.data.json = servicesUsagetData;
            serviceUsageCard.setManifest(that._serviceUsageCardData);

            // var gbHourData = {
            //     "d": gbHourList
            // };
            // that._gbHourCardData["sap.card"].content.data.json = gbHourData;
            // gbHourUsageCard.setManifest(that._gbHourCardData);

            // var gbHourBackupData = {
            //     "d": gbHourBackupList
            // };
            // that._gbHourBackupCardData["sap.card"].content.data.json = gbHourBackupData;
            // gbHourBackupUsageCard.setManifest(that._gbHourBackupCardData);

            // var apiData = {
            //     "d": apiUsageList
            // };
            // that._apiCardData["sap.card"].content.data.json = apiData;
            // apiUsageCard.setManifest(that._apiCardData);
        }
    });
});