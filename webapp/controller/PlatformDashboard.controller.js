sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/hcl/btp/governance/cockpit/util/ajaxCall",
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

            this.loadResourceMonthlyUsage();
            this.loadUsers();
            this.loadDestinatinDetails();
        },

        /**
         * 
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {

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

            // var serviceCountCard = that.getView().byId("resourceMonthlyCount");
            var lastMonthServiceUsageCard = that.getView().byId("lastMonthResourceUsage");
            var subaccountServiceCountBarCard = that.getView().byId("subaccountServicesCount");

            that._subaccountServicesCountBarCardData = JSON.parse(that.getOwnerComponent().getModel("subaccountServicesCountCardDataModel").getJSON());
            that._lastMonthServiceUsageCardData = JSON.parse(that.getOwnerComponent().getModel("subAccountUsageCardDataModel").getJSON());
            var monthlyUsageData = data.content;

            var neoServiceslist = [];
            var subaccountList = [];
            var subaccountServiceCountList = [];
            var usageTypes = [];
            var usageList = [];

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
                        "usageMetricName": monthlyUsageData[i].metricName,
                        "usageUnit": monthlyUsageData[i].unitPlural,
                        "usageAmount": 0
                    });
                }
            }

            //Sort the array
            subaccountServiceCountList.sort((a, b) => (a.serviceCount > b.serviceCount ? 1 : -1));
            subaccountServiceCountList.reverse();
            usageList.sort((a, b) => (a.usageAmount > b.usageAmount ? 1 : -1));
            usageList.reverse();

            //Reduce the array to top 10
            subaccountServiceCountList.splice(5);
            usageList.splice(5);

            that._subaccountServicesCountBarCardData["sap.card"].content.data.json = subaccountServiceCountList;
            subaccountServiceCountBarCard.setManifest(that._subaccountServicesCountBarCardData);

            that._lastMonthServiceUsageCardData["sap.card"].content.data.json = usageList;
            lastMonthServiceUsageCard.setManifest(that._lastMonthServiceUsageCardData);
        },

        /**
         * Get Users
         */
        loadUsers: function () {
            var that = this;
            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var sUrl = prefix + "scim/Users";

            ajaxCall.makeAjaxReadCall(sUrl, that.getView().getController().getUsersSuccessCallBack,
                that.getView().getController().errorCallBack, that);
        },

        getUsersSuccessCallBack: function (data, that) {
            var usersModel = new JSONModel(data);
            that.getOwnerComponent().setModel(usersModel, "usersModel");

            var cardUserLogon = that.getView().byId("userLogon");
            var userLogonCardModel = that.getOwnerComponent().getModel("userLogonColumnCardDataModel");
            that._userLogonModel = JSON.parse(userLogonCardModel.getJSON());

            var cardUserStatus = that.getView().byId("userStatus");
            var userStatusCardModel = that.getOwnerComponent().getModel("userStatusDonutCardDataModel");
            that._userStatusModel = JSON.parse(userStatusCardModel.getJSON());

            var cardUserType = that.getView().byId("userTypes");
            var userTypeCardModel = that.getOwnerComponent().getModel("userTypeColumnCardDataModel");
            that._userTypeModel = JSON.parse(userTypeCardModel.getJSON());

            var users = data.Resources;
            var totalUsers = data.totalResults;
            var arrData = [];
            var ninetyDays = 0, sixtyDays = 0, thirtyDays = 0, fifteenDays = 0, sevenDays = 0, recent = 0, activeUsers = 0, inactiveUsers = 0;

            var userTypes = [], arrUserTypesDetails = [];

            if (totalUsers > 0) {
                for (let i = 0; i < users.length; i++) {
                    if (users[i].active) {
                        activeUsers++;
                    } else {
                        inactiveUsers++;
                    }

                    var userLastLoginTime = ((users[i])["urn:ietf:params:scim:schemas:extension:sap:2.0:User"]).loginTime;
                    var daysBefore = moment().diff(userLastLoginTime, 'days');

                    if (daysBefore > 90) {
                        ninetyDays++;
                    } else if (daysBefore > 60) {
                        sixtyDays++;
                    } else if (daysBefore > 30) {
                        thirtyDays++;
                    } else if (daysBefore > 15) {
                        fifteenDays++;
                    } else if (daysBefore > 7) {
                        sevenDays++;
                    } else {
                        recent++;
                    }
                    
                    //User types
                    let index = userTypes.indexOf(users[i].userType);
                    if (index >= 0) {
                        arrUserTypesDetails[index].userCount++;
                    } else {
                        userTypes.push(users[i].userType);
                        arrUserTypesDetails.push({
                            "userType": users[i].userType,
                            "userCount": 0
                        });
                    }
                }

                //Users logon statistics
                var arrData = [
                    {
                        "lastLogin": "Within last 7 days",
                        "days": 7,
                        "users": recent
                    },
                    {
                        "lastLogin": "Within last 15 days",
                        "days": 15,
                        "users": sevenDays
                    },
                    {
                        "lastLogin": "Before 15 days",
                        "days": 30,
                        "users": fifteenDays
                    },
                    {
                        "lastLogin": "Before 30 days",
                        "days": 60,
                        "users": thirtyDays
                    },
                    {
                        "lastLogin": "Before 60 days",
                        "days": 90,
                        "users": sixtyDays
                    },
                    {
                        "lastLogin": "Before 90 days",
                        "days": 95,
                        "users": ninetyDays
                    }
                ];

                that._userLogonModel["sap.card"].content.data.json.d = arrData;

                //Active users data
                var arrUserStatus = [
                    {
                        "status": "Active",
                        "users": activeUsers
                    },
                    {
                        "status": "Inactive",
                        "users": inactiveUsers
                    }
                ];

                that._userStatusModel["sap.card"].content.data.json.userStatus = arrUserStatus;
            }
            cardUserLogon.setManifest(that._userLogonModel);
            cardUserStatus.setManifest(that._userStatusModel);
            
            that._userTypeModel["sap.card"].content.data.json = arrUserTypesDetails;
            cardUserType.setManifest(that._userTypeModel);
        },

        loadDestinatinDetails: function() {
            var that = this;
            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var sUrl = prefix + "destination-configuration/v1/subaccountDestinations";

            ajaxCall.makeAjaxReadCall(sUrl, that.getView().getController().getDestinationSuccessCallBack, that.getView().getController().errorCallBack, that);
        },

        getDestinationSuccessCallBack: function (data, that) {
            var aggregatedCounts = {};
            var proxyTypes = new Set();
            var authnProxyTypeCard = that.getView().byId("cardDestinationAuthProxy");
            var authenProxyTypeModel = that.getOwnerComponent().getModel("destinationBarCardDataModel");
            that._destinationBarChartData = JSON.parse(authenProxyTypeModel.getJSON());

            data.forEach(function (item) {
                var auth = item.Authentication;
                var proxy = item.ProxyType;
                proxyTypes.add(proxy);
                if (!aggregatedCounts[auth]) {
                    aggregatedCounts[auth] = {};
                }
                aggregatedCounts[auth][proxy] = (aggregatedCounts[auth][proxy] || 0) + 1;
            });

            var chartData = [];
            for (var auth in aggregatedCounts) {
                var entry = { Authentication: auth };

                proxyTypes.forEach(function (proxy) {
                    entry[proxy] = aggregatedCounts[auth][proxy] || 0;
                });

                chartData.push(entry);
            }

            that._destinationBarChartData["sap.card"].content.data.json.list = chartData;
            authnProxyTypeCard.setManifest(that._destinationBarChartData);

            console.log("Chart Data:", chartData);
        }
    });
});