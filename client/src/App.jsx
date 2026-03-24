import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Gallery from './pages/Gallery.jsx';
import Editor from './pages/Editor.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/editor/:templateId" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}
