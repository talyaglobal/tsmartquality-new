import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LandingPage from './components/auth/LandingPage'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import ProductPortal from './components/products/ProductPortal'
import ProductDashboard from './components/products/dashboard/ProductDashboard'
import DocumentManagement from './components/documents/DocumentManagement'
import ComplaintManagement from './components/complaints/ComplaintManagement'
import DashboardPage from './components/dashboard/DashboardPage'
import AuditsPage from './components/audits/AuditsPage'
import SuppliersPage from './components/suppliers/SuppliersPage'
import CustomersPage from './components/customers/CustomersPage'
import SettingsPage from './components/settings/SettingsPage'
import RecipesPage from './components/recipes/RecipesPage'
import WarehousePage from './components/warehouse/WarehousePage'
import WarehouseStock from './components/warehouse/WarehouseStock'
import WarehouseInventory from './components/warehouse/WarehouseInventory'
import LocationsPage from './components/warehouse/locations/LocationsPage'
import AddLocationPage from './components/warehouse/locations/AddLocationPage'
import ShelvesPage from './components/warehouse/locations/ShelvesPage'
import IntegrationsPage from './components/warehouse/integrations/IntegrationsPage'
import PhotosPage from './components/assets/photos/PhotosPage'
import BoxPhotosPage from './components/assets/photos/box/BoxPhotosPage'
import ProductPhotosPage from './components/assets/photos/products/ProductPhotosPage'
import PalletPhotosPage from './components/assets/photos/pallets/PalletPhotosPage'
import VideosPage from './components/assets/videos/VideosPage'
import ProductLabelsPage from './components/assets/labels/products/ProductLabelsPage'
import BoxLabelsPage from './components/assets/labels/box/BoxLabelsPage'
import PalletLabelsPage from './components/assets/labels/pallets/PalletLabelsPage'
import PalletCalculator from './components/palletizator/PalletCalculator'
import Pallet80x120Calculator from './components/palletizator/Pallet80x120Calculator'
import FloorLoadCalculator from './components/palletizator/FloorLoadCalculator'
import CoursesPage from './components/academy/CoursesPage'
import CreateCoursePage from './components/academy/CreateCoursePage'
import CertificationsPage from './components/academy/CertificationsPage'
import EnrollmentsPage from './components/academy/EnrollmentsPage'
import ShopifyPage from './components/ecommerce/shopify/ShopifyPage'
import WooCommercePage from './components/ecommerce/woocommerce/WooCommercePage'
import AmazonPage from './components/ecommerce/amazon/AmazonPage'
import QuickBooksPage from './components/accountancy/quickbooks/QuickBooksPage'
import NetSuitePage from './components/accountancy/netsuite/NetSuitePage'
import TSmartBooksPage from './components/accountancy/tsmartbooks/TSmartBooksPage'
import FeaturesPage from './components/footer/FeaturesPage'
import PricingPage from './components/footer/PricingPage'
import CaseStudiesPage from './components/footer/CaseStudiesPage'
import DocumentationPage from './components/footer/DocumentationPage'
import AboutPage from './components/footer/AboutPage'
import CareersPage from './components/footer/CareersPage'
import BlogPage from './components/footer/BlogPage'
import ContactPage from './components/footer/ContactPage'
import PrivacyPage from './components/footer/PrivacyPage'
import TermsPage from './components/footer/TermsPage'
import SecurityPage from './components/footer/SecurityPage'
import CompliancePage from './components/footer/CompliancePage'
import NotFoundPage from './components/NotFoundPage'
import QualityScorePage from './components/quality/QualityScorePage'
import WarningsPage from './components/warnings/WarningsPage'
import ServicesPage from './components/services/ServicesPage'
import TasksPage from './components/tasks/TasksPage'
import QualityHandbookPage from './components/documents/QualityHandbookPage'
import SalesSpecsPage from './components/documents/SalesSpecsPage'
import BuyingSpecsPage from './components/documents/BuyingSpecsPage'
import RecipeNormPage from './components/documents/RecipeNormPage'
import JsvsrpPage from './components/documents/JsvsrpPage'
import HaccpPage from './components/documents/HaccpPage'
import AcceptanceFormsPage from './components/documents/AcceptanceFormsPage'
import FlowChartPage from './components/documents/FlowChartPage'
import BrochuresPage from './components/documents/BrochuresPage'
import CataloguesPage from './components/documents/CataloguesPage'
import CertificationsDocPage from './components/documents/CertificationsDocPage'
import AuditReportsPage from './components/documents/AuditReportsPage'

