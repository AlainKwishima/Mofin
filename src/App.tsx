import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Contact } from './pages/Contact';
import { Pricing } from './pages/Pricing';

// Admin Imports
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminTelemetry } from './admin/pages/AdminTelemetry';
import { AdminProviders } from './admin/pages/AdminProviders';
import { AdminAccounts } from './admin/pages/AdminAccounts';
import { AdminLedgers } from './admin/pages/AdminLedgers';
import { AdminPayments } from './admin/pages/AdminPayments';
import { AdminAccessCodes } from './admin/pages/AdminAccessCodes';
import { AdminComplaints } from './admin/pages/AdminComplaints';
import { AdminPlans } from './admin/pages/AdminPlans';
import { AdminSettings } from './admin/pages/AdminSettings';

// Public Layout wrapper with standard website navigation
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f5] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  const isAdminDomain =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('admin') || window.location.hostname.startsWith('admin.'));

  return (
    <Router>
      <ScrollToTop />
      <AdminAuthProvider>
        <Routes>
          {/* Root redirect for dedicated admin domains */}
          {isAdminDomain && <Route path="/" element={<Navigate to="/admin" replace />} />}

          {/* Public Marketing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/terms-conditions" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="telemetry" element={<AdminTelemetry />} />
            <Route path="providers" element={<AdminProviders />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="ledgers" element={<AdminLedgers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="codes" element={<AdminAccessCodes />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}
