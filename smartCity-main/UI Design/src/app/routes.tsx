import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ReportProblem } from "./pages/ReportProblem";
import { ExploreReports } from "./pages/ExploreReports";
import { MyReports } from "./pages/MyReports";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { UserDashboard } from "./pages/UserDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { WorkerDashboard } from "./pages/WorkerDashboard";
import { NotFound } from "./pages/NotFound";
import { HelpCenter } from "./pages/HelpCenter";
import { PrivacyPolicy} from "./pages/PrivacyPolicy";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="report" element={<ReportProblem />} />
        <Route path="explore" element={<ExploreReports />} />
        <Route path="my-reports" element={<MyReports />} />
        {/* Aliases for reports */}
        <Route path="reports" element={<MyReports />} />
        <Route path="myreports" element={<MyReports />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="worker" element={<WorkerDashboard />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Route>
    </Routes>
  );
}
