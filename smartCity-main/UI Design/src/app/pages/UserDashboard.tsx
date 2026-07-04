import { useState, useEffect } from "react";
import { BarChart, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Link } from "react-router";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../services/api";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function UserDashboard() {
  const { user, isAuthenticated, hasRole } = useAuth();

  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated() && hasRole('citizen') && user?.id) {
      fetchApi(`/reports?user_id=${user.id}`).then(setReports).catch(console.error);
    }
  }, [user, isAuthenticated, hasRole]);

  // Redirect if not authenticated or not a citizen
  if (!isAuthenticated() || !hasRole('citizen')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-10 text-center border-slate-200 shadow-2xl shadow-slate-300/50 backdrop-blur-sm bg-white/90">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Denied</h2>
            <p className="text-slate-600 mb-6">
              You don't have permission to access this dashboard.
            </p>
          </div>
          <Link to="/">
            <Button className="w-full" size="lg">
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const inProgressCount = reports.filter((r) => r.status === "in progress" || r.status === "under review" || r.status === "assigned").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const pendingCount = reports.filter((r) => r.status === "submitted").length;

  const stats = [
    { label: "Total Reports", value: reports.length.toString(), icon: <BarChart size={24} />, color: "bg-blue-100 text-blue-600" },
    { label: "In Progress", value: inProgressCount.toString(), icon: <TrendingUp size={24} />, color: "bg-orange-100 text-orange-600" },
    { label: "Resolved", value: resolvedCount.toString(), icon: <CheckCircle size={24} />, color: "bg-green-100 text-green-600" },
    { label: "Pending", value: pendingCount.toString(), icon: <Clock size={24} />, color: "bg-yellow-100 text-yellow-600" },
  ];

  const recentReports = reports.slice(0, 4);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen py-12">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">Citizen Dashboard</h1>
          <p className="text-lg text-slate-600 font-medium">Welcome back, {user?.name || 'Citizen'}</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-medium">{stat.label}</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <Card className="p-8 mb-8 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
            <h2 className="font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/report">
              <Button className="w-full">Report New Problem</Button>
            </Link>
            <Link to="/my-reports">
              <Button variant="secondary" className="w-full">View All Reports</Button>
            </Link>
            <Link to="/explore">
              <Button variant="secondary" className="w-full">Explore Community</Button>
            </Link>
            </div>
          </Card>
        </motion.div>

        {/* Recent Reports */}
        <motion.div variants={fadeInUp}>
          <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
            <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900">Recent Reports</h2>
            <Link to="/my-reports" className="text-sm text-indigo-600 hover:text-indigo-700 font-bold">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">{report.title}</h3>
                  <div className="flex items-center text-sm text-slate-500 space-x-4">
                    <span className="font-medium">ID: {report.id}</span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>
            ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
