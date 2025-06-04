import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './components/auth/LandingPage';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import ProductPortal from './components/products/ProductPortal';
import ProductDashboard from './components/products/dashboard/ProductDashboard';
import ServicesPage from './components/services/ServicesPage';
import DocumentManagement from './components/documents/DocumentManagement';
import ComplaintManagement from './components/complaints/ComplaintManagement';
import DashboardPage from './components/dashboard/DashboardPage';
import AuditsPage from './components/audits/AuditsPage';
import SuppliersPage from './components/suppliers/SuppliersPage';
import SettingsPage from './components/settings/SettingsPage';
import RecipesPage from './components/recipes/RecipesPage';
import WarehousePage from './components/warehouse/WarehousePage';
import WarehouseStock from './components/warehouse/WarehouseStock';
import WarehouseInventory from './components/warehouse/WarehouseInventory';
import LocationsPage from './components/warehouse/locations/LocationsPage';
import ShelvesPage from './components/warehouse/shelves/ShelvesPage';
import IntegrationsPage from './components/warehouse/integrations/IntegrationsPage';
import CoursesPage from './components/academy/CoursesPage';
import CertificationsPage from './components/academy/CertificationsPage';
import EnrollmentsPage from './components/academy/EnrollmentsPage';

export default function App() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('auth_token') !== null;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/register" element={<SignUpPage />} />
        
        {/* Protected routes */}
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductPortal />} />
            <Route path="/products/dashboard" element={<ProductDashboard />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/documents" element={<DocumentManagement />} />
            <Route path="/complaints" element={<ComplaintManagement />} />
            <Route path="/audits" element={<AuditsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/warehouse" element={<WarehousePage />} />
            <Route path="/warehouse/stock" element={<WarehouseStock />} />
            <Route path="/warehouse/inventory" element={<WarehouseInventory />} />
            <Route path="/warehouse/locations" element={<LocationsPage />} />
            <Route path="/warehouse/shelves" element={<ShelvesPage />} />
            <Route path="/warehouse/integrations" element={<IntegrationsPage />} />
            
            {/* Academy routes */}
            <Route path="/academy/courses" element={<CoursesPage />} />
            <Route path="/academy/certifications" element={<CertificationsPage />} />
            <Route path="/academy/enrollments" element={<EnrollmentsPage />} />
          </Route>
        ) : (
          // Redirect to home page if not authenticated
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
}