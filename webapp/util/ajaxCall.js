sap.ui.define([], function() {
    "use strict";

    return {
        makeAjaxReadCall: function (sUrl, successFunc, errorFunc, viewObj) {        
            $.support.cors = true;
            $.ajax(sUrl, {
                method: "GET",
                crossDomain: true,
                contentType: "application/scim+json"
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
});