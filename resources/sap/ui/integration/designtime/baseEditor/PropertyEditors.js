/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/integration/designtime/baseEditor/PropertyEditor","sap/ui/integration/designtime/baseEditor/util/findClosestInstance","sap/ui/integration/designtime/baseEditor/util/createPromise","sap/base/util/restricted/_intersection","sap/base/util/restricted/_omit"],function(C,P,f,c,_,a){"use strict";var b="config";var d="tags";var S="created";var e="syncing";var g="ready";var h=C.extend("sap.ui.integration.designtime.baseEditor.PropertyEditors",{metadata:{properties:{tags:{type:"string"},renderLabels:{type:"boolean"},config:{type:"array"}},aggregations:{propertyEditors:{type:"sap.ui.integration.designtime.baseEditor.PropertyEditor",visibility:"hidden"}},associations:{editor:{type:"sap.ui.integration.designtime.baseEditor.BaseEditor",multiple:false}},events:{editorChange:{parameters:{previousEditor:{type:"sap.ui.integration.designtime.baseEditor.BaseEditor"},editor:{type:"sap.ui.integration.designtime.baseEditor.BaseEditor"}}},propertyEditorsChange:{parameters:{previousPropertyEditors:{type:"sap.ui.integration.designtime.baseEditor.PropertyEditor"},propertyEditors:{type:"sap.ui.integration.designtime.baseEditor.PropertyEditor"}}},init:{},configChange:{parameters:{previousConfig:{type:"array"},config:{type:"array"}}},tagsChange:{parameters:{previousTags:{type:"string"},tags:{type:"string"}}},ready:{}}},_bEditorAutoDetect:false,_sCreatedBy:null,_sState:S,constructor:function(){C.prototype.constructor.apply(this,arguments);if(!this.getEditor()){this._bEditorAutoDetect=true;}this._propagationListener=this._propagationListener.bind(this);this.attachEditorChange(function(){if(this._sCreatedBy){this._removePropertyEditors();}this._initPropertyEditors();});this.attachConfigChange(function(E){var p=E.getParameter("previousConfig");var i=E.getParameter("config");if(this._fnCancelInit||this._sCreatedBy===d||!Array.isArray(p)||!Array.isArray(i)||p.length!==i.length||p.some(function(o,I){return o.type!==i[I].type;})){this._removePropertyEditors();this._initPropertyEditors();}else if(this._sCreatedBy){var j=this.getAggregation("propertyEditors");if(j&&j.length>0){i.forEach(function(m,I){j[I].setConfig(a(m,"value"));if(!m.path.startsWith("/")){j[I].setValue(m.value);}});}}});this.attachTagsChange(function(){if(this._sCreatedBy===d){this._removePropertyEditors();}if(this._sCreatedBy!==b){this._initPropertyEditors();}});this._initPropertyEditors();},renderer:function(r,o){var p=o.getAggregation("propertyEditors");r.openStart("div",o);r.openEnd();if(Array.isArray(p)){p.forEach(function(i){r.renderControl(i);});}r.close("div");}});h.prototype.init=function(){Promise.resolve().then(function(){this.fireInit();}.bind(this));};h.prototype.getEditor=function(){return sap.ui.getCore().byId(this.getAssociation("editor"));};h.prototype.setConfig=function(m){var p=this.getConfig();if(p!==m&&(!Array.isArray(p)||!Array.isArray(m)||JSON.stringify(p)!==JSON.stringify(m))){this.setProperty("config",m);this.fireConfigChange({previousConfig:p,config:m});}};h.prototype.setTags=function(t){var p=this.getTags();var r=t;if(typeof t==="string"){r=t.split(",").sort().join(",");}if(p!==r){this.setProperty("tags",r);this.fireTagsChange({previousTags:p,tags:r});}};h.prototype.setEditor=function(E){var p=this.getEditor();var o=typeof E==="string"?sap.ui.getCore().byId(E):E;if(p!==o){this.setAssociation("editor",E);var o=this.getEditor();this.fireEditorChange({previousEditor:p,editor:o});}};h.prototype._removePropertyEditors=function(){var p=this.removeAllAggregation("propertyEditors");if(p.length){p.forEach(function(o){o.destroy();});this._sCreatedBy=null;this.firePropertyEditorsChange({previousPropertyEditors:p,propertyEditors:[]});}};h.prototype.isReady=function(){return(this._sState===g&&(this.getAggregation("propertyEditors")||[]).every(function(n){return n.isReady();}));};h.prototype._onPropertyEditorReady=function(){if(this.isReady()){this.fireReady();}};h.prototype.ready=function(){return new Promise(function(r){var i=function(){Promise.all((this.getAggregation("propertyEditors")||[]).map(function(p){return p.ready();})).then(function(){r();});}.bind(this);if(this._sState!==g){this.attachEventOnce("propertyEditorsChange",function(){i();});}else{i();}}.bind(this));};h.prototype._initPropertyEditors=function(){if(this.getEditor()&&(this.getConfig()||(!this.getBindingInfo("config")&&this.getTags()))){this._sState=e;var E=this.getEditor();var i;if(this.getConfig()){i=this.getConfig();this._sCreatedBy=b;}else{var t=this.getTags().split(",");i=E.getConfigsByTag(t);this._sCreatedBy=d;}var r=this.getRenderLabels();var p=i.map(function(m){var o=new P({editor:E});if(r!==undefined){o.setRenderLabel(r);}o.setValue(m.value);o.setConfig(a(m,"value"));o.attachReady(this._onPropertyEditorReady,this);return o;},this);var j=(this.getAggregation("propertyEditors")||[]).slice();p.forEach(function(o){this.addAggregation("propertyEditors",o);},this);this._sState=g;if(this.isReady()){this.fireReady();}this.firePropertyEditorsChange({previousPropertyEditors:j,propertyEditors:(this.getAggregation("propertyEditors")||[]).slice()});}};h.prototype._propagationListener=function(){var E=f(this.getParent(),"sap.ui.integration.designtime.baseEditor.BaseEditor");if(E){this.setEditor(E);this.removePropagationListener(this._propagationListener);}};h.prototype.setParent=function(p){C.prototype.setParent.apply(this,arguments);if(this._bEditorAutoDetect){var E=f(p,"sap.ui.integration.designtime.baseEditor.BaseEditor");if(E){this.setEditor(E);}else{this.addPropagationListener(this._propagationListener);}}};return h;});
