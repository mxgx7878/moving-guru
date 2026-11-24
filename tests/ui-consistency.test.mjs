import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
const vite=await createServer({configFile:false,plugins:[react(),{name:'test-no-prebundle',configResolved(c){c.optimizeDeps.include=[];c.optimizeDeps.noDiscovery=true;}}],optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,watch:null},appType:'custom'});
const load=async p=>(await vite.ssrLoadModule('/src/'+p));
const {default:subscription}=await load('store/slices/subscriptionSlice.js');
const {default:auth}=await load('store/slices/authSlice.js');
const authActions=await load('store/actions/authAction.js');
const {default:grow}=await load('store/slices/growSlice.js');
const actions=await load('store/actions/subscriptionAction.js');
const growActions=await load('store/actions/grow.js');
const {default:Gate}=await load('components/gates/RequireFeature.jsx');
const {default:FeatureGate}=await load('components/gates/FeatureGate.jsx');
const {default:axios}=await load('config/axiosInstance.js');
const {default:Grow}=await load('pages/common/Grow.jsx');
const {default:PageHeader}=await load('components/ui/PageHeader.jsx');
const {default:Spinner}=await load('components/feedback/Spinner.jsx');
const {default:ChipGroup}=await load('components/ui/ChipGroup.jsx');
const {default:useSubscriptionRefresh}=await load('hooks/useSubscriptionRefresh.js');
const tick=()=>new Promise(r=>setTimeout(r,0));
const fakeAuth=(s={user:{id:1,role:'instructor',name:'Member'}})=>s;
const makeStore=()=>configureStore({reducer:{subscription,grow,auth:fakeAuth}});
const wrap=(store,child)=>React.createElement(Provider,{store},React.createElement(MemoryRouter,{future:{v7_startTransition:true,v7_relativeSplatPath:true}},child));
const json=r=>JSON.stringify(r.toJSON());
const pendingAdapter=()=>{
 const requests=[];
 axios.defaults.adapter=config=>new Promise((resolve,reject)=>requests.push({config,resolve:data=>resolve({data,status:200,statusText:'OK',headers:{},config}),reject:()=>reject({message:'Offline',config,response:{status:500,data:{message:'Offline'}}})}));
 return requests;
};
try {
await test('subscription check tracks idle, pending, failed and resolved-empty independently of plan loading',()=>{
 let s=subscription(undefined,{type:'init'});
 assert.equal(s.currentStatus,'idle');
 s=subscription(s,actions.fetchCurrentSubscription.pending('one'));
 assert.equal(s.currentStatus,'loading');
 s=subscription(s,actions.fetchPlans.fulfilled({data:[]},'plans'));
 assert.equal(s.currentStatus,'loading');
 s=subscription(s,actions.fetchCurrentSubscription.rejected(null,'one',undefined,'Offline'));
 assert.equal(s.currentStatus,'failed');
 s=subscription(s,actions.fetchCurrentSubscription.pending('two'));
 s=subscription(s,actions.fetchCurrentSubscription.fulfilled({data:{subscription:null}},'two'));
 assert.equal(s.currentStatus,'succeeded');
 assert.equal(s.currentSubscription,null);
});
await test('background /me refresh keeps the current user and does not start the global loader',()=>{
 let state=auth(undefined,authActions.loginUser.fulfilled({data:{user:{id:1,role:'instructor'},access_token:'test'}},'login'));
 assert.equal(state.status,'succeeded');
 state=auth(state,authActions.getMe.pending('background',{background:true}));
 assert.equal(state.status,'succeeded');
 state=auth(state,authActions.getMe.rejected(null,'background',{background:true},'Offline'));
 assert.equal(state.status,'succeeded');
 assert.equal(state.user.id,1);
 assert.equal(state.error,null);
});
await test('background subscription refresh preserves confirmed gate state until its response',()=>{
 let state=subscription(undefined,actions.fetchCurrentSubscription.pending('first'));
 state=subscription(state,actions.fetchCurrentSubscription.fulfilled({data:{subscription:{status:'active',plan:{featureKeys:['grow_posts']}}}},'first'));
 state=subscription(state,actions.fetchCurrentSubscription.pending('background',{background:true}));
 assert.equal(state.currentStatus,'succeeded');
 assert.deepEqual(state.currentSubscription.plan.featureKeys,['grow_posts']);
 state=subscription(state,actions.fetchCurrentSubscription.fulfilled({data:{subscription:null}},'background',{background:true}));
 assert.equal(state.currentSubscription,null);
 assert.equal(state.currentStatus,'succeeded');
});
await test('older subscription responses cannot overwrite the latest request',()=>{
 let s=subscription(undefined,actions.fetchCurrentSubscription.pending('old'));
 s=subscription(s,actions.fetchCurrentSubscription.pending('new'));
 s=subscription(s,actions.fetchCurrentSubscription.fulfilled({data:{subscription:{id:9}}},'old'));
 assert.equal(s.currentStatus,'loading');
 assert.equal(s.currentSubscription,null);
});
for(const Component of [Gate,FeatureGate]){
 await test(Component.name+' shows loader until response, content on allowed plan, gate only on resolved absence',async()=>{
  const requests=pendingAdapter(),store=makeStore();let rendered;
  await act(async()=>{rendered=Renderer.create(wrap(store,React.createElement(Component,{feature:'sample'},React.createElement('p',null,'Protected data'))));await tick();});
  assert.equal(requests.length,1);
  assert.match(json(rendered),/Loading/);assert.doesNotMatch(json(rendered),/Protected data|requires an upgrade|locked/);
  await act(async()=>{requests[0].resolve({data:{subscription:{status:'active',plan:{featureKeys:['sample']}}}});await tick();});
  assert.match(json(rendered),/Protected data/);
  await act(async()=>{store.dispatch(actions.fetchCurrentSubscription({background:true}));await tick();});
  assert.match(json(rendered),/Protected data/);assert.doesNotMatch(json(rendered),/Loading/);
  await act(async()=>{requests[1].resolve({data:{subscription:null}});await tick();});
  assert.doesNotMatch(json(rendered),/Protected data/);
  assert.match(json(rendered),/upgrade|Upgrade|plan/);
  assert.equal(requests.length,2,'resolved empty subscriptions must not refetch in a loop');
  act(()=>rendered.unmount());
 });
}
await test('failed access checks show retry instead of an upgrade gate, and retry recovers',async()=>{
 const requests=pendingAdapter(),store=makeStore();let r;
 await act(async()=>{r=Renderer.create(wrap(store,React.createElement(Gate,{feature:'sample'},'Protected data')));await tick();});
 await act(async()=>{requests[0].reject();await tick();});
 assert.match(json(r),/couldn't check your subscription/);assert.doesNotMatch(json(r),/View plans/);
 await act(async()=>{r.root.findByType('button').props.onClick();await tick();});
 assert.match(json(r),/Loading/);
 await act(async()=>{requests[1].resolve({data:{subscription:{status:'active',plan:{featureKeys:['sample']}}}});await tick();});
 assert.match(json(r),/Protected data/);act(()=>r.unmount());
});
await test('profile arrangement chips show their selection and respond to clicks',()=>{
 let selected=['Direct Hire','Swaps'];
 const render=()=>React.createElement(ChipGroup,{options:['Direct Hire','Swaps'],value:selected,onChange:next=>{selected=next;},multiple:true,tone:'coral'});
 let r;act(()=>{r=Renderer.create(render());});
 const active=r.root.findAllByType('button')[0];
 const activeClass=active.props.className;
 assert.equal(active.props['aria-pressed'],true);
 act(()=>{active.props.onClick();r.update(render());});
 const inactive=r.root.findAllByType('button')[0];
 assert.deepEqual(selected,['Swaps']);
 assert.equal(inactive.props['aria-pressed'],false);
 assert.notEqual(activeClass,inactive.props.className);
 act(()=>r.unmount());
});
await test('subscription loads once across portal routes and refreshes silently on focus',async()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 const listeners={};
 globalThis.window={addEventListener:(name,fn)=>{listeners[name]=fn;},removeEventListener:(name)=>{delete listeners[name];}};
 globalThis.document={visibilityState:'visible',addEventListener:(name,fn)=>{listeners[name]=fn;},removeEventListener:(name)=>{delete listeners[name];}};
 const requests=pendingAdapter(),store=makeStore();
 const Probe=()=>{useSubscriptionRefresh('instructor');const navigate=useNavigate();return React.createElement('button',{onClick:()=>navigate('/next')},'Next');};
 let r;
 try{
  await act(async()=>{r=Renderer.create(wrap(store,React.createElement(Probe)));await tick();});
  assert.equal(requests.length,1,'entry checks subscription without visiting its page');
  await act(async()=>{requests.splice(0)[0].resolve({data:{subscription:null}});await tick();});
  await act(async()=>{r.root.findByType('button').props.onClick();await tick();});
  assert.equal(requests.length,0,'navigation reuses the cached subscription');
  await act(async()=>{listeners.focus();listeners.focus();await tick();});
  assert.equal(requests.length,2,'focus rechecks /me and subscription once each');
  assert.equal(store.getState().subscription.currentStatus,'succeeded','background refresh does not restart the gate loader');
  await act(async()=>{requests.splice(0).forEach(q=>q.resolve(q.config.url==='/me'?{data:{user:{id:1,role:'instructor'}}}:{data:{subscription:null}}));await tick();});
 }finally{if(r)act(()=>r.unmount());globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
await test('Grow keeps public and my-post lifecycles independent and ignores older responses',()=>{
 let s=grow(undefined,growActions.fetchGrowPosts.pending('feed'));
 s=grow(s,growActions.fetchMyGrowPosts.pending('mine'));
 s=grow(s,growActions.fetchGrowPosts.fulfilled({data:[]},'feed'));
 assert.equal(s.status,'succeeded');assert.equal(s.myPostsStatus,'loading');
 s=grow(s,growActions.fetchGrowPosts.pending('old'));
 s=grow(s,growActions.fetchGrowPosts.pending('new'));
 s=grow(s,growActions.fetchGrowPosts.fulfilled({data:[{id:3}]},'old'));
 assert.equal(s.status,'loading');assert.deepEqual(s.posts,[]);
});
await test('returning to Grow hides cached cards until its fresh request resolves',async()=>{
 const requests=pendingAdapter(),store=makeStore();
 store.dispatch(growActions.fetchGrowPosts.pending('seed'));
 store.dispatch(growActions.fetchGrowPosts.fulfilled({data:[{id:3,user_id:2,title:'STALE CARD',type:'event',disciplines:[]}]},'seed'));
 let r;
 await act(async()=>{r=Renderer.create(wrap(store,React.createElement(Grow)));await tick();});
 assert.match(json(r),/Loading/);assert.doesNotMatch(json(r),/STALE CARD/);
 assert.equal(requests.length,2);
 await act(async()=>{requests.forEach(q=>q.resolve({data:[]}));await tick();});
 assert.doesNotMatch(json(r),/STALE CARD/);assert.match(json(r),/No results found/);
 act(()=>r.unmount());
});
await test('shared header keeps overview actions and children; spinner announces loading',()=>{
 let r;act(()=>{r=Renderer.create(React.createElement(PageHeader,{title:'Overview',eyebrow:'Welcome',description:'Details',actions:React.createElement('button',null,'Edit')},'Extra'));});
 assert.match(json(r),/linear-gradient/);assert.match(json(r),/Overview/);assert.match(json(r),/Edit/);assert.match(json(r),/Extra/);act(()=>r.unmount());
 act(()=>{r=Renderer.create(React.createElement(Spinner));});
 assert.equal(r.root.findAllByProps({role:'status'}).length,1);act(()=>r.unmount());
});
await test('logout resets account-scoped data and subscription readiness',async()=>{
 const {default:store}=await load('store/store.js');
 store.dispatch(actions.fetchCurrentSubscription.pending('account'));
 store.dispatch(actions.fetchCurrentSubscription.fulfilled({data:{subscription:{status:'active',plan:{featureKeys:['sample']}}}},'account'));
 store.dispatch({type:'auth/resetAuth'});
 assert.equal(store.getState().subscription.currentStatus,'idle');
 assert.equal(store.getState().subscription.currentSubscription,null);
 assert.deepEqual(store.getState().grow.posts,[]);
 store.dispatch(actions.fetchCurrentSubscription.fulfilled({data:{subscription:{id:'old-account'}}},'account'));
 assert.equal(store.getState().subscription.currentSubscription,null);
});

await test('all portal pages import and render their initial state without runtime errors',async()=>{
 const {default:store}=await load('store/store.js');
 globalThis.window={innerWidth:1280,location:{pathname:'/'},addEventListener(){},removeEventListener(){}};
 const pages=[
  'admin/AdminCommunications','admin/AdminDashboard','admin/AdminGrowPosts','admin/AdminGrowPromoCodes','admin/AdminJobs','admin/AdminPosts','admin/AdminPromoCodes','admin/AdminReports','admin/AdminReviews','admin/AdminSettings','admin/AdminSubscriptions','admin/AdminUsers',
  'common/Announcements','common/Grow','common/GrowPostForm','common/Messages','common/Payments','common/Subscription',
  'instructor/Dashboard','instructor/FindWork','instructor/MyApplications','instructor/ProfilePage','instructor/SavedJobs',
  'studio/Favourites','studio/InstructorDetail','studio/JobListings','studio/SearchInstructors','studio/StudioDashboard','studio/StudioProfile'
 ];
 for(const name of pages){
  pendingAdapter();
  store.dispatch({type:'auth/resetAuth'});
  const role=name.startsWith('admin/')?'admin':name.startsWith('studio/')?'studio':'instructor';
  store.dispatch({type:'auth/login/fulfilled',payload:{data:{user:{id:1,role,name:'Preview User',status:'active',email:'preview@example.test'},access_token:'test-only'}}});
  const {default:Page}=await load('pages/'+name+'.jsx');let r;
  await act(async()=>{r=Renderer.create(wrap(store,React.createElement(Page)));await tick();});
  assert.ok(r.toJSON(),name+' rendered');
  act(()=>r.unmount());
 }
});
await test('brand foreground and surface pairs meet normal-text contrast',async()=>{
 const {default:theme}=await import('../tailwind.config.js');
 const c=theme.theme.extend.colors;
 const lum=hex=>{
  const channels=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
  return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
 };
 const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 for(const [fg,bg] of [[c.brand.ink,'#FFFFFF'],[c.ink.DEFAULT,c.coral.DEFAULT],[c.ink.muted,'#FFFFFF'],[c.brand.ink,'#F5FDA6']]){
  assert.ok(contrast(fg,bg)>=4.5,fg+' on '+bg);
 }
});

} finally {await vite.close();}
