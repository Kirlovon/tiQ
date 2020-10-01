!function(e){var t={};function o(r){if(t[r])return t[r].exports;var s=t[r]={i:r,l:!1,exports:{}};return e[r].call(s.exports,s,s.exports,o),s.l=!0,s.exports}o.m=e,o.c=t,o.d=function(e,t,r){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)o.d(r,s,function(t){return e[t]}.bind(null,s));return r},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=1)}([function(e,t,o){var r,s,c;!function(a){if("object"==typeof e.exports){var i=a(o(2),t);void 0!==i&&(e.exports=i)}else s=[o,t],void 0===(c="function"==typeof(r=a)?r.apply(t,s):r)||(e.exports=c)}((function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.VMError=t.VM=t.opcodes=void 0,t.opcodes={NOTHING:0,LOAD:1,SAVE:2,ADD:3,SUBSTRACT:4,INCREASE:5,DECREASE:6,EQUAL:7,LESS:8,GREATER:9,AND:10,OR:11,XOR:12,NOT:13,JUMP:14,ZERO:15};t.VM=class{constructor(e={}){if(this.safe=!0,this.debug=!1,this.running=!1,this.counter=0,this.accumulator=0,this.memory=new Uint16Array(4096),"object"!=typeof e)throw new o("Config must be an object");"boolean"==typeof e.safe&&(this.safe=e.safe),"boolean"==typeof e.debug&&(this.debug=e.debug),this.reset()}start(){clearTimeout(this.loop),this.running=!0,this.loop=setTimeout(()=>this.step()),this.debug&&this.info("VM is started")}load(e){this.memory=e}reset(){this.counter=0,this.accumulator=0,this.memory=new Uint16Array(4096),clearTimeout(this.loop),this.debug&&this.info("VM is reseted")}stop(){this.running=!1,clearTimeout(this.loop),this.debug&&this.info("VM is stopped")}step(){this.counter>4095&&(this.counter=0);const e=this.fetch(this.counter),{opcode:t,argument:o}=this.decode(e);this.execute(t,o),this.counter+=1,this.running&&(this.loop=setTimeout(()=>this.step()))}fetch(e){return this.memory[e]}decode(e){let t=Math.floor(e/4096),r=Math.floor(e%4096);if(this.safe){if(t>15||t<0)throw new o("Invalid opcode");r>4095?(this.debug&&this.warn(`Argument was clamped from ${r} to "4095"`),r=4095):r<0&&(this.debug&&this.warn(`Argument was clamped from ${r} to "0"`),r=0)}return{opcode:t,argument:r}}execute(e,o){switch(e){case t.opcodes.NOTHING:this.debug&&this.log("NOTHING, "+o),this.running=!1,this.counter=0,this.accumulator=0;break;case t.opcodes.LOAD:this.debug&&this.log(`LOAD, ${o} (${this.memory[o]})`),this.accumulator=this.memory[o];break;case t.opcodes.SAVE:this.debug&&this.log(`SAVE, ${o} (${this.accumulator})`),this.memory[o]=this.accumulator;break;case t.opcodes.ADD:{let e=this.accumulator+this.memory[o];this.safe&&e>4095&&(e=4095),this.debug&&this.log(`ADD, ${o} (Accumulator: ${this.accumulator} => ${e})`),this.accumulator=e;break}case t.opcodes.SUBSTRACT:{let e=this.accumulator-this.memory[o];this.safe&&e<0&&(e=0),this.debug&&this.log(`SUBSTRACT, ${o} (Accumulator: ${this.accumulator} => ${e})`),this.accumulator=e;break}case t.opcodes.INCREASE:{let e=this.accumulator+1;this.safe&&e>4095&&(e=4095),this.debug&&this.log(`INCREASE, ${o} (Accumulator: ${this.accumulator} => ${e})`),this.accumulator=e;break}case t.opcodes.DECREASE:{let e=this.accumulator-1;this.safe&&e<0&&(e=0),this.debug&&this.log(`INCREASE, ${o} (Accumulator: ${this.accumulator} => ${e})`),this.accumulator=e;break}case t.opcodes.EQUAL:this.accumulator=this.accumulator===this.memory[o]?1:0;break;case t.opcodes.LESS:this.accumulator=this.accumulator<this.memory[o]?1:0;break;case t.opcodes.GREATER:this.accumulator=this.accumulator>this.memory[o]?1:0;break;case t.opcodes.AND:{const e=0===this.accumulator?0:1,t=0===this.memory[o]?0:1;this.accumulator=e&t;break}case t.opcodes.OR:{const e=0===this.accumulator?0:1,t=0===this.memory[o]?0:1;this.accumulator=e|t;break}case t.opcodes.XOR:{const e=0===this.accumulator?0:1,t=0===this.memory[o]?0:1;this.accumulator=e^t;break}case t.opcodes.NOT:this.accumulator=0===this.memory[o]?1:0;break;case t.opcodes.JUMP:{const e=o-1;this.debug&&this.log(`JUMP, ${o} (Counter: ${this.counter} => ${o})`),this.counter=e;break}case t.opcodes.ZERO:this.debug&&this.log(`ZERO, ${o} (Memory: ${this.memory[o]} => 0)`),0===this.accumulator&&(this.counter=o)}}info(e){console.info(`tiQ [${Date.now()}]`,e)}log(e){console.log(`tiQ [${Date.now()}]`,e)}warn(e){console.warn(`tiQ [${Date.now()}]`,e)}};class o extends Error{constructor(e,t){super(e),this.name="VMError",Error.captureStackTrace(this,o),this.message=e,t&&(this.cause=t),"string"!=typeof t&&"number"!=typeof t||(this.message=`${e}: ${t}`)}}t.VMError=o}))},function(e,t,o){"use strict";o.r(t);var r=o(0);const s=new r.VM({debug:!0,safe:!0});document.getElementById("load").onclick=async e=>{const t=await new Promise((e,t)=>{const o=document.createElement("input");o.type="file",o.onchange=t=>{e(t.target.files[0])},o.click()}),o=await(r=t,new Promise((e,t)=>{const o=new FileReader;o.readAsArrayBuffer(r),o.onload=t=>{t.target.result;const o=new Uint16Array(t.target.result);e(o)}}));var r;console.log(o),s.load(o),s.start(),a()},document.getElementById("reset").onclick=async e=>{s.reset()},document.getElementById("start").onclick=async e=>{s.start(),a()},document.getElementById("stop").onclick=async e=>{s.stop()};const c=document.getElementById("display").getContext("2d");c.imageSmoothingEnabled=!1;function a(){for(let e=0;e<32;e++)for(let t=0;t<32;t++){const o=3072+32*e+t,r=0!==s.memory[o];c.fillStyle=r?"white":"#1d1d1d",c.fillRect(t,e,1,1)}s.running&&requestAnimationFrame(a)}document.onkeydown=e=>{switch(e.code){case"ArrowUp":s.memory[3071]=1;break;case"ArrowDown":s.memory[3070]=1;break;case"ArrowLeft":s.memory[3069]=1;break;case"ArrowRight":s.memory[3068]=1;break;case"KeyZ":s.memory[3567]=1;break;case"KeyX":s.memory[3066]=1}},document.onkeyup=e=>{switch(e.code){case"ArrowUp":s.memory[3071]=0;break;case"ArrowDown":s.memory[3070]=0;break;case"ArrowLeft":s.memory[3069]=0;break;case"ArrowRight":s.memory[3068]=0;break;case"KeyZ":s.memory[3567]=0;break;case"KeyX":s.memory[3066]=0}}},function(e,t){function o(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}o.keys=function(){return[]},o.resolve=o,e.exports=o,o.id=2}]);