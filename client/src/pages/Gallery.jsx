import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Gallery.module.css';
import CardMiniPreview from '../components/CardMiniPreview.jsx';

async function loadTemplates() {
  const manifest = await fetch('/templates/manifest.json').then(r => r.json());
  return Promise.all(
    manifest.map(id => fetch(`/templates/${id}.json`).then(r => r.json()))
  );
}

export default function Gallery() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates()
      .then(data => { setTemplates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoAccent}>Creative</span> Studio
        </div>
        <p className={styles.tagline}>Design your digital identity — card, landing page & contact in one click</p>
      </header>

      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Choose a Template</h2>
        {loading ? (
          <div className={styles.loading}>Loading templates…</div>
        ) : (
          <div className={styles.grid}>
            {templates.map(t => (
              <div
                key={t.id}
                className={styles.card}
                onClick={() => navigate(`/editor/${t.id}`)}
              >
                <div className={styles.cardPreview}>
                  <CardMiniPreview theme={t.theme} defaults={t.placeholders.defaults} />
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{t.name}</span>
                  <span className={styles.cardCategory}>{t.category}</span>
                </div>
                <div className={styles.cardTags}>
                  {(t.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
                <button className={styles.useBtn}>Use Template →</button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        Creative Studio · Digital Card Generator
      </footer>
    </div>
  );
}
