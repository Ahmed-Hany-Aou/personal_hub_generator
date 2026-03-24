import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Editor.module.css';
import CardCanvas from '../components/CardCanvas.jsx';
import LandingPreview from '../components/LandingPreview.jsx';
import PropertyPanel from '../components/PropertyPanel.jsx';
import ExportButton from '../components/ExportButton.jsx';

export default function Editor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState({});
  const [activeTab, setActiveTab] = useState('card');

  useEffect(() => {
    fetch(`/templates/${templateId}.json`)
      .then(r => r.json())
      .then(data => {
        setTemplate(data);
        setValues(data.placeholders.defaults || {});
      });
  }, [templateId]);

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  if (!template) {
    return <div className={styles.loading}>Loading editor…</div>;
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}>← Templates</button>
        <div className={styles.headerCenter}>
          <span className={styles.logo}><span className={styles.logoAccent}>Creative</span> Studio</span>
          <span className={styles.templateName}>{template.name}</span>
        </div>
        <ExportButton values={values} template={template} />
      </header>

      <div className={styles.workspace}>
        <PropertyPanel template={template} values={values} onChange={handleChange} />

        <main className={styles.canvas}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'card' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('card')}
            >Business Card</button>
            <button
              className={`${styles.tab} ${activeTab === 'landing' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('landing')}
            >Landing Page</button>
          </div>

          <div className={styles.previewArea}>
            {activeTab === 'card' ? (
              <div className={styles.cardWrapper}>
                <div className={styles.cardSizeLabel}>3.5" × 2" Business Card Preview</div>
                <div id="card-canvas">
                  <CardCanvas theme={template.theme} values={values} />
                </div>
              </div>
            ) : (
              <div className={styles.mobileWrapper}>
                <div className={styles.phoneMock}>
                  <div className={styles.phoneMockInner} id="landing-canvas">
                    <LandingPreview theme={template.theme} values={values} />
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
