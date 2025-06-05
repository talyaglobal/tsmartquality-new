import React, { useState } from 'react';
import { Save, Bell, Moon, Globe, Lock, Shield, Mail, Palette, Sun } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    companyName: 'TSmart Quality',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    theme: document.documentElement.getAttribute('data-theme') || 'light',
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false,
    sessionTimeout: '30',
    primaryColor: '#7367F0',
    accentColor: '#28C76F'
  });

  const handleChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Handle theme changes immediately
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value as string);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save settings to backend
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">General Settings</h1>
        <p className="text-[var(--text-secondary)]">
          Manage your application preferences and configurations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Settings */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Company Settings</h2>
          <div className="space-y-4">
            <Input
              label="Company Name"
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Timezone
                </label>
                <select
                  className="w-full border border-[var(--divider)] rounded-md p-2"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="CST">Central Time</option>
                  <option value="PST">Pacific Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Date Format
                </label>
                <select
                  className="w-full border border-[var(--divider)] rounded-md p-2"
                  value={settings.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Theme
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className={`flex items-center space-x-2 p-3 rounded-lg border ${
                      settings.theme === 'light'
                        ? 'border-[var(--primary-main)] bg-[var(--primary-light)] text-[var(--primary-dark)]'
                        : 'border-[var(--divider)]'
                    }`}
                    onClick={() => handleChange('theme', 'light')}
                  >
                    <Sun size={20} />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    className={`flex items-center space-x-2 p-3 rounded-lg border ${
                      settings.theme === 'dark'
                        ? 'border-[var(--primary-main)] bg-[var(--primary-light)] text-[var(--primary-dark)]'
                        : 'border-[var(--divider)]'
                    }`}
                    onClick={() => handleChange('theme', 'dark')}
                  >
                    <Moon size={20} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Language
                </label>
                <select
                  className="w-full border border-[var(--divider)] rounded-md p-2"
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="color"
                label="Primary Color"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
              />
              <Input
                type="color"
                label="Accent Color"
                value={settings.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail size={20} className="text-[var(--text-secondary)]" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-[var(--text-secondary)]">Receive email updates about your activity</p>
                </div>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-[var(--primary-main)]' : 'bg-[var(--divider)]'
                  }`}
                >
                  <span
                    className={`absolute w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    style={{ top: '2px' }}
                  />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell size={20} className="text-[var(--text-secondary)]" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-[var(--text-secondary)]">Receive push notifications in your browser</p>
                </div>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                    settings.pushNotifications ? 'bg-[var(--primary-main)]' : 'bg-[var(--divider)]'
                  }`}
                >
                  <span
                    className={`absolute w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    style={{ top: '2px' }}
                  />
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield size={20} className="text-[var(--text-secondary)]" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-[var(--text-secondary)]">Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                    settings.twoFactorAuth ? 'bg-[var(--primary-main)]' : 'bg-[var(--divider)]'
                  }`}
                >
                  <span
                    className={`absolute w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    style={{ top: '2px' }}
                  />
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Session Timeout (minutes)
              </label>
              <select
                className="w-full border border-[var(--divider)] rounded-md p-2"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" icon={<Save size={20} />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;