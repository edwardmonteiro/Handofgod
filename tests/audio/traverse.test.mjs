import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudio} from '../../src/audio/audio.js';

let contexts, storage;
class Param {
  constructor(){this.value=0;this.targets=[];}
  setValueAtTime(value,time){this.value=value;return this;}
  linearRampToValueAtTime(value,time){this.value=value;return this;}
  exponentialRampToValueAtTime(value,time){this.value=value;return this;}
  setTargetAtTime(value,time,constant){this.targets.push({value,time,constant});this.value=value;}
}
class MockNode {
  constructor(kind){this.kind=kind;this.gain=new Param();this.frequency=new Param();this.detune=new Param();this.Q=new Param();this.connections=[];}
  connect(node){this.connections.push(node);return node;}
  start(){this.started=true;}
  stop(t){this.stopAt=t;}
  disconnect(){this.disconnected=true;}
}
class Context {
  constructor(){this.nodes=[];this.sampleRate=100;this.currentTime=1;this.state='suspended';this.destination={};contexts.push(this);}
  node(kind){const n=new MockNode(kind);this.nodes.push(n);return n;}
  createGain(){return this.node('gain');}
  createStereoPanner(){const n=this.node('panner');n.pan=new Param();return n;}
  createOscillator(){return this.node('osc');}
  createBiquadFilter(){return this.node('filter');}
  createBufferSource(){return this.node('source');}
  createBuffer(ch,len){return {getChannelData:()=>new Float32Array(len)};}
  resume(){this.state='running';return Promise.resolve();}
  close(){this.state='closed';return Promise.resolve();}
}
function reset(){contexts=[];storage=new Map();globalThis.window={AudioContext:Context};globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};}


test('scene before unlock is lazy; cards quiet layers; restore traversal after context rebuild',()=>{
 reset();const a=createAudio();a.scene('traverse');assert.equal(contexts.length,0);a.unlock();
 const ctx=contexts[0],filter=ctx.nodes.find(n=>n.kind==='filter'),gain=filter.connections[0].gain;
 assert.equal(gain.value,.018);a.scene('card');assert.equal(gain.value,0);
 const count=ctx.nodes.length;a.stageEvent('step',0,.5);assert.equal(ctx.nodes.length,count);
 a.scene('traverse');a.dispose();a.unlock();assert.equal(contexts[1].nodes.find(n=>n.kind==='filter').connections[0].gain.value,.018);
});
test('stage cues gate unknown, pre-unlock, wrong scene, mute, suspend; clamp and mono fallback',()=>{
 reset();const a=createAudio();a.stageEvent('step');assert.equal(contexts.length,0);a.unlock();const ctx=contexts[0],base=ctx.nodes.length;
 a.stageEvent('step');assert.equal(ctx.nodes.length,base);a.scene('traverse');
 a.stageEvent('unknown');a.stageEvent('land',0,NaN);assert.equal(ctx.nodes.length,base);
 a.stageEvent('step',8,8);assert.equal(ctx.nodes.at(-1).pan.value,1);assert.equal(ctx.nodes.length,base+3);
 for(let i=0;i<100;i++)a.stageEvent('step');assert.equal(ctx.nodes.length,base+3);
 a.toggleMute();ctx.currentTime=2;a.stageEvent('jump');assert.equal(ctx.nodes.length,base+3);
 a.toggleMute();ctx.state='suspended';a.stageEvent('jump');assert.equal(ctx.nodes.length,base+3);
 ctx.state='running';ctx.createStereoPanner=null;a.stageEvent('land',0,.7);assert.equal(ctx.nodes.length,base+5);
 const osc=ctx.nodes.at(-2);osc.onended();assert.equal(osc.disconnected,true);
});
test('stage voice limits reserve completion slot and drop bursts without queue',()=>{
 reset();const a=createAudio();a.scene('traverse');a.unlock();const ctx=contexts[0],base=ctx.nodes.length;
 for(const type of ['step','jump','land','push','blocked'])a.stageEvent(type,0,1);
 assert.equal(ctx.nodes.length,base+15);a.stageEvent('reach');assert.equal(ctx.nodes.length,base+18);
 for(let i=0;i<100;i++)a.stageEvent('reach');assert.equal(ctx.nodes.length,base+18);
 ctx.currentTime=4;a.stageEvent('step');assert.equal(ctx.nodes.length,base+21);
});

test('beam cues are lazy, traversal-only, throttled, clamped and cleaned up',()=>{
 reset();const a=createAudio();for(const t of ['light','fall'])a.stageEvent(t);assert.equal(contexts.length,0);
 a.unlock();const ctx=contexts[0],base=ctx.nodes.length;
 for(const t of ['light','fall'])a.stageEvent(t);assert.equal(ctx.nodes.length,base);a.scene('traverse');
 a.stageEvent('light',-8,8);assert.equal(ctx.nodes.length,base+3);assert.equal(ctx.nodes.at(-1).pan.value,-1);
 const light=ctx.nodes.at(-3);assert.equal(light.frequency.value,440);
 for(let i=0;i<100;i++)a.stageEvent('light');assert.equal(ctx.nodes.length,base+3);
 a.stageEvent('fall',8,.7);assert.equal(ctx.nodes.length,base+6);assert.equal(ctx.nodes.at(-1).pan.value,1);
 for(let i=0;i<100;i++)a.stageEvent('fall');assert.equal(ctx.nodes.length,base+6);
 const fall=ctx.nodes.at(-3);light.onended();fall.onended();assert.equal(light.disconnected,true);assert.equal(fall.disconnected,true);
 ctx.currentTime=3;a.toggleMute();a.stageEvent('light');a.stageEvent('fall');assert.equal(ctx.nodes.length,base+6);
 a.toggleMute();ctx.state='suspended';a.stageEvent('fall');assert.equal(ctx.nodes.length,base+6);
 ctx.state='running';a.scene('card');a.stageEvent('light');assert.equal(ctx.nodes.length,base+6);
 a.scene('traverse');a.stageEvent('fall');assert.equal(ctx.nodes.length,base+9);
});
