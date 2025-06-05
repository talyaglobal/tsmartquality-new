import React, { useState } from 'react';
import { Mail, MessageSquare, FileText, Calendar, Link2, Check, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import GoogleOAuthButton from './GoogleOAuthButton';

const IntegrationsSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState({
    whatsapp: {
      connected: false,
      number: '',
      apiKey: ''
    },
    email: {
      connected: false,
      smtp: {
        host: '',
        port: '',
        username: '',
        password: ''
      }
    },
    drive: {
      connected: false,
      folderId: '',
      accessToken: ''
    },
    calendar: {
      connected: false,
      calendarId: '',
      accessToken: ''
    }
  });

  const handleConnect = (service: keyof typeof integrations) => {
    // Here you would normally handle OAuth or API connection
    setIntegrations(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        connected: true
      }
    }));
  };

  const handleDisconnect = (service: keyof typeof integrations) => {
    setIntegrations(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        connected: false,
        accessToken: ''
      }
    }));
  };

  const handleGoogleDriveSuccess = (tokenResponse: any) => {
    console.log('Google Drive OAuth success:', tokenResponse);
    setIntegrations(prev => ({
      ...prev,
      drive: {
        ...prev.drive,
        connected: true,
        accessToken: tokenResponse.access_token
      }
    }));
  };

  const handleGoogleCalendarSuccess = (tokenResponse: any) => {
    console.log('Google Calendar OAuth success:', tokenResponse);
    setIntegrations(prev => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        connected: true,
        accessToken: tokenResponse.access_token
      }
    }));
  };

  const handleGoogleError = (error: any) => {
    console.error('Google OAuth error:', error);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Integrations</h1>
        <p className="text-[var(--text-secondary)]">
          Connect your accounts to enhance communication and productivity
        </p>
      </div>

      {/* WhatsApp Integration */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[var(--success-light)] text-[var(--success-dark)]">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">WhatsApp Business</h2>
              <p className="text-[var(--text-secondary)]">
                Connect WhatsApp to send notifications and updates
              </p>
            </div>
          </div>
          {integrations.whatsapp.connected ? (
            <Button
              variant="danger"
              icon={<X size={20} />}
              onClick={() => handleDisconnect('whatsapp')}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              icon={<Link2 size={20} />}
              onClick={() => handleConnect('whatsapp')}
            >
              Connect
            </Button>
          )}
        </div>

        {integrations.whatsapp.connected ? (
          <div className="p-4 bg-[var(--success-light)] bg-opacity-10 rounded-lg">
            <div className="flex items-center mb-4">
              <Check size={20} className="text-[var(--success-main)] mr-2" />
              <span className="font-medium">Connected to WhatsApp Business API</span>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              Your WhatsApp Business account is connected. You can now send notifications and updates via WhatsApp.
            </p>
            <Button
              variant="outline"
              size="sm"
            >
              Configure Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Business Phone Number"
              placeholder="+1 (555) 123-4567"
              value={integrations.whatsapp.number}
              onChange={(e) => setIntegrations(prev => ({
                ...prev,
                whatsapp: {
                  ...prev.whatsapp,
                  number: e.target.value
                }
              }))}
            />
            <Input
              label="API Key"
              type="password"
              placeholder="Enter your WhatsApp Business API key"
              value={integrations.whatsapp.apiKey}
              onChange={(e) => setIntegrations(prev => ({
                ...prev,
                whatsapp: {
                  ...prev.whatsapp,
                  apiKey: e.target.value
                }
              }))}
            />
          </div>
        )}
      </Card>

      {/* Email Integration */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Email Service</h2>
              <p className="text-[var(--text-secondary)]">
                Configure email service for sending notifications
              </p>
            </div>
          </div>
          {integrations.email.connected ? (
            <Button
              variant="danger"
              icon={<X size={20} />}
              onClick={() => handleDisconnect('email')}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              icon={<Link2 size={20} />}
              onClick={() => handleConnect('email')}
            >
              Connect
            </Button>
          )}
        </div>

        {integrations.email.connected ? (
          <div className="p-4 bg-[var(--primary-light)] bg-opacity-10 rounded-lg">
            <div className="flex items-center mb-4">
              <Check size={20} className="text-[var(--primary-main)] mr-2" />
              <span className="font-medium">Email service connected</span>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              Your email service is configured and ready to send notifications.
            </p>
            <Button
              variant="outline"
              size="sm"
            >
              Test Email
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SMTP Host"
                placeholder="smtp.example.com"
                value={integrations.email.smtp.host}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  email: {
                    ...prev.email,
                    smtp: {
                      ...prev.email.smtp,
                      host: e.target.value
                    }
                  }
                }))}
              />
              <Input
                label="SMTP Port"
                placeholder="587"
                value={integrations.email.smtp.port}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  email: {
                    ...prev.email,
                    smtp: {
                      ...prev.email.smtp,
                      port: e.target.value
                    }
                  }
                }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SMTP Username"
                placeholder="username@example.com"
                value={integrations.email.smtp.username}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  email: {
                    ...prev.email,
                    smtp: {
                      ...prev.email.smtp,
                      username: e.target.value
                    }
                  }
                }))}
              />
              <Input
                label="SMTP Password"
                type="password"
                placeholder="Enter your SMTP password"
                value={integrations.email.smtp.password}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  email: {
                    ...prev.email,
                    smtp: {
                      ...prev.email.smtp,
                      password: e.target.value
                    }
                  }
                }))}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Google Drive Integration */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info-dark)]">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Google Drive</h2>
              <p className="text-[var(--text-secondary)]">
                Connect Google Drive to store and manage documents
              </p>
            </div>
          </div>
          {integrations.drive.connected ? (
            <Button
              variant="danger"
              icon={<X size={20} />}
              onClick={() => handleDisconnect('drive')}
            >
              Disconnect
            </Button>
          ) : (
            <GoogleOAuthButton 
              onSuccess={handleGoogleDriveSuccess} 
              onError={handleGoogleError}
              buttonText="Connect Drive"
            />
          )}
        </div>

        {integrations.drive.connected ? (
          <div className="p-4 bg-[var(--info-light)] bg-opacity-10 rounded-lg">
            <div className="flex items-center mb-4">
              <Check size={20} className="text-[var(--info-main)] mr-2" />
              <span className="font-medium">Connected to Google Drive</span>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              Your Google Drive account is connected. Documents will be automatically synced.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
              >
                Configure Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                Test Connection
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
              Connect your Google Drive account to automatically store and manage documents. 
              Click the Connect button to authorize access.
            </p>
            <Input
              label="Default Folder ID (Optional)"
              placeholder="Enter Google Drive folder ID"
              value={integrations.drive.folderId}
              onChange={(e) => setIntegrations(prev => ({
                ...prev,
                drive: {
                  ...prev.drive,
                  folderId: e.target.value
                }
              }))}
            />
          </div>
        )}
      </Card>

      {/* Google Calendar Integration */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[var(--warning-light)] text-[var(--warning-dark)]">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Google Calendar</h2>
              <p className="text-[var(--text-secondary)]">
                Connect Google Calendar to manage audits and events
              </p>
            </div>
          </div>
          {integrations.calendar.connected ? (
            <Button
              variant="danger"
              icon={<X size={20} />}
              onClick={() => handleDisconnect('calendar')}
            >
              Disconnect
            </Button>
          ) : (
            <GoogleOAuthButton 
              onSuccess={handleGoogleCalendarSuccess} 
              onError={handleGoogleError}
              buttonText="Connect Calendar"
            />
          )}
        </div>

        {integrations.calendar.connected ? (
          <div className="p-4 bg-[var(--warning-light)] bg-opacity-10 rounded-lg">
            <div className="flex items-center mb-4">
              <Check size={20} className="text-[var(--warning-main)] mr-2" />
              <span className="font-medium">Connected to Google Calendar</span>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              Your Google Calendar is connected. Audits and events will be automatically synced.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
              >
                Configure Events
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                Test Calendar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
              Connect your Google Calendar to automatically schedule and manage audits, meetings, and other events.
              Click the Connect button to authorize access.
            </p>
            <Input
              label="Default Calendar ID (Optional)"
              placeholder="Enter Google Calendar ID"
              value={integrations.calendar.calendarId}
              onChange={(e) => setIntegrations(prev => ({
                ...prev,
                calendar: {
                  ...prev.calendar,
                  calendarId: e.target.value
                }
              }))}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default IntegrationsSettings;