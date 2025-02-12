/*global QUnit*/

sap.ui.define([
	"comhclbtp/governance.cockpit/controller/PlatformDashboard.controller"
], function (Controller) {
	"use strict";

	QUnit.module("PlatformDashboard Controller");

	QUnit.test("I should test the PlatformDashboard controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
