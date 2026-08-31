const STATIONS=[["00","Ground rules"],["01","First contact"],["02","Mine the draft"],["03","The stop"],["04","Five elements"],["05","Story promise"],["06","Character bones"],["07","Structure"],["08","Handoff"]];
const STOP_REASONS=["I did not know what happened next","The characters walked off a plan I never wrote","I lost the feeling that made me start","Life happened and the thread went cold","I realized it was not the book I meant to write","I kept rewriting chapter 1 instead of going forward","I was afraid finishing would prove it wasn't good","I had no stakes, only situations","The midpoint was a blank wall","I was waiting for the book to announce itself"];
const KEYS=["author","pen","honestSentence","title","genre","heat","shape","length","reader","age","stillWant","protag","want","need","li","oppose","inciting","changed","pulse","stall","dodging","hoped","keepThree","genreLock","tropes","hook","stakes","core","p1","p2","p3","p4","p5","fWound","fLie","fFear","fDesire","fNeed","fGoal","mWound","mLie","mFear","mDesire","mNeed","mGoal","collide","beatSit","decision"];
const PROMPT="Run the CPH Fiction Planner starting at Phase 1 using this packet. Do not draft prose. Do not skip to an outline. First lock or challenge my five core elements and story promise. Then tell me which of my six chapters survive as Act 1, which get compressed, and which become salvage. After I approve Phase 1, move to premise.";
let step=0;
const state=JSON.parse(localStorage.getItem("cphReversePlanner")||"{}");
if(!state.chapters)state.chapters=Array.from({length:6},(_,i)=>({n:i+1,summary:"",pov:"",verdict:""}));
if(!state.stops)state.stops=[];
function $(s){return document.querySelector(s)}
function val(k){return(state[k]||"").trim()}
function esc(s){return String(s||"").replace(/"/g,"&quot;")}
function buildNav(){
  $("#nav").innerHTML="<h2>Stations</h2>"+STATIONS.map((s,i)=>`<button class="sbtn ${i===step?"on":""}" data-go="${i}"><span class="n">${s[0]}</span><span>${s[1]}</span></button>`).join("");
  $("#nav").querySelectorAll(".sbtn").forEach(b=>b.onclick=()=>go(+b.dataset.go));
}
function go(n){
  step=Math.max(0,Math.min(8,n));
  document.querySelectorAll(".station").forEach(s=>s.classList.toggle("on",+s.dataset.step===step));
  buildNav();
  $("#prev").style.visibility=step===0?"hidden":"visible";
  $("#next").textContent=step===8?"Stay on packet":"Next station";
  window.scrollTo({top:0,behavior:"smooth"});
}
function bindFields(){
  document.querySelectorAll("[data-k]").forEach(el=>{
    el.value=state[el.dataset.k]||"";
    el.addEventListener("input",()=>{state[el.dataset.k]=el.value;persist();});
  });
}
function buildChapters(){
  const root=$("#chapters");
  root.innerHTML=state.chapters.map((c,i)=>`<div class="ch"><h4>Chapter ${c.n}</h4><input type="text" placeholder="One sentence: what happens." value="${esc(c.summary)}" data-ch="${i}" data-field="summary"><input type="text" placeholder="POV character" value="${esc(c.pov)}" data-ch="${i}" data-field="pov" style="margin-top:8px"><div class="verdicts">${["keep","salvage","cut","unsure"].map(v=>`<button type="button" class="ver ${v} ${c.verdict===v?"on":""}" data-ch="${i}" data-v="${v}">${v}</button>`).join("")}</div></div>`).join("");
  root.querySelectorAll("input").forEach(inp=>inp.addEventListener("input",()=>{state.chapters[+inp.dataset.ch][inp.dataset.field]=inp.value;persist();}));
  root.querySelectorAll(".ver").forEach(btn=>btn.addEventListener("click",()=>{state.chapters[+btn.dataset.ch].verdict=btn.dataset.v;buildChapters();persist();}));
}
function buildStops(){
  const root=$("#stopReasons");
  root.innerHTML=STOP_REASONS.map(r=>{const on=state.stops.includes(r);return `<label class="chip ${on?"on":""}"><input type="checkbox" ${on?"checked":""} data-r="${esc(r)}">${r}</label>`;}).join("");
  root.querySelectorAll("input").forEach(inp=>inp.addEventListener("change",()=>{const r=inp.dataset.r;if(inp.checked&&!state.stops.includes(r))state.stops.push(r);if(!inp.checked)state.stops=state.stops.filter(x=>x!==r);inp.parentElement.classList.toggle("on",inp.checked);persist();}));
}
function promise(){return `This is a ${val("p1")||"______"} about ${val("p2")||"______"} who are forced to ${val("p3")||"______"} while hiding ${val("p4")||"______"}, leading to ${val("p5")||"______"}.`;}
function phase1Ready(){return!!(val("genreLock")||val("genre"))&&val("tropes")&&val("hook")&&val("stakes")&&val("core")&&val("p1")&&val("p2")&&val("p3")&&val("p4")&&val("p5");}
function diagnosis(){
  const bits=[];const changed=val("changed"),inc=val("inciting"),sit=val("beatSit"),still=val("stillWant");
  if(!changed&&!sit)return"Answer Stations 2 and 7. Diagnosis needs evidence, not vibes.";
  if(/different room|nothing|not sure|same/i.test(changed)||changed.length<12)bits.push("Chapter 6 does not yet contain irreversible change. You likely have openings, not an Act 1.");
  else bits.push("You can name a change by chapter 6. That change is the spine the outline has to honor or replace.");
  if(inc.includes("has not")||inc.includes("cannot point"))bits.push("The inciting incident is missing or unlocatable. Do not outline forward until you can point at the page where the old life becomes impossible.");
  if(sit.includes("ordinary world"))bits.push("Structurally you are still in the ordinary world. The six chapters want compression, not continuation.");
  if(sit.includes("six versions"))bits.push("You do not have six chapters. You have six auditions for chapter 1. Pick one opening.");
  if(sit.includes("Midpoint"))bits.push("If midpoint already happened, the stuck feeling is normal: you arrived in the second half with no engine. Reverse-outline, then rebuild Act 2 on purpose.");
  if(state.stops.includes("I kept rewriting chapter 1 instead of going forward"))bits.push("Stop polishing chapter 1. The planner will decide what chapter 1 even is after Phase 1 is locked.");
  if(still.includes("not sure"))bits.push("Permission granted to want a different book. Salvage the three keepers. Loyalty to a dead draft is not craft.");
  if(!bits.length)bits.push("Enough raw material to enter Phase 1. Do not draft. Lock the promise, then let the planner tell you which pages earn their keep.");
  return bits.join(" ");
}
function packet(){
  const ch=state.chapters.map(c=>`- Ch ${c.n}${c.pov?" · POV "+c.pov:""}${c.verdict?" · "+c.verdict.toUpperCase():""}: ${c.summary||"(blank)"}`).join("\n");
  const stops=state.stops.length?state.stops.map(s=>"- "+s).join("\n"):"- (none checked)";
  return `# REVERSE PLANNER PACKET\nAuthor: ${val("author")||"(not named)"}\nPen: ${val("pen")||"unassigned"}\nWorking title: ${val("title")||"Untitled"}\nDate: ${new Date().toLocaleDateString()}\n\n## Honest sentence\n${val("honestSentence")||"(not answered)"}\n\n## First contact\n- Genre / subgenre: ${val("genre")||"—"}\n- Heat: ${val("heat")||"—"}\n- Shape: ${val("shape")||"—"}\n- Target length: ${val("length")||"—"}\n- Reader: ${val("reader")||"—"}\n- How long sitting: ${val("age")||"—"}\n- Still this book?: ${val("stillWant")||"—"}\n\n## Draft excavation\n- Protagonist on p.1: ${val("protag")||"—"}\n- Want on p.1: ${val("want")||"—"}\n- Need: ${val("need")||"—"}\n- Love interest / second lead: ${val("li")||"—"}\n- Opposing force: ${val("oppose")||"—"}\n- Inciting incident: ${val("inciting")||"—"}\n- Irreversible change by Ch.6: ${val("changed")||"—"}\n- Scene with a pulse: ${val("pulse")||"—"}\n- Suspected stall scene: ${val("stall")||"—"}\n- Question being dodged: ${val("dodging")||"—"}\n\n## Chapter inventory\n${ch}\n\n## Why the book stopped\n${stops}\n\nWhat I hoped would happen: ${val("hoped")||"—"}\nOnly three keepers: ${val("keepThree")||"—"}\n\n## Phase 1 — Five core elements\n1. Genre lock: ${val("genreLock")||val("genre")||"—"}\n2. Tropes (3–5): ${val("tropes")||"—"}\n3. Hook: ${val("hook")||"—"}\n4. Stakes: ${val("stakes")||"—"}\n5. Emotional core: ${val("core")||"—"}\n\n## Story promise\n${promise()}\n\n## Character bones — Protagonist\n- Wound: ${val("fWound")||"—"}\n- Lie: ${val("fLie")||"—"}\n- Fear: ${val("fFear")||"—"}\n- Desire: ${val("fDesire")||"—"}\n- Need: ${val("fNeed")||"—"}\n- External goal: ${val("fGoal")||"—"}\n\n## Character bones — Second lead\n- Wound: ${val("mWound")||"—"}\n- Lie: ${val("mLie")||"—"}\n- Fear: ${val("mFear")||"—"}\n- Desire: ${val("mDesire")||"—"}\n- Need: ${val("mNeed")||"—"}\n- External goal: ${val("mGoal")||"—"}\n\nHow the wounds collide: ${val("collide")||"—"}\n\n## Structural call\nWhere Ch.6 sits: ${val("beatSit")||"—"}\nAuthor decision: ${val("decision")||"—"}\n\n## Editor diagnosis\n${diagnosis()}\n\n## Instruction to the planner\n${PROMPT}\nThe existing chapters are source material, not sacred text.\n`;
}
function persist(){localStorage.setItem("cphReversePlanner",JSON.stringify(state));render();}
function render(){
  const set=(id,text,empty)=>{const el=document.getElementById(id);if(!el)return;el.textContent=text||empty;el.classList.toggle("empty",!text);};
  set("sTitle",[val("title"),val("pen")].filter(Boolean).join(" · "),"Untitled");
  set("sGenre",[val("genreLock")||val("genre"),val("heat")].filter(Boolean).join(" · "),"Not locked");
  set("sProtag",val("protag"),"Unknown");
  set("sChange",val("changed"),"Not named");
  set("sPromise",(val("p1")||val("p2"))?promise():"","Waiting on Station 5");
  set("sDec",val("decision"),"Not yet");
  const box=$("#promiseBox");if(box)box.textContent=promise();
  const diag=$("#diagnosis");if(diag)diag.querySelector("p").textContent=diagnosis();
  const pack=$("#packet");if(pack)pack.textContent=packet();
  const warn=$("#phaseWarn");if(warn)warn.style.display=phase1Ready()?"none":"block";
  let n=0,t=KEYS.length+6;KEYS.forEach(k=>{if(val(k))n++;});state.chapters.forEach(c=>{if(c.summary)n++;});
  $("#bar").style.width=Math.round(n/t*100)+"%";
}
function download(){const blob=new Blob([packet()],{type:"text/markdown"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(val("title")||"untitled").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-reverse-planner-packet.md";a.click();}
async function copyText(text,btn,label){try{await navigator.clipboard.writeText(text);btn.textContent="Copied";setTimeout(()=>btn.textContent=label,1400);}catch(e){btn.textContent="Select and copy";}}
buildNav();bindFields();buildChapters();buildStops();render();
$("#prev").onclick=()=>go(step-1);
$("#next").onclick=()=>go(step===8?8:step+1);
$("#copyBtn").onclick=function(){copyText(packet(),this,"Copy packet");};
$("#copyPrompt").onclick=function(){copyText(PROMPT,this,"Copy planner prompt");};
$("#dlBtn").onclick=download;
$("#resetBtn").onclick=()=>{if(confirm("Erase every answer on this desk?")){localStorage.removeItem("cphReversePlanner");location.reload();}};
