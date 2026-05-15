import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout.jsx';
import RoleRoute from './RoleRoute.jsx';
import AuthorizeDoctor from '../pages/AuthorizeDoctor.jsx';
import Login from '../pages/Login.jsx';
import Registro from '../pages/Registro.jsx';
import DoctorDashboard from '../pages/DoctorDashboard.jsx';
import PacienteDashboard from '../pages/PacienteDashboard.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import NotFound from '../pages/NotFound.jsx';
import DoctorPatients from '../pages/DoctorPatients.jsx';
import DoctorPrescriptions from '../pages/DoctorPrescriptions.jsx';
import DoctorAppointments from '../pages/DoctorAppointments.jsx';
import DoctorExamOrders from "../pages/DoctorExamOrders.jsx";
import PatientPrescriptions from '../pages/PatientPrescriptions.jsx';
import PatientPrescriptionDetail from '../pages/PatientPrescriptionDetail.jsx';
import PatientAppointments from "../pages/PatientAppointments.jsx";
import PatientExamOrders from "../pages/PatientExamOrders.jsx";
import PatientCalendar from '../pages/PatientCalendar.jsx';
import ManageDoctors from '../pages/ManageDoctors.jsx';
import ManageSites from '../pages/ManageSites.jsx';


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
            path="/admin"
            element={
              <RoleRoute allowedRole="admin">
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/managedoctors"
            element={
              <RoleRoute allowedRole="admin">
                <ManageDoctors />
              </RoleRoute>
            }
          />
          <Route
            path="/managesites"
            element={
              <RoleRoute allowedRole="admin">
                <ManageSites />
              </RoleRoute>
            }
          />
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
            path="/doctor/pacientes/:patientUid/ordenes"
            element={
              <RoleRoute allowedRole="doctor">
                <DoctorExamOrders />
              </RoleRoute>
            }
          />
          <Route
            path="/doctor/pacientes/:patientUid/citas"
            element={
              <RoleRoute allowedRole="doctor">
                <DoctorAppointments />
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
            path="/paciente/citas"
            element={
              <RoleRoute allowedRole="patient">
                <PatientAppointments />
              </RoleRoute>
            }
          />
          <Route
            path="/paciente/ordenes"
            element={
              <RoleRoute allowedRole="patient">
                <PatientExamOrders />
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
