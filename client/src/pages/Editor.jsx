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
  const [toolbarAnchor, setToolbarAnchor] = useState(null);   // { x, y } viewport px

  // ── Background colour override (card & landing) ──────────────────────────
  const [bgOverride, setBgOverride] = useState(null);

  // ── Per-key theme overrides from the Theme panel ─────────────────────────
  const [themeOverrides, setThemeOverrides] = useState({});

  // ── Canvas container refs (for getBoundingClientRect offset calc) ────────
  const cardCanvasRef = useRef(null);
  const landingCanvasRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────
  const handleLayoutChange = useCallback((id, newStyles) => {
    setLayoutState(prev => ({ ...prev, [id]: newStyles }));
  }, []);

  /** Called by DraggableNode when a node is clicked.
   *  `element` is the DOM node of the wrapper div. */
  const handleNodeSelect = useCallback((id, element) => {
    setSelectedNodeId(id);
    if (element) {
      const r = element.getBoundingClientRect();
      // Place toolbar above the element; StyleToolbar itself clamps to viewport
      setToolbarAnchor({ x: r.left, y: r.top });
    }
  }, []);

  const closeToolbar = useCallback(() => {
    setSelectedNodeId(null);
    setToolbarAnchor(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Load template JSON
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/templates/${templateId}.json`)
      .then(r => r.json())
      .then(data => {
        setTemplate(data);
        setValues(data.placeholders.defaults || {});
        setBgOverride(null);
        setThemeOverrides({});
        setLayoutState({});
        setSelectedNodeId(null);
      });
  }, [templateId]);

  /** Called from PropertyPanel Theme section — key=null means reset */
  const handleThemeOverride = useCallback((key, value) => {
    if (key === null) {
      setThemeOverrides({});
      setBgOverride(null);
    } else {
      setThemeOverrides(prev => ({ ...prev, [key]: value }));
      if (key === 'bg') setBgOverride(value);
    }
  }, []);

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Freeform toggle – reset layout when turning OFF so elements snap back
  // ─────────────────────────────────────────────────────────────────────────
  const toggleFreeform = useCallback(() => {
    setIsFreeform(prev => {
      if (prev) {
        // Turning off: clear stored positions so structured layout takes over
        setLayoutState({});
        setSelectedNodeId(null);
        setToolbarAnchor(null);
      }
      return !prev;
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Card dimensions
  // ─────────────────────────────────────────────────────────────────────────
  const presetDims = {
    standard: { width: 1050, height: 600 },
    m90x50:   { width: 1063, height: 591 },
    uk:       { width: 1011, height: 636 },
    japan:    { width: 1075, height: 650 },
    credit:   { width: 1011, height: 637 },
    vertical: { width: 600,  height: 1050 },
    square:   { width: 800,  height: 800 },
  };

  const getActiveDims = () => {
    if (cardFormat === 'custom') {
      return {
        width:  Math.round(customDims.width  * 11.81),
        height: Math.round(customDims.height * 11.81),
      };
    }
    return presetDims[cardFormat] || presetDims.standard;
  };
  const activeDims = getActiveDims();

  const formatLabels = {
    standard: '3.5" × 2" US Standard Card',
    uk:       '3.34" × 2.16" UK/EU Standard Card',
    japan:    '3.58" × 2.16" Japan Standard Card',
    credit:   '3.37" × 2.12" Credit Card Size',
    m90x50:   '90mm × 50mm Business Card Preview',
    vertical: '2" × 3.5" Vertical Card Preview',
    square:   '2.5" × 2.5" Square Card Preview',
    custom:   `Custom ${customDims.width}mm × ${customDims.height}mm Card`,
  };

  /** Deselect only when clicking empty canvas space, not on a DraggableNode */
  const handleCanvasPointerDown = useCallback((e) => {
    const nodeEl = e.target.closest('[data-node-id]');
    if (!nodeEl) {
      closeToolbar();
    }
  }, [closeToolbar]);

  if (!template) {
    return <div className={styles.loading}>Loading editor…</div>;
  }

  // Merge template theme with per-key overrides from the Theme panel
  const effectiveTheme = { ...template.theme, ...themeOverrides };

  // ─────────────────────────────────────────────────────────────────────────
  // Shared canvas ref for the active tab
  // ─────────────────────────────────────────────────────────────────────────
  const activeCanvasRef = activeTab === 'card' ? cardCanvasRef : landingCanvasRef;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}>← Templates</button>
        <div className={styles.headerCenter}>
          <span className={styles.logo}><span className={styles.logoAccent}>Creative</span> Studio</span>
          <span className={styles.templateName}>{template.name}</span>
        </div>
        <ExportButton values={values} template={{ ...template, theme: effectiveTheme }} activeDims={activeDims} />
      </header>

      {/* ── Floating Style Toolbar ────────────────────────────────────────── */}
      <StyleToolbar
        anchor={toolbarAnchor}
        nodeId={selectedNodeId}
        nodeStyles={layoutState[selectedNodeId] || {}}
        onStyleChange={handleLayoutChange}
        bgColor={effectiveTheme.bg}
        onBgChange={v => handleThemeOverride('bg', v)}
        onClose={closeToolbar}
      />

      <div className={styles.workspace}>
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
        />

        <main className={styles.canvas} onPointerDown={handleCanvasPointerDown}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'card' ? styles.tabActive : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('card'); }}
            >Business Card</button>
            <button
              className={`${styles.tab} ${activeTab === 'landing' ? styles.tabActive : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('landing'); }}
            >Landing Page</button>
          </div>

          <div className={styles.previewArea}>
            {activeTab === 'card' ? (
              <div className={styles.cardWrapper}>
                <div className={styles.cardSizeLabel}>{formatLabels[cardFormat]}</div>
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
                  />
                </div>
              </div>
            ) : (
              <div className={styles.mobileWrapper} style={{ flexDirection: 'column', gap: '24px' }}>
                <div className={styles.viewToggle}>
                  {['mobile', 'tablet', 'desktop'].map(v => (
                    <button
                      key={v}
                      className={`${styles.viewBtn} ${landingView === v ? styles.viewBtnActive : ''}`}
                      onClick={() => setLandingView(v)}
                    >
                      {v === 'mobile' ? '📱' : v === 'tablet' ? '💊' : '💻'} {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
