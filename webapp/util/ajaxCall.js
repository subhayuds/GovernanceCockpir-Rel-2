// =========================Api Call Data operation ==============================
// *****************Author: Swarup Paul************************
// *****************Created Date: 20-02-2024*******************
// ========================================================================================
jQuery.sap.declare('com.hcl.governancecockpit.util.ajaxCall');

com.hcl.governancecockpit.util.ajaxCall = {

	makeAjaxReadCall: function (sUrl, successFunc, errorFunc, viewObj) {        
        $.support.cors = true;
        $.ajax(sUrl, {
            method: "GET",
            crossDomain: true,
            contentType: "application/json"
        }).done(function (data, textStatus, jqXHR) {            
            successFunc(data, viewObj);            
        }).fail(function (XMLHttpRequest, textStatus) {
            errorFunc(textStatus, viewObj);
        });
		
	},	
	getViewController: function (view) {
		return sap.ui.getCore().byId(view).oController;
	},
	getControl: function (controlId, viewId) {
		return sap.ui.getCore().byId(viewId).byId(controlId);
	}
};