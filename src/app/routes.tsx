import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { AccountLockedPage } from './pages/AccountLockedPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientRegisterPage } from './pages/PatientRegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { AddRecordPage } from './pages/AddRecordPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ProfilePage } from './pages/ProfilePage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SecurityEventsPage } from './pages/SecurityEventsPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { VitalSignsPage } from './pages/VitalSignsPage';
import { BlockchainVerificationPage } from './pages/BlockchainVerificationPage';
import { Error403Page } from './pages/Error403Page';
import { Error500Page } from './pages/Error500Page';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/account-locked',
    element: <AccountLockedPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/patient-register',
    element: <PatientRegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'patients',
        element: <PatientsPage />,
      },
      {
        path: 'patients/:patientId',
        element: <PatientDetailPage />,
      },
      {
        path: 'add-record',
        element: <AddRecordPage />,
      },
      {
        path: 'audit-log',
        element: <AuditLogPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'user-management',
        element: <UserManagementPage />,
      },
      {
        path: 'security-events',
        element: <SecurityEventsPage />,
      },
      {
        path: 'monitoring',
        element: <MonitoringPage />,
      },
      {
        path: 'vital-signs',
        element: <VitalSignsPage />,
      },
      {
        path: 'blockchain-verify',
        element: <BlockchainVerificationPage />,
      },
      {
        path: '403',
        element: <Error403Page />,
      },
      {
        path: '500',
        element: <Error500Page />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

