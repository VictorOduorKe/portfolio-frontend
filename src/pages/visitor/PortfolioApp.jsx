import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, getSkills, getRoadmaps, getNews, getTestimonials, getCsrfToken, submitContact, getImageUrl } from '../../services/api';
import useSeo from '../../lib/useSeo';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import ChatWidget from '../../components/ui/ChatWidget';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import profile from '../../assets/profile.jpg';

const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress * (2 - progress);
            setCount(easeProgress * value);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(value);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <span ref={counterRef}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
};

const RoadmapNode = ({ node, level = 0, isLast = false, prefix = '' }) => {
  const isRoot = level === 0;
  
  return (
    <div className="relative font-mono text-sm sm:text-base leading-relaxed">
      <div className="flex items-start">
        {!isRoot && (
          <div className="text-primary/50 whitespace-pre select-none">
            {prefix}{isLast ? '└── ' : '├── '}
          </div>
        )}
        <div className={`flex-1 ${isRoot ? 'mb-4 mt-2' : 'mb-2'}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${isRoot ? 'font-bold text-primary text-lg' : 'font-semibold text-primary/90'}`}>
              {node.title}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans uppercase tracking-wider ${
              node.status === 'completed' ? 'bg-green-100 text-green-700' :
              node.status === 'in-progress' ? 'bg-secondary/15 text-secondary font-semibold' :
              'bg-surface-variant text-text-light'
            }`}>
              {node.status}
            </span>
          </div>
          {node.description && (
            <p className="text-on-surface-variant font-sans text-sm mt-1 mb-2 ml-1 border-l-2 border-surface-variant/50 pl-3 py-0.5">
              {node.description}
            </p>
          )}
        </div>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child, index) => {
            const isChildLast = index === node.children.length - 1;
            const newPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');
            return (
              <RoadmapNode 
                key={child.id} 
                node={child} 
                level={level + 1} 
                isLast={isChildLast} 
                prefix={newPrefix}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const PortfolioApp = () => {
  useSeo({
    title: 'Victor Oduor | Full Stack Developer & Cybersecurity Specialist',
    description: 'Victor Oduor is a Full Stack Developer and Cybersecurity Specialist building resilient web platforms, secure PHP/React APIs, and M-PESA payment workflows in Kenya.',
    canonical: 'https://thetechcraft.co.ke/',
    noindex: false,
    ogTitle: 'Victor Oduor | Full Stack Developer & Cybersecurity Specialist',
    ogDescription: 'Building robust web systems, secure PHP APIs, and payment automation workflows with a human touch.',
    ogImage: 'https://thetechcraft.co.ke/V.png'
  });

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [news, setNews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contact Form States
  const [contactForm, setContactForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    message: ''
  });
  const [csrfToken, setCsrfToken] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'loading', 'success', 'error'
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getProjects().catch(err => { console.error(err); return []; }),
      getSkills().catch(err => { console.error(err); return []; }),
      getRoadmaps().catch(err => { console.error(err); return []; }),
      getNews().catch(err => { console.error(err); return []; }),
      getTestimonials().catch(err => { console.error(err); return []; }),
      getCsrfToken().catch(err => { console.error(err); return { csrf_token: '' }; })
    ]).then(([projectsData, skillsData, roadmapsData, newsData, testimonialsData, csrfData]) => {
      setProjects(projectsData);
      setSkills(skillsData);
      setRoadmaps(roadmapsData);
      setNews(newsData);
      setTestimonials(testimonialsData);
      setCsrfToken(csrfData.csrf_token);
    }).finally(() => {
      setLoading(false);
    });

    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const triggerToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setFormErrors({});

    const errors = {};
    if (!contactForm.first_name.trim()) errors.first_name = 'First name is required';
    if (!contactForm.last_name.trim()) errors.last_name = 'Last name is required';
    if (!contactForm.phone_number.trim()) errors.phone_number = 'Phone number is required';
    if (!contactForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      errors.email = 'Email address is invalid';
    }
    if (!contactForm.message.trim()) {
      errors.message = 'Message is required';
    } else if (contactForm.message.trim().length < 5) {
      errors.message = 'Message must be at least 5 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitStatus('error');
      triggerToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    try {
      const response = await submitContact({
        ...contactForm,
        csrf_token: csrfToken
      });
      setSubmitStatus('success');
      triggerToast(response.message || 'Your message has been sent successfully!', 'success');
      setContactForm({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        message: ''
      });
      getCsrfToken().then(data => setCsrfToken(data.csrf_token)).catch(console.error);
    } catch (err) {
      setSubmitStatus('error');
      if (err.errors) {
        setFormErrors(err.errors);
        triggerToast('Please correct the validation errors.', 'error');
      } else {
        const msg = err.message || 'An error occurred while sending your message. Please try again.';
        triggerToast(msg, 'error');
      }
    }
  };

  useEffect(() => {
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
  }, [projects, skills, roadmaps, news]);

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const getIconForCategory = (category) => {
    switch (category) {
      case 'Frontend Development':
        return 'desktop_windows';
      case 'Backend Development':
        return 'terminal';
      case 'Databases':
        return 'database';
      case 'Cybersecurity & Networking':
        return 'shield_lock';
      case 'AI & Automation':
        return 'smart_toy';
      case 'Payment Systems':
        return 'payments';
      case 'System Design & Architecture':
        return 'account_tree';
      case 'Software Projects Experience':
        return 'folder_special';
      case 'Tools & Workflow':
        return 'handyman';
      case 'Human-Computer Interaction (HCI)':
        return 'palette';
      default:
        return 'build';
    }
  };

  const defaultSkillMeta = {
    'PHP': { tags: ['Secure APIs', 'cPanel', 'MVC'], badge: '5+ projects' },
    'PHP (structured PHP)': { tags: ['Secure APIs', 'cPanel', 'MVC'], badge: '5+ projects' },
    'React': { tags: ['SPAs', 'State Hooks', 'Tailwind'], badge: '5+ projects' },
    'React Native': { tags: ['Mobile', 'Cross-platform', 'Expo'], badge: '3+ projects' },
    'Node.js': { tags: ['WebSockets', 'REST APIs', 'Scripts'], badge: '3+ projects' },
    'Express.js': { tags: ['Middleware', 'REST APIs', 'Auth'], badge: '3+ projects' },
    'MySQL': { tags: ['Indexing', 'Normalization', 'JSON'], badge: '4+ projects' },
    'M-PESA Daraja API integration': { tags: ['Daraja 2.0', 'STK Push', 'B2C'], badge: '5+ projects' },
    'STK Push implementation': { tags: ['Real-time', 'Callbacks', 'Validation'], badge: '4+ projects' },
    'HTML': { tags: ['SEO', 'Semantic elements', 'A11y'], badge: '5+ projects' },
    'CSS': { tags: ['Flexbox/Grid', 'Keyframes', 'Variables'], badge: '5+ projects' },
    'JavaScript': { tags: ['ES6+', 'Async/Await', 'DOM'], badge: '5+ projects' },
    'Cybersecurity fundamentals': { tags: ['OWASP Top 10', 'Encryption', 'Hashing'], badge: '4+ projects' },
    'Secure coding practices': { tags: ['Sanitization', 'XSS/SQLi prevention'], badge: '4+ projects' },
    'Git & GitHub version control': { tags: ['PRs', 'Actions CI/CD', 'Hooks'], badge: '5+ projects' },
    'Blade (Laravel templating)': { tags: ['Components', 'Layouts', 'Directives'], badge: '3+ projects' },
    'Expo': { tags: ['Mobile builds', 'OTA updates'], badge: '3+ projects' },
    'REST API development': { tags: ['JSON', 'Auth', 'Versioning'], badge: '5+ projects' },
    'Database design and relational schema modeling': { tags: ['ER diagrams', 'Keys', 'Joins'], badge: '4+ projects' },
    'Normalization and structured data modeling': { tags: ['3NF', 'Denormalization'], badge: '3+ projects' },
    'Network Security (Huawei-focused path)': { tags: ['Firewalls', 'VPN', 'ACLs'], badge: '3+ projects' },
    'AI student result prediction systems (PHP-based)': { tags: ['ML concepts', 'Data processing'], badge: '1 project' },
    'Workflow automation systems': { tags: ['Cron', 'Queues', 'Pipelines'], badge: '3+ projects' },
    'Payment automation workflows': { tags: ['M-PESA', 'Webhooks', 'Reconciliation'], badge: '4+ projects' },
    'RESTful API architecture': { tags: ['CRUD', 'Stateless', 'HTTP verbs'], badge: '5+ projects' },
    'MVC-style backend structuring': { tags: ['Controllers', 'Models', 'Routes'], badge: '4+ projects' },
  };

  const featuredProject = projects[0];
  const secondaryProjects = projects.slice(1, 4);
  const remainingProjects = projects.slice(4);

  const renderSkillCategoryGroup = (categoryName) => {
    const items = groupedSkills[categoryName] || [];
    if (items.length === 0) return null;
    return (
      <div key={categoryName} className="bg-surface-container-lowest rounded-xl border border-surface-variant p-8 md:p-10 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] space-y-6 hover:border-surface-variant/80 transition-colors reveal">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-base text-text-light">{getIconForCategory(categoryName)}</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-light">{categoryName}</h4>
        </div>
        <div className="space-y-6">
          {items.map((s) => {
            const fallback = defaultSkillMeta[s.name] || { tags: ['Production'], badge: '3+ projects' };
            const badge = s.experience_badge || fallback.badge;
            const tags = s.tags
              ? s.tags.split(',').map(t => t.trim()).filter(Boolean)
              : fallback.tags;
            return (
              <div key={s.id} className="border-t border-surface-variant/40 pt-5 first:border-0 first:pt-0 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-primary">{s.name}</span>
                  <span className="inline-block text-[10px] bg-accent/15 text-accent font-bold px-2.5 py-1 rounded">
                    {badge}
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {s.description || `${s.name} development and integration.`}
                </p>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-block text-[10px] font-semibold bg-surface-container-low text-text-light px-2.5 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const buildRoadmapTree = (items, parentId = null) => {
    return items
      .filter(item => (item.parent_id || null) === (parentId || null))
      .map(item => ({
        ...item,
        children: buildRoadmapTree(items, item.id)
      }));
  };

  const roadmapTree = buildRoadmapTree(roadmaps);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border-4 border-primary/10 animate-ping"></div>
          <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 animate-spin"></div>
        </div>
        <p className="mt-6 font-semibold text-lg text-primary tracking-wider animate-pulse">
          Crafting the experience...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg">
      <Header />

      <main className="flex-grow pt-24 pb-24 md:pb-8 flex flex-col items-center justify-center w-full max-w-container-max mx-auto px-4 md:px-gutter">
        {/* Hero Section */}
        <section className="w-full min-h-[calc(100vh-6rem)] flex flex-col md:flex-row items-center justify-center gap-stack-md md:gap-gutter py-12">
          <div className="flex-1 flex flex-col items-start gap-stack-md order-2 md:order-1">
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary max-w-2xl leading-tight reveal">
              Hi, I am Victor Oduor.<br />
              I solve complex problems with a human touch.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl reveal reveal-delay-1">
              As an IT professional, I believe technology should empower, not complicate. I build robust systems and clear processes so you can focus on what matters most.
            </p>
            <div className="flex flex-wrap gap-4 mt-4 reveal reveal-delay-2">
              <a href="#projects" className="btn-hero-primary">
                View My Work
              </a>
              <a href="#skills" className="btn-hero-secondary">
                Explore Skills
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md order-1 md:order-2 flex justify-center md:justify-end reveal reveal-delay-3">
            <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-surface-container-lowest shadow-[0px_10px_40px_rgba(0,0,0,0.1)] bg-surface-container">
              <img 
                alt="Victor Oduor - Full Stack Developer & Cybersecurity Specialist" 
                className="w-full h-full object-cover" 
                src={profile}
                width="384"
                height="384"
                loading="eager"
                decoding="async" 
              />
            </div>
          </div>
        </section>

        {/* Story Layer 1 */}
        <div className="w-full text-center py-8 border-y border-surface-variant/40 my-12 reveal">
          <p className="text-lg md:text-xl font-medium text-text-light italic font-sans">
            “Building secure systems that process real payments & automation workflows for real-world platforms.”
          </p>
        </div>

        {/* Projects */}
        <section id="projects" className="w-full mt-12">
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-12 text-center reveal">Featured Projects</h2>

          {projects.length === 0 && <p className="text-center reveal">No projects published yet.</p>}

          {/* Level 1: Featured Project (1 big card) */}
          {featuredProject && (
            <article className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col gap-6 p-6 md:p-10 reveal group mb-12">
              
              <div className="flex flex-col lg:flex-row gap-8">
                {featuredProject.image_url && (
                  <div className="w-full lg:w-1/2 rounded-xl overflow-hidden border border-surface-variant/40 flex-shrink-0">
                    <img 
                      src={getImageUrl(featuredProject.image_url)} 
                      alt={featuredProject.title} 
                      className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                      decoding="async" 
                    />
                  </div>
                )}
                
                <div className="flex-1 flex flex-col justify-center py-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-secondary/15 text-secondary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Featured Solution
                    </span>
                    <span className="text-xs text-text-light">Latest Project</span>
                  </div>
                  <h3 className="font-display-lg text-3xl md:text-4xl text-primary font-bold leading-tight">{featuredProject.title}</h3>

                  {featuredProject.impact_line && (
                    <p className="text-lg font-semibold text-primary/90 border-l-4 border-secondary pl-3 py-1 font-sans italic">
                      “{featuredProject.impact_line}”
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full">
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  {featuredProject.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-surface-variant/50 pt-6">
                <div className="flex flex-wrap gap-2">
                  {featuredProject.github_repo_url && (
                    <span className="bg-surface-container-low text-text-light text-xs font-semibold px-2.5 py-1 rounded">
                      Open Source
                    </span>
                  )}
                  <span className="bg-surface-container-low text-text-light text-xs font-semibold px-2.5 py-1 rounded">
                    Production Ready
                  </span>
                </div>
                {featuredProject.github_repo_url && (
                  <a
                    href={featuredProject.github_repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity active:scale-95 duration-200 shadow-sm px-4 py-2"
                  >
                    View on GitHub
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                )}
              </div>
            </article>
          )}

          {/* Level 2: Secondary Projects */}
          {secondaryProjects.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-primary mb-6 reveal">Core Implementations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {secondaryProjects.map((p, index) => (
                  <article
                    key={p.id}
                    className="bg-surface-container-lowest rounded-xl border border-surface-variant/70 p-6 flex flex-col gap-4 hover:shadow-md transition-all duration-300 reveal group"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    {p.image_url && (
                      <div className="w-full rounded-lg overflow-hidden border border-surface-variant/40">
                        <img 
                          src={getImageUrl(p.image_url)} 
                          alt={p.title} 
                          className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                          decoding="async" 
                        />
                      </div>
                    )}
                    <h4 className="text-2xl font-bold text-primary font-headline-sm mt-2">{p.title}</h4>
                    {p.impact_line && (
                      <p className="text-sm font-semibold text-primary border-l-2 border-primary/40 pl-2 italic">
                        {p.impact_line}
                      </p>
                    )}
                    <p className="text-on-surface-variant text-body-md leading-relaxed flex-grow">
                      {p.description}
                    </p>
                    {p.github_repo_url && (
                      <a
                        href={p.github_repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary font-label-md text-sm flex items-center gap-1 hover:underline mt-2"
                      >
                        Explore repository <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Level 3: Remaining Projects */}
          {remainingProjects.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-primary mb-6 reveal">Additional Projects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingProjects.map((p, index) => (
                  <article
                    key={p.id}
                    className="bg-surface-container-lowest rounded-xl border border-surface-variant/50 p-5 flex flex-col justify-between hover:border-surface-variant/80 transition-colors reveal"
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    <div>
                      <h4 className="text-lg font-bold text-primary mb-2">{p.title}</h4>
                      <p className="text-on-surface-variant text-xs mb-4 leading-relaxed flex-grow">
                        {p.description}
                      </p>
                    </div>
                    {p.github_repo_url && (
                      <a
                        href={p.github_repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline"
                      >
                        GitHub Code <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Featured Impact Strip */}
        <div className="w-full bg-surface-container-lowest border border-surface-variant rounded-2xl p-8 my-12 reveal shadow-sm flex flex-col md:flex-row justify-around items-center gap-6 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold text-primary">System Reliability & Impact</h3>
            <p className="text-sm text-on-surface-variant mt-1">Focused on secure integrations and system stability.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto">
            <div>
              <p className="text-3xl font-bold text-primary">
                <AnimatedCounter value={12} suffix="+" />
              </p>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mt-1">Systems Built</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary">
                <AnimatedCounter value={3} suffix="+" />
              </p>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mt-1">Automation Platforms</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">
                <AnimatedCounter value={99.9} decimals={1} suffix="%" />
              </p>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mt-1">M-PESA Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">
                <AnimatedCounter value={100} suffix="%" />
              </p>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mt-1">Security Focused</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <section id="skills" className="w-full mt-12">
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 text-center reveal">My Expertise</h2>
          <p className="text-center text-on-surface-variant max-w-xl mx-auto mb-12 reveal">
            A comprehensive mapping of technical capabilities, structured by operational domains.
          </p>

          <div className="skills-scroll-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Column 1: Backend Engineering */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-surface-variant/60 pb-5">
                <span className="material-symbols-outlined text-primary text-2xl">dns</span>
                <h3 className="text-xl font-bold text-primary">Backend Engineering</h3>
              </div>
              {renderSkillCategoryGroup('Backend Development')}
              {renderSkillCategoryGroup('Databases')}
              {renderSkillCategoryGroup('Payment Systems')}
              {renderSkillCategoryGroup('System Design & Architecture')}
            </div>

            {/* Column 2: Frontend Engineering */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-surface-variant/60 pb-5">
                <span className="material-symbols-outlined text-secondary text-2xl">desktop_windows</span>
                <h3 className="text-xl font-bold text-primary">Frontend Engineering</h3>
              </div>
              {renderSkillCategoryGroup('Frontend Development')}
              {renderSkillCategoryGroup('Human-Computer Interaction (HCI)')}
            </div>

            {/* Column 3: Systems & Security */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-surface-variant/60 pb-5">
                <span className="material-symbols-outlined text-accent text-2xl">shield_lock</span>
                <h3 className="text-xl font-bold text-primary">Systems & Security</h3>
              </div>
              {renderSkillCategoryGroup('Cybersecurity & Networking')}
              {renderSkillCategoryGroup('AI & Automation')}
              {renderSkillCategoryGroup('Software Projects Experience')}
              {renderSkillCategoryGroup('Tools & Workflow')}
            </div>
          </div>
        </div>
      </section>

        {/* Story Layer 2 */}
        <div className="w-full text-center py-8 border-y border-surface-variant/40 my-12 reveal">
          <p className="text-lg md:text-xl font-medium text-text-light italic font-sans">
            “Focused on system reliability, clean database architectures, and security-first development.”
          </p>
        </div>

        {/* Roadmap */}
        <section id="roadmap" className="w-full mt-section-gap-mobile md:mt-section-gap-desktop">
          <h2 className="font-headline-md text-headline-md text-primary mb-stack-md text-center reveal">Current Roadmap</h2>
          <div className="flex flex-col gap-6 max-w-4xl mx-auto bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm reveal">
            {roadmapTree.length === 0 && <p className="text-center text-text-light py-8">No active roadmaps found.</p>}
            {roadmapTree.map((rootNode) => (
              <div key={rootNode.id} className="border-b border-surface-variant/50 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                <RoadmapNode node={rootNode} />
              </div>
            ))}
          </div>
        </section>

        {/* News Preview */}
        <section id="news" className="w-full mt-section-gap-mobile md:mt-section-gap-desktop">
          <h2 className="font-headline-md text-headline-md text-primary mb-stack-md text-center reveal">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter max-w-4xl mx-auto mb-8">
            {news.slice(0, 2).map((n, index) => (
              <div
                key={n.id}
                className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant reveal flex flex-col"
                style={{ transitionDelay: `${(index % 2) * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-text-light">{new Date(n.created_at).toLocaleDateString()}</div>
                  {n.source && (
                    <a href={n.source_url || '#'} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hover:bg-secondary/25 transition-colors" title="View Source" onClick={e => !n.source_url && e.preventDefault()}>
                      {n.source}
                    </a>
                  )}
                </div>
                <h3 className="font-headline-sm text-primary mb-3">{n.title}</h3>
                <p className="font-body-md text-on-surface-variant line-clamp-3 flex-grow">{n.content}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center reveal">
            <Link to="/news" className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md px-6 py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95 duration-200 shadow-sm">
              Read All News & Announcements
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>



        {/* Contact Form */}
        <section id="contact" className="w-full mt-section-gap-mobile md:mt-section-gap-desktop pb-12 reveal">
          <h2 className="font-headline-md text-headline-md text-primary mb-stack-md text-center">Get In Touch</h2>
          <p className="text-center text-on-surface-variant max-w-xl mx-auto mb-10">
            Have a question or want to work together? Send me a message and I'll get back to you shortly.
          </p>

          <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="First Name" 
                  type="text" 
                  name="first_name"
                  value={contactForm.first_name} 
                  onChange={handleContactChange} 
                  placeholder="Your First Name" 
                  error={formErrors.first_name}
                  required
                />
                <Input 
                  label="Last Name" 
                  type="text" 
                  name="last_name"
                  value={contactForm.last_name} 
                  onChange={handleContactChange} 
                  placeholder="Your Last Name" 
                  error={formErrors.last_name}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Phone Number" 
                  type="tel" 
                  name="phone_number"
                  value={contactForm.phone_number} 
                  onChange={handleContactChange} 
                  placeholder="e.g. +254 712 345678" 
                  error={formErrors.phone_number}
                  required
                />
                <Input 
                  label="Email Address" 
                  type="email" 
                  name="email"
                  value={contactForm.email} 
                  onChange={handleContactChange} 
                  placeholder="Your Email Address" 
                  error={formErrors.email}
                  required
                />
              </div>

              <div className="mb-5 w-full">
                <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">
                  Message
                </label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  rows="5"
                  className={`w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-text-light/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200 resize-none ${
                    formErrors.message ? 'border-danger focus:ring-danger/5 focus:border-danger' : ''
                  }`}
                  placeholder="Type your message here..."
                  required
                />
                {formErrors.message && <p className="text-danger text-xs mt-1.5 font-medium">{formErrors.message}</p>}
              </div>

              <div className="mt-4 flex justify-end">
                <Button type="submit" variant="primary" disabled={submitStatus === 'loading'} className="w-full md:w-auto">
                  {submitStatus === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section id="testimonials" className="w-full mt-section-gap-mobile md:mt-section-gap-desktop">
            <h2 className="font-headline-md text-headline-md text-primary mb-stack-md text-center reveal">What People Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((t, index) => (
                <div
                  key={t.id}
                  className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-surface-variant reveal relative"
                  style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
                >
                  <span className="material-symbols-outlined absolute top-4 right-4 text-4xl text-primary/10">format_quote</span>
                  <p className="font-body-lg text-on-surface-variant italic leading-relaxed mb-6 relative z-10">
                    "{t.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    {t.image_url ? (
                      <img 
                        src={getImageUrl(t.image_url)} 
                        alt={t.client_name} 
                        className="w-12 h-12 rounded-full object-cover border border-surface-variant/50" 
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {t.client_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-primary">{t.client_name}</h4>
                      {t.company && <p className="text-xs text-text-light uppercase tracking-wider">{t.company}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <ChatWidget />

      {/* Floating Toast Notification */}
      <div 
        className={`fixed bottom-6 right-6 z-[100] max-w-sm w-[calc(100%-3rem)] bg-surface-container-lowest border border-surface-variant p-4 rounded-xl shadow-xl flex items-start gap-3 transition-all duration-300 transform ${
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className={`rounded-full p-1.5 flex items-center justify-center flex-shrink-0 ${
          toast.type === 'success' ? 'bg-green-500/10 text-green-700' : 'bg-danger/10 text-danger'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
        </div>
        <div className="flex-grow text-sm font-semibold text-on-surface leading-tight pt-0.5">
          {toast.message}
        </div>
        <button 
          type="button"
          onClick={() => setToast(prev => ({ ...prev, show: false }))}
          className="text-text-light/50 hover:text-on-surface transition-colors cursor-pointer p-1 -mr-1 -mt-1 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default PortfolioApp;
