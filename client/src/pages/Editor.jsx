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
  const [values, setValues] = useState({});
  const [activeTab, setActiveTab] = useState('card');
  const [landingView, setLandingView] = useState('mobile');
  const [cardFormat, setCardFormat] = useState('standard');
  const [customDims, setCustomDims] = useState({ width: 90, height: 50 });

  // ── Workspace State Engine ───────────────────────────────────────────────
  const initialWorkspaceConfig = {
    template: null,
    isFreeform: false,
    layoutState: {},
    themeOverrides: {},
    selectedStyleId: null,
    isStyleLocked: false
  };

  const [configs, setConfigs] = useState({
    card: initialWorkspaceConfig,
    landing: initialWorkspaceConfig
  });

  const activeConfig = configs[activeTab] || initialWorkspaceConfig;

  const updateActiveTabConfig = useCallback((updater) => {
    setConfigs(prev => ({
      ...prev,
      [activeTab]: updater(prev[activeTab])
    }));
  }, [activeTab]);

  // ── Shared UI State ──────────────────────────────────────────────────────
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [toolbarPos, setToolbarPos] = useState(null);

  // ── Mobile sidebar open/close ────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Grid persistence ─────────────────────────────────────────────────────
  const [showGrid, setShowGrid] = useState(true);

  // ── Interaction Guard state ─────────────────────────────────────────────
  const toggleQueue = useRef(Promise.resolve());
  const abortControllerRef = useRef(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  );
  
  useEffect(() => {
    const promptHandler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const installHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', promptHandler);
    window.addEventListener('appinstalled', installHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
      window.removeEventListener('appinstalled', installHandler);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) {
      alert("Installation requires a secure connection (HTTPS) or localhost. Please ensure you are using a supported browser like Chrome or Edge.");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  }, [installPrompt]);

  // ── Canvas refs ──────────────────────────────────────────────────────────
  const cardCanvasRef    = useRef(null);
  const landingCanvasRef = useRef(null);
  const previewAreaRef   = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Load template
  // ─────────────────────────────────────────────────────────────────────────
  const fetchTemplateForTab = useCallback((tid, targetTab) => {
    fetch(`/templates/${tid}.json`)
      .then(async r => {
        if (!r.ok) throw new Error(`${r.status}: Template not found`);
        return r.json();
      })
      .then(data => {
        setConfigs(prev => {
          const tabConf = prev[targetTab];
          let overrides = tabConf.isStyleLocked ? tabConf.themeOverrides : {};
          return {
            ...prev,
            [targetTab]: {
               ...tabConf,
               template: data,
               themeOverrides: overrides,
               isFreeform: false,
               layoutState: {}
            }
          };
        });
        setValues(prev => ({ ...data.placeholders.defaults, ...prev }));
      })
      .catch(err => {
         console.warn("Template fetch failed for tab", targetTab, err);
         const virtual = {
           id: tid,
           name: tid.replace('template-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
           layout: tid.includes('horizon') ? 'horizon' : 'minimal',
           theme: { bg: '#0a0a0a', cardBg: '#0a0a0a', accent: '#ffffff', textPrimary: '#ffffff', textSecondary: '#888888' },
           placeholders: { required: ['userName', 'userTitle'], optional: ['companyName', 'profileUrl'], defaults: { userName: 'Demo User', userTitle: 'Creative Director' } }
         };
         setConfigs(prev => ({
            ...prev,
            [targetTab]: {
               ...prev[targetTab],
               template: virtual,
               themeOverrides: prev[targetTab].isStyleLocked ? prev[targetTab].themeOverrides : {},
               isFreeform: false,
               layoutState: {}
            }
         }));
      });
  }, []);

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
        else if (data.id.includes('midnight-gold') || data.id.includes('noir') || data.id.includes('prism') || data.id.includes('gemini') || data.id.includes('minimal')) presetId = 'noir';
        else if (data.id.includes('emerald')) presetId = 'emerald';
        else if (data.id.includes('midnight-tech')) presetId = 'midnight';
        else if (data.id.includes('sunset')) presetId = 'sunset';

        setConfigs({
          card: { template: data, isFreeform: false, layoutState: {}, themeOverrides: lockedTheme, selectedStyleId: presetId, isStyleLocked: true },
          landing: { template: data, isFreeform: false, layoutState: {}, themeOverrides: lockedTheme, selectedStyleId: presetId, isStyleLocked: true }
        });
        setValues(prev => ({ ...data.placeholders.defaults, ...prev }));
      })
      .catch(err => {
        if (err.name === 'AbortError' || !active) return;
        console.error("Critical template Hydration failed:", err);
      });

    return () => { active = false; controller.abort(); };
  }, [templateId, location.state?.resetStyle]);

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleFullTemplateSelect = useCallback((newTemplateId) => {
    setSelectedNodeId(null);
    navigate(`/editor/${newTemplateId}`, { replace: true, state: { resetStyle: true } });
  }, [navigate]);

  const handleStructuralLayoutSwap = useCallback((newTemplateId) => {
    setSelectedNodeId(null);
    fetchTemplateForTab(newTemplateId, activeTab);
  }, [activeTab, fetchTemplateForTab]);

  // ─────────────────────────────────────────────────────────────────────────
  // Theme overrides
  // ─────────────────────────────────────────────────────────────────────────
  const handleThemeOverride = useCallback((key, value, styleId = null) => {
    updateActiveTabConfig(tabConfig => {
      if (key === null) {
        return { ...tabConfig, themeOverrides: {}, selectedStyleId: null, isStyleLocked: false };
      }
      
      let newOverrides = { ...tabConfig.themeOverrides };
      let newStyleId = tabConfig.selectedStyleId;
      
      if (typeof key === 'object') {
        newOverrides = { ...newOverrides, ...key };
        if (value) newStyleId = value;
      } else {
        newOverrides[key] = value;
        if (styleId) newStyleId = styleId;
      }

      return {
        ...tabConfig,
        themeOverrides: newOverrides,
        selectedStyleId: newStyleId,
        isStyleLocked: true
      };
    });
  }, [updateActiveTabConfig]);

  // ─────────────────────────────────────────────────────────────────────────
  // Layout change / node select
  // ─────────────────────────────────────────────────────────────────────────
  const handleLayoutChange = useCallback((id, newStyles) => {
    updateActiveTabConfig(tabConfig => ({
      ...tabConfig,
      layoutState: { ...tabConfig.layoutState, [id]: newStyles }
    }));
  }, [updateActiveTabConfig]);

  // ── Specialized Section Resets ───────────────────────────────────────────
  const handleResetIdentity = useCallback(() => {
    const placeholders = activeConfig.template?.placeholders || {};
    setValues(prev => {
      const allKeys = [...(placeholders.required || []), ...(placeholders.optional || [])];
      const identityKeys = allKeys.filter(k => !SOCIAL_KEYS.includes(k) && k !== 'userBio');
      const reset = {};
      identityKeys.forEach(k => reset[k] = placeholders.defaults?.[k] || '');
      return { ...prev, ...reset };
    });
  }, [activeConfig.template]);

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
    updateActiveTabConfig(cfg => ({ ...cfg, isFreeform: false, layoutState: {} }));
  }, [updateActiveTabConfig]);

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
      updateActiveTabConfig(tabConfig => {
        if (!tabConfig.isFreeform) {
          // CAPTURE NOW: while still in structured layout to get the perfect snapshot
          const initialPositions = seedPositionsFromLayout();
          return { ...tabConfig, layoutState: initialPositions, isFreeform: true };
        } else {
          // EXITING: reset
          setSelectedNodeId(null);
          setToolbarPos(null);
          return { ...tabConfig, layoutState: {}, isFreeform: false };
        }
      });
    } finally {
      setTimeout(resolve, 50);
    }
  }, [seedPositionsFromLayout, updateActiveTabConfig]);

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

  if (!configs.card.template || !configs.landing.template) {
    return (
      <div className={styles.loading}>
        <span style={{ color: 'var(--accent)', marginRight: 12, fontSize: '1.5rem' }}>⏳</span>
        Loading editor…
      </div>
    );
  }

  const effectiveCardTheme = { ...configs.card.template.theme, ...configs.card.themeOverrides };
  const effectiveLandingTheme = { ...configs.landing.template.theme, ...configs.landing.themeOverrides };
  const effectiveActiveTheme = activeTab === 'card' ? effectiveCardTheme : effectiveLandingTheme;

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
          <span className={styles.templateName}>{activeConfig.template.name}</span>
        </div>

        <ExportButton
          values={values}
          activeDims={activeDims}
          cardTemplate={{ ...configs.card.template, theme: effectiveCardTheme }}
          landingTemplate={{ ...configs.landing.template, theme: effectiveLandingTheme }}
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
          template={activeConfig.template}
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
          isInstalled={isInstalled}
          cardFormat={cardFormat}
          onFormatChange={setCardFormat}
          customDims={customDims}
          onCustomDimsChange={setCustomDims}
          isFreeform={activeConfig.isFreeform}
          onToggleFreeform={toggleFreeform}
          themeOverrides={activeConfig.themeOverrides}
          onThemeOverride={handleThemeOverride}
          isStyleLocked={activeConfig.isStyleLocked}
          selectedStyleId={activeConfig.selectedStyleId}
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
              nodeStyles={activeConfig.layoutState[selectedNodeId] || {}}
              onStyleChange={handleLayoutChange}
              bgColor={effectiveActiveTheme.bg}
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
                    theme={effectiveCardTheme}
                    values={values}
                    width={activeDims.width}
                    height={activeDims.height}
                    isFreeform={configs.card.isFreeform}
                    layoutState={configs.card.layoutState}
                    onLayoutChange={handleLayoutChange}
                    onSelectNode={handleNodeSelect}
                    canvasRef={cardCanvasRef}
                    showGrid={showGrid}
                    templateId={configs.card.template.id}
                    layout={configs.card.template.layout}
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
                        theme={effectiveLandingTheme}
                        values={values}
                        isFreeform={configs.landing.isFreeform}
                        layoutState={configs.landing.layoutState}
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
