import { Link } from 'react-router-dom';
import useSeo from '../../lib/useSeo';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import Button from '../../components/ui/Button';

const NotFoundPage = () => {
  useSeo({
    title: 'Page Not Found (404) | TheTechCraft',
    description: 'The requested page could not be found.',
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-lg">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-24 text-center max-w-xl mx-auto">
        <span className="text-6xl font-bold text-primary font-heading mb-4">404</span>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3">Page Not Found</h1>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link to="/">
          <Button variant="primary">
            Return to Homepage
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage;
