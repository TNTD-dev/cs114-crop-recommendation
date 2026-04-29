import { useState, useEffect } from "react";
import {
  BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, ComposedChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Leaf, Zap, BarChart2, Users, Droplets,
  Thermometer, Wind, FlaskConical, Sprout, ArrowRight,
  CheckCircle2, Star, TrendingUp, Beaker, Trophy, Cloud
} from "lucide-react";

const npkData = [
  { crop: "Rice", N: 79.9, P: 47.6, K: 39.9 },
  { crop: "Maize", N: 77.8, P: 48.4, K: 19.8 },
  { crop: "Coffee", N: 101.2, P: 28.7, K: 29.9 },
  { crop: "Apple", N: 20.8, P: 134.2, K: 199.9 },
  { crop: "Cotton", N: 117.8, P: 46.2, K: 19.6 }
];

const rainTempData = [
  { crop: "Rice", rainfall: 236.2, temp: 23.7 },
  { crop: "Maize", rainfall: 84.8, temp: 22.4 },
  { crop: "Coffee", rainfall: 158.1, temp: 25.5 },
  { crop: "Apple", rainfall: 112.7, temp: 22.6 },
  { crop: "Cotton", rainfall: 80.4, temp: 24.0 }
];

const clusterData = [
  { temp: 26.0, humidity: 85.0, crop: "Rice" },
  { temp: 22.0, humidity: 81.9, crop: "Rice" },
  { temp: 25.0, humidity: 83.9, crop: "Rice" },
  { temp: 24.9, humidity: 80.5, crop: "Rice" },
  { temp: 26.3, humidity: 82.4, crop: "Rice" },
  { temp: 25.1, humidity: 56.0, crop: "Maize" },
  { temp: 18.4, humidity: 64.2, crop: "Maize" },
  { temp: 19.2, humidity: 68.3, crop: "Maize" },
  { temp: 20.6, humidity: 69.0, crop: "Maize" },
  { temp: 22.2, humidity: 72.9, crop: "Maize" },
  { temp: 24.6, humidity: 56.5, crop: "Coffee" },
  { temp: 23.6, humidity: 50.6, crop: "Coffee" },
  { temp: 25.6, humidity: 62.7, crop: "Coffee" },
  { temp: 27.1, humidity: 63.6, crop: "Coffee" },
  { temp: 26.2, humidity: 62.3, crop: "Coffee" },
  { temp: 23.8, humidity: 93.7, crop: "Apple" },
  { temp: 23.1, humidity: 92.4, crop: "Apple" },
  { temp: 22.5, humidity: 92.5, crop: "Apple" },
  { temp: 24.0, humidity: 91.6, crop: "Apple" },
  { temp: 22.4, humidity: 90.8, crop: "Apple" },
  { temp: 24.7, humidity: 77.7, crop: "Cotton" },
  { temp: 25.3, humidity: 75.7, crop: "Cotton" },
  { temp: 24.2, humidity: 76.7, crop: "Cotton" },
  { temp: 22.6, humidity: 77.3, crop: "Cotton" },
  { temp: 24.9, humidity: 76.3, crop: "Cotton" }
];

const clusterColors: Record<string, string> = {
  "Rice": "#4CAF50",
  "Maize": "#f59e0b",
  "Coffee": "#78350f",
  "Apple": "#ef4444",
  "Cotton": "#0ea5e9",
};

const ALL_MODELS = [
  { key: "naive_bayes", name: "Naive Bayes" },
  { key: "knn", name: "KNN" },
  { key: "logistic_regression", name: "Logistic Regression" },
  { key: "random_forest", name: "Random Forest" },
  { key: "svm", name: "SVM" },
];

const CROP_EMOJI: Record<string, string> = {
  rice: "🌾", maize: "🌽", chickpea: "🫘", kidneybeans: "🫘",
  pigeonpeas: "🌿", mothbeans: "🌿", mungbean: "🌿", blackgram: "🌿",
  lentil: "🫘", pomegranate: "🍎", banana: "🍌", mango: "🥭",
  grapes: "🍇", watermelon: "🍉", muskmelon: "🍈", apple: "🍎",
  orange: "🍊", papaya: "🍑", coconut: "🥥", cotton: "🪴",
  jute: "🌿", coffee: "☕",
};

