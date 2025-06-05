import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './components/auth/LandingPage';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import NotFoundPage from './components/NotFoundPage';
import ProductPortal from './components/products/ProductPortal';
import ProductDashboard from './components/products/dashboard/ProductDashboard';
import ServicesPage from './components/services/ServicesPage';
import DocumentManagement from './components/documents/DocumentManagement';
import ComplaintManagement from './components/complaints/ComplaintManagement';
import DashboardPage from './components/dashboard/DashboardPage';
import AuditsPage from './components/audits/AuditsPage';
import SuppliersPage from './components/suppliers/SuppliersPage';
import CustomersPage from './components/customers/CustomersPage';
import SettingsPage from './components/settings/SettingsPage';
import RecipesPage from './components/recipes/RecipesPage';
import WarehousePage from './components/warehouse/WarehousePage';
import WarehouseStock from './components/warehouse/WarehouseStock';
import WarehouseInventory from './components/warehouse/WarehouseInventory';
import LocationsPage from './components/warehouse/locations/LocationsPage';
import ShelvesPage from './components/warehouse/locations/ShelvesPage';
import IntegrationsPage from './components/warehouse/integrations/IntegrationsPage';
import CoursesPage from './components/academy/CoursesPage';
import CertificationsPage from './components/academy/CertificationsPage';
import EnrollmentsPage from './components/academy/EnrollmentsPage';
import QualityScorePage from './components/quality/QualityScorePage';
import WarningsPage from './components/warnings/WarningsPage';

// Footer Pages
import FeaturesPage from './components/footer/FeaturesPage';
import PricingPage from './components/footer/PricingPage';
import CaseStudiesPage from './components/footer/CaseStudiesPage';
import DocumentationPage from './components/footer/DocumentationPage';
import AboutPage from './components/footer/AboutPage';
import CareersPage from './components/footer/CareersPage';
import BlogPage from './components/footer/BlogPage';
import ContactPage from './components/footer/ContactPage';
import SecurityPage from './components/footer/SecurityPage';
import TermsPage from './components/footer/TermsPage';

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
        
        {/* Footer Pages - Public */}
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/terms" element={<TermsPage />} />
        
        {/* Protected routes */}
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quality-score" element={<QualityScorePage />} />
            <Route path="/products" element={<ProductPortal />} />
            <Route path="/products/dashboard" element={<ProductDashboard />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/documents" element={<DocumentManagement />} />
            <Route path="/complaints" element={<ComplaintManagement />} />
            <Route path="/warnings" element={<WarningsPage />} />
            <Route path="/audits" element={<AuditsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
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

        {/* 404 Not Found route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}