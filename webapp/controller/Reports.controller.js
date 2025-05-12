sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/hcl/btp/governance/cockpit/util/ajaxCall",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, ajaxCall, MessageToast, Fragment) => {
    "use strict";

    return Controller.extend("com.hcl.btp.governance.cockpit.controller.Reports", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteReports").attachMatched(this._onRouteMatched, this);

            if (!this._oRouter) {
                this._oRouter = oRouter;
            }
        },

        /**
         * 
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {
            var subaccountsCostcard = this.getView().byId("cardMonthlySubaccountCost");
            subaccountsCostcard.attachAction(this.onCardAction.bind(this));

            var monthlyUsagecard = this.getView().byId("cardMonthlySubaccountUsage");
            monthlyUsagecard.attachAction(this.onCardAction.bind(this));

            this.readReportsMonthlySubaccountsCost();
            this.readReportsMonthlyUsage();
            this.readSubAccounts();
            this.readEntitlements();

            var subAccountsTableCard = this.getView().byId("cardTableSubAccounts");
            subAccountsTableCard.attachAction(this.onCardAction.bind(this));

            var entitlementTablecard = this.getView().byId("cardTableEntitlement");
            entitlementTablecard.attachAction(this.onCardAction.bind(this));
        },

        readReportsMonthlySubaccountsCost: function () {
            var that = this;

            var currentDate = new Date();
            var currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            var previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            var twoMonthsAgoDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);

            var currentMonth = currentMonthDate.getFullYear().toString() + (currentMonthDate.getMonth() + 1).toString().padStart(2, '0');
            var previousMonth = previousMonthDate.getFullYear().toString() + (previousMonthDate.getMonth() + 1).toString().padStart(2, '0');
            var twoMonthsAgo = twoMonthsAgoDate.getFullYear().toString() + (twoMonthsAgoDate.getMonth() + 1).toString().padStart(2, '0');

            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var currentMonthUrl = prefix + "reports/v1/monthlySubaccountsCost?fromDate=" + previousMonth + "&toDate=" + currentMonth;
            var previousMonthUrl = prefix + "reports/v1/monthlySubaccountsCost?fromDate=" + twoMonthsAgo + "&toDate=" + previousMonth;

            var monthlySubaccountsCostCard = that.getView().byId("cardMonthlySubaccountCost");
            var monthlySubaccountsCostModel = that.getOwnerComponent().getModel("MonthlySubaccountsCostCardModel");
            that._monthlySubaccountsCostModel = JSON.parse(monthlySubaccountsCostModel.getJSON());

            $.when(
                $.ajax({ url: currentMonthUrl, type: 'GET', contentType: "application/json" }),
                $.ajax({ url: previousMonthUrl, type: 'GET', contentType: "application/json" })
            ).then(function (currentMonthData, previousMonthData) {
                var currentMonthSubaccounts = currentMonthData[0].content;
                var previousMonthSubaccounts = previousMonthData[0].content;
                var subaccountCosts = [];

                currentMonthSubaccounts.forEach(function (subaccount) {
                    var existingSubaccount = subaccountCosts.find(function (item) {
                        return item.subaccountName === subaccount.subaccountName;
                    });
                    var currentCost = Array.isArray(subaccount.cost) ? subaccount.cost : [subaccount.cost || 0];
                    var currentTotalCost = currentCost.reduce((a, b) => a + b, 0);

                    if (existingSubaccount) {
                        var existingService = existingSubaccount.services.find(function (service) {
                            return service.serviceName === subaccount.serviceName;
                        });

                        if (existingService) {
                            existingService.currentMonthCost += currentTotalCost;
                        } else {
                            existingSubaccount.services.push({
                                serviceName: subaccount.serviceName || "Unknown",
                                currentMonthCost: currentTotalCost,
                                previousMonthCost: 0
                            });
                        }
                        existingSubaccount.currentMonthTotalCost += currentTotalCost;
                    } else {
                        subaccountCosts.push({
                            subaccountName: subaccount.subaccountName || "Unknown",
                            services: [{
                                serviceName: subaccount.serviceName || "Unknown",
                                currentMonthCost: currentTotalCost,
                                previousMonthCost: 0
                            }],
                            currentMonthTotalCost: currentTotalCost,
                            previousMonthTotalCost: 0,
                            currency: subaccount.currency || "N/A",
                            region: subaccount.dataCenter || "N/A"
                        });
                    }
                });

                previousMonthSubaccounts.forEach(function (subaccount) {
                    var existingSubaccount = subaccountCosts.find(function (item) {
                        return item.subaccountName === subaccount.subaccountName;
                    });
                    var previousCost = Array.isArray(subaccount.cost) ? subaccount.cost : [subaccount.cost || 0];
                    var previousTotalCost = previousCost.reduce((a, b) => a + b, 0);

                    if (existingSubaccount) {
                        var existingService = existingSubaccount.services.find(function (service) {
                            return service.serviceName === subaccount.serviceName;
                        });

                        if (existingService) {
                            existingService.previousMonthCost += previousTotalCost;
                        } else {
                            existingSubaccount.services.push({
                                serviceName: subaccount.serviceName || "Unknown",
                                currentMonthCost: 0,
                                previousMonthCost: previousTotalCost
                            });
                        }

                        existingSubaccount.previousMonthTotalCost += previousTotalCost;
                    } else {
                        subaccountCosts.push({
                            subaccountName: subaccount.subaccountName || "Unknown",
                            services: [{
                                serviceName: subaccount.serviceName || "Unknown",
                                currentMonthCost: 0,
                                previousMonthCost: previousTotalCost
                            }],
                            currentMonthTotalCost: 0,
                            previousMonthTotalCost: previousTotalCost,
                            currency: subaccount.currency || "N/A",
                            region: subaccount.dataCenter || "N/A"
                        });
                    }
                });


                subaccountCosts.forEach(function (subaccount) {
                    subaccount.currentMonthTotalCost = parseFloat(subaccount.currentMonthTotalCost.toFixed(2));
                    subaccount.previousMonthTotalCost = parseFloat(subaccount.previousMonthTotalCost.toFixed(2));

                    subaccount.services.forEach(function (service) {
                        service.currentMonthCost = parseFloat(service.currentMonthCost.toFixed(2));
                        service.previousMonthCost = parseFloat(service.previousMonthCost.toFixed(2));
                    });
                });

                console.log("cost", subaccountCosts);
                that.getView().setModel(new sap.ui.model.json.JSONModel({ subaccountCost: subaccountCosts }), "monthlySubaccountCostModel");
                that._monthlySubaccountsCostModel["sap.card"].data.json = subaccountCosts;
                monthlySubaccountsCostCard.setManifest(that._monthlySubaccountsCostModel);

            }, function (e) {
                console.log("error: " + e);
            });
        },

        readReportsMonthlyUsage: function () {
            var that = this;

            var currentDate = new Date();
            var currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            var previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            var twoMonthsAgoDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);

            var currentMonth = currentMonthDate.getFullYear().toString() + (currentMonthDate.getMonth() + 1).toString().padStart(2, '0');
            var previousMonth = previousMonthDate.getFullYear().toString() + (previousMonthDate.getMonth() + 1).toString().padStart(2, '0');
            var twoMonthsAgo = twoMonthsAgoDate.getFullYear().toString() + (twoMonthsAgoDate.getMonth() + 1).toString().padStart(2, '0');

            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var currentMonthUrl = prefix + "reports/v1/monthlyUsage?fromDate=" + previousMonth + "&toDate=" + currentMonth;
            var previousMonthUrl = prefix + "reports/v1/monthlyUsage?fromDate=" + twoMonthsAgo + "&toDate=" + previousMonth;

            var monthlyUsageCard = that.getView().byId("cardMonthlySubaccountUsage");
            var monthlyUsageModel = that.getOwnerComponent().getModel("MonthlyUsageCardDataCardModel");
            that._monthlyUsageModel = JSON.parse(monthlyUsageModel.getJSON());

            $.when(
                $.ajax({ url: currentMonthUrl, type: 'GET', contentType: "application/json" }),
                $.ajax({ url: previousMonthUrl, type: 'GET', contentType: "application/json" })
            ).then(function (currentMonthData, previousMonthData) {
                var currentMonthSubaccounts = currentMonthData[0].content;
                var previousMonthSubaccounts = previousMonthData[0].content;
                var subaccountUsage = [];

                //current month
                currentMonthSubaccounts.forEach(function (subaccount) {
                    var existingSubaccount = subaccountUsage.find(function (item) {
                        return item.subaccountName === subaccount.subaccountName;
                    });
                    var currentUsage = Array.isArray(subaccount.usage) ? subaccount.usage : [subaccount.usage || 0];
                    var currentTotalUsage = currentUsage.reduce((a, b) => a + b, 0);

                    if (existingSubaccount) {
                        var existingService = existingSubaccount.services.find(function (service) {
                            return service.serviceName === subaccount.serviceName;
                        });

                        if (existingService) {
                            existingService.currentMonthUsage += currentTotalUsage;
                        } else {
                            existingSubaccount.services.push({
                                serviceName: subaccount.serviceName || "Unknown",
                                currentMonthUsage: currentTotalUsage,
                                previousMonthUsage: 0
                            });
                        }
                        existingSubaccount.currentMonthTotalUsage += currentTotalUsage;
                    } else {
                        subaccountUsage.push({
                            subaccountName: subaccount.subaccountName || "Unknown",
                            services: [{
                                serviceName: subaccount.serviceName || "Unknown",
                                currentMonthUsage: currentTotalUsage,
                                previousMonthUsage: 0
                            }],
                            currentMonthTotalUsage: currentTotalUsage,
                            previousMonthTotalUsage: 0,
                            region: subaccount.dataCenterName || "N/A"
                        });
                    }
                });

                // previous month
                previousMonthSubaccounts.forEach(function (subaccount) {
                    var existingSubaccount = subaccountUsage.find(function (item) {
                        return item.subaccountName === subaccount.subaccountName;
                    });
                    var previousUsage = Array.isArray(subaccount.usage) ? subaccount.usage : [subaccount.usage || 0];
                    var previousTotalUsage = previousUsage.reduce((a, b) => a + b, 0);

                    if (existingSubaccount) {
                        var existingService = existingSubaccount.services.find(function (service) {
                            return service.serviceName === subaccount.serviceName;
                        });

                        if (existingService) {
                            existingService.previousMonthUsage += previousTotalUsage;
                        } else {
                            existingSubaccount.services.push({
                                serviceName: subaccount.serviceName || "Unknown",
                                currentMonthUsage: 0,
                                previousMonthUsage: previousTotalUsage
                            });
                        }
                        existingSubaccount.previousMonthTotalUsage += previousTotalUsage;
                    } else {
                        subaccountUsage.push({
                            subaccountName: subaccount.subaccountName || "Unknown",
                            services: [{
                                serviceName: subaccount.serviceName || "Unknown",
                                currentMonthUsage: 0,
                                previousMonthUsage: previousTotalUsage
                            }],
                            currentMonthTotalUsage: 0,
                            previousMonthTotalUsage: previousTotalUsage,
                            region: subaccount.dataCenterName || "N/A"
                        });
                    }
                });

                subaccountUsage.forEach(function (subaccount) {
                    subaccount.currentMonthTotalUsage = parseFloat(subaccount.currentMonthTotalUsage.toFixed(2));
                    subaccount.previousMonthTotalUsage = parseFloat(subaccount.previousMonthTotalUsage.toFixed(2));

                    subaccount.services.forEach(function (service) {
                        service.currentMonthUsage = parseFloat(service.currentMonthUsage.toFixed(2));
                        service.previousMonthUsage = parseFloat(service.previousMonthUsage.toFixed(2));
                    });
                });
                console.log("usage", subaccountUsage);

                that.getView().setModel(new sap.ui.model.json.JSONModel({ subaccountUsage: subaccountUsage }), "monthlyUsageModel");
                that._monthlyUsageModel["sap.card"].data.json = subaccountUsage;
                monthlyUsageCard.setManifest(that._monthlyUsageModel);

            }, function (e) {
                console.log("error: " + e);
            });
        },

        onCardAction: function (oEvent) {
            var oParameters = oEvent.getParameter("parameters");

            switch (oParameters.action) {
                case "SubaccountsCostAction":
                    this.openSubaccountCostDialog();
                    break;
                case "MonthlyUsageAction":
                    this.openMonthlyUsageDialog();
                    break;
                case "subAccountAction":
                    this.openSubAccountDialog();
                    break;
                case "entitlementAction":
                    this.openEntitlementDialog();
                    break;
                default:
                    console.log("Unknown action:", oParameters.action);
            }
        },

        openSubaccountCostDialog: function () {
            var oView = this.getView();
            if (!this._oSubaccountCostDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.hcl.btp.governance.cockpit.fragment.Report-SubaccountsCostTable",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oSubaccountCostDialog = oDialog;
                    oDialog.open();
                }.bind(this));
            } else {
                this._oSubaccountCostDialog.open();
            }
        },

        closeSubaccountCostDialog: function () {
            if (this._oSubaccountCostDialog) {
                this._oSubaccountCostDialog.close();
            }
        },

        openMonthlyUsageDialog: function () {
            var oView = this.getView();
            if (!this._oMonthlyUsageDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.hcl.btp.governance.cockpit.fragment.Report-MonthlyUsageTable",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oMonthlyUsageDialog = oDialog;
                    oDialog.open();
                }.bind(this));
            } else {
                this._oMonthlyUsageDialog.open();
            }
        },

        closeMonthlyUsageDialog: function () {
            if (this._oMonthlyUsageDialog) {
                this._oMonthlyUsageDialog.close();
            }
        },

        formatIconSrc: function (currentMonthTotalCost, previousMonthTotalCost) {
            if (currentMonthTotalCost > previousMonthTotalCost) {
                return 'sap-icon://arrow-top';
            } else if (currentMonthTotalCost < previousMonthTotalCost) {
                return 'sap-icon://arrow-bottom';
            } else {
                return 'sap-icon://status-inactive';
            }
        },

        formatIconColor: function (currentMonthTotalCost, previousMonthTotalCost) {
            if (currentMonthTotalCost > previousMonthTotalCost) {
                return 'green';
            } else if (currentMonthTotalCost < previousMonthTotalCost) {
                return 'red';
            } else {
                return 'gray';
            }
        },

        formatUsageIconSrc: function (currentMonthTotalUsage, previousMonthTotalUsage) {
            if (currentMonthTotalUsage > previousMonthTotalUsage) {
                return 'sap-icon://arrow-top';
            } else if (currentMonthTotalUsage < previousMonthTotalUsage) {
                return 'sap-icon://arrow-bottom';
            } else {
                return 'sap-icon://status-inactive';
            }
        },

        formatUsageIconColor: function (currentMonthTotalUsage, previousMonthTotalUsage) {
            if (currentMonthTotalUsage > previousMonthTotalUsage) {
                return 'green';
            } else if (currentMonthTotalUsage < previousMonthTotalUsage) {
                return 'red';
            } else {
                return 'gray';
            }
        },

        readSubAccounts: function () {
            var that = this
            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var sUrl = prefix + "accounts/v1/subaccounts";

            var subAccountsTableCard = that.getView().byId("cardTableSubAccounts");
            var subAccountsTableModel = that.getOwnerComponent().getModel("subAccountsTableCardModel");
            that._subAccountsTableModel = JSON.parse(subAccountsTableModel.getJSON());

            $.ajax({
                url: sUrl,
                type: 'GET',
                contentType: "application/json",
                success: function (data) {
                    var formattedSubAccountData = [];
                    for (var i = 0; i < data.value.length; i++) {
                        var subAccount = {
                            "displayName": data.value[i].displayName,
                            "region": data.value[i].region?.toUpperCase() || "N/A",
                            "createdBy": data.value[i].createdBy?.toLowerCase() || "Unknown",
                            "createdDate": sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MMM-yyyy" }).format(new Date(data.value[i].createdDate)) || "N/A"
                        };
                        formattedSubAccountData.push(subAccount);
                    }
                    that.getView().setModel(new sap.ui.model.json.JSONModel({ subaccounts: formattedSubAccountData }), "subaccountsModel");
                    that._subAccountsTableModel["sap.card"].data.json = formattedSubAccountData;
                    subAccountsTableCard.setManifest(that._subAccountsTableModel);

                },
                error: function (e) {
                    console.log("error: " + e);
                }
            });
        },

        openSubAccountDialog: function () {
            var oView = this.getView();
            if (!this._oSubAccountDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.hcl.btp.governance.cockpit.fragment.subAccountsTable",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oSubAccountDialog = oDialog;
                    oDialog.open();
                }.bind(this));
            } else {
                this._oSubAccountDialog.open();
            }
        },
 
        closeSubAccountDialog: function () {
            this._oSubAccountDialog.close();
        },

        readEntitlements: function () {
            var that = this;
            var prefix = sap.ui.require.toUrl(this.getOwnerComponent().getManifestEntry('/sap.app/id').replaceAll('.', '/')) + "/";
            var sUrl = prefix + "entitlements/v1/assignments";
 
            var entitlementTablecard = that.getView().byId("cardTableEntitlement");
            var entitlementTableModel = that.getOwnerComponent().getModel("entitlementTableCardModel");
            that._entitlementTableModel = JSON.parse(entitlementTableModel.getJSON());
 
            $.ajax({
                url: sUrl,
                type: 'GET',
                contentType: "application/json",
                success: function (data) {
                    //console.log("success", data);
 
                    var formattedEntitlementData = [];
                    var entitledServices = data.entitledServices;
 
                    for (var i = 0; i < entitledServices.length; i++) {
                        var entitlement = {
                            "displayName": entitledServices[i].displayName,
                            "category": entitledServices[i].businessCategory.displayName || "N/A",
                            "plan": entitledServices[i].servicePlans[0]?.sourceEntitlements ? entitledServices[i].servicePlans[0].sourceEntitlements[0].commercialModel?.displayName : "Not available",
                            "quota": entitledServices[i].servicePlans[0]?.amount || "N/A"
                        };
                        formattedEntitlementData.push(entitlement);
                    }
                    that.getView().setModel(new sap.ui.model.json.JSONModel({ entitlements: formattedEntitlementData }), "entitlementModel");
                    that._entitlementTableModel["sap.card"].data.json = formattedEntitlementData;
                    entitlementTablecard.setManifest(that._entitlementTableModel);
 
                },
                error: function (e) {
                    console.log("error: " + e);
 
                }
            });
        },

        openEntitlementDialog: function () {
            var oView = this.getView();
            if (!this._oEntitlementDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.hcl.btp.governance.cockpit.fragment.EntitlementTable",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oEntitlementDialog = oDialog;
                    oDialog.open();
                }.bind(this));
            } else {
                this._oEntitlementDialog.open();
            }
        },
 
        closeEntitlementDialog: function () {
            this._oEntitlementDialog.close();
        }
    });
});