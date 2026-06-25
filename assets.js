const categories = [
  { id: 'all', label: 'Todos', icon: 'bx-grid-alt', color: '#3478f6' },
  { id: 'animations', label: 'Animacoes', icon: 'bx-play-circle', color: '#8b5cf6' },
  { id: 'buttons', label: 'Botoes', icon: 'bx-toggle-left', color: '#22c55e' },
  { id: 'cards', label: 'Cards', icon: 'bx-card', color: '#f59e0b' },
  { id: 'loaders', label: 'Loaders', icon: 'bx-loader-circle', color: '#06b6d4' },
  { id: 'backgrounds', label: 'Backgrounds', icon: 'bx-landscape', color: '#ec4899' },
  { id: 'menus', label: 'Menus', icon: 'bx-menu', color: '#ef4444' },
  { id: 'forms', label: 'Inputs', icon: 'bx-text', color: '#14b8a6' },
  { id: 'text', label: 'Text Effects', icon: 'bx-font', color: '#eab308' },
  { id: 'layouts', label: 'Layouts', icon: 'bx-layout', color: '#60a5fa' }
];

const snippets = [
  {
    title: 'Magnetic CTA', category: 'buttons', level: 'Intermediario',
    desc: 'Botao com brilho e resposta magnetica ao cursor.',
    tags: ['cta', 'hover', 'js'],
    html: `<button class="magnetic-btn"><span>Comecar agora</span></button>`,
    css: `.magnetic-btn{position:relative;overflow:hidden;border:0;border-radius:14px;padding:16px 28px;background:#111827;color:white;font:700 15px Inter,sans-serif;box-shadow:0 18px 45px rgba(17,24,39,.28);transition:transform .18s ease}
.magnetic-btn::before{content:"";position:absolute;inset:-80px;background:radial-gradient(circle at var(--x,50%) var(--y,50%),rgba(59,130,246,.55),transparent 34%);opacity:0;transition:opacity .2s}
.magnetic-btn:hover::before{opacity:1}.magnetic-btn span{position:relative}`,
    js: `document.querySelector('.magnetic-btn').addEventListener('mousemove',e=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--x',e.clientX-r.left+'px');e.currentTarget.style.setProperty('--y',e.clientY-r.top+'px');});`
  },
  {
    title: 'Liquid Button', category: 'buttons', level: 'Basico',
    desc: 'Botao com onda liquida animada para telas modernas.',
    tags: ['button', 'css', 'motion'],
    html: `<button class="liquid-btn">Enviar proposta</button>`,
    css: `.liquid-btn{position:relative;isolation:isolate;overflow:hidden;border:0;border-radius:999px;padding:15px 28px;background:#2563eb;color:#fff;font:800 14px Inter,sans-serif}
.liquid-btn::before{content:"";position:absolute;z-index:-1;left:-20%;top:55%;width:140%;height:180%;background:#0ea5e9;border-radius:40%;animation:wave 5s linear infinite}
@keyframes wave{to{transform:rotate(360deg)}}`,
    js: ''
  },
  {
    title: 'Neon Border Button', category: 'buttons', level: 'Basico',
    desc: 'Borda neon animada sem dependencias.',
    tags: ['neon', 'css'],
    html: `<button class="neon-btn">Publicar</button>`,
    css: `.neon-btn{position:relative;border:1px solid transparent;border-radius:12px;padding:14px 24px;background:linear-gradient(#090b12,#090b12) padding-box,linear-gradient(90deg,#22c55e,#06b6d4,#8b5cf6,#22c55e) border-box;background-size:100%,300%;color:#fff;font:800 14px Inter,sans-serif;animation:borderShift 3s linear infinite}
@keyframes borderShift{to{background-position:0,300%}}`,
    js: ''
  },
  {
    title: 'Icon Micro Button Set', category: 'buttons', level: 'Basico',
    desc: 'Conjunto de botoes compactos para toolbars.',
    tags: ['toolbar', 'icons'],
    html: `<div class="micro-tools"><button>&larr;</button><button>B</button><button>I</button><button>&rarr;</button></div>`,
    css: `.micro-tools{display:flex;gap:6px}.micro-tools button{width:38px;height:38px;border:1px solid #d6dbe8;border-radius:8px;background:#fff;color:#111827;font:800 14px Inter,sans-serif;box-shadow:0 8px 22px rgba(15,23,42,.08)}.micro-tools button:hover{background:#111827;color:#fff;border-color:#111827}`,
    js: ''
  },
  {
    title: 'Split Action Button', category: 'buttons', level: 'Intermediario',
    desc: 'Acao principal com menu secundario compacto.',
    tags: ['menu', 'action'],
    html: `<div class="split-action"><button>Salvar</button><button aria-label="Mais">v</button></div>`,
    css: `.split-action{display:inline-flex;border-radius:10px;overflow:hidden;box-shadow:0 14px 34px rgba(37,99,235,.22)}.split-action button{border:0;background:#2563eb;color:white;height:42px;padding:0 18px;font:800 13px Inter,sans-serif}.split-action button+button{border-left:1px solid rgba(255,255,255,.25);padding:0 12px}.split-action button:hover{background:#1d4ed8}`,
    js: ''
  },
  {
    title: 'Pulse Ring CTA', category: 'buttons', level: 'Basico',
    desc: 'Chamada de acao com anel pulsante.',
    tags: ['pulse', 'cta'],
    html: `<button class="pulse-cta">Agendar demo</button>`,
    css: `.pulse-cta{position:relative;border:0;border-radius:12px;background:#16a34a;color:#fff;padding:14px 24px;font:800 14px Inter,sans-serif}.pulse-cta::after{content:"";position:absolute;inset:-7px;border:2px solid rgba(22,163,74,.42);border-radius:16px;animation:pulseRing 1.5s infinite}@keyframes pulseRing{to{opacity:0;transform:scale(1.18)}}`,
    js: ''
  },
  {
    title: 'Reveal On Scroll', category: 'animations', level: 'Intermediario',
    desc: 'Entrada suave de elementos conforme aparecem na tela.',
    tags: ['scroll', 'observer'],
    html: `<section class="stack"><div class="reveal">Primeiro bloco</div><div class="reveal">Segundo bloco</div><div class="reveal">Terceiro bloco</div></section>`,
    css: `.stack{display:grid;gap:14px}.reveal{padding:24px;border-radius:14px;background:#111827;color:#fff;opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease}.reveal.show{opacity:1;transform:none}`,
    js: `const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('show',e.isIntersecting)),{threshold:.25});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));`
  },
  {
    title: 'Counter Up', category: 'animations', level: 'Intermediario',
    desc: 'Contador numerico animado para metricas.',
    tags: ['metric', 'number'],
    html: `<div class="counter-card"><strong data-counter="12840">0</strong><span>leads gerados</span></div>`,
    css: `.counter-card{display:grid;place-items:center;gap:6px;padding:34px;border-radius:18px;background:#0f172a;color:#fff}.counter-card strong{font-size:42px;letter-spacing:-1px}.counter-card span{color:#94a3b8;font:700 12px Inter,sans-serif;text-transform:uppercase}`,
    js: `document.querySelectorAll('[data-counter]').forEach(el=>{let end=+el.dataset.counter,step=end/80,n=0;const tick=()=>{n=Math.min(end,n+step);el.textContent=Math.floor(n).toLocaleString('pt-BR');if(n<end)requestAnimationFrame(tick)};tick();});`
  },
  {
    title: 'Parallax Tilt', category: 'animations', level: 'Intermediario',
    desc: 'Card inclina com o movimento do cursor.',
    tags: ['tilt', 'hover'],
    html: `<div class="tilt-card"><h3>Projeto premium</h3><p>Interacao sutil para cards importantes.</p></div>`,
    css: `.tilt-card{width:min(320px,100%);padding:30px;border-radius:18px;background:linear-gradient(135deg,#111827,#1e293b);color:white;box-shadow:0 28px 60px rgba(15,23,42,.35);transform-style:preserve-3d;transition:transform .18s ease}.tilt-card h3{font-size:24px;margin-bottom:8px}.tilt-card p{color:#cbd5e1}`,
    js: `const card=document.querySelector('.tilt-card');card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=\`rotateY(\${x*14}deg) rotateX(\${-y*14}deg)\`;});card.addEventListener('mouseleave',()=>card.style.transform='');`
  },
  {
    title: 'Typewriter Headline', category: 'text', level: 'Intermediario',
    desc: 'Texto digitado automaticamente com cursor.',
    tags: ['headline', 'typing'],
    html: `<h1 class="typewriter" data-words="Automatize|Venda mais|Escalone">Automatize</h1>`,
    css: `.typewriter{font:800 42px Inter,sans-serif;color:#111827}.typewriter::after{content:"";display:inline-block;width:3px;height:.8em;margin-left:5px;background:#2563eb;animation:blink .8s infinite}@keyframes blink{50%{opacity:0}}`,
    js: `const el=document.querySelector('.typewriter'),words=el.dataset.words.split('|');let w=0,i=0,del=false;setInterval(()=>{const word=words[w];i+=del?-1:1;el.firstChild.nodeValue=word.slice(0,i);if(i===word.length)del=true;if(i===0){del=false;w=(w+1)%words.length}},95);`
  },
  {
    title: 'Gradient Text Shine', category: 'text', level: 'Basico',
    desc: 'Headline com gradiente animado de brilho.',
    tags: ['gradient', 'headline'],
    html: `<h1 class="shine-text">Motion Code Assets</h1>`,
    css: `.shine-text{font:900 44px Inter,sans-serif;background:linear-gradient(90deg,#111827,#2563eb,#06b6d4,#111827);background-size:300%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shine 4s linear infinite}@keyframes shine{to{background-position:300%}}`,
    js: ''
  },
  {
    title: 'Scramble Text Hover', category: 'text', level: 'Avancado',
    desc: 'Texto embaralha letras ao passar o mouse.',
    tags: ['hover', 'letters'],
    html: `<button class="scramble" data-text="Explorar biblioteca">Explorar biblioteca</button>`,
    css: `.scramble{border:0;background:#111827;color:#fff;border-radius:12px;padding:16px 22px;font:800 15px Inter,sans-serif;min-width:210px}`,
    js: `const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';document.querySelector('.scramble').onmouseenter=e=>{let i=0,t=e.target.dataset.text;const id=setInterval(()=>{e.target.textContent=t.split('').map((c,idx)=>idx<i?c:letters[Math.floor(Math.random()*letters.length)]).join('');if(i>=t.length)clearInterval(id);i+=1/2},28)};`
  },
  {
    title: 'Glass Product Card', category: 'cards', level: 'Basico',
    desc: 'Card glassmorphism com acao e badge.',
    tags: ['glass', 'product'],
    html: `<article class="glass-card"><span>Novo</span><h3>Dashboard Pro</h3><p>Controle metricas, tarefas e operacao em um lugar.</p><button>Ver demo</button></article>`,
    css: `.glass-card{max-width:320px;padding:24px;border:1px solid rgba(255,255,255,.24);border-radius:18px;background:linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,.08));backdrop-filter:blur(16px);color:#fff;box-shadow:0 24px 70px rgba(15,23,42,.35)}body{background:linear-gradient(135deg,#0f172a,#2563eb)}.glass-card span{color:#a7f3d0;font:800 11px Inter}.glass-card h3{font-size:26px;margin:10px 0}.glass-card p{color:#dbeafe;line-height:1.5}.glass-card button{margin-top:18px;border:0;border-radius:10px;background:white;color:#111827;padding:11px 16px;font-weight:800}`,
    js: ''
  },
  {
    title: 'Pricing Card', category: 'cards', level: 'Basico',
    desc: 'Card de plano com lista de beneficios.',
    tags: ['pricing', 'saas'],
    html: `<article class="price-card"><h3>Starter</h3><div class="price">R$49<span>/mes</span></div><ul><li>10 projetos</li><li>Analytics basico</li><li>Suporte por email</li></ul><button>Assinar</button></article>`,
    css: `.price-card{width:300px;padding:24px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;color:#111827;box-shadow:0 20px 50px rgba(15,23,42,.1)}.price-card h3{font-size:18px}.price{font-size:38px;font-weight:900;margin:14px 0}.price span{font-size:13px;color:#64748b}.price-card ul{display:grid;gap:9px;margin:0 0 22px 18px;color:#475569}.price-card button{width:100%;height:42px;border:0;border-radius:10px;background:#2563eb;color:white;font-weight:800}`,
    js: ''
  },
  {
    title: 'Stat Stack Card', category: 'cards', level: 'Basico',
    desc: 'Card compacto para dashboard com delta.',
    tags: ['dashboard', 'metric'],
    html: `<div class="stat-card"><span>Receita</span><strong>R$ 42.8k</strong><em>+18% este mes</em></div>`,
    css: `.stat-card{width:260px;padding:22px;border-radius:16px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,.1)}.stat-card span{color:#94a3b8;font:800 11px Inter;text-transform:uppercase}.stat-card strong{display:block;font-size:34px;letter-spacing:-1px;margin:8px 0}.stat-card em{font-style:normal;color:#22c55e;font-weight:800}`,
    js: ''
  },
  {
    title: 'Expandable FAQ', category: 'cards', level: 'Intermediario',
    desc: 'Accordion de perguntas com altura animada.',
    tags: ['faq', 'accordion'],
    html: `<div class="faq"><button>Como funciona?<span>+</span></button><p>Voce copia o snippet e adapta ao seu projeto.</p></div>`,
    css: `.faq{width:min(420px,100%);border:1px solid #e5e7eb;border-radius:14px;background:#fff;overflow:hidden;color:#111827}.faq button{width:100%;display:flex;justify-content:space-between;align-items:center;border:0;background:#fff;padding:18px;font-weight:900}.faq p{max-height:0;overflow:hidden;padding:0 18px;color:#64748b;transition:max-height .25s ease,padding .25s ease}.faq.open p{max-height:90px;padding:0 18px 18px}.faq.open span{transform:rotate(45deg)}`,
    js: `document.querySelector('.faq button').onclick=e=>e.currentTarget.parentElement.classList.toggle('open');`
  },
  {
    title: 'Skeleton Loader', category: 'loaders', level: 'Basico',
    desc: 'Placeholder shimmer para conteudo carregando.',
    tags: ['skeleton', 'loading'],
    html: `<div class="skeleton-card"><i></i><b></b><b></b><b></b></div>`,
    css: `.skeleton-card{width:310px;padding:18px;border-radius:16px;background:#fff;box-shadow:0 14px 40px rgba(15,23,42,.12)}.skeleton-card i,.skeleton-card b{display:block;border-radius:10px;background:linear-gradient(90deg,#eef2f7,#f8fafc,#eef2f7);background-size:220%;animation:shimmer 1.2s infinite}.skeleton-card i{width:58px;height:58px;margin-bottom:16px}.skeleton-card b{height:14px;margin:10px 0}.skeleton-card b:nth-child(4){width:65%}@keyframes shimmer{to{background-position:-220%}}`,
    js: ''
  },
  {
    title: 'Orbit Loader', category: 'loaders', level: 'Basico',
    desc: 'Loader orbital simples em CSS.',
    tags: ['loader', 'css'],
    html: `<div class="orbit-loader"><span></span><span></span><span></span></div>`,
    css: `.orbit-loader{position:relative;width:86px;height:86px;border-radius:50%;border:2px solid #dbeafe}.orbit-loader span{position:absolute;inset:8px;border-radius:50%;border:3px solid transparent;border-top-color:#2563eb;animation:spin 1s linear infinite}.orbit-loader span:nth-child(2){inset:18px;border-top-color:#06b6d4;animation-duration:1.4s}.orbit-loader span:nth-child(3){inset:28px;border-top-color:#22c55e;animation-duration:.8s}@keyframes spin{to{transform:rotate(360deg)}}`,
    js: ''
  },
  {
    title: 'Progress Loader', category: 'loaders', level: 'Intermediario',
    desc: 'Barra de progresso animada com percentual.',
    tags: ['progress', 'js'],
    html: `<div class="progress-loader"><span>0%</span><b><i></i></b></div>`,
    css: `.progress-loader{width:320px;color:#111827;font:800 13px Inter}.progress-loader b{display:block;height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-top:9px}.progress-loader i{display:block;height:100%;width:0;background:linear-gradient(90deg,#2563eb,#22c55e);border-radius:inherit;transition:width .12s}`,
    js: `let n=0;const label=document.querySelector('.progress-loader span'),bar=document.querySelector('.progress-loader i');const timer=setInterval(()=>{n+=2;label.textContent=n+'%';bar.style.width=n+'%';if(n>=100)clearInterval(timer)},45);`
  },
  {
    title: 'Dot Wave Loader', category: 'loaders', level: 'Basico',
    desc: 'Tres pontos com atraso sequencial.',
    tags: ['dots', 'loading'],
    html: `<div class="dot-wave"><span></span><span></span><span></span></div>`,
    css: `.dot-wave{display:flex;gap:8px}.dot-wave span{width:14px;height:14px;border-radius:50%;background:#2563eb;animation:bounce .8s infinite alternate}.dot-wave span:nth-child(2){animation-delay:.12s}.dot-wave span:nth-child(3){animation-delay:.24s}@keyframes bounce{to{transform:translateY(-14px);opacity:.45}}`,
    js: ''
  },
  {
    title: 'Mesh Gradient Background', category: 'backgrounds', level: 'Basico',
    desc: 'Fundo com manchas suaves animadas.',
    tags: ['mesh', 'gradient'],
    html: `<div class="mesh-bg"><h2>Hero com mesh gradient</h2></div>`,
    css: `.mesh-bg{min-height:260px;display:grid;place-items:center;overflow:hidden;border-radius:22px;color:white;background:radial-gradient(circle at 15% 20%,#2563eb,transparent 28%),radial-gradient(circle at 80% 15%,#ec4899,transparent 28%),radial-gradient(circle at 55% 82%,#22c55e,transparent 30%),#0f172a;animation:meshMove 8s ease-in-out infinite alternate}.mesh-bg h2{font:900 34px Inter,sans-serif}@keyframes meshMove{to{filter:hue-rotate(28deg);background-position:30px -20px,-20px 20px,20px 0,0 0}}`,
    js: ''
  },
  {
    title: 'Grid Glow Background', category: 'backgrounds', level: 'Basico',
    desc: 'Grade tecnica para dashboards e landing pages.',
    tags: ['grid', 'background'],
    html: `<div class="grid-bg"><h2>Operating system</h2></div>`,
    css: `.grid-bg{min-height:260px;display:grid;place-items:center;border-radius:20px;color:#fff;background:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),radial-gradient(circle at center,rgba(52,120,246,.34),transparent 45%),#07090f;background-size:28px 28px,28px 28px,100% 100%;}.grid-bg h2{font:900 34px Inter,sans-serif}`,
    js: ''
  },
  {
    title: 'Noise Texture Layer', category: 'backgrounds', level: 'Intermediario',
    desc: 'Textura leve usando pseudo-elemento.',
    tags: ['texture', 'hero'],
    html: `<section class="noise-layer"><h2>Campanha premium</h2></section>`,
    css: `.noise-layer{position:relative;min-height:260px;display:grid;place-items:center;overflow:hidden;border-radius:20px;color:white;background:linear-gradient(135deg,#111827,#312e81)}.noise-layer::after{content:"";position:absolute;inset:0;opacity:.18;background-image:linear-gradient(45deg,rgba(255,255,255,.08) 25%,transparent 25%),linear-gradient(-45deg,rgba(255,255,255,.08) 25%,transparent 25%);background-size:6px 6px}.noise-layer h2{position:relative;z-index:1;font:900 34px Inter}`,
    js: ''
  },
  {
    title: 'Animated Nav Pill', category: 'menus', level: 'Intermediario',
    desc: 'Menu com indicador que acompanha a aba ativa.',
    tags: ['nav', 'tabs'],
    html: `<nav class="pill-nav"><button class="active">Home</button><button>Projetos</button><button>Contato</button><i></i></nav>`,
    css: `.pill-nav{position:relative;display:flex;gap:4px;padding:4px;border:1px solid #e5e7eb;border-radius:999px;background:#fff}.pill-nav button{position:relative;z-index:1;border:0;background:transparent;border-radius:999px;padding:10px 16px;font:800 13px Inter;color:#475569}.pill-nav i{position:absolute;top:4px;left:4px;width:76px;height:38px;border-radius:999px;background:#111827;transition:.25s}.pill-nav button.active{color:white}`,
    js: `const nav=document.querySelector('.pill-nav'),mark=nav.querySelector('i');nav.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{nav.querySelector('.active').classList.remove('active');btn.classList.add('active');mark.style.left=btn.offsetLeft+'px';mark.style.width=btn.offsetWidth+'px';});`
  },
  {
    title: 'Slide Drawer Menu', category: 'menus', level: 'Intermediario',
    desc: 'Drawer lateral basico com overlay.',
    tags: ['drawer', 'mobile'],
    html: `<button class="drawer-open">Abrir menu</button><div class="drawer"><button>x</button><a>Dashboard</a><a>Projetos</a><a>Assets</a></div>`,
    css: `.drawer-open{border:0;border-radius:10px;background:#111827;color:#fff;padding:12px 18px;font-weight:800}.drawer{position:fixed;top:0;right:0;height:100%;width:260px;padding:22px;background:#fff;box-shadow:-20px 0 60px rgba(15,23,42,.18);transform:translateX(105%);transition:.25s;display:grid;align-content:start;gap:12px;z-index:5}.drawer.open{transform:none}.drawer button{justify-self:end;border:0;background:#f1f5f9;border-radius:8px;width:34px;height:34px}.drawer a{padding:12px;border-radius:9px;color:#111827;font-weight:800}.drawer a:hover{background:#f1f5f9}`,
    js: `const d=document.querySelector('.drawer');document.querySelector('.drawer-open').onclick=()=>d.classList.add('open');d.querySelector('button').onclick=()=>d.classList.remove('open');`
  },
  {
    title: 'Command Menu', category: 'menus', level: 'Avancado',
    desc: 'Paleta de comando compacta para atalhos.',
    tags: ['command', 'search'],
    html: `<button class="cmd-open">Abrir comandos</button><div class="cmd"><input placeholder="Buscar comando"><button>Novo projeto</button><button>Abrir assets</button><button>Exportar dados</button></div>`,
    css: `.cmd-open{border:0;border-radius:10px;background:#2563eb;color:white;padding:12px 18px;font-weight:800}.cmd{display:none;margin-top:12px;width:330px;padding:10px;border-radius:14px;background:#111827;box-shadow:0 22px 70px rgba(15,23,42,.35)}.cmd.open{display:grid;gap:8px}.cmd input{height:40px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:#0b1020;color:white;padding:0 12px}.cmd button{height:38px;text-align:left;border:0;border-radius:8px;background:transparent;color:#cbd5e1;padding:0 12px}.cmd button:hover{background:rgba(255,255,255,.08);color:white}`,
    js: `document.querySelector('.cmd-open').onclick=()=>document.querySelector('.cmd').classList.toggle('open');`
  },
  {
    title: 'Floating Label Input', category: 'forms', level: 'Basico',
    desc: 'Input com label flutuante acessivel.',
    tags: ['input', 'form'],
    html: `<label class="float-field"><input placeholder=" "><span>Email profissional</span></label>`,
    css: `.float-field{position:relative;display:block;width:320px}.float-field input{width:100%;height:52px;border:1px solid #cbd5e1;border-radius:12px;padding:18px 14px 6px;background:#fff;color:#111827;outline:0}.float-field span{position:absolute;left:14px;top:16px;color:#64748b;transition:.18s;pointer-events:none}.float-field input:focus{border-color:#2563eb}.float-field input:focus+span,.float-field input:not(:placeholder-shown)+span{top:7px;font-size:11px;color:#2563eb;font-weight:800}`,
    js: ''
  },
  {
    title: 'OTP Input', category: 'forms', level: 'Intermediario',
    desc: 'Campos de codigo com foco automatico.',
    tags: ['otp', 'auth'],
    html: `<div class="otp"><input maxlength="1"><input maxlength="1"><input maxlength="1"><input maxlength="1"></div>`,
    css: `.otp{display:flex;gap:10px}.otp input{width:52px;height:58px;text-align:center;border:1px solid #cbd5e1;border-radius:12px;font:900 22px Inter;color:#111827;outline:0}.otp input:focus{border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.12)}`,
    js: `document.querySelectorAll('.otp input').forEach((input,i,all)=>input.oninput=()=>{if(input.value&&all[i+1])all[i+1].focus()});`
  },
  {
    title: 'Range With Value', category: 'forms', level: 'Basico',
    desc: 'Slider mostrando valor em tempo real.',
    tags: ['range', 'slider'],
    html: `<label class="range-value">Orcamento <strong>50</strong><input type="range" min="0" max="100" value="50"></label>`,
    css: `.range-value{display:grid;gap:10px;width:320px;color:#111827;font-weight:800}.range-value strong{font-size:34px}.range-value input{accent-color:#2563eb}`,
    js: `const r=document.querySelector('.range-value input'),out=document.querySelector('.range-value strong');r.oninput=()=>out.textContent=r.value;`
  },
  {
    title: 'Toggle Switch', category: 'forms', level: 'Basico',
    desc: 'Switch binario para preferencias.',
    tags: ['toggle', 'settings'],
    html: `<label class="switch"><input type="checkbox" checked><span></span>Notificacoes</label>`,
    css: `.switch{display:flex;align-items:center;gap:12px;color:#111827;font:800 14px Inter}.switch input{display:none}.switch span{width:52px;height:30px;border-radius:999px;background:#cbd5e1;position:relative;transition:.2s}.switch span::after{content:"";position:absolute;top:4px;left:4px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.2s}.switch input:checked+span{background:#2563eb}.switch input:checked+span::after{left:26px}`,
    js: ''
  },
  {
    title: 'Bento Layout', category: 'layouts', level: 'Basico',
    desc: 'Grid bento responsivo para landing ou dashboard.',
    tags: ['grid', 'bento'],
    html: `<div class="bento"><article>Analytics</article><article>CRM</article><article>Automacoes</article><article>Financeiro</article></div>`,
    css: `.bento{display:grid;grid-template-columns:2fr 1fr;grid-auto-rows:120px;gap:12px;width:min(620px,100%)}.bento article{display:grid;place-items:center;border-radius:16px;background:#111827;color:#fff;font-weight:900}.bento article:first-child{grid-row:span 2;background:#2563eb}@media(max-width:620px){.bento{grid-template-columns:1fr}.bento article:first-child{grid-row:auto}}`,
    js: ''
  },
  {
    title: 'Sticky Table Header', category: 'layouts', level: 'Basico',
    desc: 'Tabela com cabecalho fixo para listas longas.',
    tags: ['table', 'dashboard'],
    html: `<div class="table-wrap"><table><thead><tr><th>Cliente</th><th>Status</th><th>Valor</th></tr></thead><tbody><tr><td>Alpha</td><td>Ativo</td><td>R$ 2.400</td></tr><tr><td>Beta</td><td>Lead</td><td>R$ 980</td></tr><tr><td>Gamma</td><td>Ativo</td><td>R$ 5.100</td></tr></tbody></table></div>`,
    css: `.table-wrap{max-height:190px;overflow:auto;border:1px solid #e5e7eb;border-radius:14px;background:#fff}.table-wrap table{width:100%;border-collapse:collapse;color:#111827}.table-wrap th{position:sticky;top:0;background:#f8fafc;text-align:left;font-size:12px;text-transform:uppercase;color:#64748b}.table-wrap th,.table-wrap td{padding:13px;border-bottom:1px solid #e5e7eb}`,
    js: ''
  },
  {
    title: 'Responsive App Shell', category: 'layouts', level: 'Intermediario',
    desc: 'Layout base com sidebar e area principal.',
    tags: ['shell', 'app'],
    html: `<div class="app-shell"><aside>Menu</aside><main><h3>Workspace</h3><p>Conteudo principal</p></main></div>`,
    css: `.app-shell{display:grid;grid-template-columns:170px 1fr;min-height:240px;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;background:#fff;color:#111827}.app-shell aside{background:#0f172a;color:white;padding:18px;font-weight:900}.app-shell main{padding:22px}.app-shell h3{font-size:24px;margin-bottom:8px}@media(max-width:560px){.app-shell{grid-template-columns:1fr}.app-shell aside{min-height:58px}}`,
    js: ''
  }
];

