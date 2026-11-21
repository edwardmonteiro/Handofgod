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

test('context is lazy; unlock resumes and reuses a single context',()=>{
  reset();const a=createAudio();a.ambience(.5);a.shape(1,.5);assert.equal(contexts.length,0);
  a.unlock();a.unlock();assert.equal(contexts.length,1);assert.equal(contexts[0].state,'running');
});
test('mute persists and smooths master gain, including a muted first unlock',()=>{
  reset();const a=createAudio();assert.equal(a.toggleMute(),true);assert.equal(storage.get('handofgod.muted'),'1');
  a.unlock();assert.equal(contexts[0].nodes[0].gain.value,0);
  assert.equal(a.toggleMute(),false);assert.equal(contexts[0].nodes[0].gain.value,.6);assert.equal(storage.get('handofgod.muted'),'0');
});
test('more water increases sea base gain and brightness while retaining a positive swell trough',()=>{
  reset();const a=createAudio();a.unlock();const ctx=contexts[0];
  const seaFilter=ctx.nodes.find(n=>n.kind==='filter');
  const seaGain=seaFilter.connections[0];
  const swell=ctx.nodes.find(n=>n.kind==='osc' && n.frequency.value===.09);
  const depth=swell.connections[0];
  a.ambience(1);const landGain=seaGain.gain.value, landFreq=seaFilter.frequency.value;
  assert.equal(landGain,.08);assert.ok(landGain-depth.gain.value>0);
  a.ambience(0);assert.equal(seaGain.gain.value,.16);assert.ok(seaFilter.frequency.value>landFreq);assert.ok(seaGain.gain.value>landGain);
  assert.ok(seaGain.gain.value-depth.gain.value>0);
});
test('brush updates reuse nodes and stop releases the shaping gain',()=>{
  reset();const a=createAudio();a.unlock();const ctx=contexts[0],count=ctx.nodes.length;
  const shapeFilter=ctx.nodes.filter(n=>n.kind==='filter')[1],shapeGain=shapeFilter.connections[0];
  for(let i=0;i<1000;i++){a.shape(i%2?1:-1,.5);a.ambience((i%10)/10);}
  assert.equal(ctx.nodes.length,count);assert.ok(shapeGain.gain.value>0);
  a.shape(0,0);assert.equal(shapeGain.gain.value,0);assert.equal(shapeGain.gain.targets.at(-1).constant,.12);
});
test('storage denial does not stop mute and missing Web Audio is safe',()=>{
  reset();globalThis.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
  const a=createAudio();assert.equal(a.muted,false);assert.equal(a.toggleMute(),true);
  globalThis.window={};assert.doesNotThrow(()=>a.unlock());assert.equal(contexts.length,0);
});
test('dispose closes the context',()=>{reset();const a=createAudio();a.unlock();a.dispose();assert.equal(contexts[0].state,'closed');});

test('idle shape automation dedupes; context recreation resets cache',()=>{
  reset();const a=createAudio();a.unlock();const g=contexts[0].nodes.filter(n=>n.kind==='filter')[1].connections[0].gain;
  for(let i=0;i<1000;i++)a.shape(0,0);assert.equal(g.targets.length,1);
  a.shape(1,.5);a.shape(1,.5);assert.equal(g.targets.length,2);
  a.dispose();a.unlock();a.shape(1,.5);assert.equal(contexts[1].nodes.filter(n=>n.kind==='filter')[1].connections[0].gain.targets.length,1);
});
test('follower cues: no pre-unlock, muted or suspended cue; throttle, voice cap, pan and cleanup',()=>{
  reset();const a=createAudio();a.followerCue('settle',0);assert.equal(contexts.length,0);a.unlock();const ctx=contexts[0],base=ctx.nodes.length;
  a.followerCue('unknown',0);assert.equal(ctx.nodes.length,base);
  for(let i=0;i<100;i++)a.followerCue('settle',2);assert.equal(ctx.nodes.length,base+3);
  assert.equal(ctx.nodes.at(-1).pan.value,1);
  for(const t of [1.1,1.2,1.3,1.4]){ctx.currentTime=t;a.followerCue('drown',-2);}
  assert.equal(ctx.nodes.length,base+12); // four voices, fifth rejected at 1.4
  const voice=ctx.nodes[base];voice.onended();assert.equal(voice.disconnected,true);
  ctx.currentTime=2;a.followerCue('drown',0);assert.equal(ctx.nodes.length,base+15);
  a.toggleMute();ctx.currentTime=3;a.followerCue('settle',0);assert.equal(ctx.nodes.length,base+15);
  a.toggleMute();ctx.state='suspended';a.followerCue('settle',0);assert.equal(ctx.nodes.length,base+15);
});
