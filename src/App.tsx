import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LandingPage from './components/auth/LandingPage'
import SignInPage from './components/auth/SignInPage'
import ProductPortal from './components/products/ProductPortal'
import ProductDashboard from './components/products/dashboard/ProductDashboard'
import DocumentManagement from './components/documents/DocumentManagement'
import ComplaintManagement from './components/complaints/ComplaintManagement'
import DashboardPage from './components/dashboard/DashboardPage'
import AuditsPage from './components/audits/AuditsPage'
import SuppliersPage from './components/suppliers/SuppliersPage'
import SettingsPage from './components/settings/SettingsPage'
import RecipesPage from './components/recipes/RecipesPage'
import WarehousePage from './components/warehouse/WarehousePage'
import WarehouseStock from './components/warehouse/WarehouseStock'
import WarehouseInventory from './components/warehouse/WarehouseInventory'
import LocationsPage from './components/warehouse/locations/LocationsPage'
import ShelvesPage from './components/warehouse/locations/ShelvesPage'
import IntegrationsPage from './components/warehouse/integrations/IntegrationsPage'
import PhotosPage from './components/assets/photos/PhotosPage'
import BoxPhotosPage from './components/assets/photos/box/BoxPhotosPage'
import ProductPhotosPage from './components/assets/photos/products/ProductPhotosPage'
import VideosPage from './components/assets/videos/VideosPage'
import ProductLabelsPage from './components/assets/labels/products/ProductLabelsPage'
import PalletCalculator from './components/palletizator/PalletCalculator'
import Pallet80x120Calculator from './components/palletizator/Pallet80x120Calculator'
import FloorLoadCalculator from './components/palletizator/FloorLoadCalculator'
import CoursesPage from './components/academy/CoursesPage'
import CertificationsPage from './components/academy/CertificationsPage'
import EnrollmentsPage from './components/academy/EnrollmentsPage'
import ShopifyPage from './components/ecommerce/shopify/ShopifyPage'

function App() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('auth_token') !== null;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<SignInPage />} />
        
        {/* Protected routes */}
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard\" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductPortal />} />
            <Route path="/products/dashboard" element={<ProductDashboard />} />
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
            <Route path="/warehouse/locations/shelves" element={<ShelvesPage />} />
            <Route path="/warehouse/integrations" element={<IntegrationsPage />} />
            <Route path="/assets/photos" element={<PhotosPage />} />
            <Route path="/assets/photos/boxes" element={<BoxPhotosPage />} />
            <Route path="/assets/photos/products" element={<ProductPhotosPage />} />
            <Route path="/assets/videos" element={<VideosPage />} />
            <Route path="/assets/labels/products" element={<ProductLabelsPage />} />
            <Route path="/palletizator/100x120" element={<PalletCalculator />} />
            <Route path="/palletizator/80x120" element={<Pallet80x120Calculator />} />
            <Route path="/palletizator/floor" element={<FloorLoadCalculator />} />
            <Route path="/academy/courses" element={<CoursesPage />} />
            <Route path="/academy/certifications" element={<CertificationsPage />} />
            <Route path="/academy/enrollments" element={<EnrollmentsPage />} />
            <Route path="/ecommerce/shopify" element={<ShopifyPage />} />
          </Route>
        ) : (
          // Redirect to login page if not authenticated
          <Route path="*" element={<Navigate to="/login\" replace />} />
        )}
      </Routes>
    </Router>
  )
}

export default App