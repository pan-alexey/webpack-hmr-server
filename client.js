"use strict";class e{wasConnected=!1;url;timeout;callbacks={open:[],close:[],reconected:[],message:[]};constructor(e,o){this.url=e,this.timeout=o}connect(){const e=new WebSocket(this.url);e.onopen=()=>{(this.wasConnected?this.callbacks.reconected:this.callbacks.open).forEach((o=>{o(e)})),this.wasConnected=!0},e.onmessage=e=>{this.callbacks.message.forEach((o=>{o(e.data)}))},e.onclose=e=>{this.callbacks.close.forEach((o=>{o(e.reason)})),setTimeout((()=>{this.connect()}),this.timeout)},e.onerror=function(){e.close()}}on(e,o){return this.callbacks[e].push(o),this}}const o=new class{lastHash=__webpack_hash__;applyOptions={ignoreUnaccepted:!0,ignoreDeclined:!0,ignoreErrored:!0,onUnaccepted:e=>{},onDeclined:e=>{},onErrored:e=>{}};pageReload(){window.location.reload()}upToDate=e=>(e&&(this.lastHash=e),this.lastHash===__webpack_hash__);async emit(e){"idle"!==module?.hot?.status()||this.upToDate(e)||await this.check()}async check(e=[]){try{const o=await module.hot.check();if(!o)return void this.pageReload();const s=await module.hot.apply(this.applyOptions);if(!this.upToDate())return void this.check(s);this.processModules(o,e.concat(s))}catch(e){const o=module?.hot?.status()||"";if(["abort","fail"].indexOf(o)>=0)return void this.pageReload()}}processModules(e,o){e.filter((function(e){return o&&o.indexOf(e)<0})).length>0?this.pageReload():o.length<1||(console.groupCollapsed("[HMR] reload modules"),o.forEach((function(e){console.log("[HMR]  - "+e)})),console.groupEnd())}};(async()=>{new e("ws://"+location.host+"/__webpack_hmr_sever__",5e3).on("open",(async e=>{e.send(JSON.stringify({action:"check"})),console.log("HMR - connected")})).on("close",(async e=>{})).on("reconected",(async e=>{e.send(JSON.stringify({action:"check"})),console.log("HMR - reconnected")})).on("message",(async e=>{try{(e=>{const s=e;if("reload"!==s.action)return s.data.errors.length>0?(console.group("[HMR] error modules"),s.data.errors.forEach((({message:e})=>{console.log(e)})),void console.groupEnd()):void o.emit(s.data.hash);o.pageReload()})(JSON.parse(e))}catch(e){}})).connect()})();