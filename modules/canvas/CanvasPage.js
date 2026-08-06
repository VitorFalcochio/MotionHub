import { EventBus } from './EventBus.js';
import { CanvasEngine } from './CanvasEngine.js';
import { NodeManager } from './NodeManager.js';
import { EdgeManager } from './EdgeManager.js';
import { LayoutEngine } from './LayoutEngine.js';
import { SelectionManager } from './SelectionManager.js';
import { HistoryManager } from './HistoryManager.js';
import { CommandManager } from './CommandManager.js';
import { ExportManager } from './ExportManager.js';
import { ImportManager } from './ImportManager.js';
import { ViewportManager } from './ViewportManager.js';
import { Toolbar } from './Toolbar.js';
import { MiniMap } from './MiniMap.js';
import { Inspector } from './Inspector.js';
import { CommandBar } from './CommandBar.js';
import { CanvasSettings } from './CanvasSettings.js';
import { PersistenceManager } from './PersistenceManager.js';

class CanvasWorkspace {
  constructor(root) {
    this.root = root;
    this.bus = new EventBus();
    this.meta = { title: 'Canvas sem título', type: 'blank' };
    this.build();
    this.initialize();
  }

  build() {
    this.root.innerHTML = `
      <div class="canvas-shell">
        <div class="canvas-stage-wrap grid-visible" id="canvasStageWrap">
          <div class="canvas-stage" id="motionCanvasStage"></div>
        </div>

        <header class="canvas-topbar">
          <div class="canvas-brand"><span><i class='bx bx-vector'></i></span><div><strong>Canvas</strong><small>Motion Hub</small></div></div>
          <input class="canvas-document-title" id="canvasDocumentTitle" value="Canvas sem título" aria-label="Título do Canvas">
          <div class="canvas-header-actions">
            <button type="button" data-command="undo" title="Desfazer" aria-label="Desfazer" disabled><i class='bx bx-undo'></i></button>
            <button type="button" data-command="redo" title="Refazer" aria-label="Refazer" disabled><i class='bx bx-redo'></i></button>
            <span></span>
            <button type="button" data-command="autoLayout" title="Organizar automaticamente" aria-label="Organizar automaticamente"><i class='bx bx-network-chart'></i></button>
            <button type="button" id="canvasSettingsBtn" title="Configurações do Canvas" aria-label="Configurações do Canvas"><i class='bx bx-cog'></i></button>
            <button type="button" id="canvasImportBtn" title="Importar" aria-label="Importar"><i class='bx bx-import'></i></button>
            <button type="button" id="canvasExportBtn" class="canvas-export-btn"><i class='bx bx-export'></i><span>Exportar</span></button>
          </div>
        </header>

        <div class="canvas-toolbar" id="canvasToolbar"></div>

        <aside class="canvas-inspector" id="canvasInspectorPanel">
          <div class="canvas-panel-head"><div><strong>Inspector</strong><small>Propriedades</small></div><button type="button" id="canvasInspectorClose" aria-label="Fechar Inspector"><i class='bx bx-x'></i></button></div>
          <div class="canvas-inspector-body" id="canvasInspector"></div>
        </aside>

        <div class="canvas-minimap" id="canvasMiniMap"></div>

        <div class="canvas-zoom-controls">
          <button type="button" data-zoom="-0.12" aria-label="Diminuir zoom"><i class='bx bx-minus'></i></button>
          <button type="button" id="canvasZoomValue" title="Ajustar conteúdo">100%</button>
          <button type="button" data-zoom="0.12" aria-label="Aumentar zoom"><i class='bx bx-plus'></i></button>
        </div>

        <div class="canvas-command-dock">
          <form class="canvas-command-bar" id="canvasCommandForm">
            <span><i class='bx bx-sparkles'></i></span>
            <textarea rows="1" placeholder="Peça ao Jarvis um mapa mental, fluxo, arquitetura, roadmap..."></textarea>
            <button type="submit" aria-label="Gerar no Canvas"><i class='bx bx-up-arrow-alt'></i></button>
          </form>
          <div class="canvas-command-meta"><span data-canvas-status>Jarvis pronto para estruturar suas ideias</span><kbd>Enter</kbd></div>
        </div>

        <div class="canvas-export-menu" id="canvasExportMenu">
          ${['png', 'svg', 'pdf', 'json', 'markdown'].map(format => `<button type="button" data-export="${format}"><i class='bx bx-file'></i><span>${format.toUpperCase()}</span></button>`).join('')}
        </div>
        <div class="canvas-settings-menu" id="canvasSettingsMenu">
          <label><span><i class='bx bx-grid'></i> Grid</span><input type="checkbox" data-setting="grid" checked></label>
          <label><span><i class='bx bx-magnet'></i> Snap</span><input type="checkbox" data-setting="snap" checked></label>
          <label><span><i class='bx bx-map'></i> Mini mapa</span><input type="checkbox" data-setting="minimap" checked></label>
        </div>
        <input id="canvasImportFile" type="file" accept="application/json,.json,.md,.txt,text/markdown,text/plain" hidden>
        <button class="canvas-mobile-inspector" id="canvasMobileInspector" type="button" aria-label="Abrir Inspector"><i class='bx bx-slider-alt'></i></button>
        <div class="canvas-notice" id="canvasNotice" role="status"></div>
      </div>`;
  }

