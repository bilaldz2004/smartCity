import { useState, useEffect } from "react";
import { Eye, MapPin, Calendar, Hash, AlertCircle } from "lucide-react";
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

export function MyReports() {
  const { user, isAuthenticated } = useAuth();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated() && user?.id) {
      fetchApi(`/reports?user_id=${user.id}`)
        .then(data => {
            setReports(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    } else {
        setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Check authentication
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-10 text-center border-slate-200 shadow-2xl shadow-slate-300/50 backdrop-blur-sm bg-white/90">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Required</h2>
            <p className="text-slate-600 mb-6">
              You need to be logged in to view your reports. Please sign in or create an account to continue.
            </p>
          </div>
          <div className="space-y-3">
            <Link to="/login">
              <Button className="w-full" size="lg">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" className="w-full" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen py-12">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">My Reports</h1>
          <p className="text-lg text-slate-600 font-medium">Track the status of your submitted reports</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="lg:col-span-2 space-y-4">
            {!Array.isArray(reports) || reports.length === 0 ? (
              <motion.div variants={fadeInUp}>
              <Card className="p-12 text-center border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-slate-400" size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No reports found</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                  You haven't submitted any reports yet. Help improve your city by reporting an issue.
                </p>
                <Link to="/report">
                  <Button size="lg" className="bg-gradient-to-r from-slate-900 to-indigo-900">
                    Report a Problem
                  </Button>
                </Link>
              </Card>
              </motion.div>
            ) : (
              reports.map((report) => (
                <motion.div key={report.id} variants={fadeInUp}>
                <Card
                  key={report.id}
                  className={`p-6 cursor-pointer border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 ${
                    selectedReport?.id === report.id ? "ring-2 ring-indigo-500" : ""
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">{report.title}</h3>
                      <div className="flex items-center text-sm text-slate-500 space-x-4">
                        <span className="flex items-center font-medium">
                          <Hash size={14} className="mr-1" />
                          {report.id}
                        </span>
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>

                  <div className="flex items-center text-sm text-slate-600 mb-4">
                    <MapPin size={16} className="mr-2 text-indigo-600" />
                    {report.location_text}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {report.category}
                    </span>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center">
                      View Details
                      <Eye size={16} className="ml-1" />
                    </button>
                  </div>
                </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Report Details Panel */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            {selectedReport ? (
              <Card className="p-6 sticky top-24 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
                <h3 className="font-bold text-slate-900 mb-6 font-display">Report Details</h3>

              <div className="space-y-5">
                <div>
                  <p className="text-sm text-slate-500 mb-2 font-medium">Tracking ID</p>
                  <p className="font-mono text-sm font-bold text-slate-900">{selectedReport.id}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2 font-medium">Status</p>
                  <StatusBadge status={selectedReport.status} />
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2 font-medium">Category</p>
                  <p className="font-semibold text-slate-900">{selectedReport.category}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2 font-medium">Severity</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedReport.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                    selectedReport.severity === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    selectedReport.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {selectedReport.severity ? selectedReport.severity.charAt(0).toUpperCase() + selectedReport.severity.slice(1) : 'Low'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2 font-medium">Location</p>
                  <p className="text-sm text-slate-700">{selectedReport.location_text}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2 font-medium">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedReport.description}</p>
                </div>

                {selectedReport.timeline && (
                  <div className="pt-5 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-5 font-medium">Timeline</p>
                    <div className="space-y-4">
                      {selectedReport.timeline.map((event: any, index: number) => (
                        <div key={index} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              index === selectedReport.timeline.length - 1
                                ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/50"
                                : "bg-white border-slate-300"
                            }`}></div>
                            {index < selectedReport.timeline.length - 1 && (
                              <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-5">
                            <p className="font-semibold text-slate-900 mb-1">{event.status}</p>
                            <p className="text-xs text-slate-500 font-medium mb-1">{event.date}</p>
                            {event.note && (
                              <p className="text-xs text-slate-600 mt-2 bg-slate-50 rounded-lg p-2 border border-slate-200">{event.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
            ) : (
              <Card className="p-10 text-center border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
                <Eye className="mx-auto text-slate-400 mb-4" size={56} />
                <p className="text-slate-500 font-medium font-display">Select a report to view details</p>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
