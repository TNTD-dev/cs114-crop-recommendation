import { useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Leaf, Zap, BarChart2, Users, ChevronDown, Droplets,
  Thermometer, Wind, FlaskConical, Sprout, ArrowRight,
  CheckCircle2, Star, TrendingUp, Beaker
} from "lucide-react";

const npkData = [
  { crop: "Rice", N: 120, P: 55, K: 40 },
  { crop: "Maize", N: 150, P: 70, K: 80 },
  { crop: "Coffee", N: 100, P: 40, K: 100 },
  { crop: "Peanut", N: 25, P: 60, K: 50 },
  { crop: "Cassava", N: 60, P: 30, K: 90 },
];

const rainfallData = [
  { month: "Jan", rainfall: 40, yield: 2.1 },
  { month: "Feb", rainfall: 55, yield: 2.4 },
  { month: "Mar", rainfall: 90, yield: 3.1 },
  { month: "Apr", rainfall: 140, yield: 4.2 },
  { month: "May", rainfall: 180, yield: 5.0 },
  { month: "Jun", rainfall: 220, yield: 5.8 },
  { month: "Jul", rainfall: 200, yield: 5.5 },
  { month: "Aug", rainfall: 170, yield: 5.0 },
  { month: "Sep", rainfall: 130, yield: 4.3 },
  { month: "Oct", rainfall: 80, yield: 3.2 },
  { month: "Nov", rainfall: 50, yield: 2.5 },
  { month: "Dec", rainfall: 35, yield: 2.0 },
];

const clusterData = [
  { temp: 28, humidity: 82, crop: "Rice" },
  { temp: 29, humidity: 78, crop: "Rice" },
  { temp: 27, humidity: 85, crop: "Rice" },
  { temp: 26, humidity: 80, crop: "Rice" },
  { temp: 22, humidity: 55, crop: "Wheat" },
  { temp: 21, humidity: 50, crop: "Wheat" },
  { temp: 23, humidity: 58, crop: "Wheat" },
  { temp: 32, humidity: 65, crop: "Maize" },
  { temp: 31, humidity: 68, crop: "Maize" },
  { temp: 33, humidity: 62, crop: "Maize" },
  { temp: 35, humidity: 40, crop: "Mango" },
  { temp: 36, humidity: 38, crop: "Mango" },
  { temp: 34, humidity: 42, crop: "Mango" },
  { temp: 20, humidity: 70, crop: "Apple" },
  { temp: 19, humidity: 72, crop: "Apple" },
  { temp: 18, humidity: 68, crop: "Apple" },
];

const clusterColors: Record<string, string> = {
  "Rice": "#4CAF50",
  "Wheat": "#82c341",
  "Maize": "#f59e0b",
  "Mango": "#f97316",
  "Apple": "#06b6d4",
};

const ML_MODELS = ["Random Forest", "SVM", "KNN", "Decision Tree"];

const TEAM_MEMBERS = [
  { name: "Alex Nguyen", role: "Lead Data Scientist", initials: "AN" },
  { name: "Sarah Tran", role: "ML Engineer", initials: "ST" },
  { name: "Michael Le", role: "Backend Developer", initials: "ML" },
  { name: "Emily Pham", role: "Frontend Developer", initials: "EP" },
  { name: "David Hoang", role: "Agricultural Expert", initials: "DH" },
  { name: "Lisa Vu", role: "Data Analyst", initials: "LV" },
  { name: "Kevin Dang", role: "UX Designer", initials: "KD" },
];

const CROP_RESULTS: Record<string, { name: string; emoji: string; confidence: number; reason: string }> = {
  "Random Forest": {
    name: "Rice (Oryza sativa)",
    emoji: "🌾",
    confidence: 96,
    reason: "Based on high humidity (82%), adequate rainfall (200mm), and mild temperature (25°C), Random Forest predicts Rice as the optimal choice with a well-suited soil pH level."
  },
  "SVM": {
    name: "Maize (Zea mays)",
    emoji: "🌽",
    confidence: 91,
    reason: "SVM analysis of high Nitrogen content (90 mg/kg) and elevated Potassium alongside warm temperature reveals ideal growing conditions for Maize."
  },
  "KNN": {
    name: "Coffee (Coffea arabica)",
    emoji: "☕",
    confidence: 87,
    reason: "KNN found the 5 most similar soil samples suggest this profile suits Coffee, particularly with a mildly acidic pH (6.2) and consistent rainfall distribution."
  },
  "Decision Tree": {
    name: "Groundnut (Arachis hypogaea)",
    emoji: "🥜",
    confidence: 89,
    reason: "Decision Tree analysis shows that Phosphorus content (55 mg/kg) and well-drained soil conditions create the perfect environment for Groundnut cultivation."
  }
};