type ModelResult = {
  model_key: string;
  model_name: string;
  crop: string;
  confidence: number;
  probabilities: Record<string, number>;
};

type PredictResponse = {
  results: ModelResult[];
  consensus: string | null;
  best_model: string | null;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

const TEAM_MEMBERS = [
  { name: "Alex Nguyen", role: "Lead Data Scientist", initials: "AN" },
  { name: "Sarah Tran", role: "ML Engineer", initials: "ST" },
  { name: "Michael Le", role: "Backend Developer", initials: "ML" },
  { name: "Emily Pham", role: "Frontend Developer", initials: "EP" },
  { name: "David Hoang", role: "Agricultural Expert", initials: "DH" },
  { name: "Lisa Vu", role: "Data Analyst", initials: "LV" },
  { name: "Kevin Dang", role: "UX Designer", initials: "KD" },
];



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


function AnimatedHeroCard() {
  const [data, setData] = useState({
    crop: "Rice (Oryza sativa)",
    emoji: "🌾",
    suitability: 99,
    n: 90, p: 55, k: 40,
    temp: 25, hum: 82, rain: 200
  });

  useEffect(() => {
    const crops = [
      { c: "Rice (Oryza sativa)", e: "🌾" },
      { c: "Maize (Zea mays)", e: "🌽" },
      { c: "Coffee (Coffea arabica)", e: "☕" },
      { c: "Banana (Musa)", e: "🍌" },
      { c: "Cotton (Gossypium)", e: "🪴" },
      { c: "Apple (Malus)", e: "🍎" }
    ];
    let tick = 0;
    
    const interval = setInterval(() => {
      tick++;
      if (tick % 10 === 0) {
         const randomCrop = crops[Math.floor(Math.random() * crops.length)];
         setData({
           crop: randomCrop.c,
           emoji: randomCrop.e,
           suitability: 85 + Math.floor(Math.random() * 14),
           n: 60 + Math.floor(Math.random() * 60),
           p: 30 + Math.floor(Math.random() * 40),
           k: 20 + Math.floor(Math.random() * 40),
           temp: 20 + Math.floor(Math.random() * 10),
           hum: 60 + Math.floor(Math.random() * 30),
           rain: 100 + Math.floor(Math.random() * 150)
         });
      } else {
         setData(prev => ({
           ...prev,
           n: Math.max(0, prev.n + (Math.random() > 0.5 ? 2 : -2)),
           p: Math.max(0, prev.p + (Math.random() > 0.5 ? 2 : -2)),
           k: Math.max(0, prev.k + (Math.random() > 0.5 ? 2 : -2)),
           temp: Math.max(0, prev.temp + (Math.random() > 0.5 ? 1 : -1)),
           hum: Math.max(0, Math.min(100, prev.hum + (Math.random() > 0.5 ? 1 : -1))),
           rain: Math.max(0, prev.rain + (Math.random() > 0.5 ? 2 : -2)),
           suitability: prev.suitability >= 99 ? 98 : Math.max(80, prev.suitability + (Math.random() > 0.5 ? 1 : -1))
         }));
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-stone-100 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
              Analysis Result
            </p>
            <h3 className="text-lg font-bold font-serif text-emerald-950 mt-1 transition-all">
              <span className="inline-block mr-2">{data.emoji}</span> 
              {data.crop}
            </h3>
          </div>
          <div className="bg-green-50 rounded-2xl p-2 animate-pulse">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <CircularProgress value={data.suitability} size={130} />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Real-time Metrics</p>
          {[
            { label: "Nitrogen (N)", value: data.n, max: 150, color: "#4CAF50" },
            { label: "Phosphorus (P)", value: data.p, max: 150, color: "#82c341" },
            { label: "Potassium (K)", value: data.k, max: 150, color: "#f59e0b" },
          ].map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-600 font-medium">{metric.label}</span>
                <span className="text-stone-500 font-mono font-medium">{metric.value} mg/kg</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-[150ms] ease-linear" style={{ width: `${Math.min(100, (metric.value / metric.max) * 100)}%`, backgroundColor: metric.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-3 gap-3">
          {[
            { icon: Thermometer, label: "Temp", value: `${data.temp}°C` },
            { icon: Droplets, label: "Humidity", value: `${data.hum}%` },
            { icon: Wind, label: "Rainfall", value: `${data.rain}mm` },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 bg-stone-50 rounded-xl p-2 transition-all">
              <item.icon className="w-4 h-4 text-green-600" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-emerald-900 font-mono">{item.value}</span>
              <span className="text-[10px] text-stone-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -top-4 -right-4 bg-green-600 text-white rounded-2xl px-4 py-2 shadow-lg">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-white" />
          <span className="text-sm font-bold">~99% Accuracy</span>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 bg-white border border-stone-100 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold text-emerald-900">Random Forest Model</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedModels, setSelectedModels] = useState<string[]>(ALL_MODELS.map(m => m.key));
  const [formValues, setFormValues] = useState({
    nitrogen: 90, phosphorus: 55, potassium: 40,
    temperature: 25, humidity: 82, ph: 6.5, rainfall: 200,
  });
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {}, []);

  const toggleModel = (key: string) => {
    setSelectedModels(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setPredictResult(null);
  };

  const handlePredict = async () => {
    if (selectedModels.length === 0) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: formValues.nitrogen, P: formValues.phosphorus, K: formValues.potassium,
          temperature: formValues.temperature, humidity: formValues.humidity,
          ph: formValues.ph, rainfall: formValues.rainfall,
          models: selectedModels,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data: PredictResponse = await res.json();
      setPredictResult(data);
    } catch {
      setApiError(`Không kết nối được backend tại ${API_BASE_URL}. Kiểm tra API server hoặc biến VITE_API_BASE_URL.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (key: string, value: number) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setPredictResult(null);
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
                { label: "Crops Analyzed", value: "22" },
                { label: "Accuracy Rate", value: "~99%" },
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
            <AnimatedHeroCard />
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
              title: "5 ML Models",
              desc: "Naive Bayes, KNN, Logistic Regression, Random Forest, and SVM work together to deliver the highest-confidence predictions.",
              color: "bg-amber-50 text-amber-600",
            },
            {
              icon: Leaf,
              title: "22 Crop Types",
              desc: "The system identifies and recommends 22 crop varieties best suited to your local conditions.",
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

            {/* Card 2: ComposedChart – Rainfall vs Temp */}
            <div className="bg-[#F9F9F4] rounded-3xl p-8 border border-stone-100">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Climate Overview</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">Rainfall vs. Temperature</h3>
                <p className="text-xs text-stone-400 mt-1">Average climate needs by crop</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={rainTempData}>
                  <XAxis dataKey="crop" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="rainfall" name="Rainfall (mm)" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-4">
                {[{ color: "#0ea5e9", label: "Rainfall (mm)" }, { color: "#ef4444", label: "Temperature (°C)" }].map(l => (
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
              Enter your soil parameters, select <strong>multiple models</strong> and compare predictions side by side.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            {/* Left: Input Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-stone-100 flex flex-col">
              <h3 className="font-serif text-lg font-bold text-emerald-950 mb-6">Input Parameters</h3>

              {/* Multi-Model Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-stone-700">Select Models to Compare</label>
                  <span className="text-xs text-green-600 font-medium">{selectedModels.length}/{ALL_MODELS.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_MODELS.map((m) => {
                    const checked = selectedModels.includes(m.key);
                    return (
                      <button key={m.key} onClick={() => toggleModel(m.key)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition-all shadow-sm ${
                          checked 
                            ? "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700" 
                            : "bg-white border-stone-200 text-stone-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                        }`}>
                        {checked && <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />}
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders grouped by category */}
              <div className="space-y-6">
                
                {/* Soil Chemistry Group */}
                <div className="bg-stone-50/50 rounded-2xl p-5 border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Soil Chemistry</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {[
                      { key: "nitrogen", label: "Nitrogen (N)", unit: "mg/kg", min: 0, max: 200, color: "#4CAF50" },
                      { key: "phosphorus", label: "Phosphorus (P)", unit: "mg/kg", min: 0, max: 200, color: "#82c341" },
                      { key: "potassium", label: "Potassium (K)", unit: "mg/kg", min: 0, max: 200, color: "#f59e0b" },
                      { key: "ph", label: "Soil pH", unit: "", min: 0, max: 14, color: "#9333ea" },
                    ].map((input) => (
                      <div key={input.key}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-stone-600">{input.label}</label>
                          <div className="flex items-center gap-1 bg-white rounded shadow-sm border border-stone-200 px-2 py-0.5 focus-within:ring-2 focus-within:ring-green-100 focus-within:border-green-400 transition-all">
                            <input 
                              type="number" 
                              min={input.min} 
                              max={input.max} 
                              step={input.key === "ph" ? 0.1 : 1}
                              value={formValues[input.key as keyof typeof formValues]}
                              onChange={(e) => handleSliderChange(input.key, e.target.value === "" ? 0 : parseFloat(e.target.value))}
                              className="w-12 text-right text-xs font-bold font-serif text-emerald-900 bg-transparent outline-none p-0 border-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[10px] text-stone-400 font-medium">{input.unit}</span>
                          </div>
                        </div>
                        <input type="range" min={input.min} max={input.max}
                          step={input.key === "ph" ? 0.1 : 1}
                          value={formValues[input.key as keyof typeof formValues]}
                          onChange={(e) => handleSliderChange(input.key, parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, ${input.color} 0%, ${input.color} ${((formValues[input.key as keyof typeof formValues] - input.min) / (input.max - input.min)) * 100}%, #e5e7eb ${((formValues[input.key as keyof typeof formValues] - input.min) / (input.max - input.min)) * 100}%, #e5e7eb 100%)` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Climate Group */}
                <div className="bg-stone-50/50 rounded-2xl p-5 border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Climate Conditions</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {[
                      { key: "temperature", label: "Temperature", unit: "°C", min: 0, max: 50, color: "#ef4444" },
                      { key: "humidity", label: "Humidity", unit: "%", min: 0, max: 100, color: "#3b82f6" },
                      { key: "rainfall", label: "Rainfall", unit: "mm", min: 0, max: 500, color: "#06b6d4" },
                    ].map((input) => (
                      <div key={input.key}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-stone-600">{input.label}</label>
                          <div className="flex items-center gap-1 bg-white rounded shadow-sm border border-stone-200 px-2 py-0.5 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                            <input 
                              type="number" 
                              min={input.min} 
                              max={input.max} 
                              step={1}
                              value={formValues[input.key as keyof typeof formValues]}
                              onChange={(e) => handleSliderChange(input.key, e.target.value === "" ? 0 : parseFloat(e.target.value))}
                              className="w-12 text-right text-xs font-bold font-serif text-emerald-900 bg-transparent outline-none p-0 border-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[10px] text-stone-400 font-medium">{input.unit}</span>
                          </div>
                        </div>
                        <input type="range" min={input.min} max={input.max}
                          step={1}
                          value={formValues[input.key as keyof typeof formValues]}
                          onChange={(e) => handleSliderChange(input.key, parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, ${input.color} 0%, ${input.color} ${((formValues[input.key as keyof typeof formValues] - input.min) / (input.max - input.min)) * 100}%, #e5e7eb ${((formValues[input.key as keyof typeof formValues] - input.min) / (input.max - input.min)) * 100}%, #e5e7eb 100%)` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handlePredict} disabled={isLoading || selectedModels.length === 0}
                className="w-full mt-auto bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base">
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                ) : (
                  <><Sprout className="w-5 h-5" />Compare {selectedModels.length} Model{selectedModels.length > 1 ? "s" : ""}</>
                )}
              </button>
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-3 space-y-4 flex flex-col h-full">
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">⚠️ {apiError}</div>
              )}
              {!predictResult && !apiError && (
                <div className="bg-white rounded-3xl p-12 shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center h-full min-h-[500px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50/50 via-white to-white opacity-80 pointer-events-none"></div>
                  
                  {/* Decorative AI rings */}
                  <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                    <div className="absolute inset-0 border-[3px] border-green-50 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 border-[2px] border-dashed border-emerald-100 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                    <div className="absolute inset-8 border border-stone-100 rounded-full"></div>
                    <div className="w-16 h-16 bg-gradient-to-tr from-green-600 to-emerald-400 rounded-2xl shadow-xl shadow-green-200/50 flex items-center justify-center transform rotate-3">
                      <Sprout className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2} />
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-3 relative z-10">Awaiting Data</h3>
                  <p className="text-stone-500 max-w-sm mb-10 relative z-10 text-sm">
                    Input your soil metrics and climate data to let our multi-model AI engine determine the most suitable crop for your land.
                  </p>

                  <div className="grid grid-cols-3 gap-4 w-full max-w-md relative z-10">
                    <div className="bg-stone-50 rounded-2xl p-4 flex flex-col items-center gap-2 border border-stone-100">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold font-serif text-sm">1</div>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-center">Set<br/>Metrics</span>
                    </div>
                    <div className="bg-stone-50 rounded-2xl p-4 flex flex-col items-center gap-2 border border-stone-100">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold font-serif text-sm">2</div>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-center">Choose<br/>Models</span>
                    </div>
                    <div className="bg-stone-50 rounded-2xl p-4 flex flex-col items-center gap-2 border border-stone-100">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold font-serif text-sm">3</div>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-center">Compare<br/>Results</span>
                    </div>
                  </div>
                </div>
              )}
              {predictResult?.consensus && (
                <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-6">
                  <div className="absolute -right-6 -bottom-6 opacity-10">
                    <Trophy className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="text-6xl bg-white/10 w-24 h-24 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                      {CROP_EMOJI[predictResult.consensus] ?? "🌱"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-green-200">Final Recommendation</p>
                      </div>
                      <p className="text-4xl font-bold font-serif capitalize text-white drop-shadow-sm mb-2">{predictResult.consensus}</p>
                      <div className="inline-flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1 border border-white/10">
                        <Users className="w-3.5 h-3.5 text-green-200" />
                        <p className="text-xs font-medium text-green-100">
                          Agreed by <strong className="text-white">{predictResult.results.filter(r => r.crop === predictResult.consensus).length} out of {predictResult.results.length}</strong> models
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictResult?.results.map((r) => {
                  const isBest = r.model_key === predictResult.best_model;
                  const confPct = Math.round(r.confidence * 100);
                  const alternatives = Object.entries(r.probabilities)
                    .filter(([c]) => c !== r.crop)
                    .slice(0, 2);

                  return (
                    <div key={r.model_key} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-all ${isBest ? "border-green-400 shadow-green-100 ring-1 ring-green-400" : "border-stone-100"}`}>
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl bg-stone-50 w-10 h-10 rounded-xl flex items-center justify-center border border-stone-100 shadow-sm">{CROP_EMOJI[r.crop] ?? "🌱"}</div>
                            <div>
                              <div className="font-serif font-bold text-emerald-950 capitalize leading-tight mb-0.5">{r.crop}</div>
                              <div className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                                {r.model_name}
                                {isBest && <span className="text-[9px] font-bold text-green-700 bg-green-100 rounded text-center px-1.5 py-0.5 uppercase tracking-wider">Best</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <div className="text-lg font-bold font-serif text-green-700 leading-tight">{confPct}%</div>
                          </div>
                        </div>

                        <div className="w-full bg-stone-100 rounded-full h-1.5 mb-4 overflow-hidden">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${confPct}%`, transition: "width 0.8s ease" }} />
                        </div>
                      </div>

                      {alternatives.length > 0 && (
                        <div className="bg-stone-50 rounded-xl p-3 space-y-2 border border-stone-100/50">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Alternatives</p>
                          {alternatives.map(([crop, prob]) => (
                            <div key={crop} className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-600 capitalize font-medium">{crop}</span>
                              <div className="flex items-center gap-2 w-1/2">
                                <div className="flex-1 bg-stone-200 rounded-full h-1 overflow-hidden">
                                  <div className="h-1 rounded-full bg-stone-400" style={{ width: `${Math.round(prob * 100)}%` }} />
                                </div>
                                <span className="text-stone-400 w-6 text-right font-mono">{Math.round(prob * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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