const generatedAssets = [
  ['Hover Lift Card','cards','Basico','Card com elevacao no hover','hover card','#2563eb'],
  ['Badge Row','cards','Basico','Linha de tags para status e filtros','badge tags','#22c55e'],
  ['Avatar Group','cards','Basico','Grupo de usuarios sobrepostos','avatar people','#8b5cf6'],
  ['Timeline Steps','layouts','Intermediario','Linha do tempo vertical para etapas','timeline steps','#f59e0b'],
  ['Notification Toast','animations','Intermediario','Toast que entra pela direita','toast ui','#ef4444'],
  ['Flip Card','animations','Intermediario','Card com verso ao passar o mouse','flip hover','#06b6d4'],
  ['Marquee Logos','animations','Basico','Faixa infinita de logos ou palavras','marquee logos','#ec4899'],
  ['Underline Menu','menus','Basico','Menu horizontal com sublinhado animado','nav underline','#2563eb'],
  ['Mega Menu Tile','menus','Intermediario','Card para menu expandido','mega menu','#22c55e'],
  ['Search Shortcut','forms','Basico','Input de busca com tecla visual','search input','#8b5cf6'],
  ['File Drop Zone','forms','Intermediario','Area visual para upload de arquivos','upload file','#f59e0b'],
  ['Gradient Divider','backgrounds','Basico','Separador luminoso para secoes','divider glow','#06b6d4'],
  ['Spotlight Section','backgrounds','Basico','Fundo com spotlight radial','spotlight hero','#ec4899'],
  ['Spinner Button','loaders','Basico','Botao em estado de carregamento','button loading','#2563eb'],
  ['Step Progress','loaders','Intermediario','Indicador de etapas numeradas','steps progress','#22c55e'],
  ['Kinetic Label','text','Basico','Etiqueta com pequeno movimento','label motion','#8b5cf6'],
  ['Outlined Heading','text','Basico','Titulo com contorno grande','heading outline','#111827'],
  ['Code Window','cards','Basico','Janela visual para blocos de codigo','code window','#0f172a']
  ,['Kanban Column','layouts','Intermediario','Coluna visual para tarefas e cards','kanban tasks','#2563eb']
  ,['Metric Ring','cards','Intermediario','Indicador circular para metas','metric ring','#22c55e']
  ,['Copy Snippet Box','cards','Basico','Caixa de codigo com acao de copiar','copy code','#8b5cf6']
  ,['Alert Banner','cards','Basico','Banner de aviso para dashboards','alert banner','#f59e0b']
  ,['Feature Checklist','cards','Basico','Lista de recursos com checks','checklist feature','#16a34a']
  ,['Social Proof Strip','layouts','Basico','Faixa de prova social compacta','social proof','#06b6d4']
  ,['Hero Badge','text','Basico','Badge pequeno para topo de hero','hero badge','#ec4899']
  ,['Animated Tabs','menus','Intermediario','Abas com destaque suave','tabs animated','#2563eb']
  ,['Breadcrumb Trail','menus','Basico','Caminho de navegacao para apps','breadcrumb nav','#475569']
  ,['Password Strength','forms','Intermediario','Indicador visual de senha','password strength','#ef4444']
  ,['Segmented Control','forms','Basico','Controle segmentado para modos','segmented control','#0ea5e9']
  ,['Color Swatches','forms','Basico','Selecao de cores com swatches','colors swatch','#8b5cf6']
  ,['Empty State','layouts','Basico','Estado vazio com chamada de acao','empty state','#64748b']
  ,['Timeline Roadmap','layouts','Intermediario','Roadmap horizontal para produto','roadmap timeline','#f59e0b']
  ,['Modal Shell','layouts','Basico','Base visual de modal central','modal dialog','#111827']
  ,['Confetti Burst','animations','Avancado','Explosao simples de pontos coloridos','confetti celebrate','#22c55e']
  ,['Mouse Spotlight','animations','Intermediario','Spotlight que segue o cursor','mouse spotlight','#2563eb']
  ,['Scroll Progress Bar','animations','Intermediario','Barra fixa de progresso de pagina','scroll progress','#06b6d4']
  ,['Radial Menu','menus','Avancado','Menu radial compacto para acoes','radial menu','#8b5cf6']
  ,['Tooltip Set','menus','Basico','Tooltips simples para icones','tooltip icons','#0f172a']
  ,['Gradient Loader Ring','loaders','Basico','Anel de carregamento com gradiente','loader ring','#ec4899']
  ,['Upload Progress','loaders','Intermediario','Progresso visual de upload','upload progress','#2563eb']
  ,['Animated Checkbox','forms','Basico','Checkbox com check animado','checkbox form','#22c55e']
  ,['Search Results List','layouts','Basico','Lista de resultados para busca','search results','#64748b']
].map(([title, category, level, desc, tags, color]) => buildGeneratedAsset(title, category, level, desc, tags, color));

