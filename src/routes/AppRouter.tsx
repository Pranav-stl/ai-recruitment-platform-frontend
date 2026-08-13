import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import {DashboardLayout} from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import {CandidateDashboard} from "../pages/candidate/CandidateDashboard";
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import JobList from "../pages/jobs/JobList";
import JobDetails from "../pages/candidate/JobDetails";
import CreateJob from "../pages/recruiter/CreateJob";
import EditJob from "../pages/recruiter/Editjob";
import ResumeUpload from "../pages/candidate/ResumeUpload";
import ApplicationHistory from "../pages/candidate/ApplicationHistory";
import MatchAnalysis from "../pages/candidate/MatchAnalysis";
import Profile from "../pages/candidate/Profile";
import Settings from "../pages/candidate/Settings";
import ProtectedRoute from "../auth/ProtectedRoute";
import Register from "../pages/auth/Register";
import ApplicantsPage from "../pages/recruiter/ApplicantsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
        </Route>

        {/* Dashboard */}
        <Route element={<DashboardLayout />}>

  <Route
  path="/candidate/dashboard"
  element={
    <ProtectedRoute role="CANDIDATE">
      <CandidateDashboard />
    </ProtectedRoute>
  }
/>

  <Route
  path="/recruiter/dashboard"
  element={
    <ProtectedRoute role="RECRUITER">
      <RecruiterDashboard />
    </ProtectedRoute>
  }
/>

  <Route path="/jobs" element={<JobList />} />
  <Route path="/jobs/:id" element={<JobDetails />} />
  <Route path="/register" element={<Register />} />
  <Route path="/recruiter/jobs/create" element={<CreateJob />} />
  <Route path="/recruiter/jobs/:id/edit" element={<EditJob />} />

  <Route path="/candidate/resume" element={<ResumeUpload />} />
  <Route path="/candidate/applications" element={<ApplicationHistory />} />
  <Route
  path="/candidate/match-analysis/:applicationId"
  element={<MatchAnalysis />}
/>
<Route
  path="/recruiter/applicants"
  element={
    <ProtectedRoute role="RECRUITER">
      <ApplicantsPage />
    </ProtectedRoute>
  }
/>
  <Route path="/candidate/profile" element={<Profile />} />
  <Route path="/candidate/settings" element={<Settings />} />

</Route>
      </Routes>
    </BrowserRouter>
  );
}