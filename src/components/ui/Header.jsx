import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNews } from '../../services/api';
import profile from '../../assets/profile.jpg';
import logoProfile from '../../assets/logo.svg' 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('api_token'));

  useEffect(() => {
    getNews().then(news => {
      if (news && news.length > 0) {
        const latestNewsDate = new Date(news[0].created_at).getTime();
        const lastVisitDate = localStorage.getItem('last_news_visit_date');
        if (!lastVisitDate || latestNewsDate > new Date(lastVisitDate).getTime()) {
          setHasNewNews(true);
        }
      }
    }).catch(console.error);
  }, []);

  const navLinks = [
    { href: '/#projects', label: 'Work' },
    { href: '/#skills', label: 'Skills' },
    { href: '/#roadmap', label: 'Roadmap' },
    { href: '/news', label: 'News' },
    { href: '/#contact', label: 'Contact' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-background dark:bg-background border-b border-surface-variant">
      <div className="flex justify-between items-center px-gutter py-4 w-full">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-secondary/30 shadow-xs hover:border-secondary transition-colors">
            <img 
              alt="The Tech Craft" 
              className="w-full h-full object-cover" 
              src={logoProfile}
              width="56"
              height="56"
              loading="eager"
              decoding="async"
            />
          </Link>
          <Link to="/" className="hidden md:flex items-center gap-1.5 font-headline-sm tracking-tight group">
            <span className="bg-primary text-white text-[20px] font-bold px-2 py-0.5 rounded-md shadow-xs">The</span>
            <span className="text-secondary text-[26px] font-extrabold group-hover:opacity-90 transition-opacity">Tech</span>
            <span className="text-accent text-[26px] font-extrabold group-hover:opacity-90 transition-opacity">Craft</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map(link => {
            if (link.href.startsWith('/#')) {
              return (
                <a key={link.href} href={link.href} className="relative font-label-md text-text-light hover:text-primary transition-colors flex items-center">
                  {link.label}
                </a>
              );
            }
            return (
              <Link key={link.href} to={link.href} className="relative font-label-md text-text-light hover:text-primary transition-colors flex items-center">
                {link.label}
                {link.href === '/news' && hasNewNews && (
                  <span className="absolute -top-1.5 -right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <Link 
              to="/admin" 
              className="hidden md:block text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button 
            className="md:hidden text-primary p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-64 bg-surface-container shadow-2xl flex flex-col p-6 gap-6 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden transition-transform duration-300 ease-in-out`}>
        <div className="flex justify-between items-center border-b border-surface-variant/50 pb-4">
          <div className="flex items-center gap-1 font-headline-sm tracking-tight">
            <span className="bg-primary text-white text-[15px] font-bold px-1.5 py-0.5 rounded">The</span>
            <span className="text-secondary text-[18px] font-extrabold">Tech</span>
            <span className="text-accent text-[18px] font-extrabold">Craft</span>
          </div>
          <button 
            className="text-primary p-2 -mr-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-4 overflow-y-auto">
          {navLinks.map(link => {
            if (link.href.startsWith('/#')) {
              return (
                <a 
                  key={link.href} 
                  href={link.href} 
                  className="font-label-md text-on-surface hover:text-primary p-2 border-b border-surface-variant/50 flex items-center justify-between"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{link.label}</span>
                </a>
              );
            }
            return (
              <Link 
                key={link.href} 
                to={link.href} 
                className="font-label-md text-on-surface hover:text-primary p-2 border-b border-surface-variant/50 flex items-center justify-between"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{link.label}</span>
                {link.href === '/news' && hasNewNews && (
                  <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
          {isLoggedIn && (
            <Link 
              to="/admin" 
              className="font-label-md text-primary p-2 mt-2 font-bold border-t border-surface-variant/50 pt-3"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin Dashboard &rarr;
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
