import { useState, useEffect } from "react";
import { Users, AlertCircle, CheckCircle, Clock, TrendingUp, UserPlus, Trash2, X, Shield, HardHat, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";
import { fetchApi, createStaffUser, fetchStaffUsers, deleteStaffUser } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
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

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } }
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// ─── Add Staff Modal ─────────────────────────────────────────────────────────

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "worker";
  created_at: string;
}

interface AddStaffModalProps {
  onClose: () => void;
  onSuccess: (user: StaffUser) => void;
}

function AddStaffModal({ onClose, onSuccess }: AddStaffModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "worker" as "admin" | "worker",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await createStaffUser(formData);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-900/30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-7 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <UserPlus size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add Staff Member</h2>
                <p className="text-blue-200 text-sm mt-0.5">Create an Admin or City Worker account</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Role selector — shown prominently at the top */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "worker" })}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-sm ${
                      formData.role === "worker"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <HardHat size={18} />
                    City Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "admin" })}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-sm ${
                      formData.role === "admin"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Shield size={18} />
                    Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="staff@urbanfix.city"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold text-sm hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-900/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { user, isAuthenticated, hasRole } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"reports" | "users">("reports");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated() && hasRole('admin')) {
      fetchApi('/reports').then(setReports).catch(console.error);
      fetchStaffUsers().then(setStaffUsers).catch(console.error);
    }
  }, [isAuthenticated, hasRole]);

  // Redirect if not authenticated or not an admin
  if (!isAuthenticated() || !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-10 text-center border-slate-200 shadow-2xl shadow-slate-300/50 backdrop-blur-sm bg-white/90">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Denied</h2>
            <p className="text-slate-600 mb-6">
              You don't have admin privileges to access this dashboard.
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

  const totalCount = reports.length;
  const activeCount = reports.filter(r => r.status === 'in progress' || r.status === 'assigned').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  const stats = [
    { label: "Total Reports", value: totalCount.toString(), icon: <AlertCircle size={24} />, color: "bg-blue-100 text-blue-600", change: "" },
    { label: "Active Reports", value: activeCount.toString(), icon: <TrendingUp size={24} />, color: "bg-orange-100 text-orange-600", change: "" },
    { label: "Resolved This Month", value: resolvedCount.toString(), icon: <CheckCircle size={24} />, color: "bg-green-100 text-green-600", change: "" },
    { label: "Avg. Response Time", value: "2.4 days", icon: <Clock size={24} />, color: "bg-purple-100 text-purple-600", change: "" },
  ];

  const categoryStatsMap: any = {};
  reports.forEach(r => {
    if (!categoryStatsMap[r.category]) {
      categoryStatsMap[r.category] = { category: r.category, count: 0, resolved: 0 };
    }
    categoryStatsMap[r.category].count++;
    if (r.status === 'resolved') categoryStatsMap[r.category].resolved++;
  });
  const categoryStats: any[] = Object.values(categoryStatsMap);

  const departments = ["Unassigned", "Road Maintenance", "Lighting Services", "Water Works", "Sanitation", "Parks Dept", "Traffic Control", "Maintenance"];

  const handleStaffCreated = (newUser: StaffUser) => {
    setStaffUsers(prev => [newUser, ...prev]);
    setShowAddModal(false);
    setSuccessMessage(`✓ ${newUser.name} (${newUser.role === 'admin' ? 'Admin' : 'City Worker'}) was created successfully!`);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleDeleteStaff = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteStaffUser(id);
      setStaffUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const roleLabel = (role: string) =>
    role === "admin" ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
        <Shield size={11} /> Admin
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
        <HardHat size={11} /> City Worker
      </span>
    );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen py-12">
      {/* Add Staff Modal */}
      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleStaffCreated}
        />
      )}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
            <p className="text-lg text-slate-600 font-medium">Manage city reports and staff accounts</p>
          </div>
          <button
            id="add-staff-btn"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold text-sm hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all shadow-xl shadow-indigo-900/30 hover:shadow-2xl hover:shadow-indigo-900/40 hover:-translate-y-0.5 active:translate-y-0 self-start sm:self-auto"
          >
            <UserPlus size={18} />
            Add Staff Member
          </button>
        </motion.div>

        {/* Success Banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6"
            >
              <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                {successMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
                {stat.change && (
                  <span className={`text-sm font-bold px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent mb-1">{stat.value}</p>
              <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Category Analytics */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Card className="p-8 h-full border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
              <h2 className="font-bold text-slate-900 mb-8">Reports by Category</h2>
              <div className="space-y-6">
                {categoryStats.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-700">{item.category}</span>
                      <span className="text-sm text-slate-500 font-medium">
                        {item.resolved}/{item.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 h-3 rounded-full shadow-lg"
                        style={{ width: `${(item.resolved / item.count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={fadeInUp}>
            <Card className="p-8 h-full border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
              <h2 className="font-bold text-slate-900 mb-8">Quick Stats</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="text-sm text-slate-600 font-medium">Active Citizens</span>
                  <span className="font-bold text-slate-900">8,920</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="text-sm text-slate-600 font-medium">Departments</span>
                  <span className="font-bold text-slate-900">12</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="text-sm text-slate-600 font-medium">City Workers</span>
                  <span className="font-bold text-slate-900">{staffUsers.filter(u => u.role === 'worker').length}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="text-sm text-slate-600 font-medium">Admins</span>
                  <span className="font-bold text-slate-900">{staffUsers.filter(u => u.role === 'admin').length}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-600 font-medium">Resolution Rate</span>
                  <span className="font-bold text-green-600">94%</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.div variants={fadeInUp} className="mb-6">
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 w-fit">
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "reports"
                  ? "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users size={15} />
              Staff Management
              {staffUsers.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "users" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"
                }`}>{staffUsers.length}</span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Reports Table */}
        {activeTab === "reports" && (
          <motion.div variants={fadeInUp}>
            <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-slate-900">All Reports</h2>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  />
                  <Button variant="secondary">
                    <Users size={16} className="mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-mono">{report.id}</td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{report.title}</p>
                            <p className="text-sm text-gray-500">{report.location_text}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {report.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{report.department || "Unassigned"}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <select
                            className="text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                            defaultValue=""
                          >
                            <option value="" disabled>Assign...</option>
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Staff Management Table */}
        {activeTab === "users" && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-bold text-slate-900">Staff Members</h2>
                  <p className="text-sm text-slate-500 mt-1">Admins and City Workers only — citizens are not shown here</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold text-sm hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-900/20"
                >
                  <UserPlus size={16} />
                  Add Member
                </button>
              </div>

              {staffUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users size={28} className="text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-700 mb-1">No staff members yet</p>
                  <p className="text-sm text-slate-500 mb-6">Add your first admin or city worker to get started.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-semibold text-sm hover:border-indigo-400 hover:text-indigo-600 transition-all"
                  >
                    <UserPlus size={16} />
                    Add First Staff Member
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Added</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {staffUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${u.role === 'admin' ? 'bg-purple-100' : 'bg-indigo-100'}`}>
                                {u.role === 'admin' ? <Shield size={16} className="text-purple-600" /> : <HardHat size={16} className="text-indigo-600" />}
                              </div>
                              <span className="font-semibold text-slate-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{u.email}</td>
                          <td className="px-4 py-4">{roleLabel(u.role)}</td>
                          <td className="px-4 py-4 text-sm text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleDeleteStaff(u.id)}
                              disabled={deletingId === u.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all disabled:opacity-50 border border-transparent hover:border-red-200"
                            >
                              {deletingId === u.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
