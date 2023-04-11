/*
Strada 0.9.3
Copyright © 2023 37signals, LLC
*/
var u=class{constructor(){this.adapter=null,this.lastMessageId=0,this.pendingMessages=[],this.pendingCallbacks=new Map}start(){this.notifyApplicationAfterStart()}notifyApplicationAfterStart(){document.dispatchEvent(new Event("web-bridge:ready"))}supportsComponent(t){return this.adapter?this.adapter.supportsComponent(t):!1}send({component:t,event:s,data:r,callback:n}){if(!this.adapter)return this.savePendingMessage({component:t,event:s,data:r,callback:n}),null;if(!this.supportsComponent(t))return null;let i=this.generateMessageId(),o={id:i,component:t,event:s,data:r||{}};return this.adapter.receive(o),n&&this.pendingCallbacks.set(i,n),i}receive(t){this.executeCallbackFor(t)}executeCallbackFor(t){let s=this.pendingCallbacks.get(t.id);s&&s(t)}removeCallbackFor(t){this.pendingCallbacks.has(t)&&this.pendingCallbacks.delete(t)}removePendingMessagesFor(t){this.pendingMessages=this.pendingMessages.filter(s=>s.component!=t)}generateMessageId(){return(++this.lastMessageId).toString()}setAdapter(t){this.adapter=t,document.documentElement.dataset.bridgePlatform=this.adapter.platform,this.adapterDidUpdateSupportedComponents(),this.sendPendingMessages()}adapterDidUpdateSupportedComponents(){this.adapter&&(document.documentElement.dataset.bridgeComponents=this.adapter.supportedComponents.join(" "))}savePendingMessage(t){this.pendingMessages.push(t)}sendPendingMessages(){this.pendingMessages.forEach(t=>this.send(t)),this.pendingMessages=[]}};function A(e){return e.replace(/(?:[_-])([a-z0-9])/g,(t,s)=>s.toUpperCase())}function M(e){return A(e.replace(/--/g,"-").replace(/__/g,"_"))}function d(e){return e.charAt(0).toUpperCase()+e.slice(1)}function w(e){return e.replace(/([A-Z])/g,(t,s)=>`-${s.toLowerCase()}`)}function m(e,t){let s=E(e);return Array.from(s.reduce((r,n)=>(C(n,t).forEach(i=>r.add(i)),r),new Set))}function k(e,t){return E(e).reduce((r,n)=>(r.push(...F(n,t)),r),[])}function E(e){let t=[];for(;e;)t.push(e),e=Object.getPrototypeOf(e);return t.reverse()}function C(e,t){let s=e[t];return Array.isArray(s)?s:[]}function F(e,t){let s=e[t];return s?Object.keys(s).map(r=>[r,s[r]]):[]}var _=(()=>typeof Object.getOwnPropertySymbols=="function"?e=>[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)]:Object.getOwnPropertyNames)(),q=(()=>{function e(s){function r(){return Reflect.construct(s,arguments,new.target)}return r.prototype=Object.create(s.prototype,{constructor:{value:r}}),Reflect.setPrototypeOf(r,s),r}function t(){let r=e(function(){this.a.call(this)});return r.prototype.a=function(){},new r}try{return t(),e}catch{return r=>class extends r{}}})();var J={controllerAttribute:"data-controller",actionAttribute:"data-action",targetAttribute:"data-target",targetAttributeForScope:e=>`data-${e}-target`,outletAttributeForScope:(e,t)=>`data-${e}-${t}-outlet`,keyMappings:Object.assign(Object.assign({enter:"Enter",tab:"Tab",esc:"Escape",space:" ",up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight",home:"Home",end:"End"},b("abcdefghijklmnopqrstuvwxyz".split("").map(e=>[e,e]))),b("0123456789".split("").map(e=>[e,e])))};function b(e){return e.reduce((t,[s,r])=>Object.assign(Object.assign({},t),{[s]:r}),{})}function B(e){return m(e,"classes").reduce((s,r)=>Object.assign(s,T(r)),{})}function T(e){return{[`${e}Class`]:{get(){let{classes:t}=this;if(t.has(e))return t.get(e);{let s=t.getAttributeName(e);throw new Error(`Missing attribute "${s}"`)}}},[`${e}Classes`]:{get(){return this.classes.getAll(e)}},[`has${d(e)}Class`]:{get(){return this.classes.has(e)}}}}function $(e){return m(e,"outlets").reduce((s,r)=>Object.assign(s,x(r)),{})}function x(e){let t=M(e);return{[`${t}Outlet`]:{get(){let s=this.outlets.find(e);if(s){let r=this.application.getControllerForElementAndIdentifier(s,e);if(r)return r;throw new Error(`Missing "data-controller=${e}" attribute on outlet element for "${this.identifier}" controller`)}throw new Error(`Missing outlet element "${e}" for "${this.identifier}" controller`)}},[`${t}Outlets`]:{get(){let s=this.outlets.findAll(e);return s.length>0?s.map(r=>{let n=this.application.getControllerForElementAndIdentifier(r,e);if(n)return n;console.warn(`The provided outlet element is missing the outlet controller "${e}" for "${this.identifier}"`,r)}).filter(r=>r):[]}},[`${t}OutletElement`]:{get(){let s=this.outlets.find(e);if(s)return s;throw new Error(`Missing outlet element "${e}" for "${this.identifier}" controller`)}},[`${t}OutletElements`]:{get(){return this.outlets.findAll(e)}},[`has${d(t)}Outlet`]:{get(){return this.outlets.has(e)}}}}function D(e){return m(e,"targets").reduce((s,r)=>Object.assign(s,N(r)),{})}function N(e){return{[`${e}Target`]:{get(){let t=this.targets.find(e);if(t)return t;throw new Error(`Missing target element "${e}" for "${this.identifier}" controller`)}},[`${e}Targets`]:{get(){return this.targets.findAll(e)}},[`has${d(e)}Target`]:{get(){return this.targets.has(e)}}}}function S(e){let t=k(e,"values"),s={valueDescriptorMap:{get(){return t.reduce((r,n)=>{let i=O(n,this.identifier),o=this.data.getAttributeNameForKey(i.key);return Object.assign(r,{[o]:i})},{})}}};return t.reduce((r,n)=>Object.assign(r,L(n)),s)}function L(e,t){let s=O(e,t),{key:r,name:n,reader:i,writer:o}=s;return{[n]:{get(){let c=this.data.get(r);return c!==null?i(c):s.defaultValue},set(c){c===void 0?this.data.delete(r):this.data.set(r,o(c))}},[`has${d(n)}`]:{get(){return this.data.has(r)||s.hasCustomDefaultValue}}}}function O([e,t],s){return j({controller:s,token:e,typeDefinition:t})}function f(e){switch(e){case Array:return"array";case Boolean:return"boolean";case Number:return"number";case Object:return"object";case String:return"string"}}function h(e){switch(typeof e){case"boolean":return"boolean";case"number":return"number";case"string":return"string"}if(Array.isArray(e))return"array";if(Object.prototype.toString.call(e)==="[object Object]")return"object"}function I(e){let t=f(e.typeObject.type);if(!t)return;let s=h(e.typeObject.default);if(t!==s){let r=e.controller?`${e.controller}.${e.token}`:e.token;throw new Error(`The specified default value for the Stimulus Value "${r}" must match the defined type "${t}". The provided default value of "${e.typeObject.default}" is of type "${s}".`)}return t}function V(e){let t=I({controller:e.controller,token:e.token,typeObject:e.typeDefinition}),s=h(e.typeDefinition),r=f(e.typeDefinition),n=t||s||r;if(n)return n;let i=e.controller?`${e.controller}.${e.typeDefinition}`:e.token;throw new Error(`Unknown value type "${i}" for "${e.token}" value`)}function K(e){let t=f(e);if(t)return P[t];let s=e.default;return s!==void 0?s:e}function j(e){let t=`${w(e.token)}-value`,s=V(e);return{type:s,key:t,name:A(t),get defaultValue(){return K(e.typeDefinition)},get hasCustomDefaultValue(){return h(e.typeDefinition)!==void 0},reader:U[s],writer:y[s]||y.default}}var P={get array(){return[]},boolean:!1,number:0,get object(){return{}},string:""},U={array(e){let t=JSON.parse(e);if(!Array.isArray(t))throw new TypeError(`expected value of type "array" but instead got value "${e}" of type "${h(t)}"`);return t},boolean(e){return!(e=="0"||String(e).toLowerCase()=="false")},number(e){return Number(e)},object(e){let t=JSON.parse(e);if(t===null||typeof t!="object"||Array.isArray(t))throw new TypeError(`expected value of type "object" but instead got value "${e}" of type "${h(t)}"`);return t},string(e){return e}},y={default:R,array:v,object:v};function v(e){return JSON.stringify(e)}function R(e){return`${e}`}var a=class{constructor(t){this.context=t}static get shouldLoad(){return!0}static afterLoad(t,s){}get application(){return this.context.application}get scope(){return this.context.scope}get element(){return this.scope.element}get identifier(){return this.scope.identifier}get targets(){return this.scope.targets}get outlets(){return this.scope.outlets}get classes(){return this.scope.classes}get data(){return this.scope.data}initialize(){}connect(){}disconnect(){}dispatch(t,{target:s=this.element,detail:r={},prefix:n=this.identifier,bubbles:i=!0,cancelable:o=!0}={}){let c=n?`${n}:${t}`:t,p=new CustomEvent(c,{detail:r,bubbles:i,cancelable:o});return s.dispatchEvent(p),p}};a.blessings=[B,D,S,$];a.targets=[];a.outlets=[];a.values={};var l=class{constructor(t){this.element=t}static makeMenuItems(t){return t.map((s,r)=>new l(s).menuItem(r)).filter(s=>s)}static makeMenuGroups(t){return t.map(s=>new l(s).menuGroup())}get title(){return(this.bridgeAttribute("title")||this.attribute("aria-label")||this.element.textContent||this.element.value).trim()}get icon(){let t=this.bridgeAttribute("icon-name"),s=this.bridgeAttribute(`icon-${this.platform}-url`);return t||s?{name:t,url:s}:null}get group(){return this.bridgeAttribute("group")||"default"}get style(){return this.bridgeAttribute("style")||"default"}get selected(){return this.bridgeAttribute("selected")==="true"}get filterable(){return this.bridgeAttribute("filterable")==="true"}get enabled(){return!this.disabled}get disabled(){let t=this.bridgeAttribute("disabled");return t==="true"||t===this.platform}enableForComponent(t){t.enabled&&this.removeBridgeAttribute("disabled")}get displayedOnPlatform(){return!this.hasClass(`u-hide@${this.platform}`)}showOnPlatform(){this.element.classList.remove(`u-hide@${this.platform}`)}hideOnPlatform(){this.element.classList.add(`u-hide@${this.platform}`)}get button(){return{title:this.title,icon:this.icon}}menuItem(t){return this.disabled?null:{title:this.title,style:this.style,groupName:this.group,selected:this.selected,icon:this.icon,index:t}}menuGroup(){return{title:this.title,name:this.group}}hasClass(t){return this.element.classList.contains(t)}attribute(t){return this.element.getAttribute(t)}bridgeAttribute(t){return this.attribute(`data-bridge-${t}`)}setBridgeAttribute(t,s){this.element.setAttribute(`data-bridge-${t}`,s)}removeBridgeAttribute(t){this.element.removeAttribute(`data-bridge-${t}`)}click(){this.platform=="android"&&this.element.removeAttribute("target"),this.element.click()}get platform(){return document.documentElement.dataset.bridgePlatform}};var g=class extends a{constructor(){super(...arguments);this.pendingMessageCallbacks=[]}initialize(){this.pendingMessageCallbacks=[]}connect(){}disconnect(){this.removePendingCallbacks(),this.removePendingMessages()}get component(){return this.constructor.component}get platformOptingOut(){let{bridgePlatform:s}=document.documentElement.dataset;return this.identifier==this.element.getAttribute(`data-controller-optout-${s}`)}get enabled(){return!this.platformOptingOut&&this.bridge.supportsComponent(this.component)}send(s,r={},n){r.metadata={url:window.location.href};let i={component:this.component,event:s,data:r,callback:n},o=this.bridge.send(i);n&&this.pendingMessageCallbacks.push(o)}removePendingCallbacks(){this.pendingMessageCallbacks.forEach(s=>this.bridge.removeCallbackFor(s))}removePendingMessages(){this.bridge.removePendingMessagesFor(this.component)}get bridgeElement(){return new l(this.element)}get bridge(){return window.Strada.web}};g.component="";if(!window.Strada){let e=new u;window.Strada={web:e},e.start()}export{g as Component};
