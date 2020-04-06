sap.ui.require([
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/model/BindingMode",
    "sap/ui/model/resource/ResourceModel"
], function (JSONModel, XMLView, BindingMode, ResourceModel) {
	"use strict";

	// Attach an anonymous function to the SAPUI5 'init' event
	sap.ui.getCore().attachInit(function () {
		// Create a JSON model from an object literal
		var oModel = new JSONModel({
			firstName: "Harry",
			lastName: "Hawk",
			enabled: true
        });
        
        var oModelAuthor = new JSONModel({
			firstName: "Miguel",
			lastName: "Patiño"
        });
        
        oModelAuthor.setDefaultBindingMode(BindingMode.OneWay);

		// Assign the model object to the SAPUI5 core
		sap.ui.getCore().setModel(oModel);
        sap.ui.getCore().setModel(oModelAuthor,'author');
        
		// Create a resource bundle for language specific texts
		var oResourceModel = new ResourceModel({
			bundleName: "sap.ui.demo.db.i18n.i18n"
		});

		// Assign the model object to the SAPUI5 core using the name "i18n"
		sap.ui.getCore().setModel(oResourceModel, "i18n");

		// Display the XML view called "App"
		new XMLView({
			viewName: "sap.ui.demo.db.view.App"
		}).placeAt("content");
	});
});