  initialize() {
    new CanvasSettings(this.bus);
    new NodeManager(this.bus);
    new EdgeManager(this.bus);
    new LayoutEngine(this.bus);
    new HistoryManager(this.bus);
    new PersistenceManager(this.bus);
    new CommandManager(this.bus);
    this.engine = new CanvasEngine(this.bus, this.root.querySelector('#motionCanvasStage'));
    this.viewport = new ViewportManager(this.bus);
    new SelectionManager(this.bus, this.root);
    new ExportManager(this.bus);
    new ImportManager(this.bus);
    new Toolbar(this.bus, this.root.querySelector('#canvasToolbar'));
    new MiniMap(this.bus, this.root.querySelector('#canvasMiniMap'));
    new Inspector(this.bus, this.root.querySelector('#canvasInspector'));
    this.commandBar = new CommandBar(this.bus, this.root.querySelector('#canvasCommandForm'));
    this.registerDocument();
    this.bindUI();
    this.restore();
    window.motionCanvas = {
      getDocument: () => this.bus.request('document:get'),
      execute: command => this.bus.request('command:execute', command),
      applyContext: payload => this.applyJarvisContext(payload),
      fit: () => this.bus.emit('viewport:fit')
    };
  }

  registerDocument() {
    this.bus.handle('document:get', () => ({ ...this.meta, nodes: this.bus.request('nodes:list'), connections: this.bus.request('edges:list'), viewport: this.bus.request('viewport:state') }));
    this.bus.handle('document:restore', document => this.restoreDocument(document));
    this.bus.on('document:meta', meta => {
      this.meta = { ...this.meta, ...meta };
      this.root.querySelector('#canvasDocumentTitle').value = this.meta.title;
      this.bus.emit('document:changed');
    });
    this.bus.on('nodes:changed', ({ nodes }) => {
      this.root.dataset.hasDocument = String(nodes.length > 0);
      this.root.dataset.nodeCount = String(nodes.length);
    });
  }

