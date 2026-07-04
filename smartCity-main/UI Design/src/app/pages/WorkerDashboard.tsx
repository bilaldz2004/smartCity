import { useState, useEffect } from "react";
import { Wrench, Clock, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";
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

export function WorkerDashboard() {
  const { user, isAuthenticated, hasRole } = useAuth();
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated() && hasRole('worker')) {
      fetchApi('/reports').then(setReports).catch(console.error);
    }
  }, [isAuthenticated, hasRole]);

  // Redirect if not authenticated or not a worker
  if (!isAuthenticated() || !hasRole('worker')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-10 text-center border-slate-200 shadow-2xl shadow-slate-300/50 backdrop-blur-sm bg-white/90">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Denied</h2>
            <p className="text-slate-600 mb-6">
              You don't have worker privileges to access this dashboard.
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

  const assignedCount = reports.filter((r) => r.status === "assigned").length;
  const inProgressCount = reports.filter((r) => r.status === "in progress").length;
  const completedCount = reports.filter((r) => r.status === "resolved").length;
  const highPriorityCount = reports.filter((r) => r.severity === "high" || r.severity === "critical").length;

  const stats = [
    { label: "Assigned to Me", value: assignedCount.toString(), icon: <Wrench size={24} />, color: "bg-blue-100 text-blue-600" },
    { label: "In Progress", value: inProgressCount.toString(), icon: <Clock size={24} />, color: "bg-orange-100 text-orange-600" },
    { label: "Completed", value: completedCount.toString(), icon: <CheckCircle size={24} />, color: "bg-green-100 text-green-600" },
    { label: "High Priority", value: highPriorityCount.toString(), icon: <AlertTriangle size={24} />, color: "bg-red-100 text-red-600" },
  ];

  /* Assigned Reports: For now, we take all reports that are either assigned or in progress or submitted to show some data */
  const assignedReports = reports.filter(r => r.status !== 'resolved').slice(0, 5);

  const handleStatusUpdate = (reportId, newStatus) => {
    alert(`Report ${reportId} updated to: ${newStatus}`);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen py-12">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">Worker Dashboard</h1>
          <p className="text-lg text-slate-600 font-medium">Manage your assigned work orders</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Reports List */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="lg:col-span-2 space-y-4">
            <motion.h2 variants={fadeInUp} className="font-bold text-slate-900 mb-6">My Assigned Reports</motion.h2>

            {assignedReports.map((report) => (
              <motion.div key={report.id} variants={fadeInUp}>
              <Card
                key={report.id}
                className={`p-6 cursor-pointer border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 ${
                  selectedReport?.id === report.id ? "ring-2 ring-indigo-500" : ""
                }`}
                onClick={() => setSelectedReport(report)}
              >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>ID: {report.id}</span>
                    <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <StatusBadge status={report.status} />
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    report.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-sm text-gray-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {report.category}
                  </span>
                  <span className="ml-2">{report.location_text}</span>
                </div>
                <div className="flex space-x-2">
                  {report.status === "assigned" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(report.id, "In Progress");
                      }}
                    >
                      Start Work
                    </Button>
                  )}
                  {report.status === "in progress" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(report.id, "Resolved");
                      }}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
              </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Report Details Panel */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            {selectedReport ? (
              <Card className="p-6 sticky top-24 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
                <h3 className="font-bold text-slate-900 mb-6">Work Order Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Work Order ID</p>
                  <p className="font-mono text-sm font-semibold">{selectedReport.id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Status</p>
                  <StatusBadge status={selectedReport.status} />
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedReport.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    selectedReport.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    selectedReport.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {selectedReport.severity.charAt(0).toUpperCase() + selectedReport.severity.slice(1)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium">{selectedReport.category}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-sm">{selectedReport.location_text}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{selectedReport.description}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned Date</p>
                  <p className="text-sm">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-900 mb-3">Update Status</p>
                  <div className="space-y-2">
                    {selectedReport.status === "assigned" && (
                      <Button
                        className="w-full"
                        onClick={() => handleStatusUpdate(selectedReport.id, "In Progress")}
                      >
                        Start Work
                      </Button>
                    )}
                    {selectedReport.status === "in progress" && (
                      <>
                        <Button
                          className="w-full"
                          onClick={() => handleStatusUpdate(selectedReport.id, "Resolved")}
                        >
                          Mark as Complete
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => handleStatusUpdate(selectedReport.id, "Needs More Info")}
                        >
                          Request More Info
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Add Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Add notes about the work..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <Button size="sm" className="mt-2 w-full">
                    Add Comment
                  </Button>
                </div>
              </div>
            </Card>
            ) : (
              <Card className="p-10 text-center border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
                <Wrench className="mx-auto text-slate-400 mb-4" size={56} />
                <p className="text-slate-500 font-medium">Select a work order to view details</p>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
