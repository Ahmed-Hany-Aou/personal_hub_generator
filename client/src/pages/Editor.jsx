import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './Editor.module.css';
import CardCanvas from '../components/CardCanvas.jsx';
import LandingPreview from '../components/LandingPreview.jsx';
import PropertyPanel from '../components/PropertyPanel.jsx';
import ExportButton from '../components/ExportButton.jsx';
import StyleToolbar from '../components/StyleToolbar.jsx';

// BMAD Sticky Theme Mapper: Maps specific templates to their visual "Moods" 
// so the layout becomes separate from the vibe immediately on entry.
const STYLE_PRESETS = {
  'template-neon-futurism': {
    id: 'neon',
    theme: { bg: '#060d14', cardBg: 'linear-gradient(135deg, #bc13fe 0%, #7e0fff 100%)', accent: '#00f3ff', textPrimary: '#ffffff', textSecondary: '#a5b4fc', glassBackground: 'rgba(6, 13, 20, 0.6)', glassBorder: 'rgba(0, 243, 255, 0.4)', glow: '0 0 15px rgba(0, 243, 255, 0.6)' }
  },
  'template-solaris-glass': {
    id: 'solaris',
    theme: { bg: '#0f172a', cardBg: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', accent: '#22d3ee', textPrimary: '#f8fafc', textSecondary: '#94a3b8', glassBackground: 'rgba(255, 255, 255, 0.05)', glassBorder: 'rgba(255, 255, 255, 0.1)', accentBar: true }
  }
};

const SOCIAL_KEYS = ['githubHandle','linkedinHandle','xHandle','instagramHandle','facebookHandle','youtubeHandle','snapchatHandle','threadsHandle'];

const PRESET_DIMS = {
  standard: { width: 1050, height: 600 },
  m90x50:   { width: 1063, height: 591 },
  uk:       { width: 1011, height: 636 },
  japan:    { width: 1075, height: 650 },
  credit:   { width: 1011, height: 637 },
  vertical: { width: 600,  height: 1050 },
  square:   { width: 800,  height: 800 },
};

export default function Editor() {
  const { templateId } = useParams();
  const [initialTemplateId] = useState(templateId); // Capture starting point
  const navigate = useNavigate();
  const location = useLocation();

  // ── Template & form state ────────────────────────────────────────────────
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState({});
  const [activeTab, setActiveTab] = useState('card');
  const [landingView, setLandingView] = useState('mobile');
  const [cardFormat, setCardFormat] = useState('standard');
  const [customDims, setCustomDims] = useState({ width: 90, height: 50 });

  // ── Freeform / drag engine state  ────────────────────────────────────────
  const [isFreeform, setIsFreeform] = useState(false);
  const [layoutState, setLayoutState] = useState({});

  // ── Style toolbar state ──────────────────────────────────────────────────
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [toolbarPos, setToolbarPos] = useState(null);

  // ── Per-key theme overrides ──────────────────────────────────────────────
  const [themeOverrides, setThemeOverrides] = useState({});
  const [selectedStyleId, setSelectedStyleId] = useState(null);
  const [isStyleLocked, setIsStyleLocked] = useState(false);

  // ── Mobile sidebar open/close ────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Grid persistence ─────────────────────────────────────────────────────
  const [showGrid, setShowGrid] = useState(true);

  // ── Interaction Guard state ─────────────────────────────────────────────
  const toggleQueue = useRef(Promise.resolve());
  const abortControllerRef = useRef(null);
  const [isToggling, setIsToggling] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  }, [installPrompt]);

  // ── Canvas refs ──────────────────────────────────────────────────────────
  const cardCanvasRef    = useRef(null);
  const landingCanvasRef = useRef(null);
  const previewAreaRef   = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Load template
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    let active = true;

    fetch(`/templates/${templateId}.json`, { signal: controller.signal })
      .then(async r => {
        if (!r.ok) throw new Error(`${r.status}: Template not found`);
        return r.json();
      })
      .then(data => {
        if (!active) return;
        setTemplate(data);
        
        if (!template || location.state?.resetStyle) {
          // BMAD Sticky Theme Mapper: Lock the initial vibe immediately on entry
          const lockedTheme = {
            bg: data.theme.bg,
            cardBg: data.theme.cardBg || data.theme.bg,
            accent: data.theme.accent,
            textPrimary: data.theme.textPrimary,
            textSecondary: data.theme.textSecondary,
            glassBackground: data.theme.glassBackground,
            glassBorder: data.theme.glassBorder,
            glow: data.theme.glow
          };
          
          Object.keys(lockedTheme).forEach(k => lockedTheme[k] === undefined && delete lockedTheme[k]);
          
          let presetId = null;
          if (data.id.includes('neon') || data.id.includes('vibrant')) presetId = 'neon';
          else if (data.id.includes('solaris')) presetId = 'solaris';
          else if (data.id.includes('midnight') || data.id.includes('noir') || data.id.includes('prism') || data.id.includes('gemini') || data.id.includes('minimal')) presetId = 'noir';
          else if (data.id.includes('emerald')) presetId = 'emerald';

          setThemeOverrides(lockedTheme);
          setSelectedStyleId(presetId);
          setIsStyleLocked(true);
          
          // CRITICAL: We changed this to just use prev instead of previous 'setValues(prev => ...)' 
          // wait, setValues takes a function if we need the previous state
          setValues(data.placeholders.defaults || {});
        } else {
          setValues(prevValues => ({ ...data.placeholders.defaults, ...prevValues }));
        }
        
        setLayoutState({});
        setSelectedNodeId(null);
      })
      .catch(err => {
        if (err.name === 'AbortError' || !active) return;
        console.warn("Template fetch failed, using fallback:", err);
        
        // Virtual template fallback based on ID
        const virtual = {
          id: templateId,
          name: templateId.replace('template-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          layout: templateId.includes('horizon') ? 'horizon' : 'minimal',
          theme: { bg: '#0a0a0a', cardBg: '#0a0a0a', accent: '#ffffff', textPrimary: '#ffffff', textSecondary: '#888888' },
          placeholders: { required: ['userName', 'userTitle'], optional: ['companyName', 'profileUrl'], defaults: { userName: 'Demo User', userTitle: 'Creative Director' } }
        };
        setTemplate(virtual);
      });

    return () => { active = false; controller.abort(); };
  }, [templateId, location.state?.resetStyle]);

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleFullTemplateSelect = useCallback((newTemplateId) => {
    // Force exit Freeform mode and clear custom positions when choosing a new template
    setIsFreeform(false);
    setLayoutState({});
    setSelectedNodeId(null);
    
    navigate(`/editor/${newTemplateId}`, { replace: true, state: { resetStyle: true } });
  }, [navigate]);

  const handleStructuralLayoutSwap = useCallback((newTemplateId) => {
    // Force exit Freeform mode and clear custom positions when swapping structure
    setIsFreeform(false);
    setLayoutState({});
    setSelectedNodeId(null);
    
    navigate(`/editor/${newTemplateId}`, { replace: true });
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────────────────
  // Theme overrides
  // ─────────────────────────────────────────────────────────────────────────
  const handleThemeOverride = useCallback((key, value, styleId = null) => {
    if (key === null) {
      setThemeOverrides({});
      setSelectedStyleId(null);
      setIsStyleLocked(false);
    } else {
      // If passing an object of styles or a specific color, we "Lock" the choice.
      if (typeof key === 'object') {
         setThemeOverrides(prev => ({ ...prev, ...key }));
         if (value) setSelectedStyleId(value); // styleId passed as 2nd arg here
         setIsStyleLocked(true);
      } else {
         setThemeOverrides(prev => ({ ...prev, [key]: value }));
         if (styleId) {
           setSelectedStyleId(styleId);
           setIsStyleLocked(true);
         } else if (key) {
           // Manual color picker also locks the style
           setIsStyleLocked(true);
         }
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Layout change / node select
  // ─────────────────────────────────────────────────────────────────────────
  const handleLayoutChange = useCallback((id, newStyles) => {
    setLayoutState(prev => ({ ...prev, [id]: newStyles }));
  }, []);

  // ── Specialized Section Resets ───────────────────────────────────────────
  const handleResetIdentity = useCallback(() => {
    setValues(prev => {
      const { required = [], optional = [] } = template.placeholders;
      const allKeys = [...required, ...optional];
      const identityKeys = allKeys.filter(k => !SOCIAL_KEYS.includes(k) && k !== 'userBio');
      const reset = {};
      identityKeys.forEach(k => reset[k] = template.placeholders.defaults[k] || '');
      return { ...prev, ...reset };
    });
  }, [template]);

  const handleResetSocial = useCallback(() => {
    setValues(prev => {
      const reset = {};
      SOCIAL_KEYS.forEach(k => reset[k] = '');
      return { ...prev, ...reset };
    });
  }, []);

  const handleResetBio = useCallback(() => {
    setValues(prev => ({ ...prev, userBio: '' }));
  }, []);

  const handleResetFormat = useCallback(() => {
    setCardFormat('standard');
    setIsFreeform(false);
    setLayoutState({});
  }, []);

  const handleResetToInitial = useCallback(() => {
    handleFullTemplateSelect(initialTemplateId);
  }, [handleFullTemplateSelect, initialTemplateId]);

  const handleNodeSelect = useCallback((id) => {
    setSelectedNodeId(id);
  }, []);

  const closeToolbar = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleCanvasPointerDown = useCallback((e) => {
    if (!e.target.closest('[data-node-id]')) closeToolbar();
  }, [closeToolbar]);

  // ── Seeding & Toggle ───────────────────────────────────────────────────
  const activeDims = cardFormat === 'custom'
    ? { width: Math.round(customDims.width * 11.81), height: Math.round(customDims.height * 11.81) }
    : (PRESET_DIMS[cardFormat] || PRESET_DIMS.standard);

  const seedPositionsFromLayout = useCallback(() => {
    const cardEl = document.getElementById('card-export-target');
    if (!cardEl) return {};

    const cardRect = cardEl.getBoundingClientRect();
    const newPositions = {};

    // ── Coordinate Normalization ───────────────────────────────────────────
    // cardRect.width is the SCALED width on screen.
    // activeDims.width is the REAL card width in pixels.
    const scale = cardRect.width / activeDims.width;

    // Universal Capture: find every single draggable node automatically
    cardEl.querySelectorAll('[data-node-id]').forEach(el => {
      const id = el.getAttribute('data-node-id');
      const r = el.getBoundingClientRect();
      
      // Store relative offsets in local card-space (UNSCALED)
      newPositions[id] = { 
        x: (r.left - cardRect.left) / scale, 
        y: (r.top - cardRect.top) / scale 
      };
    });

    return newPositions;
  }, [activeDims]);

  const toggleFreeform = useCallback(async () => {
    await toggleQueue.current;
    let resolve;
    const nextPromise = new Promise(r => resolve = r);
    toggleQueue.current = nextPromise;

    try {
      if (!isFreeform) {
        // CAPTURE NOW: while still in structured layout to get the perfect snapshot
        const initialPositions = seedPositionsFromLayout();
        setLayoutState(initialPositions);
        setIsFreeform(true);
      } else {
        // EXITING: reset
        setLayoutState({});
        setSelectedNodeId(null);
        setToolbarPos(null);
        setIsFreeform(false);
      }
    } finally {
      setTimeout(resolve, 50);
    }
  }, [isFreeform, seedPositionsFromLayout]);

  const FORMAT_LABELS = {
    standard: '3.5" × 2" US Standard',
    uk:       '3.34" × 2.16" UK / EU',
    japan:    '3.58" × 2.16" Japan',
    credit:   '3.37" × 2.12" Credit Card',
    m90x50:   '90 mm × 50 mm',
    vertical: '2" × 3.5" Vertical',
    square:   '2.5" × 2.5" Square',
    custom:   `Custom ${customDims.width} × ${customDims.height} mm`,
  };

  if (!template) {
    return (
      <div className={styles.loading}>
        <span style={{ color: 'var(--accent)', marginRight: 12, fontSize: '1.5rem' }}>⏳</span>
        Loading editor…
      </div>
    );
  }

  const effectiveTheme = { ...template.theme, ...themeOverrides };

  return (
    <div className={styles.layout}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}>
          <span>←</span> <span>Templates</span>
        </button>

        <div className={styles.headerCenter}>
          <span className={styles.logo}>
            <span className={styles.logoAccent}>Creative</span> Studio
          </span>
          <span className={styles.templateName}>{template.name}</span>
        </div>

        <ExportButton
          values={values}
          template={{ ...template, theme: effectiveTheme }}
          activeDims={activeDims}
        />
      </header>

      {/* ── Workspace ────────────────────────────────────────────────── */}
      <div className={styles.workspace}>

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
        )}

        {/* Property panel — always rendered; CSS handles mobile slide-in/out */}
        <PropertyPanel
          template={template}
          values={values}
          onChange={handleChange}
          onTemplateChange={handleStructuralLayoutSwap}
          onFullTemplateSelect={handleFullTemplateSelect}
          onResetToInitial={handleResetToInitial}
          onResetIdentity={handleResetIdentity}
          onResetSocial={handleResetSocial}
          onResetBio={handleResetBio}
          onResetFormat={handleResetFormat}
          onInstall={handleInstallClick}
          canInstall={!!installPrompt}
          cardFormat={cardFormat}
          onFormatChange={setCardFormat}
          customDims={customDims}
          onCustomDimsChange={setCustomDims}
          isFreeform={isFreeform}
          onToggleFreeform={toggleFreeform}
          themeOverrides={themeOverrides}
          onThemeOverride={handleThemeOverride}
          isStyleLocked={isStyleLocked}
          selectedStyleId={selectedStyleId}
          open={sidebarOpen}
          showGrid={showGrid}
          onToggleGrid={setShowGrid}
        />

        {/* ── Canvas ─────────────────────────────────────────────────── */}
        <main className={styles.canvas} onPointerDown={handleCanvasPointerDown}>
          {/* Tab switcher */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'card' ? styles.tabActive : ''}`}
              onClick={e => { e.stopPropagation(); setActiveTab('card'); }}
            >
              Business Card
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'landing' ? styles.tabActive : ''}`}
              onClick={e => { e.stopPropagation(); setActiveTab('landing'); }}
            >
              Landing Page
            </button>
          </div>

          {/* Preview — position:relative so toolbar positions absolute inside */}
          <div className={styles.previewArea} ref={previewAreaRef}>
            {/* ── Style Toolbar — docked inside canvas, no overlap with element ── */}
            <StyleToolbar
              nodeId={selectedNodeId}
              nodeStyles={layoutState[selectedNodeId] || {}}
              onStyleChange={handleLayoutChange}
              bgColor={effectiveTheme.bg}
              onBgChange={v => handleThemeOverride('bg', v)}
              onClose={closeToolbar}
              position={toolbarPos}
              onPositionChange={setToolbarPos}
            />

            {activeTab === 'card' ? (
              <div className={styles.cardWrapper}>
                <div className={styles.cardSizeLabel}>{FORMAT_LABELS[cardFormat]}</div>
                <div id="card-canvas">
                  <CardCanvas
                    theme={effectiveTheme}
                    values={values}
                    width={activeDims.width}
                    height={activeDims.height}
                    isFreeform={isFreeform}
                    layoutState={layoutState}
                    onLayoutChange={handleLayoutChange}
                    onSelectNode={handleNodeSelect}
                    canvasRef={cardCanvasRef}
                    showGrid={showGrid}
                    templateId={template.id}
                    layout={template.layout}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.mobileWrapper}>
                <div className={styles.viewToggle}>
                  {[
                    { v: 'mobile',  icon: '📱', label: 'Mobile' },
                    { v: 'tablet',  icon: '💊', label: 'Tablet' },
                    { v: 'desktop', icon: '💻', label: 'Desktop' },
                  ].map(({ v, icon, label }) => (
                    <button
                      key={v}
                      className={`${styles.viewBtn} ${landingView === v ? styles.viewBtnActive : ''}`}
                      onClick={() => setLandingView(v)}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>

                <div className={styles.deviceWrapper}>
                  <div className={
                    landingView === 'mobile'  ? styles.phoneMock  :
                    landingView === 'tablet'  ? styles.tabletMock :
                    styles.desktopMock
                  }>
                    <div className={styles.phoneMockInner} id="landing-canvas" ref={landingCanvasRef}>
                      <LandingPreview
                        theme={effectiveTheme}
                        values={values}
                        isFreeform={isFreeform}
                        layoutState={layoutState}
                        onLayoutChange={handleLayoutChange}
                        onSelectNode={handleNodeSelect}
                        canvasRef={landingCanvasRef}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Mobile FAB to open/close panel ─────────────────────────── */}
      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(o => !o)}
        title={sidebarOpen ? 'Close panel' : 'Edit properties'}
        aria-label="Toggle panel"
      >
        {sidebarOpen ? '✕' : '✏'}
      </button>
    </div>
  );
}
