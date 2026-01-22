import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout.jsx';
import RoleRoute from './RoleRoute.jsx';
import AuthorizeDoctor from '../pages/AuthorizeDoctor.jsx';
import Login from '../pages/Login.jsx';
import Registro from '../pages/Registro.jsx';
import DoctorDashboard from '../pages/DoctorDashboard.jsx';
import PacienteDashboard from '../pages/PacienteDashboard.jsx';
import NotFound from '../pages/NotFound.jsx';
import DoctorPatients from '../pages/DoctorPatients.jsx';
import DoctorPrescriptions from '../pages/DoctorPrescriptions.jsx';
import PatientPrescriptions from '../pages/PatientPrescriptions.jsx';
import PatientPrescriptionDetail from '../pages/PatientPrescriptionDetail.jsx';
import PatientCalendar from '../pages/PatientCalendar.jsx';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Privadas por rol */}
          <Route
            path="/doctor"
            element={
              <RoleRoute allowedRole="doctor">
                <DoctorDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/doctor/pacientes"
            element={
              <RoleRoute allowedRole="doctor">
                <DoctorPatients />
              </RoleRoute>
            }
          />
          <Route
            path="/doctor/pacientes/:patientUid/recetas"
            element={
              <RoleRoute allowedRole="doctor">
                <DoctorPrescriptions />
              </RoleRoute>
            }
          />
          <Route
            path="/paciente"
            element={
              <RoleRoute allowedRole="patient">
                <PacienteDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/paciente/autorizar"
            element={
              <RoleRoute allowedRole="patient">
                <AuthorizeDoctor />
              </RoleRoute>
            }
          />
          <Route
            path="/paciente/recetas"
            element={
              <RoleRoute allowedRole="patient">
                <PatientPrescriptions />
              </RoleRoute>
            }
          />
          <Route
            path="/paciente/recetas/:id"
            element={
              <RoleRoute allowedRole="patient">
                <PatientPrescriptionDetail />
              </RoleRoute>
            }
          />
          <Route
            path="/paciente/calendario"
            element={
              <RoleRoute allowedRole="patient">
                <PatientCalendar />
              </RoleRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