function App() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('auth_token') !== null;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/register" element={<SignUpPage />} />
        
        {/* Footer pages */}
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        
        {/* Protected routes */}
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quality-score" element={<QualityScorePage />} />
            <Route path="/products" element={<ProductPortal />} />
            <Route path="/products/dashboard" element={<ProductDashboard />} />
            <Route path="/documents" element={<DocumentManagement />} />
            <Route path="/documents/quality-handbook" element={<QualityHandbookPage />} />
            <Route path="/documents/sales-specs" element={<SalesSpecsPage />} />
            <Route path="/documents/buying-specs" element={<BuyingSpecsPage />} />
            <Route path="/documents/recipe-norm" element={<RecipeNormPage />} />
            <Route path="/documents/jsvsrp" element={<JsvsrpPage />} />
            <Route path="/documents/haccp" element={<HaccpPage />} />
            <Route path="/documents/acceptance-forms" element={<AcceptanceFormsPage />} />
            <Route path="/documents/flow-charts" element={<FlowChartPage />} />
            <Route path="/documents/brochures" element={<BrochuresPage />} />
            <Route path="/documents/catalogues" element={<CataloguesPage />} />
            <Route path="/documents/certifications" element={<CertificationsDocPage />} />
            <Route path="/documents/audit-reports" element={<AuditReportsPage />} />
            <Route path="/complaints" element={<ComplaintManagement />} />
            <Route path="/warnings" element={<WarningsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/audits" element={<AuditsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Warehouse routes */}
            <Route path="/warehouse" element={<WarehousePage />} />
            <Route path="/warehouse/stock" element={<WarehouseStock />} />
            <Route path="/warehouse/inventory" element={<WarehouseInventory />} />
            <Route path="/warehouse/locations" element={<LocationsPage />} />
            <Route path="/warehouse/locations/add" element={<AddLocationPage />} />
            <Route path="/warehouse/locations/shelves" element={<ShelvesPage />} />
            <Route path="/warehouse/integrations" element={<IntegrationsPage />} />
            
            {/* Assets routes */}
            <Route path="/assets/photos" element={<PhotosPage />} />
            <Route path="/assets/photos/boxes" element={<BoxPhotosPage />} />
            <Route path="/assets/photos/products" element={<ProductPhotosPage />} />
            <Route path="/assets/photos/pallets" element={<PalletPhotosPage />} />
            <Route path="/assets/videos" element={<VideosPage />} />
            <Route path="/assets/labels/products" element={<ProductLabelsPage />} />
            <Route path="/assets/labels/boxes" element={<BoxLabelsPage />} />
            <Route path="/assets/labels/pallets" element={<PalletLabelsPage />} />
            
            {/* Palletizator routes */}
            <Route path="/palletizator/100x120" element={<PalletCalculator />} />
            <Route path="/palletizator/80x120" element={<Pallet80x120Calculator />} />
            <Route path="/palletizator/floor" element={<FloorLoadCalculator />} />
            
            {/* Academy routes */}
            <Route path="/academy/courses" element={<CoursesPage />} />
            <Route path="/academy/courses/create" element={<CreateCoursePage />} />
            <Route path="/academy/certifications" element={<CertificationsPage />} />
            <Route path="/academy/enrollments" element={<EnrollmentsPage />} />
            
            {/* E-commerce routes */}
            <Route path="/ecommerce/shopify" element={<ShopifyPage />} />
            <Route path="/ecommerce/woocommerce" element={<WooCommercePage />} />
            <Route path="/ecommerce/amazon" element={<AmazonPage />} />
            
            {/* Accountancy routes */}
            <Route path="/accountancy/quickbooks" element={<QuickBooksPage />} />
            <Route path="/accountancy/netsuite" element={<NetSuitePage />} />
            <Route path="/accountancy/tsmartbooks" element={<TSmartBooksPage />} />
          </Route>
        ) : (
          // Redirect to landing page if not authenticated
          <Route path="*" element={<Navigate to="/landing" replace />} />
        )}
        
        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App