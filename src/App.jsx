import { Routes, Route } from 'react-router-dom';
import AdminApp from './pages/admin/AdminApp';
import PortfolioApp from './pages/visitor/PortfolioApp';
import NewsPage from './pages/visitor/NewsPage';
import NotFoundPage from './pages/visitor/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Visitor Route */}
      <Route path="/" element={<PortfolioApp />} />
      <Route path="/news" element={<NewsPage />} />
      
      {/* Admin Route */}
      <Route path="/admin/*" element={<AdminApp />} />
      
      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
