"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("url"),s=require("ws");function r(e){if(e&&e.__esModule)return e;var s=Object.create(null);return e&&Object.keys(e).forEach((function(r){if("default"!==r){var t=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(s,r,t.get?t:{enumerable:!0,get:function(){return e[r]}})}})),s.default=e,Object.freeze(s)}var t=r(e),n=r(s);const a={all:!1,cached:!0,children:!0,modules:!0,timings:!0,hash:!0,errors:!0,warnings:!0};class o{wsServer;httpServer;path;callbacks=[];constructor(e){this.path=`/${e.path||""}`,this.httpServer=e.server,this.wsServer=new n.Server({noServer:!0}),this.setupWsServer(),this.setupListenersClient()}setupWsServer(){this.httpServer.on("upgrade",((e,s,r)=>{if(!e.url)return;t.parse(e.url).pathname!==this.path||this.wsServer.handleUpgrade(e,s,r,(e=>{this.wsServer.emit("connection",e)}))}))}setupListenersClient(){this.wsServer.on("connection",(e=>{e.on("message",(s=>{this.callbacks.forEach((r=>{r(s.toString(),(s=>{this.sendMessage(e,s)}))}))}))}))}sendMessage(e,s){e.readyState===n.OPEN&&e.send(s)}sendBroadcast(e){this.wsServer.clients.forEach((s=>{this.sendMessage(s,e)}))}onMessage(e){this.callbacks.push(e)}}const c=(e,s)=>JSON.stringify({action:e,state:s}),i=e=>{const s={};return Object.keys(e).forEach((r=>{s[r]=(e=>{if(!e)return e;const{hash:s,time:r,warnings:t=[],errors:n=[]}=e.toJson(a);return{hash:s,time:r,warnings:t,errors:n}})(e[r])})),s};class h{state=void 0;socketServer;constructor(e){this.socketServer=new o({server:e,path:"__webpack_hmr_sever__"}),this.answerResponse()}answerResponse(){this.socketServer.onMessage(((e,s)=>{switch(e){case"init":case"check":s(c(e,this.state))}}))}sendBroadcast(e,s){const r=c(e,s);this.socketServer.sendBroadcast(r)}reloadModules(e){const s=i(e);this.state=s,this.sendBroadcast("build",s)}refresh=()=>{this.sendBroadcast("refresh")}}var u=Object.freeze({__proto__:null});exports.Types=u,exports.createHotServer=e=>new h(e),exports.default=(e,s)=>{const r=new h(s);return e.hooks.done.tap("__webpack_hmr_sever__",(e=>{r.reloadModules({client:e})})),{refresh:r.refresh}};
//# sourceMappingURL=index.js.map
