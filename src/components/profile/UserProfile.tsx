import React from 'react';
import { User, Mail, Phone, Building, MapPin, Calendar, Shield, Key, Bell, Moon, LogOut } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const navigate = useNavigate();
  
  // Sample user data - replace with actual data from your auth system
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Quality Manager',
    department: 'Quality Control',
    location: 'Los Angeles, CA',
    joinDate: '2023-01-15',
    avatar: null // Replace with actual avatar URL if available
  };

  const [editing, setEditing] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const handleSignOut = () => {
    // Clear any stored auth tokens or user data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Close the profile panel
    onClose();
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-[var(--background-paper)] h-screen w-full max-w-md overflow-y-auto">
        <div className="sticky top-0 bg-[var(--background-paper)] p-6 border-b border-[var(--divider)] z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[var(--primary-main)] mx-auto mb-4 flex items-center justify-center text-white">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-[var(--text-secondary)]">{user.role}</p>
          </div>

          {/* Personal Information */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Personal Information</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail size={20} className="text-[var(--text-secondary)] mr-3" />
                {editing ? (
                  <Input
                    defaultValue={user.email}
                    className="flex-1"
                  />
                ) : (
                  <span>{user.email}</span>
                )}
              </div>

              <div className="flex items-center">
                <Phone size={20} className="text-[var(--text-secondary)] mr-3" />
                {editing ? (
                  <Input
                    defaultValue={user.phone}
                    className="flex-1"
                  />
                ) : (
                  <span>{user.phone}</span>
                )}
              </div>

              <div className="flex items-center">
                <Building size={20} className="text-[var(--text-secondary)] mr-3" />
                <span>{user.department}</span>
              </div>

              <div className="flex items-center">
                <MapPin size={20} className="text-[var(--text-secondary)] mr-3" />
                <span>{user.location}</span>
              </div>

              <div className="flex items-center">
                <Calendar size={20} className="text-[var(--text-secondary)] mr-3" />
                <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card>
            <h3 className="font-medium mb-4">Security</h3>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={<Key size={20} />}
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={<Shield size={20} />}
              >
                Two-Factor Authentication
              </Button>
            </div>
          </Card>

          {/* Preferences */}
          <Card>
            <h3 className="font-medium mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell size={20} className="text-[var(--text-secondary)] mr-3" />
                  <span>Notifications</span>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    className="opacity-0 w-0 h-0"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <span
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      notifications ? 'bg-[var(--primary-main)]' : 'bg-[var(--divider)]'
                    }`}
                  >
                    <span
                      className={`absolute w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                      style={{ top: '2px' }}
                    />
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Moon size={20} className="text-[var(--text-secondary)] mr-3" />
                  <span>Dark Mode</span>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    className="opacity-0 w-0 h-0"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <span
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      darkMode ? 'bg-[var(--primary-main)]' : 'bg-[var(--divider)]'
                    }`}
                  >
                    <span
                      className={`absolute w-5 h-5 bg-white rounded-full transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                      style={{ top: '2px' }}
                    />
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Logout Button */}
          <Button
            variant="danger"
            className="w-full"
            icon={<LogOut size={20} />}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;