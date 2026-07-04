import { Link } from "react-router";
import { MapPin, Image, CheckCircle, Users, TrendingUp, Clock } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Variants } from "framer-motion";

// Fix Leaflet icon issue - Fallback icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// NEW: Live Pulse Icon using Tailwind classes inside Leaflet
const pulseIcon = L.divIcon({
  className: "bg-transparent border-none",
  html: `<div class="relative flex h-5 w-5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-5 w-5 bg-indigo-500 border-2 border-white shadow-lg"></span>
        </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export function Home() {
  const categories = [
    { icon: "🚧", name: "Road Damage", count: 234 },
    { icon: "💡", name: "Lighting", count: 156 },
    { icon: "💧", name: "Water Leak", count: 89 },
    { icon: "🗑️", name: "Trash", count: 178 },
    { icon: "🌳", name: "Parks", count: 67 },
    { icon: "🚥", name: "Traffic Lights", count: 45 },
  ];

  const stats = [
    { icon: <CheckCircle className="text-green-600" size={24} />, label: "Reports Resolved", value: "12,345" },
    { icon: <Users className="text-blue-600" size={24} />, label: "Active Citizens", value: "8,920" },
    { icon: <TrendingUp className="text-purple-600" size={24} />, label: "Response Rate", value: "94%" },
    { icon: <Clock className="text-orange-600" size={24} />, label: "Avg. Resolution Time", value: "3.2 days" },
  ];

  return (
    <div className="overflow-hidden bg-slate-50">
      {/* --- HERO SECTION --- */}
      <div className="relative bg-slate-950 text-white min-h-[90vh] flex items-center">
        {/* Dynamic Glassmorphism Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], x: [0, -50, 0], y: [0, 50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-[25rem] h-[25rem] bg-indigo-600/20 rounded-full blur-[100px]"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-full mb-8 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-indigo-200 tracking-wide">Smart City Platform</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                Report Urban Problems{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Easily
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
                Help improve your city by reporting issues like damaged roads, broken streetlights, water leaks, and more. Track your reports and see real-time updates.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <Link to="/report">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.15)] px-8 py-6 text-lg font-semibold rounded-2xl">
                    Report Now
                  </Button>
                </Link>
                <Link to="/explore">
                  <Button size="lg" className="w-full sm:w-auto border-2 border-white/10 text-white bg-white/5 hover:bg-white/10 backdrop-blur-md px-8 py-6 text-lg rounded-2xl transition-all">
                    Explore Reports
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Map Preview - 3D Tilt Effect */}
            <motion.div 
              initial={{ opacity: 0, x: 50, rotateY: 15, rotateX: 5 }}
              animate={{ opacity: 1, x: 0, rotateY: -5, rotateX: 5 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative perspective-1000"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-gpu">
                <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden relative border border-white/5 z-0">
                  <MapContainer
                    center={[36.7538, 3.0588]}
                    zoom={13}
                    zoomControl={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    dragging={false}
                    touchZoom={false}
                    keyboard={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Switched to a sleek dark map tile
                    />
                    <Marker position={[36.7538, 3.0588]} icon={pulseIcon} />
                    <Marker position={[36.76, 3.06]} icon={pulseIcon} />
                    <Marker position={[36.74, 3.04]} icon={pulseIcon} />
                  </MapContainer>
                  {/* Glass overlay gradient */}
                  <div className="absolute inset-0 z-[1000] pointer-events-none bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                </div>
                <div className="flex items-center justify-between mt-4 px-2">
                  <p className="text-sm font-medium text-slate-300 flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                    Live command center
                  </p>
                  <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Updated just now</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- STATS SECTION (Commented out in your original code, kept structure) --- */}
      {/* ... */}

      {/* --- CATEGORIES SECTION (Bento Box Design) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Report Categories</h2>
          <p className="text-lg text-slate-500 font-medium">Select a category to route your report to the right department</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => {
            // Logic to make the Bento Box dynamic (some cards span 2 columns)
            const isLarge = index === 0 || index === 3; 
            
            return (
              <motion.div
                key={index}
                whileHover={{ y: -8, scale: 1.02 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`${isLarge ? 'col-span-2 md:col-span-2' : 'col-span-1 md:col-span-2'} h-full cursor-pointer`}
              >
                <Card className={`h-full p-8 text-left border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-300 bg-white overflow-hidden relative group`}>
                  {/* Decorative background shape on hover */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform origin-left">{category.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{category.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{category.count}</span>
                        <span className="text-sm text-slate-400">active reports</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- HOW IT WORKS (Scroll Storytelling) --- */}
      <div className="bg-slate-950 text-white py-32 relative overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">How It Works</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Three simple steps to make your city better. We handle the routing, you make the impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0"></div>

            {[
              { title: "Report", desc: "Take a photo of the problem, add location and description. Submit your report in seconds.", icon: <MapPin size={32} /> },
              { title: "Assign", desc: "City officials review and automatically assign the report to the relevant department.", icon: <Users size={32} /> },
              { title: "Fix", desc: "City workers resolve the issue. You receive real-time notifications about the progress.", icon: <CheckCircle size={32} /> }
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative z-10"
              >
                <Card className="p-10 text-center border-white/5 shadow-2xl bg-slate-900/50 backdrop-blur-md hover:bg-slate-800/50 transition-colors h-full">
                  <div className="relative inline-flex mb-8">
                    <div className="absolute inset-0 bg-indigo-500 opacity-20 blur-xl rounded-full"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl text-white transform rotate-3">
                      {step.icon}
                    </div>
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-950 text-white border-2 border-indigo-500 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">
                    {step.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden p-16 sm:p-24 bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 text-white text-center border-none shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] rounded-3xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to Make a Difference?</h2>
              <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of citizens helping to improve our city. Your report can make a real impact today.
              </p>
              <Link to="/report">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-2xl px-12 py-6 text-xl font-bold rounded-2xl">
                    Report a Problem Now
                  </Button>
                </motion.div>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}