function buildGeneratedAsset(title, category, level, desc, tags, color) {
  const tagList = tags.split(' ');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const base = { title, category, level, desc, tags: tagList, js: '' };
  const templates = {
    'Hover Lift Card': {
      html: `<article class="hover-lift"><span>Starter</span><h3>Growth dashboard</h3><p>Metricas, tarefas e receita em uma unica visao.</p></article>`,
      css: `.hover-lift{width:300px;padding:26px;border-radius:18px;background:#fff;color:#111827;box-shadow:0 24px 60px rgba(15,23,42,.14);transition:.22s}.hover-lift:hover{transform:translateY(-10px);box-shadow:0 34px 80px rgba(15,23,42,.2)}.hover-lift span{color:${color};font-weight:900}.hover-lift h3{font-size:25px;margin:10px 0}.hover-lift p{color:#64748b;line-height:1.5}`
    },
    'Badge Row': {
      html: `<div class="badge-row"><span>Ativo</span><span>Alta prioridade</span><span>Com JS</span></div>`,
      css: `.badge-row{display:flex;gap:10px;flex-wrap:wrap}.badge-row span{padding:9px 13px;border-radius:999px;background:#ecfdf5;color:#047857;border:1px solid #bbf7d0;font:900 12px Inter}`
    },
    'Avatar Group': {
      html: `<div class="avatars"><span>VF</span><span>JS</span><span>ML</span><b>+8</b></div>`,
      css: `.avatars{display:flex;align-items:center}.avatars span,.avatars b{width:54px;height:54px;margin-left:-10px;border:4px solid #fff;border-radius:50%;display:grid;place-items:center;background:${color};color:#fff;font:900 14px Inter}.avatars span:first-child{margin-left:0}.avatars b{background:#111827}`
    },
    'Timeline Steps': {
      html: `<ol class="timeline"><li><b>Ideia</b><span></span></li><li><b>MVP</b><span></span></li><li><b>Launch</b><span></span></li></ol>`,
      css: `.timeline{display:grid;gap:16px;list-style:none;color:#111827}.timeline li{display:grid;grid-template-columns:70px 180px;align-items:center;gap:12px}.timeline span{height:8px;border-radius:999px;background:linear-gradient(90deg,${color},#fde68a)}.timeline b{font-size:14px}`
    },
    'Notification Toast': {
      html: `<div class="notify"><i></i><div><b>Backup concluido</b><p>Seus snippets foram salvos.</p></div></div>`,
      css: `.notify{display:flex;gap:12px;align-items:center;width:320px;padding:16px;border-radius:14px;background:#111827;color:#fff;box-shadow:0 20px 60px rgba(15,23,42,.28);animation:toastIn .7s ease}.notify i{width:12px;height:42px;border-radius:999px;background:${color}}.notify p{color:#cbd5e1;margin-top:3px}@keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}`
    },
    'Flip Card': {
      html: `<div class="flip"><div><strong>Frente</strong></div><div><strong>Verso</strong></div></div>`,
      css: `.flip{width:240px;height:160px;position:relative;transform-style:preserve-3d;transition:.5s}.flip:hover{transform:rotateY(180deg)}.flip div{position:absolute;inset:0;display:grid;place-items:center;border-radius:18px;background:${color};color:white;backface-visibility:hidden;font:900 24px Inter}.flip div+div{background:#111827;transform:rotateY(180deg)}`
    },
    'Marquee Logos': {
      html: `<div class="marquee"><span>Motion</span><span>Cotai</span><span>Growth</span><span>Assets</span></div>`,
      css: `.marquee{width:360px;overflow:hidden;display:flex;gap:28px;padding:18px;border-radius:14px;background:#111827;color:#fff}.marquee span{font:900 22px Inter;animation:marq 4s linear infinite}@keyframes marq{to{transform:translateX(-160px)}}`
    },
    'Underline Menu': {
      html: `<nav class="under"><a class="on">Home</a><a>Projetos</a><a>Assets</a></nav>`,
      css: `.under{display:flex;gap:24px}.under a{position:relative;color:#111827;font:900 15px Inter}.under a::after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:3px;border-radius:9px;background:${color};transform:scaleX(0);transition:.2s}.under a.on::after,.under a:hover::after{transform:scaleX(1)}`
    },
    'Mega Menu Tile': {
      html: `<div class="mega"><b>Templates</b><p>Componentes prontos para dashboards.</p><span>12 itens</span></div>`,
      css: `.mega{width:280px;padding:20px;border-radius:16px;background:#fff;color:#111827;border:1px solid #e5e7eb;box-shadow:0 18px 48px rgba(15,23,42,.12)}.mega b{font-size:20px}.mega p{color:#64748b;margin:8px 0 16px}.mega span{color:${color};font-weight:900}`
    },
    'Search Shortcut': {
      html: `<label class="search-short"><i>⌕</i><input placeholder="Buscar assets"><kbd>Ctrl K</kbd></label>`,
      css: `.search-short{width:340px;height:54px;display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid #dbe3ef;border-radius:14px;background:#fff;color:#111827}.search-short input{flex:1;border:0;outline:0}.search-short kbd{padding:4px 7px;border-radius:6px;background:#f1f5f9;color:#64748b;font:800 11px Inter}`
    },
    'File Drop Zone': {
      html: `<div class="drop"><i>↑</i><b>Solte arquivos aqui</b><span>PNG, SVG ou ZIP</span></div>`,
      css: `.drop{width:330px;padding:34px;border:2px dashed #fbbf24;border-radius:18px;background:#fffbeb;color:#111827;text-align:center}.drop i{display:grid;place-items:center;width:54px;height:54px;margin:0 auto 12px;border-radius:50%;background:${color};color:#fff;font-style:normal;font-weight:900}.drop span{display:block;color:#92400e;margin-top:5px}`
    },
    'Gradient Divider': {
      html: `<div class="divider"><span></span></div>`,
      css: `.divider{width:360px;height:90px;display:grid;place-items:center;background:#0f172a;border-radius:16px}.divider span{width:82%;height:4px;border-radius:999px;background:linear-gradient(90deg,transparent,${color},#8b5cf6,transparent);box-shadow:0 0 28px ${color}}`
    },
    'Spotlight Section': {
      html: `<section class="spot"><h2>Launch faster</h2></section>`,
      css: `.spot{width:360px;height:210px;display:grid;place-items:center;border-radius:18px;color:white;background:radial-gradient(circle at 50% 45%,${color},transparent 38%),#0f172a}.spot h2{font:900 34px Inter}`
    },
    'Spinner Button': {
      html: `<button class="spin-btn"><i></i> Salvando</button>`,
      css: `.spin-btn{display:flex;align-items:center;gap:10px;border:0;border-radius:12px;background:${color};color:#fff;padding:14px 22px;font:900 15px Inter}.spin-btn i{width:17px;height:17px;border:3px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`
    },
    'Step Progress': {
      html: `<div class="steps"><span>1</span><i></i><span>2</span><i></i><span>3</span></div>`,
      css: `.steps{display:flex;align-items:center;gap:10px}.steps span{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:${color};color:#fff;font-weight:900}.steps i{width:70px;height:5px;border-radius:999px;background:#bbf7d0}`
    },
    'Kinetic Label': {
      html: `<span class="kinetic">Novo componente</span>`,
      css: `.kinetic{display:inline-flex;padding:12px 18px;border-radius:999px;background:${color};color:white;font:900 15px Inter;animation:float 1.5s ease-in-out infinite}@keyframes float{50%{transform:translateY(-8px) rotate(-2deg)}}`
    },
    'Outlined Heading': {
      html: `<h1 class="outline">ASSETS</h1>`,
      css: `.outline{font:900 64px Inter;color:transparent;-webkit-text-stroke:2px #111827;text-shadow:6px 6px 0 #e5e7eb;letter-spacing:2px}`
    },
    'Code Window': {
      html: `<div class="code-win"><span></span><span></span><span></span><pre>const asset = copy();</pre></div>`,
      css: `.code-win{width:340px;padding:16px;border-radius:16px;background:#0f172a;color:#93c5fd;box-shadow:0 22px 60px rgba(15,23,42,.24)}.code-win span{display:inline-block;width:11px;height:11px;border-radius:50%;background:#ef4444;margin-right:6px}.code-win span:nth-child(2){background:#f59e0b}.code-win span:nth-child(3){background:#22c55e}.code-win pre{margin-top:18px;font:14px Consolas}`
    },
    'Kanban Column': {
      html: `<div class="kanban-mini"><h3>Hoje</h3><p>Landing page</p><p>Revisar CSS</p><p>Publicar PR</p></div>`,
      css: `.kanban-mini{width:260px;padding:14px;border-radius:16px;background:#f8fafc;color:#111827;border:1px solid #e5e7eb}.kanban-mini h3{margin-bottom:12px}.kanban-mini p{padding:12px;margin:8px 0;border-radius:10px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.08)}`
    },
    'Metric Ring': {
      html: `<div class="metric-ring"><span>78%</span></div>`,
      css: `.metric-ring{width:150px;height:150px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(${color} 78%,#e5e7eb 0);position:relative}.metric-ring::before{content:"";position:absolute;inset:18px;border-radius:50%;background:white}.metric-ring span{position:relative;color:#111827;font:900 30px Inter}`
    },
    'Copy Snippet Box': {
      html: `<div class="copy-box"><code>&lt;button&gt;Copy&lt;/button&gt;</code><button>Copy</button></div>`,
      css: `.copy-box{display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;background:#111827;color:#c4b5fd}.copy-box code{font:13px Consolas}.copy-box button{border:0;border-radius:9px;background:${color};color:#fff;padding:10px 13px;font-weight:900}`
    },
    'Alert Banner': {
      html: `<div class="alert-banner"><i>!</i><div><b>Aviso importante</b><p>Confira os dados antes de publicar.</p></div><button>Revisar</button></div>`,
      css: `.alert-banner{width:380px;display:flex;align-items:center;gap:14px;padding:16px;border-radius:14px;background:#fff7ed;border:1px solid #fed7aa;color:#7c2d12;box-shadow:0 18px 48px rgba(124,45,18,.12)}.alert-banner i{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:${color};color:#fff;font-style:normal;font-weight:900}.alert-banner b{display:block;color:#431407}.alert-banner p{font-size:13px}.alert-banner button{margin-left:auto;border:0;border-radius:9px;background:#431407;color:white;padding:9px 12px;font-weight:900}`
    },
    'Feature Checklist': {
      html: `<ul class="features"><li>Preview real</li><li>Copiar codigo</li><li>Filtros funcionais</li></ul>`,
      css: `.features{list-style:none;display:grid;gap:10px;color:#111827}.features li{padding:12px 14px;border-radius:12px;background:#ecfdf5;border:1px solid #bbf7d0;font-weight:800}.features li::before{content:"✓";color:${color};margin-right:9px}`
    }
  };
  if (templates[title]) return { ...base, ...templates[title] };
  if (category === 'forms') return { ...base, html: `<label class="${slug}"><span>${title}</span><input placeholder="${desc}"></label>`, css: `.${slug}{width:330px;display:grid;gap:8px;color:#111827;font-weight:900}.${slug} input{height:48px;border:1px solid #cbd5e1;border-radius:12px;padding:0 14px;outline:0}.${slug} input:focus{border-color:${color};box-shadow:0 0 0 4px ${color}22}` };
  if (category === 'loaders') return { ...base, html: `<div class="${slug}"></div>`, css: `.${slug}{width:88px;height:88px;border-radius:50%;border:8px solid #e5e7eb;border-top-color:${color};animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}` };
  if (category === 'menus') return { ...base, html: `<nav class="${slug}"><button>Home</button><button class="on">Assets</button><button>Docs</button></nav>`, css: `.${slug}{display:flex;gap:8px;padding:6px;border-radius:14px;background:#111827}.${slug} button{border:0;border-radius:10px;background:transparent;color:#cbd5e1;padding:10px 14px;font-weight:900}.${slug} .on{background:${color};color:#fff}` };
  if (category === 'animations') return { ...base, html: `<div class="${slug}"><span></span><span></span><span></span></div>`, css: `.${slug}{display:flex;gap:12px}.${slug} span{width:54px;height:54px;border-radius:16px;background:${color};animation:bob 1s ease-in-out infinite}.${slug} span:nth-child(2){animation-delay:.12s}.${slug} span:nth-child(3){animation-delay:.24s}@keyframes bob{50%{transform:translateY(-18px);opacity:.6}}` };
  if (category === 'backgrounds') return { ...base, html: `<section class="${slug}"><h2>${title}</h2></section>`, css: `.${slug}{width:360px;height:220px;display:grid;place-items:center;border-radius:18px;color:#fff;background:radial-gradient(circle at 25% 20%,${color},transparent 35%),radial-gradient(circle at 80% 80%,#8b5cf6,transparent 35%),#0f172a}.${slug} h2{font:900 28px Inter}` };
  if (category === 'text') return { ...base, html: `<h1 class="${slug}">${title}</h1>`, css: `.${slug}{font:900 42px Inter;color:${color};text-shadow:0 12px 34px ${color}55}` };
  if (category === 'layouts') return { ...base, html: `<div class="${slug}"><aside></aside><main><b>${title}</b><span></span><span></span></main></div>`, css: `.${slug}{width:360px;height:220px;display:grid;grid-template-columns:90px 1fr;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 20px 54px rgba(15,23,42,.14)}.${slug} aside{background:${color}}.${slug} main{display:grid;align-content:center;gap:12px;padding:22px;color:#111827}.${slug} span{height:12px;border-radius:999px;background:#e5e7eb}` };
  return { ...base, html: `<article class="${slug}"><b>${title}</b><p>${desc}</p></article>`, css: `.${slug}{width:320px;padding:24px;border-radius:16px;background:#fff;color:#111827;border:1px solid #e5e7eb;box-shadow:0 18px 48px rgba(15,23,42,.12)}.${slug} b{font-size:22px}.${slug} p{margin-top:8px;color:#64748b}` };
}

