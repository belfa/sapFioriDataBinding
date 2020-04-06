/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/model/odata/ODataUtils","sap/ui/core/library","sap/ui/thirdparty/URI","sap/ui/core/message/MessageParser","sap/ui/core/message/Message","sap/base/Log","sap/ui/thirdparty/jquery"],function(O,c,U,M,a,L,q){"use strict";var b=c.MessageType;var s={"error":b.Error,"warning":b.Warning,"success":b.Success,"info":b.Information};var d=M.extend("sap.ui.model.odata.ODataMessageParser",{metadata:{publicMethods:["parse","setProcessor","getHeaderField","setHeaderField"]},constructor:function(S,m){M.apply(this);this._serviceUrl=e(this._parseUrl(S).url);this._metadata=m;this._processor=null;this._headerField="sap-message";this._lastMessages=[];}});d.prototype.getHeaderField=function(){return this._headerField;};d.prototype.setHeaderField=function(F){this._headerField=F;return this;};d.prototype.parse=function(r,R,G,C,m){var i=[];var j={url:R?R.requestUri:r.requestUri,request:R,response:r};if(r.statusCode>=200&&r.statusCode<300){this._parseHeader(i,r,j);}else if(r.statusCode>=400&&r.statusCode<600){this._parseBody(i,r,j);}else{L.warning("No rule to parse OData response with status "+r.statusCode+" for messages");}if(this._processor){this._propagateMessages(i,j,G,C,!m);}else{this._outputMesages(i);}};d.prototype._isNavigationProperty=function(p,P){var E=this._metadata._getEntityTypeByPath(p);if(E){var n=this._metadata._getNavigationPropertyNames(E);return n.indexOf(P)>-1;}return false;};d.prototype._getAffectedTargets=function(m,r,G,C){var A=q.extend({"":true},G,C);if(r.request&&r.request.key&&r.request.created){A[r.request.key]=true;}var R=this._parseUrl(r.url).url;if(R.indexOf(this._serviceUrl)===0){R=R.substr(this._serviceUrl.length+1);}var E=this._metadata._getEntitySetByPath(R);if(E){A[E.name]=true;}for(var i=0;i<m.length;++i){var t=m[i].getTarget();if(t){var T=t.replace(/^\/+|\/$/g,"");A[T]=true;var S=T.lastIndexOf("/");if(S>0){var p=T.substr(0,S);var P=T.substr(S);var I=this._isNavigationProperty(p,P);if(!I){A[p]=true;}}}}return A;};d.prototype._propagateMessages=function(m,r,G,C,S){var A,D=r.request.deepPath,k=[],p=D&&r.request.updateAggregatedMessages,t=r.request.headers&&r.request.headers["sap-messages"]==="transientOnly",R=[],i,j,n,T;function o(u,T){return A[T]||p&&u.fullTarget.startsWith(D);}if(t){k=this._lastMessages;i=m.some(function(u){return!u.getPersistent();});if(i){L.error("Unexpected non-persistent message in response, but requested only "+"transition messages",undefined,"sap.ui.model.odata.ODataMessageParser");}}else{A=this._getAffectedTargets(m,r,G,C);j=r.response.statusCode;n=(j>=200&&j<300);this._lastMessages.forEach(function(u){T=u.getTarget().replace(/^\/+|\/$/g,"");var P=T.lastIndexOf(")/");if(P>0){T=T.substr(0,P+1);}if(n||S){if(!u.getPersistent()&&o(u,T)){R.push(u);}else{k.push(u);}}else if(!u.getPersistent()&&u.getTechnical()&&o(u,T)){R.push(u);}else{k.push(u);}});}this.getProcessor().fireMessageChange({oldMessages:R,newMessages:m});this._lastMessages=k.concat(m);};d.prototype._createMessage=function(m,r,i){var t=m["@sap.severity"]?m["@sap.severity"]:m["severity"];t=s[t]?s[t]:t;var C=m.code?m.code:"";var T=typeof m["message"]==="object"&&m["message"]["value"]?m["message"]["value"]:m["message"];var D=m.longtext_url?m.longtext_url:"";var p=false;if(!m.target&&m.propertyref){m.target=m.propertyref;}if(typeof m.target==="undefined"){m.target="";}if(m.target.indexOf("/#TRANSIENT#")===0){p=true;m.target=m.target.substr(12);}else if(m.transient){p=true;}else if(m.transition){p=true;}this._createTarget(m,r);return new a({type:t,code:C,message:T,descriptionUrl:D,target:O._normalizeKey(m.canonicalTarget),processor:this._processor,technical:i,persistent:p,fullTarget:m.deepPath,technicalDetails:{statusCode:r.response.statusCode,headers:r.response.headers}});};d.prototype._getFunctionTarget=function(F,r,u){var t="";var i;if(r.response&&r.response.headers&&r.response.headers["location"]){t=r.response.headers["location"];var p=t.lastIndexOf(this._serviceUrl);if(p>-1){t=t.substr(p+this._serviceUrl.length);}}else{var A=null;if(F.extensions){for(i=0;i<F.extensions.length;++i){if(F.extensions[i].name==="action-for"){A=F.extensions[i].value;break;}}}var E;if(A){E=this._metadata._getEntityTypeByName(A);}else if(F.entitySet){E=this._metadata._getEntityTypeByPath(F.entitySet);}else if(F.returnType){E=this._metadata._getEntityTypeByName(F.returnType);}if(E){var m=this._metadata._getEntitySetByType(E);if(m&&E&&E.key&&E.key.propertyRef){var I="";var P;if(E.key.propertyRef.length===1){P=E.key.propertyRef[0].name;if(u.parameters[P]){I=u.parameters[P];}}else{var k=[];for(i=0;i<E.key.propertyRef.length;++i){P=E.key.propertyRef[i].name;if(u.parameters[P]){k.push(P+"="+u.parameters[P]);}}I=k.join(",");}t="/"+m.name+"("+I+")";}else if(!m){L.error("Could not determine path of EntitySet for function call: "+u.url);}else{L.error("Could not determine keys of EntityType for function call: "+u.url);}}}return t;};d.prototype._createTarget=function(m,r){var t=m.target;var D="";if(t[0]!=="/"){var R="";var j=(r.request&&r.request.method)?r.request.method:"GET";var k=(j==="POST"&&r.response&&r.response.statusCode==201&&r.response.headers&&r.response.headers["location"]);var u;if(k){u=r.response.headers["location"];}else if(r.request&&r.request.key&&r.request.created&&r.response&&r.response.statusCode>=400){u=r.request.key;}else{u=r.url;}var n=this._parseUrl(u);var o=n.url;var p=o.lastIndexOf(this._serviceUrl);if(p>-1){R=o.substr(p+this._serviceUrl.length);}else{R="/"+o;}if(!k){var F=this._metadata._getFunctionImportMetadata(R,j);if(F){R=this._getFunctionTarget(F,r,n);D=R;}}var S=R.lastIndexOf("/");var v=S>-1?R.substr(S):R;if(!D&&r.request&&r.request.deepPath){D=r.request.deepPath;}if(v.indexOf("(")>-1){t=t?R+"/"+t:R;D=m.target?D+"/"+m.target:D;}else if(this._metadata._isCollection(R)){t=R+t;D=D+m.target;}else{t=t?R+"/"+t:R;D=m.target?D+"/"+m.target:D;}}m.canonicalTarget=t;if(this._processor){var C=this._processor.resolve(t,undefined,true);var N=t.split(")").length-1;for(var i=2;i<N;i++){C=this._processor.resolve(C,undefined,true);}m.canonicalTarget=C||t;m.deepPath=this._metadata._getReducedPath(D||m.canonicalTarget);}};d.prototype._parseHeader=function(m,r,R){var F=this.getHeaderField();if(!r.headers){return;}for(var k in r.headers){if(k.toLowerCase()===F.toLowerCase()){F=k;}}if(!r.headers[F]){return;}var j=r.headers[F];var S=null;try{S=JSON.parse(j);m.push(this._createMessage(S,R));if(Array.isArray(S.details)){for(var i=0;i<S.details.length;++i){m.push(this._createMessage(S.details[i],R));}}}catch(n){L.error("The message string returned by the back-end could not be parsed: '"+n.message+"'");return;}};d.prototype._parseBody=function(m,r,R){var C=g(r);if(C&&C.indexOf("xml")>-1){this._parseBodyXML(m,r,R,C);}else{this._parseBodyJSON(m,r,R);}h(m);};d.prototype._parseBodyXML=function(j,r,R,C){try{var D=new DOMParser().parseFromString(r.body,C);var E=f(D,["error","errordetail"]);for(var i=0;i<E.length;++i){var N=E[i];var o={};o["severity"]=b.Error;for(var n=0;n<N.childNodes.length;++n){var k=N.childNodes[n];var p=k.nodeName;if(p==="errordetails"||p==="details"||p==="innererror"||p==="#text"){continue;}if(p==="message"&&k.hasChildNodes()&&k.firstChild.nodeType!==window.Node.TEXT_NODE){for(var m=0;m<k.childNodes.length;++m){if(k.childNodes[m].nodeName==="value"){o["message"]=k.childNodes[m].text||k.childNodes[m].textContent;}}}else{o[k.nodeName]=k.text||k.textContent;}}j.push(this._createMessage(o,R,true));}}catch(t){L.error("Error message returned by server could not be parsed");}};d.prototype._parseBodyJSON=function(m,r,R){try{var E=JSON.parse(r.body);var o;if(E["error"]){o=E["error"];}else{o=E["odata.error"];}if(!o){L.error("Error message returned by server did not contain error-field");return;}o["severity"]=b.Error;m.push(this._createMessage(o,R,true));var F=null;if(Array.isArray(o.details)){F=o.details;}else if(o.innererror&&Array.isArray(o.innererror.errordetails)){F=o.innererror.errordetails;}else{F=[];}for(var i=0;i<F.length;++i){m.push(this._createMessage(F[i],R,true));}}catch(j){L.error("Error message returned by server could not be parsed");}};d.prototype._parseUrl=function(u){var m={url:u,parameters:{},hash:""};var p=-1;p=u.indexOf("#");if(p>-1){m.hash=m.url.substr(p+1);m.url=m.url.substr(0,p);}p=u.indexOf("?");if(p>-1){var P=m.url.substr(p+1);m.parameters=U.parseQuery(P);m.url=m.url.substr(0,p);}return m;};d.prototype._outputMesages=function(m){for(var i=0;i<m.length;++i){var o=m[i];var j="[OData Message] "+o.getMessage()+" - "+o.getDescription()+" ("+o.getTarget()+")";switch(m[i].getType()){case b.Error:L.error(j);break;case b.Warning:L.warning(j);break;case b.Success:L.debug(j);break;case b.Information:case b.None:default:L.info(j);break;}}};function g(r){if(r&&r.headers){for(var H in r.headers){if(H.toLowerCase()==="content-type"){return r.headers[H].replace(/([^;]*);.*/,"$1");}}}return false;}var l=document.createElement("a");function e(u){l.href=u;return U.parse(l.href).path;}function f(D,E){var j=[];var m={};for(var i=0;i<E.length;++i){m[E[i]]=true;}var o=D;while(o){if(m[o.tagName]){j.push(o);}if(o.hasChildNodes()){o=o.firstChild;}else{while(!o.nextSibling){o=o.parentNode;if(!o||o===D){o=null;break;}}if(o){o=o.nextSibling;}}}return j;}function h(m){if(m.length>1){for(var i=1;i<m.length;i++){if(m[0].getCode()==m[i].getCode()&&m[0].getMessage()==m[i].getMessage()){m.shift();break;}}}}return d;});
