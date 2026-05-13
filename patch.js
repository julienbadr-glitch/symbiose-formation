(function(){
var LEVELS=[
{n:'Recrue',m:0,i:'\u{1F6E1}\u{FE0F}'},{n:'Explorateur',m:200,i:'\u{2694}\u{FE0F}'},
{n:'Strat\u00e8ge',m:400,i:'\u{1F5E1}\u{FE0F}'},{n:'Expert',m:650,i:'\u{1F451}'},
{n:'Ma\u00eetre Symbiose',m:900,i:'\u{1F48E}'}
];
var BADGES=[
{id:'first-step',i:'\u{1F680}'},{id:'perfect-quiz',i:'\u{1F3AF}'},
{id:'mid-way',i:'\u{26A1}'},{id:'on-fire',i:'\u{1F525}'},
{id:'expert',i:'\u{1F48E}'},{id:'certified',i:'\u{1F393}'},
{id:'excellence',i:'\u{1F3C6}'},{id:'speedy',i:'\u{2B50}'}
];
function gs(){
try{return JSON.parse(localStorage.getItem('symbiose_state'))||{xp:0,completedSteps:[],unlockedBadges:[],comboStreak:0};}
catch(e){return{xp:0,completedSteps:[],unlockedBadges:[],comboStreak:0};}
}
function gl(xp){for(var i=LEVELS.length-1;i>=0;i--)if(xp>=LEVELS[i].m)return LEVELS[i];return LEVELS[0];}

function patchHeader(){
var h=document.getElementById('topHeader');
if(!h)return;
var s=gs(),lv=gl(s.xp),ci=LEVELS.findIndex(function(l){return l.n===lv.n;});
var pct=Math.round((s.completedSteps.length/8)*100);
var lb='';
LEVELS.forEach(function(l,i){
var active=i<=ci?'active':'';
var current=i===ci?'current':'';
lb+='<div class="plv-item '+active+' '+current+'"><span class="plv-icon">'+l.i+'</span><span class="plv-name">'+l.n+'</span></div>';
if(i<LEVELS.length-1)lb+='<div class="plv-conn '+(i<ci?'filled':'')+'"></div>';
});
var bb='';
BADGES.forEach(function(b){
var earned=s.unlockedBadges.indexOf(b.id)>=0;
bb+='<span class="ph-badge '+(earned?'earned':'locked')+'">'+b.i+'</span>';
});
var off=113.1-(pct/100)*113.1;
h.innerHTML='<div class="ph-left"><div class="ph-level-bar">'+lb+'</div></div>'
+'<div class="ph-right">'
+'<div class="ph-xp"><i class="fas fa-bolt"></i> '+s.xp+' XP</div>'
+'<div class="ph-badges-row">'+bb+'</div>'
+'<div class="ph-badge-count">'+s.unlockedBadges.length+'/8</div>'
+'<div class="header-progress-ring"><svg width="44" height="44" viewBox="0 0 44 44">'
+'<circle cx="22" cy="22" r="18" fill="none" stroke="rgba(37,99,235,.15)" stroke-width="3"/>'
+'<circle cx="22" cy="22" r="18" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-dasharray="113.1" stroke-dashoffset="'+off+'" transform="rotate(-90 22 22)"/>'
+'</svg><span class="header-ring-text">'+pct+'%</span></div>'
+'<div class="ph-user"><div class="ph-avatar">JB</div><div class="ph-uinfo"><span class="ph-uname">Julien Badr</span><span class="ph-ulevel">'+lv.n+'</span></div></div>'
+'</div>';
}

function patchSidebar(){
var s=gs();
document.querySelectorAll('.nav-item[data-view^="step-"]').forEach(function(item){
var v=item.getAttribute('data-view');
var id=parseInt(v.replace('step-',''));
var ch=item.querySelector('.nav-check');
if(ch)ch.style.display='none';
var ex=item.querySelector('.pdot');
if(ex)ex.remove();
var d=document.createElement('span');
d.className='pdot';
if(s.completedSteps.indexOf(id)>=0){d.classList.add('done');}
else if(s.quizAnswered&&s.quizAnswered[id]){d.classList.add('prog');}
item.appendChild(d);
});
}

function patchHome(){
var m=document.getElementById('mainContent');
if(!m)return;
if(!m.querySelector('.home-greeting'))return;
if(m.querySelector('.p-reprendre'))return;
var s=gs(),ns=1;
for(var i=1;i<=8;i++){if(s.completedSteps.indexOf(i)<0){ns=i;break;}}
if(s.completedSteps.length>=8)return;
var k=m.querySelector('.home-kpi-grid');
if(!k)return;
var b=document.createElement('div');
b.className='p-reprendre fade-in';
b.innerHTML='<div class="pr-inner"><div class="pr-left"><i class="fas fa-play-circle"></i> Reprendre la formation</div><div class="pr-right">Module '+ns+' <i class="fas fa-arrow-right"></i></div></div>';
b.style.cursor='pointer';
b.addEventListener('click',function(){
var nav=document.querySelector('.nav-item[data-view="step-'+ns+'"]');
if(nav)nav.click();
});
k.after(b);
}

function applyAll(){
try{patchHeader();}catch(e){console.error('patch header',e);}
try{patchSidebar();}catch(e){console.error('patch sidebar',e);}
try{patchHome();}catch(e){console.error('patch home',e);}
}

function init(){
applyAll();
var mc=document.getElementById('mainContent');
if(mc){
var obs=new MutationObserver(function(){setTimeout(applyAll,80);});
obs.observe(mc,{childList:true});
}
setInterval(function(){try{patchHeader();}catch(e){}},2000);
}

if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',function(){setTimeout(init,300);});
}else{setTimeout(init,300);}

document.addEventListener('click',function(e){
if(e.target.closest&&e.target.closest('.nav-item')){setTimeout(applyAll,200);}
});
})();