const externalAssetFiles = [
  { slug: 'tv', title: 'TV Asset', category: 'cards', level: 'Intermediario', desc: 'Asset importado de assetslegais/tv.html e tv.css.', tags: ['assetslegais', 'tv'] },
  { slug: 'time', title: 'Time Asset', category: 'text', level: 'Intermediario', desc: 'Asset importado de assetslegais/time.html e time.css.', tags: ['assetslegais', 'time'] },
  { slug: 'transation', title: 'Transition Asset', category: 'animations', level: 'Avancado', desc: 'Asset importado de assetslegais/transation.html e transation.css.', tags: ['assetslegais', 'transition'] },
  { slug: 'hamster', title: 'Hamster Asset', category: 'loaders', level: 'Basico', desc: 'Asset importado de assetslegais/hamster.html e hamster.css.', tags: ['assetslegais', 'loader'] }
];

function emptyExternalPreview(title) {
  return `<div class="external-empty"><span>Assets Legais</span><h2>${title}</h2><p>Preencha o HTML e CSS na pasta assetslegais para ver o preview real aqui.</p></div>`;
}

const externalAssets = externalAssetFiles.map(file => ({
  title: file.title,
  category: file.category,
  level: file.level,
  desc: file.desc,
  tags: file.tags,
  defaultCollection: 'assets-legais',
  external: {
    htmlPath: `assetslegais/${file.slug}.html`,
    cssPath: `assetslegais/${file.slug}.css`
  },
  html: emptyExternalPreview(file.title),
  css: `.external-empty{width:min(360px,100%);padding:26px;border-radius:18px;background:#111827;color:white;box-shadow:0 22px 60px rgba(15,23,42,.24)}.external-empty span{color:#38bdf8;font:900 11px Inter;text-transform:uppercase}.external-empty h2{font-size:28px;margin:10px 0}.external-empty p{color:#cbd5e1;line-height:1.5}`,
  js: ''
}));

