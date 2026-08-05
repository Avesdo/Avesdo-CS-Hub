var iu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rc=function(r){const t=[];let e=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?t[e++]=s:s<2048?(t[e++]=s>>6|192,t[e++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),t[e++]=s>>18|240,t[e++]=s>>12&63|128,t[e++]=s>>6&63|128,t[e++]=s&63|128):(t[e++]=s>>12|224,t[e++]=s>>6&63|128,t[e++]=s&63|128)}return t},Ed=function(r){const t=[];let e=0,n=0;for(;e<r.length;){const s=r[e++];if(s<128)t[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[e++];t[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[e++],a=r[e++],u=r[e++],l=((s&7)<<18|(i&63)<<12|(a&63)<<6|u&63)-65536;t[n++]=String.fromCharCode(55296+(l>>10)),t[n++]=String.fromCharCode(56320+(l&1023))}else{const i=r[e++],a=r[e++];t[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return t.join("")},bc={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,t){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const e=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],a=s+1<r.length,u=a?r[s+1]:0,l=s+2<r.length,d=l?r[s+2]:0,f=i>>2,p=(i&3)<<4|u>>4;let I=(u&15)<<2|d>>6,S=d&63;l||(S=64,a||(I=64)),n.push(e[f],e[p],e[I],e[S])}return n.join("")},encodeString(r,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(r):this.encodeByteArray(Rc(r),t)},decodeString(r,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(r):Ed(this.decodeStringToByteArray(r,t))},decodeStringToByteArray(r,t){this.init_();const e=t?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=e[r.charAt(s++)],u=s<r.length?e[r.charAt(s)]:0;++s;const d=s<r.length?e[r.charAt(s)]:64;++s;const p=s<r.length?e[r.charAt(s)]:64;if(++s,i==null||u==null||d==null||p==null)throw new Td;const I=i<<2|u>>4;if(n.push(I),d!==64){const S=u<<4&240|d>>2;if(n.push(S),p!==64){const D=d<<6&192|p;n.push(D)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class Td extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const vd=function(r){const t=Rc(r);return bc.encodeByteArray(t,!0)},Sc=function(r){return vd(r).replace(/\./g,"")},wd=function(r){try{return bc.decodeString(r,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ad(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rd=()=>Ad().__FIREBASE_DEFAULTS__,bd=()=>{if(typeof process>"u"||typeof iu>"u")return;const r=iu.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Sd=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=r&&wd(r[1]);return t&&JSON.parse(t)},Vs=()=>{try{return Rd()||bd()||Sd()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},x_=r=>{var t,e;return(e=(t=Vs())===null||t===void 0?void 0:t.emulatorHosts)===null||e===void 0?void 0:e[r]},Pc=()=>{var r;return(r=Vs())===null||r===void 0?void 0:r.config},N_=r=>{var t;return(t=Vs())===null||t===void 0?void 0:t[`_${r}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pd{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}wrapCallback(t){return(e,n)=>{e?this.reject(e):this.resolve(n),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(e):t(e,n))}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function on(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function k_(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(on())}function Vd(){var r;const t=(r=Vs())===null||r===void 0?void 0:r.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function M_(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function O_(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function F_(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function L_(){const r=on();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function Vc(){return!Vd()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Cc(){try{return typeof indexedDB=="object"}catch{return!1}}function Cd(){return new Promise((r,t)=>{try{let e=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),e||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{e=!1},s.onerror=()=>{var i;t(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(e){t(e)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dd="FirebaseError";class In extends Error{constructor(t,e,n){super(e),this.code=t,this.customData=n,this.name=Dd,Object.setPrototypeOf(this,In.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Dc.prototype.create)}}class Dc{constructor(t,e,n){this.service=t,this.serviceName=e,this.errors=n}create(t,...e){const n=e[0]||{},s=`${this.service}/${t}`,i=this.errors[t],a=i?xd(i,n):"Error",u=`${this.serviceName}: ${a} (${s}).`;return new In(s,u,n)}}function xd(r,t){return r.replace(Nd,(e,n)=>{const s=t[n];return s!=null?String(s):`<${n}?>`})}const Nd=/\{\$([^}]+)}/g;function B_(r){for(const t in r)if(Object.prototype.hasOwnProperty.call(r,t))return!1;return!0}function ds(r,t){if(r===t)return!0;const e=Object.keys(r),n=Object.keys(t);for(const s of e){if(!n.includes(s))return!1;const i=r[s],a=t[s];if(ou(i)&&ou(a)){if(!ds(i,a))return!1}else if(i!==a)return!1}for(const s of n)if(!e.includes(s))return!1;return!0}function ou(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function U_(r){const t=[];for(const[e,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{t.push(encodeURIComponent(e)+"="+encodeURIComponent(s))}):t.push(encodeURIComponent(e)+"="+encodeURIComponent(n));return t.length?"&"+t.join("&"):""}function q_(r,t){const e=new kd(r,t);return e.subscribe.bind(e)}class kd{constructor(t,e){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=e,this.task.then(()=>{t(this)}).catch(n=>{this.error(n)})}next(t){this.forEachObserver(e=>{e.next(t)})}error(t){this.forEachObserver(e=>{e.error(t)}),this.close(t)}complete(){this.forEachObserver(t=>{t.complete()}),this.close()}subscribe(t,e,n){let s;if(t===void 0&&e===void 0&&n===void 0)throw new Error("Missing Observer.");Md(t,["next","error","complete"])?s=t:s={next:t,error:e,complete:n},s.next===void 0&&(s.next=Ri),s.error===void 0&&(s.error=Ri),s.complete===void 0&&(s.complete=Ri);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(t){this.observers===void 0||this.observers[t]===void 0||(delete this.observers[t],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(t){if(!this.finalized)for(let e=0;e<this.observers.length;e++)this.sendOne(e,t)}sendOne(t,e){this.task.then(()=>{if(this.observers!==void 0&&this.observers[t]!==void 0)try{e(this.observers[t])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(t){this.finalized||(this.finalized=!0,t!==void 0&&(this.finalError=t),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Md(r,t){if(typeof r!="object"||r===null)return!1;for(const e of t)if(e in r&&typeof r[e]=="function")return!0;return!1}function Ri(){}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j_=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,r=>{const t=Math.random()*16|0;return(r==="x"?t:t&3|8).toString(16)})};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Od=1e3,Fd=2,Ld=4*60*60*1e3,Bd=.5;function z_(r,t=Od,e=Fd){const n=t*Math.pow(e,r),s=Math.round(Bd*n*(Math.random()-.5)*2);return Math.min(Ld,n+s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ot(r){return r&&r._delegate?r._delegate:r}class ar{constructor(t,e,n){this.name=t,this.instanceFactory=e,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const be="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ud{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const n=new Pd;if(this.instancesDeferred.set(e,n),this.isInitialized(e)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:e});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(e).promise}getImmediate(t){var e;const n=this.normalizeInstanceIdentifier(t==null?void 0:t.identifier),s=(e=t==null?void 0:t.optional)!==null&&e!==void 0?e:!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(jd(t))try{this.getOrInitializeService({instanceIdentifier:be})}catch{}for(const[e,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(e);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(t=be){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...t.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=be){return this.instances.has(t)}getOptions(t=be){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,n=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:e});for(const[i,a]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(i);n===u&&a.resolve(s)}return s}onInit(t,e){var n;const s=this.normalizeInstanceIdentifier(e),i=(n=this.onInitCallbacks.get(s))!==null&&n!==void 0?n:new Set;i.add(t),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&t(a,s),()=>{i.delete(t)}}invokeOnInitCallbacks(t,e){const n=this.onInitCallbacks.get(e);if(n)for(const s of n)try{s(t,e)}catch{}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let n=this.instances.get(t);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:qd(t),options:e}),this.instances.set(t,n),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(n,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,n)}catch{}return n||null}normalizeInstanceIdentifier(t=be){return this.component?this.component.multipleInstances?t:be:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function qd(r){return r===be?void 0:r}function jd(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zd{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new Ud(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Q;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(Q||(Q={}));const Gd={debug:Q.DEBUG,verbose:Q.VERBOSE,info:Q.INFO,warn:Q.WARN,error:Q.ERROR,silent:Q.SILENT},Kd=Q.INFO,$d={[Q.DEBUG]:"log",[Q.VERBOSE]:"log",[Q.INFO]:"info",[Q.WARN]:"warn",[Q.ERROR]:"error"},Qd=(r,t,...e)=>{if(t<r.logLevel)return;const n=new Date().toISOString(),s=$d[t];if(s)console[s](`[${n}]  ${r.name}:`,...e);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class xc{constructor(t){this.name=t,this._logLevel=Kd,this._logHandler=Qd,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in Q))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?Gd[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,Q.DEBUG,...t),this._logHandler(this,Q.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,Q.VERBOSE,...t),this._logHandler(this,Q.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,Q.INFO,...t),this._logHandler(this,Q.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,Q.WARN,...t),this._logHandler(this,Q.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,Q.ERROR,...t),this._logHandler(this,Q.ERROR,...t)}}const Wd=(r,t)=>t.some(e=>r instanceof e);let au,uu;function Hd(){return au||(au=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Jd(){return uu||(uu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Nc=new WeakMap,Oi=new WeakMap,kc=new WeakMap,bi=new WeakMap,co=new WeakMap;function Yd(r){const t=new Promise((e,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",a)},i=()=>{e(ce(r.result)),s()},a=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",a)});return t.then(e=>{e instanceof IDBCursor&&Nc.set(e,r)}).catch(()=>{}),co.set(t,r),t}function Xd(r){if(Oi.has(r))return;const t=new Promise((e,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",a),r.removeEventListener("abort",a)},i=()=>{e(),s()},a=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",a),r.addEventListener("abort",a)});Oi.set(r,t)}let Fi={get(r,t,e){if(r instanceof IDBTransaction){if(t==="done")return Oi.get(r);if(t==="objectStoreNames")return r.objectStoreNames||kc.get(r);if(t==="store")return e.objectStoreNames[1]?void 0:e.objectStore(e.objectStoreNames[0])}return ce(r[t])},set(r,t,e){return r[t]=e,!0},has(r,t){return r instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in r}};function Zd(r){Fi=r(Fi)}function tf(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...e){const n=r.call(Si(this),t,...e);return kc.set(n,t.sort?t.sort():[t]),ce(n)}:Jd().includes(r)?function(...t){return r.apply(Si(this),t),ce(Nc.get(this))}:function(...t){return ce(r.apply(Si(this),t))}}function ef(r){return typeof r=="function"?tf(r):(r instanceof IDBTransaction&&Xd(r),Wd(r,Hd())?new Proxy(r,Fi):r)}function ce(r){if(r instanceof IDBRequest)return Yd(r);if(bi.has(r))return bi.get(r);const t=ef(r);return t!==r&&(bi.set(r,t),co.set(t,r)),t}const Si=r=>co.get(r);function nf(r,t,{blocked:e,upgrade:n,blocking:s,terminated:i}={}){const a=indexedDB.open(r,t),u=ce(a);return n&&a.addEventListener("upgradeneeded",l=>{n(ce(a.result),l.oldVersion,l.newVersion,ce(a.transaction),l)}),e&&a.addEventListener("blocked",l=>e(l.oldVersion,l.newVersion,l)),u.then(l=>{i&&l.addEventListener("close",()=>i()),s&&l.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),u}const rf=["get","getKey","getAll","getAllKeys","count"],sf=["put","add","delete","clear"],Pi=new Map;function cu(r,t){if(!(r instanceof IDBDatabase&&!(t in r)&&typeof t=="string"))return;if(Pi.get(t))return Pi.get(t);const e=t.replace(/FromIndex$/,""),n=t!==e,s=sf.includes(e);if(!(e in(n?IDBIndex:IDBObjectStore).prototype)||!(s||rf.includes(e)))return;const i=async function(a,...u){const l=this.transaction(a,s?"readwrite":"readonly");let d=l.store;return n&&(d=d.index(u.shift())),(await Promise.all([d[e](...u),s&&l.done]))[0]};return Pi.set(t,i),i}Zd(r=>({...r,get:(t,e,n)=>cu(t,e)||r.get(t,e,n),has:(t,e)=>!!cu(t,e)||r.has(t,e)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class of{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(af(e)){const n=e.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(e=>e).join(" ")}}function af(r){const t=r.getComponent();return(t==null?void 0:t.type)==="VERSION"}const Li="@firebase/app",lu="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yt=new xc("@firebase/app"),uf="@firebase/app-compat",cf="@firebase/analytics-compat",lf="@firebase/analytics",hf="@firebase/app-check-compat",df="@firebase/app-check",ff="@firebase/auth",mf="@firebase/auth-compat",pf="@firebase/database",gf="@firebase/data-connect",_f="@firebase/database-compat",yf="@firebase/functions",If="@firebase/functions-compat",Ef="@firebase/installations",Tf="@firebase/installations-compat",vf="@firebase/messaging",wf="@firebase/messaging-compat",Af="@firebase/performance",Rf="@firebase/performance-compat",bf="@firebase/remote-config",Sf="@firebase/remote-config-compat",Pf="@firebase/storage",Vf="@firebase/storage-compat",Cf="@firebase/firestore",Df="@firebase/vertexai-preview",xf="@firebase/firestore-compat",Nf="firebase",kf="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bi="[DEFAULT]",Mf={[Li]:"fire-core",[uf]:"fire-core-compat",[lf]:"fire-analytics",[cf]:"fire-analytics-compat",[df]:"fire-app-check",[hf]:"fire-app-check-compat",[ff]:"fire-auth",[mf]:"fire-auth-compat",[pf]:"fire-rtdb",[gf]:"fire-data-connect",[_f]:"fire-rtdb-compat",[yf]:"fire-fn",[If]:"fire-fn-compat",[Ef]:"fire-iid",[Tf]:"fire-iid-compat",[vf]:"fire-fcm",[wf]:"fire-fcm-compat",[Af]:"fire-perf",[Rf]:"fire-perf-compat",[bf]:"fire-rc",[Sf]:"fire-rc-compat",[Pf]:"fire-gcs",[Vf]:"fire-gcs-compat",[Cf]:"fire-fst",[xf]:"fire-fst-compat",[Df]:"fire-vertex","fire-js":"fire-js",[Nf]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fs=new Map,Of=new Map,Ui=new Map;function hu(r,t){try{r.container.addComponent(t)}catch(e){Yt.debug(`Component ${t.name} failed to register with FirebaseApp ${r.name}`,e)}}function ms(r){const t=r.name;if(Ui.has(t))return Yt.debug(`There were multiple attempts to register component ${t}.`),!1;Ui.set(t,r);for(const e of fs.values())hu(e,r);for(const e of Of.values())hu(e,r);return!0}function Ff(r,t){const e=r.container.getProvider("heartbeat").getImmediate({optional:!0});return e&&e.triggerHeartbeat(),r.container.getProvider(t)}function G_(r){return r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lf={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},le=new Dc("app","Firebase",Lf);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bf{constructor(t,e,n){this._isDeleted=!1,this._options=Object.assign({},t),this._config=Object.assign({},e),this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new ar("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw le.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uf=kf;function qf(r,t={}){let e=r;typeof t!="object"&&(t={name:t});const n=Object.assign({name:Bi,automaticDataCollectionEnabled:!1},t),s=n.name;if(typeof s!="string"||!s)throw le.create("bad-app-name",{appName:String(s)});if(e||(e=Pc()),!e)throw le.create("no-options");const i=fs.get(s);if(i){if(ds(e,i.options)&&ds(n,i.config))return i;throw le.create("duplicate-app",{appName:s})}const a=new zd(s);for(const l of Ui.values())a.addComponent(l);const u=new Bf(e,n,a);return fs.set(s,u),u}function K_(r=Bi){const t=fs.get(r);if(!t&&r===Bi&&Pc())return qf();if(!t)throw le.create("no-app",{appName:r});return t}function rn(r,t,e){var n;let s=(n=Mf[r])!==null&&n!==void 0?n:r;e&&(s+=`-${e}`);const i=s.match(/\s|\//),a=t.match(/\s|\//);if(i||a){const u=[`Unable to register library "${s}" with version "${t}":`];i&&u.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&u.push("and"),a&&u.push(`version name "${t}" contains illegal characters (whitespace or "/")`),Yt.warn(u.join(" "));return}ms(new ar(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jf="firebase-heartbeat-database",zf=1,ur="firebase-heartbeat-store";let Vi=null;function Mc(){return Vi||(Vi=nf(jf,zf,{upgrade:(r,t)=>{switch(t){case 0:try{r.createObjectStore(ur)}catch(e){console.warn(e)}}}}).catch(r=>{throw le.create("idb-open",{originalErrorMessage:r.message})})),Vi}async function Gf(r){try{const e=(await Mc()).transaction(ur),n=await e.objectStore(ur).get(Oc(r));return await e.done,n}catch(t){if(t instanceof In)Yt.warn(t.message);else{const e=le.create("idb-get",{originalErrorMessage:t==null?void 0:t.message});Yt.warn(e.message)}}}async function du(r,t){try{const n=(await Mc()).transaction(ur,"readwrite");await n.objectStore(ur).put(t,Oc(r)),await n.done}catch(e){if(e instanceof In)Yt.warn(e.message);else{const n=le.create("idb-set",{originalErrorMessage:e==null?void 0:e.message});Yt.warn(n.message)}}}function Oc(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kf=1024,$f=30*24*60*60*1e3;class Qf{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new Hf(e),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var t,e;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=fu();return((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const u=new Date(a.date).valueOf();return Date.now()-u<=$f}),this._storage.overwrite(this._heartbeatsCache))}catch(n){Yt.warn(n)}}async getHeartbeatsHeader(){var t;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=fu(),{heartbeatsToSend:n,unsentEntries:s}=Wf(this._heartbeatsCache.heartbeats),i=Sc(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(e){return Yt.warn(e),""}}}function fu(){return new Date().toISOString().substring(0,10)}function Wf(r,t=Kf){const e=[];let n=r.slice();for(const s of r){const i=e.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),mu(e)>t){i.dates.pop();break}}else if(e.push({agent:s.agent,dates:[s.date]}),mu(e)>t){e.pop();break}n=n.slice(1)}return{heartbeatsToSend:e,unsentEntries:n}}class Hf{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Cc()?Cd().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const e=await Gf(this.app);return e!=null&&e.heartbeats?e:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){var e;if(await this._canUseIndexedDBPromise){const s=await this.read();return du(this.app,{lastSentHeartbeatDate:(e=t.lastSentHeartbeatDate)!==null&&e!==void 0?e:s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){var e;if(await this._canUseIndexedDBPromise){const s=await this.read();return du(this.app,{lastSentHeartbeatDate:(e=t.lastSentHeartbeatDate)!==null&&e!==void 0?e:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}}function mu(r){return Sc(JSON.stringify({version:2,heartbeats:r})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jf(r){ms(new ar("platform-logger",t=>new of(t),"PRIVATE")),ms(new ar("heartbeat",t=>new Qf(t),"PRIVATE")),rn(Li,lu,r),rn(Li,lu,"esm2017"),rn("fire-js","")}Jf("");var pu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ne,Fc;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(E,g){function y(){}y.prototype=g.prototype,E.D=g.prototype,E.prototype=new y,E.prototype.constructor=E,E.C=function(T,v,R){for(var _=Array(arguments.length-2),Kt=2;Kt<arguments.length;Kt++)_[Kt-2]=arguments[Kt];return g.prototype[v].apply(T,_)}}function e(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}t(n,e),n.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(E,g,y){y||(y=0);var T=Array(16);if(typeof g=="string")for(var v=0;16>v;++v)T[v]=g.charCodeAt(y++)|g.charCodeAt(y++)<<8|g.charCodeAt(y++)<<16|g.charCodeAt(y++)<<24;else for(v=0;16>v;++v)T[v]=g[y++]|g[y++]<<8|g[y++]<<16|g[y++]<<24;g=E.g[0],y=E.g[1],v=E.g[2];var R=E.g[3],_=g+(R^y&(v^R))+T[0]+3614090360&4294967295;g=y+(_<<7&4294967295|_>>>25),_=R+(v^g&(y^v))+T[1]+3905402710&4294967295,R=g+(_<<12&4294967295|_>>>20),_=v+(y^R&(g^y))+T[2]+606105819&4294967295,v=R+(_<<17&4294967295|_>>>15),_=y+(g^v&(R^g))+T[3]+3250441966&4294967295,y=v+(_<<22&4294967295|_>>>10),_=g+(R^y&(v^R))+T[4]+4118548399&4294967295,g=y+(_<<7&4294967295|_>>>25),_=R+(v^g&(y^v))+T[5]+1200080426&4294967295,R=g+(_<<12&4294967295|_>>>20),_=v+(y^R&(g^y))+T[6]+2821735955&4294967295,v=R+(_<<17&4294967295|_>>>15),_=y+(g^v&(R^g))+T[7]+4249261313&4294967295,y=v+(_<<22&4294967295|_>>>10),_=g+(R^y&(v^R))+T[8]+1770035416&4294967295,g=y+(_<<7&4294967295|_>>>25),_=R+(v^g&(y^v))+T[9]+2336552879&4294967295,R=g+(_<<12&4294967295|_>>>20),_=v+(y^R&(g^y))+T[10]+4294925233&4294967295,v=R+(_<<17&4294967295|_>>>15),_=y+(g^v&(R^g))+T[11]+2304563134&4294967295,y=v+(_<<22&4294967295|_>>>10),_=g+(R^y&(v^R))+T[12]+1804603682&4294967295,g=y+(_<<7&4294967295|_>>>25),_=R+(v^g&(y^v))+T[13]+4254626195&4294967295,R=g+(_<<12&4294967295|_>>>20),_=v+(y^R&(g^y))+T[14]+2792965006&4294967295,v=R+(_<<17&4294967295|_>>>15),_=y+(g^v&(R^g))+T[15]+1236535329&4294967295,y=v+(_<<22&4294967295|_>>>10),_=g+(v^R&(y^v))+T[1]+4129170786&4294967295,g=y+(_<<5&4294967295|_>>>27),_=R+(y^v&(g^y))+T[6]+3225465664&4294967295,R=g+(_<<9&4294967295|_>>>23),_=v+(g^y&(R^g))+T[11]+643717713&4294967295,v=R+(_<<14&4294967295|_>>>18),_=y+(R^g&(v^R))+T[0]+3921069994&4294967295,y=v+(_<<20&4294967295|_>>>12),_=g+(v^R&(y^v))+T[5]+3593408605&4294967295,g=y+(_<<5&4294967295|_>>>27),_=R+(y^v&(g^y))+T[10]+38016083&4294967295,R=g+(_<<9&4294967295|_>>>23),_=v+(g^y&(R^g))+T[15]+3634488961&4294967295,v=R+(_<<14&4294967295|_>>>18),_=y+(R^g&(v^R))+T[4]+3889429448&4294967295,y=v+(_<<20&4294967295|_>>>12),_=g+(v^R&(y^v))+T[9]+568446438&4294967295,g=y+(_<<5&4294967295|_>>>27),_=R+(y^v&(g^y))+T[14]+3275163606&4294967295,R=g+(_<<9&4294967295|_>>>23),_=v+(g^y&(R^g))+T[3]+4107603335&4294967295,v=R+(_<<14&4294967295|_>>>18),_=y+(R^g&(v^R))+T[8]+1163531501&4294967295,y=v+(_<<20&4294967295|_>>>12),_=g+(v^R&(y^v))+T[13]+2850285829&4294967295,g=y+(_<<5&4294967295|_>>>27),_=R+(y^v&(g^y))+T[2]+4243563512&4294967295,R=g+(_<<9&4294967295|_>>>23),_=v+(g^y&(R^g))+T[7]+1735328473&4294967295,v=R+(_<<14&4294967295|_>>>18),_=y+(R^g&(v^R))+T[12]+2368359562&4294967295,y=v+(_<<20&4294967295|_>>>12),_=g+(y^v^R)+T[5]+4294588738&4294967295,g=y+(_<<4&4294967295|_>>>28),_=R+(g^y^v)+T[8]+2272392833&4294967295,R=g+(_<<11&4294967295|_>>>21),_=v+(R^g^y)+T[11]+1839030562&4294967295,v=R+(_<<16&4294967295|_>>>16),_=y+(v^R^g)+T[14]+4259657740&4294967295,y=v+(_<<23&4294967295|_>>>9),_=g+(y^v^R)+T[1]+2763975236&4294967295,g=y+(_<<4&4294967295|_>>>28),_=R+(g^y^v)+T[4]+1272893353&4294967295,R=g+(_<<11&4294967295|_>>>21),_=v+(R^g^y)+T[7]+4139469664&4294967295,v=R+(_<<16&4294967295|_>>>16),_=y+(v^R^g)+T[10]+3200236656&4294967295,y=v+(_<<23&4294967295|_>>>9),_=g+(y^v^R)+T[13]+681279174&4294967295,g=y+(_<<4&4294967295|_>>>28),_=R+(g^y^v)+T[0]+3936430074&4294967295,R=g+(_<<11&4294967295|_>>>21),_=v+(R^g^y)+T[3]+3572445317&4294967295,v=R+(_<<16&4294967295|_>>>16),_=y+(v^R^g)+T[6]+76029189&4294967295,y=v+(_<<23&4294967295|_>>>9),_=g+(y^v^R)+T[9]+3654602809&4294967295,g=y+(_<<4&4294967295|_>>>28),_=R+(g^y^v)+T[12]+3873151461&4294967295,R=g+(_<<11&4294967295|_>>>21),_=v+(R^g^y)+T[15]+530742520&4294967295,v=R+(_<<16&4294967295|_>>>16),_=y+(v^R^g)+T[2]+3299628645&4294967295,y=v+(_<<23&4294967295|_>>>9),_=g+(v^(y|~R))+T[0]+4096336452&4294967295,g=y+(_<<6&4294967295|_>>>26),_=R+(y^(g|~v))+T[7]+1126891415&4294967295,R=g+(_<<10&4294967295|_>>>22),_=v+(g^(R|~y))+T[14]+2878612391&4294967295,v=R+(_<<15&4294967295|_>>>17),_=y+(R^(v|~g))+T[5]+4237533241&4294967295,y=v+(_<<21&4294967295|_>>>11),_=g+(v^(y|~R))+T[12]+1700485571&4294967295,g=y+(_<<6&4294967295|_>>>26),_=R+(y^(g|~v))+T[3]+2399980690&4294967295,R=g+(_<<10&4294967295|_>>>22),_=v+(g^(R|~y))+T[10]+4293915773&4294967295,v=R+(_<<15&4294967295|_>>>17),_=y+(R^(v|~g))+T[1]+2240044497&4294967295,y=v+(_<<21&4294967295|_>>>11),_=g+(v^(y|~R))+T[8]+1873313359&4294967295,g=y+(_<<6&4294967295|_>>>26),_=R+(y^(g|~v))+T[15]+4264355552&4294967295,R=g+(_<<10&4294967295|_>>>22),_=v+(g^(R|~y))+T[6]+2734768916&4294967295,v=R+(_<<15&4294967295|_>>>17),_=y+(R^(v|~g))+T[13]+1309151649&4294967295,y=v+(_<<21&4294967295|_>>>11),_=g+(v^(y|~R))+T[4]+4149444226&4294967295,g=y+(_<<6&4294967295|_>>>26),_=R+(y^(g|~v))+T[11]+3174756917&4294967295,R=g+(_<<10&4294967295|_>>>22),_=v+(g^(R|~y))+T[2]+718787259&4294967295,v=R+(_<<15&4294967295|_>>>17),_=y+(R^(v|~g))+T[9]+3951481745&4294967295,E.g[0]=E.g[0]+g&4294967295,E.g[1]=E.g[1]+(v+(_<<21&4294967295|_>>>11))&4294967295,E.g[2]=E.g[2]+v&4294967295,E.g[3]=E.g[3]+R&4294967295}n.prototype.u=function(E,g){g===void 0&&(g=E.length);for(var y=g-this.blockSize,T=this.B,v=this.h,R=0;R<g;){if(v==0)for(;R<=y;)s(this,E,R),R+=this.blockSize;if(typeof E=="string"){for(;R<g;)if(T[v++]=E.charCodeAt(R++),v==this.blockSize){s(this,T),v=0;break}}else for(;R<g;)if(T[v++]=E[R++],v==this.blockSize){s(this,T),v=0;break}}this.h=v,this.o+=g},n.prototype.v=function(){var E=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);E[0]=128;for(var g=1;g<E.length-8;++g)E[g]=0;var y=8*this.o;for(g=E.length-8;g<E.length;++g)E[g]=y&255,y/=256;for(this.u(E),E=Array(16),g=y=0;4>g;++g)for(var T=0;32>T;T+=8)E[y++]=this.g[g]>>>T&255;return E};function i(E,g){var y=u;return Object.prototype.hasOwnProperty.call(y,E)?y[E]:y[E]=g(E)}function a(E,g){this.h=g;for(var y=[],T=!0,v=E.length-1;0<=v;v--){var R=E[v]|0;T&&R==g||(y[v]=R,T=!1)}this.g=y}var u={};function l(E){return-128<=E&&128>E?i(E,function(g){return new a([g|0],0>g?-1:0)}):new a([E|0],0>E?-1:0)}function d(E){if(isNaN(E)||!isFinite(E))return p;if(0>E)return x(d(-E));for(var g=[],y=1,T=0;E>=y;T++)g[T]=E/y|0,y*=4294967296;return new a(g,0)}function f(E,g){if(E.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(E.charAt(0)=="-")return x(f(E.substring(1),g));if(0<=E.indexOf("-"))throw Error('number format error: interior "-" character');for(var y=d(Math.pow(g,8)),T=p,v=0;v<E.length;v+=8){var R=Math.min(8,E.length-v),_=parseInt(E.substring(v,v+R),g);8>R?(R=d(Math.pow(g,R)),T=T.j(R).add(d(_))):(T=T.j(y),T=T.add(d(_)))}return T}var p=l(0),I=l(1),S=l(16777216);r=a.prototype,r.m=function(){if(k(this))return-x(this).m();for(var E=0,g=1,y=0;y<this.g.length;y++){var T=this.i(y);E+=(0<=T?T:4294967296+T)*g,g*=4294967296}return E},r.toString=function(E){if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(D(this))return"0";if(k(this))return"-"+x(this).toString(E);for(var g=d(Math.pow(E,6)),y=this,T="";;){var v=Y(y,g).g;y=z(y,v.j(g));var R=((0<y.g.length?y.g[0]:y.h)>>>0).toString(E);if(y=v,D(y))return R+T;for(;6>R.length;)R="0"+R;T=R+T}},r.i=function(E){return 0>E?0:E<this.g.length?this.g[E]:this.h};function D(E){if(E.h!=0)return!1;for(var g=0;g<E.g.length;g++)if(E.g[g]!=0)return!1;return!0}function k(E){return E.h==-1}r.l=function(E){return E=z(this,E),k(E)?-1:D(E)?0:1};function x(E){for(var g=E.g.length,y=[],T=0;T<g;T++)y[T]=~E.g[T];return new a(y,~E.h).add(I)}r.abs=function(){return k(this)?x(this):this},r.add=function(E){for(var g=Math.max(this.g.length,E.g.length),y=[],T=0,v=0;v<=g;v++){var R=T+(this.i(v)&65535)+(E.i(v)&65535),_=(R>>>16)+(this.i(v)>>>16)+(E.i(v)>>>16);T=_>>>16,R&=65535,_&=65535,y[v]=_<<16|R}return new a(y,y[y.length-1]&-2147483648?-1:0)};function z(E,g){return E.add(x(g))}r.j=function(E){if(D(this)||D(E))return p;if(k(this))return k(E)?x(this).j(x(E)):x(x(this).j(E));if(k(E))return x(this.j(x(E)));if(0>this.l(S)&&0>E.l(S))return d(this.m()*E.m());for(var g=this.g.length+E.g.length,y=[],T=0;T<2*g;T++)y[T]=0;for(T=0;T<this.g.length;T++)for(var v=0;v<E.g.length;v++){var R=this.i(T)>>>16,_=this.i(T)&65535,Kt=E.i(v)>>>16,Pn=E.i(v)&65535;y[2*T+2*v]+=_*Pn,j(y,2*T+2*v),y[2*T+2*v+1]+=R*Pn,j(y,2*T+2*v+1),y[2*T+2*v+1]+=_*Kt,j(y,2*T+2*v+1),y[2*T+2*v+2]+=R*Kt,j(y,2*T+2*v+2)}for(T=0;T<g;T++)y[T]=y[2*T+1]<<16|y[2*T];for(T=g;T<2*g;T++)y[T]=0;return new a(y,0)};function j(E,g){for(;(E[g]&65535)!=E[g];)E[g+1]+=E[g]>>>16,E[g]&=65535,g++}function U(E,g){this.g=E,this.h=g}function Y(E,g){if(D(g))throw Error("division by zero");if(D(E))return new U(p,p);if(k(E))return g=Y(x(E),g),new U(x(g.g),x(g.h));if(k(g))return g=Y(E,x(g)),new U(x(g.g),g.h);if(30<E.g.length){if(k(E)||k(g))throw Error("slowDivide_ only works with positive integers.");for(var y=I,T=g;0>=T.l(E);)y=et(y),T=et(T);var v=W(y,1),R=W(T,1);for(T=W(T,2),y=W(y,2);!D(T);){var _=R.add(T);0>=_.l(E)&&(v=v.add(y),R=_),T=W(T,1),y=W(y,1)}return g=z(E,v.j(g)),new U(v,g)}for(v=p;0<=E.l(g);){for(y=Math.max(1,Math.floor(E.m()/g.m())),T=Math.ceil(Math.log(y)/Math.LN2),T=48>=T?1:Math.pow(2,T-48),R=d(y),_=R.j(g);k(_)||0<_.l(E);)y-=T,R=d(y),_=R.j(g);D(R)&&(R=I),v=v.add(R),E=z(E,_)}return new U(v,E)}r.A=function(E){return Y(this,E).h},r.and=function(E){for(var g=Math.max(this.g.length,E.g.length),y=[],T=0;T<g;T++)y[T]=this.i(T)&E.i(T);return new a(y,this.h&E.h)},r.or=function(E){for(var g=Math.max(this.g.length,E.g.length),y=[],T=0;T<g;T++)y[T]=this.i(T)|E.i(T);return new a(y,this.h|E.h)},r.xor=function(E){for(var g=Math.max(this.g.length,E.g.length),y=[],T=0;T<g;T++)y[T]=this.i(T)^E.i(T);return new a(y,this.h^E.h)};function et(E){for(var g=E.g.length+1,y=[],T=0;T<g;T++)y[T]=E.i(T)<<1|E.i(T-1)>>>31;return new a(y,E.h)}function W(E,g){var y=g>>5;g%=32;for(var T=E.g.length-y,v=[],R=0;R<T;R++)v[R]=0<g?E.i(R+y)>>>g|E.i(R+y+1)<<32-g:E.i(R+y);return new a(v,E.h)}n.prototype.digest=n.prototype.v,n.prototype.reset=n.prototype.s,n.prototype.update=n.prototype.u,Fc=n,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,Ne=a}).apply(typeof pu<"u"?pu:typeof self<"u"?self:typeof window<"u"?window:{});var Xr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Lc,Jn,Bc,ss,qi,Uc,qc,jc;(function(){var r,t=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,c,h){return o==Array.prototype||o==Object.prototype||(o[c]=h.value),o};function e(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Xr=="object"&&Xr];for(var c=0;c<o.length;++c){var h=o[c];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var n=e(this);function s(o,c){if(c)t:{var h=n;o=o.split(".");for(var m=0;m<o.length-1;m++){var w=o[m];if(!(w in h))break t;h=h[w]}o=o[o.length-1],m=h[o],c=c(m),c!=m&&c!=null&&t(h,o,{configurable:!0,writable:!0,value:c})}}function i(o,c){o instanceof String&&(o+="");var h=0,m=!1,w={next:function(){if(!m&&h<o.length){var b=h++;return{value:c(b,o[b]),done:!1}}return m=!0,{done:!0,value:void 0}}};return w[Symbol.iterator]=function(){return w},w}s("Array.prototype.values",function(o){return o||function(){return i(this,function(c,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},u=this||self;function l(o){var c=typeof o;return c=c!="object"?c:o?Array.isArray(o)?"array":c:"null",c=="array"||c=="object"&&typeof o.length=="number"}function d(o){var c=typeof o;return c=="object"&&o!=null||c=="function"}function f(o,c,h){return o.call.apply(o.bind,arguments)}function p(o,c,h){if(!o)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var w=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(w,m),o.apply(c,w)}}return function(){return o.apply(c,arguments)}}function I(o,c,h){return I=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:p,I.apply(null,arguments)}function S(o,c){var h=Array.prototype.slice.call(arguments,1);return function(){var m=h.slice();return m.push.apply(m,arguments),o.apply(this,m)}}function D(o,c){function h(){}h.prototype=c.prototype,o.aa=c.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(m,w,b){for(var N=Array(arguments.length-2),tt=2;tt<arguments.length;tt++)N[tt-2]=arguments[tt];return c.prototype[w].apply(m,N)}}function k(o){const c=o.length;if(0<c){const h=Array(c);for(let m=0;m<c;m++)h[m]=o[m];return h}return[]}function x(o,c){for(let h=1;h<arguments.length;h++){const m=arguments[h];if(l(m)){const w=o.length||0,b=m.length||0;o.length=w+b;for(let N=0;N<b;N++)o[w+N]=m[N]}else o.push(m)}}class z{constructor(c,h){this.i=c,this.j=h,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function j(o){return/^[\s\xa0]*$/.test(o)}function U(){var o=u.navigator;return o&&(o=o.userAgent)?o:""}function Y(o){return Y[" "](o),o}Y[" "]=function(){};var et=U().indexOf("Gecko")!=-1&&!(U().toLowerCase().indexOf("webkit")!=-1&&U().indexOf("Edge")==-1)&&!(U().indexOf("Trident")!=-1||U().indexOf("MSIE")!=-1)&&U().indexOf("Edge")==-1;function W(o,c,h){for(const m in o)c.call(h,o[m],m,o)}function E(o,c){for(const h in o)c.call(void 0,o[h],h,o)}function g(o){const c={};for(const h in o)c[h]=o[h];return c}const y="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function T(o,c){let h,m;for(let w=1;w<arguments.length;w++){m=arguments[w];for(h in m)o[h]=m[h];for(let b=0;b<y.length;b++)h=y[b],Object.prototype.hasOwnProperty.call(m,h)&&(o[h]=m[h])}}function v(o){var c=1;o=o.split(":");const h=[];for(;0<c&&o.length;)h.push(o.shift()),c--;return o.length&&h.push(o.join(":")),h}function R(o){u.setTimeout(()=>{throw o},0)}function _(){var o=ei;let c=null;return o.g&&(c=o.g,o.g=o.g.next,o.g||(o.h=null),c.next=null),c}class Kt{constructor(){this.h=this.g=null}add(c,h){const m=Pn.get();m.set(c,h),this.h?this.h.next=m:this.g=m,this.h=m}}var Pn=new z(()=>new Bh,o=>o.reset());class Bh{constructor(){this.next=this.g=this.h=null}set(c,h){this.h=c,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let Vn,Cn=!1,ei=new Kt,ia=()=>{const o=u.Promise.resolve(void 0);Vn=()=>{o.then(Uh)}};var Uh=()=>{for(var o;o=_();){try{o.h.call(o.g)}catch(h){R(h)}var c=Pn;c.j(o),100>c.h&&(c.h++,o.next=c.g,c.g=o)}Cn=!1};function te(){this.s=this.s,this.C=this.C}te.prototype.s=!1,te.prototype.ma=function(){this.s||(this.s=!0,this.N())},te.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Et(o,c){this.type=o,this.g=this.target=c,this.defaultPrevented=!1}Et.prototype.h=function(){this.defaultPrevented=!0};var qh=function(){if(!u.addEventListener||!Object.defineProperty)return!1;var o=!1,c=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};u.addEventListener("test",h,c),u.removeEventListener("test",h,c)}catch{}return o}();function Dn(o,c){if(Et.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,m=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=c,c=o.relatedTarget){if(et){t:{try{Y(c.nodeName);var w=!0;break t}catch{}w=!1}w||(c=null)}}else h=="mouseover"?c=o.fromElement:h=="mouseout"&&(c=o.toElement);this.relatedTarget=c,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:jh[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&Dn.aa.h.call(this)}}D(Dn,Et);var jh={2:"touch",3:"pen",4:"mouse"};Dn.prototype.h=function(){Dn.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Nr="closure_listenable_"+(1e6*Math.random()|0),zh=0;function Gh(o,c,h,m,w){this.listener=o,this.proxy=null,this.src=c,this.type=h,this.capture=!!m,this.ha=w,this.key=++zh,this.da=this.fa=!1}function kr(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Mr(o){this.src=o,this.g={},this.h=0}Mr.prototype.add=function(o,c,h,m,w){var b=o.toString();o=this.g[b],o||(o=this.g[b]=[],this.h++);var N=ri(o,c,m,w);return-1<N?(c=o[N],h||(c.fa=!1)):(c=new Gh(c,this.src,b,!!m,w),c.fa=h,o.push(c)),c};function ni(o,c){var h=c.type;if(h in o.g){var m=o.g[h],w=Array.prototype.indexOf.call(m,c,void 0),b;(b=0<=w)&&Array.prototype.splice.call(m,w,1),b&&(kr(c),o.g[h].length==0&&(delete o.g[h],o.h--))}}function ri(o,c,h,m){for(var w=0;w<o.length;++w){var b=o[w];if(!b.da&&b.listener==c&&b.capture==!!h&&b.ha==m)return w}return-1}var si="closure_lm_"+(1e6*Math.random()|0),ii={};function oa(o,c,h,m,w){if(Array.isArray(c)){for(var b=0;b<c.length;b++)oa(o,c[b],h,m,w);return null}return h=ca(h),o&&o[Nr]?o.K(c,h,d(m)?!!m.capture:!1,w):Kh(o,c,h,!1,m,w)}function Kh(o,c,h,m,w,b){if(!c)throw Error("Invalid event type");var N=d(w)?!!w.capture:!!w,tt=ai(o);if(tt||(o[si]=tt=new Mr(o)),h=tt.add(c,h,m,N,b),h.proxy)return h;if(m=$h(),h.proxy=m,m.src=o,m.listener=h,o.addEventListener)qh||(w=N),w===void 0&&(w=!1),o.addEventListener(c.toString(),m,w);else if(o.attachEvent)o.attachEvent(ua(c.toString()),m);else if(o.addListener&&o.removeListener)o.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return h}function $h(){function o(h){return c.call(o.src,o.listener,h)}const c=Qh;return o}function aa(o,c,h,m,w){if(Array.isArray(c))for(var b=0;b<c.length;b++)aa(o,c[b],h,m,w);else m=d(m)?!!m.capture:!!m,h=ca(h),o&&o[Nr]?(o=o.i,c=String(c).toString(),c in o.g&&(b=o.g[c],h=ri(b,h,m,w),-1<h&&(kr(b[h]),Array.prototype.splice.call(b,h,1),b.length==0&&(delete o.g[c],o.h--)))):o&&(o=ai(o))&&(c=o.g[c.toString()],o=-1,c&&(o=ri(c,h,m,w)),(h=-1<o?c[o]:null)&&oi(h))}function oi(o){if(typeof o!="number"&&o&&!o.da){var c=o.src;if(c&&c[Nr])ni(c.i,o);else{var h=o.type,m=o.proxy;c.removeEventListener?c.removeEventListener(h,m,o.capture):c.detachEvent?c.detachEvent(ua(h),m):c.addListener&&c.removeListener&&c.removeListener(m),(h=ai(c))?(ni(h,o),h.h==0&&(h.src=null,c[si]=null)):kr(o)}}}function ua(o){return o in ii?ii[o]:ii[o]="on"+o}function Qh(o,c){if(o.da)o=!0;else{c=new Dn(c,this);var h=o.listener,m=o.ha||o.src;o.fa&&oi(o),o=h.call(m,c)}return o}function ai(o){return o=o[si],o instanceof Mr?o:null}var ui="__closure_events_fn_"+(1e9*Math.random()>>>0);function ca(o){return typeof o=="function"?o:(o[ui]||(o[ui]=function(c){return o.handleEvent(c)}),o[ui])}function Tt(){te.call(this),this.i=new Mr(this),this.M=this,this.F=null}D(Tt,te),Tt.prototype[Nr]=!0,Tt.prototype.removeEventListener=function(o,c,h,m){aa(this,o,c,h,m)};function St(o,c){var h,m=o.F;if(m)for(h=[];m;m=m.F)h.push(m);if(o=o.M,m=c.type||c,typeof c=="string")c=new Et(c,o);else if(c instanceof Et)c.target=c.target||o;else{var w=c;c=new Et(m,o),T(c,w)}if(w=!0,h)for(var b=h.length-1;0<=b;b--){var N=c.g=h[b];w=Or(N,m,!0,c)&&w}if(N=c.g=o,w=Or(N,m,!0,c)&&w,w=Or(N,m,!1,c)&&w,h)for(b=0;b<h.length;b++)N=c.g=h[b],w=Or(N,m,!1,c)&&w}Tt.prototype.N=function(){if(Tt.aa.N.call(this),this.i){var o=this.i,c;for(c in o.g){for(var h=o.g[c],m=0;m<h.length;m++)kr(h[m]);delete o.g[c],o.h--}}this.F=null},Tt.prototype.K=function(o,c,h,m){return this.i.add(String(o),c,!1,h,m)},Tt.prototype.L=function(o,c,h,m){return this.i.add(String(o),c,!0,h,m)};function Or(o,c,h,m){if(c=o.i.g[String(c)],!c)return!0;c=c.concat();for(var w=!0,b=0;b<c.length;++b){var N=c[b];if(N&&!N.da&&N.capture==h){var tt=N.listener,_t=N.ha||N.src;N.fa&&ni(o.i,N),w=tt.call(_t,m)!==!1&&w}}return w&&!m.defaultPrevented}function la(o,c,h){if(typeof o=="function")h&&(o=I(o,h));else if(o&&typeof o.handleEvent=="function")o=I(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:u.setTimeout(o,c||0)}function ha(o){o.g=la(()=>{o.g=null,o.i&&(o.i=!1,ha(o))},o.l);const c=o.h;o.h=null,o.m.apply(null,c)}class Wh extends te{constructor(c,h){super(),this.m=c,this.l=h,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:ha(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function xn(o){te.call(this),this.h=o,this.g={}}D(xn,te);var da=[];function fa(o){W(o.g,function(c,h){this.g.hasOwnProperty(h)&&oi(c)},o),o.g={}}xn.prototype.N=function(){xn.aa.N.call(this),fa(this)},xn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ci=u.JSON.stringify,Hh=u.JSON.parse,Jh=class{stringify(o){return u.JSON.stringify(o,void 0)}parse(o){return u.JSON.parse(o,void 0)}};function li(){}li.prototype.h=null;function ma(o){return o.h||(o.h=o.i())}function pa(){}var Nn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function hi(){Et.call(this,"d")}D(hi,Et);function di(){Et.call(this,"c")}D(di,Et);var Te={},ga=null;function Fr(){return ga=ga||new Tt}Te.La="serverreachability";function _a(o){Et.call(this,Te.La,o)}D(_a,Et);function kn(o){const c=Fr();St(c,new _a(c))}Te.STAT_EVENT="statevent";function ya(o,c){Et.call(this,Te.STAT_EVENT,o),this.stat=c}D(ya,Et);function Pt(o){const c=Fr();St(c,new ya(c,o))}Te.Ma="timingevent";function Ia(o,c){Et.call(this,Te.Ma,o),this.size=c}D(Ia,Et);function Mn(o,c){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){o()},c)}function On(){this.g=!0}On.prototype.xa=function(){this.g=!1};function Yh(o,c,h,m,w,b){o.info(function(){if(o.g)if(b)for(var N="",tt=b.split("&"),_t=0;_t<tt.length;_t++){var H=tt[_t].split("=");if(1<H.length){var vt=H[0];H=H[1];var wt=vt.split("_");N=2<=wt.length&&wt[1]=="type"?N+(vt+"="+H+"&"):N+(vt+"=redacted&")}}else N=null;else N=b;return"XMLHTTP REQ ("+m+") [attempt "+w+"]: "+c+`
`+h+`
`+N})}function Xh(o,c,h,m,w,b,N){o.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+w+"]: "+c+`
`+h+`
`+b+" "+N})}function Ge(o,c,h,m){o.info(function(){return"XMLHTTP TEXT ("+c+"): "+td(o,h)+(m?" "+m:"")})}function Zh(o,c){o.info(function(){return"TIMEOUT: "+c})}On.prototype.info=function(){};function td(o,c){if(!o.g)return c;if(!c)return null;try{var h=JSON.parse(c);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var m=h[o];if(!(2>m.length)){var w=m[1];if(Array.isArray(w)&&!(1>w.length)){var b=w[0];if(b!="noop"&&b!="stop"&&b!="close")for(var N=1;N<w.length;N++)w[N]=""}}}}return ci(h)}catch{return c}}var Lr={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Ea={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},fi;function Br(){}D(Br,li),Br.prototype.g=function(){return new XMLHttpRequest},Br.prototype.i=function(){return{}},fi=new Br;function ee(o,c,h,m){this.j=o,this.i=c,this.l=h,this.R=m||1,this.U=new xn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Ta}function Ta(){this.i=null,this.g="",this.h=!1}var va={},mi={};function pi(o,c,h){o.L=1,o.v=zr($t(c)),o.m=h,o.P=!0,wa(o,null)}function wa(o,c){o.F=Date.now(),Ur(o),o.A=$t(o.v);var h=o.A,m=o.R;Array.isArray(m)||(m=[String(m)]),Fa(h.i,"t",m),o.C=0,h=o.j.J,o.h=new Ta,o.g=eu(o.j,h?c:null,!o.m),0<o.O&&(o.M=new Wh(I(o.Y,o,o.g),o.O)),c=o.U,h=o.g,m=o.ca;var w="readystatechange";Array.isArray(w)||(w&&(da[0]=w.toString()),w=da);for(var b=0;b<w.length;b++){var N=oa(h,w[b],m||c.handleEvent,!1,c.h||c);if(!N)break;c.g[N.key]=N}c=o.H?g(o.H):{},o.m?(o.u||(o.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,c)):(o.u="GET",o.g.ea(o.A,o.u,null,c)),kn(),Yh(o.i,o.u,o.A,o.l,o.R,o.m)}ee.prototype.ca=function(o){o=o.target;const c=this.M;c&&Qt(o)==3?c.j():this.Y(o)},ee.prototype.Y=function(o){try{if(o==this.g)t:{const wt=Qt(this.g);var c=this.g.Ba();const Qe=this.g.Z();if(!(3>wt)&&(wt!=3||this.g&&(this.h.h||this.g.oa()||Ga(this.g)))){this.J||wt!=4||c==7||(c==8||0>=Qe?kn(3):kn(2)),gi(this);var h=this.g.Z();this.X=h;e:if(Aa(this)){var m=Ga(this.g);o="";var w=m.length,b=Qt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){ve(this),Fn(this);var N="";break e}this.h.i=new u.TextDecoder}for(c=0;c<w;c++)this.h.h=!0,o+=this.h.i.decode(m[c],{stream:!(b&&c==w-1)});m.length=0,this.h.g+=o,this.C=0,N=this.h.g}else N=this.g.oa();if(this.o=h==200,Xh(this.i,this.u,this.A,this.l,this.R,wt,h),this.o){if(this.T&&!this.K){e:{if(this.g){var tt,_t=this.g;if((tt=_t.g?_t.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!j(tt)){var H=tt;break e}}H=null}if(h=H)Ge(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,_i(this,h);else{this.o=!1,this.s=3,Pt(12),ve(this),Fn(this);break t}}if(this.P){h=!0;let Bt;for(;!this.J&&this.C<N.length;)if(Bt=ed(this,N),Bt==mi){wt==4&&(this.s=4,Pt(14),h=!1),Ge(this.i,this.l,null,"[Incomplete Response]");break}else if(Bt==va){this.s=4,Pt(15),Ge(this.i,this.l,N,"[Invalid Chunk]"),h=!1;break}else Ge(this.i,this.l,Bt,null),_i(this,Bt);if(Aa(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),wt!=4||N.length!=0||this.h.h||(this.s=1,Pt(16),h=!1),this.o=this.o&&h,!h)Ge(this.i,this.l,N,"[Invalid Chunked Response]"),ve(this),Fn(this);else if(0<N.length&&!this.W){this.W=!0;var vt=this.j;vt.g==this&&vt.ba&&!vt.M&&(vt.j.info("Great, no buffering proxy detected. Bytes received: "+N.length),wi(vt),vt.M=!0,Pt(11))}}else Ge(this.i,this.l,N,null),_i(this,N);wt==4&&ve(this),this.o&&!this.J&&(wt==4?Ya(this.j,this):(this.o=!1,Ur(this)))}else yd(this.g),h==400&&0<N.indexOf("Unknown SID")?(this.s=3,Pt(12)):(this.s=0,Pt(13)),ve(this),Fn(this)}}}catch{}finally{}};function Aa(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function ed(o,c){var h=o.C,m=c.indexOf(`
`,h);return m==-1?mi:(h=Number(c.substring(h,m)),isNaN(h)?va:(m+=1,m+h>c.length?mi:(c=c.slice(m,m+h),o.C=m+h,c)))}ee.prototype.cancel=function(){this.J=!0,ve(this)};function Ur(o){o.S=Date.now()+o.I,Ra(o,o.I)}function Ra(o,c){if(o.B!=null)throw Error("WatchDog timer not null");o.B=Mn(I(o.ba,o),c)}function gi(o){o.B&&(u.clearTimeout(o.B),o.B=null)}ee.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Zh(this.i,this.A),this.L!=2&&(kn(),Pt(17)),ve(this),this.s=2,Fn(this)):Ra(this,this.S-o)};function Fn(o){o.j.G==0||o.J||Ya(o.j,o)}function ve(o){gi(o);var c=o.M;c&&typeof c.ma=="function"&&c.ma(),o.M=null,fa(o.U),o.g&&(c=o.g,o.g=null,c.abort(),c.ma())}function _i(o,c){try{var h=o.j;if(h.G!=0&&(h.g==o||yi(h.h,o))){if(!o.K&&yi(h.h,o)&&h.G==3){try{var m=h.Da.g.parse(c)}catch{m=null}if(Array.isArray(m)&&m.length==3){var w=m;if(w[0]==0){t:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)Hr(h),Qr(h);else break t;vi(h),Pt(18)}}else h.za=w[1],0<h.za-h.T&&37500>w[2]&&h.F&&h.v==0&&!h.C&&(h.C=Mn(I(h.Za,h),6e3));if(1>=Pa(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else Ae(h,11)}else if((o.K||h.g==o)&&Hr(h),!j(c))for(w=h.Da.g.parse(c),c=0;c<w.length;c++){let H=w[c];if(h.T=H[0],H=H[1],h.G==2)if(H[0]=="c"){h.K=H[1],h.ia=H[2];const vt=H[3];vt!=null&&(h.la=vt,h.j.info("VER="+h.la));const wt=H[4];wt!=null&&(h.Aa=wt,h.j.info("SVER="+h.Aa));const Qe=H[5];Qe!=null&&typeof Qe=="number"&&0<Qe&&(m=1.5*Qe,h.L=m,h.j.info("backChannelRequestTimeoutMs_="+m)),m=h;const Bt=o.g;if(Bt){const Yr=Bt.g?Bt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Yr){var b=m.h;b.g||Yr.indexOf("spdy")==-1&&Yr.indexOf("quic")==-1&&Yr.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(Ii(b,b.h),b.h=null))}if(m.D){const Ai=Bt.g?Bt.g.getResponseHeader("X-HTTP-Session-Id"):null;Ai&&(m.ya=Ai,rt(m.I,m.D,Ai))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),m=h;var N=o;if(m.qa=tu(m,m.J?m.ia:null,m.W),N.K){Va(m.h,N);var tt=N,_t=m.L;_t&&(tt.I=_t),tt.B&&(gi(tt),Ur(tt)),m.g=N}else Ha(m);0<h.i.length&&Wr(h)}else H[0]!="stop"&&H[0]!="close"||Ae(h,7);else h.G==3&&(H[0]=="stop"||H[0]=="close"?H[0]=="stop"?Ae(h,7):Ti(h):H[0]!="noop"&&h.l&&h.l.ta(H),h.v=0)}}kn(4)}catch{}}var nd=class{constructor(o,c){this.g=o,this.map=c}};function ba(o){this.l=o||10,u.PerformanceNavigationTiming?(o=u.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Sa(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Pa(o){return o.h?1:o.g?o.g.size:0}function yi(o,c){return o.h?o.h==c:o.g?o.g.has(c):!1}function Ii(o,c){o.g?o.g.add(c):o.h=c}function Va(o,c){o.h&&o.h==c?o.h=null:o.g&&o.g.has(c)&&o.g.delete(c)}ba.prototype.cancel=function(){if(this.i=Ca(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Ca(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let c=o.i;for(const h of o.g.values())c=c.concat(h.D);return c}return k(o.i)}function rd(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(l(o)){for(var c=[],h=o.length,m=0;m<h;m++)c.push(o[m]);return c}c=[],h=0;for(m in o)c[h++]=o[m];return c}function sd(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(l(o)||typeof o=="string"){var c=[];o=o.length;for(var h=0;h<o;h++)c.push(h);return c}c=[],h=0;for(const m in o)c[h++]=m;return c}}}function Da(o,c){if(o.forEach&&typeof o.forEach=="function")o.forEach(c,void 0);else if(l(o)||typeof o=="string")Array.prototype.forEach.call(o,c,void 0);else for(var h=sd(o),m=rd(o),w=m.length,b=0;b<w;b++)c.call(void 0,m[b],h&&h[b],o)}var xa=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function id(o,c){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var m=o[h].indexOf("="),w=null;if(0<=m){var b=o[h].substring(0,m);w=o[h].substring(m+1)}else b=o[h];c(b,w?decodeURIComponent(w.replace(/\+/g," ")):"")}}}function we(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof we){this.h=o.h,qr(this,o.j),this.o=o.o,this.g=o.g,jr(this,o.s),this.l=o.l;var c=o.i,h=new Un;h.i=c.i,c.g&&(h.g=new Map(c.g),h.h=c.h),Na(this,h),this.m=o.m}else o&&(c=String(o).match(xa))?(this.h=!1,qr(this,c[1]||"",!0),this.o=Ln(c[2]||""),this.g=Ln(c[3]||"",!0),jr(this,c[4]),this.l=Ln(c[5]||"",!0),Na(this,c[6]||"",!0),this.m=Ln(c[7]||"")):(this.h=!1,this.i=new Un(null,this.h))}we.prototype.toString=function(){var o=[],c=this.j;c&&o.push(Bn(c,ka,!0),":");var h=this.g;return(h||c=="file")&&(o.push("//"),(c=this.o)&&o.push(Bn(c,ka,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(Bn(h,h.charAt(0)=="/"?ud:ad,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",Bn(h,ld)),o.join("")};function $t(o){return new we(o)}function qr(o,c,h){o.j=h?Ln(c,!0):c,o.j&&(o.j=o.j.replace(/:$/,""))}function jr(o,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);o.s=c}else o.s=null}function Na(o,c,h){c instanceof Un?(o.i=c,hd(o.i,o.h)):(h||(c=Bn(c,cd)),o.i=new Un(c,o.h))}function rt(o,c,h){o.i.set(c,h)}function zr(o){return rt(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function Ln(o,c){return o?c?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Bn(o,c,h){return typeof o=="string"?(o=encodeURI(o).replace(c,od),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function od(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var ka=/[#\/\?@]/g,ad=/[#\?:]/g,ud=/[#\?]/g,cd=/[#\?@]/g,ld=/#/g;function Un(o,c){this.h=this.g=null,this.i=o||null,this.j=!!c}function ne(o){o.g||(o.g=new Map,o.h=0,o.i&&id(o.i,function(c,h){o.add(decodeURIComponent(c.replace(/\+/g," ")),h)}))}r=Un.prototype,r.add=function(o,c){ne(this),this.i=null,o=Ke(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(c),this.h+=1,this};function Ma(o,c){ne(o),c=Ke(o,c),o.g.has(c)&&(o.i=null,o.h-=o.g.get(c).length,o.g.delete(c))}function Oa(o,c){return ne(o),c=Ke(o,c),o.g.has(c)}r.forEach=function(o,c){ne(this),this.g.forEach(function(h,m){h.forEach(function(w){o.call(c,w,m,this)},this)},this)},r.na=function(){ne(this);const o=Array.from(this.g.values()),c=Array.from(this.g.keys()),h=[];for(let m=0;m<c.length;m++){const w=o[m];for(let b=0;b<w.length;b++)h.push(c[m])}return h},r.V=function(o){ne(this);let c=[];if(typeof o=="string")Oa(this,o)&&(c=c.concat(this.g.get(Ke(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)c=c.concat(o[h])}return c},r.set=function(o,c){return ne(this),this.i=null,o=Ke(this,o),Oa(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[c]),this.h+=1,this},r.get=function(o,c){return o?(o=this.V(o),0<o.length?String(o[0]):c):c};function Fa(o,c,h){Ma(o,c),0<h.length&&(o.i=null,o.g.set(Ke(o,c),k(h)),o.h+=h.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],c=Array.from(this.g.keys());for(var h=0;h<c.length;h++){var m=c[h];const b=encodeURIComponent(String(m)),N=this.V(m);for(m=0;m<N.length;m++){var w=b;N[m]!==""&&(w+="="+encodeURIComponent(String(N[m]))),o.push(w)}}return this.i=o.join("&")};function Ke(o,c){return c=String(c),o.j&&(c=c.toLowerCase()),c}function hd(o,c){c&&!o.j&&(ne(o),o.i=null,o.g.forEach(function(h,m){var w=m.toLowerCase();m!=w&&(Ma(this,m),Fa(this,w,h))},o)),o.j=c}function dd(o,c){const h=new On;if(u.Image){const m=new Image;m.onload=S(re,h,"TestLoadImage: loaded",!0,c,m),m.onerror=S(re,h,"TestLoadImage: error",!1,c,m),m.onabort=S(re,h,"TestLoadImage: abort",!1,c,m),m.ontimeout=S(re,h,"TestLoadImage: timeout",!1,c,m),u.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=o}else c(!1)}function fd(o,c){const h=new On,m=new AbortController,w=setTimeout(()=>{m.abort(),re(h,"TestPingServer: timeout",!1,c)},1e4);fetch(o,{signal:m.signal}).then(b=>{clearTimeout(w),b.ok?re(h,"TestPingServer: ok",!0,c):re(h,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(w),re(h,"TestPingServer: error",!1,c)})}function re(o,c,h,m,w){try{w&&(w.onload=null,w.onerror=null,w.onabort=null,w.ontimeout=null),m(h)}catch{}}function md(){this.g=new Jh}function pd(o,c,h){const m=h||"";try{Da(o,function(w,b){let N=w;d(w)&&(N=ci(w)),c.push(m+b+"="+encodeURIComponent(N))})}catch(w){throw c.push(m+"type="+encodeURIComponent("_badmap")),w}}function Gr(o){this.l=o.Ub||null,this.j=o.eb||!1}D(Gr,li),Gr.prototype.g=function(){return new Kr(this.l,this.j)},Gr.prototype.i=function(o){return function(){return o}}({});function Kr(o,c){Tt.call(this),this.D=o,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}D(Kr,Tt),r=Kr.prototype,r.open=function(o,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=c,this.readyState=1,jn(this)},r.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(c.body=o),(this.D||u).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,qn(this)),this.readyState=0},r.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,jn(this)),this.g&&(this.readyState=3,jn(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;La(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function La(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}r.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var c=o.value?o.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!o.done}))&&(this.response=this.responseText+=c)}o.done?qn(this):jn(this),this.readyState==3&&La(this)}},r.Ra=function(o){this.g&&(this.response=this.responseText=o,qn(this))},r.Qa=function(o){this.g&&(this.response=o,qn(this))},r.ga=function(){this.g&&qn(this)};function qn(o){o.readyState=4,o.l=null,o.j=null,o.v=null,jn(o)}r.setRequestHeader=function(o,c){this.u.append(o,c)},r.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],c=this.h.entries();for(var h=c.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=c.next();return o.join(`\r
`)};function jn(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Kr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Ba(o){let c="";return W(o,function(h,m){c+=m,c+=":",c+=h,c+=`\r
`}),c}function Ei(o,c,h){t:{for(m in h){var m=!1;break t}m=!0}m||(h=Ba(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):rt(o,c,h))}function ct(o){Tt.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}D(ct,Tt);var gd=/^https?$/i,_d=["POST","PUT"];r=ct.prototype,r.Ha=function(o){this.J=o},r.ea=function(o,c,h,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);c=c?c.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():fi.g(),this.v=this.o?ma(this.o):ma(fi),this.g.onreadystatechange=I(this.Ea,this);try{this.B=!0,this.g.open(c,String(o),!0),this.B=!1}catch(b){Ua(this,b);return}if(o=h||"",h=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var w in m)h.set(w,m[w]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const b of m.keys())h.set(b,m.get(b));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(h.keys()).find(b=>b.toLowerCase()=="content-type"),w=u.FormData&&o instanceof u.FormData,!(0<=Array.prototype.indexOf.call(_d,c,void 0))||m||w||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[b,N]of h)this.g.setRequestHeader(b,N);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{za(this),this.u=!0,this.g.send(o),this.u=!1}catch(b){Ua(this,b)}};function Ua(o,c){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=c,o.m=5,qa(o),$r(o)}function qa(o){o.A||(o.A=!0,St(o,"complete"),St(o,"error"))}r.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,St(this,"complete"),St(this,"abort"),$r(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),$r(this,!0)),ct.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?ja(this):this.bb())},r.bb=function(){ja(this)};function ja(o){if(o.h&&typeof a<"u"&&(!o.v[1]||Qt(o)!=4||o.Z()!=2)){if(o.u&&Qt(o)==4)la(o.Ea,0,o);else if(St(o,"readystatechange"),Qt(o)==4){o.h=!1;try{const N=o.Z();t:switch(N){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break t;default:c=!1}var h;if(!(h=c)){var m;if(m=N===0){var w=String(o.D).match(xa)[1]||null;!w&&u.self&&u.self.location&&(w=u.self.location.protocol.slice(0,-1)),m=!gd.test(w?w.toLowerCase():"")}h=m}if(h)St(o,"complete"),St(o,"success");else{o.m=6;try{var b=2<Qt(o)?o.g.statusText:""}catch{b=""}o.l=b+" ["+o.Z()+"]",qa(o)}}finally{$r(o)}}}}function $r(o,c){if(o.g){za(o);const h=o.g,m=o.v[0]?()=>{}:null;o.g=null,o.v=null,c||St(o,"ready");try{h.onreadystatechange=m}catch{}}}function za(o){o.I&&(u.clearTimeout(o.I),o.I=null)}r.isActive=function(){return!!this.g};function Qt(o){return o.g?o.g.readyState:0}r.Z=function(){try{return 2<Qt(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(o){if(this.g){var c=this.g.responseText;return o&&c.indexOf(o)==0&&(c=c.substring(o.length)),Hh(c)}};function Ga(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function yd(o){const c={};o=(o.g&&2<=Qt(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<o.length;m++){if(j(o[m]))continue;var h=v(o[m]);const w=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const b=c[w]||[];c[w]=b,b.push(h)}E(c,function(m){return m.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function zn(o,c,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||c}function Ka(o){this.Aa=0,this.i=[],this.j=new On,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=zn("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=zn("baseRetryDelayMs",5e3,o),this.cb=zn("retryDelaySeedMs",1e4,o),this.Wa=zn("forwardChannelMaxRetries",2,o),this.wa=zn("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new ba(o&&o.concurrentRequestLimit),this.Da=new md,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=Ka.prototype,r.la=8,r.G=1,r.connect=function(o,c,h,m){Pt(0),this.W=o,this.H=c||{},h&&m!==void 0&&(this.H.OSID=h,this.H.OAID=m),this.F=this.X,this.I=tu(this,null,this.W),Wr(this)};function Ti(o){if($a(o),o.G==3){var c=o.U++,h=$t(o.I);if(rt(h,"SID",o.K),rt(h,"RID",c),rt(h,"TYPE","terminate"),Gn(o,h),c=new ee(o,o.j,c),c.L=2,c.v=zr($t(h)),h=!1,u.navigator&&u.navigator.sendBeacon)try{h=u.navigator.sendBeacon(c.v.toString(),"")}catch{}!h&&u.Image&&(new Image().src=c.v,h=!0),h||(c.g=eu(c.j,null),c.g.ea(c.v)),c.F=Date.now(),Ur(c)}Za(o)}function Qr(o){o.g&&(wi(o),o.g.cancel(),o.g=null)}function $a(o){Qr(o),o.u&&(u.clearTimeout(o.u),o.u=null),Hr(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&u.clearTimeout(o.s),o.s=null)}function Wr(o){if(!Sa(o.h)&&!o.s){o.s=!0;var c=o.Ga;Vn||ia(),Cn||(Vn(),Cn=!0),ei.add(c,o),o.B=0}}function Id(o,c){return Pa(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=c.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=Mn(I(o.Ga,o,c),Xa(o,o.B)),o.B++,!0)}r.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const w=new ee(this,this.j,o);let b=this.o;if(this.S&&(b?(b=g(b),T(b,this.S)):b=this.S),this.m!==null||this.O||(w.H=b,b=null),this.P)t:{for(var c=0,h=0;h<this.i.length;h++){e:{var m=this.i[h];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break e}m=void 0}if(m===void 0)break;if(c+=m,4096<c){c=h;break t}if(c===4096||h===this.i.length-1){c=h+1;break t}}c=1e3}else c=1e3;c=Wa(this,w,c),h=$t(this.I),rt(h,"RID",o),rt(h,"CVER",22),this.D&&rt(h,"X-HTTP-Session-Id",this.D),Gn(this,h),b&&(this.O?c="headers="+encodeURIComponent(String(Ba(b)))+"&"+c:this.m&&Ei(h,this.m,b)),Ii(this.h,w),this.Ua&&rt(h,"TYPE","init"),this.P?(rt(h,"$req",c),rt(h,"SID","null"),w.T=!0,pi(w,h,null)):pi(w,h,c),this.G=2}}else this.G==3&&(o?Qa(this,o):this.i.length==0||Sa(this.h)||Qa(this))};function Qa(o,c){var h;c?h=c.l:h=o.U++;const m=$t(o.I);rt(m,"SID",o.K),rt(m,"RID",h),rt(m,"AID",o.T),Gn(o,m),o.m&&o.o&&Ei(m,o.m,o.o),h=new ee(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),c&&(o.i=c.D.concat(o.i)),c=Wa(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),Ii(o.h,h),pi(h,m,c)}function Gn(o,c){o.H&&W(o.H,function(h,m){rt(c,m,h)}),o.l&&Da({},function(h,m){rt(c,m,h)})}function Wa(o,c,h){h=Math.min(o.i.length,h);var m=o.l?I(o.l.Na,o.l,o):null;t:{var w=o.i;let b=-1;for(;;){const N=["count="+h];b==-1?0<h?(b=w[0].g,N.push("ofs="+b)):b=0:N.push("ofs="+b);let tt=!0;for(let _t=0;_t<h;_t++){let H=w[_t].g;const vt=w[_t].map;if(H-=b,0>H)b=Math.max(0,w[_t].g-100),tt=!1;else try{pd(vt,N,"req"+H+"_")}catch{m&&m(vt)}}if(tt){m=N.join("&");break t}}}return o=o.i.splice(0,h),c.D=o,m}function Ha(o){if(!o.g&&!o.u){o.Y=1;var c=o.Fa;Vn||ia(),Cn||(Vn(),Cn=!0),ei.add(c,o),o.v=0}}function vi(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=Mn(I(o.Fa,o),Xa(o,o.v)),o.v++,!0)}r.Fa=function(){if(this.u=null,Ja(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=Mn(I(this.ab,this),o)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Pt(10),Qr(this),Ja(this))};function wi(o){o.A!=null&&(u.clearTimeout(o.A),o.A=null)}function Ja(o){o.g=new ee(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var c=$t(o.qa);rt(c,"RID","rpc"),rt(c,"SID",o.K),rt(c,"AID",o.T),rt(c,"CI",o.F?"0":"1"),!o.F&&o.ja&&rt(c,"TO",o.ja),rt(c,"TYPE","xmlhttp"),Gn(o,c),o.m&&o.o&&Ei(c,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=zr($t(c)),h.m=null,h.P=!0,wa(h,o)}r.Za=function(){this.C!=null&&(this.C=null,Qr(this),vi(this),Pt(19))};function Hr(o){o.C!=null&&(u.clearTimeout(o.C),o.C=null)}function Ya(o,c){var h=null;if(o.g==c){Hr(o),wi(o),o.g=null;var m=2}else if(yi(o.h,c))h=c.D,Va(o.h,c),m=1;else return;if(o.G!=0){if(c.o)if(m==1){h=c.m?c.m.length:0,c=Date.now()-c.F;var w=o.B;m=Fr(),St(m,new Ia(m,h)),Wr(o)}else Ha(o);else if(w=c.s,w==3||w==0&&0<c.X||!(m==1&&Id(o,c)||m==2&&vi(o)))switch(h&&0<h.length&&(c=o.h,c.i=c.i.concat(h)),w){case 1:Ae(o,5);break;case 4:Ae(o,10);break;case 3:Ae(o,6);break;default:Ae(o,2)}}}function Xa(o,c){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*c}function Ae(o,c){if(o.j.info("Error code "+c),c==2){var h=I(o.fb,o),m=o.Xa;const w=!m;m=new we(m||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||qr(m,"https"),zr(m),w?dd(m.toString(),h):fd(m.toString(),h)}else Pt(2);o.G=0,o.l&&o.l.sa(c),Za(o),$a(o)}r.fb=function(o){o?(this.j.info("Successfully pinged google.com"),Pt(2)):(this.j.info("Failed to ping google.com"),Pt(1))};function Za(o){if(o.G=0,o.ka=[],o.l){const c=Ca(o.h);(c.length!=0||o.i.length!=0)&&(x(o.ka,c),x(o.ka,o.i),o.h.i.length=0,k(o.i),o.i.length=0),o.l.ra()}}function tu(o,c,h){var m=h instanceof we?$t(h):new we(h);if(m.g!="")c&&(m.g=c+"."+m.g),jr(m,m.s);else{var w=u.location;m=w.protocol,c=c?c+"."+w.hostname:w.hostname,w=+w.port;var b=new we(null);m&&qr(b,m),c&&(b.g=c),w&&jr(b,w),h&&(b.l=h),m=b}return h=o.D,c=o.ya,h&&c&&rt(m,h,c),rt(m,"VER",o.la),Gn(o,m),m}function eu(o,c,h){if(c&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=o.Ca&&!o.pa?new ct(new Gr({eb:h})):new ct(o.pa),c.Ha(o.J),c}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function nu(){}r=nu.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function Jr(){}Jr.prototype.g=function(o,c){return new Nt(o,c)};function Nt(o,c){Tt.call(this),this.g=new Ka(c),this.l=o,this.h=c&&c.messageUrlParams||null,o=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(o?o["X-WebChannel-Content-Type"]=c.messageContentType:o={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(o?o["X-WebChannel-Client-Profile"]=c.va:o={"X-WebChannel-Client-Profile":c.va}),this.g.S=o,(o=c&&c.Sb)&&!j(o)&&(this.g.m=o),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!j(c)&&(this.g.D=c,o=this.h,o!==null&&c in o&&(o=this.h,c in o&&delete o[c])),this.j=new $e(this)}D(Nt,Tt),Nt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Nt.prototype.close=function(){Ti(this.g)},Nt.prototype.o=function(o){var c=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=ci(o),o=h);c.i.push(new nd(c.Ya++,o)),c.G==3&&Wr(c)},Nt.prototype.N=function(){this.g.l=null,delete this.j,Ti(this.g),delete this.g,Nt.aa.N.call(this)};function ru(o){hi.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var c=o.__sm__;if(c){t:{for(const h in c){o=h;break t}o=void 0}(this.i=o)&&(o=this.i,c=c!==null&&o in c?c[o]:void 0),this.data=c}else this.data=o}D(ru,hi);function su(){di.call(this),this.status=1}D(su,di);function $e(o){this.g=o}D($e,nu),$e.prototype.ua=function(){St(this.g,"a")},$e.prototype.ta=function(o){St(this.g,new ru(o))},$e.prototype.sa=function(o){St(this.g,new su)},$e.prototype.ra=function(){St(this.g,"b")},Jr.prototype.createWebChannel=Jr.prototype.g,Nt.prototype.send=Nt.prototype.o,Nt.prototype.open=Nt.prototype.m,Nt.prototype.close=Nt.prototype.close,jc=function(){return new Jr},qc=function(){return Fr()},Uc=Te,qi={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Lr.NO_ERROR=0,Lr.TIMEOUT=8,Lr.HTTP_ERROR=6,ss=Lr,Ea.COMPLETE="complete",Bc=Ea,pa.EventType=Nn,Nn.OPEN="a",Nn.CLOSE="b",Nn.ERROR="c",Nn.MESSAGE="d",Tt.prototype.listen=Tt.prototype.K,Jn=pa,ct.prototype.listenOnce=ct.prototype.L,ct.prototype.getLastError=ct.prototype.Ka,ct.prototype.getLastErrorCode=ct.prototype.Ba,ct.prototype.getStatus=ct.prototype.Z,ct.prototype.getResponseJson=ct.prototype.Oa,ct.prototype.getResponseText=ct.prototype.oa,ct.prototype.send=ct.prototype.ea,ct.prototype.setWithCredentials=ct.prototype.Ha,Lc=ct}).apply(typeof Xr<"u"?Xr:typeof self<"u"?self:typeof window<"u"?window:{});const gu="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}Rt.UNAUTHENTICATED=new Rt(null),Rt.GOOGLE_CREDENTIALS=new Rt("google-credentials-uid"),Rt.FIRST_PARTY=new Rt("first-party-uid"),Rt.MOCK_USER=new Rt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let En="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ke=new xc("@firebase/firestore");function Xe(){return ke.logLevel}function V(r,...t){if(ke.logLevel<=Q.DEBUG){const e=t.map(lo);ke.debug(`Firestore (${En}): ${r}`,...e)}}function ht(r,...t){if(ke.logLevel<=Q.ERROR){const e=t.map(lo);ke.error(`Firestore (${En}): ${r}`,...e)}}function an(r,...t){if(ke.logLevel<=Q.WARN){const e=t.map(lo);ke.warn(`Firestore (${En}): ${r}`,...e)}}function lo(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(e){return JSON.stringify(e)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function O(r="Unexpected state"){const t=`FIRESTORE (${En}) INTERNAL ASSERTION FAILED: `+r;throw ht(t),new Error(t)}function L(r,t){r||O()}function F(r,t){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class C extends In{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yf{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class zc{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(Rt.UNAUTHENTICATED))}shutdown(){}}class Xf{constructor(t){this.t=t,this.currentUser=Rt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){L(this.o===void 0);let n=this.i;const s=l=>this.i!==n?(n=this.i,e(l)):Promise.resolve();let i=new Ut;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Ut,t.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const l=i;t.enqueueRetryable(async()=>{await l.promise,await s(this.currentUser)})},u=l=>{V("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?u(l):(V("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Ut)}},0),a()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(n=>this.i!==t?(V("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(L(typeof n.accessToken=="string"),new Yf(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return L(t===null||typeof t=="string"),new Rt(t)}}class Zf{constructor(t,e,n){this.l=t,this.h=e,this.P=n,this.type="FirstParty",this.user=Rt.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const t=this.T();return t&&this.I.set("Authorization",t),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class tm{constructor(t,e,n){this.l=t,this.h=e,this.P=n}getToken(){return Promise.resolve(new Zf(this.l,this.h,this.P))}start(t,e){t.enqueueRetryable(()=>e(Rt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class em{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class nm{constructor(t){this.A=t,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(t,e){L(this.o===void 0);const n=i=>{i.error!=null&&V("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,V("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?e(i.token):Promise.resolve()};this.o=i=>{t.enqueueRetryable(()=>n(i))};const s=i=>{V("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):V("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(e=>e?(L(typeof e.token=="string"),this.R=e.token,new em(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rm(r){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(r);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let n=0;n<r;n++)e[n]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ho{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=Math.floor(256/t.length)*t.length;let n="";for(;n.length<20;){const s=rm(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<e&&(n+=t.charAt(s[i]%t.length))}return n}}function q(r,t){return r<t?-1:r>t?1:0}function un(r,t,e){return r.length===t.length&&r.every((n,s)=>e(n,t[s]))}function Gc(r){return r+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ut{constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new C(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new C(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<-62135596800)throw new C(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new C(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}static now(){return ut.fromMillis(Date.now())}static fromDate(t){return ut.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor(1e6*(t-1e3*e));return new ut(e,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(t){return this.seconds===t.seconds?q(this.nanoseconds,t.nanoseconds):q(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const t=this.seconds- -62135596800;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(t){this.timestamp=t}static fromTimestamp(t){return new B(t)}static min(){return new B(new ut(0,0))}static max(){return new B(new ut(253402300799,999999999))}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cr{constructor(t,e,n){e===void 0?e=0:e>t.length&&O(),n===void 0?n=t.length-e:n>t.length-e&&O(),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return cr.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof cr?t.forEach(n=>{e.push(n)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let s=0;s<n;s++){const i=t.get(s),a=e.get(s);if(i<a)return-1;if(i>a)return 1}return t.length<e.length?-1:t.length>e.length?1:0}}class J extends cr{construct(t,e,n){return new J(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new C(P.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter(s=>s.length>0))}return new J(e)}static emptyPath(){return new J([])}}const sm=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ot extends cr{construct(t,e,n){return new ot(t,e,n)}static isValidIdentifier(t){return sm.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ot.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new ot(["__name__"])}static fromServerFormat(t){const e=[];let n="",s=0;const i=()=>{if(n.length===0)throw new C(P.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let a=!1;for(;s<t.length;){const u=t[s];if(u==="\\"){if(s+1===t.length)throw new C(P.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const l=t[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new C(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=l,s+=2}else u==="`"?(a=!a,s++):u!=="."||a?(n+=u,s++):(i(),s++)}if(i(),a)throw new C(P.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new ot(e)}static emptyPath(){return new ot([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M{constructor(t){this.path=t}static fromPath(t){return new M(J.fromString(t))}static fromName(t){return new M(J.fromString(t).popFirst(5))}static empty(){return new M(J.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&J.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return J.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new M(new J(t.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ps{constructor(t,e,n,s){this.indexId=t,this.collectionGroup=e,this.fields=n,this.indexState=s}}function ji(r){return r.fields.find(t=>t.kind===2)}function Se(r){return r.fields.filter(t=>t.kind!==2)}ps.UNKNOWN_ID=-1;class is{constructor(t,e){this.fieldPath=t,this.kind=e}}class lr{constructor(t,e){this.sequenceNumber=t,this.offset=e}static empty(){return new lr(0,Ft.min())}}function Kc(r,t){const e=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=B.fromTimestamp(n===1e9?new ut(e+1,0):new ut(e,n));return new Ft(s,M.empty(),t)}function $c(r){return new Ft(r.readTime,r.key,-1)}class Ft{constructor(t,e,n){this.readTime=t,this.documentKey=e,this.largestBatchId=n}static min(){return new Ft(B.min(),M.empty(),-1)}static max(){return new Ft(B.max(),M.empty(),-1)}}function fo(r,t){let e=r.readTime.compareTo(t.readTime);return e!==0?e:(e=M.comparator(r.documentKey,t.documentKey),e!==0?e:q(r.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qc="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Wc{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _e(r){if(r.code!==P.FAILED_PRECONDITION||r.message!==Qc)throw r;V("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&O(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new A((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(t,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(e,i).next(n,s)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof A?e:A.resolve(e)}catch(e){return A.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):A.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):A.reject(e)}static resolve(t){return new A((e,n)=>{e(t)})}static reject(t){return new A((e,n)=>{n(t)})}static waitFor(t){return new A((e,n)=>{let s=0,i=0,a=!1;t.forEach(u=>{++s,u.next(()=>{++i,a&&i===s&&e()},l=>n(l))}),a=!0,i===s&&e()})}static or(t){let e=A.resolve(!1);for(const n of t)e=e.next(s=>s?A.resolve(s):n());return e}static forEach(t,e){const n=[];return t.forEach((s,i)=>{n.push(e.call(this,s,i))}),this.waitFor(n)}static mapArray(t,e){return new A((n,s)=>{const i=t.length,a=new Array(i);let u=0;for(let l=0;l<i;l++){const d=l;e(t[d]).next(f=>{a[d]=f,++u,u===i&&n(a)},f=>s(f))}})}static doWhile(t,e){return new A((n,s)=>{const i=()=>{t()===!0?e().next(()=>{i()},s):n()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cs{constructor(t,e){this.action=t,this.transaction=e,this.aborted=!1,this.V=new Ut,this.transaction.oncomplete=()=>{this.V.resolve()},this.transaction.onabort=()=>{e.error?this.V.reject(new tr(t,e.error)):this.V.resolve()},this.transaction.onerror=n=>{const s=mo(n.target.error);this.V.reject(new tr(t,s))}}static open(t,e,n,s){try{return new Cs(e,t.transaction(s,n))}catch(i){throw new tr(e,i)}}get m(){return this.V.promise}abort(t){t&&this.V.reject(t),this.aborted||(V("SimpleDb","Aborting transaction:",t?t.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}g(){const t=this.transaction;this.aborted||typeof t.commit!="function"||t.commit()}store(t){const e=this.transaction.objectStore(t);return new om(e)}}class he{constructor(t,e,n){this.name=t,this.version=e,this.p=n,he.S(on())===12.2&&ht("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}static delete(t){return V("SimpleDb","Removing database:",t),Pe(window.indexedDB.deleteDatabase(t)).toPromise()}static D(){if(!Cc())return!1;if(he.v())return!0;const t=on(),e=he.S(t),n=0<e&&e<10,s=Hc(t),i=0<s&&s<4.5;return!(t.indexOf("MSIE ")>0||t.indexOf("Trident/")>0||t.indexOf("Edge/")>0||n||i)}static v(){var t;return typeof process<"u"&&((t=process.__PRIVATE_env)===null||t===void 0?void 0:t.C)==="YES"}static F(t,e){return t.store(e)}static S(t){const e=t.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=e?e[1].split("_").slice(0,2).join("."):"-1";return Number(n)}async M(t){return this.db||(V("SimpleDb","Opening database:",this.name),this.db=await new Promise((e,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const a=i.target.result;e(a)},s.onblocked=()=>{n(new tr(t,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const a=i.target.error;a.name==="VersionError"?n(new C(P.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):a.name==="InvalidStateError"?n(new C(P.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+a)):n(new tr(t,a))},s.onupgradeneeded=i=>{V("SimpleDb",'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const a=i.target.result;this.p.O(a,s.transaction,i.oldVersion,this.version).next(()=>{V("SimpleDb","Database upgrade to version "+this.version+" complete")})}})),this.N&&(this.db.onversionchange=e=>this.N(e)),this.db}L(t){this.N=t,this.db&&(this.db.onversionchange=e=>t(e))}async runTransaction(t,e,n,s){const i=e==="readonly";let a=0;for(;;){++a;try{this.db=await this.M(t);const u=Cs.open(this.db,t,i?"readonly":"readwrite",n),l=s(u).next(d=>(u.g(),d)).catch(d=>(u.abort(d),A.reject(d))).toPromise();return l.catch(()=>{}),await u.m,l}catch(u){const l=u,d=l.name!=="FirebaseError"&&a<3;if(V("SimpleDb","Transaction failed with error:",l.message,"Retrying:",d),this.close(),!d)return Promise.reject(l)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Hc(r){const t=r.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}class im{constructor(t){this.B=t,this.k=!1,this.q=null}get isDone(){return this.k}get K(){return this.q}set cursor(t){this.B=t}done(){this.k=!0}$(t){this.q=t}delete(){return Pe(this.B.delete())}}class tr extends C{constructor(t,e){super(P.UNAVAILABLE,`IndexedDB transaction '${t}' failed: ${e}`),this.name="IndexedDbTransactionError"}}function ye(r){return r.name==="IndexedDbTransactionError"}class om{constructor(t){this.store=t}put(t,e){let n;return e!==void 0?(V("SimpleDb","PUT",this.store.name,t,e),n=this.store.put(e,t)):(V("SimpleDb","PUT",this.store.name,"<auto-key>",t),n=this.store.put(t)),Pe(n)}add(t){return V("SimpleDb","ADD",this.store.name,t,t),Pe(this.store.add(t))}get(t){return Pe(this.store.get(t)).next(e=>(e===void 0&&(e=null),V("SimpleDb","GET",this.store.name,t,e),e))}delete(t){return V("SimpleDb","DELETE",this.store.name,t),Pe(this.store.delete(t))}count(){return V("SimpleDb","COUNT",this.store.name),Pe(this.store.count())}U(t,e){const n=this.options(t,e),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new A((a,u)=>{i.onerror=l=>{u(l.target.error)},i.onsuccess=l=>{a(l.target.result)}})}{const i=this.cursor(n),a=[];return this.W(i,(u,l)=>{a.push(l)}).next(()=>a)}}G(t,e){const n=this.store.getAll(t,e===null?void 0:e);return new A((s,i)=>{n.onerror=a=>{i(a.target.error)},n.onsuccess=a=>{s(a.target.result)}})}j(t,e){V("SimpleDb","DELETE ALL",this.store.name);const n=this.options(t,e);n.H=!1;const s=this.cursor(n);return this.W(s,(i,a,u)=>u.delete())}J(t,e){let n;e?n=t:(n={},e=t);const s=this.cursor(n);return this.W(s,e)}Y(t){const e=this.cursor({});return new A((n,s)=>{e.onerror=i=>{const a=mo(i.target.error);s(a)},e.onsuccess=i=>{const a=i.target.result;a?t(a.primaryKey,a.value).next(u=>{u?a.continue():n()}):n()}})}W(t,e){const n=[];return new A((s,i)=>{t.onerror=a=>{i(a.target.error)},t.onsuccess=a=>{const u=a.target.result;if(!u)return void s();const l=new im(u),d=e(u.primaryKey,u.value,l);if(d instanceof A){const f=d.catch(p=>(l.done(),A.reject(p)));n.push(f)}l.isDone?s():l.K===null?u.continue():u.continue(l.K)}}).next(()=>A.waitFor(n))}options(t,e){let n;return t!==void 0&&(typeof t=="string"?n=t:e=t),{index:n,range:e}}cursor(t){let e="next";if(t.reverse&&(e="prev"),t.index){const n=this.store.index(t.index);return t.H?n.openKeyCursor(t.range,e):n.openCursor(t.range,e)}return this.store.openCursor(t.range,e)}}function Pe(r){return new A((t,e)=>{r.onsuccess=n=>{const s=n.target.result;t(s)},r.onerror=n=>{const s=mo(n.target.error);e(s)}})}let _u=!1;function mo(r){const t=he.S(on());if(t>=12.2&&t<13){const e="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(e)>=0){const n=new C("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${e}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return _u||(_u=!0,setTimeout(()=>{throw n},0)),n}}return r}class am{constructor(t,e){this.asyncQueue=t,this.Z=e,this.task=null}start(){this.X(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}X(t){V("IndexBackfiller",`Scheduled in ${t}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",t,async()=>{this.task=null;try{V("IndexBackfiller",`Documents written: ${await this.Z.ee()}`)}catch(e){ye(e)?V("IndexBackfiller","Ignoring IndexedDB error during index backfill: ",e):await _e(e)}await this.X(6e4)})}}class um{constructor(t,e){this.localStore=t,this.persistence=e}async ee(t=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",e=>this.te(e,t))}te(t,e){const n=new Set;let s=e,i=!0;return A.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(t).next(a=>{if(a!==null&&!n.has(a))return V("IndexBackfiller",`Processing collection: ${a}`),this.ne(t,a,s).next(u=>{s-=u,n.add(a)});i=!1})).next(()=>e-s)}ne(t,e,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(t,e).next(s=>this.localStore.localDocuments.getNextDocuments(t,e,s,n).next(i=>{const a=i.changes;return this.localStore.indexManager.updateIndexEntries(t,a).next(()=>this.re(s,i)).next(u=>(V("IndexBackfiller",`Updating offset: ${u}`),this.localStore.indexManager.updateCollectionGroup(t,e,u))).next(()=>a.size)}))}re(t,e){let n=t;return e.changes.forEach((s,i)=>{const a=$c(i);fo(a,n)>0&&(n=a)}),new Ft(n.readTime,n.documentKey,Math.max(e.batchId,t.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=n=>this.ie(n),this.se=n=>e.writeSequenceNumber(n))}ie(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.se&&this.se(t),t}}Dt.oe=-1;function wr(r){return r==null}function hr(r){return r===0&&1/r==-1/0}function Jc(r){return typeof r=="number"&&Number.isInteger(r)&&!hr(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vt(r){let t="";for(let e=0;e<r.length;e++)t.length>0&&(t=yu(t)),t=cm(r.get(e),t);return yu(t)}function cm(r,t){let e=t;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":e+="";break;case"":e+="";break;default:e+=i}}return e}function yu(r){return r+""}function qt(r){const t=r.length;if(L(t>=2),t===2)return L(r.charAt(0)===""&&r.charAt(1)===""),J.emptyPath();const e=t-2,n=[];let s="";for(let i=0;i<t;){const a=r.indexOf("",i);switch((a<0||a>e)&&O(),r.charAt(a+1)){case"":const u=r.substring(i,a);let l;s.length===0?l=u:(s+=u,l=s,s=""),n.push(l);break;case"":s+=r.substring(i,a),s+="\0";break;case"":s+=r.substring(i,a+1);break;default:O()}i=a+2}return new J(n)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iu=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function os(r,t){return[r,Vt(t)]}function Yc(r,t,e){return[r,Vt(t),e]}const lm={},hm=["prefixPath","collectionGroup","readTime","documentId"],dm=["prefixPath","collectionGroup","documentId"],fm=["collectionGroup","readTime","prefixPath","documentId"],mm=["canonicalId","targetId"],pm=["targetId","path"],gm=["path","targetId"],_m=["collectionId","parent"],ym=["indexId","uid"],Im=["uid","sequenceNumber"],Em=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],Tm=["indexId","uid","orderedDocumentKey"],vm=["userId","collectionPath","documentId"],wm=["userId","collectionPath","largestBatchId"],Am=["userId","collectionGroup","largestBatchId"],Xc=["mutationQueues","mutations","documentMutations","remoteDocuments","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries"],Rm=[...Xc,"documentOverlays"],Zc=["mutationQueues","mutations","documentMutations","remoteDocumentsV14","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries","documentOverlays"],tl=Zc,po=[...tl,"indexConfiguration","indexState","indexEntries"],bm=po,Sm=[...po,"globals"];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zi extends Wc{constructor(t,e){super(),this._e=t,this.currentSequenceNumber=e}}function ft(r,t){const e=F(r);return he.F(e._e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Eu(r){let t=0;for(const e in r)Object.prototype.hasOwnProperty.call(r,e)&&t++;return t}function Ue(r,t){for(const e in r)Object.prototype.hasOwnProperty.call(r,e)&&t(e,r[e])}function el(r){for(const t in r)if(Object.prototype.hasOwnProperty.call(r,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(t,e){this.comparator=t,this.root=e||yt.EMPTY}insert(t,e){return new nt(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,yt.BLACK,null,null))}remove(t){return new nt(this.comparator,this.root.remove(t,this.comparator).copy(null,null,yt.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const n=this.comparator(t,e.key);if(n===0)return e.value;n<0?e=e.left:n>0&&(e=e.right)}return null}indexOf(t){let e=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(t,n.key);if(s===0)return e+n.left.size;s<0?n=n.left:(e+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,n)=>(t(e,n),!1))}toString(){const t=[];return this.inorderTraversal((e,n)=>(t.push(`${e}:${n}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Zr(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Zr(this.root,t,this.comparator,!1)}getReverseIterator(){return new Zr(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Zr(this.root,t,this.comparator,!0)}}class Zr{constructor(t,e,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!t.isEmpty();)if(i=e?n(t.key,e):1,e&&s&&(i*=-1),i<0)t=this.isReverse?t.left:t.right;else{if(i===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class yt{constructor(t,e,n,s,i){this.key=t,this.value=e,this.color=n??yt.RED,this.left=s??yt.EMPTY,this.right=i??yt.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,n,s,i){return new yt(t??this.key,e??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,n){let s=this;const i=n(t,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(t,e,n),null):i===0?s.copy(null,e,null,null,null):s.copy(null,null,null,null,s.right.insert(t,e,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return yt.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let n,s=this;if(e(t,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(t,e),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),e(t,s.key)===0){if(s.right.isEmpty())return yt.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(t,e))}return s.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,yt.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,yt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw O();const t=this.left.check();if(t!==this.right.check())throw O();return t+(this.isRed()?0:1)}}yt.EMPTY=null,yt.RED=!0,yt.BLACK=!1;yt.EMPTY=new class{constructor(){this.size=0}get key(){throw O()}get value(){throw O()}get color(){throw O()}get left(){throw O()}get right(){throw O()}copy(t,e,n,s,i){return this}insert(t,e,n){return new yt(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z{constructor(t){this.comparator=t,this.data=new nt(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,n)=>(t(e),!1))}forEachInRange(t,e){const n=this.data.getIteratorFrom(t[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,t[1])>=0)return;e(s.key)}}forEachWhile(t,e){let n;for(n=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();n.hasNext();)if(!t(n.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new Tu(this.data.getIterator())}getIteratorFrom(t){return new Tu(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(n=>{e=e.add(n)}),e}isEqual(t){if(!(t instanceof Z)||this.size!==t.size)return!1;const e=this.data.getIterator(),n=t.data.getIterator();for(;e.hasNext();){const s=e.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new Z(this.comparator);return e.data=t,e}}class Tu{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function We(r){return r.hasNext()?r.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(t){this.fields=t,t.sort(ot.comparator)}static empty(){return new xt([])}unionWith(t){let e=new Z(ot.comparator);for(const n of this.fields)e=e.add(n);for(const n of t)e=e.add(n);return new xt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return un(this.fields,t.fields,(e,n)=>e.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nl extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new nl("Invalid base64 string: "+i):i}}(t);return new lt(e)}static fromUint8Array(t){const e=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(t);return new lt(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const n=new Uint8Array(e.length);for(let s=0;s<e.length;s++)n[s]=e.charCodeAt(s);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return q(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}lt.EMPTY_BYTE_STRING=new lt("");const Pm=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Xt(r){if(L(!!r),typeof r=="string"){let t=0;const e=Pm.exec(r);if(L(!!e),e[1]){let s=e[1];s=(s+"000000000").substr(0,9),t=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:t}}return{seconds:st(r.seconds),nanos:st(r.nanos)}}function st(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function de(r){return typeof r=="string"?lt.fromBase64String(r):lt.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function go(r){var t,e;return((e=(((t=r==null?void 0:r.mapValue)===null||t===void 0?void 0:t.fields)||{}).__type__)===null||e===void 0?void 0:e.stringValue)==="server_timestamp"}function _o(r){const t=r.mapValue.fields.__previous_value__;return go(t)?_o(t):t}function dr(r){const t=Xt(r.mapValue.fields.__local_write_time__.timestampValue);return new ut(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vm{constructor(t,e,n,s,i,a,u,l,d){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=d}}class fe{constructor(t,e){this.projectId=t,this.database=e||"(default)"}static empty(){return new fe("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(t){return t instanceof fe&&t.projectId===this.projectId&&t.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ue={mapValue:{fields:{__type__:{stringValue:"__max__"}}}},as={nullValue:"NULL_VALUE"};function Me(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?go(r)?4:rl(r)?9007199254740991:Ds(r)?10:11:O()}function zt(r,t){if(r===t)return!0;const e=Me(r);if(e!==Me(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===t.booleanValue;case 4:return dr(r).isEqual(dr(t));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=Xt(s.timestampValue),u=Xt(i.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos}(r,t);case 5:return r.stringValue===t.stringValue;case 6:return function(s,i){return de(s.bytesValue).isEqual(de(i.bytesValue))}(r,t);case 7:return r.referenceValue===t.referenceValue;case 8:return function(s,i){return st(s.geoPointValue.latitude)===st(i.geoPointValue.latitude)&&st(s.geoPointValue.longitude)===st(i.geoPointValue.longitude)}(r,t);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return st(s.integerValue)===st(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=st(s.doubleValue),u=st(i.doubleValue);return a===u?hr(a)===hr(u):isNaN(a)&&isNaN(u)}return!1}(r,t);case 9:return un(r.arrayValue.values||[],t.arrayValue.values||[],zt);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},u=i.mapValue.fields||{};if(Eu(a)!==Eu(u))return!1;for(const l in a)if(a.hasOwnProperty(l)&&(u[l]===void 0||!zt(a[l],u[l])))return!1;return!0}(r,t);default:return O()}}function fr(r,t){return(r.values||[]).find(e=>zt(e,t))!==void 0}function me(r,t){if(r===t)return 0;const e=Me(r),n=Me(t);if(e!==n)return q(e,n);switch(e){case 0:case 9007199254740991:return 0;case 1:return q(r.booleanValue,t.booleanValue);case 2:return function(i,a){const u=st(i.integerValue||i.doubleValue),l=st(a.integerValue||a.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(r,t);case 3:return vu(r.timestampValue,t.timestampValue);case 4:return vu(dr(r),dr(t));case 5:return q(r.stringValue,t.stringValue);case 6:return function(i,a){const u=de(i),l=de(a);return u.compareTo(l)}(r.bytesValue,t.bytesValue);case 7:return function(i,a){const u=i.split("/"),l=a.split("/");for(let d=0;d<u.length&&d<l.length;d++){const f=q(u[d],l[d]);if(f!==0)return f}return q(u.length,l.length)}(r.referenceValue,t.referenceValue);case 8:return function(i,a){const u=q(st(i.latitude),st(a.latitude));return u!==0?u:q(st(i.longitude),st(a.longitude))}(r.geoPointValue,t.geoPointValue);case 9:return wu(r.arrayValue,t.arrayValue);case 10:return function(i,a){var u,l,d,f;const p=i.fields||{},I=a.fields||{},S=(u=p.value)===null||u===void 0?void 0:u.arrayValue,D=(l=I.value)===null||l===void 0?void 0:l.arrayValue,k=q(((d=S==null?void 0:S.values)===null||d===void 0?void 0:d.length)||0,((f=D==null?void 0:D.values)===null||f===void 0?void 0:f.length)||0);return k!==0?k:wu(S,D)}(r.mapValue,t.mapValue);case 11:return function(i,a){if(i===ue.mapValue&&a===ue.mapValue)return 0;if(i===ue.mapValue)return 1;if(a===ue.mapValue)return-1;const u=i.fields||{},l=Object.keys(u),d=a.fields||{},f=Object.keys(d);l.sort(),f.sort();for(let p=0;p<l.length&&p<f.length;++p){const I=q(l[p],f[p]);if(I!==0)return I;const S=me(u[l[p]],d[f[p]]);if(S!==0)return S}return q(l.length,f.length)}(r.mapValue,t.mapValue);default:throw O()}}function vu(r,t){if(typeof r=="string"&&typeof t=="string"&&r.length===t.length)return q(r,t);const e=Xt(r),n=Xt(t),s=q(e.seconds,n.seconds);return s!==0?s:q(e.nanos,n.nanos)}function wu(r,t){const e=r.values||[],n=t.values||[];for(let s=0;s<e.length&&s<n.length;++s){const i=me(e[s],n[s]);if(i)return i}return q(e.length,n.length)}function cn(r){return Gi(r)}function Gi(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?function(e){const n=Xt(e);return`time(${n.seconds},${n.nanos})`}(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?function(e){return de(e).toBase64()}(r.bytesValue):"referenceValue"in r?function(e){return M.fromName(e).toString()}(r.referenceValue):"geoPointValue"in r?function(e){return`geo(${e.latitude},${e.longitude})`}(r.geoPointValue):"arrayValue"in r?function(e){let n="[",s=!0;for(const i of e.values||[])s?s=!1:n+=",",n+=Gi(i);return n+"]"}(r.arrayValue):"mapValue"in r?function(e){const n=Object.keys(e.fields||{}).sort();let s="{",i=!0;for(const a of n)i?i=!1:s+=",",s+=`${a}:${Gi(e.fields[a])}`;return s+"}"}(r.mapValue):O()}function mr(r,t){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${t.path.canonicalString()}`}}function Ki(r){return!!r&&"integerValue"in r}function pr(r){return!!r&&"arrayValue"in r}function Au(r){return!!r&&"nullValue"in r}function Ru(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function us(r){return!!r&&"mapValue"in r}function Ds(r){var t,e;return((e=(((t=r==null?void 0:r.mapValue)===null||t===void 0?void 0:t.fields)||{}).__type__)===null||e===void 0?void 0:e.stringValue)==="__vector__"}function er(r){if(r.geoPointValue)return{geoPointValue:Object.assign({},r.geoPointValue)};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:Object.assign({},r.timestampValue)};if(r.mapValue){const t={mapValue:{fields:{}}};return Ue(r.mapValue.fields,(e,n)=>t.mapValue.fields[e]=er(n)),t}if(r.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(r.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=er(r.arrayValue.values[e]);return t}return Object.assign({},r)}function rl(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}const sl={mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{}}}}};function Cm(r){return"nullValue"in r?as:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?mr(fe.empty(),M.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?Ds(r)?sl:{mapValue:{}}:O()}function Dm(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?mr(fe.empty(),M.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?sl:"mapValue"in r?Ds(r)?{mapValue:{}}:ue:O()}function bu(r,t){const e=me(r.value,t.value);return e!==0?e:r.inclusive&&!t.inclusive?-1:!r.inclusive&&t.inclusive?1:0}function Su(r,t){const e=me(r.value,t.value);return e!==0?e:r.inclusive&&!t.inclusive?1:!r.inclusive&&t.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class It{constructor(t){this.value=t}static empty(){return new It({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!us(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=er(e)}setAll(t){let e=ot.emptyPath(),n={},s=[];t.forEach((a,u)=>{if(!e.isImmediateParentOf(u)){const l=this.getFieldsMap(e);this.applyChanges(l,n,s),n={},s=[],e=u.popLast()}a?n[u.lastSegment()]=er(a):s.push(u.lastSegment())});const i=this.getFieldsMap(e);this.applyChanges(i,n,s)}delete(t){const e=this.field(t.popLast());us(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return zt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let s=e.mapValue.fields[t.get(n)];us(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=s),e=s}return e.mapValue.fields}applyChanges(t,e,n){Ue(e,(s,i)=>t[s]=i);for(const s of n)delete t[s]}clone(){return new It(er(this.value))}}function il(r){const t=[];return Ue(r.fields,(e,n)=>{const s=new ot([e]);if(us(n)){const i=il(n.mapValue).fields;if(i.length===0)t.push(s);else for(const a of i)t.push(s.child(a))}else t.push(s)}),new xt(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(t,e,n,s,i,a,u){this.key=t,this.documentType=e,this.version=n,this.readTime=s,this.createTime=i,this.data=a,this.documentState=u}static newInvalidDocument(t){return new it(t,0,B.min(),B.min(),B.min(),It.empty(),0)}static newFoundDocument(t,e,n,s){return new it(t,1,e,B.min(),n,s,0)}static newNoDocument(t,e){return new it(t,2,e,B.min(),B.min(),It.empty(),0)}static newUnknownDocument(t,e){return new it(t,3,e,B.min(),B.min(),It.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(B.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=It.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=It.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=B.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof it&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new it(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln{constructor(t,e){this.position=t,this.inclusive=e}}function Pu(r,t,e){let n=0;for(let s=0;s<r.position.length;s++){const i=t[s],a=r.position[s];if(i.field.isKeyField()?n=M.comparator(M.fromName(a.referenceValue),e.key):n=me(a,e.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function Vu(r,t){if(r===null)return t===null;if(t===null||r.inclusive!==t.inclusive||r.position.length!==t.position.length)return!1;for(let e=0;e<r.position.length;e++)if(!zt(r.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gr{constructor(t,e="asc"){this.field=t,this.dir=e}}function xm(r,t){return r.dir===t.dir&&r.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ol{}class K extends ol{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,n):new Nm(t,e,n):e==="array-contains"?new Om(t,n):e==="in"?new dl(t,n):e==="not-in"?new Fm(t,n):e==="array-contains-any"?new Lm(t,n):new K(t,e,n)}static createKeyFieldInFilter(t,e,n){return e==="in"?new km(t,n):new Mm(t,n)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&this.matchesComparison(me(e,this.value)):e!==null&&Me(this.value)===Me(e)&&this.matchesComparison(me(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return O()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class X extends ol{constructor(t,e){super(),this.filters=t,this.op=e,this.ae=null}static create(t,e){return new X(t,e)}matches(t){return hn(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function hn(r){return r.op==="and"}function $i(r){return r.op==="or"}function yo(r){return al(r)&&hn(r)}function al(r){for(const t of r.filters)if(t instanceof X)return!1;return!0}function Qi(r){if(r instanceof K)return r.field.canonicalString()+r.op.toString()+cn(r.value);if(yo(r))return r.filters.map(t=>Qi(t)).join(",");{const t=r.filters.map(e=>Qi(e)).join(",");return`${r.op}(${t})`}}function ul(r,t){return r instanceof K?function(n,s){return s instanceof K&&n.op===s.op&&n.field.isEqual(s.field)&&zt(n.value,s.value)}(r,t):r instanceof X?function(n,s){return s instanceof X&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce((i,a,u)=>i&&ul(a,s.filters[u]),!0):!1}(r,t):void O()}function cl(r,t){const e=r.filters.concat(t);return X.create(e,r.op)}function ll(r){return r instanceof K?function(e){return`${e.field.canonicalString()} ${e.op} ${cn(e.value)}`}(r):r instanceof X?function(e){return e.op.toString()+" {"+e.getFilters().map(ll).join(" ,")+"}"}(r):"Filter"}class Nm extends K{constructor(t,e,n){super(t,e,n),this.key=M.fromName(n.referenceValue)}matches(t){const e=M.comparator(t.key,this.key);return this.matchesComparison(e)}}class km extends K{constructor(t,e){super(t,"in",e),this.keys=hl("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Mm extends K{constructor(t,e){super(t,"not-in",e),this.keys=hl("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function hl(r,t){var e;return(((e=t.arrayValue)===null||e===void 0?void 0:e.values)||[]).map(n=>M.fromName(n.referenceValue))}class Om extends K{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return pr(e)&&fr(e.arrayValue,this.value)}}class dl extends K{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&fr(this.value.arrayValue,e)}}class Fm extends K{constructor(t,e){super(t,"not-in",e)}matches(t){if(fr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&!fr(this.value.arrayValue,e)}}class Lm extends K{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!pr(e)||!e.arrayValue.values)&&e.arrayValue.values.some(n=>fr(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bm{constructor(t,e=null,n=[],s=[],i=null,a=null,u=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=a,this.endAt=u,this.ue=null}}function Wi(r,t=null,e=[],n=[],s=null,i=null,a=null){return new Bm(r,t,e,n,s,i,a)}function Oe(r){const t=F(r);if(t.ue===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(n=>Qi(n)).join(","),e+="|ob:",e+=t.orderBy.map(n=>function(i){return i.field.canonicalString()+i.dir}(n)).join(","),wr(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(n=>cn(n)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(n=>cn(n)).join(",")),t.ue=e}return t.ue}function Ar(r,t){if(r.limit!==t.limit||r.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<r.orderBy.length;e++)if(!xm(r.orderBy[e],t.orderBy[e]))return!1;if(r.filters.length!==t.filters.length)return!1;for(let e=0;e<r.filters.length;e++)if(!ul(r.filters[e],t.filters[e]))return!1;return r.collectionGroup===t.collectionGroup&&!!r.path.isEqual(t.path)&&!!Vu(r.startAt,t.startAt)&&Vu(r.endAt,t.endAt)}function gs(r){return M.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function _s(r,t){return r.filters.filter(e=>e instanceof K&&e.field.isEqual(t))}function Cu(r,t,e){let n=as,s=!0;for(const i of _s(r,t)){let a=as,u=!0;switch(i.op){case"<":case"<=":a=Cm(i.value);break;case"==":case"in":case">=":a=i.value;break;case">":a=i.value,u=!1;break;case"!=":case"not-in":a=as}bu({value:n,inclusive:s},{value:a,inclusive:u})<0&&(n=a,s=u)}if(e!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(t)){const a=e.position[i];bu({value:n,inclusive:s},{value:a,inclusive:e.inclusive})<0&&(n=a,s=e.inclusive);break}}return{value:n,inclusive:s}}function Du(r,t,e){let n=ue,s=!0;for(const i of _s(r,t)){let a=ue,u=!0;switch(i.op){case">=":case">":a=Dm(i.value),u=!1;break;case"==":case"in":case"<=":a=i.value;break;case"<":a=i.value,u=!1;break;case"!=":case"not-in":a=ue}Su({value:n,inclusive:s},{value:a,inclusive:u})>0&&(n=a,s=u)}if(e!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(t)){const a=e.position[i];Su({value:n,inclusive:s},{value:a,inclusive:e.inclusive})>0&&(n=a,s=e.inclusive);break}}return{value:n,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tn{constructor(t,e=null,n=[],s=[],i=null,a="F",u=null,l=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=a,this.startAt=u,this.endAt=l,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function fl(r,t,e,n,s,i,a,u){return new Tn(r,t,e,n,s,i,a,u)}function Rr(r){return new Tn(r)}function xu(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function ml(r){return r.collectionGroup!==null}function nr(r){const t=F(r);if(t.ce===null){t.ce=[];const e=new Set;for(const i of t.explicitOrderBy)t.ce.push(i),e.add(i.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(a){let u=new Z(ot.comparator);return a.filters.forEach(l=>{l.getFlattenedFilters().forEach(d=>{d.isInequality()&&(u=u.add(d.field))})}),u})(t).forEach(i=>{e.has(i.canonicalString())||i.isKeyField()||t.ce.push(new gr(i,n))}),e.has(ot.keyField().canonicalString())||t.ce.push(new gr(ot.keyField(),n))}return t.ce}function Mt(r){const t=F(r);return t.le||(t.le=Um(t,nr(r))),t.le}function Um(r,t){if(r.limitType==="F")return Wi(r.path,r.collectionGroup,t,r.filters,r.limit,r.startAt,r.endAt);{t=t.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new gr(s.field,i)});const e=r.endAt?new ln(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new ln(r.startAt.position,r.startAt.inclusive):null;return Wi(r.path,r.collectionGroup,t,r.filters,r.limit,e,n)}}function Hi(r,t){const e=r.filters.concat([t]);return new Tn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),e,r.limit,r.limitType,r.startAt,r.endAt)}function ys(r,t,e){return new Tn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),t,e,r.startAt,r.endAt)}function xs(r,t){return Ar(Mt(r),Mt(t))&&r.limitType===t.limitType}function pl(r){return`${Oe(Mt(r))}|lt:${r.limitType}`}function Ze(r){return`Query(target=${function(e){let n=e.path.canonicalString();return e.collectionGroup!==null&&(n+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(n+=`, filters: [${e.filters.map(s=>ll(s)).join(", ")}]`),wr(e.limit)||(n+=", limit: "+e.limit),e.orderBy.length>0&&(n+=`, orderBy: [${e.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),e.startAt&&(n+=", startAt: ",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(s=>cn(s)).join(",")),e.endAt&&(n+=", endAt: ",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(s=>cn(s)).join(",")),`Target(${n})`}(Mt(r))}; limitType=${r.limitType})`}function br(r,t){return t.isFoundDocument()&&function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):M.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)}(r,t)&&function(n,s){for(const i of nr(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(r,t)&&function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0}(r,t)&&function(n,s){return!(n.startAt&&!function(a,u,l){const d=Pu(a,u,l);return a.inclusive?d<=0:d<0}(n.startAt,nr(n),s)||n.endAt&&!function(a,u,l){const d=Pu(a,u,l);return a.inclusive?d>=0:d>0}(n.endAt,nr(n),s))}(r,t)}function gl(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function _l(r){return(t,e)=>{let n=!1;for(const s of nr(r)){const i=qm(s,t,e);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function qm(r,t,e){const n=r.field.isKeyField()?M.comparator(t.key,e.key):function(i,a,u){const l=a.data.field(i),d=u.data.field(i);return l!==null&&d!==null?me(l,d):O()}(r.field,t,e);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return O()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,t))return i}}has(t){return this.get(t)!==void 0}set(t,e){const n=this.mapKeyFn(t),s=this.inner[n];if(s===void 0)return this.inner[n]=[[t,e]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],t))return void(s[i]=[t,e]);s.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],t))return n.length===1?delete this.inner[e]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(t){Ue(this.inner,(e,n)=>{for(const[s,i]of n)t(s,i)})}isEmpty(){return el(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jm=new nt(M.comparator);function kt(){return jm}const yl=new nt(M.comparator);function Yn(...r){let t=yl;for(const e of r)t=t.insert(e.key,e);return t}function Il(r){let t=yl;return r.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function jt(){return rr()}function El(){return rr()}function rr(){return new Ie(r=>r.toString(),(r,t)=>r.isEqual(t))}const zm=new nt(M.comparator),Gm=new Z(M.comparator);function G(...r){let t=Gm;for(const e of r)t=t.add(e);return t}const Km=new Z(q);function Io(){return Km}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Eo(r,t){if(r.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:hr(t)?"-0":t}}function Tl(r){return{integerValue:""+r}}function $m(r,t){return Jc(t)?Tl(t):Eo(r,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ns{constructor(){this._=void 0}}function Qm(r,t,e){return r instanceof _r?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&go(i)&&(i=_o(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(e,t):r instanceof dn?wl(r,t):r instanceof fn?Al(r,t):function(s,i){const a=vl(s,i),u=Nu(a)+Nu(s.Pe);return Ki(a)&&Ki(s.Pe)?Tl(u):Eo(s.serializer,u)}(r,t)}function Wm(r,t,e){return r instanceof dn?wl(r,t):r instanceof fn?Al(r,t):e}function vl(r,t){return r instanceof yr?function(n){return Ki(n)||function(i){return!!i&&"doubleValue"in i}(n)}(t)?t:{integerValue:0}:null}class _r extends Ns{}class dn extends Ns{constructor(t){super(),this.elements=t}}function wl(r,t){const e=Rl(t);for(const n of r.elements)e.some(s=>zt(s,n))||e.push(n);return{arrayValue:{values:e}}}class fn extends Ns{constructor(t){super(),this.elements=t}}function Al(r,t){let e=Rl(t);for(const n of r.elements)e=e.filter(s=>!zt(s,n));return{arrayValue:{values:e}}}class yr extends Ns{constructor(t,e){super(),this.serializer=t,this.Pe=e}}function Nu(r){return st(r.integerValue||r.doubleValue)}function Rl(r){return pr(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hm{constructor(t,e){this.field=t,this.transform=e}}function Jm(r,t){return r.field.isEqual(t.field)&&function(n,s){return n instanceof dn&&s instanceof dn||n instanceof fn&&s instanceof fn?un(n.elements,s.elements,zt):n instanceof yr&&s instanceof yr?zt(n.Pe,s.Pe):n instanceof _r&&s instanceof _r}(r.transform,t.transform)}class Ym{constructor(t,e){this.version=t,this.transformResults=e}}class at{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new at}static exists(t){return new at(void 0,t)}static updateTime(t){return new at(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function cs(r,t){return r.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(r.updateTime):r.exists===void 0||r.exists===t.isFoundDocument()}class ks{}function bl(r,t){if(!r.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return r.isNoDocument()?new wn(r.key,at.none()):new vn(r.key,r.data,at.none());{const e=r.data,n=It.empty();let s=new Z(ot.comparator);for(let i of t.fields)if(!s.has(i)){let a=e.field(i);a===null&&i.length>1&&(i=i.popLast(),a=e.field(i)),a===null?n.delete(i):n.set(i,a),s=s.add(i)}return new Zt(r.key,n,new xt(s.toArray()),at.none())}}function Xm(r,t,e){r instanceof vn?function(s,i,a){const u=s.value.clone(),l=Mu(s.fieldTransforms,i,a.transformResults);u.setAll(l),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(r,t,e):r instanceof Zt?function(s,i,a){if(!cs(s.precondition,i))return void i.convertToUnknownDocument(a.version);const u=Mu(s.fieldTransforms,i,a.transformResults),l=i.data;l.setAll(Sl(s)),l.setAll(u),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(r,t,e):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,t,e)}function sr(r,t,e,n){return r instanceof vn?function(i,a,u,l){if(!cs(i.precondition,a))return u;const d=i.value.clone(),f=Ou(i.fieldTransforms,l,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(r,t,e,n):r instanceof Zt?function(i,a,u,l){if(!cs(i.precondition,a))return u;const d=Ou(i.fieldTransforms,l,a),f=a.data;return f.setAll(Sl(i)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(r,t,e,n):function(i,a,u){return cs(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):u}(r,t,e)}function Zm(r,t){let e=null;for(const n of r.fieldTransforms){const s=t.data.field(n.field),i=vl(n.transform,s||null);i!=null&&(e===null&&(e=It.empty()),e.set(n.field,i))}return e||null}function ku(r,t){return r.type===t.type&&!!r.key.isEqual(t.key)&&!!r.precondition.isEqual(t.precondition)&&!!function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&un(n,s,(i,a)=>Jm(i,a))}(r.fieldTransforms,t.fieldTransforms)&&(r.type===0?r.value.isEqual(t.value):r.type!==1||r.data.isEqual(t.data)&&r.fieldMask.isEqual(t.fieldMask))}class vn extends ks{constructor(t,e,n,s=[]){super(),this.key=t,this.value=e,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Zt extends ks{constructor(t,e,n,s,i=[]){super(),this.key=t,this.data=e,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Sl(r){const t=new Map;return r.fieldMask.fields.forEach(e=>{if(!e.isEmpty()){const n=r.data.field(e);t.set(e,n)}}),t}function Mu(r,t,e){const n=new Map;L(r.length===e.length);for(let s=0;s<e.length;s++){const i=r[s],a=i.transform,u=t.data.field(i.field);n.set(i.field,Wm(a,u,e[s]))}return n}function Ou(r,t,e){const n=new Map;for(const s of r){const i=s.transform,a=e.data.field(s.field);n.set(s.field,Qm(i,a,t))}return n}class wn extends ks{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class To extends ks{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{constructor(t,e,n,s){this.batchId=t,this.localWriteTime=e,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(t,e){const n=e.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(t.key)&&Xm(i,t,n[s])}}applyToLocalView(t,e){for(const n of this.baseMutations)n.key.isEqual(t.key)&&(e=sr(n,t,e,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(t.key)&&(e=sr(n,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const n=El();return this.mutations.forEach(s=>{const i=t.get(s.key),a=i.overlayedDocument;let u=this.applyToLocalView(a,i.mutatedFields);u=e.has(s.key)?null:u;const l=bl(a,u);l!==null&&n.set(s.key,l),a.isValidDocument()||a.convertToNoDocument(B.min())}),n}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),G())}isEqual(t){return this.batchId===t.batchId&&un(this.mutations,t.mutations,(e,n)=>ku(e,n))&&un(this.baseMutations,t.baseMutations,(e,n)=>ku(e,n))}}class wo{constructor(t,e,n,s){this.batch=t,this.commitVersion=e,this.mutationResults=n,this.docVersions=s}static from(t,e,n){L(t.mutations.length===n.length);let s=function(){return zm}();const i=t.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,n[a].version);return new wo(t,e,n,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ao{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tp{constructor(t,e){this.count=t,this.unchangedNames=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var dt,$;function Pl(r){switch(r){default:return O();case P.CANCELLED:case P.UNKNOWN:case P.DEADLINE_EXCEEDED:case P.RESOURCE_EXHAUSTED:case P.INTERNAL:case P.UNAVAILABLE:case P.UNAUTHENTICATED:return!1;case P.INVALID_ARGUMENT:case P.NOT_FOUND:case P.ALREADY_EXISTS:case P.PERMISSION_DENIED:case P.FAILED_PRECONDITION:case P.ABORTED:case P.OUT_OF_RANGE:case P.UNIMPLEMENTED:case P.DATA_LOSS:return!0}}function Vl(r){if(r===void 0)return ht("GRPC error has no .code"),P.UNKNOWN;switch(r){case dt.OK:return P.OK;case dt.CANCELLED:return P.CANCELLED;case dt.UNKNOWN:return P.UNKNOWN;case dt.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case dt.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case dt.INTERNAL:return P.INTERNAL;case dt.UNAVAILABLE:return P.UNAVAILABLE;case dt.UNAUTHENTICATED:return P.UNAUTHENTICATED;case dt.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case dt.NOT_FOUND:return P.NOT_FOUND;case dt.ALREADY_EXISTS:return P.ALREADY_EXISTS;case dt.PERMISSION_DENIED:return P.PERMISSION_DENIED;case dt.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case dt.ABORTED:return P.ABORTED;case dt.OUT_OF_RANGE:return P.OUT_OF_RANGE;case dt.UNIMPLEMENTED:return P.UNIMPLEMENTED;case dt.DATA_LOSS:return P.DATA_LOSS;default:return O()}}($=dt||(dt={}))[$.OK=0]="OK",$[$.CANCELLED=1]="CANCELLED",$[$.UNKNOWN=2]="UNKNOWN",$[$.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",$[$.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",$[$.NOT_FOUND=5]="NOT_FOUND",$[$.ALREADY_EXISTS=6]="ALREADY_EXISTS",$[$.PERMISSION_DENIED=7]="PERMISSION_DENIED",$[$.UNAUTHENTICATED=16]="UNAUTHENTICATED",$[$.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",$[$.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",$[$.ABORTED=10]="ABORTED",$[$.OUT_OF_RANGE=11]="OUT_OF_RANGE",$[$.UNIMPLEMENTED=12]="UNIMPLEMENTED",$[$.INTERNAL=13]="INTERNAL",$[$.UNAVAILABLE=14]="UNAVAILABLE",$[$.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ep(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const np=new Ne([4294967295,4294967295],0);function Fu(r){const t=ep().encode(r),e=new Fc;return e.update(t),new Uint8Array(e.digest())}function Lu(r){const t=new DataView(r.buffer),e=t.getUint32(0,!0),n=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new Ne([e,n],0),new Ne([s,i],0)]}class Ro{constructor(t,e,n){if(this.bitmap=t,this.padding=e,this.hashCount=n,e<0||e>=8)throw new Xn(`Invalid padding: ${e}`);if(n<0)throw new Xn(`Invalid hash count: ${n}`);if(t.length>0&&this.hashCount===0)throw new Xn(`Invalid hash count: ${n}`);if(t.length===0&&e!==0)throw new Xn(`Invalid padding when bitmap length is 0: ${e}`);this.Ie=8*t.length-e,this.Te=Ne.fromNumber(this.Ie)}Ee(t,e,n){let s=t.add(e.multiply(Ne.fromNumber(n)));return s.compare(np)===1&&(s=new Ne([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(t){return(this.bitmap[Math.floor(t/8)]&1<<t%8)!=0}mightContain(t){if(this.Ie===0)return!1;const e=Fu(t),[n,s]=Lu(e);for(let i=0;i<this.hashCount;i++){const a=this.Ee(n,s,i);if(!this.de(a))return!1}return!0}static create(t,e,n){const s=t%8==0?0:8-t%8,i=new Uint8Array(Math.ceil(t/8)),a=new Ro(i,s,e);return n.forEach(u=>a.insert(u)),a}insert(t){if(this.Ie===0)return;const e=Fu(t),[n,s]=Lu(e);for(let i=0;i<this.hashCount;i++){const a=this.Ee(n,s,i);this.Ae(a)}}Ae(t){const e=Math.floor(t/8),n=t%8;this.bitmap[e]|=1<<n}}class Xn extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sr{constructor(t,e,n,s,i){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=n,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(t,e,n){const s=new Map;return s.set(t,Pr.createSynthesizedTargetChangeForCurrentChange(t,e,n)),new Sr(B.min(),s,new nt(q),kt(),G())}}class Pr{constructor(t,e,n,s,i){this.resumeToken=t,this.current=e,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(t,e,n){return new Pr(n,e,G(),G(),G())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(t,e,n,s){this.Re=t,this.removedTargetIds=e,this.key=n,this.Ve=s}}class Cl{constructor(t,e){this.targetId=t,this.me=e}}class Dl{constructor(t,e,n=lt.EMPTY_BYTE_STRING,s=null){this.state=t,this.targetIds=e,this.resumeToken=n,this.cause=s}}class Bu{constructor(){this.fe=0,this.ge=qu(),this.pe=lt.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(t){t.approximateByteSize()>0&&(this.we=!0,this.pe=t)}ve(){let t=G(),e=G(),n=G();return this.ge.forEach((s,i)=>{switch(i){case 0:t=t.add(s);break;case 2:e=e.add(s);break;case 1:n=n.add(s);break;default:O()}}),new Pr(this.pe,this.ye,t,e,n)}Ce(){this.we=!1,this.ge=qu()}Fe(t,e){this.we=!0,this.ge=this.ge.insert(t,e)}Me(t){this.we=!0,this.ge=this.ge.remove(t)}xe(){this.fe+=1}Oe(){this.fe-=1,L(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class rp{constructor(t){this.Le=t,this.Be=new Map,this.ke=kt(),this.qe=Uu(),this.Qe=new nt(q)}Ke(t){for(const e of t.Re)t.Ve&&t.Ve.isFoundDocument()?this.$e(e,t.Ve):this.Ue(e,t.key,t.Ve);for(const e of t.removedTargetIds)this.Ue(e,t.key,t.Ve)}We(t){this.forEachTarget(t,e=>{const n=this.Ge(e);switch(t.state){case 0:this.ze(e)&&n.De(t.resumeToken);break;case 1:n.Oe(),n.Se||n.Ce(),n.De(t.resumeToken);break;case 2:n.Oe(),n.Se||this.removeTarget(e);break;case 3:this.ze(e)&&(n.Ne(),n.De(t.resumeToken));break;case 4:this.ze(e)&&(this.je(e),n.De(t.resumeToken));break;default:O()}})}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.Be.forEach((n,s)=>{this.ze(s)&&e(s)})}He(t){const e=t.targetId,n=t.me.count,s=this.Je(e);if(s){const i=s.target;if(gs(i))if(n===0){const a=new M(i.path);this.Ue(e,a,it.newNoDocument(a,B.min()))}else L(n===1);else{const a=this.Ye(e);if(a!==n){const u=this.Ze(t),l=u?this.Xe(u,t,a):1;if(l!==0){this.je(e);const d=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(e,d)}}}}}Ze(t){const e=t.me.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=e;let a,u;try{a=de(n).toUint8Array()}catch(l){if(l instanceof nl)return an("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new Ro(a,s,i)}catch(l){return an(l instanceof Xn?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.Ie===0?null:u}Xe(t,e,n){return e.me.count===n-this.nt(t,e.targetId)?0:2}nt(t,e){const n=this.Le.getRemoteKeysForTarget(e);let s=0;return n.forEach(i=>{const a=this.Le.tt(),u=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;t.mightContain(u)||(this.Ue(e,i,null),s++)}),s}rt(t){const e=new Map;this.Be.forEach((i,a)=>{const u=this.Je(a);if(u){if(i.current&&gs(u.target)){const l=new M(u.target.path);this.ke.get(l)!==null||this.it(a,l)||this.Ue(a,l,it.newNoDocument(l,t))}i.be&&(e.set(a,i.ve()),i.Ce())}});let n=G();this.qe.forEach((i,a)=>{let u=!0;a.forEachWhile(l=>{const d=this.Je(l);return!d||d.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(n=n.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(t));const s=new Sr(t,e,this.Qe,this.ke,n);return this.ke=kt(),this.qe=Uu(),this.Qe=new nt(q),s}$e(t,e){if(!this.ze(t))return;const n=this.it(t,e.key)?2:0;this.Ge(t).Fe(e.key,n),this.ke=this.ke.insert(e.key,e),this.qe=this.qe.insert(e.key,this.st(e.key).add(t))}Ue(t,e,n){if(!this.ze(t))return;const s=this.Ge(t);this.it(t,e)?s.Fe(e,1):s.Me(e),this.qe=this.qe.insert(e,this.st(e).delete(t)),n&&(this.ke=this.ke.insert(e,n))}removeTarget(t){this.Be.delete(t)}Ye(t){const e=this.Ge(t).ve();return this.Le.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}xe(t){this.Ge(t).xe()}Ge(t){let e=this.Be.get(t);return e||(e=new Bu,this.Be.set(t,e)),e}st(t){let e=this.qe.get(t);return e||(e=new Z(q),this.qe=this.qe.insert(t,e)),e}ze(t){const e=this.Je(t)!==null;return e||V("WatchChangeAggregator","Detected inactive target",t),e}Je(t){const e=this.Be.get(t);return e&&e.Se?null:this.Le.ot(t)}je(t){this.Be.set(t,new Bu),this.Le.getRemoteKeysForTarget(t).forEach(e=>{this.Ue(t,e,null)})}it(t,e){return this.Le.getRemoteKeysForTarget(t).has(e)}}function Uu(){return new nt(M.comparator)}function qu(){return new nt(M.comparator)}const sp={asc:"ASCENDING",desc:"DESCENDING"},ip={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},op={and:"AND",or:"OR"};class ap{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function Ji(r,t){return r.useProto3Json||wr(t)?t:{value:t}}function mn(r,t){return r.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function xl(r,t){return r.useProto3Json?t.toBase64():t.toUint8Array()}function up(r,t){return mn(r,t.toTimestamp())}function pt(r){return L(!!r),B.fromTimestamp(function(e){const n=Xt(e);return new ut(n.seconds,n.nanos)}(r))}function bo(r,t){return Yi(r,t).canonicalString()}function Yi(r,t){const e=function(s){return new J(["projects",s.projectId,"databases",s.database])}(r).child("documents");return t===void 0?e:e.child(t)}function Nl(r){const t=J.fromString(r);return L(jl(t)),t}function Ir(r,t){return bo(r.databaseId,t.path)}function Ht(r,t){const e=Nl(t);if(e.get(1)!==r.databaseId.projectId)throw new C(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+r.databaseId.projectId);if(e.get(3)!==r.databaseId.database)throw new C(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+r.databaseId.database);return new M(Ol(e))}function kl(r,t){return bo(r.databaseId,t)}function Ml(r){const t=Nl(r);return t.length===4?J.emptyPath():Ol(t)}function Xi(r){return new J(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function Ol(r){return L(r.length>4&&r.get(4)==="documents"),r.popFirst(5)}function ju(r,t,e){return{name:Ir(r,t),fields:e.value.mapValue.fields}}function cp(r,t,e){const n=Ht(r,t.name),s=pt(t.updateTime),i=t.createTime?pt(t.createTime):B.min(),a=new It({mapValue:{fields:t.fields}}),u=it.newFoundDocument(n,s,i,a);return e&&u.setHasCommittedMutations(),e?u.setHasCommittedMutations():u}function lp(r,t){return"found"in t?function(n,s){L(!!s.found),s.found.name,s.found.updateTime;const i=Ht(n,s.found.name),a=pt(s.found.updateTime),u=s.found.createTime?pt(s.found.createTime):B.min(),l=new It({mapValue:{fields:s.found.fields}});return it.newFoundDocument(i,a,u,l)}(r,t):"missing"in t?function(n,s){L(!!s.missing),L(!!s.readTime);const i=Ht(n,s.missing),a=pt(s.readTime);return it.newNoDocument(i,a)}(r,t):O()}function hp(r,t){let e;if("targetChange"in t){t.targetChange;const n=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:O()}(t.targetChange.targetChangeType||"NO_CHANGE"),s=t.targetChange.targetIds||[],i=function(d,f){return d.useProto3Json?(L(f===void 0||typeof f=="string"),lt.fromBase64String(f||"")):(L(f===void 0||f instanceof Buffer||f instanceof Uint8Array),lt.fromUint8Array(f||new Uint8Array))}(r,t.targetChange.resumeToken),a=t.targetChange.cause,u=a&&function(d){const f=d.code===void 0?P.UNKNOWN:Vl(d.code);return new C(f,d.message||"")}(a);e=new Dl(n,s,i,u||null)}else if("documentChange"in t){t.documentChange;const n=t.documentChange;n.document,n.document.name,n.document.updateTime;const s=Ht(r,n.document.name),i=pt(n.document.updateTime),a=n.document.createTime?pt(n.document.createTime):B.min(),u=new It({mapValue:{fields:n.document.fields}}),l=it.newFoundDocument(s,i,a,u),d=n.targetIds||[],f=n.removedTargetIds||[];e=new ls(d,f,l.key,l)}else if("documentDelete"in t){t.documentDelete;const n=t.documentDelete;n.document;const s=Ht(r,n.document),i=n.readTime?pt(n.readTime):B.min(),a=it.newNoDocument(s,i),u=n.removedTargetIds||[];e=new ls([],u,a.key,a)}else if("documentRemove"in t){t.documentRemove;const n=t.documentRemove;n.document;const s=Ht(r,n.document),i=n.removedTargetIds||[];e=new ls([],i,s,null)}else{if(!("filter"in t))return O();{t.filter;const n=t.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,a=new tp(s,i),u=n.targetId;e=new Cl(u,a)}}return e}function Er(r,t){let e;if(t instanceof vn)e={update:ju(r,t.key,t.value)};else if(t instanceof wn)e={delete:Ir(r,t.key)};else if(t instanceof Zt)e={update:ju(r,t.key,t.data),updateMask:_p(t.fieldMask)};else{if(!(t instanceof To))return O();e={verify:Ir(r,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map(n=>function(i,a){const u=a.transform;if(u instanceof _r)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof dn)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof fn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof yr)return{fieldPath:a.field.canonicalString(),increment:u.Pe};throw O()}(0,n))),t.precondition.isNone||(e.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:up(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:O()}(r,t.precondition)),e}function Zi(r,t){const e=t.currentDocument?function(i){return i.updateTime!==void 0?at.updateTime(pt(i.updateTime)):i.exists!==void 0?at.exists(i.exists):at.none()}(t.currentDocument):at.none(),n=t.updateTransforms?t.updateTransforms.map(s=>function(a,u){let l=null;if("setToServerValue"in u)L(u.setToServerValue==="REQUEST_TIME"),l=new _r;else if("appendMissingElements"in u){const f=u.appendMissingElements.values||[];l=new dn(f)}else if("removeAllFromArray"in u){const f=u.removeAllFromArray.values||[];l=new fn(f)}else"increment"in u?l=new yr(a,u.increment):O();const d=ot.fromServerFormat(u.fieldPath);return new Hm(d,l)}(r,s)):[];if(t.update){t.update.name;const s=Ht(r,t.update.name),i=new It({mapValue:{fields:t.update.fields}});if(t.updateMask){const a=function(l){const d=l.fieldPaths||[];return new xt(d.map(f=>ot.fromServerFormat(f)))}(t.updateMask);return new Zt(s,i,a,e,n)}return new vn(s,i,e,n)}if(t.delete){const s=Ht(r,t.delete);return new wn(s,e)}if(t.verify){const s=Ht(r,t.verify);return new To(s,e)}return O()}function dp(r,t){return r&&r.length>0?(L(t!==void 0),r.map(e=>function(s,i){let a=s.updateTime?pt(s.updateTime):pt(i);return a.isEqual(B.min())&&(a=pt(i)),new Ym(a,s.transformResults||[])}(e,t))):[]}function Fl(r,t){return{documents:[kl(r,t.path)]}}function Ll(r,t){const e={structuredQuery:{}},n=t.path;let s;t.collectionGroup!==null?(s=n,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=n.popLast(),e.structuredQuery.from=[{collectionId:n.lastSegment()}]),e.parent=kl(r,s);const i=function(d){if(d.length!==0)return ql(X.create(d,"and"))}(t.filters);i&&(e.structuredQuery.where=i);const a=function(d){if(d.length!==0)return d.map(f=>function(I){return{field:tn(I.field),direction:mp(I.dir)}}(f))}(t.orderBy);a&&(e.structuredQuery.orderBy=a);const u=Ji(r,t.limit);return u!==null&&(e.structuredQuery.limit=u),t.startAt&&(e.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(t.startAt)),t.endAt&&(e.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(t.endAt)),{_t:e,parent:s}}function Bl(r){let t=Ml(r.parent);const e=r.structuredQuery,n=e.from?e.from.length:0;let s=null;if(n>0){L(n===1);const f=e.from[0];f.allDescendants?s=f.collectionId:t=t.child(f.collectionId)}let i=[];e.where&&(i=function(p){const I=Ul(p);return I instanceof X&&yo(I)?I.getFilters():[I]}(e.where));let a=[];e.orderBy&&(a=function(p){return p.map(I=>function(D){return new gr(en(D.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(D.direction))}(I))}(e.orderBy));let u=null;e.limit&&(u=function(p){let I;return I=typeof p=="object"?p.value:p,wr(I)?null:I}(e.limit));let l=null;e.startAt&&(l=function(p){const I=!!p.before,S=p.values||[];return new ln(S,I)}(e.startAt));let d=null;return e.endAt&&(d=function(p){const I=!p.before,S=p.values||[];return new ln(S,I)}(e.endAt)),fl(t,s,a,i,u,"F",l,d)}function fp(r,t){const e=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return O()}}(t.purpose);return e==null?null:{"goog-listen-tags":e}}function Ul(r){return r.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const n=en(e.unaryFilter.field);return K.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=en(e.unaryFilter.field);return K.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=en(e.unaryFilter.field);return K.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=en(e.unaryFilter.field);return K.create(a,"!=",{nullValue:"NULL_VALUE"});default:return O()}}(r):r.fieldFilter!==void 0?function(e){return K.create(en(e.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return O()}}(e.fieldFilter.op),e.fieldFilter.value)}(r):r.compositeFilter!==void 0?function(e){return X.create(e.compositeFilter.filters.map(n=>Ul(n)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return O()}}(e.compositeFilter.op))}(r):O()}function mp(r){return sp[r]}function pp(r){return ip[r]}function gp(r){return op[r]}function tn(r){return{fieldPath:r.canonicalString()}}function en(r){return ot.fromServerFormat(r.fieldPath)}function ql(r){return r instanceof K?function(e){if(e.op==="=="){if(Ru(e.value))return{unaryFilter:{field:tn(e.field),op:"IS_NAN"}};if(Au(e.value))return{unaryFilter:{field:tn(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(Ru(e.value))return{unaryFilter:{field:tn(e.field),op:"IS_NOT_NAN"}};if(Au(e.value))return{unaryFilter:{field:tn(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:tn(e.field),op:pp(e.op),value:e.value}}}(r):r instanceof X?function(e){const n=e.getFilters().map(s=>ql(s));return n.length===1?n[0]:{compositeFilter:{op:gp(e.op),filters:n}}}(r):O()}function _p(r){const t=[];return r.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function jl(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wt{constructor(t,e,n,s,i=B.min(),a=B.min(),u=lt.EMPTY_BYTE_STRING,l=null){this.target=t,this.targetId=e,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(t){return new Wt(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new Wt(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new Wt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new Wt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zl{constructor(t){this.ct=t}}function yp(r,t){let e;if(t.document)e=cp(r.ct,t.document,!!t.hasCommittedMutations);else if(t.noDocument){const n=M.fromSegments(t.noDocument.path),s=Le(t.noDocument.readTime);e=it.newNoDocument(n,s),t.hasCommittedMutations&&e.setHasCommittedMutations()}else{if(!t.unknownDocument)return O();{const n=M.fromSegments(t.unknownDocument.path),s=Le(t.unknownDocument.version);e=it.newUnknownDocument(n,s)}}return t.readTime&&e.setReadTime(function(s){const i=new ut(s[0],s[1]);return B.fromTimestamp(i)}(t.readTime)),e}function zu(r,t){const e=t.key,n={prefixPath:e.getCollectionPath().popLast().toArray(),collectionGroup:e.collectionGroup,documentId:e.path.lastSegment(),readTime:Is(t.readTime),hasCommittedMutations:t.hasCommittedMutations};if(t.isFoundDocument())n.document=function(i,a){return{name:Ir(i,a.key),fields:a.data.value.mapValue.fields,updateTime:mn(i,a.version.toTimestamp()),createTime:mn(i,a.createTime.toTimestamp())}}(r.ct,t);else if(t.isNoDocument())n.noDocument={path:e.path.toArray(),readTime:Fe(t.version)};else{if(!t.isUnknownDocument())return O();n.unknownDocument={path:e.path.toArray(),version:Fe(t.version)}}return n}function Is(r){const t=r.toTimestamp();return[t.seconds,t.nanoseconds]}function Fe(r){const t=r.toTimestamp();return{seconds:t.seconds,nanoseconds:t.nanoseconds}}function Le(r){const t=new ut(r.seconds,r.nanoseconds);return B.fromTimestamp(t)}function Ve(r,t){const e=(t.baseMutations||[]).map(i=>Zi(r.ct,i));for(let i=0;i<t.mutations.length-1;++i){const a=t.mutations[i];if(i+1<t.mutations.length&&t.mutations[i+1].transform!==void 0){const u=t.mutations[i+1];a.updateTransforms=u.transform.fieldTransforms,t.mutations.splice(i+1,1),++i}}const n=t.mutations.map(i=>Zi(r.ct,i)),s=ut.fromMillis(t.localWriteTimeMs);return new vo(t.batchId,s,e,n)}function Zn(r){const t=Le(r.readTime),e=r.lastLimboFreeSnapshotVersion!==void 0?Le(r.lastLimboFreeSnapshotVersion):B.min();let n;return n=function(i){return i.documents!==void 0}(r.query)?function(i){return L(i.documents.length===1),Mt(Rr(Ml(i.documents[0])))}(r.query):function(i){return Mt(Bl(i))}(r.query),new Wt(n,r.targetId,"TargetPurposeListen",r.lastListenSequenceNumber,t,e,lt.fromBase64String(r.resumeToken))}function Gl(r,t){const e=Fe(t.snapshotVersion),n=Fe(t.lastLimboFreeSnapshotVersion);let s;s=gs(t.target)?Fl(r.ct,t.target):Ll(r.ct,t.target)._t;const i=t.resumeToken.toBase64();return{targetId:t.targetId,canonicalId:Oe(t.target),readTime:e,resumeToken:i,lastListenSequenceNumber:t.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Kl(r){const t=Bl({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?ys(t,t.limit,"L"):t}function Ci(r,t){return new Ao(t.largestBatchId,Zi(r.ct,t.overlayMutation))}function Gu(r,t){const e=t.path.lastSegment();return[r,Vt(t.path.popLast()),e]}function Ku(r,t,e,n){return{indexId:r,uid:t,sequenceNumber:e,readTime:Fe(n.readTime),documentKey:Vt(n.documentKey.path),largestBatchId:n.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ip{getBundleMetadata(t,e){return $u(t).get(e).next(n=>{if(n)return function(i){return{id:i.bundleId,createTime:Le(i.createTime),version:i.version}}(n)})}saveBundleMetadata(t,e){return $u(t).put(function(s){return{bundleId:s.id,createTime:Fe(pt(s.createTime)),version:s.version}}(e))}getNamedQuery(t,e){return Qu(t).get(e).next(n=>{if(n)return function(i){return{name:i.name,query:Kl(i.bundledQuery),readTime:Le(i.readTime)}}(n)})}saveNamedQuery(t,e){return Qu(t).put(function(s){return{name:s.name,readTime:Fe(pt(s.readTime)),bundledQuery:s.bundledQuery}}(e))}}function $u(r){return ft(r,"bundles")}function Qu(r){return ft(r,"namedQueries")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ms{constructor(t,e){this.serializer=t,this.userId=e}static lt(t,e){const n=e.uid||"";return new Ms(t,n)}getOverlay(t,e){return Kn(t).get(Gu(this.userId,e)).next(n=>n?Ci(this.serializer,n):null)}getOverlays(t,e){const n=jt();return A.forEach(e,s=>this.getOverlay(t,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(t,e,n){const s=[];return n.forEach((i,a)=>{const u=new Ao(e,a);s.push(this.ht(t,u))}),A.waitFor(s)}removeOverlaysForBatchId(t,e,n){const s=new Set;e.forEach(a=>s.add(Vt(a.getCollectionPath())));const i=[];return s.forEach(a=>{const u=IDBKeyRange.bound([this.userId,a,n],[this.userId,a,n+1],!1,!0);i.push(Kn(t).j("collectionPathOverlayIndex",u))}),A.waitFor(i)}getOverlaysForCollection(t,e,n){const s=jt(),i=Vt(e),a=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return Kn(t).U("collectionPathOverlayIndex",a).next(u=>{for(const l of u){const d=Ci(this.serializer,l);s.set(d.getKey(),d)}return s})}getOverlaysForCollectionGroup(t,e,n,s){const i=jt();let a;const u=IDBKeyRange.bound([this.userId,e,n],[this.userId,e,Number.POSITIVE_INFINITY],!0);return Kn(t).J({index:"collectionGroupOverlayIndex",range:u},(l,d,f)=>{const p=Ci(this.serializer,d);i.size()<s||p.largestBatchId===a?(i.set(p.getKey(),p),a=p.largestBatchId):f.done()}).next(()=>i)}ht(t,e){return Kn(t).put(function(s,i,a){const[u,l,d]=Gu(i,a.mutation.key);return{userId:i,collectionPath:l,documentId:d,collectionGroup:a.mutation.key.getCollectionGroup(),largestBatchId:a.largestBatchId,overlayMutation:Er(s.ct,a.mutation)}}(this.serializer,this.userId,e))}}function Kn(r){return ft(r,"documentOverlays")}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ep{Pt(t){return ft(t,"globals")}getSessionToken(t){return this.Pt(t).get("sessionToken").next(e=>{const n=e==null?void 0:e.value;return n?lt.fromUint8Array(n):lt.EMPTY_BYTE_STRING})}setSessionToken(t,e){return this.Pt(t).put({name:"sessionToken",value:e.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(){}It(t,e){this.Tt(t,e),e.Et()}Tt(t,e){if("nullValue"in t)this.dt(e,5);else if("booleanValue"in t)this.dt(e,10),e.At(t.booleanValue?1:0);else if("integerValue"in t)this.dt(e,15),e.At(st(t.integerValue));else if("doubleValue"in t){const n=st(t.doubleValue);isNaN(n)?this.dt(e,13):(this.dt(e,15),hr(n)?e.At(0):e.At(n))}else if("timestampValue"in t){let n=t.timestampValue;this.dt(e,20),typeof n=="string"&&(n=Xt(n)),e.Rt(`${n.seconds||""}`),e.At(n.nanos||0)}else if("stringValue"in t)this.Vt(t.stringValue,e),this.ft(e);else if("bytesValue"in t)this.dt(e,30),e.gt(de(t.bytesValue)),this.ft(e);else if("referenceValue"in t)this.yt(t.referenceValue,e);else if("geoPointValue"in t){const n=t.geoPointValue;this.dt(e,45),e.At(n.latitude||0),e.At(n.longitude||0)}else"mapValue"in t?rl(t)?this.dt(e,Number.MAX_SAFE_INTEGER):Ds(t)?this.wt(t.mapValue,e):(this.St(t.mapValue,e),this.ft(e)):"arrayValue"in t?(this.bt(t.arrayValue,e),this.ft(e)):O()}Vt(t,e){this.dt(e,25),this.Dt(t,e)}Dt(t,e){e.Rt(t)}St(t,e){const n=t.fields||{};this.dt(e,55);for(const s of Object.keys(n))this.Vt(s,e),this.Tt(n[s],e)}wt(t,e){var n,s;const i=t.fields||{};this.dt(e,53);const a="value",u=((s=(n=i[a].arrayValue)===null||n===void 0?void 0:n.values)===null||s===void 0?void 0:s.length)||0;this.dt(e,15),e.At(st(u)),this.Vt(a,e),this.Tt(i[a],e)}bt(t,e){const n=t.values||[];this.dt(e,50);for(const s of n)this.Tt(s,e)}yt(t,e){this.dt(e,37),M.fromName(t).path.forEach(n=>{this.dt(e,60),this.Dt(n,e)})}dt(t,e){t.At(e)}ft(t){t.At(2)}}Ce.vt=new Ce;function Tp(r){if(r===0)return 8;let t=0;return!(r>>4)&&(t+=4,r<<=4),!(r>>6)&&(t+=2,r<<=2),!(r>>7)&&(t+=1),t}function Wu(r){const t=64-function(n){let s=0;for(let i=0;i<8;++i){const a=Tp(255&n[i]);if(s+=a,a!==8)break}return s}(r);return Math.ceil(t/8)}class vp{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Ct(t){const e=t[Symbol.iterator]();let n=e.next();for(;!n.done;)this.Ft(n.value),n=e.next();this.Mt()}xt(t){const e=t[Symbol.iterator]();let n=e.next();for(;!n.done;)this.Ot(n.value),n=e.next();this.Nt()}Lt(t){for(const e of t){const n=e.charCodeAt(0);if(n<128)this.Ft(n);else if(n<2048)this.Ft(960|n>>>6),this.Ft(128|63&n);else if(e<"\uD800"||"\uDBFF"<e)this.Ft(480|n>>>12),this.Ft(128|63&n>>>6),this.Ft(128|63&n);else{const s=e.codePointAt(0);this.Ft(240|s>>>18),this.Ft(128|63&s>>>12),this.Ft(128|63&s>>>6),this.Ft(128|63&s)}}this.Mt()}Bt(t){for(const e of t){const n=e.charCodeAt(0);if(n<128)this.Ot(n);else if(n<2048)this.Ot(960|n>>>6),this.Ot(128|63&n);else if(e<"\uD800"||"\uDBFF"<e)this.Ot(480|n>>>12),this.Ot(128|63&n>>>6),this.Ot(128|63&n);else{const s=e.codePointAt(0);this.Ot(240|s>>>18),this.Ot(128|63&s>>>12),this.Ot(128|63&s>>>6),this.Ot(128|63&s)}}this.Nt()}kt(t){const e=this.qt(t),n=Wu(e);this.Qt(1+n),this.buffer[this.position++]=255&n;for(let s=e.length-n;s<e.length;++s)this.buffer[this.position++]=255&e[s]}Kt(t){const e=this.qt(t),n=Wu(e);this.Qt(1+n),this.buffer[this.position++]=~(255&n);for(let s=e.length-n;s<e.length;++s)this.buffer[this.position++]=~(255&e[s])}$t(){this.Ut(255),this.Ut(255)}Wt(){this.Gt(255),this.Gt(255)}reset(){this.position=0}seed(t){this.Qt(t.length),this.buffer.set(t,this.position),this.position+=t.length}zt(){return this.buffer.slice(0,this.position)}qt(t){const e=function(i){const a=new DataView(new ArrayBuffer(8));return a.setFloat64(0,i,!1),new Uint8Array(a.buffer)}(t),n=(128&e[0])!=0;e[0]^=n?255:128;for(let s=1;s<e.length;++s)e[s]^=n?255:0;return e}Ft(t){const e=255&t;e===0?(this.Ut(0),this.Ut(255)):e===255?(this.Ut(255),this.Ut(0)):this.Ut(e)}Ot(t){const e=255&t;e===0?(this.Gt(0),this.Gt(255)):e===255?(this.Gt(255),this.Gt(0)):this.Gt(t)}Mt(){this.Ut(0),this.Ut(1)}Nt(){this.Gt(0),this.Gt(1)}Ut(t){this.Qt(1),this.buffer[this.position++]=t}Gt(t){this.Qt(1),this.buffer[this.position++]=~t}Qt(t){const e=t+this.position;if(e<=this.buffer.length)return;let n=2*this.buffer.length;n<e&&(n=e);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class wp{constructor(t){this.jt=t}gt(t){this.jt.Ct(t)}Rt(t){this.jt.Lt(t)}At(t){this.jt.kt(t)}Et(){this.jt.$t()}}class Ap{constructor(t){this.jt=t}gt(t){this.jt.xt(t)}Rt(t){this.jt.Bt(t)}At(t){this.jt.Kt(t)}Et(){this.jt.Wt()}}class $n{constructor(){this.jt=new vp,this.Ht=new wp(this.jt),this.Jt=new Ap(this.jt)}seed(t){this.jt.seed(t)}Yt(t){return t===0?this.Ht:this.Jt}zt(){return this.jt.zt()}reset(){this.jt.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class De{constructor(t,e,n,s){this.indexId=t,this.documentKey=e,this.arrayValue=n,this.directionalValue=s}Zt(){const t=this.directionalValue.length,e=t===0||this.directionalValue[t-1]===255?t+1:t,n=new Uint8Array(e);return n.set(this.directionalValue,0),e!==t?n.set([0],this.directionalValue.length):++n[n.length-1],new De(this.indexId,this.documentKey,this.arrayValue,n)}}function se(r,t){let e=r.indexId-t.indexId;return e!==0?e:(e=Hu(r.arrayValue,t.arrayValue),e!==0?e:(e=Hu(r.directionalValue,t.directionalValue),e!==0?e:M.comparator(r.documentKey,t.documentKey)))}function Hu(r,t){for(let e=0;e<r.length&&e<t.length;++e){const n=r[e]-t[e];if(n!==0)return n}return r.length-t.length}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ju{constructor(t){this.Xt=new Z((e,n)=>ot.comparator(e.field,n.field)),this.collectionId=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment(),this.en=t.orderBy,this.tn=[];for(const e of t.filters){const n=e;n.isInequality()?this.Xt=this.Xt.add(n):this.tn.push(n)}}get nn(){return this.Xt.size>1}rn(t){if(L(t.collectionGroup===this.collectionId),this.nn)return!1;const e=ji(t);if(e!==void 0&&!this.sn(e))return!1;const n=Se(t);let s=new Set,i=0,a=0;for(;i<n.length&&this.sn(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.Xt.size>0){const u=this.Xt.getIterator().getNext();if(!s.has(u.field.canonicalString())){const l=n[i];if(!this.on(u,l)||!this._n(this.en[a++],l))return!1}++i}for(;i<n.length;++i){const u=n[i];if(a>=this.en.length||!this._n(this.en[a++],u))return!1}return!0}an(){if(this.nn)return null;let t=new Z(ot.comparator);const e=[];for(const n of this.tn)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")e.push(new is(n.field,2));else{if(t.has(n.field))continue;t=t.add(n.field),e.push(new is(n.field,0))}for(const n of this.en)n.field.isKeyField()||t.has(n.field)||(t=t.add(n.field),e.push(new is(n.field,n.dir==="asc"?0:1)));return new ps(ps.UNKNOWN_ID,this.collectionId,e,lr.empty())}sn(t){for(const e of this.tn)if(this.on(e,t))return!0;return!1}on(t,e){if(t===void 0||!t.field.isEqual(e.fieldPath))return!1;const n=t.op==="array-contains"||t.op==="array-contains-any";return e.kind===2===n}_n(t,e){return!!t.field.isEqual(e.fieldPath)&&(e.kind===0&&t.dir==="asc"||e.kind===1&&t.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $l(r){var t,e;if(L(r instanceof K||r instanceof X),r instanceof K){if(r instanceof dl){const s=((e=(t=r.value.arrayValue)===null||t===void 0?void 0:t.values)===null||e===void 0?void 0:e.map(i=>K.create(r.field,"==",i)))||[];return X.create(s,"or")}return r}const n=r.filters.map(s=>$l(s));return X.create(n,r.op)}function Rp(r){if(r.getFilters().length===0)return[];const t=no($l(r));return L(Ql(t)),to(t)||eo(t)?[t]:t.getFilters()}function to(r){return r instanceof K}function eo(r){return r instanceof X&&yo(r)}function Ql(r){return to(r)||eo(r)||function(e){if(e instanceof X&&$i(e)){for(const n of e.getFilters())if(!to(n)&&!eo(n))return!1;return!0}return!1}(r)}function no(r){if(L(r instanceof K||r instanceof X),r instanceof K)return r;if(r.filters.length===1)return no(r.filters[0]);const t=r.filters.map(n=>no(n));let e=X.create(t,r.op);return e=Es(e),Ql(e)?e:(L(e instanceof X),L(hn(e)),L(e.filters.length>1),e.filters.reduce((n,s)=>So(n,s)))}function So(r,t){let e;return L(r instanceof K||r instanceof X),L(t instanceof K||t instanceof X),e=r instanceof K?t instanceof K?function(s,i){return X.create([s,i],"and")}(r,t):Yu(r,t):t instanceof K?Yu(t,r):function(s,i){if(L(s.filters.length>0&&i.filters.length>0),hn(s)&&hn(i))return cl(s,i.getFilters());const a=$i(s)?s:i,u=$i(s)?i:s,l=a.filters.map(d=>So(d,u));return X.create(l,"or")}(r,t),Es(e)}function Yu(r,t){if(hn(t))return cl(t,r.getFilters());{const e=t.filters.map(n=>So(r,n));return X.create(e,"or")}}function Es(r){if(L(r instanceof K||r instanceof X),r instanceof K)return r;const t=r.getFilters();if(t.length===1)return Es(t[0]);if(al(r))return r;const e=t.map(s=>Es(s)),n=[];return e.forEach(s=>{s instanceof K?n.push(s):s instanceof X&&(s.op===r.op?n.push(...s.filters):n.push(s))}),n.length===1?n[0]:X.create(n,r.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bp{constructor(){this.un=new Po}addToCollectionParentIndex(t,e){return this.un.add(e),A.resolve()}getCollectionParents(t,e){return A.resolve(this.un.getEntries(e))}addFieldIndex(t,e){return A.resolve()}deleteFieldIndex(t,e){return A.resolve()}deleteAllFieldIndexes(t){return A.resolve()}createTargetIndexes(t,e){return A.resolve()}getDocumentsMatchingTarget(t,e){return A.resolve(null)}getIndexType(t,e){return A.resolve(0)}getFieldIndexes(t,e){return A.resolve([])}getNextCollectionGroupToUpdate(t){return A.resolve(null)}getMinOffset(t,e){return A.resolve(Ft.min())}getMinOffsetFromCollectionGroup(t,e){return A.resolve(Ft.min())}updateCollectionGroup(t,e,n){return A.resolve()}updateIndexEntries(t,e){return A.resolve()}}class Po{constructor(){this.index={}}add(t){const e=t.lastSegment(),n=t.popLast(),s=this.index[e]||new Z(J.comparator),i=!s.has(n);return this.index[e]=s.add(n),i}has(t){const e=t.lastSegment(),n=t.popLast(),s=this.index[e];return s&&s.has(n)}getEntries(t){return(this.index[t]||new Z(J.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ts=new Uint8Array(0);class Sp{constructor(t,e){this.databaseId=e,this.cn=new Po,this.ln=new Ie(n=>Oe(n),(n,s)=>Ar(n,s)),this.uid=t.uid||""}addToCollectionParentIndex(t,e){if(!this.cn.has(e)){const n=e.lastSegment(),s=e.popLast();t.addOnCommittedListener(()=>{this.cn.add(e)});const i={collectionId:n,parent:Vt(s)};return Xu(t).put(i)}return A.resolve()}getCollectionParents(t,e){const n=[],s=IDBKeyRange.bound([e,""],[Gc(e),""],!1,!0);return Xu(t).U(s).next(i=>{for(const a of i){if(a.collectionId!==e)break;n.push(qt(a.parent))}return n})}addFieldIndex(t,e){const n=Qn(t),s=function(u){return{indexId:u.indexId,collectionGroup:u.collectionGroup,fields:u.fields.map(l=>[l.fieldPath.canonicalString(),l.kind])}}(e);delete s.indexId;const i=n.add(s);if(e.indexState){const a=Je(t);return i.next(u=>{a.put(Ku(u,this.uid,e.indexState.sequenceNumber,e.indexState.offset))})}return i.next()}deleteFieldIndex(t,e){const n=Qn(t),s=Je(t),i=He(t);return n.delete(e.indexId).next(()=>s.delete(IDBKeyRange.bound([e.indexId],[e.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([e.indexId],[e.indexId+1],!1,!0)))}deleteAllFieldIndexes(t){const e=Qn(t),n=He(t),s=Je(t);return e.j().next(()=>n.j()).next(()=>s.j())}createTargetIndexes(t,e){return A.forEach(this.hn(e),n=>this.getIndexType(t,n).next(s=>{if(s===0||s===1){const i=new Ju(n).an();if(i!=null)return this.addFieldIndex(t,i)}}))}getDocumentsMatchingTarget(t,e){const n=He(t);let s=!0;const i=new Map;return A.forEach(this.hn(e),a=>this.Pn(t,a).next(u=>{s&&(s=!!u),i.set(a,u)})).next(()=>{if(s){let a=G();const u=[];return A.forEach(i,(l,d)=>{V("IndexedDbIndexManager",`Using index ${function(U){return`id=${U.indexId}|cg=${U.collectionGroup}|f=${U.fields.map(Y=>`${Y.fieldPath}:${Y.kind}`).join(",")}`}(l)} to execute ${Oe(e)}`);const f=function(U,Y){const et=ji(Y);if(et===void 0)return null;for(const W of _s(U,et.fieldPath))switch(W.op){case"array-contains-any":return W.value.arrayValue.values||[];case"array-contains":return[W.value]}return null}(d,l),p=function(U,Y){const et=new Map;for(const W of Se(Y))for(const E of _s(U,W.fieldPath))switch(E.op){case"==":case"in":et.set(W.fieldPath.canonicalString(),E.value);break;case"not-in":case"!=":return et.set(W.fieldPath.canonicalString(),E.value),Array.from(et.values())}return null}(d,l),I=function(U,Y){const et=[];let W=!0;for(const E of Se(Y)){const g=E.kind===0?Cu(U,E.fieldPath,U.startAt):Du(U,E.fieldPath,U.startAt);et.push(g.value),W&&(W=g.inclusive)}return new ln(et,W)}(d,l),S=function(U,Y){const et=[];let W=!0;for(const E of Se(Y)){const g=E.kind===0?Du(U,E.fieldPath,U.endAt):Cu(U,E.fieldPath,U.endAt);et.push(g.value),W&&(W=g.inclusive)}return new ln(et,W)}(d,l),D=this.In(l,d,I),k=this.In(l,d,S),x=this.Tn(l,d,p),z=this.En(l.indexId,f,D,I.inclusive,k,S.inclusive,x);return A.forEach(z,j=>n.G(j,e.limit).next(U=>{U.forEach(Y=>{const et=M.fromSegments(Y.documentKey);a.has(et)||(a=a.add(et),u.push(et))})}))}).next(()=>u)}return A.resolve(null)})}hn(t){let e=this.ln.get(t);return e||(t.filters.length===0?e=[t]:e=Rp(X.create(t.filters,"and")).map(n=>Wi(t.path,t.collectionGroup,t.orderBy,n.getFilters(),t.limit,t.startAt,t.endAt)),this.ln.set(t,e),e)}En(t,e,n,s,i,a,u){const l=(e!=null?e.length:1)*Math.max(n.length,i.length),d=l/(e!=null?e.length:1),f=[];for(let p=0;p<l;++p){const I=e?this.dn(e[p/d]):ts,S=this.An(t,I,n[p%d],s),D=this.Rn(t,I,i[p%d],a),k=u.map(x=>this.An(t,I,x,!0));f.push(...this.createRange(S,D,k))}return f}An(t,e,n,s){const i=new De(t,M.empty(),e,n);return s?i:i.Zt()}Rn(t,e,n,s){const i=new De(t,M.empty(),e,n);return s?i.Zt():i}Pn(t,e){const n=new Ju(e),s=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment();return this.getFieldIndexes(t,s).next(i=>{let a=null;for(const u of i)n.rn(u)&&(!a||u.fields.length>a.fields.length)&&(a=u);return a})}getIndexType(t,e){let n=2;const s=this.hn(e);return A.forEach(s,i=>this.Pn(t,i).next(a=>{a?n!==0&&a.fields.length<function(l){let d=new Z(ot.comparator),f=!1;for(const p of l.filters)for(const I of p.getFlattenedFilters())I.field.isKeyField()||(I.op==="array-contains"||I.op==="array-contains-any"?f=!0:d=d.add(I.field));for(const p of l.orderBy)p.field.isKeyField()||(d=d.add(p.field));return d.size+(f?1:0)}(i)&&(n=1):n=0})).next(()=>function(a){return a.limit!==null}(e)&&s.length>1&&n===2?1:n)}Vn(t,e){const n=new $n;for(const s of Se(t)){const i=e.data.field(s.fieldPath);if(i==null)return null;const a=n.Yt(s.kind);Ce.vt.It(i,a)}return n.zt()}dn(t){const e=new $n;return Ce.vt.It(t,e.Yt(0)),e.zt()}mn(t,e){const n=new $n;return Ce.vt.It(mr(this.databaseId,e),n.Yt(function(i){const a=Se(i);return a.length===0?0:a[a.length-1].kind}(t))),n.zt()}Tn(t,e,n){if(n===null)return[];let s=[];s.push(new $n);let i=0;for(const a of Se(t)){const u=n[i++];for(const l of s)if(this.fn(e,a.fieldPath)&&pr(u))s=this.gn(s,a,u);else{const d=l.Yt(a.kind);Ce.vt.It(u,d)}}return this.pn(s)}In(t,e,n){return this.Tn(t,e,n.position)}pn(t){const e=[];for(let n=0;n<t.length;++n)e[n]=t[n].zt();return e}gn(t,e,n){const s=[...t],i=[];for(const a of n.arrayValue.values||[])for(const u of s){const l=new $n;l.seed(u.zt()),Ce.vt.It(a,l.Yt(e.kind)),i.push(l)}return i}fn(t,e){return!!t.filters.find(n=>n instanceof K&&n.field.isEqual(e)&&(n.op==="in"||n.op==="not-in"))}getFieldIndexes(t,e){const n=Qn(t),s=Je(t);return(e?n.U("collectionGroupIndex",IDBKeyRange.bound(e,e)):n.U()).next(i=>{const a=[];return A.forEach(i,u=>s.get([u.indexId,this.uid]).next(l=>{a.push(function(f,p){const I=p?new lr(p.sequenceNumber,new Ft(Le(p.readTime),new M(qt(p.documentKey)),p.largestBatchId)):lr.empty(),S=f.fields.map(([D,k])=>new is(ot.fromServerFormat(D),k));return new ps(f.indexId,f.collectionGroup,S,I)}(u,l))})).next(()=>a)})}getNextCollectionGroupToUpdate(t){return this.getFieldIndexes(t).next(e=>e.length===0?null:(e.sort((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:q(n.collectionGroup,s.collectionGroup)}),e[0].collectionGroup))}updateCollectionGroup(t,e,n){const s=Qn(t),i=Je(t);return this.yn(t).next(a=>s.U("collectionGroupIndex",IDBKeyRange.bound(e,e)).next(u=>A.forEach(u,l=>i.put(Ku(l.indexId,this.uid,a,n)))))}updateIndexEntries(t,e){const n=new Map;return A.forEach(e,(s,i)=>{const a=n.get(s.collectionGroup);return(a?A.resolve(a):this.getFieldIndexes(t,s.collectionGroup)).next(u=>(n.set(s.collectionGroup,u),A.forEach(u,l=>this.wn(t,s,l).next(d=>{const f=this.Sn(i,l);return d.isEqual(f)?A.resolve():this.bn(t,i,l,d,f)}))))})}Dn(t,e,n,s){return He(t).put({indexId:s.indexId,uid:this.uid,arrayValue:s.arrayValue,directionalValue:s.directionalValue,orderedDocumentKey:this.mn(n,e.key),documentKey:e.key.path.toArray()})}vn(t,e,n,s){return He(t).delete([s.indexId,this.uid,s.arrayValue,s.directionalValue,this.mn(n,e.key),e.key.path.toArray()])}wn(t,e,n){const s=He(t);let i=new Z(se);return s.J({index:"documentKeyIndex",range:IDBKeyRange.only([n.indexId,this.uid,this.mn(n,e)])},(a,u)=>{i=i.add(new De(n.indexId,e,u.arrayValue,u.directionalValue))}).next(()=>i)}Sn(t,e){let n=new Z(se);const s=this.Vn(e,t);if(s==null)return n;const i=ji(e);if(i!=null){const a=t.data.field(i.fieldPath);if(pr(a))for(const u of a.arrayValue.values||[])n=n.add(new De(e.indexId,t.key,this.dn(u),s))}else n=n.add(new De(e.indexId,t.key,ts,s));return n}bn(t,e,n,s,i){V("IndexedDbIndexManager","Updating index entries for document '%s'",e.key);const a=[];return function(l,d,f,p,I){const S=l.getIterator(),D=d.getIterator();let k=We(S),x=We(D);for(;k||x;){let z=!1,j=!1;if(k&&x){const U=f(k,x);U<0?j=!0:U>0&&(z=!0)}else k!=null?j=!0:z=!0;z?(p(x),x=We(D)):j?(I(k),k=We(S)):(k=We(S),x=We(D))}}(s,i,se,u=>{a.push(this.Dn(t,e,n,u))},u=>{a.push(this.vn(t,e,n,u))}),A.waitFor(a)}yn(t){let e=1;return Je(t).J({index:"sequenceNumberIndex",reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(n,s,i)=>{i.done(),e=s.sequenceNumber+1}).next(()=>e)}createRange(t,e,n){n=n.sort((a,u)=>se(a,u)).filter((a,u,l)=>!u||se(a,l[u-1])!==0);const s=[];s.push(t);for(const a of n){const u=se(a,t),l=se(a,e);if(u===0)s[0]=t.Zt();else if(u>0&&l<0)s.push(a),s.push(a.Zt());else if(l>0)break}s.push(e);const i=[];for(let a=0;a<s.length;a+=2){if(this.Cn(s[a],s[a+1]))return[];const u=[s[a].indexId,this.uid,s[a].arrayValue,s[a].directionalValue,ts,[]],l=[s[a+1].indexId,this.uid,s[a+1].arrayValue,s[a+1].directionalValue,ts,[]];i.push(IDBKeyRange.bound(u,l))}return i}Cn(t,e){return se(t,e)>0}getMinOffsetFromCollectionGroup(t,e){return this.getFieldIndexes(t,e).next(Zu)}getMinOffset(t,e){return A.mapArray(this.hn(e),n=>this.Pn(t,n).next(s=>s||O())).next(Zu)}}function Xu(r){return ft(r,"collectionParents")}function He(r){return ft(r,"indexEntries")}function Qn(r){return ft(r,"indexConfiguration")}function Je(r){return ft(r,"indexState")}function Zu(r){L(r.length!==0);let t=r[0].indexState.offset,e=t.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;fo(s,t)<0&&(t=s),e<s.largestBatchId&&(e=s.largestBatchId)}return new Ft(t.readTime,t.documentKey,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tc={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class Ct{constructor(t,e,n){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=n}static withCacheSize(t){return new Ct(t,Ct.DEFAULT_COLLECTION_PERCENTILE,Ct.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wl(r,t,e){const n=r.store("mutations"),s=r.store("documentMutations"),i=[],a=IDBKeyRange.only(e.batchId);let u=0;const l=n.J({range:a},(f,p,I)=>(u++,I.delete()));i.push(l.next(()=>{L(u===1)}));const d=[];for(const f of e.mutations){const p=Yc(t,f.key.path,e.batchId);i.push(s.delete(p)),d.push(f.key)}return A.waitFor(i).next(()=>d)}function Ts(r){if(!r)return 0;let t;if(r.document)t=r.document;else if(r.unknownDocument)t=r.unknownDocument;else{if(!r.noDocument)throw O();t=r.noDocument}return JSON.stringify(t).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ct.DEFAULT_COLLECTION_PERCENTILE=10,Ct.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ct.DEFAULT=new Ct(41943040,Ct.DEFAULT_COLLECTION_PERCENTILE,Ct.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ct.DISABLED=new Ct(-1,0,0);class Os{constructor(t,e,n,s){this.userId=t,this.serializer=e,this.indexManager=n,this.referenceDelegate=s,this.Fn={}}static lt(t,e,n,s){L(t.uid!=="");const i=t.isAuthenticated()?t.uid:"";return new Os(i,e,n,s)}checkEmpty(t){let e=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return ie(t).J({index:"userMutationsIndex",range:n},(s,i,a)=>{e=!1,a.done()}).next(()=>e)}addMutationBatch(t,e,n,s){const i=nn(t),a=ie(t);return a.add({}).next(u=>{L(typeof u=="number");const l=new vo(u,e,n,s),d=function(S,D,k){const x=k.baseMutations.map(j=>Er(S.ct,j)),z=k.mutations.map(j=>Er(S.ct,j));return{userId:D,batchId:k.batchId,localWriteTimeMs:k.localWriteTime.toMillis(),baseMutations:x,mutations:z}}(this.serializer,this.userId,l),f=[];let p=new Z((I,S)=>q(I.canonicalString(),S.canonicalString()));for(const I of s){const S=Yc(this.userId,I.key.path,u);p=p.add(I.key.path.popLast()),f.push(a.put(d)),f.push(i.put(S,lm))}return p.forEach(I=>{f.push(this.indexManager.addToCollectionParentIndex(t,I))}),t.addOnCommittedListener(()=>{this.Fn[u]=l.keys()}),A.waitFor(f).next(()=>l)})}lookupMutationBatch(t,e){return ie(t).get(e).next(n=>n?(L(n.userId===this.userId),Ve(this.serializer,n)):null)}Mn(t,e){return this.Fn[e]?A.resolve(this.Fn[e]):this.lookupMutationBatch(t,e).next(n=>{if(n){const s=n.keys();return this.Fn[e]=s,s}return null})}getNextMutationBatchAfterBatchId(t,e){const n=e+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return ie(t).J({index:"userMutationsIndex",range:s},(a,u,l)=>{u.userId===this.userId&&(L(u.batchId>=n),i=Ve(this.serializer,u)),l.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(t){const e=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=-1;return ie(t).J({index:"userMutationsIndex",range:e,reverse:!0},(s,i,a)=>{n=i.batchId,a.done()}).next(()=>n)}getAllMutationBatches(t){const e=IDBKeyRange.bound([this.userId,-1],[this.userId,Number.POSITIVE_INFINITY]);return ie(t).U("userMutationsIndex",e).next(n=>n.map(s=>Ve(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(t,e){const n=os(this.userId,e.path),s=IDBKeyRange.lowerBound(n),i=[];return nn(t).J({range:s},(a,u,l)=>{const[d,f,p]=a,I=qt(f);if(d===this.userId&&e.path.isEqual(I))return ie(t).get(p).next(S=>{if(!S)throw O();L(S.userId===this.userId),i.push(Ve(this.serializer,S))});l.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new Z(q);const s=[];return e.forEach(i=>{const a=os(this.userId,i.path),u=IDBKeyRange.lowerBound(a),l=nn(t).J({range:u},(d,f,p)=>{const[I,S,D]=d,k=qt(S);I===this.userId&&i.path.isEqual(k)?n=n.add(D):p.done()});s.push(l)}),A.waitFor(s).next(()=>this.xn(t,n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,s=n.length+1,i=os(this.userId,n),a=IDBKeyRange.lowerBound(i);let u=new Z(q);return nn(t).J({range:a},(l,d,f)=>{const[p,I,S]=l,D=qt(I);p===this.userId&&n.isPrefixOf(D)?D.length===s&&(u=u.add(S)):f.done()}).next(()=>this.xn(t,u))}xn(t,e){const n=[],s=[];return e.forEach(i=>{s.push(ie(t).get(i).next(a=>{if(a===null)throw O();L(a.userId===this.userId),n.push(Ve(this.serializer,a))}))}),A.waitFor(s).next(()=>n)}removeMutationBatch(t,e){return Wl(t._e,this.userId,e).next(n=>(t.addOnCommittedListener(()=>{this.On(e.batchId)}),A.forEach(n,s=>this.referenceDelegate.markPotentiallyOrphaned(t,s))))}On(t){delete this.Fn[t]}performConsistencyCheck(t){return this.checkEmpty(t).next(e=>{if(!e)return A.resolve();const n=IDBKeyRange.lowerBound(function(a){return[a]}(this.userId)),s=[];return nn(t).J({range:n},(i,a,u)=>{if(i[0]===this.userId){const l=qt(i[1]);s.push(l)}else u.done()}).next(()=>{L(s.length===0)})})}containsKey(t,e){return Hl(t,this.userId,e)}Nn(t){return Jl(t).get(this.userId).next(e=>e||{userId:this.userId,lastAcknowledgedBatchId:-1,lastStreamToken:""})}}function Hl(r,t,e){const n=os(t,e.path),s=n[1],i=IDBKeyRange.lowerBound(n);let a=!1;return nn(r).J({range:i,H:!0},(u,l,d)=>{const[f,p,I]=u;f===t&&p===s&&(a=!0),d.done()}).next(()=>a)}function ie(r){return ft(r,"mutations")}function nn(r){return ft(r,"documentMutations")}function Jl(r){return ft(r,"mutationQueues")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(t){this.Ln=t}next(){return this.Ln+=2,this.Ln}static Bn(){return new Be(0)}static kn(){return new Be(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pp{constructor(t,e){this.referenceDelegate=t,this.serializer=e}allocateTargetId(t){return this.qn(t).next(e=>{const n=new Be(e.highestTargetId);return e.highestTargetId=n.next(),this.Qn(t,e).next(()=>e.highestTargetId)})}getLastRemoteSnapshotVersion(t){return this.qn(t).next(e=>B.fromTimestamp(new ut(e.lastRemoteSnapshotVersion.seconds,e.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(t){return this.qn(t).next(e=>e.highestListenSequenceNumber)}setTargetsMetadata(t,e,n){return this.qn(t).next(s=>(s.highestListenSequenceNumber=e,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),e>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=e),this.Qn(t,s)))}addTargetData(t,e){return this.Kn(t,e).next(()=>this.qn(t).next(n=>(n.targetCount+=1,this.$n(e,n),this.Qn(t,n))))}updateTargetData(t,e){return this.Kn(t,e)}removeTargetData(t,e){return this.removeMatchingKeysForTargetId(t,e.targetId).next(()=>Ye(t).delete(e.targetId)).next(()=>this.qn(t)).next(n=>(L(n.targetCount>0),n.targetCount-=1,this.Qn(t,n)))}removeTargets(t,e,n){let s=0;const i=[];return Ye(t).J((a,u)=>{const l=Zn(u);l.sequenceNumber<=e&&n.get(l.targetId)===null&&(s++,i.push(this.removeTargetData(t,l)))}).next(()=>A.waitFor(i)).next(()=>s)}forEachTarget(t,e){return Ye(t).J((n,s)=>{const i=Zn(s);e(i)})}qn(t){return ec(t).get("targetGlobalKey").next(e=>(L(e!==null),e))}Qn(t,e){return ec(t).put("targetGlobalKey",e)}Kn(t,e){return Ye(t).put(Gl(this.serializer,e))}$n(t,e){let n=!1;return t.targetId>e.highestTargetId&&(e.highestTargetId=t.targetId,n=!0),t.sequenceNumber>e.highestListenSequenceNumber&&(e.highestListenSequenceNumber=t.sequenceNumber,n=!0),n}getTargetCount(t){return this.qn(t).next(e=>e.targetCount)}getTargetData(t,e){const n=Oe(e),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return Ye(t).J({range:s,index:"queryTargetsIndex"},(a,u,l)=>{const d=Zn(u);Ar(e,d.target)&&(i=d,l.done())}).next(()=>i)}addMatchingKeys(t,e,n){const s=[],i=oe(t);return e.forEach(a=>{const u=Vt(a.path);s.push(i.put({targetId:n,path:u})),s.push(this.referenceDelegate.addReference(t,n,a))}),A.waitFor(s)}removeMatchingKeys(t,e,n){const s=oe(t);return A.forEach(e,i=>{const a=Vt(i.path);return A.waitFor([s.delete([n,a]),this.referenceDelegate.removeReference(t,n,i)])})}removeMatchingKeysForTargetId(t,e){const n=oe(t),s=IDBKeyRange.bound([e],[e+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(t,e){const n=IDBKeyRange.bound([e],[e+1],!1,!0),s=oe(t);let i=G();return s.J({range:n,H:!0},(a,u,l)=>{const d=qt(a[1]),f=new M(d);i=i.add(f)}).next(()=>i)}containsKey(t,e){const n=Vt(e.path),s=IDBKeyRange.bound([n],[Gc(n)],!1,!0);let i=0;return oe(t).J({index:"documentTargetsIndex",H:!0,range:s},([a,u],l,d)=>{a!==0&&(i++,d.done())}).next(()=>i>0)}ot(t,e){return Ye(t).get(e).next(n=>n?Zn(n):null)}}function Ye(r){return ft(r,"targets")}function ec(r){return ft(r,"targetGlobal")}function oe(r){return ft(r,"targetDocuments")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nc([r,t],[e,n]){const s=q(r,e);return s===0?q(t,n):s}class Vp{constructor(t){this.Un=t,this.buffer=new Z(nc),this.Wn=0}Gn(){return++this.Wn}zn(t){const e=[t,this.Gn()];if(this.buffer.size<this.Un)this.buffer=this.buffer.add(e);else{const n=this.buffer.last();nc(e,n)<0&&(this.buffer=this.buffer.delete(n).add(e))}}get maxValue(){return this.buffer.last()[0]}}class Cp{constructor(t,e,n){this.garbageCollector=t,this.asyncQueue=e,this.localStore=n,this.jn=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Hn(6e4)}stop(){this.jn&&(this.jn.cancel(),this.jn=null)}get started(){return this.jn!==null}Hn(t){V("LruGarbageCollector",`Garbage collection scheduled in ${t}ms`),this.jn=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,async()=>{this.jn=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){ye(e)?V("LruGarbageCollector","Ignoring IndexedDB error during garbage collection: ",e):await _e(e)}await this.Hn(3e5)})}}class Dp{constructor(t,e){this.Jn=t,this.params=e}calculateTargetCount(t,e){return this.Jn.Yn(t).next(n=>Math.floor(e/100*n))}nthSequenceNumber(t,e){if(e===0)return A.resolve(Dt.oe);const n=new Vp(e);return this.Jn.forEachTarget(t,s=>n.zn(s.sequenceNumber)).next(()=>this.Jn.Zn(t,s=>n.zn(s))).next(()=>n.maxValue)}removeTargets(t,e,n){return this.Jn.removeTargets(t,e,n)}removeOrphanedDocuments(t,e){return this.Jn.removeOrphanedDocuments(t,e)}collect(t,e){return this.params.cacheSizeCollectionThreshold===-1?(V("LruGarbageCollector","Garbage collection skipped; disabled"),A.resolve(tc)):this.getCacheSize(t).next(n=>n<this.params.cacheSizeCollectionThreshold?(V("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),tc):this.Xn(t,e))}getCacheSize(t){return this.Jn.getCacheSize(t)}Xn(t,e){let n,s,i,a,u,l,d;const f=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(V("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),s=this.params.maximumSequenceNumbersToCollect):s=p,a=Date.now(),this.nthSequenceNumber(t,s))).next(p=>(n=p,u=Date.now(),this.removeTargets(t,n,e))).next(p=>(i=p,l=Date.now(),this.removeOrphanedDocuments(t,n))).next(p=>(d=Date.now(),Xe()<=Q.DEBUG&&V("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-f}ms
	Determined least recently used ${s} in `+(u-a)+`ms
	Removed ${i} targets in `+(l-u)+`ms
	Removed ${p} documents in `+(d-l)+`ms
Total Duration: ${d-f}ms`),A.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:p})))}}function xp(r,t){return new Dp(r,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Np{constructor(t,e){this.db=t,this.garbageCollector=xp(this,e)}Yn(t){const e=this.er(t);return this.db.getTargetCache().getTargetCount(t).next(n=>e.next(s=>n+s))}er(t){let e=0;return this.Zn(t,n=>{e++}).next(()=>e)}forEachTarget(t,e){return this.db.getTargetCache().forEachTarget(t,e)}Zn(t,e){return this.tr(t,(n,s)=>e(s))}addReference(t,e,n){return es(t,n)}removeReference(t,e,n){return es(t,n)}removeTargets(t,e,n){return this.db.getTargetCache().removeTargets(t,e,n)}markPotentiallyOrphaned(t,e){return es(t,e)}nr(t,e){return function(s,i){let a=!1;return Jl(s).Y(u=>Hl(s,u,i).next(l=>(l&&(a=!0),A.resolve(!l)))).next(()=>a)}(t,e)}removeOrphanedDocuments(t,e){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.tr(t,(a,u)=>{if(u<=e){const l=this.nr(t,a).next(d=>{if(!d)return i++,n.getEntry(t,a).next(()=>(n.removeEntry(a,B.min()),oe(t).delete(function(p){return[0,Vt(p.path)]}(a))))});s.push(l)}}).next(()=>A.waitFor(s)).next(()=>n.apply(t)).next(()=>i)}removeTarget(t,e){const n=e.withSequenceNumber(t.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(t,n)}updateLimboDocument(t,e){return es(t,e)}tr(t,e){const n=oe(t);let s,i=Dt.oe;return n.J({index:"documentTargetsIndex"},([a,u],{path:l,sequenceNumber:d})=>{a===0?(i!==Dt.oe&&e(new M(qt(s)),i),i=d,s=l):i=Dt.oe}).next(()=>{i!==Dt.oe&&e(new M(qt(s)),i)})}getCacheSize(t){return this.db.getRemoteDocumentCache().getSize(t)}}function es(r,t){return oe(r).put(function(n,s){return{targetId:0,path:Vt(n.path),sequenceNumber:s}}(t,r.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yl{constructor(){this.changes=new Ie(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,it.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const n=this.changes.get(e);return n!==void 0?A.resolve(n):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kp{constructor(t){this.serializer=t}setIndexManager(t){this.indexManager=t}addEntry(t,e,n){return Re(t).put(n)}removeEntry(t,e,n){return Re(t).delete(function(i,a){const u=i.path.toArray();return[u.slice(0,u.length-2),u[u.length-2],Is(a),u[u.length-1]]}(e,n))}updateMetadata(t,e){return this.getMetadata(t).next(n=>(n.byteSize+=e,this.rr(t,n)))}getEntry(t,e){let n=it.newInvalidDocument(e);return Re(t).J({index:"documentKeyIndex",range:IDBKeyRange.only(Wn(e))},(s,i)=>{n=this.ir(e,i)}).next(()=>n)}sr(t,e){let n={size:0,document:it.newInvalidDocument(e)};return Re(t).J({index:"documentKeyIndex",range:IDBKeyRange.only(Wn(e))},(s,i)=>{n={document:this.ir(e,i),size:Ts(i)}}).next(()=>n)}getEntries(t,e){let n=kt();return this._r(t,e,(s,i)=>{const a=this.ir(s,i);n=n.insert(s,a)}).next(()=>n)}ar(t,e){let n=kt(),s=new nt(M.comparator);return this._r(t,e,(i,a)=>{const u=this.ir(i,a);n=n.insert(i,u),s=s.insert(i,Ts(a))}).next(()=>({documents:n,ur:s}))}_r(t,e,n){if(e.isEmpty())return A.resolve();let s=new Z(ic);e.forEach(l=>s=s.add(l));const i=IDBKeyRange.bound(Wn(s.first()),Wn(s.last())),a=s.getIterator();let u=a.getNext();return Re(t).J({index:"documentKeyIndex",range:i},(l,d,f)=>{const p=M.fromSegments([...d.prefixPath,d.collectionGroup,d.documentId]);for(;u&&ic(u,p)<0;)n(u,null),u=a.getNext();u&&u.isEqual(p)&&(n(u,d),u=a.hasNext()?a.getNext():null),u?f.$(Wn(u)):f.done()}).next(()=>{for(;u;)n(u,null),u=a.hasNext()?a.getNext():null})}getDocumentsMatchingQuery(t,e,n,s,i){const a=e.path,u=[a.popLast().toArray(),a.lastSegment(),Is(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],l=[a.popLast().toArray(),a.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Re(t).U(IDBKeyRange.bound(u,l,!0)).next(d=>{i==null||i.incrementDocumentReadCount(d.length);let f=kt();for(const p of d){const I=this.ir(M.fromSegments(p.prefixPath.concat(p.collectionGroup,p.documentId)),p);I.isFoundDocument()&&(br(e,I)||s.has(I.key))&&(f=f.insert(I.key,I))}return f})}getAllFromCollectionGroup(t,e,n,s){let i=kt();const a=sc(e,n),u=sc(e,Ft.max());return Re(t).J({index:"collectionGroupIndex",range:IDBKeyRange.bound(a,u,!0)},(l,d,f)=>{const p=this.ir(M.fromSegments(d.prefixPath.concat(d.collectionGroup,d.documentId)),d);i=i.insert(p.key,p),i.size===s&&f.done()}).next(()=>i)}newChangeBuffer(t){return new Mp(this,!!t&&t.trackRemovals)}getSize(t){return this.getMetadata(t).next(e=>e.byteSize)}getMetadata(t){return rc(t).get("remoteDocumentGlobalKey").next(e=>(L(!!e),e))}rr(t,e){return rc(t).put("remoteDocumentGlobalKey",e)}ir(t,e){if(e){const n=yp(this.serializer,e);if(!(n.isNoDocument()&&n.version.isEqual(B.min())))return n}return it.newInvalidDocument(t)}}function Xl(r){return new kp(r)}class Mp extends Yl{constructor(t,e){super(),this.cr=t,this.trackRemovals=e,this.lr=new Ie(n=>n.toString(),(n,s)=>n.isEqual(s))}applyChanges(t){const e=[];let n=0,s=new Z((i,a)=>q(i.canonicalString(),a.canonicalString()));return this.changes.forEach((i,a)=>{const u=this.lr.get(i);if(e.push(this.cr.removeEntry(t,i,u.readTime)),a.isValidDocument()){const l=zu(this.cr.serializer,a);s=s.add(i.path.popLast());const d=Ts(l);n+=d-u.size,e.push(this.cr.addEntry(t,i,l))}else if(n-=u.size,this.trackRemovals){const l=zu(this.cr.serializer,a.convertToNoDocument(B.min()));e.push(this.cr.addEntry(t,i,l))}}),s.forEach(i=>{e.push(this.cr.indexManager.addToCollectionParentIndex(t,i))}),e.push(this.cr.updateMetadata(t,n)),A.waitFor(e)}getFromCache(t,e){return this.cr.sr(t,e).next(n=>(this.lr.set(e,{size:n.size,readTime:n.document.readTime}),n.document))}getAllFromCache(t,e){return this.cr.ar(t,e).next(({documents:n,ur:s})=>(s.forEach((i,a)=>{this.lr.set(i,{size:a,readTime:n.get(i).readTime})}),n))}}function rc(r){return ft(r,"remoteDocumentGlobal")}function Re(r){return ft(r,"remoteDocumentsV14")}function Wn(r){const t=r.path.toArray();return[t.slice(0,t.length-2),t[t.length-2],t[t.length-1]]}function sc(r,t){const e=t.documentKey.path.toArray();return[r,Is(t.readTime),e.slice(0,e.length-2),e.length>0?e[e.length-1]:""]}function ic(r,t){const e=r.path.toArray(),n=t.path.toArray();let s=0;for(let i=0;i<e.length-2&&i<n.length-2;++i)if(s=q(e[i],n[i]),s)return s;return s=q(e.length,n.length),s||(s=q(e[e.length-2],n[n.length-2]),s||q(e[e.length-1],n[n.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Op{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zl{constructor(t,e,n,s){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=n,this.indexManager=s}getDocument(t,e){let n=null;return this.documentOverlayCache.getOverlay(t,e).next(s=>(n=s,this.remoteDocumentCache.getEntry(t,e))).next(s=>(n!==null&&sr(n.mutation,s,xt.empty(),ut.now()),s))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.getLocalViewOfDocuments(t,n,G()).next(()=>n))}getLocalViewOfDocuments(t,e,n=G()){const s=jt();return this.populateOverlays(t,s,e).next(()=>this.computeViews(t,e,s,n).next(i=>{let a=Yn();return i.forEach((u,l)=>{a=a.insert(u,l.overlayedDocument)}),a}))}getOverlayedDocuments(t,e){const n=jt();return this.populateOverlays(t,n,e).next(()=>this.computeViews(t,e,n,G()))}populateOverlays(t,e,n){const s=[];return n.forEach(i=>{e.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(t,s).next(i=>{i.forEach((a,u)=>{e.set(a,u)})})}computeViews(t,e,n,s){let i=kt();const a=rr(),u=function(){return rr()}();return e.forEach((l,d)=>{const f=n.get(d.key);s.has(d.key)&&(f===void 0||f.mutation instanceof Zt)?i=i.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),sr(f.mutation,d,f.mutation.getFieldMask(),ut.now())):a.set(d.key,xt.empty())}),this.recalculateAndSaveOverlays(t,i).next(l=>(l.forEach((d,f)=>a.set(d,f)),e.forEach((d,f)=>{var p;return u.set(d,new Op(f,(p=a.get(d))!==null&&p!==void 0?p:null))}),u))}recalculateAndSaveOverlays(t,e){const n=rr();let s=new nt((a,u)=>a-u),i=G();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(a=>{for(const u of a)u.keys().forEach(l=>{const d=e.get(l);if(d===null)return;let f=n.get(l)||xt.empty();f=u.applyToLocalView(d,f),n.set(l,f);const p=(s.get(u.batchId)||G()).add(l);s=s.insert(u.batchId,p)})}).next(()=>{const a=[],u=s.getReverseIterator();for(;u.hasNext();){const l=u.getNext(),d=l.key,f=l.value,p=El();f.forEach(I=>{if(!i.has(I)){const S=bl(e.get(I),n.get(I));S!==null&&p.set(I,S),i=i.add(I)}}),a.push(this.documentOverlayCache.saveOverlays(t,d,p))}return A.waitFor(a)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.recalculateAndSaveOverlays(t,n))}getDocumentsMatchingQuery(t,e,n,s){return function(a){return M.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):ml(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,n,s):this.getDocumentsMatchingCollectionQuery(t,e,n,s)}getNextDocuments(t,e,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,n,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,n.largestBatchId,s-i.size):A.resolve(jt());let u=-1,l=i;return a.next(d=>A.forEach(d,(f,p)=>(u<p.largestBatchId&&(u=p.largestBatchId),i.get(f)?A.resolve():this.remoteDocumentCache.getEntry(t,f).next(I=>{l=l.insert(f,I)}))).next(()=>this.populateOverlays(t,d,i)).next(()=>this.computeViews(t,l,d,G())).next(f=>({batchId:u,changes:Il(f)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new M(e)).next(n=>{let s=Yn();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s})}getDocumentsMatchingCollectionGroupQuery(t,e,n,s){const i=e.collectionGroup;let a=Yn();return this.indexManager.getCollectionParents(t,i).next(u=>A.forEach(u,l=>{const d=function(p,I){return new Tn(I,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(e,l.child(i));return this.getDocumentsMatchingCollectionQuery(t,d,n,s).next(f=>{f.forEach((p,I)=>{a=a.insert(p,I)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(t,e,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,n.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,n,i,s))).next(a=>{i.forEach((l,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,it.newInvalidDocument(f)))});let u=Yn();return a.forEach((l,d)=>{const f=i.get(l);f!==void 0&&sr(f.mutation,d,xt.empty(),ut.now()),br(e,d)&&(u=u.insert(l,d))}),u})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fp{constructor(t){this.serializer=t,this.hr=new Map,this.Pr=new Map}getBundleMetadata(t,e){return A.resolve(this.hr.get(e))}saveBundleMetadata(t,e){return this.hr.set(e.id,function(s){return{id:s.id,version:s.version,createTime:pt(s.createTime)}}(e)),A.resolve()}getNamedQuery(t,e){return A.resolve(this.Pr.get(e))}saveNamedQuery(t,e){return this.Pr.set(e.name,function(s){return{name:s.name,query:Kl(s.bundledQuery),readTime:pt(s.readTime)}}(e)),A.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lp{constructor(){this.overlays=new nt(M.comparator),this.Ir=new Map}getOverlay(t,e){return A.resolve(this.overlays.get(e))}getOverlays(t,e){const n=jt();return A.forEach(e,s=>this.getOverlay(t,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(t,e,n){return n.forEach((s,i)=>{this.ht(t,e,i)}),A.resolve()}removeOverlaysForBatchId(t,e,n){const s=this.Ir.get(n);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(n)),A.resolve()}getOverlaysForCollection(t,e,n){const s=jt(),i=e.length+1,a=new M(e.child("")),u=this.overlays.getIteratorFrom(a);for(;u.hasNext();){const l=u.getNext().value,d=l.getKey();if(!e.isPrefixOf(d.path))break;d.path.length===i&&l.largestBatchId>n&&s.set(l.getKey(),l)}return A.resolve(s)}getOverlaysForCollectionGroup(t,e,n,s){let i=new nt((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===e&&d.largestBatchId>n){let f=i.get(d.largestBatchId);f===null&&(f=jt(),i=i.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const u=jt(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((d,f)=>u.set(d,f)),!(u.size()>=s)););return A.resolve(u)}ht(t,e,n){const s=this.overlays.get(n.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(n.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(n.key,new Ao(e,n));let i=this.Ir.get(e);i===void 0&&(i=G(),this.Ir.set(e,i)),this.Ir.set(e,i.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bp{constructor(){this.sessionToken=lt.EMPTY_BYTE_STRING}getSessionToken(t){return A.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,A.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vo{constructor(){this.Tr=new Z(mt.Er),this.dr=new Z(mt.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(t,e){const n=new mt(t,e);this.Tr=this.Tr.add(n),this.dr=this.dr.add(n)}Rr(t,e){t.forEach(n=>this.addReference(n,e))}removeReference(t,e){this.Vr(new mt(t,e))}mr(t,e){t.forEach(n=>this.removeReference(n,e))}gr(t){const e=new M(new J([])),n=new mt(e,t),s=new mt(e,t+1),i=[];return this.dr.forEachInRange([n,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(t=>this.Vr(t))}Vr(t){this.Tr=this.Tr.delete(t),this.dr=this.dr.delete(t)}yr(t){const e=new M(new J([])),n=new mt(e,t),s=new mt(e,t+1);let i=G();return this.dr.forEachInRange([n,s],a=>{i=i.add(a.key)}),i}containsKey(t){const e=new mt(t,0),n=this.Tr.firstAfterOrEqual(e);return n!==null&&t.isEqual(n.key)}}class mt{constructor(t,e){this.key=t,this.wr=e}static Er(t,e){return M.comparator(t.key,e.key)||q(t.wr,e.wr)}static Ar(t,e){return q(t.wr,e.wr)||M.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Up{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.Sr=1,this.br=new Z(mt.Er)}checkEmpty(t){return A.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,n,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new vo(i,e,n,s);this.mutationQueue.push(a);for(const u of s)this.br=this.br.add(new mt(u.key,i)),this.indexManager.addToCollectionParentIndex(t,u.key.path.popLast());return A.resolve(a)}lookupMutationBatch(t,e){return A.resolve(this.Dr(e))}getNextMutationBatchAfterBatchId(t,e){const n=e+1,s=this.vr(n),i=s<0?0:s;return A.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return A.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(t){return A.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const n=new mt(e,0),s=new mt(e,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([n,s],a=>{const u=this.Dr(a.wr);i.push(u)}),A.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new Z(q);return e.forEach(s=>{const i=new mt(s,0),a=new mt(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],u=>{n=n.add(u.wr)})}),A.resolve(this.Cr(n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,s=n.length+1;let i=n;M.isDocumentKey(i)||(i=i.child(""));const a=new mt(new M(i),0);let u=new Z(q);return this.br.forEachWhile(l=>{const d=l.key.path;return!!n.isPrefixOf(d)&&(d.length===s&&(u=u.add(l.wr)),!0)},a),A.resolve(this.Cr(u))}Cr(t){const e=[];return t.forEach(n=>{const s=this.Dr(n);s!==null&&e.push(s)}),e}removeMutationBatch(t,e){L(this.Fr(e.batchId,"removed")===0),this.mutationQueue.shift();let n=this.br;return A.forEach(e.mutations,s=>{const i=new mt(s.key,e.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(t,s.key)}).next(()=>{this.br=n})}On(t){}containsKey(t,e){const n=new mt(e,0),s=this.br.firstAfterOrEqual(n);return A.resolve(e.isEqual(s&&s.key))}performConsistencyCheck(t){return this.mutationQueue.length,A.resolve()}Fr(t,e){return this.vr(t)}vr(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Dr(t){const e=this.vr(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qp{constructor(t){this.Mr=t,this.docs=function(){return new nt(M.comparator)}(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const n=e.key,s=this.docs.get(n),i=s?s.size:0,a=this.Mr(e);return this.docs=this.docs.insert(n,{document:e.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(t,n.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const n=this.docs.get(e);return A.resolve(n?n.document.mutableCopy():it.newInvalidDocument(e))}getEntries(t,e){let n=kt();return e.forEach(s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():it.newInvalidDocument(s))}),A.resolve(n)}getDocumentsMatchingQuery(t,e,n,s){let i=kt();const a=e.path,u=new M(a.child("")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){const{key:d,value:{document:f}}=l.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||fo($c(f),n)<=0||(s.has(f.key)||br(e,f))&&(i=i.insert(f.key,f.mutableCopy()))}return A.resolve(i)}getAllFromCollectionGroup(t,e,n,s){O()}Or(t,e){return A.forEach(this.docs,n=>e(n))}newChangeBuffer(t){return new jp(this)}getSize(t){return A.resolve(this.size)}}class jp extends Yl{constructor(t){super(),this.cr=t}applyChanges(t){const e=[];return this.changes.forEach((n,s)=>{s.isValidDocument()?e.push(this.cr.addEntry(t,s)):this.cr.removeEntry(n)}),A.waitFor(e)}getFromCache(t,e){return this.cr.getEntry(t,e)}getAllFromCache(t,e){return this.cr.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zp{constructor(t){this.persistence=t,this.Nr=new Ie(e=>Oe(e),Ar),this.lastRemoteSnapshotVersion=B.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Vo,this.targetCount=0,this.kr=Be.Bn()}forEachTarget(t,e){return this.Nr.forEach((n,s)=>e(s)),A.resolve()}getLastRemoteSnapshotVersion(t){return A.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return A.resolve(this.Lr)}allocateTargetId(t){return this.highestTargetId=this.kr.next(),A.resolve(this.highestTargetId)}setTargetsMetadata(t,e,n){return n&&(this.lastRemoteSnapshotVersion=n),e>this.Lr&&(this.Lr=e),A.resolve()}Kn(t){this.Nr.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.kr=new Be(e),this.highestTargetId=e),t.sequenceNumber>this.Lr&&(this.Lr=t.sequenceNumber)}addTargetData(t,e){return this.Kn(e),this.targetCount+=1,A.resolve()}updateTargetData(t,e){return this.Kn(e),A.resolve()}removeTargetData(t,e){return this.Nr.delete(e.target),this.Br.gr(e.targetId),this.targetCount-=1,A.resolve()}removeTargets(t,e,n){let s=0;const i=[];return this.Nr.forEach((a,u)=>{u.sequenceNumber<=e&&n.get(u.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(t,u.targetId)),s++)}),A.waitFor(i).next(()=>s)}getTargetCount(t){return A.resolve(this.targetCount)}getTargetData(t,e){const n=this.Nr.get(e)||null;return A.resolve(n)}addMatchingKeys(t,e,n){return this.Br.Rr(e,n),A.resolve()}removeMatchingKeys(t,e,n){this.Br.mr(e,n);const s=this.persistence.referenceDelegate,i=[];return s&&e.forEach(a=>{i.push(s.markPotentiallyOrphaned(t,a))}),A.waitFor(i)}removeMatchingKeysForTargetId(t,e){return this.Br.gr(e),A.resolve()}getMatchingKeysForTargetId(t,e){const n=this.Br.yr(e);return A.resolve(n)}containsKey(t,e){return A.resolve(this.Br.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class th{constructor(t,e){this.qr={},this.overlays={},this.Qr=new Dt(0),this.Kr=!1,this.Kr=!0,this.$r=new Bp,this.referenceDelegate=t(this),this.Ur=new zp(this),this.indexManager=new bp,this.remoteDocumentCache=function(s){return new qp(s)}(n=>this.referenceDelegate.Wr(n)),this.serializer=new zl(e),this.Gr=new Fp(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new Lp,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let n=this.qr[t.toKey()];return n||(n=new Up(e,this.referenceDelegate),this.qr[t.toKey()]=n),n}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(t,e,n){V("MemoryPersistence","Starting transaction:",t);const s=new Gp(this.Qr.next());return this.referenceDelegate.zr(),n(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(t,e){return A.or(Object.values(this.qr).map(n=>()=>n.containsKey(t,e)))}}class Gp extends Wc{constructor(t){super(),this.currentSequenceNumber=t}}class Fs{constructor(t){this.persistence=t,this.Jr=new Vo,this.Yr=null}static Zr(t){return new Fs(t)}get Xr(){if(this.Yr)return this.Yr;throw O()}addReference(t,e,n){return this.Jr.addReference(n,e),this.Xr.delete(n.toString()),A.resolve()}removeReference(t,e,n){return this.Jr.removeReference(n,e),this.Xr.add(n.toString()),A.resolve()}markPotentiallyOrphaned(t,e){return this.Xr.add(e.toString()),A.resolve()}removeTarget(t,e){this.Jr.gr(e.targetId).forEach(s=>this.Xr.add(s.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(t,e.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>n.removeTargetData(t,e))}zr(){this.Yr=new Set}jr(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return A.forEach(this.Xr,n=>{const s=M.fromPath(n);return this.ei(t,s).next(i=>{i||e.removeEntry(s,B.min())})}).next(()=>(this.Yr=null,e.apply(t)))}updateLimboDocument(t,e){return this.ei(t,e).next(n=>{n?this.Xr.delete(e.toString()):this.Xr.add(e.toString())})}Wr(t){return 0}ei(t,e){return A.or([()=>A.resolve(this.Jr.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Hr(t,e)])}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kp{constructor(t){this.serializer=t}O(t,e,n,s){const i=new Cs("createOrUpgrade",e);n<1&&s>=1&&(function(l){l.createObjectStore("owner")}(t),function(l){l.createObjectStore("mutationQueues",{keyPath:"userId"}),l.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",Iu,{unique:!0}),l.createObjectStore("documentMutations")}(t),oc(t),function(l){l.createObjectStore("remoteDocuments")}(t));let a=A.resolve();return n<3&&s>=3&&(n!==0&&(function(l){l.deleteObjectStore("targetDocuments"),l.deleteObjectStore("targets"),l.deleteObjectStore("targetGlobal")}(t),oc(t)),a=a.next(()=>function(l){const d=l.store("targetGlobal"),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:B.min().toTimestamp(),targetCount:0};return d.put("targetGlobalKey",f)}(i))),n<4&&s>=4&&(n!==0&&(a=a.next(()=>function(l,d){return d.store("mutations").U().next(f=>{l.deleteObjectStore("mutations"),l.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",Iu,{unique:!0});const p=d.store("mutations"),I=f.map(S=>p.put(S));return A.waitFor(I)})}(t,i))),a=a.next(()=>{(function(l){l.createObjectStore("clientMetadata",{keyPath:"clientId"})})(t)})),n<5&&s>=5&&(a=a.next(()=>this.ni(i))),n<6&&s>=6&&(a=a.next(()=>(function(l){l.createObjectStore("remoteDocumentGlobal")}(t),this.ri(i)))),n<7&&s>=7&&(a=a.next(()=>this.ii(i))),n<8&&s>=8&&(a=a.next(()=>this.si(t,i))),n<9&&s>=9&&(a=a.next(()=>{(function(l){l.objectStoreNames.contains("remoteDocumentChanges")&&l.deleteObjectStore("remoteDocumentChanges")})(t)})),n<10&&s>=10&&(a=a.next(()=>this.oi(i))),n<11&&s>=11&&(a=a.next(()=>{(function(l){l.createObjectStore("bundles",{keyPath:"bundleId"})})(t),function(l){l.createObjectStore("namedQueries",{keyPath:"name"})}(t)})),n<12&&s>=12&&(a=a.next(()=>{(function(l){const d=l.createObjectStore("documentOverlays",{keyPath:vm});d.createIndex("collectionPathOverlayIndex",wm,{unique:!1}),d.createIndex("collectionGroupOverlayIndex",Am,{unique:!1})})(t)})),n<13&&s>=13&&(a=a.next(()=>function(l){const d=l.createObjectStore("remoteDocumentsV14",{keyPath:hm});d.createIndex("documentKeyIndex",dm),d.createIndex("collectionGroupIndex",fm)}(t)).next(()=>this._i(t,i)).next(()=>t.deleteObjectStore("remoteDocuments"))),n<14&&s>=14&&(a=a.next(()=>this.ai(t,i))),n<15&&s>=15&&(a=a.next(()=>function(l){l.createObjectStore("indexConfiguration",{keyPath:"indexId",autoIncrement:!0}).createIndex("collectionGroupIndex","collectionGroup",{unique:!1}),l.createObjectStore("indexState",{keyPath:ym}).createIndex("sequenceNumberIndex",Im,{unique:!1}),l.createObjectStore("indexEntries",{keyPath:Em}).createIndex("documentKeyIndex",Tm,{unique:!1})}(t))),n<16&&s>=16&&(a=a.next(()=>{e.objectStore("indexState").clear()}).next(()=>{e.objectStore("indexEntries").clear()})),n<17&&s>=17&&(a=a.next(()=>{(function(l){l.createObjectStore("globals",{keyPath:"name"})})(t)})),a}ri(t){let e=0;return t.store("remoteDocuments").J((n,s)=>{e+=Ts(s)}).next(()=>{const n={byteSize:e};return t.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey",n)})}ni(t){const e=t.store("mutationQueues"),n=t.store("mutations");return e.U().next(s=>A.forEach(s,i=>{const a=IDBKeyRange.bound([i.userId,-1],[i.userId,i.lastAcknowledgedBatchId]);return n.U("userMutationsIndex",a).next(u=>A.forEach(u,l=>{L(l.userId===i.userId);const d=Ve(this.serializer,l);return Wl(t,i.userId,d).next(()=>{})}))}))}ii(t){const e=t.store("targetDocuments"),n=t.store("remoteDocuments");return t.store("targetGlobal").get("targetGlobalKey").next(s=>{const i=[];return n.J((a,u)=>{const l=new J(a),d=function(p){return[0,Vt(p)]}(l);i.push(e.get(d).next(f=>f?A.resolve():(p=>e.put({targetId:0,path:Vt(p),sequenceNumber:s.highestListenSequenceNumber}))(l)))}).next(()=>A.waitFor(i))})}si(t,e){t.createObjectStore("collectionParents",{keyPath:_m});const n=e.store("collectionParents"),s=new Po,i=a=>{if(s.add(a)){const u=a.lastSegment(),l=a.popLast();return n.put({collectionId:u,parent:Vt(l)})}};return e.store("remoteDocuments").J({H:!0},(a,u)=>{const l=new J(a);return i(l.popLast())}).next(()=>e.store("documentMutations").J({H:!0},([a,u,l],d)=>{const f=qt(u);return i(f.popLast())}))}oi(t){const e=t.store("targets");return e.J((n,s)=>{const i=Zn(s),a=Gl(this.serializer,i);return e.put(a)})}_i(t,e){const n=e.store("remoteDocuments"),s=[];return n.J((i,a)=>{const u=e.store("remoteDocumentsV14"),l=function(p){return p.document?new M(J.fromString(p.document.name).popFirst(5)):p.noDocument?M.fromSegments(p.noDocument.path):p.unknownDocument?M.fromSegments(p.unknownDocument.path):O()}(a).path.toArray(),d={prefixPath:l.slice(0,l.length-2),collectionGroup:l[l.length-2],documentId:l[l.length-1],readTime:a.readTime||[0,0],unknownDocument:a.unknownDocument,noDocument:a.noDocument,document:a.document,hasCommittedMutations:!!a.hasCommittedMutations};s.push(u.put(d))}).next(()=>A.waitFor(s))}ai(t,e){const n=e.store("mutations"),s=Xl(this.serializer),i=new th(Fs.Zr,this.serializer.ct);return n.U().next(a=>{const u=new Map;return a.forEach(l=>{var d;let f=(d=u.get(l.userId))!==null&&d!==void 0?d:G();Ve(this.serializer,l).keys().forEach(p=>f=f.add(p)),u.set(l.userId,f)}),A.forEach(u,(l,d)=>{const f=new Rt(d),p=Ms.lt(this.serializer,f),I=i.getIndexManager(f),S=Os.lt(f,this.serializer,I,i.referenceDelegate);return new Zl(s,S,p,I).recalculateAndSaveOverlaysForDocumentKeys(new zi(e,Dt.oe),l).next()})})}}function oc(r){r.createObjectStore("targetDocuments",{keyPath:pm}).createIndex("documentTargetsIndex",gm,{unique:!0}),r.createObjectStore("targets",{keyPath:"targetId"}).createIndex("queryTargetsIndex",mm,{unique:!0}),r.createObjectStore("targetGlobal")}const Di="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";class Co{constructor(t,e,n,s,i,a,u,l,d,f,p=17){if(this.allowTabSynchronization=t,this.persistenceKey=e,this.clientId=n,this.ui=i,this.window=a,this.document=u,this.ci=d,this.li=f,this.hi=p,this.Qr=null,this.Kr=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Pi=null,this.inForeground=!1,this.Ii=null,this.Ti=null,this.Ei=Number.NEGATIVE_INFINITY,this.di=I=>Promise.resolve(),!Co.D())throw new C(P.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new Np(this,s),this.Ai=e+"main",this.serializer=new zl(l),this.Ri=new he(this.Ai,this.hi,new Kp(this.serializer)),this.$r=new Ep,this.Ur=new Pp(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Xl(this.serializer),this.Gr=new Ip,this.window&&this.window.localStorage?this.Vi=this.window.localStorage:(this.Vi=null,f===!1&&ht("IndexedDbPersistence","LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.mi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new C(P.FAILED_PRECONDITION,Di);return this.fi(),this.gi(),this.pi(),this.runTransaction("getHighestListenSequenceNumber","readonly",t=>this.Ur.getHighestSequenceNumber(t))}).then(t=>{this.Qr=new Dt(t,this.ci)}).then(()=>{this.Kr=!0}).catch(t=>(this.Ri&&this.Ri.close(),Promise.reject(t)))}yi(t){return this.di=async e=>{if(this.started)return t(e)},t(this.isPrimary)}setDatabaseDeletedListener(t){this.Ri.L(async e=>{e.newVersion===null&&await t()})}setNetworkEnabled(t){this.networkEnabled!==t&&(this.networkEnabled=t,this.ui.enqueueAndForget(async()=>{this.started&&await this.mi()}))}mi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",t=>ns(t).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.wi(t).next(e=>{e||(this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)))})}).next(()=>this.Si(t)).next(e=>this.isPrimary&&!e?this.bi(t).next(()=>!1):!!e&&this.Di(t).next(()=>!0))).catch(t=>{if(ye(t))return V("IndexedDbPersistence","Failed to extend owner lease: ",t),this.isPrimary;if(!this.allowTabSynchronization)throw t;return V("IndexedDbPersistence","Releasing owner lease after error during lease refresh",t),!1}).then(t=>{this.isPrimary!==t&&this.ui.enqueueRetryable(()=>this.di(t)),this.isPrimary=t})}wi(t){return Hn(t).get("owner").next(e=>A.resolve(this.vi(e)))}Ci(t){return ns(t).delete(this.clientId)}async Fi(){if(this.isPrimary&&!this.Mi(this.Ei,18e5)){this.Ei=Date.now();const t=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",e=>{const n=ft(e,"clientMetadata");return n.U().next(s=>{const i=this.xi(s,18e5),a=s.filter(u=>i.indexOf(u)===-1);return A.forEach(a,u=>n.delete(u.clientId)).next(()=>a)})}).catch(()=>[]);if(this.Vi)for(const e of t)this.Vi.removeItem(this.Oi(e.clientId))}}pi(){this.Ti=this.ui.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.mi().then(()=>this.Fi()).then(()=>this.pi()))}vi(t){return!!t&&t.ownerId===this.clientId}Si(t){return this.li?A.resolve(!0):Hn(t).get("owner").next(e=>{if(e!==null&&this.Mi(e.leaseTimestampMs,5e3)&&!this.Ni(e.ownerId)){if(this.vi(e)&&this.networkEnabled)return!0;if(!this.vi(e)){if(!e.allowTabSynchronization)throw new C(P.FAILED_PRECONDITION,Di);return!1}}return!(!this.networkEnabled||!this.inForeground)||ns(t).U().next(n=>this.xi(n,5e3).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,a=!this.inForeground&&s.inForeground,u=this.networkEnabled===s.networkEnabled;if(i||a&&u)return!0}return!1})===void 0)}).next(e=>(this.isPrimary!==e&&V("IndexedDbPersistence",`Client ${e?"is":"is not"} eligible for a primary lease.`),e))}async shutdown(){this.Kr=!1,this.Li(),this.Ti&&(this.Ti.cancel(),this.Ti=null),this.Bi(),this.ki(),await this.Ri.runTransaction("shutdown","readwrite",["owner","clientMetadata"],t=>{const e=new zi(t,Dt.oe);return this.bi(e).next(()=>this.Ci(e))}),this.Ri.close(),this.qi()}xi(t,e){return t.filter(n=>this.Mi(n.updateTimeMs,e)&&!this.Ni(n.clientId))}Qi(){return this.runTransaction("getActiveClients","readonly",t=>ns(t).U().next(e=>this.xi(e,18e5).map(n=>n.clientId)))}get started(){return this.Kr}getGlobalsCache(){return this.$r}getMutationQueue(t,e){return Os.lt(t,this.serializer,e,this.referenceDelegate)}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(t){return new Sp(t,this.serializer.ct.databaseId)}getDocumentOverlayCache(t){return Ms.lt(this.serializer,t)}getBundleCache(){return this.Gr}runTransaction(t,e,n){V("IndexedDbPersistence","Starting transaction:",t);const s=e==="readonly"?"readonly":"readwrite",i=function(l){return l===17?Sm:l===16?bm:l===15?po:l===14?tl:l===13?Zc:l===12?Rm:l===11?Xc:void O()}(this.hi);let a;return this.Ri.runTransaction(t,s,i,u=>(a=new zi(u,this.Qr?this.Qr.next():Dt.oe),e==="readwrite-primary"?this.wi(a).next(l=>!!l||this.Si(a)).next(l=>{if(!l)throw ht(`Failed to obtain primary lease for action '${t}'.`),this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)),new C(P.FAILED_PRECONDITION,Qc);return n(a)}).next(l=>this.Di(a).next(()=>l)):this.Ki(a).next(()=>n(a)))).then(u=>(a.raiseOnCommittedEvent(),u))}Ki(t){return Hn(t).get("owner").next(e=>{if(e!==null&&this.Mi(e.leaseTimestampMs,5e3)&&!this.Ni(e.ownerId)&&!this.vi(e)&&!(this.li||this.allowTabSynchronization&&e.allowTabSynchronization))throw new C(P.FAILED_PRECONDITION,Di)})}Di(t){const e={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Hn(t).put("owner",e)}static D(){return he.D()}bi(t){const e=Hn(t);return e.get("owner").next(n=>this.vi(n)?(V("IndexedDbPersistence","Releasing primary lease."),e.delete("owner")):A.resolve())}Mi(t,e){const n=Date.now();return!(t<n-e)&&(!(t>n)||(ht(`Detected an update time that is in the future: ${t} > ${n}`),!1))}fi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Ii=()=>{this.ui.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.mi()))},this.document.addEventListener("visibilitychange",this.Ii),this.inForeground=this.document.visibilityState==="visible")}Bi(){this.Ii&&(this.document.removeEventListener("visibilitychange",this.Ii),this.Ii=null)}gi(){var t;typeof((t=this.window)===null||t===void 0?void 0:t.addEventListener)=="function"&&(this.Pi=()=>{this.Li();const e=/(?:Version|Mobile)\/1[456]/;Vc()&&(navigator.appVersion.match(e)||navigator.userAgent.match(e))&&this.ui.enterRestrictedMode(!0),this.ui.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Pi))}ki(){this.Pi&&(this.window.removeEventListener("pagehide",this.Pi),this.Pi=null)}Ni(t){var e;try{const n=((e=this.Vi)===null||e===void 0?void 0:e.getItem(this.Oi(t)))!==null;return V("IndexedDbPersistence",`Client '${t}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return ht("IndexedDbPersistence","Failed to get zombied client id.",n),!1}}Li(){if(this.Vi)try{this.Vi.setItem(this.Oi(this.clientId),String(Date.now()))}catch(t){ht("Failed to set zombie client id.",t)}}qi(){if(this.Vi)try{this.Vi.removeItem(this.Oi(this.clientId))}catch{}}Oi(t){return`firestore_zombie_${this.persistenceKey}_${t}`}}function Hn(r){return ft(r,"owner")}function ns(r){return ft(r,"clientMetadata")}function eh(r,t){let e=r.projectId;return r.isDefaultDatabase||(e+="."+r.database),"firestore/"+t+"/"+e+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Do{constructor(t,e,n,s){this.targetId=t,this.fromCache=e,this.$i=n,this.Ui=s}static Wi(t,e){let n=G(),s=G();for(const i of e.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Do(t,e.fromCache,n,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $p{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nh{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return Vc()?8:Hc(on())>0?6:4}()}initialize(t,e){this.Ji=t,this.indexManager=e,this.Gi=!0}getDocumentsMatchingQuery(t,e,n,s){const i={result:null};return this.Yi(t,e).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(t,e,s,n).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new $p;return this.Xi(t,e,a).next(u=>{if(i.result=u,this.zi)return this.es(t,e,a,u.size)})}).next(()=>i.result)}es(t,e,n,s){return n.documentReadCount<this.ji?(Xe()<=Q.DEBUG&&V("QueryEngine","SDK will not create cache indexes for query:",Ze(e),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),A.resolve()):(Xe()<=Q.DEBUG&&V("QueryEngine","Query:",Ze(e),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.Hi*s?(Xe()<=Q.DEBUG&&V("QueryEngine","The SDK decides to create cache indexes for query:",Ze(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,Mt(e))):A.resolve())}Yi(t,e){if(xu(e))return A.resolve(null);let n=Mt(e);return this.indexManager.getIndexType(t,n).next(s=>s===0?null:(e.limit!==null&&s===1&&(e=ys(e,null,"F"),n=Mt(e)),this.indexManager.getDocumentsMatchingTarget(t,n).next(i=>{const a=G(...i);return this.Ji.getDocuments(t,a).next(u=>this.indexManager.getMinOffset(t,n).next(l=>{const d=this.ts(e,u);return this.ns(e,d,a,l.readTime)?this.Yi(t,ys(e,null,"F")):this.rs(t,d,e,l)}))})))}Zi(t,e,n,s){return xu(e)||s.isEqual(B.min())?A.resolve(null):this.Ji.getDocuments(t,n).next(i=>{const a=this.ts(e,i);return this.ns(e,a,n,s)?A.resolve(null):(Xe()<=Q.DEBUG&&V("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Ze(e)),this.rs(t,a,e,Kc(s,-1)).next(u=>u))})}ts(t,e){let n=new Z(_l(t));return e.forEach((s,i)=>{br(t,i)&&(n=n.add(i))}),n}ns(t,e,n,s){if(t.limit===null)return!1;if(n.size!==e.size)return!0;const i=t.limitType==="F"?e.last():e.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(t,e,n){return Xe()<=Q.DEBUG&&V("QueryEngine","Using full collection scan to execute query:",Ze(e)),this.Ji.getDocumentsMatchingQuery(t,e,Ft.min(),n)}rs(t,e,n,s){return this.Ji.getDocumentsMatchingQuery(t,n,s).next(i=>(e.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qp{constructor(t,e,n,s){this.persistence=t,this.ss=e,this.serializer=s,this.os=new nt(q),this._s=new Ie(i=>Oe(i),Ar),this.us=new Map,this.cs=t.getRemoteDocumentCache(),this.Ur=t.getTargetCache(),this.Gr=t.getBundleCache(),this.ls(n)}ls(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new Zl(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.os))}}function rh(r,t,e,n){return new Qp(r,t,e,n)}async function sh(r,t){const e=F(r);return await e.persistence.runTransaction("Handle user change","readonly",n=>{let s;return e.mutationQueue.getAllMutationBatches(n).next(i=>(s=i,e.ls(t),e.mutationQueue.getAllMutationBatches(n))).next(i=>{const a=[],u=[];let l=G();for(const d of s){a.push(d.batchId);for(const f of d.mutations)l=l.add(f.key)}for(const d of i){u.push(d.batchId);for(const f of d.mutations)l=l.add(f.key)}return e.localDocuments.getDocuments(n,l).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:u}))})})}function Wp(r,t){const e=F(r);return e.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const s=t.batch.keys(),i=e.cs.newChangeBuffer({trackRemovals:!0});return function(u,l,d,f){const p=d.batch,I=p.keys();let S=A.resolve();return I.forEach(D=>{S=S.next(()=>f.getEntry(l,D)).next(k=>{const x=d.docVersions.get(D);L(x!==null),k.version.compareTo(x)<0&&(p.applyToRemoteDocument(k,d),k.isValidDocument()&&(k.setReadTime(d.commitVersion),f.addEntry(k)))})}),S.next(()=>u.mutationQueue.removeMutationBatch(l,p))}(e,n,t,i).next(()=>i.apply(n)).next(()=>e.mutationQueue.performConsistencyCheck(n)).next(()=>e.documentOverlayCache.removeOverlaysForBatchId(n,s,t.batch.batchId)).next(()=>e.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(u){let l=G();for(let d=0;d<u.mutationResults.length;++d)u.mutationResults[d].transformResults.length>0&&(l=l.add(u.batch.mutations[d].key));return l}(t))).next(()=>e.localDocuments.getDocuments(n,s))})}function ih(r){const t=F(r);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.Ur.getLastRemoteSnapshotVersion(e))}function Hp(r,t){const e=F(r),n=t.snapshotVersion;let s=e.os;return e.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=e.cs.newChangeBuffer({trackRemovals:!0});s=e.os;const u=[];t.targetChanges.forEach((f,p)=>{const I=s.get(p);if(!I)return;u.push(e.Ur.removeMatchingKeys(i,f.removedDocuments,p).next(()=>e.Ur.addMatchingKeys(i,f.addedDocuments,p)));let S=I.withSequenceNumber(i.currentSequenceNumber);t.targetMismatches.get(p)!==null?S=S.withResumeToken(lt.EMPTY_BYTE_STRING,B.min()).withLastLimboFreeSnapshotVersion(B.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,n)),s=s.insert(p,S),function(k,x,z){return k.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=3e8?!0:z.addedDocuments.size+z.modifiedDocuments.size+z.removedDocuments.size>0}(I,S,f)&&u.push(e.Ur.updateTargetData(i,S))});let l=kt(),d=G();if(t.documentUpdates.forEach(f=>{t.resolvedLimboDocuments.has(f)&&u.push(e.persistence.referenceDelegate.updateLimboDocument(i,f))}),u.push(Jp(i,a,t.documentUpdates).next(f=>{l=f.Ps,d=f.Is})),!n.isEqual(B.min())){const f=e.Ur.getLastRemoteSnapshotVersion(i).next(p=>e.Ur.setTargetsMetadata(i,i.currentSequenceNumber,n));u.push(f)}return A.waitFor(u).next(()=>a.apply(i)).next(()=>e.localDocuments.getLocalViewOfDocuments(i,l,d)).next(()=>l)}).then(i=>(e.os=s,i))}function Jp(r,t,e){let n=G(),s=G();return e.forEach(i=>n=n.add(i)),t.getEntries(r,n).next(i=>{let a=kt();return e.forEach((u,l)=>{const d=i.get(u);l.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(u)),l.isNoDocument()&&l.version.isEqual(B.min())?(t.removeEntry(u,l.readTime),a=a.insert(u,l)):!d.isValidDocument()||l.version.compareTo(d.version)>0||l.version.compareTo(d.version)===0&&d.hasPendingWrites?(t.addEntry(l),a=a.insert(u,l)):V("LocalStore","Ignoring outdated watch update for ",u,". Current version:",d.version," Watch version:",l.version)}),{Ps:a,Is:s}})}function Yp(r,t){const e=F(r);return e.persistence.runTransaction("Get next mutation batch","readonly",n=>(t===void 0&&(t=-1),e.mutationQueue.getNextMutationBatchAfterBatchId(n,t)))}function vs(r,t){const e=F(r);return e.persistence.runTransaction("Allocate target","readwrite",n=>{let s;return e.Ur.getTargetData(n,t).next(i=>i?(s=i,A.resolve(s)):e.Ur.allocateTargetId(n).next(a=>(s=new Wt(t,a,"TargetPurposeListen",n.currentSequenceNumber),e.Ur.addTargetData(n,s).next(()=>s))))}).then(n=>{const s=e.os.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(e.os=e.os.insert(n.targetId,n),e._s.set(t,n.targetId)),n})}async function pn(r,t,e){const n=F(r),s=n.os.get(t),i=e?"readwrite":"readwrite-primary";try{e||await n.persistence.runTransaction("Release target",i,a=>n.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!ye(a))throw a;V("LocalStore",`Failed to update sequence numbers for target ${t}: ${a}`)}n.os=n.os.remove(t),n._s.delete(s.target)}function ro(r,t,e){const n=F(r);let s=B.min(),i=G();return n.persistence.runTransaction("Execute query","readwrite",a=>function(l,d,f){const p=F(l),I=p._s.get(f);return I!==void 0?A.resolve(p.os.get(I)):p.Ur.getTargetData(d,f)}(n,a,Mt(t)).next(u=>{if(u)return s=u.lastLimboFreeSnapshotVersion,n.Ur.getMatchingKeysForTargetId(a,u.targetId).next(l=>{i=l})}).next(()=>n.ss.getDocumentsMatchingQuery(a,t,e?s:B.min(),e?i:G())).next(u=>(uh(n,gl(t),u),{documents:u,Ts:i})))}function oh(r,t){const e=F(r),n=F(e.Ur),s=e.os.get(t);return s?Promise.resolve(s.target):e.persistence.runTransaction("Get target data","readonly",i=>n.ot(i,t).next(a=>a?a.target:null))}function ah(r,t){const e=F(r),n=e.us.get(t)||B.min();return e.persistence.runTransaction("Get new document changes","readonly",s=>e.cs.getAllFromCollectionGroup(s,t,Kc(n,-1),Number.MAX_SAFE_INTEGER)).then(s=>(uh(e,t,s),s))}function uh(r,t,e){let n=r.us.get(t)||B.min();e.forEach((s,i)=>{i.readTime.compareTo(n)>0&&(n=i.readTime)}),r.us.set(t,n)}function ac(r,t){return`firestore_clients_${r}_${t}`}function uc(r,t,e){let n=`firestore_mutations_${r}_${e}`;return t.isAuthenticated()&&(n+=`_${t.uid}`),n}function xi(r,t){return`firestore_targets_${r}_${t}`}class ws{constructor(t,e,n,s){this.user=t,this.batchId=e,this.state=n,this.error=s}static Rs(t,e,n){const s=JSON.parse(n);let i,a=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return a&&s.error&&(a=typeof s.error.message=="string"&&typeof s.error.code=="string",a&&(i=new C(s.error.code,s.error.message))),a?new ws(t,e,s.state,i):(ht("SharedClientState",`Failed to parse mutation state for ID '${e}': ${n}`),null)}Vs(){const t={state:this.state,updateTimeMs:Date.now()};return this.error&&(t.error={code:this.error.code,message:this.error.message}),JSON.stringify(t)}}class ir{constructor(t,e,n){this.targetId=t,this.state=e,this.error=n}static Rs(t,e){const n=JSON.parse(e);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new C(n.error.code,n.error.message))),i?new ir(t,n.state,s):(ht("SharedClientState",`Failed to parse target state for ID '${t}': ${e}`),null)}Vs(){const t={state:this.state,updateTimeMs:Date.now()};return this.error&&(t.error={code:this.error.code,message:this.error.message}),JSON.stringify(t)}}class As{constructor(t,e){this.clientId=t,this.activeTargetIds=e}static Rs(t,e){const n=JSON.parse(e);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=Io();for(let a=0;s&&a<n.activeTargetIds.length;++a)s=Jc(n.activeTargetIds[a]),i=i.add(n.activeTargetIds[a]);return s?new As(t,i):(ht("SharedClientState",`Failed to parse client data for instance '${t}': ${e}`),null)}}class xo{constructor(t,e){this.clientId=t,this.onlineState=e}static Rs(t){const e=JSON.parse(t);return typeof e=="object"&&["Unknown","Online","Offline"].indexOf(e.onlineState)!==-1&&typeof e.clientId=="string"?new xo(e.clientId,e.onlineState):(ht("SharedClientState",`Failed to parse online state: ${t}`),null)}}class so{constructor(){this.activeTargetIds=Io()}fs(t){this.activeTargetIds=this.activeTargetIds.add(t)}gs(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Vs(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class Ni{constructor(t,e,n,s,i){this.window=t,this.ui=e,this.persistenceKey=n,this.ps=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ys=this.ws.bind(this),this.Ss=new nt(q),this.started=!1,this.bs=[];const a=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Ds=ac(this.persistenceKey,this.ps),this.vs=function(l){return`firestore_sequence_number_${l}`}(this.persistenceKey),this.Ss=this.Ss.insert(this.ps,new so),this.Cs=new RegExp(`^firestore_clients_${a}_([^_]*)$`),this.Fs=new RegExp(`^firestore_mutations_${a}_(\\d+)(?:_(.*))?$`),this.Ms=new RegExp(`^firestore_targets_${a}_(\\d+)$`),this.xs=function(l){return`firestore_online_state_${l}`}(this.persistenceKey),this.Os=function(l){return`firestore_bundle_loaded_v2_${l}`}(this.persistenceKey),this.window.addEventListener("storage",this.ys)}static D(t){return!(!t||!t.localStorage)}async start(){const t=await this.syncEngine.Qi();for(const n of t){if(n===this.ps)continue;const s=this.getItem(ac(this.persistenceKey,n));if(s){const i=As.Rs(n,s);i&&(this.Ss=this.Ss.insert(i.clientId,i))}}this.Ns();const e=this.storage.getItem(this.xs);if(e){const n=this.Ls(e);n&&this.Bs(n)}for(const n of this.bs)this.ws(n);this.bs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(t){this.setItem(this.vs,JSON.stringify(t))}getAllActiveQueryTargets(){return this.ks(this.Ss)}isActiveQueryTarget(t){let e=!1;return this.Ss.forEach((n,s)=>{s.activeTargetIds.has(t)&&(e=!0)}),e}addPendingMutation(t){this.qs(t,"pending")}updateMutationState(t,e,n){this.qs(t,e,n),this.Qs(t)}addLocalQueryTarget(t,e=!0){let n="not-current";if(this.isActiveQueryTarget(t)){const s=this.storage.getItem(xi(this.persistenceKey,t));if(s){const i=ir.Rs(t,s);i&&(n=i.state)}}return e&&this.Ks.fs(t),this.Ns(),n}removeLocalQueryTarget(t){this.Ks.gs(t),this.Ns()}isLocalQueryTarget(t){return this.Ks.activeTargetIds.has(t)}clearQueryState(t){this.removeItem(xi(this.persistenceKey,t))}updateQueryState(t,e,n){this.$s(t,e,n)}handleUserChange(t,e,n){e.forEach(s=>{this.Qs(s)}),this.currentUser=t,n.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(t){this.Us(t)}notifyBundleLoaded(t){this.Ws(t)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ys),this.removeItem(this.Ds),this.started=!1)}getItem(t){const e=this.storage.getItem(t);return V("SharedClientState","READ",t,e),e}setItem(t,e){V("SharedClientState","SET",t,e),this.storage.setItem(t,e)}removeItem(t){V("SharedClientState","REMOVE",t),this.storage.removeItem(t)}ws(t){const e=t;if(e.storageArea===this.storage){if(V("SharedClientState","EVENT",e.key,e.newValue),e.key===this.Ds)return void ht("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.ui.enqueueRetryable(async()=>{if(this.started){if(e.key!==null){if(this.Cs.test(e.key)){if(e.newValue==null){const n=this.Gs(e.key);return this.zs(n,null)}{const n=this.js(e.key,e.newValue);if(n)return this.zs(n.clientId,n)}}else if(this.Fs.test(e.key)){if(e.newValue!==null){const n=this.Hs(e.key,e.newValue);if(n)return this.Js(n)}}else if(this.Ms.test(e.key)){if(e.newValue!==null){const n=this.Ys(e.key,e.newValue);if(n)return this.Zs(n)}}else if(e.key===this.xs){if(e.newValue!==null){const n=this.Ls(e.newValue);if(n)return this.Bs(n)}}else if(e.key===this.vs){const n=function(i){let a=Dt.oe;if(i!=null)try{const u=JSON.parse(i);L(typeof u=="number"),a=u}catch(u){ht("SharedClientState","Failed to read sequence number from WebStorage",u)}return a}(e.newValue);n!==Dt.oe&&this.sequenceNumberHandler(n)}else if(e.key===this.Os){const n=this.Xs(e.newValue);await Promise.all(n.map(s=>this.syncEngine.eo(s)))}}}else this.bs.push(e)})}}get Ks(){return this.Ss.get(this.ps)}Ns(){this.setItem(this.Ds,this.Ks.Vs())}qs(t,e,n){const s=new ws(this.currentUser,t,e,n),i=uc(this.persistenceKey,this.currentUser,t);this.setItem(i,s.Vs())}Qs(t){const e=uc(this.persistenceKey,this.currentUser,t);this.removeItem(e)}Us(t){const e={clientId:this.ps,onlineState:t};this.storage.setItem(this.xs,JSON.stringify(e))}$s(t,e,n){const s=xi(this.persistenceKey,t),i=new ir(t,e,n);this.setItem(s,i.Vs())}Ws(t){const e=JSON.stringify(Array.from(t));this.setItem(this.Os,e)}Gs(t){const e=this.Cs.exec(t);return e?e[1]:null}js(t,e){const n=this.Gs(t);return As.Rs(n,e)}Hs(t,e){const n=this.Fs.exec(t),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return ws.Rs(new Rt(i),s,e)}Ys(t,e){const n=this.Ms.exec(t),s=Number(n[1]);return ir.Rs(s,e)}Ls(t){return xo.Rs(t)}Xs(t){return JSON.parse(t)}async Js(t){if(t.user.uid===this.currentUser.uid)return this.syncEngine.no(t.batchId,t.state,t.error);V("SharedClientState",`Ignoring mutation for non-active user ${t.user.uid}`)}Zs(t){return this.syncEngine.ro(t.targetId,t.state,t.error)}zs(t,e){const n=e?this.Ss.insert(t,e):this.Ss.remove(t),s=this.ks(this.Ss),i=this.ks(n),a=[],u=[];return i.forEach(l=>{s.has(l)||a.push(l)}),s.forEach(l=>{i.has(l)||u.push(l)}),this.syncEngine.io(a,u).then(()=>{this.Ss=n})}Bs(t){this.Ss.get(t.clientId)&&this.onlineStateHandler(t.onlineState)}ks(t){let e=Io();return t.forEach((n,s)=>{e=e.unionWith(s.activeTargetIds)}),e}}class ch{constructor(){this.so=new so,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,n){}addLocalQueryTarget(t,e=!0){return e&&this.so.fs(t),this.oo[t]||"not-current"}updateQueryState(t,e,n){this.oo[t]=e}removeLocalQueryTarget(t){this.so.gs(t)}isLocalQueryTarget(t){return this.so.activeTargetIds.has(t)}clearQueryState(t){delete this.oo[t]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(t){return this.so.activeTargetIds.has(t)}start(){return this.so=new so,Promise.resolve()}handleUserChange(t,e,n){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xp{_o(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cc{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(t){this.ho.push(t)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){V("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const t of this.ho)t(0)}lo(){V("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const t of this.ho)t(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let rs=null;function ki(){return rs===null?rs=function(){return 268435456+Math.round(2147483648*Math.random())}():rs++,"0x"+rs.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zp={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tg{constructor(t){this.Io=t.Io,this.To=t.To}Eo(t){this.Ao=t}Ro(t){this.Vo=t}mo(t){this.fo=t}onMessage(t){this.po=t}close(){this.To()}send(t){this.Io(t)}yo(){this.Ao()}wo(){this.Vo()}So(t){this.fo(t)}bo(t){this.po(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const At="WebChannelConnection";class eg extends class{constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=n+"://"+e.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(e,n,s,i,a){const u=ki(),l=this.xo(e,n.toUriEncodedString());V("RestConnection",`Sending RPC '${e}' ${u}:`,l,s);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,i,a),this.No(e,l,d,s).then(f=>(V("RestConnection",`Received RPC '${e}' ${u}: `,f),f),f=>{throw an("RestConnection",`RPC '${e}' ${u} failed with error: `,f,"url: ",l,"request:",s),f})}Lo(e,n,s,i,a,u){return this.Mo(e,n,s,i,a)}Oo(e,n,s){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+En}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((i,a)=>e[a]=i),s&&s.headers.forEach((i,a)=>e[a]=i)}xo(e,n){const s=Zp[e];return`${this.Do}/v1/${n}:${s}`}terminate(){}}{constructor(t){super(t),this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}No(t,e,n,s){const i=ki();return new Promise((a,u)=>{const l=new Lc;l.setWithCredentials(!0),l.listenOnce(Bc.COMPLETE,()=>{try{switch(l.getLastErrorCode()){case ss.NO_ERROR:const f=l.getResponseJson();V(At,`XHR for RPC '${t}' ${i} received:`,JSON.stringify(f)),a(f);break;case ss.TIMEOUT:V(At,`RPC '${t}' ${i} timed out`),u(new C(P.DEADLINE_EXCEEDED,"Request time out"));break;case ss.HTTP_ERROR:const p=l.getStatus();if(V(At,`RPC '${t}' ${i} failed with status:`,p,"response text:",l.getResponseText()),p>0){let I=l.getResponseJson();Array.isArray(I)&&(I=I[0]);const S=I==null?void 0:I.error;if(S&&S.status&&S.message){const D=function(x){const z=x.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(z)>=0?z:P.UNKNOWN}(S.status);u(new C(D,S.message))}else u(new C(P.UNKNOWN,"Server responded with status "+l.getStatus()))}else u(new C(P.UNAVAILABLE,"Connection failed."));break;default:O()}}finally{V(At,`RPC '${t}' ${i} completed.`)}});const d=JSON.stringify(s);V(At,`RPC '${t}' ${i} sending request:`,s),l.send(e,"POST",d,n,15)})}Bo(t,e,n){const s=ki(),i=[this.Do,"/","google.firestore.v1.Firestore","/",t,"/channel"],a=jc(),u=qc(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(l.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(l.useFetchStreams=!0),this.Oo(l.initMessageHeaders,e,n),l.encodeInitMessageHeaders=!0;const f=i.join("");V(At,`Creating RPC '${t}' stream ${s}: ${f}`,l);const p=a.createWebChannel(f,l);let I=!1,S=!1;const D=new tg({Io:x=>{S?V(At,`Not sending because RPC '${t}' stream ${s} is closed:`,x):(I||(V(At,`Opening RPC '${t}' stream ${s} transport.`),p.open(),I=!0),V(At,`RPC '${t}' stream ${s} sending:`,x),p.send(x))},To:()=>p.close()}),k=(x,z,j)=>{x.listen(z,U=>{try{j(U)}catch(Y){setTimeout(()=>{throw Y},0)}})};return k(p,Jn.EventType.OPEN,()=>{S||(V(At,`RPC '${t}' stream ${s} transport opened.`),D.yo())}),k(p,Jn.EventType.CLOSE,()=>{S||(S=!0,V(At,`RPC '${t}' stream ${s} transport closed`),D.So())}),k(p,Jn.EventType.ERROR,x=>{S||(S=!0,an(At,`RPC '${t}' stream ${s} transport errored:`,x),D.So(new C(P.UNAVAILABLE,"The operation could not be completed")))}),k(p,Jn.EventType.MESSAGE,x=>{var z;if(!S){const j=x.data[0];L(!!j);const U=j,Y=U.error||((z=U[0])===null||z===void 0?void 0:z.error);if(Y){V(At,`RPC '${t}' stream ${s} received error:`,Y);const et=Y.status;let W=function(y){const T=dt[y];if(T!==void 0)return Vl(T)}(et),E=Y.message;W===void 0&&(W=P.INTERNAL,E="Unknown error status: "+et+" with message "+Y.message),S=!0,D.So(new C(W,E)),p.close()}else V(At,`RPC '${t}' stream ${s} received:`,j),D.bo(j)}}),k(u,Uc.STAT_EVENT,x=>{x.stat===qi.PROXY?V(At,`RPC '${t}' stream ${s} detected buffering proxy`):x.stat===qi.NOPROXY&&V(At,`RPC '${t}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{D.wo()},0),D}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lh(){return typeof window<"u"?window:null}function hs(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ls(r){return new ap(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class No{constructor(t,e,n=1e3,s=1.5,i=6e4){this.ui=t,this.timerId=e,this.ko=n,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(t){this.cancel();const e=Math.floor(this.Ko+this.zo()),n=Math.max(0,Date.now()-this.Uo),s=Math.max(0,e-n);s>0&&V("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),t())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hh{constructor(t,e,n,s,i,a,u,l){this.ui=t,this.Ho=n,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new No(t,e)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(t){this.u_(),this.stream.send(t)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(t,e){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,t!==4?this.t_.reset():e&&e.code===P.RESOURCE_EXHAUSTED?(ht(e.toString()),ht("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):e&&e.code===P.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.mo(e)}l_(){}auth(){this.state=1;const t=this.h_(this.Yo),e=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,s])=>{this.Yo===e&&this.P_(n,s)},n=>{t(()=>{const s=new C(P.UNKNOWN,"Fetching auth token failed: "+n.message);return this.I_(s)})})}P_(t,e){const n=this.h_(this.Yo);this.stream=this.T_(t,e),this.stream.Eo(()=>{n(()=>this.listener.Eo())}),this.stream.Ro(()=>{n(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{n(()=>this.I_(s))}),this.stream.onMessage(s=>{n(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(t){return V("PersistentStream",`close with error: ${t}`),this.stream=null,this.close(4,t)}h_(t){return e=>{this.ui.enqueueAndForget(()=>this.Yo===t?e():(V("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class ng extends hh{constructor(t,e,n,s,i,a){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,n,s,a),this.serializer=i}T_(t,e){return this.connection.Bo("Listen",t,e)}E_(t){return this.onNext(t)}onNext(t){this.t_.reset();const e=hp(this.serializer,t),n=function(i){if(!("targetChange"in i))return B.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?B.min():a.readTime?pt(a.readTime):B.min()}(t);return this.listener.d_(e,n)}A_(t){const e={};e.database=Xi(this.serializer),e.addTarget=function(i,a){let u;const l=a.target;if(u=gs(l)?{documents:Fl(i,l)}:{query:Ll(i,l)._t},u.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){u.resumeToken=xl(i,a.resumeToken);const d=Ji(i,a.expectedCount);d!==null&&(u.expectedCount=d)}else if(a.snapshotVersion.compareTo(B.min())>0){u.readTime=mn(i,a.snapshotVersion.toTimestamp());const d=Ji(i,a.expectedCount);d!==null&&(u.expectedCount=d)}return u}(this.serializer,t);const n=fp(this.serializer,t);n&&(e.labels=n),this.a_(e)}R_(t){const e={};e.database=Xi(this.serializer),e.removeTarget=t,this.a_(e)}}class rg extends hh{constructor(t,e,n,s,i,a){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,n,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(t,e){return this.connection.Bo("Write",t,e)}E_(t){return L(!!t.streamToken),this.lastStreamToken=t.streamToken,L(!t.writeResults||t.writeResults.length===0),this.listener.f_()}onNext(t){L(!!t.streamToken),this.lastStreamToken=t.streamToken,this.t_.reset();const e=dp(t.writeResults,t.commitTime),n=pt(t.commitTime);return this.listener.g_(n,e)}p_(){const t={};t.database=Xi(this.serializer),this.a_(t)}m_(t){const e={streamToken:this.lastStreamToken,writes:t.map(n=>Er(this.serializer,n))};this.a_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sg extends class{}{constructor(t,e,n,s){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=n,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new C(P.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(t,e,n,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(t,Yi(e,n),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new C(P.UNKNOWN,i.toString())})}Lo(t,e,n,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,u])=>this.connection.Lo(t,Yi(e,n),s,a,u,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new C(P.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class ig{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(t){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.C_("Offline")))}set(t){this.x_(),this.S_=0,t==="Online"&&(this.D_=!1),this.C_(t)}C_(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}F_(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(ht(e),this.D_=!1):V("OnlineStateTracker",e)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class og{constructor(t,e,n,s,i){this.localStore=t,this.datastore=e,this.asyncQueue=n,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{n.enqueueAndForget(async()=>{qe(this)&&(V("RemoteStore","Restarting streams for network reachability change."),await async function(l){const d=F(l);d.L_.add(4),await Vr(d),d.q_.set("Unknown"),d.L_.delete(4),await Bs(d)}(this))})}),this.q_=new ig(n,s)}}async function Bs(r){if(qe(r))for(const t of r.B_)await t(!0)}async function Vr(r){for(const t of r.B_)await t(!1)}function Us(r,t){const e=F(r);e.N_.has(t.targetId)||(e.N_.set(t.targetId,t),Oo(e)?Mo(e):Rn(e).r_()&&ko(e,t))}function gn(r,t){const e=F(r),n=Rn(e);e.N_.delete(t),n.r_()&&dh(e,t),e.N_.size===0&&(n.r_()?n.o_():qe(e)&&e.q_.set("Unknown"))}function ko(r,t){if(r.Q_.xe(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(B.min())>0){const e=r.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(e)}Rn(r).A_(t)}function dh(r,t){r.Q_.xe(t),Rn(r).R_(t)}function Mo(r){r.Q_=new rp({getRemoteKeysForTarget:t=>r.remoteSyncer.getRemoteKeysForTarget(t),ot:t=>r.N_.get(t)||null,tt:()=>r.datastore.serializer.databaseId}),Rn(r).start(),r.q_.v_()}function Oo(r){return qe(r)&&!Rn(r).n_()&&r.N_.size>0}function qe(r){return F(r).L_.size===0}function fh(r){r.Q_=void 0}async function ag(r){r.q_.set("Online")}async function ug(r){r.N_.forEach((t,e)=>{ko(r,t)})}async function cg(r,t){fh(r),Oo(r)?(r.q_.M_(t),Mo(r)):r.q_.set("Unknown")}async function lg(r,t,e){if(r.q_.set("Online"),t instanceof Dl&&t.state===2&&t.cause)try{await async function(s,i){const a=i.cause;for(const u of i.targetIds)s.N_.has(u)&&(await s.remoteSyncer.rejectListen(u,a),s.N_.delete(u),s.Q_.removeTarget(u))}(r,t)}catch(n){V("RemoteStore","Failed to remove targets %s: %s ",t.targetIds.join(","),n),await Rs(r,n)}else if(t instanceof ls?r.Q_.Ke(t):t instanceof Cl?r.Q_.He(t):r.Q_.We(t),!e.isEqual(B.min()))try{const n=await ih(r.localStore);e.compareTo(n)>=0&&await function(i,a){const u=i.Q_.rt(a);return u.targetChanges.forEach((l,d)=>{if(l.resumeToken.approximateByteSize()>0){const f=i.N_.get(d);f&&i.N_.set(d,f.withResumeToken(l.resumeToken,a))}}),u.targetMismatches.forEach((l,d)=>{const f=i.N_.get(l);if(!f)return;i.N_.set(l,f.withResumeToken(lt.EMPTY_BYTE_STRING,f.snapshotVersion)),dh(i,l);const p=new Wt(f.target,l,d,f.sequenceNumber);ko(i,p)}),i.remoteSyncer.applyRemoteEvent(u)}(r,e)}catch(n){V("RemoteStore","Failed to raise snapshot:",n),await Rs(r,n)}}async function Rs(r,t,e){if(!ye(t))throw t;r.L_.add(1),await Vr(r),r.q_.set("Offline"),e||(e=()=>ih(r.localStore)),r.asyncQueue.enqueueRetryable(async()=>{V("RemoteStore","Retrying IndexedDB access"),await e(),r.L_.delete(1),await Bs(r)})}function mh(r,t){return t().catch(e=>Rs(r,e,t))}async function An(r){const t=F(r),e=pe(t);let n=t.O_.length>0?t.O_[t.O_.length-1].batchId:-1;for(;hg(t);)try{const s=await Yp(t.localStore,n);if(s===null){t.O_.length===0&&e.o_();break}n=s.batchId,dg(t,s)}catch(s){await Rs(t,s)}ph(t)&&gh(t)}function hg(r){return qe(r)&&r.O_.length<10}function dg(r,t){r.O_.push(t);const e=pe(r);e.r_()&&e.V_&&e.m_(t.mutations)}function ph(r){return qe(r)&&!pe(r).n_()&&r.O_.length>0}function gh(r){pe(r).start()}async function fg(r){pe(r).p_()}async function mg(r){const t=pe(r);for(const e of r.O_)t.m_(e.mutations)}async function pg(r,t,e){const n=r.O_.shift(),s=wo.from(n,t,e);await mh(r,()=>r.remoteSyncer.applySuccessfulWrite(s)),await An(r)}async function gg(r,t){t&&pe(r).V_&&await async function(n,s){if(function(a){return Pl(a)&&a!==P.ABORTED}(s.code)){const i=n.O_.shift();pe(n).s_(),await mh(n,()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s)),await An(n)}}(r,t),ph(r)&&gh(r)}async function lc(r,t){const e=F(r);e.asyncQueue.verifyOperationInProgress(),V("RemoteStore","RemoteStore received new credentials");const n=qe(e);e.L_.add(3),await Vr(e),n&&e.q_.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.L_.delete(3),await Bs(e)}async function io(r,t){const e=F(r);t?(e.L_.delete(2),await Bs(e)):t||(e.L_.add(2),await Vr(e),e.q_.set("Unknown"))}function Rn(r){return r.K_||(r.K_=function(e,n,s){const i=F(e);return i.w_(),new ng(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Eo:ag.bind(null,r),Ro:ug.bind(null,r),mo:cg.bind(null,r),d_:lg.bind(null,r)}),r.B_.push(async t=>{t?(r.K_.s_(),Oo(r)?Mo(r):r.q_.set("Unknown")):(await r.K_.stop(),fh(r))})),r.K_}function pe(r){return r.U_||(r.U_=function(e,n,s){const i=F(e);return i.w_(),new rg(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Eo:()=>Promise.resolve(),Ro:fg.bind(null,r),mo:gg.bind(null,r),f_:mg.bind(null,r),g_:pg.bind(null,r)}),r.B_.push(async t=>{t?(r.U_.s_(),await An(r)):(await r.U_.stop(),r.O_.length>0&&(V("RemoteStore",`Stopping write stream with ${r.O_.length} pending writes`),r.O_=[]))})),r.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fo{constructor(t,e,n,s,i){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new Ut,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,n,s,i){const a=Date.now()+n,u=new Fo(t,e,a,s,i);return u.start(n),u}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new C(P.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Lo(r,t){if(ht("AsyncQueue",`${t}: ${r}`),ye(r))return new C(P.UNAVAILABLE,`${t}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sn{constructor(t){this.comparator=t?(e,n)=>t(e,n)||M.comparator(e.key,n.key):(e,n)=>M.comparator(e.key,n.key),this.keyedMap=Yn(),this.sortedSet=new nt(this.comparator)}static emptySet(t){return new sn(t.comparator)}has(t){return this.keyedMap.get(t)!=null}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal((e,n)=>(t(e),!1))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof sn)||this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),n=t.sortedSet.getIterator();for(;e.hasNext();){const s=e.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const t=[];return this.forEach(e=>{t.push(e.toString())}),t.length===0?"DocumentSet ()":`DocumentSet (
  `+t.join(`  
`)+`
)`}copy(t,e){const n=new sn;return n.comparator=this.comparator,n.keyedMap=t,n.sortedSet=e,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(){this.W_=new nt(M.comparator)}track(t){const e=t.doc.key,n=this.W_.get(e);n?t.type!==0&&n.type===3?this.W_=this.W_.insert(e,t):t.type===3&&n.type!==1?this.W_=this.W_.insert(e,{type:n.type,doc:t.doc}):t.type===2&&n.type===2?this.W_=this.W_.insert(e,{type:2,doc:t.doc}):t.type===2&&n.type===0?this.W_=this.W_.insert(e,{type:0,doc:t.doc}):t.type===1&&n.type===0?this.W_=this.W_.remove(e):t.type===1&&n.type===2?this.W_=this.W_.insert(e,{type:1,doc:n.doc}):t.type===0&&n.type===1?this.W_=this.W_.insert(e,{type:2,doc:t.doc}):O():this.W_=this.W_.insert(e,t)}G_(){const t=[];return this.W_.inorderTraversal((e,n)=>{t.push(n)}),t}}class _n{constructor(t,e,n,s,i,a,u,l,d){this.query=t,this.docs=e,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=d}static fromInitialDocuments(t,e,n,s,i){const a=[];return e.forEach(u=>{a.push({type:0,doc:u})}),new _n(t,e,sn.emptySet(e),a,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&xs(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,n=t.docChanges;if(e.length!==n.length)return!1;for(let s=0;s<e.length;s++)if(e[s].type!==n[s].type||!e[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _g{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(t=>t.J_())}}class yg{constructor(){this.queries=dc(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(e,n){const s=F(e),i=s.queries;s.queries=dc(),i.forEach((a,u)=>{for(const l of u.j_)l.onError(n)})})(this,new C(P.ABORTED,"Firestore shutting down"))}}function dc(){return new Ie(r=>pl(r),xs)}async function Bo(r,t){const e=F(r);let n=3;const s=t.query;let i=e.queries.get(s);i?!i.H_()&&t.J_()&&(n=2):(i=new _g,n=t.J_()?0:1);try{switch(n){case 0:i.z_=await e.onListen(s,!0);break;case 1:i.z_=await e.onListen(s,!1);break;case 2:await e.onFirstRemoteStoreListen(s)}}catch(a){const u=Lo(a,`Initialization of query '${Ze(t.query)}' failed`);return void t.onError(u)}e.queries.set(s,i),i.j_.push(t),t.Z_(e.onlineState),i.z_&&t.X_(i.z_)&&qo(e)}async function Uo(r,t){const e=F(r),n=t.query;let s=3;const i=e.queries.get(n);if(i){const a=i.j_.indexOf(t);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=t.J_()?0:1:!i.H_()&&t.J_()&&(s=2))}switch(s){case 0:return e.queries.delete(n),e.onUnlisten(n,!0);case 1:return e.queries.delete(n),e.onUnlisten(n,!1);case 2:return e.onLastRemoteStoreUnlisten(n);default:return}}function Ig(r,t){const e=F(r);let n=!1;for(const s of t){const i=s.query,a=e.queries.get(i);if(a){for(const u of a.j_)u.X_(s)&&(n=!0);a.z_=s}}n&&qo(e)}function Eg(r,t,e){const n=F(r),s=n.queries.get(t);if(s)for(const i of s.j_)i.onError(e);n.queries.delete(t)}function qo(r){r.Y_.forEach(t=>{t.next()})}var oo,fc;(fc=oo||(oo={})).ea="default",fc.Cache="cache";class jo{constructor(t,e,n){this.query=t,this.ta=e,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=n||{}}X_(t){if(!this.options.includeMetadataChanges){const n=[];for(const s of t.docChanges)s.type!==3&&n.push(s);t=new _n(t.query,t.docs,t.oldDocs,n,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.na?this.ia(t)&&(this.ta.next(t),e=!0):this.sa(t,this.onlineState)&&(this.oa(t),e=!0),this.ra=t,e}onError(t){this.ta.error(t)}Z_(t){this.onlineState=t;let e=!1;return this.ra&&!this.na&&this.sa(this.ra,t)&&(this.oa(this.ra),e=!0),e}sa(t,e){if(!t.fromCache||!this.J_())return!0;const n=e!=="Offline";return(!this.options._a||!n)&&(!t.docs.isEmpty()||t.hasCachedResults||e==="Offline")}ia(t){if(t.docChanges.length>0)return!0;const e=this.ra&&this.ra.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&this.options.includeMetadataChanges===!0}oa(t){t=_n.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.na=!0,this.ta.next(t)}J_(){return this.options.source!==oo.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _h{constructor(t){this.key=t}}class yh{constructor(t){this.key=t}}class Tg{constructor(t,e){this.query=t,this.Ta=e,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=G(),this.mutatedKeys=G(),this.Aa=_l(t),this.Ra=new sn(this.Aa)}get Va(){return this.Ta}ma(t,e){const n=e?e.fa:new hc,s=e?e.Ra:this.Ra;let i=e?e.mutatedKeys:this.mutatedKeys,a=s,u=!1;const l=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(t.inorderTraversal((f,p)=>{const I=s.get(f),S=br(this.query,p)?p:null,D=!!I&&this.mutatedKeys.has(I.key),k=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let x=!1;I&&S?I.data.isEqual(S.data)?D!==k&&(n.track({type:3,doc:S}),x=!0):this.ga(I,S)||(n.track({type:2,doc:S}),x=!0,(l&&this.Aa(S,l)>0||d&&this.Aa(S,d)<0)&&(u=!0)):!I&&S?(n.track({type:0,doc:S}),x=!0):I&&!S&&(n.track({type:1,doc:I}),x=!0,(l||d)&&(u=!0)),x&&(S?(a=a.add(S),i=k?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),n.track({type:1,doc:f})}return{Ra:a,fa:n,ns:u,mutatedKeys:i}}ga(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,n,s){const i=this.Ra;this.Ra=t.Ra,this.mutatedKeys=t.mutatedKeys;const a=t.fa.G_();a.sort((f,p)=>function(S,D){const k=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return O()}};return k(S)-k(D)}(f.type,p.type)||this.Aa(f.doc,p.doc)),this.pa(n),s=s!=null&&s;const u=e&&!s?this.ya():[],l=this.da.size===0&&this.current&&!s?1:0,d=l!==this.Ea;return this.Ea=l,a.length!==0||d?{snapshot:new _n(this.query,t.Ra,i,a,t.mutatedKeys,l===0,d,!1,!!n&&n.resumeToken.approximateByteSize()>0),wa:u}:{wa:u}}Z_(t){return this.current&&t==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new hc,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(t){return!this.Ta.has(t)&&!!this.Ra.has(t)&&!this.Ra.get(t).hasLocalMutations}pa(t){t&&(t.addedDocuments.forEach(e=>this.Ta=this.Ta.add(e)),t.modifiedDocuments.forEach(e=>{}),t.removedDocuments.forEach(e=>this.Ta=this.Ta.delete(e)),this.current=t.current)}ya(){if(!this.current)return[];const t=this.da;this.da=G(),this.Ra.forEach(n=>{this.Sa(n.key)&&(this.da=this.da.add(n.key))});const e=[];return t.forEach(n=>{this.da.has(n)||e.push(new yh(n))}),this.da.forEach(n=>{t.has(n)||e.push(new _h(n))}),e}ba(t){this.Ta=t.Ts,this.da=G();const e=this.ma(t.documents);return this.applyChanges(e,!0)}Da(){return _n.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class vg{constructor(t,e,n){this.query=t,this.targetId=e,this.view=n}}class wg{constructor(t){this.key=t,this.va=!1}}class Ag{constructor(t,e,n,s,i,a){this.localStore=t,this.remoteStore=e,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new Ie(u=>pl(u),xs),this.Ma=new Map,this.xa=new Set,this.Oa=new nt(M.comparator),this.Na=new Map,this.La=new Vo,this.Ba={},this.ka=new Map,this.qa=Be.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function Rg(r,t,e=!0){const n=qs(r);let s;const i=n.Fa.get(t);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await Ih(n,t,e,!0),s}async function bg(r,t){const e=qs(r);await Ih(e,t,!0,!1)}async function Ih(r,t,e,n){const s=await vs(r.localStore,Mt(t)),i=s.targetId,a=r.sharedClientState.addLocalQueryTarget(i,e);let u;return n&&(u=await zo(r,t,i,a==="current",s.resumeToken)),r.isPrimaryClient&&e&&Us(r.remoteStore,s),u}async function zo(r,t,e,n,s){r.Ka=(p,I,S)=>async function(k,x,z,j){let U=x.view.ma(z);U.ns&&(U=await ro(k.localStore,x.query,!1).then(({documents:E})=>x.view.ma(E,U)));const Y=j&&j.targetChanges.get(x.targetId),et=j&&j.targetMismatches.get(x.targetId)!=null,W=x.view.applyChanges(U,k.isPrimaryClient,Y,et);return ao(k,x.targetId,W.wa),W.snapshot}(r,p,I,S);const i=await ro(r.localStore,t,!0),a=new Tg(t,i.Ts),u=a.ma(i.documents),l=Pr.createSynthesizedTargetChangeForCurrentChange(e,n&&r.onlineState!=="Offline",s),d=a.applyChanges(u,r.isPrimaryClient,l);ao(r,e,d.wa);const f=new vg(t,e,a);return r.Fa.set(t,f),r.Ma.has(e)?r.Ma.get(e).push(t):r.Ma.set(e,[t]),d.snapshot}async function Sg(r,t,e){const n=F(r),s=n.Fa.get(t),i=n.Ma.get(s.targetId);if(i.length>1)return n.Ma.set(s.targetId,i.filter(a=>!xs(a,t))),void n.Fa.delete(t);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await pn(n.localStore,s.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(s.targetId),e&&gn(n.remoteStore,s.targetId),yn(n,s.targetId)}).catch(_e)):(yn(n,s.targetId),await pn(n.localStore,s.targetId,!0))}async function Pg(r,t){const e=F(r),n=e.Fa.get(t),s=e.Ma.get(n.targetId);e.isPrimaryClient&&s.length===1&&(e.sharedClientState.removeLocalQueryTarget(n.targetId),gn(e.remoteStore,n.targetId))}async function Vg(r,t,e){const n=Qo(r);try{const s=await function(a,u){const l=F(a),d=ut.now(),f=u.reduce((S,D)=>S.add(D.key),G());let p,I;return l.persistence.runTransaction("Locally write mutations","readwrite",S=>{let D=kt(),k=G();return l.cs.getEntries(S,f).next(x=>{D=x,D.forEach((z,j)=>{j.isValidDocument()||(k=k.add(z))})}).next(()=>l.localDocuments.getOverlayedDocuments(S,D)).next(x=>{p=x;const z=[];for(const j of u){const U=Zm(j,p.get(j.key).overlayedDocument);U!=null&&z.push(new Zt(j.key,U,il(U.value.mapValue),at.exists(!0)))}return l.mutationQueue.addMutationBatch(S,d,z,u)}).next(x=>{I=x;const z=x.applyToLocalDocumentSet(p,k);return l.documentOverlayCache.saveOverlays(S,x.batchId,z)})}).then(()=>({batchId:I.batchId,changes:Il(p)}))}(n.localStore,t);n.sharedClientState.addPendingMutation(s.batchId),function(a,u,l){let d=a.Ba[a.currentUser.toKey()];d||(d=new nt(q)),d=d.insert(u,l),a.Ba[a.currentUser.toKey()]=d}(n,s.batchId,e),await Ee(n,s.changes),await An(n.remoteStore)}catch(s){const i=Lo(s,"Failed to persist write");e.reject(i)}}async function Eh(r,t){const e=F(r);try{const n=await Hp(e.localStore,t);t.targetChanges.forEach((s,i)=>{const a=e.Na.get(i);a&&(L(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?L(a.va):s.removedDocuments.size>0&&(L(a.va),a.va=!1))}),await Ee(e,n,t)}catch(n){await _e(n)}}function mc(r,t,e){const n=F(r);if(n.isPrimaryClient&&e===0||!n.isPrimaryClient&&e===1){const s=[];n.Fa.forEach((i,a)=>{const u=a.view.Z_(t);u.snapshot&&s.push(u.snapshot)}),function(a,u){const l=F(a);l.onlineState=u;let d=!1;l.queries.forEach((f,p)=>{for(const I of p.j_)I.Z_(u)&&(d=!0)}),d&&qo(l)}(n.eventManager,t),s.length&&n.Ca.d_(s),n.onlineState=t,n.isPrimaryClient&&n.sharedClientState.setOnlineState(t)}}async function Cg(r,t,e){const n=F(r);n.sharedClientState.updateQueryState(t,"rejected",e);const s=n.Na.get(t),i=s&&s.key;if(i){let a=new nt(M.comparator);a=a.insert(i,it.newNoDocument(i,B.min()));const u=G().add(i),l=new Sr(B.min(),new Map,new nt(q),a,u);await Eh(n,l),n.Oa=n.Oa.remove(i),n.Na.delete(t),$o(n)}else await pn(n.localStore,t,!1).then(()=>yn(n,t,e)).catch(_e)}async function Dg(r,t){const e=F(r),n=t.batch.batchId;try{const s=await Wp(e.localStore,t);Ko(e,n,null),Go(e,n),e.sharedClientState.updateMutationState(n,"acknowledged"),await Ee(e,s)}catch(s){await _e(s)}}async function xg(r,t,e){const n=F(r);try{const s=await function(a,u){const l=F(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let f;return l.mutationQueue.lookupMutationBatch(d,u).next(p=>(L(p!==null),f=p.keys(),l.mutationQueue.removeMutationBatch(d,p))).next(()=>l.mutationQueue.performConsistencyCheck(d)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(d,f,u)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,f)).next(()=>l.localDocuments.getDocuments(d,f))})}(n.localStore,t);Ko(n,t,e),Go(n,t),n.sharedClientState.updateMutationState(t,"rejected",e),await Ee(n,s)}catch(s){await _e(s)}}function Go(r,t){(r.ka.get(t)||[]).forEach(e=>{e.resolve()}),r.ka.delete(t)}function Ko(r,t,e){const n=F(r);let s=n.Ba[n.currentUser.toKey()];if(s){const i=s.get(t);i&&(e?i.reject(e):i.resolve(),s=s.remove(t)),n.Ba[n.currentUser.toKey()]=s}}function yn(r,t,e=null){r.sharedClientState.removeLocalQueryTarget(t);for(const n of r.Ma.get(t))r.Fa.delete(n),e&&r.Ca.$a(n,e);r.Ma.delete(t),r.isPrimaryClient&&r.La.gr(t).forEach(n=>{r.La.containsKey(n)||Th(r,n)})}function Th(r,t){r.xa.delete(t.path.canonicalString());const e=r.Oa.get(t);e!==null&&(gn(r.remoteStore,e),r.Oa=r.Oa.remove(t),r.Na.delete(e),$o(r))}function ao(r,t,e){for(const n of e)n instanceof _h?(r.La.addReference(n.key,t),Ng(r,n)):n instanceof yh?(V("SyncEngine","Document no longer in limbo: "+n.key),r.La.removeReference(n.key,t),r.La.containsKey(n.key)||Th(r,n.key)):O()}function Ng(r,t){const e=t.key,n=e.path.canonicalString();r.Oa.get(e)||r.xa.has(n)||(V("SyncEngine","New document in limbo: "+e),r.xa.add(n),$o(r))}function $o(r){for(;r.xa.size>0&&r.Oa.size<r.maxConcurrentLimboResolutions;){const t=r.xa.values().next().value;r.xa.delete(t);const e=new M(J.fromString(t)),n=r.qa.next();r.Na.set(n,new wg(e)),r.Oa=r.Oa.insert(e,n),Us(r.remoteStore,new Wt(Mt(Rr(e.path)),n,"TargetPurposeLimboResolution",Dt.oe))}}async function Ee(r,t,e){const n=F(r),s=[],i=[],a=[];n.Fa.isEmpty()||(n.Fa.forEach((u,l)=>{a.push(n.Ka(l,t,e).then(d=>{var f;if((d||e)&&n.isPrimaryClient){const p=d?!d.fromCache:(f=e==null?void 0:e.targetChanges.get(l.targetId))===null||f===void 0?void 0:f.current;n.sharedClientState.updateQueryState(l.targetId,p?"current":"not-current")}if(d){s.push(d);const p=Do.Wi(l.targetId,d);i.push(p)}}))}),await Promise.all(a),n.Ca.d_(s),await async function(l,d){const f=F(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>A.forEach(d,I=>A.forEach(I.$i,S=>f.persistence.referenceDelegate.addReference(p,I.targetId,S)).next(()=>A.forEach(I.Ui,S=>f.persistence.referenceDelegate.removeReference(p,I.targetId,S)))))}catch(p){if(!ye(p))throw p;V("LocalStore","Failed to update sequence numbers: "+p)}for(const p of d){const I=p.targetId;if(!p.fromCache){const S=f.os.get(I),D=S.snapshotVersion,k=S.withLastLimboFreeSnapshotVersion(D);f.os=f.os.insert(I,k)}}}(n.localStore,i))}async function kg(r,t){const e=F(r);if(!e.currentUser.isEqual(t)){V("SyncEngine","User change. New user:",t.toKey());const n=await sh(e.localStore,t);e.currentUser=t,function(i,a){i.ka.forEach(u=>{u.forEach(l=>{l.reject(new C(P.CANCELLED,a))})}),i.ka.clear()}(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,n.removedBatchIds,n.addedBatchIds),await Ee(e,n.hs)}}function Mg(r,t){const e=F(r),n=e.Na.get(t);if(n&&n.va)return G().add(n.key);{let s=G();const i=e.Ma.get(t);if(!i)return s;for(const a of i){const u=e.Fa.get(a);s=s.unionWith(u.view.Va)}return s}}async function Og(r,t){const e=F(r),n=await ro(e.localStore,t.query,!0),s=t.view.ba(n);return e.isPrimaryClient&&ao(e,t.targetId,s.wa),s}async function Fg(r,t){const e=F(r);return ah(e.localStore,t).then(n=>Ee(e,n))}async function Lg(r,t,e,n){const s=F(r),i=await function(u,l){const d=F(u),f=F(d.mutationQueue);return d.persistence.runTransaction("Lookup mutation documents","readonly",p=>f.Mn(p,l).next(I=>I?d.localDocuments.getDocuments(p,I):A.resolve(null)))}(s.localStore,t);i!==null?(e==="pending"?await An(s.remoteStore):e==="acknowledged"||e==="rejected"?(Ko(s,t,n||null),Go(s,t),function(u,l){F(F(u).mutationQueue).On(l)}(s.localStore,t)):O(),await Ee(s,i)):V("SyncEngine","Cannot apply mutation batch with id: "+t)}async function Bg(r,t){const e=F(r);if(qs(e),Qo(e),t===!0&&e.Qa!==!0){const n=e.sharedClientState.getAllActiveQueryTargets(),s=await pc(e,n.toArray());e.Qa=!0,await io(e.remoteStore,!0);for(const i of s)Us(e.remoteStore,i)}else if(t===!1&&e.Qa!==!1){const n=[];let s=Promise.resolve();e.Ma.forEach((i,a)=>{e.sharedClientState.isLocalQueryTarget(a)?n.push(a):s=s.then(()=>(yn(e,a),pn(e.localStore,a,!0))),gn(e.remoteStore,a)}),await s,await pc(e,n),function(a){const u=F(a);u.Na.forEach((l,d)=>{gn(u.remoteStore,d)}),u.La.pr(),u.Na=new Map,u.Oa=new nt(M.comparator)}(e),e.Qa=!1,await io(e.remoteStore,!1)}}async function pc(r,t,e){const n=F(r),s=[],i=[];for(const a of t){let u;const l=n.Ma.get(a);if(l&&l.length!==0){u=await vs(n.localStore,Mt(l[0]));for(const d of l){const f=n.Fa.get(d),p=await Og(n,f);p.snapshot&&i.push(p.snapshot)}}else{const d=await oh(n.localStore,a);u=await vs(n.localStore,d),await zo(n,vh(d),a,!1,u.resumeToken)}s.push(u)}return n.Ca.d_(i),s}function vh(r){return fl(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function Ug(r){return function(e){return F(F(e).persistence).Qi()}(F(r).localStore)}async function qg(r,t,e,n){const s=F(r);if(s.Qa)return void V("SyncEngine","Ignoring unexpected query state notification.");const i=s.Ma.get(t);if(i&&i.length>0)switch(e){case"current":case"not-current":{const a=await ah(s.localStore,gl(i[0])),u=Sr.createSynthesizedRemoteEventForCurrentChange(t,e==="current",lt.EMPTY_BYTE_STRING);await Ee(s,a,u);break}case"rejected":await pn(s.localStore,t,!0),yn(s,t,n);break;default:O()}}async function jg(r,t,e){const n=qs(r);if(n.Qa){for(const s of t){if(n.Ma.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){V("SyncEngine","Adding an already active target "+s);continue}const i=await oh(n.localStore,s),a=await vs(n.localStore,i);await zo(n,vh(i),a.targetId,!1,a.resumeToken),Us(n.remoteStore,a)}for(const s of e)n.Ma.has(s)&&await pn(n.localStore,s,!1).then(()=>{gn(n.remoteStore,s),yn(n,s)}).catch(_e)}}function qs(r){const t=F(r);return t.remoteStore.remoteSyncer.applyRemoteEvent=Eh.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=Mg.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=Cg.bind(null,t),t.Ca.d_=Ig.bind(null,t.eventManager),t.Ca.$a=Eg.bind(null,t.eventManager),t}function Qo(r){const t=F(r);return t.remoteStore.remoteSyncer.applySuccessfulWrite=Dg.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=xg.bind(null,t),t}class Tr{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=Ls(t.databaseInfo.databaseId),this.sharedClientState=this.Wa(t),this.persistence=this.Ga(t),await this.persistence.start(),this.localStore=this.za(t),this.gcScheduler=this.ja(t,this.localStore),this.indexBackfillerScheduler=this.Ha(t,this.localStore)}ja(t,e){return null}Ha(t,e){return null}za(t){return rh(this.persistence,new nh,t.initialUser,this.serializer)}Ga(t){return new th(Fs.Zr,this.serializer)}Wa(t){return new ch}async terminate(){var t,e;(t=this.gcScheduler)===null||t===void 0||t.stop(),(e=this.indexBackfillerScheduler)===null||e===void 0||e.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Tr.provider={build:()=>new Tr};class wh extends Tr{constructor(t,e,n){super(),this.Ja=t,this.cacheSizeBytes=e,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(t){await super.initialize(t),await this.Ja.initialize(this,t),await Qo(this.Ja.syncEngine),await An(this.Ja.remoteStore),await this.persistence.yi(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}za(t){return rh(this.persistence,new nh,t.initialUser,this.serializer)}ja(t,e){const n=this.persistence.referenceDelegate.garbageCollector;return new Cp(n,t.asyncQueue,e)}Ha(t,e){const n=new um(e,this.persistence);return new am(t.asyncQueue,n)}Ga(t){const e=eh(t.databaseInfo.databaseId,t.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?Ct.withCacheSize(this.cacheSizeBytes):Ct.DEFAULT;return new Co(this.synchronizeTabs,e,t.clientId,n,t.asyncQueue,lh(),hs(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Wa(t){return new ch}}class zg extends wh{constructor(t,e){super(t,e,!1),this.Ja=t,this.cacheSizeBytes=e,this.synchronizeTabs=!0}async initialize(t){await super.initialize(t);const e=this.Ja.syncEngine;this.sharedClientState instanceof Ni&&(this.sharedClientState.syncEngine={no:Lg.bind(null,e),ro:qg.bind(null,e),io:jg.bind(null,e),Qi:Ug.bind(null,e),eo:Fg.bind(null,e)},await this.sharedClientState.start()),await this.persistence.yi(async n=>{await Bg(this.Ja.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())})}Wa(t){const e=lh();if(!Ni.D(e))throw new C(P.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=eh(t.databaseInfo.databaseId,t.databaseInfo.persistenceKey);return new Ni(e,t.asyncQueue,n,t.clientId,t.initialUser)}}class vr{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>mc(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=kg.bind(null,this.syncEngine),await io(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return function(){return new yg}()}createDatastore(t){const e=Ls(t.databaseInfo.databaseId),n=function(i){return new eg(i)}(t.databaseInfo);return function(i,a,u,l){return new sg(i,a,u,l)}(t.authCredentials,t.appCheckCredentials,n,e)}createRemoteStore(t){return function(n,s,i,a,u){return new og(n,s,i,a,u)}(this.localStore,this.datastore,t.asyncQueue,e=>mc(this.syncEngine,e,0),function(){return cc.D()?new cc:new Xp}())}createSyncEngine(t,e){return function(s,i,a,u,l,d,f){const p=new Ag(s,i,a,u,l,d);return f&&(p.Qa=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){var t,e;await async function(s){const i=F(s);V("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Vr(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(t=this.datastore)===null||t===void 0||t.terminate(),(e=this.eventManager)===null||e===void 0||e.terminate()}}vr.provider={build:()=>new vr};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wo{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.Ya(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.Ya(this.observer.error,t):ht("Uncaught Error in snapshot listener:",t.toString()))}Za(){this.muted=!0}Ya(t,e){setTimeout(()=>{this.muted||t(e)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gg{constructor(t){this.datastore=t,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(t){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new C(P.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const e=await async function(s,i){const a=F(s),u={documents:i.map(p=>Ir(a.serializer,p))},l=await a.Lo("BatchGetDocuments",a.serializer.databaseId,J.emptyPath(),u,i.length),d=new Map;l.forEach(p=>{const I=lp(a.serializer,p);d.set(I.key.toString(),I)});const f=[];return i.forEach(p=>{const I=d.get(p.toString());L(!!I),f.push(I)}),f}(this.datastore,t);return e.forEach(n=>this.recordVersion(n)),e}set(t,e){this.write(e.toMutation(t,this.precondition(t))),this.writtenDocs.add(t.toString())}update(t,e){try{this.write(e.toMutation(t,this.preconditionForUpdate(t)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(t.toString())}delete(t){this.write(new wn(t,this.precondition(t))),this.writtenDocs.add(t.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const t=this.readVersions;this.mutations.forEach(e=>{t.delete(e.key.toString())}),t.forEach((e,n)=>{const s=M.fromPath(n);this.mutations.push(new To(s,this.precondition(s)))}),await async function(n,s){const i=F(n),a={writes:s.map(u=>Er(i.serializer,u))};await i.Mo("Commit",i.serializer.databaseId,J.emptyPath(),a)}(this.datastore,this.mutations),this.committed=!0}recordVersion(t){let e;if(t.isFoundDocument())e=t.version;else{if(!t.isNoDocument())throw O();e=B.min()}const n=this.readVersions.get(t.key.toString());if(n){if(!e.isEqual(n))throw new C(P.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(t.key.toString(),e)}precondition(t){const e=this.readVersions.get(t.toString());return!this.writtenDocs.has(t.toString())&&e?e.isEqual(B.min())?at.exists(!1):at.updateTime(e):at.none()}preconditionForUpdate(t){const e=this.readVersions.get(t.toString());if(!this.writtenDocs.has(t.toString())&&e){if(e.isEqual(B.min()))throw new C(P.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return at.updateTime(e)}return at.exists(!0)}write(t){this.ensureCommitNotCalled(),this.mutations.push(t)}ensureCommitNotCalled(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kg{constructor(t,e,n,s,i){this.asyncQueue=t,this.datastore=e,this.options=n,this.updateFunction=s,this.deferred=i,this._u=n.maxAttempts,this.t_=new No(this.asyncQueue,"transaction_retry")}au(){this._u-=1,this.uu()}uu(){this.t_.Go(async()=>{const t=new Gg(this.datastore),e=this.cu(t);e&&e.then(n=>{this.asyncQueue.enqueueAndForget(()=>t.commit().then(()=>{this.deferred.resolve(n)}).catch(s=>{this.lu(s)}))}).catch(n=>{this.lu(n)})})}cu(t){try{const e=this.updateFunction(t);return!wr(e)&&e.catch&&e.then?e:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(e){return this.deferred.reject(e),null}}lu(t){this._u>0&&this.hu(t)?(this._u-=1,this.asyncQueue.enqueueAndForget(()=>(this.uu(),Promise.resolve()))):this.deferred.reject(t)}hu(t){if(t.name==="FirebaseError"){const e=t.code;return e==="aborted"||e==="failed-precondition"||e==="already-exists"||!Pl(e)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $g{constructor(t,e,n,s,i){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=n,this.databaseInfo=s,this.user=Rt.UNAUTHENTICATED,this.clientId=ho.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,async a=>{V("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(n,a=>(V("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new Ut;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const n=Lo(e,"Failed to shutdown persistence");t.reject(n)}}),t.promise}}async function Mi(r,t){r.asyncQueue.verifyOperationInProgress(),V("FirestoreClient","Initializing OfflineComponentProvider");const e=r.configuration;await t.initialize(e);let n=e.initialUser;r.setCredentialChangeListener(async s=>{n.isEqual(s)||(await sh(t.localStore,s),n=s)}),t.persistence.setDatabaseDeletedListener(()=>r.terminate()),r._offlineComponents=t}async function gc(r,t){r.asyncQueue.verifyOperationInProgress();const e=await Qg(r);V("FirestoreClient","Initializing OnlineComponentProvider"),await t.initialize(e,r.configuration),r.setCredentialChangeListener(n=>lc(t.remoteStore,n)),r.setAppCheckTokenChangeListener((n,s)=>lc(t.remoteStore,s)),r._onlineComponents=t}async function Qg(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){V("FirestoreClient","Using user provided OfflineComponentProvider");try{await Mi(r,r._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!function(s){return s.name==="FirebaseError"?s.code===P.FAILED_PRECONDITION||s.code===P.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(e))throw e;an("Error using user provided cache. Falling back to memory cache: "+e),await Mi(r,new Tr)}}else V("FirestoreClient","Using default OfflineComponentProvider"),await Mi(r,new Tr);return r._offlineComponents}async function Ho(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(V("FirestoreClient","Using user provided OnlineComponentProvider"),await gc(r,r._uninitializedComponentsProvider._online)):(V("FirestoreClient","Using default OnlineComponentProvider"),await gc(r,new vr))),r._onlineComponents}function Wg(r){return Ho(r).then(t=>t.syncEngine)}function Hg(r){return Ho(r).then(t=>t.datastore)}async function bs(r){const t=await Ho(r),e=t.eventManager;return e.onListen=Rg.bind(null,t.syncEngine),e.onUnlisten=Sg.bind(null,t.syncEngine),e.onFirstRemoteStoreListen=bg.bind(null,t.syncEngine),e.onLastRemoteStoreUnlisten=Pg.bind(null,t.syncEngine),e}function Jg(r,t,e={}){const n=new Ut;return r.asyncQueue.enqueueAndForget(async()=>function(i,a,u,l,d){const f=new Wo({next:I=>{f.Za(),a.enqueueAndForget(()=>Uo(i,p));const S=I.docs.has(u);!S&&I.fromCache?d.reject(new C(P.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&I.fromCache&&l&&l.source==="server"?d.reject(new C(P.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(I)},error:I=>d.reject(I)}),p=new jo(Rr(u.path),f,{includeMetadataChanges:!0,_a:!0});return Bo(i,p)}(await bs(r),r.asyncQueue,t,e,n)),n.promise}function Yg(r,t,e={}){const n=new Ut;return r.asyncQueue.enqueueAndForget(async()=>function(i,a,u,l,d){const f=new Wo({next:I=>{f.Za(),a.enqueueAndForget(()=>Uo(i,p)),I.fromCache&&l.source==="server"?d.reject(new C(P.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(I)},error:I=>d.reject(I)}),p=new jo(u,f,{includeMetadataChanges:!0,_a:!0});return Bo(i,p)}(await bs(r),r.asyncQueue,t,e,n)),n.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ah(r){const t={};return r.timeoutSeconds!==void 0&&(t.timeoutSeconds=r.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _c=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rh(r,t,e){if(!e)throw new C(P.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${t}.`)}function bh(r,t,e,n){if(t===!0&&n===!0)throw new C(P.INVALID_ARGUMENT,`${r} and ${e} cannot be used together.`)}function yc(r){if(!M.isDocumentKey(r))throw new C(P.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function Ic(r){if(M.isDocumentKey(r))throw new C(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function js(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const t=function(n){return n.constructor?n.constructor.name:null}(r);return t?`a custom ${t} object`:"an object"}}return typeof r=="function"?"a function":O()}function bt(r,t){if("_delegate"in r&&(r=r._delegate),!(r instanceof t)){if(t.name===r.constructor.name)throw new C(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=js(r);throw new C(P.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return r}function Xg(r,t){if(t<=0)throw new C(P.INVALID_ARGUMENT,`Function ${r}() requires a positive number, but it was: ${t}.`)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ec{constructor(t){var e,n;if(t.host===void 0){if(t.ssl!==void 0)throw new C(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=t.host,this.ssl=(e=t.ssl)===null||e===void 0||e;if(this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<1048576)throw new C(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}bh("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ah((n=t.experimentalLongPollingOptions)!==null&&n!==void 0?n:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new C(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new C(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new C(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(n,s){return n.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class Jo{constructor(t,e,n,s){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ec({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new C(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new C(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ec(t),t.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new zc;switch(n.type){case"firstParty":return new tm(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new C(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const n=_c.get(e);n&&(V("ComponentProvider","Removing Datastore"),_c.delete(e),n.terminate())}(this),Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new Gt(this.firestore,t,this._query)}}class gt{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Jt(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new gt(this.firestore,t,this._key)}}class Jt extends Gt{constructor(t,e,n){super(t,e,Rr(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new gt(this.firestore,null,new M(t))}withConverter(t){return new Jt(this.firestore,t,this._path)}}function Zg(r,t,...e){if(r=Ot(r),Rh("collection","path",t),r instanceof Jo){const n=J.fromString(t,...e);return Ic(n),new Jt(r,null,n)}{if(!(r instanceof gt||r instanceof Jt))throw new C(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(J.fromString(t,...e));return Ic(n),new Jt(r.firestore,null,n)}}function Sh(r,t,...e){if(r=Ot(r),arguments.length===1&&(t=ho.newId()),Rh("doc","path",t),r instanceof Jo){const n=J.fromString(t,...e);return yc(n),new gt(r,null,new M(n))}{if(!(r instanceof gt||r instanceof Jt))throw new C(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(J.fromString(t,...e));return yc(n),new gt(r.firestore,r instanceof Jt?r.converter:null,new M(n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tc{constructor(t=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new No(this,"async_queue_retry"),this.Vu=()=>{const n=hs();n&&V("AsyncQueue","Visibility state changed to "+n.visibilityState),this.t_.jo()},this.mu=t;const e=hs();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.fu(),this.gu(t)}enterRestrictedMode(t){if(!this.Iu){this.Iu=!0,this.Au=t||!1;const e=hs();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this.Vu)}}enqueue(t){if(this.fu(),this.Iu)return new Promise(()=>{});const e=new Ut;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Pu.push(t),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(t){if(!ye(t))throw t;V("AsyncQueue","Operation failed with retryable error: "+t)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(t){const e=this.mu.then(()=>(this.du=!0,t().catch(n=>{this.Eu=n,this.du=!1;const s=function(a){let u=a.message||"";return a.stack&&(u=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),u}(n);throw ht("INTERNAL UNHANDLED ERROR: ",s),n}).then(n=>(this.du=!1,n))));return this.mu=e,e}enqueueAfterDelay(t,e,n){this.fu(),this.Ru.indexOf(t)>-1&&(e=0);const s=Fo.createAndSchedule(this,t,e,n,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&O()}verifyOperationInProgress(){}async wu(){let t;do t=this.mu,await t;while(t!==this.mu)}Su(t){for(const e of this.Tu)if(e.timerId===t)return!0;return!1}bu(t){return this.wu().then(()=>{this.Tu.sort((e,n)=>e.targetTimeMs-n.targetTimeMs);for(const e of this.Tu)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.wu()})}Du(t){this.Ru.push(t)}yu(t){const e=this.Tu.indexOf(t);this.Tu.splice(e,1)}}function vc(r){return function(e,n){if(typeof e!="object"||e===null)return!1;const s=e;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1}(r,["next","error","complete"])}class Lt extends Jo{constructor(t,e,n,s){super(t,e,n,s),this.type="firestore",this._queue=new Tc,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new Tc(t),this._firestoreClient=void 0,await t}}}function t_(r,t,e){e||(e="(default)");const n=Ff(r,"firestore");if(n.isInitialized(e)){const s=n.getImmediate({identifier:e}),i=n.getOptions(e);if(ds(i,t))return s;throw new C(P.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(t.cacheSizeBytes!==void 0&&t.localCache!==void 0)throw new C(P.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(t.cacheSizeBytes!==void 0&&t.cacheSizeBytes!==-1&&t.cacheSizeBytes<1048576)throw new C(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return n.initialize({options:t,instanceIdentifier:e})}function je(r){if(r._terminated)throw new C(P.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||e_(r),r._firestoreClient}function e_(r){var t,e,n;const s=r._freezeSettings(),i=function(u,l,d,f){return new Vm(u,l,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Ah(f.experimentalLongPollingOptions),f.useFetchStreams)}(r._databaseId,((t=r._app)===null||t===void 0?void 0:t.options.appId)||"",r._persistenceKey,s);r._componentsProvider||!((e=s.localCache)===null||e===void 0)&&e._offlineComponentProvider&&(!((n=s.localCache)===null||n===void 0)&&n._onlineComponentProvider)&&(r._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),r._firestoreClient=new $g(r._authCredentials,r._appCheckCredentials,r._queue,i,r._componentsProvider&&function(u){const l=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(l),_online:l}}(r._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ge{constructor(t){this._byteString=t}static fromBase64String(t){try{return new ge(lt.fromBase64String(t))}catch(e){throw new C(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new ge(lt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new C(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ot(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zs{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gs{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new C(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new C(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(t){return q(this._lat,t._lat)||q(this._long,t._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ks{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0}(this._values,t._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const n_=/^__.*__$/;class r_{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return this.fieldMask!==null?new Zt(t,this.data,this.fieldMask,e,this.fieldTransforms):new vn(t,this.data,e,this.fieldTransforms)}}class Ph{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return new Zt(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function Vh(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw O()}}class Yo{constructor(t,e,n,s,i,a){this.settings=t,this.databaseId=e,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(t){return new Yo(Object.assign(Object.assign({},this.settings),t),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(t){var e;const n=(e=this.path)===null||e===void 0?void 0:e.child(t),s=this.Fu({path:n,xu:!1});return s.Ou(t),s}Nu(t){var e;const n=(e=this.path)===null||e===void 0?void 0:e.child(t),s=this.Fu({path:n,xu:!1});return s.vu(),s}Lu(t){return this.Fu({path:void 0,xu:!0})}Bu(t){return Ss(t,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}vu(){if(this.path)for(let t=0;t<this.path.length;t++)this.Ou(this.path.get(t))}Ou(t){if(t.length===0)throw this.Bu("Document fields must not be empty");if(Vh(this.Cu)&&n_.test(t))throw this.Bu('Document fields cannot begin and end with "__"')}}class s_{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=n||Ls(t)}Qu(t,e,n,s=!1){return new Yo({Cu:t,methodName:e,qu:n,path:ot.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function bn(r){const t=r._freezeSettings(),e=Ls(r._databaseId);return new s_(r._databaseId,!!t.ignoreUndefinedProperties,e)}function $s(r,t,e,n,s,i={}){const a=r.Qu(i.merge||i.mergeFields?2:0,t,e,s);ta("Data must be an object, but it was:",a,n);const u=Ch(n,a);let l,d;if(i.merge)l=new xt(a.fieldMask),d=a.fieldTransforms;else if(i.mergeFields){const f=[];for(const p of i.mergeFields){const I=uo(t,p,e);if(!a.contains(I))throw new C(P.INVALID_ARGUMENT,`Field '${I}' is specified in your field mask but missing from your input data.`);xh(f,I)||f.push(I)}l=new xt(f),d=a.fieldTransforms.filter(p=>l.covers(p.field))}else l=null,d=a.fieldTransforms;return new r_(new It(u),l,d)}class Cr extends zs{_toFieldTransform(t){if(t.Cu!==2)throw t.Cu===1?t.Bu(`${this._methodName}() can only appear at the top level of your update data`):t.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof Cr}}function Xo(r,t,e,n){const s=r.Qu(1,t,e);ta("Data must be an object, but it was:",s,n);const i=[],a=It.empty();Ue(n,(l,d)=>{const f=ea(t,l,e);d=Ot(d);const p=s.Nu(f);if(d instanceof Cr)i.push(f);else{const I=Dr(d,p);I!=null&&(i.push(f),a.set(f,I))}});const u=new xt(i);return new Ph(a,u,s.fieldTransforms)}function Zo(r,t,e,n,s,i){const a=r.Qu(1,t,e),u=[uo(t,n,e)],l=[s];if(i.length%2!=0)throw new C(P.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let I=0;I<i.length;I+=2)u.push(uo(t,i[I])),l.push(i[I+1]);const d=[],f=It.empty();for(let I=u.length-1;I>=0;--I)if(!xh(d,u[I])){const S=u[I];let D=l[I];D=Ot(D);const k=a.Nu(S);if(D instanceof Cr)d.push(S);else{const x=Dr(D,k);x!=null&&(d.push(S),f.set(S,x))}}const p=new xt(d);return new Ph(f,p,a.fieldTransforms)}function i_(r,t,e,n=!1){return Dr(e,r.Qu(n?4:3,t))}function Dr(r,t){if(Dh(r=Ot(r)))return ta("Unsupported field value:",t,r),Ch(r,t);if(r instanceof zs)return function(n,s){if(!Vh(s.Cu))throw s.Bu(`${n._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${n._methodName}() is not currently supported inside arrays`);const i=n._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(r,t),null;if(r===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),r instanceof Array){if(t.settings.xu&&t.Cu!==4)throw t.Bu("Nested arrays are not supported");return function(n,s){const i=[];let a=0;for(const u of n){let l=Dr(u,s.Lu(a));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),a++}return{arrayValue:{values:i}}}(r,t)}return function(n,s){if((n=Ot(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return $m(s.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const i=ut.fromDate(n);return{timestampValue:mn(s.serializer,i)}}if(n instanceof ut){const i=new ut(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:mn(s.serializer,i)}}if(n instanceof Gs)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof ge)return{bytesValue:xl(s.serializer,n._byteString)};if(n instanceof gt){const i=s.databaseId,a=n.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:bo(n.firestore._databaseId||s.databaseId,n._key.path)}}if(n instanceof Ks)return function(a,u){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(l=>{if(typeof l!="number")throw u.Bu("VectorValues must only contain numeric values.");return Eo(u.serializer,l)})}}}}}}(n,s);throw s.Bu(`Unsupported field value: ${js(n)}`)}(r,t)}function Ch(r,t){const e={};return el(r)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Ue(r,(n,s)=>{const i=Dr(s,t.Mu(n));i!=null&&(e[n]=i)}),{mapValue:{fields:e}}}function Dh(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof ut||r instanceof Gs||r instanceof ge||r instanceof gt||r instanceof zs||r instanceof Ks)}function ta(r,t,e){if(!Dh(e)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(e)){const n=js(e);throw n==="an object"?t.Bu(r+" a custom object"):t.Bu(r+" "+n)}}function uo(r,t,e){if((t=Ot(t))instanceof ze)return t._internalPath;if(typeof t=="string")return ea(r,t);throw Ss("Field path arguments must be of type string or ",r,!1,void 0,e)}const o_=new RegExp("[~\\*/\\[\\]]");function ea(r,t,e){if(t.search(o_)>=0)throw Ss(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,e);try{return new ze(...t.split("."))._internalPath}catch{throw Ss(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,e)}}function Ss(r,t,e,n,s){const i=n&&!n.isEmpty(),a=s!==void 0;let u=`Function ${t}() called with invalid data`;e&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(i||a)&&(l+=" (found",i&&(l+=` in field ${n}`),a&&(l+=` in document ${s}`),l+=")"),new C(P.INVALID_ARGUMENT,u+r+l)}function xh(r,t){return r.some(e=>e.isEqual(t))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ps{constructor(t,e,n,s,i){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new gt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new a_(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(Qs("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class a_ extends Ps{data(){return super.data()}}function Qs(r,t){return typeof t=="string"?ea(r,t):t instanceof ze?t._internalPath:t._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nh(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new C(P.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class na{}class Ws extends na{}function u_(r,t,...e){let n=[];t instanceof na&&n.push(t),n=n.concat(e),function(i){const a=i.filter(l=>l instanceof Hs).length,u=i.filter(l=>l instanceof xr).length;if(a>1||a>0&&u>0)throw new C(P.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(const s of n)r=s._apply(r);return r}class xr extends Ws{constructor(t,e,n){super(),this._field=t,this._op=e,this._value=n,this.type="where"}static _create(t,e,n){return new xr(t,e,n)}_apply(t){const e=this._parse(t);return kh(t._query,e),new Gt(t.firestore,t.converter,Hi(t._query,e))}_parse(t){const e=bn(t.firestore);return function(i,a,u,l,d,f,p){let I;if(d.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new C(P.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Ac(p,f);const S=[];for(const D of p)S.push(wc(l,i,D));I={arrayValue:{values:S}}}else I=wc(l,i,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Ac(p,f),I=i_(u,a,p,f==="in"||f==="not-in");return K.create(d,f,I)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function c_(r,t,e){const n=t,s=Qs("where",r);return xr._create(s,n,e)}class Hs extends na{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new Hs(t,e)}_parse(t){const e=this._queryConstraints.map(n=>n._parse(t)).filter(n=>n.getFilters().length>0);return e.length===1?e[0]:X.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:(function(s,i){let a=s;const u=i.getFlattenedFilters();for(const l of u)kh(a,l),a=Hi(a,l)}(t._query,e),new Gt(t.firestore,t.converter,Hi(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Js extends Ws{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new Js(t,e)}_apply(t){const e=function(s,i,a){if(s.startAt!==null)throw new C(P.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new C(P.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new gr(i,a)}(t._query,this._field,this._direction);return new Gt(t.firestore,t.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new Tn(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(t._query,e))}}function l_(r,t="asc"){const e=t,n=Qs("orderBy",r);return Js._create(n,e)}class Ys extends Ws{constructor(t,e,n){super(),this.type=t,this._limit=e,this._limitType=n}static _create(t,e,n){return new Ys(t,e,n)}_apply(t){return new Gt(t.firestore,t.converter,ys(t._query,this._limit,this._limitType))}}function h_(r){return Xg("limit",r),Ys._create("limit",r,"F")}function wc(r,t,e){if(typeof(e=Ot(e))=="string"){if(e==="")throw new C(P.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!ml(t)&&e.indexOf("/")!==-1)throw new C(P.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const n=t.path.child(J.fromString(e));if(!M.isDocumentKey(n))throw new C(P.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return mr(r,new M(n))}if(e instanceof gt)return mr(r,e._key);throw new C(P.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${js(e)}.`)}function Ac(r,t){if(!Array.isArray(r)||r.length===0)throw new C(P.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function kh(r,t){const e=function(s,i){for(const a of s)for(const u of a.getFlattenedFilters())if(i.indexOf(u.op)>=0)return u.op;return null}(r.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(e!==null)throw e===t.op?new C(P.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new C(P.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}class ra{convertValue(t,e="none"){switch(Me(t)){case 0:return null;case 1:return t.booleanValue;case 2:return st(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(de(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw O()}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const n={};return Ue(t,(s,i)=>{n[s]=this.convertValue(i,e)}),n}convertVectorValue(t){var e,n,s;const i=(s=(n=(e=t.fields)===null||e===void 0?void 0:e.value.arrayValue)===null||n===void 0?void 0:n.values)===null||s===void 0?void 0:s.map(a=>st(a.doubleValue));return new Ks(i)}convertGeoPoint(t){return new Gs(st(t.latitude),st(t.longitude))}convertArray(t,e){return(t.values||[]).map(n=>this.convertValue(n,e))}convertServerTimestamp(t,e){switch(e){case"previous":const n=_o(t);return n==null?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp(dr(t));default:return null}}convertTimestamp(t){const e=Xt(t);return new ut(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=J.fromString(t);L(jl(n));const s=new fe(n.get(1),n.get(3)),i=new M(n.popFirst(5));return s.isEqual(e)||ht(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xs(r,t,e){let n;return n=r?e&&(e.merge||e.mergeFields)?r.toFirestore(t,e):r.toFirestore(t):t,n}class d_ extends ra{constructor(t){super(),this.firestore=t}convertBytes(t){return new ge(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new gt(this.firestore,null,e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xe{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class Zs extends Ps{constructor(t,e,n,s,i,a){super(t,e,n,s,a),this._firestore=t,this._firestoreImpl=t,this.metadata=i}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new or(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const n=this._document.data.field(Qs("DocumentSnapshot.get",t));if(n!==null)return this._userDataWriter.convertValue(n,e.serverTimestamps)}}}class or extends Zs{data(t={}){return super.data(t)}}class sa{constructor(t,e,n,s){this._firestore=t,this._userDataWriter=e,this._snapshot=s,this.metadata=new xe(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach(n=>{t.call(e,new or(this._firestore,this._userDataWriter,n.key,n,new xe(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new C(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(u=>{const l=new or(s._firestore,s._userDataWriter,u.doc.key,u.doc,new xe(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(u=>i||u.type!==3).map(u=>{const l=new or(s._firestore,s._userDataWriter,u.doc.key,u.doc,new xe(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,f=-1;return u.type!==0&&(d=a.indexOf(u.doc.key),a=a.delete(u.doc.key)),u.type!==1&&(a=a.add(u.doc),f=a.indexOf(u.doc.key)),{type:f_(u.type),doc:l,oldIndex:d,newIndex:f}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}}function f_(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return O()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function m_(r){r=bt(r,gt);const t=bt(r.firestore,Lt);return Jg(je(t),r._key).then(e=>Mh(t,r,e))}class ti extends ra{constructor(t){super(),this.firestore=t}convertBytes(t){return new ge(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new gt(this.firestore,null,e)}}function p_(r){r=bt(r,Gt);const t=bt(r.firestore,Lt),e=je(t),n=new ti(t);return Nh(r._query),Yg(e,r._query).then(s=>new sa(t,n,r,s))}function g_(r,t,e){r=bt(r,gt);const n=bt(r.firestore,Lt),s=Xs(r.converter,t,e);return Sn(n,[$s(bn(n),"setDoc",r._key,s,r.converter!==null,e).toMutation(r._key,at.none())])}function __(r,t,e,...n){r=bt(r,gt);const s=bt(r.firestore,Lt),i=bn(s);let a;return a=typeof(t=Ot(t))=="string"||t instanceof ze?Zo(i,"updateDoc",r._key,t,e,n):Xo(i,"updateDoc",r._key,t),Sn(s,[a.toMutation(r._key,at.exists(!0))])}function y_(r){return Sn(bt(r.firestore,Lt),[new wn(r._key,at.none())])}function I_(r,t){const e=bt(r.firestore,Lt),n=Sh(r),s=Xs(r.converter,t);return Sn(e,[$s(bn(r.firestore),"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,at.exists(!1))]).then(()=>n)}function E_(r,...t){var e,n,s;r=Ot(r);let i={includeMetadataChanges:!1,source:"default"},a=0;typeof t[a]!="object"||vc(t[a])||(i=t[a],a++);const u={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(vc(t[a])){const p=t[a];t[a]=(e=p.next)===null||e===void 0?void 0:e.bind(p),t[a+1]=(n=p.error)===null||n===void 0?void 0:n.bind(p),t[a+2]=(s=p.complete)===null||s===void 0?void 0:s.bind(p)}let l,d,f;if(r instanceof gt)d=bt(r.firestore,Lt),f=Rr(r._key.path),l={next:p=>{t[a]&&t[a](Mh(d,r,p))},error:t[a+1],complete:t[a+2]};else{const p=bt(r,Gt);d=bt(p.firestore,Lt),f=p._query;const I=new ti(d);l={next:S=>{t[a]&&t[a](new sa(d,I,p,S))},error:t[a+1],complete:t[a+2]},Nh(r._query)}return function(I,S,D,k){const x=new Wo(k),z=new jo(S,x,D);return I.asyncQueue.enqueueAndForget(async()=>Bo(await bs(I),z)),()=>{x.Za(),I.asyncQueue.enqueueAndForget(async()=>Uo(await bs(I),z))}}(je(d),f,u,l)}function Sn(r,t){return function(n,s){const i=new Ut;return n.asyncQueue.enqueueAndForget(async()=>Vg(await Wg(n),s,i)),i.promise}(je(r),t)}function Mh(r,t,e){const n=e.docs.get(t._key),s=new ti(r);return new Zs(r,s,t._key,n,new xe(e.hasPendingWrites,e.fromCache),t.converter)}class T_{constructor(t){let e;this.kind="persistent",t!=null&&t.tabManager?(t.tabManager._initialize(t),e=t.tabManager):(e=Oh(),e._initialize(t)),this._onlineComponentProvider=e._onlineComponentProvider,this._offlineComponentProvider=e._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function v_(r){return new T_(r)}class w_{constructor(t){this.forceOwnership=t,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(t){this._onlineComponentProvider=vr.provider,this._offlineComponentProvider={build:e=>new wh(e,t==null?void 0:t.cacheSizeBytes,this.forceOwnership)}}}class A_{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(t){this._onlineComponentProvider=vr.provider,this._offlineComponentProvider={build:e=>new zg(e,t==null?void 0:t.cacheSizeBytes)}}}function Oh(r){return new w_(void 0)}function R_(){return new A_}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b_={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fh{constructor(t,e){this._firestore=t,this._commitHandler=e,this._mutations=[],this._committed=!1,this._dataReader=bn(t)}set(t,e,n){this._verifyNotCommitted();const s=ae(t,this._firestore),i=Xs(s.converter,e,n),a=$s(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(a.toMutation(s._key,at.none())),this}update(t,e,n,...s){this._verifyNotCommitted();const i=ae(t,this._firestore);let a;return a=typeof(e=Ot(e))=="string"||e instanceof ze?Zo(this._dataReader,"WriteBatch.update",i._key,e,n,s):Xo(this._dataReader,"WriteBatch.update",i._key,e),this._mutations.push(a.toMutation(i._key,at.exists(!0))),this}delete(t){this._verifyNotCommitted();const e=ae(t,this._firestore);return this._mutations=this._mutations.concat(new wn(e._key,at.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new C(P.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function ae(r,t){if((r=Ot(r)).firestore!==t)throw new C(P.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lh extends class{constructor(e,n){this._firestore=e,this._transaction=n,this._dataReader=bn(e)}get(e){const n=ae(e,this._firestore),s=new d_(this._firestore);return this._transaction.lookup([n._key]).then(i=>{if(!i||i.length!==1)return O();const a=i[0];if(a.isFoundDocument())return new Ps(this._firestore,s,a.key,a,n.converter);if(a.isNoDocument())return new Ps(this._firestore,s,n._key,null,n.converter);throw O()})}set(e,n,s){const i=ae(e,this._firestore),a=Xs(i.converter,n,s),u=$s(this._dataReader,"Transaction.set",i._key,a,i.converter!==null,s);return this._transaction.set(i._key,u),this}update(e,n,s,...i){const a=ae(e,this._firestore);let u;return u=typeof(n=Ot(n))=="string"||n instanceof ze?Zo(this._dataReader,"Transaction.update",a._key,n,s,i):Xo(this._dataReader,"Transaction.update",a._key,n),this._transaction.update(a._key,u),this}delete(e){const n=ae(e,this._firestore);return this._transaction.delete(n._key),this}}{constructor(t,e){super(t,e),this._firestore=t}get(t){const e=ae(t,this._firestore),n=new ti(this._firestore);return super.get(t).then(s=>new Zs(this._firestore,n,e._key,s._document,new xe(!1,!1),e.converter))}}function S_(r,t,e){r=bt(r,Lt);const n=Object.assign(Object.assign({},b_),e);return function(i){if(i.maxAttempts<1)throw new C(P.INVALID_ARGUMENT,"Max attempts must be at least 1")}(n),function(i,a,u){const l=new Ut;return i.asyncQueue.enqueueAndForget(async()=>{const d=await Hg(i);new Kg(i.asyncQueue,d,u,a,l).au()}),l.promise}(je(r),s=>t(new Lh(r,s)),n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function P_(){return new Cr("deleteField")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function V_(r){return je(r=bt(r,Lt)),new Fh(r,t=>Sn(r,t))}(function(t,e=!0){(function(s){En=s})(Uf),ms(new ar("firestore",(n,{instanceIdentifier:s,options:i})=>{const a=n.getProvider("app").getImmediate(),u=new Lt(new Xf(n.getProvider("auth-internal")),new nm(n.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new C(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new fe(d.options.projectId,f)}(a,s),a);return i=Object.assign({useFetchStreams:e},i),u._setSettings(i),u},"PUBLIC").setMultipleInstances(!0)),rn(gu,"4.7.3",t),rn(gu,"4.7.3","esm2017")})();const J_=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:ra,Bytes:ge,CollectionReference:Jt,DocumentReference:gt,DocumentSnapshot:Zs,FieldPath:ze,FieldValue:zs,Firestore:Lt,FirestoreError:C,GeoPoint:Gs,Query:Gt,QueryCompositeFilterConstraint:Hs,QueryConstraint:Ws,QueryDocumentSnapshot:or,QueryFieldFilterConstraint:xr,QueryLimitConstraint:Ys,QueryOrderByConstraint:Js,QuerySnapshot:sa,SnapshotMetadata:xe,Timestamp:ut,Transaction:Lh,VectorValue:Ks,WriteBatch:Fh,_AutoId:ho,_ByteString:lt,_DatabaseId:fe,_DocumentKey:M,_EmptyAuthCredentialsProvider:zc,_FieldPath:ot,_cast:bt,_logWarn:an,_validateIsNotUsedTogether:bh,addDoc:I_,collection:Zg,deleteDoc:y_,deleteField:P_,doc:Sh,ensureFirestoreConfigured:je,executeWrite:Sn,getDoc:m_,getDocs:p_,initializeFirestore:t_,limit:h_,onSnapshot:E_,orderBy:l_,persistentLocalCache:v_,persistentMultipleTabManager:R_,persistentSingleTabManager:Oh,query:u_,runTransaction:S_,setDoc:g_,updateDoc:__,where:c_,writeBatch:V_},Symbol.toStringTag,{value:"Module"}));var C_="firebase",D_="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */rn(C_,D_,"app");export{v_ as A,R_ as B,ar as C,Pd as D,Dc as E,In as F,m_ as G,Sh as H,g_ as I,u_ as J,Zg as K,xc as L,h_ as M,c_ as N,p_ as O,__ as P,y_ as Q,V_ as R,Uf as S,E_ as T,I_ as U,l_ as V,S_ as W,P_ as X,J_ as Y,ms as _,F_ as a,O_ as b,G_ as c,Ot as d,q_ as e,Q as f,N_ as g,on as h,k_ as i,wd as j,Ff as k,x_ as l,K_ as m,ds as n,L_ as o,B_ as p,U_ as q,rn as r,M_ as s,Cc as t,bc as u,Ad as v,j_ as w,z_ as x,qf as y,t_ as z};
