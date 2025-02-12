sap.ui.define([], function () {
    "use strict";
  
    return {
      /**
       * Rounds the number unit value to 2 digits
       * @public
       * @param {string} sValue the number string to be rounded
       * @returns {string} sValue with 2 digits rounded
       */
      formatDate: function (sValue) {
        if (sValue) {
          var formattedDate = moment(new Date(sValue)).format("DD-MMM-YYYY hh:mm:ss A");
          return formattedDate;
        } else {
          return "Not applicable";
        }
      }
    };
  });