const assets = [...snippets, ...generatedAssets, ...externalAssets].map((asset, index) => ({
  id: `asset-${index + 1}`,
  ...asset
}));

const LIBRARY_STORE_KEY = 'motion_code_assets_library_v1';
const DEFAULT_COLLECTIONS = [
  { id: 'assets-legais', name: 'Assets Legais' },
  { id: 'landing', name: 'Landing Pages' },
  { id: 'dashboards', name: 'Dashboards' },
  { id: 'forms', name: 'Forms' },
  { id: 'animations', name: 'Animacoes' }
];

function readLibraryStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(LIBRARY_STORE_KEY) || '{}');
    const storedCollections = Array.isArray(stored.collections) && stored.collections.length ? stored.collections : [];
    const collections = [
      ...DEFAULT_COLLECTIONS,
      ...storedCollections.filter(collection => !DEFAULT_COLLECTIONS.some(defaultCollection => defaultCollection.id === collection.id))
    ];
    return {
      favorites: Array.isArray(stored.favorites) ? stored.favorites : [],
      notes: stored.notes && typeof stored.notes === 'object' ? stored.notes : {},
      assetCollections: stored.assetCollections && typeof stored.assetCollections === 'object' ? stored.assetCollections : {},
      collections
    };
  } catch (error) {
    return { favorites: [], notes: {}, assetCollections: {}, collections: DEFAULT_COLLECTIONS };
  }
}

