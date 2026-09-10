import test from 'node:test'
import assert from 'node:assert/strict'
import { eligibleRepositories, readOrganization, websiteURL, resolveWebsite, escapeHTML, editorial, publicAddress } from '../scripts/catalog.mjs'
const repo = (id, extra = {}) => ({id, name:`project-${id}`,full_name:`appautomaton/project-${id}`,owner:{login:'appautomaton'},private:false,visibility:'public',homepage:`https://example.com/${id}`,html_url:`https://github.com/appautomaton/project-${id}`,description:'A useful tool.',topics:[],...extra})
test('includes only public, organization-owned repositories with a valid About website; forks and archives remain eligible', () => {
 const items = eligibleRepositories([repo(1),repo(2,{private:true}),repo(3,{homepage:''}),repo(4,{homepage:null}),repo(5,{owner:{login:'elsewhere'}}),repo(6,{homepage:'javascript:alert(1)'}),repo(7,{fork:true,archived:true}),repo(1)],'appautomaton')
 assert.deepEqual(items.map(p=>p.name),['project-1','project-7'])
})
test('discovery reads every GitHub page and fails when any page is unavailable', async () => {
 let calls=0
 const result=await readOrganization('appautomaton','example-token',async (url, options)=>{
  calls++
  assert.equal(new URL(url).searchParams.get('type'),'public')
  assert.equal(options.headers.Authorization,'Bearer example-token')
  return {ok:true,json:async()=>calls===1?Array.from({length:100},(_,i)=>repo(i)): [repo(101)]}
 })
 assert.equal(result.length,101)
 assert.equal(calls,2)
 await assert.rejects(readOrganization('appautomaton',null,async()=>({ok:false,status:429})),/429/)
})
test('dangerous URLs and local destinations are not eligible', () => {
 for(const bad of ['data:text/html,hi','http://localhost/x','https://user:pass@example.com','http://127.0.0.1/','file:///etc/passwd','https://host.internal/']) assert.equal(websiteURL(bad),null)
 assert.equal(websiteURL(' https://example.com/path?q=ok '),'https://example.com/path?q=ok')
 for(const ip of ['127.0.0.1','10.0.0.1','172.16.0.1','192.168.1.2','169.254.1.1','::1','fd00::1','fe80::1']) assert.equal(publicAddress(ip),false)
 assert.equal(publicAddress('93.184.215.14'),true)
})
test('permanent redirects are resolved from actual metadata, without sending credentials',async()=>{
 let calls=0
 const final=await resolveWebsite('https://old.example.com/tool/',async (url,options)=>{
  calls++
  assert.equal(options.headers,undefined)
  return calls===1?{status:301,headers:new Headers({location:'https://new.example.com/a/?b=1'})}:{status:200,headers:new Headers()}
 },async()=>{})
 assert.equal(final,'https://new.example.com/a/?b=1')
 assert.equal(calls,2)
})
test('temporary redirects are not made permanent and loops fail',async()=>{
 const temporary=await resolveWebsite('https://example.com/',async()=>({status:302,headers:new Headers({location:'https://temporary.example.com/'})}),async()=>{})
 assert.equal(temporary,'https://example.com/')
 await assert.rejects(resolveWebsite('https://example.com/',async()=>({status:301,headers:new Headers({location:'/'})}),async()=>{}),/loop/)
 await assert.rejects(resolveWebsite('https://example.com/',async()=>({status:301,headers:new Headers({location:'http://localhost/'})}),async()=>{}),/Unsafe/)
})
test('removed About URLs remove entries on the next successful sync',()=>{
 assert.equal(eligibleRepositories([repo(1)],'appautomaton').length,1)
 assert.equal(eligibleRepositories([repo(1,{homepage:''})],'appautomaton').length,0)
})
test('source metadata is escaped and prose punctuation follows the site style',()=>{
 assert.equal(escapeHTML('<script>"&\''),'&lt;script&gt;&quot;&amp;&#39;')
 assert.equal(editorial('A tool — useful things; you choose.'),'A tool: useful things. You choose.')
})
