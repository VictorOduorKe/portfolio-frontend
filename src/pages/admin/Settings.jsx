import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Settings = () => {
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    news_auto_update_enabled: '0',
    news_auto_update_interval: '10'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(prev => ({
        ...prev,
        ...data,
        news_auto_update_enabled: data.news_auto_update_enabled === '1' || data.news_auto_update_enabled === 1 ? '1' : '0',
        news_auto_update_interval: data.news_auto_update_interval ? String(data.news_auto_update_interval) : '10'
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateSettings({
        news_auto_update_enabled: settings.news_auto_update_enabled === '1',
        news_auto_update_interval: parseInt(settings.news_auto_update_interval, 10) || 10
      });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      loadSettings();
    } catch (e) {
      setMessage('Error updating settings: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">System Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SMTP Configuration Card */}
        <Card className="shadow-md">
          <CardHeader className="border-b border-primary/5 pb-4">
            <CardTitle className="text-2xl font-bold text-primary">SMTP Mail Configuration</CardTitle>
            <p className="text-sm text-text-light mt-1">Configure the secure email transport settings used to dispatch OTP verification codes.</p>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="flex flex-col gap-4">
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg text-sm text-text-light">
                <span className="font-semibold text-primary">Managed via environment:</span> SMTP configurations are loaded directly from the server's <code>.env</code> file for security. Changes should be made directly in that file.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Input 
                    label="SMTP Host" 
                    type="text" 
                    value={settings.smtp_host} 
                    disabled
                    placeholder="e.g., smtp.gmail.com" 
                  />
                </div>
                <div>
                  <Input 
                    label="SMTP Port" 
                    type="text" 
                    value={settings.smtp_port} 
                    disabled
                    placeholder="587" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="SMTP User (Email)" 
                  type="text" 
                  value={settings.smtp_user} 
                  disabled
                  placeholder="username@domain.com"
                />
                <Input 
                  label="SMTP Password / App Password" 
                  type="text" 
                  value={settings.smtp_pass} 
                  disabled
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News Bot Configuration Card */}
        <Card className="shadow-md">
          <CardHeader className="border-b border-primary/5 pb-4">
            <CardTitle className="text-2xl font-bold text-primary">Auto News Bot Config</CardTitle>
            <p className="text-sm text-text-light mt-1">Configure automated technology news articles fetching and posting using Gemini AI.</p>
          </CardHeader>
          <CardContent className="mt-6">
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-surface-variant/40">
                <div>
                  <label htmlFor="news_auto_update_enabled" className="font-semibold text-primary block text-sm">Auto News Update</label>
                  <span className="text-xs text-text-light">Automatically generate and post articles at intervals</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="news_auto_update_enabled"
                    checked={settings.news_auto_update_enabled === '1'}
                    onChange={e => setSettings(prev => ({ ...prev, news_auto_update_enabled: e.target.checked ? '1' : '0' }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-variant/60 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div>
                <Input 
                  label="Auto Update Interval (minutes)" 
                  type="number" 
                  min="1"
                  value={settings.news_auto_update_interval} 
                  onChange={e => setSettings(prev => ({ ...prev, news_auto_update_interval: e.target.value }))}
                  placeholder="10"
                  required
                />
                <p className="text-xs text-text-light mt-1.5">Frequency at which the background worker checks for new articles.</p>
              </div>

              {message && (
                <div className={`p-4 rounded-lg text-sm font-semibold transition-all duration-300 ${message.startsWith('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end border-t border-primary/5 pt-4">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