let libraryStore = readLibraryStore();

function saveLibraryStore() {
  localStorage.setItem(LIBRARY_STORE_KEY, JSON.stringify(libraryStore));
}

const state = {
  category: 'all',
  query: '',
  level: 'all',
  codeFilter: 'all',
  collection: 'all',
  sort: 'title',
  activeId: assets[0].id,
  codeTab: 'html',
  view: 'grid'
};

const els = {
  categoryNav: document.getElementById('categoryNav'),
  assetGrid: document.getElementById('assetGrid'),
  resultCount: document.getElementById('resultCount'),
  search: document.getElementById('assetSearch'),
  level: document.getElementById('complexityFilter'),
  collection: document.getElementById('collectionFilter'),
  sort: document.getElementById('sortFilter'),
  codeFilters: document.querySelectorAll('[data-code-filter]'),
  newCollection: document.getElementById('newCollectionBtn'),
  navLibrary: document.getElementById('navLibraryBtn'),
  navActiveAsset: document.getElementById('navActiveAssetBtn'),
  topCopyAll: document.getElementById('topCopyAllBtn'),
  topOpenDetail: document.getElementById('topOpenDetailBtn'),
  stats: document.getElementById('libraryStats'),
  title: document.getElementById('libraryTitle'),
  summary: document.getElementById('librarySummary'),
  previewCategory: document.getElementById('previewCategory'),
  previewTitle: document.getElementById('previewTitle'),
  previewDesc: document.getElementById('previewDesc'),
  previewFrame: document.getElementById('previewFrame'),
  codeBlock: document.getElementById('codeBlock'),
  copyCode: document.getElementById('copyCodeBtn'),
  copyAll: document.getElementById('copyAllBtn'),
  detailBack: document.getElementById('detailBack'),
  favoriteAction: document.getElementById('favoriteAction'),
  collectionAction: document.getElementById('collectionAction'),
  notes: document.getElementById('assetNotes'),
  copyHtmlAction: document.getElementById('copyHtmlAction'),
  copyCssAction: document.getElementById('copyCssAction'),
  copyJsAction: document.getElementById('copyJsAction'),
  copyFullAction: document.getElementById('copyFullAction'),
  toast: document.getElementById('toast')
};

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getCategory(id) {
  return categories.find(category => category.id === id) || categories[0];
}

