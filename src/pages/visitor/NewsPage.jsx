import { useState, useEffect } from 'react';
import { getNews } from '../../services/api';
import useSeo from '../../lib/useSeo';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import ChatWidget from '../../components/ui/ChatWidget';

const NewsPage = () => {
  useSeo({
    title: 'Latest Updates & Tech News | TheTechCraft - Victor Oduor',
    description: 'Explore the latest tech news, architecture updates, cybersecurity insights, and project announcements from Victor Oduor.',
    canonical: 'https://thetechcraft.co.ke/news',
    noindex: false,
    ogTitle: 'Latest Updates & Tech News | TheTechCraft',
    ogDescription: 'Explore the latest tech news, architecture updates, cybersecurity insights, and project announcements from Victor Oduor.',
    ogImage: 'https://thetechcraft.co.ke/V.png'
  });

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    getNews()
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoading(false));
    localStorage.setItem('last_news_visit_date', new Date().toISOString());
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [news, loading]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/20 selection:text-primary">
      <Header />
      
      <main className="w-full flex flex-col items-center px-gutter pt-[120px] pb-24 max-w-layout mx-auto">
        <section className="w-full">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 text-center reveal">
            Latest Updates & News
          </h1>
          <p className="text-center text-on-surface-variant max-w-2xl mx-auto mb-12 reveal">
            Stay up to date with the latest announcements, milestones, and technical blogs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto min-h-[300px]">
            {loading ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 w-full">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 rounded-full border-4 border-primary/10 animate-ping"></div>
                  <div className="w-10 h-10 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 animate-spin"></div>
                </div>
                <p className="mt-6 text-sm text-text-light font-semibold tracking-wider animate-pulse">
                  Fetching latest updates...
                </p>
              </div>
            ) : news.length === 0 ? (
              <p className="text-center w-full col-span-2">No news published yet.</p>
            ) : (
              news.map((n, index) => (
                <div
                  key={n.id}
                  className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-variant reveal flex flex-col h-full"
                  style={{ transitionDelay: `${(index % 2) * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm font-semibold text-text-light uppercase tracking-wider">
                      {new Date(n.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    {n.source && (
                      <a href={n.source_url || '#'} target="_blank" rel="noopener noreferrer" className="text-xs bg-secondary/15 text-secondary px-3 py-1 rounded-full font-bold uppercase tracking-wider hover:bg-secondary/25 transition-colors" title="View Source" onClick={e => !n.source_url && e.preventDefault()}>
                        Source: {n.source}
                      </a>
                    )}
                  </div>
                  <h3 className="font-headline-md text-primary mb-4">{n.title}</h3>
                  <p className="font-body-md text-on-surface-variant whitespace-pre-wrap flex-grow leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default NewsPage;
