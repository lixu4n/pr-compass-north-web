(() => {
  const root = document.querySelector('[data-workflow]');
  if (!root) return;
  const base = 'https://github.com/lixu4n/pr-compass/blob/ceb80097ef1595b7496cfab95aacd77cf2f97145/';
  const steps = {
    input: {name:'Choose the pull request', label:'PR identity + exact commits', who:'GitHub Actions / CLI', input:'Repository owner, repository name, PR number, and run configuration.', action:'When explicitly enabled, the automatic workflow handles opened, synchronize, reopened, and ready_for_review events for eligible PRs. It runs a pinned Compass revision, never target PR code.', output:'A configured run using Bob or OpenAI. The reusable action defaults to dry-run; the opt-in automatic workflow explicitly enables publication.', note:'Automatic publication and same-comment refresh are verified in our demo repository. Exploring this diagram makes no GitHub or model calls.', sources:[['tools/compass/index.ts',107],['action.yml',60],['.github/workflows/compass-auto.yml',1]]},
    collect:{name:'Collect the evidence',label:'GitHub REST → source bundle',who:'Compass collector',input:'PR metadata, base/head commit SHAs, changed-file patches, and selected project documents.',action:'Skip ineligible PRs. Read bounded patches and head-commit JavaScript/TypeScript snippets, plus up to four known docs at the base commit. Assign source IDs and preserve omissions.',output:'CollectionResult: versioned sources, PR identity, commit SHAs, and limits/omissions.',note:'Collection is bounded: up to 20 changed files. This is not a complete repository scan or general unchanged-caller discovery. Target PR code is not checked out or executed.',sources:[['tools/compass/collect.ts',198],['tools/compass/collect.ts',129]]},
    bob:{name:'Analyze with your model',label:'Prepared bundle → model JSON',who:'IBM Bob Shell or OpenAI Responses',input:'Compass’s trusted prompt plus the already-collected source manifest and snippets.',action:'Bob receives the bundle over stdin with tool groups, MCP and subagents disabled. OpenAI receives a Responses API request with tools disabled and storage disabled. The model returns purpose, relevant context, and reading order using supplied source IDs.',output:'Six model fields: status, purpose, relevantContext, readingOrder, limitations, and unavailableReason.',note:'The model does not fetch extra repository context or supply trusted source URLs. Bob is live-verified; OpenAI has offline adapter tests. Dry-run can still incur provider charges.',sources:[['tools/compass/analyze.ts',157],['tools/compass/bob-runtime.ts',48],['tools/compass/prompts/context.md',1]]},
    validate:{name:'Check the explanation',label:'Schema + citations + provenance',who:'Compass validation',input:'Bob’s success envelope and model JSON, alongside the collector’s source manifest.',action:'Parse the strict model schema and resolve every cited source ID. Assemble sources and provenance from collector data, then validate the assembled brief. The provided workflows disable repair. Purpose summaries allow up to 300 characters; invalid output is rejected.',output:'A ContextBrief with ok, partial, or unavailable status.',note:'Schema and citation checks establish structure and traceability; they do not prove every explanation is correct. Human judgment still matters.',sources:[['tools/compass/analyze.ts',288],['tools/compass/analyze.ts',50],['tools/compass/validate.ts',48]]},
    unavailable:{name:'If analysis is unavailable',label:'Failure → explicit unavailable result',who:'Failure path',input:'An analysis failure or invalid assembled brief after any permitted repair.',action:'The CLI creates an unavailable brief using the collected PR identity and commit provenance. The renderer explains why verified context is unavailable instead of substituting a successful demo response.',output:'Unavailable JSON and Markdown, saved locally; the run receives a failing status. If publication is explicitly enabled and its checks pass, an unavailable comment can replace a previous bot-owned brief.',note:'PR eligibility skips and collection failures happen earlier and do not follow this artifact path.',sources:[['tools/compass/index.ts',107],['tools/compass/render.ts',199]]},
    save:{name:'Render & save the brief',label:'ContextBrief → JSON + Markdown',who:'Compass renderer & artifacts',input:'The validated or explicitly unavailable ContextBrief.',action:'Build a compact Markdown comment with purpose, relevant context, suggested reading order, provenance, and limitations. Save both the assembled JSON and exact proposed comment in a separate local run directory.',output:'compass-output/…/context-brief.json and context-comment.md.',note:'The renderer targets a compact comment. Links come from collected source records, and source text is escaped for Markdown.',sources:[['tools/compass/render.ts',229],['tools/compass/artifacts.ts',1]]},
    dry:{name:'Dry-run: inspect locally',label:'Default · no comment writes',who:'Engineer',input:'The saved JSON and proposed Markdown comment.',action:'Read the prepared context and follow its source links before reviewing the PR. The default path stops without writing a GitHub comment.',output:'A locally inspectable context brief for human review.',note:'Dry-run prevents publication, not model inference. It is not a no-cost mode.',sources:[['tools/compass/index.ts',129],['docs/AUTOMATION.md',1]]},
    publish:{name:'Publish on GitHub',label:'Optional · explicit enablement',who:'GitHub Actions publisher',input:'The rendered comment, analyzed base/head SHAs, and either the standard Actions token or a configured App installation token.',action:'With dry_run=false, locate the bot-owned comment by marker and author. Recheck PR eligibility and both commits immediately before writing. Create, update, or leave an identical comment unchanged.',output:'One bot-owned PR context comment, or a blocked publication if checks fail.',note:'Fork, draft, closed, bot-authored, stale, or ambiguous-comment cases block writing. Private repositories require explicit opt-in. Live publication is verified; REST checking and writing are not atomic.',sources:[['tools/compass/publish.ts',105],['tools/compass/publish.ts',58],['docs/AUTOMATION.md',1]]},
    file:{name:'Prepare a ReviewBrief file',label:'Separate legacy data contract',who:'Team member / Bob IDE workflow',input:'A pre-produced ReviewBrief JSON document.',action:'Place a compatible file at public/demo/review-brief.json. This path uses ReviewBrief, a different schema from the automation’s ContextBrief.',output:'A static JSON file served with the React application.',note:'There is no automatic handoff from context-brief.json to this viewer in the inspected branch.',sources:[['docs/ARCHITECTURE.md',1],['src/types/ReviewBrief.ts',1]]},
    loader:{name:'Load & validate JSON',label:'Browser fetch → Zod validation',who:'React app loader',input:'/demo/review-brief.json at page load.',action:'Fetch and parse the file, then validate it with ReviewBriefSchema. Return either a typed brief or an error.',output:'A valid ReviewBrief for rendering, or an on-page loading/validation error.',note:'The browser does not invoke Bob or query the GitHub API in this path.',sources:[['src/types/loader.ts',11],['src/App.tsx',9]]},
    viewer:{name:'Read the context',label:'ReviewBrief → React sections',who:'Human reviewer',input:'The validated ReviewBrief.',action:'Render What Changes, Where to Look, What Needs Human Judgment, and Checks & Limitations, alongside PR identity and source links.',output:'A companion to the diff that helps the engineer decide where to focus.',note:'Demo fixtures are labeled. Neither the viewer nor the automation approves a pull request.',sources:[['src/App.tsx',1],['docs/ARCHITECTURE.md',1]]}
  };
  const diagram = root.querySelector('[data-flow-map]');
  const detail = root.querySelector('[data-flow-detail]');
  let mode = 'automation';
  function select(id) {
    const step = steps[id];
    diagram.querySelectorAll('[data-node]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.node === id)));
    const owner = document.createElement('div');owner.className='wf-kicker';owner.textContent=step.who;
    const title = document.createElement('h3');title.textContent=step.name;
    const list = document.createElement('dl');
    for (const [label,text] of [['Input',step.input],['Process',step.action],['Output',step.output]]) {
      const dt=document.createElement('dt');dt.textContent=label;
      const dd=document.createElement('dd');dd.textContent=text;list.append(dt,dd);
    }
    const note=document.createElement('p');note.className='wf-note';note.textContent=step.note;
    const links=document.createElement('div');links.className='wf-sources';
    const heading=document.createElement('strong');heading.textContent='Follow the code';links.append(heading);
    step.sources.forEach(([path])=>{const a=document.createElement('a');a.href=base+path;a.target='_blank';a.rel='noopener noreferrer';a.textContent=path+' ↗';links.append(a)});
    detail.replaceChildren(owner,title,list,note,links);
  }
  function node(id, number) {
    const button=document.createElement('button');button.type='button';button.className='wf-node';button.dataset.node=id;button.setAttribute('aria-controls','workflow-detail');button.setAttribute('aria-pressed','false');
    const num=document.createElement('span');num.className='wf-num';num.textContent=number;
    const text=document.createElement('span');const name=document.createElement('strong');name.textContent=steps[id].name;const sub=document.createElement('small');sub.textContent=steps[id].label;text.append(name,sub);
    button.append(num,text);button.addEventListener('click',()=>select(id));return button;
  }
  function render(next) {
    mode=next;
    root.querySelectorAll('[data-flow-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.flowMode===mode)));
    diagram.replaceChildren();
    const chain=document.createElement('ol');chain.className='wf-chain';
    const ids=mode==='automation'?['input','collect','bob','validate','save']:['file','loader','viewer'];
    ids.forEach((id,index)=>{const li=document.createElement('li');li.append(node(id,String(index+1).padStart(2,'0')));
      if(id==='validate'){const side=document.createElement('div');side.className='wf-failure';side.append(node('unavailable','↳'));li.append(side)}
      chain.append(li);
    });
    diagram.append(chain);
    if(mode==='automation'){
      const branches=document.createElement('div');branches.className='wf-outputs';branches.setAttribute('aria-label','Output paths after saving artifacts');branches.append(node('dry','↳'),node('publish','↳'));diagram.append(branches);
    }
    root.querySelector('[data-flow-caption]').textContent=mode==='automation'?'Evidence → explanation → checked brief → local files or optional PR comment.':'Separate path: prepared ReviewBrief → browser validation → human review.';
    select(ids[0]);
  }
  root.querySelectorAll('[data-flow-mode]').forEach(button=>button.addEventListener('click',()=>render(button.dataset.flowMode)));
  render('automation');
})();
