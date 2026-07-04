import { useState, useEffect } from "react";
import { MapPin, Filter, Grid, Map as MapIcon } from "lucide-react";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { fetchApi } from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

// Fix default Leaflet icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

export function ExploreReports() {
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const [reports, setReports] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    category: "all",
    severity: "all",
    status: "all",
  });

  useEffect(() => {
    fetchApi('/reports')
        .then(data => setReports(data))
        .catch(err => console.error("Error fetching reports:", err));
  }, []);

  const categories = ["All", "Road Damage", "Lighting Issue", "Water Leak", "Trash Collection", "Parks & Recreation", "Traffic Lights", "Sidewalk Repair", "Other"];
  const severities = ["All", "Low", "Medium", "High", "Critical"];
  const statuses = ["All", "Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];

  const filteredReports = reports.filter((report) => {
    if (filters.category !== "all" && report.category !== filters.category) return false;
    if (filters.severity !== "all" && report.severity !== filters.severity.toLowerCase()) return false;
    if (filters.status !== "all" && report.status !== filters.status.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen py-12">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">Explore Reports</h1>
          <p className="text-lg text-slate-600 font-medium">Browse community-reported issues in your area</p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp}>
          <Card className="p-8 mb-8 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Filter size={20} className="text-indigo-600" />
              </div>
              <h2 className="font-bold text-slate-900">Filters</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === "map" ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <MapIcon size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-semibold text-slate-900 mb-3">Category</label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === "All" ? "all" : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-3">Severity</label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              >
                {severities.map((sev) => (
                  <option key={sev} value={sev === "All" ? "all" : sev}>
                    {sev}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-3">Status</label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                {statuses.map((stat) => (
                  <option key={stat} value={stat === "All" ? "all" : stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          </Card>
        </motion.div>

        {/* Results */}
        {viewMode === "list" ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <motion.div key={report.id} variants={fadeInUp}>
                <Card className="p-6 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-slate-900">{report.title}</h3>
                  <StatusBadge status={report.status} />
                </div>

                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{report.description}</p>

                <div className="flex items-center text-sm text-slate-500 mb-4">
                  <MapPin size={16} className="mr-2 text-indigo-600" />
                  {report.location_text || report.location}
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {report.category}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    report.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                    report.severity === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">ID: {report.id} • {report.created_at ? new Date(report.created_at).toLocaleDateString() : report.date}</p>
                </div>
              </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp}>
            <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
            <div className="h-[500px] w-full bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 rounded-xl overflow-hidden relative border-2 border-slate-200">
              <MapContainer center={[51.505, -0.09]} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredReports.filter(r => r.lat && r.lng).map((report) => (
                  <Marker key={report.id} position={[report.lat, report.lng]}>
                    <Popup>
                      <div className="p-1">
                        <h4 className="font-bold mb-1">{report.title}</h4>
                        <p className="text-xs text-slate-600 mb-2">{report.category}</p>
                        <StatusBadge status={report.status} />
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            </Card>
          </motion.div>
        )}

        {filteredReports.length === 0 && (
          <motion.div variants={fadeInUp}>
            <Card className="p-12 text-center border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/90">
            <p className="text-slate-500 text-lg mb-4">No reports found matching your filters.</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setFilters({ category: "all", severity: "all", status: "all" })}
            >
              Clear Filters
            </Button>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>      
  );
}
