import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Editor.module.css';
import CardCanvas from '../components/CardCanvas.jsx';
import LandingPreview from '../components/LandingPreview.jsx';
import PropertyPanel from '../components/PropertyPanel.jsx';
import ExportButton from '../components/ExportButton.jsx';
import StyleToolbar from '../components/StyleToolbar.jsx';

export default function Editor() {
  const { templateId } = useParams();
  const navigate = useNavigate();

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

  // ── Per-key theme overrides ──────────────────────────────────────────────
  const [themeOverrides, setThemeOverrides] = useState({});

  // ── Mobile sidebar open/close ────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Grid persistence ─────────────────────────────────────────────────────
  const [showGrid, setShowGrid] = useState(true);

  // ── Canvas refs ──────────────────────────────────────────────────────────
  const cardCanvasRef    = useRef(null);
  const landingCanvasRef = useRef(null);
  const previewAreaRef   = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Load template
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/templates/${templateId}.json`)
      .then(r => r.json())
      .then(data => {
        setTemplate(data);
        setValues(data.placeholders.defaults || {});
        setThemeOverrides({});
        setLayoutState({});
        setSelectedNodeId(null);
      });
  }, [templateId]);

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Theme overrides
  // ─────────────────────────────────────────────────────────────────────────
  const handleThemeOverride = useCallback((key, value) => {
    if (key === null) {
      setThemeOverrides({});
    } else {
      setThemeOverrides(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Layout change / node select
  // ─────────────────────────────────────────────────────────────────────────
  const handleLayoutChange = useCallback((id, newStyles) => {
    setLayoutState(prev => ({ ...prev, [id]: newStyles }));
  }, []);

  const handleNodeSelect = useCallback((id) => {
    setSelectedNodeId(id);
  }, []);

  const closeToolbar = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleCanvasPointerDown = useCallback((e) => {
    if (!e.target.closest('[data-node-id]')) closeToolbar();
  }, [closeToolbar]);

  // ─────────────────────────────────────────────────────────────────────────
  // Freeform toggle
  // ─────────────────────────────────────────────────────────────────────────
  const toggleFreeform = useCallback(() => {
    setIsFreeform(prev => {
      if (prev) { setLayoutState({}); setSelectedNodeId(null); setToolbarAnchor(null); }
      return !prev;
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Card dimensions
  // ─────────────────────────────────────────────────────────────────────────
  const PRESET_DIMS = {
    standard: { width: 1050, height: 600 },
    m90x50:   { width: 1063, height: 591 },
    uk:       { width: 1011, height: 636 },
    japan:    { width: 1075, height: 650 },
    credit:   { width: 1011, height: 637 },
    vertical: { width: 600,  height: 1050 },
    square:   { width: 800,  height: 800 },
  };

  const activeDims = cardFormat === 'custom'
    ? { width: Math.round(customDims.width * 11.81), height: Math.round(customDims.height * 11.81) }
    : (PRESET_DIMS[cardFormat] || PRESET_DIMS.standard);

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
          cardFormat={cardFormat}
          onFormatChange={setCardFormat}
          customDims={customDims}
          onCustomDimsChange={setCustomDims}
          isFreeform={isFreeform}
          onToggleFreeform={toggleFreeform}
          themeOverrides={themeOverrides}
          onThemeOverride={handleThemeOverride}
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
