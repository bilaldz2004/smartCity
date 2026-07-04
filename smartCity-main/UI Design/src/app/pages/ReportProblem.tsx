import { useState } from "react";
import { MapPin, Upload, X, AlertCircle, Sparkles, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLng } from "leaflet";
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

// Fix Leaflet icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AiResult {
  detected: boolean;
  category: string | null;
  severity: string | null;
  confidence: number | null;
  model_used: string | null;
  class_detected: string | null;
  message?: string;
}

type AiState = "idle" | "analyzing" | "done" | "error";

// ─── Sub-components ───────────────────────────────────────────────────────────

function LocationMarker({
  position,
  setPosition,
}: {
  position: LatLng | null;
  setPosition: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

/** Inline AI status strip shown under the severity/category selects */
function AiStatusStrip({
  state,
  result,
  onRetry,
}: {
  state: AiState;
  result: AiResult | null;
  onRetry: () => void;
}) {
  if (state === "idle") return null;

  if (state === "analyzing") {
    return (
      <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl w-fit animate-pulse">
        <Loader2 size={13} className="animate-spin text-indigo-500" />
        <span className="text-xs font-bold text-indigo-600">AI is analyzing your image…</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl w-fit">
        <AlertCircle size={13} className="text-red-500 shrink-0" />
        <span className="text-xs font-bold text-red-600">AI service offline — fill manually</span>
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold transition-colors underline"
        >
          <RefreshCw size={11} />
          Retry
        </button>
      </div>
    );
  }

  if (state === "done" && result) {
    if (result.detected) {
      return (
        <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl w-fit">
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-emerald-700">
            AI: {result.class_detected ?? result.category} · {result.confidence}% via {result.model_used}
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="ml-1 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-bold transition-colors"
            title="Re-analyze"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl w-fit">
        <AlertCircle size={13} className="text-amber-500 shrink-0" />
        <span className="text-xs font-bold text-amber-700">No match detected — fill manually</span>
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-bold transition-colors underline"
        >
          <RefreshCw size={11} />
          Retry
        </button>
      </div>
    );
  }

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReportProblem() {
  const { isAuthenticated } = useAuth();
  const isAuth = isAuthenticated();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);

  // ── AI state ────────────────────────────────────────────────────────────────
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  // Track which fields were auto-filled so we can highlight them
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    category: "",
    severity: "",
    description: "",
    location: "",
    title: "",
  });

  const categories = [
    "Road Damage",
    "Lighting Issue",
    "Water Leak",
    "Trash Collection",
    "Parks & Recreation",
    "Traffic Lights",
    "Sidewalk Repair",
    "Other",
  ];

  const severities = [
    { value: "low",    label: "🟢 Low — Minor issue, no immediate hazard" },
    { value: "medium", label: "🟡 Medium — Noticeable, needs attention soon" },
    { value: "high",   label: "🔴 High — Urgent, poses safety risk" },
  ];

  // ─── AI Analysis ────────────────────────────────────────────────────────────

  const analyzeImage = async (file: File) => {
    setAiState("analyzing");
    setAiResult(null);
    setAiFilledFields(new Set());

    try {
      const data = new FormData();
      data.append("image", file);

      const result: AiResult = await fetchApi("/analyze-image", {
        method: "POST",
        body: data,
      });

      setAiResult(result);
      setAiState("done");

      if (result.detected) {
        const filled = new Set<string>();

        // Auto-fill category if not already set by user
        if (result.category && categories.includes(result.category)) {
          setFormData((prev) => {
            filled.add("category");
            return { ...prev, category: result.category! };
          });
        }

        // Auto-fill severity
        if (result.severity) {
          setFormData((prev) => {
            filled.add("severity");
            return { ...prev, severity: result.severity! };
          });
        }

        setAiFilledFields(filled);
      }
    } catch {
      // AI service offline or network error
      setAiState("error");
      setAiResult(null);
    }
  };

  const handleRetryAnalysis = () => {
    if (imageFile) {
      analyzeImage(imageFile);
    }
  };

  // ─── Image Upload ────────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Trigger AI analysis immediately after upload
    analyzeImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAiResult(null);
    setAiState("idle");
    setAiFilledFields(new Set());
    setFormData((prev) => ({ ...prev, category: "", severity: "" }));
  };

  // ─── Field change (clears AI highlight for that field) ─────────────────────

  const handleFieldChange = (field: "category" | "severity", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setAiFilledFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!position) {
      alert("Please select a location on the map.");
      return;
    }

    if (!formData.category || !formData.description || !imageFile) {
      alert("Please fill all required fields and upload an image.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("severity", formData.severity || "low");
      data.append("description", formData.description);
      data.append(
        "location_text",
        formData.location || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
      );
      data.append("title", formData.title || `${formData.category} Issue`);
      data.append("lat", position.lat.toString());
      data.append("lng", position.lng.toString());
      if (imageFile) data.append("image", imageFile);

      await fetchApi("/reports", { method: "POST", body: data });

      alert("Report submitted successfully!");
      navigate("/explore");
    } catch (err: any) {
      alert(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  // ── Derived helpers ─────────────────────────────────────────────────────────

  const isAnalyzing = aiState === "analyzing";

  /** Border style for AI-filled selects */
  const aiFieldClass = (field: string) =>
    aiFilledFields.has(field)
      ? "border-emerald-400 ring-4 ring-emerald-500/20 focus:border-emerald-500"
      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20";

  // ─── Auth Guard ──────────────────────────────────────────────────────────────

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-10 text-center border-slate-200 shadow-2xl shadow-slate-300/50 backdrop-blur-sm bg-white/90">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Required</h2>
            <p className="text-slate-600 mb-6">
              You need to be logged in to submit a report. Please sign in or create an account to continue.
            </p>
          </div>
          <div className="space-y-3">
            <Link to="/login">
              <Button className="w-full" size="lg">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" className="w-full" size="lg">Create Account</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
            Report a Problem
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Help us improve your city by reporting urban issues
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">

            {/* ── Map Location ── */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8 border-slate-200 shadow-2xl shadow-slate-200/40 backdrop-blur-md bg-white/90 hover:shadow-indigo-100/50 transition-all duration-500">
              <label className="block text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <MapPin className="text-indigo-600" size={24} />
                </div>
                Detailed Location <span className="text-red-500">*</span>
              </label>

              <div className="mb-6 h-[450px] rounded-2xl overflow-hidden relative border-2 border-slate-200 shadow-inner group">
                <MapContainer
                  center={[36.7538, 3.0588]}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>

                <div className="absolute top-4 right-4 z-[1000] transform transition-transform group-hover:scale-105">
                  <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/20">
                    <p className="text-xs text-white font-bold tracking-wider uppercase opacity-90">Interactive Map</p>
                    <p className="text-[10px] text-slate-300 mt-1 font-medium italic">Click to pinpoint the exact issue location</p>
                  </div>
                </div>

                {position && (
                  <div className="absolute bottom-4 left-4 z-[1000]">
                    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl px-4 py-2 border border-slate-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-700">Location Locked</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <input
                  type="text"
                  placeholder="Street address, neighborhood, or landmarks (optional)"
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-sm transition-all duration-300 font-medium placeholder:text-slate-400"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors">
                  <MapPin size={20} />
                </div>
              </div>
            </Card>
            </motion.div>

            {/* ── Image Upload ── */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8 border-slate-200 shadow-2xl shadow-slate-200/40 backdrop-blur-md bg-white/90 hover:shadow-indigo-100/50 transition-all duration-500">
              <label className="block text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Upload className="text-indigo-600" size={24} />
                </div>
                Visual Evidence <span className="text-red-500">*</span>
              </label>

              {selectedImage ? (
                <div className="space-y-3">
                  <div className="relative group overflow-hidden rounded-2xl">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-80 object-cover rounded-2xl shadow-xl border-2 border-slate-100 transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* AI Analyzing overlay */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10">
                        <Loader2 className="text-white animate-spin mb-3" size={36} />
                        <p className="text-white font-bold text-sm">Analyzing with AI…</p>
                        <p className="text-slate-300 text-xs mt-1">Running  detection model in parallel</p>
                      </div>
                    )}

                    {/* AI done overlay badge */} 
                    {!isAnalyzing && aiResult && (
                      <div className={`absolute top-4 left-4 z-10 px-3 py-2 rounded-xl backdrop-blur-md border flex items-center gap-2 ${
                        aiResult.detected
                          ? "bg-emerald-600/90 border-emerald-400 text-white"
                          : "bg-amber-500/80 border-amber-400 text-white"
                      }`}>
                        {aiResult.detected ? <Sparkles size={13} /> : <AlertCircle size={13} />}
                        <span className="text-xs font-bold">
                          {aiResult.detected
                            ? `AI: ${aiResult.category} · ${aiResult.confidence}%`
                            : "No match — fill manually"}
                        </span>
                      </div>
                    )}

                    {/* Error badge */}
                    {!isAnalyzing && aiState === "error" && (
                      <div className="absolute top-4 left-4 z-10 px-3 py-2 rounded-xl backdrop-blur-md border bg-red-600/90 border-red-400 text-white flex items-center gap-2">
                        <AlertCircle size={13} />
                        <span className="text-xs font-bold">AI offline</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-red-50"
                      >
                        Remove Photo
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-lg hover:bg-white shadow-lg transition-all z-10"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-3 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 hover:shadow-inner transition-all duration-500 group cursor-pointer relative overflow-hidden"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Upload className="text-indigo-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Upload visual evidence</h3>
                    <p className="text-slate-500 mb-3 max-w-xs mx-auto font-medium leading-relaxed">
                      High-quality photos help us process your report faster.
                    </p>
                    {/* AI hint */}
                    <div className="flex items-center justify-center gap-2 mb-6 text-indigo-500">
                      <Sparkles size={14} />
                      <span className="text-xs font-bold">AI will auto-detect category &amp; severity</span>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-white rounded-xl shadow-md border border-slate-100 text-xs font-bold text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      Select File
                    </div>
                  </div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </Card>
            </motion.div>

            {/* ── Category & Severity ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Category */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 h-full border-slate-200 shadow-2xl shadow-slate-200/40 backdrop-blur-md bg-white/90">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Problem Category <span className="text-red-500">*</span>
                </label>

                {/* AI highlight label */}
                {aiFilledFields.has("category") && (
                  <p className="text-[11px] font-bold text-emerald-600 mb-3 flex items-center gap-1">
                    <Sparkles size={11} /> Auto-filled by AI
                  </p>
                )}
                {!aiFilledFields.has("category") && <div className="mb-4" />}

                <div className="relative">
                  <select
                    id="category-select"
                    className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 bg-white shadow-sm transition-all duration-300 font-bold text-slate-900 appearance-none cursor-pointer ${aiFieldClass("category")}`}
                    value={formData.category}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <AiStatusStrip state={aiState} result={aiResult} onRetry={handleRetryAnalysis} />
              </Card>
              </motion.div>

              {/* Severity */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 h-full border-slate-200 shadow-2xl shadow-slate-200/40 backdrop-blur-md bg-white/90">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Severity Level <span className="text-red-500">*</span>
                </label>

                {/* AI highlight label */}
                {aiFilledFields.has("severity") && (
                  <p className="text-[11px] font-bold text-emerald-600 mb-3 flex items-center gap-1">
                    <Sparkles size={11} /> Auto-filled by AI
                  </p>
                )}
                {!aiFilledFields.has("severity") && <div className="mb-4" />}

                <div className="relative">
                  <select
                    id="severity-select"
                    className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 bg-white shadow-sm transition-all duration-300 font-bold text-slate-900 appearance-none cursor-pointer ${aiFieldClass("severity")}`}
                    value={formData.severity}
                    onChange={(e) => handleFieldChange("severity", e.target.value)}
                    required
                  >
                    <option value="">Select Severity</option>
                    {severities.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </Card>
              </motion.div>
            </div>

            {/* ── Report Title ── */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8 border-slate-200 shadow-2xl shadow-slate-200/40 backdrop-blur-md bg-white/90">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Report Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Deep pothole near intersection"
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-sm transition-all duration-300 font-bold text-slate-900 placeholder:font-normal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Card>
            </motion.div>

            {/* ── Description ── */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8 border-slate-200 shadow-2xl shadow-slate-200/40 backdrop-blur-md bg-white/90">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Please provide details about the severity, length of time the problem has existed, and any immediate hazards."
                className="w-full px-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-sm transition-all duration-300 font-medium text-slate-700 resize-none leading-relaxed"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <div className="mt-4 flex items-center gap-2 text-indigo-500 italic">
                <AlertCircle size={16} />
                <span className="text-xs font-bold">Maintenance agents read these descriptions first to prioritize repairs.</span>
              </div>
            </Card>
            </motion.div>

            {/* ── Submit ── */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-end items-center gap-6 pt-4 pb-20">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-slate-500 hover:text-slate-900 font-bold transition-colors px-6"
              >
                Cancel Report
              </button>
              <Button
                type="submit"
                disabled={loading || isAnalyzing}
                className="w-full sm:w-auto px-12 py-5 text-lg font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 rounded-2xl shadow-2xl shadow-indigo-900/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting…
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    AI Analyzing…
                  </>
                ) : (
                  "Submit Official Report"
                )}
              </Button>
            </motion.div>

          </div>
        </form>
      </motion.div>
    </div>
  );
}