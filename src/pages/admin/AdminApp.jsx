import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { login, verifyOtp } from '../../services/api';
import useSeo from '../../lib/useSeo';
import DashboardLayout from './DashboardLayout';
import Projects from './Projects';
import Skills from './Skills';
import Roadmaps from './Roadmaps';
import News from './News';
import Testimonials from './Testimonials';
import Settings from './Settings';
import BackupManager from './BackupManager';
import ActivityLogs from './ActivityLogs';
import Messages from './Messages';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

function App() {
  useSeo({
    title: 'Admin Portal | TheTechCraft',
    description: 'Administrative portal for managing Victor Oduor portfolio content.',
    noindex: true,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [apiToken, setApiToken] = useState(localStorage.getItem('api_token') || null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (apiToken) setStep(3);
  }, [apiToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setSubmitting(true);
    try {
      const res = await verifyOtp(email, otp);
      setApiToken(res.api_token);
      localStorage.setItem('api_token', res.api_token);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    setApiToken(null);
    localStorage.removeItem('api_token');
    setStep(1);
  };

  if (apiToken && step === 3) {
    return (
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
        {activeTab === 'projects' && <Projects />}
        {activeTab === 'skills' && <Skills />}
        {activeTab === 'roadmaps' && <Roadmaps />}
        {activeTab === 'news' && <News />}
        {activeTab === 'testimonials' && <Testimonials />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'backup' && <BackupManager />}
        {activeTab === 'logs' && <ActivityLogs />}
        {activeTab === 'contacts' && <Messages />}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Access</CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && <div className="text-danger text-center mb-4 font-medium">{error}</div>}
          {message && <div className="text-green-600 text-center mb-4 font-medium">{message}</div>}

          {step === 1 && (
            <form onSubmit={handleLogin}>
              <Input 
                label="Email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
              <Input 
                label="Password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
              <Button type="submit" variant="primary" className="w-full mt-2" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Token...
                  </span>
                ) : (
                  'Send Login Token'
                )}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <Input 
                  label="Verification Code" 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  required 
                  placeholder="123456" 
                />
                <p className="text-[13px] text-text-light mt-1">Check your email for the 6-digit code.</p>
              </div>
              <Button type="submit" variant="primary" className="w-full mt-2" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Login'
                )}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center border-t border-primary/5 pt-4">
            <Link to="/" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5">
              &larr; Back to Portfolio Site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