function filteredAssets() {
  const query = state.query.trim().toLowerCase();
  const levelOrder = { Basico: 1, Intermediario: 2, Avancado: 3 };
  return assets.filter(asset => {
    const matchesCategory = state.category === 'all' || asset.category === state.category;
    const matchesLevel = state.level === 'all' || asset.level === state.level;
    const hasJs = Boolean(asset.js.trim());
    const matchesCode = state.codeFilter === 'all'
      || (state.codeFilter === 'with-js' && hasJs)
      || (state.codeFilter === 'no-js' && !hasJs);
    const assetCollections = libraryStore.assetCollections[asset.id] || [];
    const matchesCollection = state.collection === 'all'
      || (state.collection === 'favorites' && libraryStore.favorites.includes(asset.id))
      || asset.defaultCollection === state.collection
      || assetCollections.includes(state.collection);
    const haystack = `${asset.title} ${asset.desc} ${asset.category} ${asset.tags.join(' ')}`.toLowerCase();
    return matchesCategory && matchesLevel && matchesCode && matchesCollection && (!query || haystack.includes(query));
  }).sort((a, b) => {
    if (state.sort === 'category') return getCategory(a.category).label.localeCompare(getCategory(b.category).label) || a.title.localeCompare(b.title);
    if (state.sort === 'level') return (levelOrder[a.level] || 9) - (levelOrder[b.level] || 9) || a.title.localeCompare(b.title);
    return a.title.localeCompare(b.title);
  });
}

function renderNav() {
  const counts = Object.fromEntries(categories.map(category => [category.id, 0]));
  counts.all = assets.length;
  assets.forEach(asset => counts[asset.category] = (counts[asset.category] || 0) + 1);
  els.categoryNav.innerHTML = categories.map(category => `
    <button class="${state.category === category.id ? 'active' : ''}" data-category="${category.id}">
      <span><i class='bx ${category.icon}'></i>${category.label}</span>
      <strong>${counts[category.id] || 0}</strong>
    </button>
  `).join('');
}

function renderCollections() {
  const options = [
    `<option value="all">Todas colecoes</option>`,
    `<option value="favorites">Favoritos</option>`,
    ...libraryStore.collections.map(collection => `<option value="${collection.id}">${collection.name}</option>`)
  ].join('');
  els.collection.innerHTML = options;
  els.collection.value = state.collection;

  const actionOptions = [
    `<option value="">Sem colecao</option>`,
    ...libraryStore.collections.map(collection => `<option value="${collection.id}">${collection.name}</option>`)
  ].join('');
  els.collectionAction.innerHTML = actionOptions;
}

