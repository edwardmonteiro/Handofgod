import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/engine/rng.js';
import { createWorld, generateIsland, isLand } from '../src/gameplay/world.js';
import { createFollowers, stepFollowers, BELIEF_PER_SECOND, DROWN_REMOVE_SECONDS } from '../src/gameplay/followers.js';

function solidWorld(w = 16, h = 16, height = 0.55) {
  const world = createWorld(w, h, 10);
  world.elev.fill(height);
  return world;
}

test('followers spawn on land with exact documented public fields', () => {
  const world = generateIsland(createWorld(192, 120, 73));
  const followers = createFollowers(world, createRng(7), 24);
  assert.equal(followers.list.length, 24);
  assert.equal(followers.belief, 0);
  assert.deepEqual(followers.events, []);
  for (const follower of followers.list) {
    assert.deepEqual(Object.keys(follower).sort(), ['age','state','x','y']);
    assert.equal(follower.state, 'wander');
    assert.equal(follower.age, 0);
    assert.ok(isLand(world, follower.x, follower.y));
  }
});

test('fully submerged map cannot spin forever or spawn into water', () => {
  const followers = createFollowers(createWorld(4, 4, 17), createRng(17), 100);
  assert.deepEqual(followers, { list: [], belief: 0, events: [] });
});

test('same seeds and step sequence produce identical simulations', () => {
  const world = solidWorld();
  const rngA=createRng(12), rngB=createRng(12);
  const a=createFollowers(world,rngA,12), b=createFollowers(world,rngB,12);
  for(let i=0;i<300;i++) {
    stepFollowers(a,world,rngA,1/60);
    stepFollowers(b,world,rngB,1/60);
  }
  assert.deepEqual(a,b);
});

test('wanderers avoid water and stay within world bounds', () => {
  const world=solidWorld(10,10);
  world.elev.fill(0.2);
  for(let y=1;y<9;y++)for(let x=4;x<=5;x++)world.elev[y*world.w+x]=0.55;
  const rng=createRng(32), followers=createFollowers(world,rng,16);
  for(let i=0;i<600;i++){
    stepFollowers(followers,world,rng,1/60);
    for(const f of followers.list){
      assert.ok(f.x>=0&&f.x<=world.w-1&&f.y>=0&&f.y<=world.h-1);
      assert.ok(isLand(world,f.x,f.y),'follower entered water');
    }
  }
});

test('grass surrounded by land allows settling', () => {
  const world=solidWorld(),rng=createRng(10),followers=createFollowers(world,rng,16);
  for(let i=0;i<1200;i++)stepFollowers(followers,world,rng,1/60);
  assert.ok(followers.list.some(f=>f.state==='settled'));
});

test('settled followers accrue belief at named per-second rate', () => {
  const world=solidWorld(), rng=createRng(1), followers=createFollowers(world,rng,2);
  followers.list.forEach(f=>{f.state='settled';f.age=0});
  stepFollowers(followers,world,rng,1);
  stepFollowers(followers,world,rng,0.5);
  assert.equal(followers.belief,3*BELIEF_PER_SECOND);
});

test('drown transition emits once, removes follower after two seconds', () => {
  const world=solidWorld(),rng=createRng(3),followers=createFollowers(world,rng,1);
  const f=followers.list[0];
  world.elev[f.y*world.w+f.x]=0.1;
  stepFollowers(followers,world,rng,1/60);
  assert.equal(f.state,'drowning');assert.equal(f.age,0);
  assert.deepEqual(followers.events,[{type:'drown',x:f.x,y:f.y}]);
  stepFollowers(followers,world,rng,DROWN_REMOVE_SECONDS-0.01);
  assert.equal(followers.list.length,1);
  stepFollowers(followers,world,rng,0.02);
  assert.equal(followers.list.length,0);
  assert.deepEqual(followers.events,[]);
});

test('drowning earns no belief; invalid dt has no simulation effect', () => {
  const world=solidWorld(),rng=createRng(9),followers=createFollowers(world,rng,1);
  followers.list[0].state='settled';
  world.elev[followers.list[0].y*world.w+followers.list[0].x]=0.1;
  stepFollowers(followers,world,rng,0.1);
  assert.equal(followers.belief,0);assert.equal(followers.list[0].state,'drowning');
  stepFollowers(followers,world,rng,NaN);
  stepFollowers(followers,world,rng,-10);
  assert.equal(followers.list[0].age,0);
});

test('v1.1 settle/drown events are plain ephemeral records', () => {
  const world=solidWorld(),rng=createRng(10),followers=createFollowers(world,rng,12);
  let count=0;
  for(let i=0;i<1200;i++){
    stepFollowers(followers,world,rng,1/60);
    count+=followers.events.filter(e=>e.type==='settle').length;
    for(const event of followers.events) assert.deepEqual(Object.keys(event).sort(),['type','x','y']);
  }
  assert.ok(count>0);
  stepFollowers(followers,world,rng,0);
  assert.deepEqual(followers.events,[]);
  const f=followers.list[0];
  world.elev[Math.round(f.y)*world.w+Math.round(f.x)]=0;
  stepFollowers(followers,world,rng,1/60);
  assert.deepEqual(followers.events,[{type:'drown',x:f.x,y:f.y}]);
  stepFollowers(followers,world,rng,1/60);
  assert.deepEqual(followers.events,[]);
});