  bindUI() {
    this.root.querySelector('#canvasDocumentTitle').addEventListener('change', event => {
      this.meta.title = event.target.value.trim() || 'Canvas sem título';
      this.bus.emit('document:changed');
    });
    this.root.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => this.bus.request('command:execute', { action: button.dataset.command, layout: this.meta.type, label: button.title })));
    this.root.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => this.bus.request('viewport:zoom', Number(button.dataset.zoom))));
    this.root.querySelector('#canvasZoomValue').addEventListener('click', () => this.bus.emit('viewport:fit'));
    this.bus.on('viewport:changed', viewport => { this.root.querySelector('#canvasZoomValue').textContent = `${Math.round(viewport.scale * 100)}%`; });
    this.root.querySelector('#canvasExportBtn').addEventListener('click', event => { event.stopPropagation(); this.toggleMenu('canvasExportMenu'); });
    this.root.querySelectorAll('[data-export]').forEach(button => button.addEventListener('click', async () => {
      await this.bus.request('export:document', button.dataset.export);
      this.closeMenus();
      this.notice(`${button.dataset.export.toUpperCase()} exportado`);
    }));
    const fileInput = this.root.querySelector('#canvasImportFile');
    this.root.querySelector('#canvasImportBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      if (fileInput.files[0]) await this.bus.request('import:file', fileInput.files[0]);
      fileInput.value = '';
    });
    this.root.querySelector('#canvasSettingsBtn').addEventListener('click', event => { event.stopPropagation(); this.toggleMenu('canvasSettingsMenu'); });
    this.root.querySelectorAll('[data-setting]').forEach(input => input.addEventListener('change', () => this.bus.request('settings:update', { [input.dataset.setting]: input.checked })));
    this.bus.on('settings:changed', settings => this.root.querySelector('#canvasStageWrap').classList.toggle('grid-visible', settings.grid));
    this.root.querySelector('#canvasInspectorClose').addEventListener('click', () => this.root.querySelector('#canvasInspectorPanel').classList.remove('open'));
    this.root.querySelector('#canvasMobileInspector').addEventListener('click', () => this.root.querySelector('#canvasInspectorPanel').classList.toggle('open'));
    this.bus.on('selection:changed', ({ ids }) => {
      this.root.classList.toggle('has-selection', ids.length > 0);
      if (ids.length && window.matchMedia('(min-width: 768px)').matches) this.root.querySelector('#canvasInspectorPanel').classList.add('open');
    });
    this.bus.on('canvas:notice', message => this.notice(message));
    this.bus.on('canvas:error', message => this.notice(message, true));
    document.addEventListener('click', event => { if (!event.target.closest('.canvas-export-menu,.canvas-settings-menu,#canvasExportBtn,#canvasSettingsBtn')) this.closeMenus(); });
  }

  restore() {
    const saved = this.bus.request('persistence:load');
    if (saved?.nodes?.length) this.restoreDocument(saved);
    else this.bus.request('command:execute', { action: 'generate', input: 'Planejamento de SaaS no Motion Hub', label: 'Criar Canvas inicial' });
    setTimeout(() => this.consumeJarvisContext(), 100);
  }

  restoreDocument(document) {
    this.meta = { title: document.title || 'Canvas sem título', type: document.type || 'custom' };
    this.root.querySelector('#canvasDocumentTitle').value = this.meta.title;
    this.bus.request('nodes:replace', document.nodes || []);
    this.bus.request('edges:replace', document.connections || []);
    setTimeout(() => this.bus.emit('viewport:fit'), 20);
  }

  consumeJarvisContext() {
    try {
      const raw = localStorage.getItem('motion_canvas_pending_context');
      if (!raw) return;
      localStorage.removeItem('motion_canvas_pending_context');
      const payload = JSON.parse(raw);
      this.applyJarvisContext(payload);
    } catch (error) { this.notice(error.message, true); }
  }

  applyJarvisContext(payload = {}) {
    const key = `${payload.incremental}:${payload.context}`;
    if (!payload.context || this.lastJarvisContext === key) return;
    this.lastJarvisContext = key;
    localStorage.removeItem('motion_canvas_pending_context');
    const input = payload.incremental ? `Adicione ${payload.context}` : payload.context;
    this.bus.request('command:execute', { action: 'generate', input, label: 'Gerar a partir do Jarvis' });
    this.notice('Contexto do Jarvis aplicado');
  }

  setActive(active) { this.bus.request('engine:activate', active); if (active) setTimeout(() => this.bus.emit('viewport:fit'), 40); }
  toggleMenu(id) { const target = this.root.querySelector(`#${id}`); const open = !target.classList.contains('open'); this.closeMenus(); target.classList.toggle('open', open); }
  closeMenus() { this.root.querySelectorAll('.canvas-export-menu,.canvas-settings-menu').forEach(menu => menu.classList.remove('open')); }
  notice(message, error = false) { const notice = this.root.querySelector('#canvasNotice'); notice.textContent = message; notice.classList.toggle('error', error); notice.classList.add('show'); clearTimeout(this.noticeTimer); this.noticeTimer = setTimeout(() => notice.classList.remove('show'), 2200); }
}

let workspace = null;
function openCanvas() {
  const root = document.getElementById('canvasRoot');
  if (!root) return;
  if (!workspace) workspace = new CanvasWorkspace(root);
  workspace.setActive(true);
  workspace.consumeJarvisContext();
}

window.addEventListener('motion:canvas-open', openCanvas);
window.addEventListener('motion:section-change', event => event.detail.section === 'canvas' ? openCanvas() : workspace?.setActive(false));
window.addEventListener('motion:canvas-context', event => { openCanvas(); workspace?.applyJarvisContext(event.detail); });
if (document.getElementById('section-canvas')?.classList.contains('active')) openCanvas();