function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#4CAF50" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold font-serif text-green-700">{value}%</span>
        <span className="text-xs text-stone-500">Suitability</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("Random Forest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    nitrogen: 90, phosphorus: 55, potassium: 40,
    temperature: 25, humidity: 82, ph: 6.5, rainfall: 200,
  });
  const [predicted, setPredicted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setPredicted(true); }, 1200);
  };

  const currentResult = CROP_RESULTS[selectedModel];

  const handleSliderChange = (key: string, value: number) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setPredicted(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F4] font-sans">

      {/* ============ NAVBAR ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F9F9F4]/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold font-serif text-emerald-950">CropSmart</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "#features" },
              { label: "Explore", href: "#explore" },
              { label: "Predict", href: "#predict" },
              { label: "Team", href: "#team" },
            ].map((link) => (
              <a key={link.label} href={link.href} className="text-sm font-medium text-stone-600 hover:text-green-700 transition-colors">
                {link.label}
              </a>
            ))}
          </div>
          <a href="#predict">
            <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
              Get Started
            </button>
          </a>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden pt-28 pb-24 px-6">

        {/* ── Leaf Watermark ── */}
        <div className="pointer-events-none absolute top-10 right-0 w-[520px] h-[520px] -rotate-12 text-emerald-800 opacity-[0.04]">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 6-3 4-6 4-6S13.5 3 12 2c-3 0-5 2-5 6.5C6 11 7 13 10 13s5-3 5-3C14 13 11 16 8 16H7.13A16.92 16.92 0 0 1 17 8z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <Zap className="w-3.5 h-3.5 text-green-600" strokeWidth={2.5} />
              <span className="text-sm font-semibold text-green-700">AI-Powered Agriculture</span>
            </div>

            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-emerald-950 leading-tight">
              Optimize Your{" "}
              <span className="text-green-600">Agricultural</span>{" "}
              Yield
            </h1>

            <p className="text-lg text-stone-500 leading-relaxed max-w-lg">
              Leverage Machine Learning to analyze soil composition and climate data, delivering the most accurate crop recommendations for your land.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a href="#predict">
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg">
                  <Sprout className="w-4 h-4" />
                  Analyze Now
                </button>
              </a>
              <a href="#explore">
                <button className="flex items-center gap-2 border-2 border-green-600 text-green-700 font-semibold px-7 py-3.5 rounded-2xl hover:bg-green-50 transition-all">
                  View Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </a>
            </div>

            <div className="flex items-center gap-6 pt-2">
              {[
                { label: "Crops Analyzed", value: "22+" },
                { label: "Accuracy Rate", value: "96%" },
                { label: "Farmers Served", value: "5K+" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold font-serif text-emerald-900">{stat.value}</div>
                  <div className="text-xs text-stone-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating Dashboard Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-stone-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Analysis Result</p>
                    <h3 className="text-lg font-bold font-serif text-emerald-950 mt-1">🌾 Rice (Oryza sativa)</h3>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <CircularProgress value={75} size={130} />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Soil Metrics</p>
                  {[
                    { label: "Nitrogen (N)", value: 90, max: 150, color: "#4CAF50" },
                    { label: "Phosphorus (P)", value: 55, max: 150, color: "#82c341" },
                    { label: "Potassium (K)", value: 40, max: 150, color: "#f59e0b" },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-600 font-medium">{metric.label}</span>
                        <span className="text-stone-500">{metric.value} mg/kg</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${(metric.value / metric.max) * 100}%`, backgroundColor: metric.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-3 gap-3">
                  {[
                    { icon: Thermometer, label: "Temperature", value: "25°C" },
                    { icon: Droplets, label: "Humidity", value: "82%" },
                    { icon: Wind, label: "Rainfall", value: "200mm" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1 bg-stone-50 rounded-xl p-2">
                      <item.icon className="w-4 h-4 text-green-600" strokeWidth={1.5} />
                      <span className="text-xs font-semibold text-emerald-900">{item.value}</span>
                      <span className="text-[10px] text-stone-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-green-600 text-white rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span className="text-sm font-bold">96% Accuracy</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white border border-stone-100 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-emerald-900">Random Forest Model</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10" id="features">
          {[
            {
              icon: FlaskConical,
              title: "Soil Analysis",
              desc: "Evaluate 7 critical soil parameters: N, P, K, pH, temperature, humidity, and rainfall for a complete picture.",
              color: "bg-green-50 text-green-600",
            },
            {
              icon: BarChart2,
              title: "4 ML Models",
              desc: "Random Forest, SVM, KNN, and Decision Tree work together to deliver the highest-confidence predictions.",
              color: "bg-amber-50 text-amber-600",
            },
            {
              icon: Leaf,
              title: "22+ Crop Types",
              desc: "The system identifies and recommends over 22 crop varieties best suited to your local conditions.",
              color: "bg-teal-50 text-teal-600",
            },
          ].map((feat) => (
            <div key={feat.title} className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center mb-5`}>
                <feat.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold font-serif text-emerald-950 mb-2">{feat.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ DATA INSIGHTS SECTION ============ */}
      <section id="explore" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
              <BarChart2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Real Data</span>
            </div>
            <h2 className="font-serif text-4xl font-bold text-emerald-950 mb-4">Explore the Data</h2>
            <p className="text-stone-500 max-w-2xl mx-auto text-lg">
              Deep analysis from thousands of real agricultural data samples, revealing the relationships between soil composition, climate, and crop yield.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Bar Chart – NPK */}
            <div className="bg-[#F9F9F4] rounded-3xl p-8 border border-stone-100">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Beaker className="w-4 h-4 text-green-600" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Soil Nutrients</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">N-P-K Requirements by Crop</h3>
                <p className="text-xs text-stone-400 mt-1">Unit: mg/kg</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={npkData} barSize={10} barGap={2}>
                  <XAxis dataKey="crop" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: 12 }} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="N" name="Nitrogen" fill="#4CAF50" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="P" name="Phosphorus" fill="#82c341" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="K" name="Potassium" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-4">
                {[{ color: "#4CAF50", label: "N" }, { color: "#82c341", label: "P" }, { color: "#f59e0b", label: "K" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-xs text-stone-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Area Chart – Rainfall vs Yield */}
            <div className="bg-[#F9F9F4] rounded-3xl p-8 border border-stone-100">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Climate & Yield</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">Rainfall vs. Crop Yield</h3>
                <p className="text-xs text-stone-400 mt-1">Monthly distribution over the year</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={rainfallData}>
                  <defs>
                    <linearGradient id="rainfallGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#4CAF50" fill="url(#rainfallGrad)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="yield" name="Yield (t/ha)" stroke="#f59e0b" fill="url(#yieldGrad)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-4">
                {[{ color: "#4CAF50", label: "Rainfall" }, { color: "#f59e0b", label: "Yield" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-xs text-stone-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Scatter – Temperature & Humidity */}
            <div className="bg-[#F9F9F4] rounded-3xl p-8 border border-stone-100">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Climate Clusters</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">Temperature & Humidity Clusters</h3>
                <p className="text-xs text-stone-400 mt-1">Distribution by crop group</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart>
                  <XAxis dataKey="temp" name="Temperature" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} label={{ value: "°C", position: "insideRight", offset: 10, fontSize: 10, fill: "#78716c" }} />
                  <YAxis dataKey="humidity" name="Humidity" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: 12 }} formatter={(value, name) => [value, name === "temp" ? "Temp (°C)" : "Humidity (%)"]} />
                  {Object.keys(clusterColors).map((cropName) => (
                    <Scatter key={cropName} name={cropName} data={clusterData.filter((d) => d.crop === cropName)} fill={clusterColors[cropName]}>
                      {clusterData.filter((d) => d.crop === cropName).map((_, index) => (
                        <Cell key={index} fill={clusterColors[cropName]} opacity={0.8} />
                      ))}
                    </Scatter>
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {Object.entries(clusterColors).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-stone-500">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ML PREDICTION WORKSPACE ============ */}
      <section id="predict" className="py-24 px-6 bg-[#F9F9F4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
              <Sprout className="w-3.5 h-3.5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">ML Workspace</span>
            </div>
            <h2 className="font-serif text-4xl font-bold text-emerald-950 mb-4">Crop Prediction Engine</h2>
            <p className="text-stone-500 max-w-xl mx-auto text-lg">
              Enter your soil and climate parameters, select a Machine Learning model, and receive an accurate crop recommendation instantly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Input Form */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <h3 className="font-serif text-lg font-bold text-emerald-950 mb-6">Input Parameters</h3>

              {/* Model Selector */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Machine Learning Model</label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between bg-[#F9F9F4] border border-stone-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-emerald-900 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {selectedModel}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-10 overflow-hidden">
                      {ML_MODELS.map((model) => (
                        <button
                          key={model}
                          onClick={() => { setSelectedModel(model); setIsDropdownOpen(false); setPredicted(false); }}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-green-50 flex items-center gap-2 ${model === selectedModel ? "text-green-700 bg-green-50" : "text-stone-700"}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${model === selectedModel ? "bg-green-500" : "bg-stone-300"}`} />
                          {model}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-5">
                {[
                  { key: "nitrogen", label: "Nitrogen (N)", unit: "mg/kg", min: 0, max: 200, icon: FlaskConical },
                  { key: "phosphorus", label: "Phosphorus (P)", unit: "mg/kg", min: 0, max: 200, icon: FlaskConical },
                  { key: "potassium", label: "Potassium (K)", unit: "mg/kg", min: 0, max: 200, icon: FlaskConical },
                  { key: "temperature", label: "Temperature", unit: "°C", min: 0, max: 50, icon: Thermometer },
                  { key: "humidity", label: "Humidity", unit: "%", min: 0, max: 100, icon: Droplets },
                  { key: "ph", label: "Soil pH", unit: "", min: 0, max: 14, icon: Beaker },
                  { key: "rainfall", label: "Rainfall", unit: "mm", min: 0, max: 500, icon: Wind },
                ].map((input) => (
                  <div key={input.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input.icon className="w-3.5 h-3.5 text-green-600" strokeWidth={1.5} />
                        <label className="text-sm font-medium text-stone-700">{input.label}</label>
                      </div>
                      <div className="flex items-center gap-1 bg-green-50 rounded-lg px-3 py-1">
                        <span className="text-sm font-bold font-serif text-green-700">
                          {formValues[input.key as keyof typeof formValues]}
                        </span>
                        <span className="text-xs text-green-500">{input.unit}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.key === "ph" ? 0.1 : 1}
                      value={formValues[input.key as keyof typeof formValues]}
                      onChange={(e) => handleSliderChange(input.key, parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${((formValues[input.key as keyof typeof formValues] - input.min) / (input.max - input.min)) * 100}%, #e5e7eb ${((formValues[input.key as keyof typeof formValues] - input.min) / (input.max - input.min)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handlePredict}
                disabled={isLoading}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sprout className="w-5 h-5" />
                    Predict Crop Type
                  </>
                )}
              </button>
            </div>

            {/* Right: Result Display */}
            <div className="relative">
              <div
                className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 overflow-hidden"
                style={{ background: predicted ? "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" : "white" }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-green-50 rounded-full -translate-y-24 translate-x-24 opacity-60" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full translate-y-16 -translate-x-16 opacity-60" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-serif text-lg font-bold text-emerald-950">Prediction Result</h3>
                    <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-semibold text-green-700">{selectedModel}</span>
                    </div>
                  </div>

                  {!predicted ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                        <Sprout className="w-10 h-10 text-stone-300" strokeWidth={1} />
                      </div>
                      <p className="text-stone-400 font-medium">Enter your parameters and press</p>
                      <p className="text-stone-400">"Predict Crop Type" to see results</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center py-6">
                        <div className="text-7xl mb-4">{currentResult.emoji}</div>
                        <h2 className="font-serif text-3xl font-bold text-emerald-950 mb-2">{currentResult.name}</h2>
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1.5 bg-green-100 border border-green-200 rounded-full px-4 py-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">
                              Confidence: {currentResult.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-stone-500 mb-2">
                          <span>Suitability score</span>
                          <span className="font-semibold text-green-600">{currentResult.confidence}%</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-3">
                          <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${currentResult.confidence}%`, transition: "width 1s ease" }} />
                        </div>
                      </div>

                      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                        <p className="text-sm font-semibold text-stone-600 mb-2 flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          Why This Recommendation
                        </p>
                        <p className="text-sm text-stone-500 leading-relaxed">{currentResult.reason}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "N", value: `${formValues.nitrogen} mg/kg` },
                          { label: "P", value: `${formValues.phosphorus} mg/kg` },
                          { label: "K", value: `${formValues.potassium} mg/kg` },
                          { label: "Temperature", value: `${formValues.temperature}°C` },
                          { label: "Humidity", value: `${formValues.humidity}%` },
                          { label: "pH", value: formValues.ph.toFixed(1) },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-stone-100">
                            <span className="text-xs text-stone-500">{item.label}</span>
                            <span className="text-xs font-semibold font-serif text-emerald-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { title: "Harvest Period", value: "90–120 days", icon: "🌿" },
                  { title: "Expected Yield", value: "4–6 t/ha", icon: "📊" },
                ].map((card) => (
                  <div key={card.title} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <div className="text-xs text-stone-400 mb-1">{card.title}</div>
                    <div className="font-serif text-base font-bold text-emerald-900">{card.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TEAM SECTION ============ */}
      <section id="team" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
              <Users className="w-3.5 h-3.5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">The Team</span>
            </div>
            <h2 className="font-serif text-4xl font-bold text-emerald-950 mb-4">Meet the Developers</h2>
            <p className="text-stone-500 max-w-xl mx-auto text-lg">
              The passionate experts behind CropSmart, combining deep agricultural knowledge with cutting-edge AI technology.
            </p>
          </div>

          {/* Row of 4 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {TEAM_MEMBERS.slice(0, 4).map((member) => (
              <div key={member.name} className="bg-[#F9F9F4] rounded-3xl p-6 border border-stone-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center">
                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold font-serif text-stone-500">{member.initials}</span>
                </div>
                <h3 className="font-serif text-sm font-bold text-emerald-950 mb-1">{member.name}</h3>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">{member.role}</span>
              </div>
            ))}
          </div>

          {/* Row of 3 centered */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-6 max-w-2xl w-full">
              {TEAM_MEMBERS.slice(4).map((member) => (
                <div key={member.name} className="bg-[#F9F9F4] rounded-3xl p-6 border border-stone-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center">
                  <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold font-serif text-stone-500">{member.initials}</span>
                  </div>
                  <h3 className="font-serif text-sm font-bold text-emerald-950 mb-1">{member.name}</h3>
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER CTA ============ */}
      <footer className="bg-[#1a3620] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-900/50 border border-green-700/50 rounded-full px-4 py-1.5 mb-8">
            <Leaf className="w-3.5 h-3.5 text-green-400" />
            <span className="text-sm font-semibold text-green-300">CropSmart AI</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready for a{" "}
            <span className="text-green-400">successful harvest?</span>
          </h2>
          <p className="text-green-200/80 text-lg mb-10 max-w-lg mx-auto">
            Start analyzing your soil and receive optimal crop recommendations today. Completely free.
          </p>

          <a href="#predict">
            <button className="bg-green-500 hover:bg-green-400 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 inline-flex items-center gap-2">
              <Sprout className="w-5 h-5" />
              Start Free Prediction
              <ArrowRight className="w-5 h-5" />
            </button>
          </a>

          <div className="mt-16 pt-8 border-t border-green-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-600/50 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-green-300" />
              </div>
              <span className="font-serif text-sm font-semibold text-green-300">CropSmart</span>
            </div>
            <p className="text-sm text-green-600">© 2026 CropSmart. Intelligent Crop Recommendation System.</p>
            <div className="flex items-center gap-4 text-sm text-green-600">
              <a href="#" className="hover:text-green-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-green-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-green-300 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