function renderStats(list) {
  const activeCategory = getCategory(state.category);
  els.title.textContent = state.category === 'all' ? 'First page' : activeCategory.label;
  els.summary.textContent = state.category === 'all'
    ? 'Assets prontos para usar em HTML, CSS e JavaScript, com preview ao vivo e copia rapida.'
    : `Colecao filtrada de ${activeCategory.label.toLowerCase()} para reaproveitar em paginas, apps e dashboards.`;
  els.stats.innerHTML = [
    ['Assets', list.length],
    ['Categorias', categories.length - 1],
    ['Com JS', assets.filter(asset => asset.js.trim()).length]
  ].map(([label, value]) => `<div class="ca-stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
}

function renderGrid() {
  const list = filteredAssets();
  els.resultCount.textContent = `${list.length} asset${list.length === 1 ? '' : 's'}`;
  els.assetGrid.classList.toggle('compact', state.view === 'compact');
  if (!list.length) {
    els.assetGrid.innerHTML = `<div class="ca-empty"><i class='bx bx-search'></i>Nenhum asset encontrado.</div>`;
    renderStats(list);
    return;
  }
  if (!list.some(asset => asset.id === state.activeId)) state.activeId = list[0].id;
  els.assetGrid.innerHTML = list.map(asset => {
    const category = getCategory(asset.category);
    return `
      <article class="asset-card ${asset.id === state.activeId ? 'active' : ''}" data-id="${asset.id}" style="--asset-color:${category.color}">
        <div class="asset-card-top">
          ${libraryStore.favorites.includes(asset.id) ? `<span class="asset-fav"><i class='bx bxs-bookmark'></i></span>` : ''}
          <iframe class="asset-thumb-frame" title="Preview de ${escapeHtml(asset.title)}" data-preview-id="${asset.id}"></iframe>
          <div class="asset-card-info">
            <div class="asset-title">${asset.title}</div>
            <p class="asset-desc">${asset.desc}</p>
          </div>
        </div>
        <div class="asset-tags">${asset.tags.slice(0, 4).map(tag => `<span class="asset-tag">${tag}</span>`).join('')}</div>
        <div class="asset-footer">
          <span class="asset-level">${asset.title}</span>
          <button class="asset-open">${asset.level}</button>
        </div>
      </article>
    `;
  }).join('');
  els.assetGrid.querySelectorAll('.asset-thumb-frame').forEach(frame => {
    const asset = assets.find(item => item.id === frame.dataset.previewId);
    frame.srcdoc = previewDocument(asset, true);
  });
  renderStats(list);
  renderPreview();
}

function previewDocument(asset, thumbnail = false) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{width:100%;min-height:100%;margin:0}body{min-height:100vh;display:grid;place-items:center;padding:${thumbnail ? '18px' : '28px'};font-family:Inter,system-ui,sans-serif;background:#f7f8fb;overflow:hidden}
${thumbnail ? 'body>*{max-width:92%;max-height:86%;transform:scale(.86)}' : ''}
${asset.css}
</style>
</head>
<body>
${asset.html}
<script>${asset.js}<\/script>
</body>
</html>`;
}

function renderPreview() {
  const asset = assets.find(item => item.id === state.activeId) || assets[0];
  const category = getCategory(asset.category);
  const isFavorite = libraryStore.favorites.includes(asset.id);
  const assetCollections = libraryStore.assetCollections[asset.id] || [];
  els.previewCategory.textContent = category.label;
  els.previewTitle.textContent = asset.title;
  els.previewDesc.textContent = asset.desc;
  els.previewFrame.srcdoc = previewDocument(asset);
  els.favoriteAction.classList.toggle('active', isFavorite);
  els.favoriteAction.innerHTML = `<i class='bx ${isFavorite ? 'bxs-bookmark' : 'bx-bookmark'}'></i> ${isFavorite ? 'Favoritado' : 'Favoritar'}`;
  els.collectionAction.value = assetCollections[0] || asset.defaultCollection || '';
  els.notes.value = libraryStore.notes[asset.id] || '';
  renderCode();
}

function openDetail(assetId) {
  state.activeId = assetId;
  document.querySelector('.ca-app').classList.add('detail-mode');
  els.navLibrary.classList.remove('active');
  els.navActiveAsset.classList.add('active');
  renderGrid();
  renderPreview();
  document.getElementById('previewPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeDetail() {
  document.querySelector('.ca-app').classList.remove('detail-mode');
  els.navActiveAsset.classList.remove('active');
  els.navLibrary.classList.add('active');
  document.querySelector('.ca-topnav').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCode() {
  const asset = assets.find(item => item.id === state.activeId) || assets[0];
  els.codeBlock.textContent = asset[state.codeTab] || '// Este asset nao precisa de JavaScript.';
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch (error) {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    toast(message);
  }
}

function currentAsset() {
  return assets.find(item => item.id === state.activeId) || assets[0];
}

function copyAssetPart(part) {
  const asset = currentAsset();
  const labels = { html: 'HTML copiado', css: 'CSS copiado', js: 'JS copiado' };
  copyText(asset[part] || '', labels[part] || 'Codigo copiado');
}

function copyCurrentAsset() {
  const asset = currentAsset();
  copyText(`<!-- HTML -->\n${asset.html}\n\n/* CSS */\n${asset.css}\n\n// JS\n${asset.js}`, 'Asset completo copiado');
}

function toggleFavorite() {
  const asset = currentAsset();
  const exists = libraryStore.favorites.includes(asset.id);
  libraryStore.favorites = exists
    ? libraryStore.favorites.filter(id => id !== asset.id)
    : [...libraryStore.favorites, asset.id];
  saveLibraryStore();
  renderGrid();
  renderPreview();
  toast(exists ? 'Removido dos favoritos' : 'Asset favoritado');
}

function setAssetCollection(collectionId) {
  const asset = currentAsset();
  if (collectionId) libraryStore.assetCollections[asset.id] = [collectionId];
  else delete libraryStore.assetCollections[asset.id];
  saveLibraryStore();
  renderGrid();
  renderPreview();
  toast(collectionId ? 'Asset adicionado a colecao' : 'Asset removido da colecao');
}

function saveAssetNotes() {
  const asset = currentAsset();
  const value = els.notes.value.trim();
  if (value) libraryStore.notes[asset.id] = value;
  else delete libraryStore.notes[asset.id];
  saveLibraryStore();
}

async function hydrateExternalAssets() {
  const external = assets.filter(asset => asset.external);
  if (!external.length) return;
  await Promise.all(external.map(async asset => {
    try {
      const [htmlRes, cssRes] = await Promise.all([
        fetch(asset.external.htmlPath),
        fetch(asset.external.cssPath)
      ]);
      const [html, css] = await Promise.all([htmlRes.text(), cssRes.text()]);
      if (html.trim()) asset.html = html.trim();
      if (css.trim()) asset.css = css.trim();
    } catch (error) {
      console.warn('Nao foi possivel carregar asset externo:', asset.title, error);
    }
  }));
  renderGrid();
  renderPreview();
}

function createCollection() {
  const name = prompt('Nome da nova colecao:')?.trim();
  if (!name) return;
  const id = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `colecao-${Date.now()}`;
  if (libraryStore.collections.some(collection => collection.id === id)) {
    toast('Ja existe uma colecao com esse nome');
    return;
  }
  libraryStore.collections.push({ id, name });
  saveLibraryStore();
  renderCollections();
  state.collection = id;
  els.collection.value = id;
  renderGrid();
  toast('Colecao criada');
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove('show'), 2200);
}

function bindEvents() {
  els.categoryNav.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    renderNav();
    renderGrid();
  });

  els.assetGrid.addEventListener('click', event => {
    const card = event.target.closest('[data-id]');
    if (!card) return;
    openDetail(card.dataset.id);
  });

  els.search.addEventListener('input', event => {
    state.query = event.target.value;
    renderGrid();
  });

  els.level.addEventListener('change', event => {
    state.level = event.target.value;
    renderGrid();
  });

  els.collection.addEventListener('change', event => {
    state.collection = event.target.value;
    renderGrid();
  });

  els.sort.addEventListener('change', event => {
    state.sort = event.target.value;
    renderGrid();
  });

  els.codeFilters.forEach(button => {
    button.addEventListener('click', () => {
      els.codeFilters.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      state.codeFilter = button.dataset.codeFilter;
      renderGrid();
    });
  });

  els.newCollection.addEventListener('click', createCollection);

  els.navLibrary.addEventListener('click', closeDetail);
  els.navActiveAsset.addEventListener('click', () => openDetail(state.activeId));
  els.topOpenDetail.addEventListener('click', () => openDetail(state.activeId));
  els.topCopyAll.addEventListener('click', copyCurrentAsset);

  document.querySelectorAll('.ca-view-tabs button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.ca-view-tabs button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      state.view = button.dataset.view;
      renderGrid();
    });
  });

  document.querySelectorAll('.ca-code-tabs [data-code]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.ca-code-tabs [data-code]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      state.codeTab = button.dataset.code;
      renderCode();
    });
  });

  els.copyCode.addEventListener('click', () => {
    const asset = currentAsset();
    copyText(asset[state.codeTab] || '', `${state.codeTab.toUpperCase()} copiado`);
  });

  els.copyAll.addEventListener('click', () => {
    copyCurrentAsset();
  });

  els.detailBack.addEventListener('click', closeDetail);
  els.favoriteAction.addEventListener('click', toggleFavorite);
  els.collectionAction.addEventListener('change', event => setAssetCollection(event.target.value));
  els.notes.addEventListener('input', saveAssetNotes);
  els.copyHtmlAction.addEventListener('click', () => copyAssetPart('html'));
  els.copyCssAction.addEventListener('click', () => copyAssetPart('css'));
  els.copyJsAction.addEventListener('click', () => copyAssetPart('js'));
  els.copyFullAction.addEventListener('click', copyCurrentAsset);
}

renderNav();
renderCollections();
renderGrid();
bindEvents();
hydrateExternalAssets();
