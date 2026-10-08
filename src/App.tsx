import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  BookOpen,
  Target,
  Volume2,
  Share2,
  RefreshCw,
  ChefHat,
  Heart,
  TrendingUp,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
} from 'lucide-react';
import { MealAnalysis, UserGoal, UserProfile, DailyHydration } from './types';
import { PRESET_MEALS } from './utils/presetMeals';
import { voiceAssistant } from './utils/audioHelper';
import {
  calculateBMR,
  calculateTDEE,
  computePast7DaysIntake,
  generateSeed7DaysMeals,
} from './utils/healthCalculators';
import { CanvasDashboard } from './components/CanvasDashboard';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { MealDetailCards } from './components/MealDetailCards';
import { PhotoCaptureModal } from './components/PhotoCaptureModal';
import { MealHistoryModal } from './components/MealHistoryModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WeeklyTrendChart } from './components/WeeklyTrendChart';
import { WaterBottleWidget } from './components/WaterBottleWidget';

const DEFAULT_PROFILE: UserProfile = {
  name: '小萱',
  gender: 'female',
  age: 26,
  height: 162,
  weight: 58,
  targetWeight: 52,
  activityLevel: 'light',
  bmr: 1335,
  tdee: 1835,
};

const DEFAULT_GOAL: UserGoal = {
  name: '小萱的減脂目標',
  dietType: '減脂輕盈',
  targetCalories: 1550,
  targetProtein: 75,
  targetWater: 2000,
};

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [goal, setGoal] = useState<UserGoal>(DEFAULT_GOAL);
  const [history, setHistory] = useState<MealAnalysis[]>([]);
  const [currentMeal, setCurrentMeal] = useState<MealAnalysis>(PRESET_MEALS[0]);

  // Hydration state
  const [hydration, setHydration] = useState<DailyHydration>({
    dateKey: getTodayKey(),
    totalWater: 1250,
    targetWater: 2000,
    logs: [
      { id: 'seed-w1', timestamp: Date.now() - 5 * 3600 * 1000, amount: 300, label: '晨間喚醒溫水' },
      { id: 'seed-w2', timestamp: Date.now() - 3 * 3600 * 1000, amount: 450, label: '午餐餐前水' },
      { id: 'seed-w3', timestamp: Date.now() - 1 * 3600 * 1000, amount: 500, label: '下午提神隨身瓶' },
    ],
  });

  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'canvas' | 'details' | 'trends' | 'water'>('canvas');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved profile, goals, history, and hydration from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('diet_assistant_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      const savedGoal = localStorage.getItem('diet_assistant_goal');
      if (savedGoal) {
        const parsedGoal = JSON.parse(savedGoal);
        setGoal(parsedGoal);
        setHydration((prev) => ({ ...prev, targetWater: parsedGoal.targetWater || 2000 }));
      }

      const todayKey = getTodayKey();
      const savedHydration = localStorage.getItem(`diet_assistant_hydration_${todayKey}`);
      if (savedHydration) {
        setHydration(JSON.parse(savedHydration));
      }

      const savedHistory = localStorage.getItem('diet_assistant_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setCurrentMeal(parsed[0]);
        } else {
          const seeds = generateSeed7DaysMeals();
          setHistory(seeds);
          setCurrentMeal(seeds[seeds.length - 1]);
        }
      } else {
        const seeds = generateSeed7DaysMeals();
        setHistory(seeds);
        setCurrentMeal(seeds[seeds.length - 1]);
        localStorage.setItem('diet_assistant_history', JSON.stringify(seeds));
      }
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }, []);

  // Hydration handlers
  const handleAddWater = (amount: number, label: string) => {
    setHydration((prev) => {
      const newLogs = [
        { id: `water-${Date.now()}`, timestamp: Date.now(), amount, label },
        ...prev.logs,
      ];
      const newTotal = prev.totalWater + amount;
      const updated: DailyHydration = {
        ...prev,
        totalWater: newTotal,
        logs: newLogs,
      };
      try {
        localStorage.setItem(`diet_assistant_hydration_${prev.dateKey}`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Hydration save error:', e);
      }
      return updated;
    });
  };

  const handleUndoLastWater = () => {
    setHydration((prev) => {
      if (prev.logs.length === 0) return prev;
      const [removed, ...remainingLogs] = prev.logs;
      const newTotal = Math.max(0, prev.totalWater - removed.amount);
      const updated: DailyHydration = {
        ...prev,
        totalWater: newTotal,
        logs: remainingLogs,
      };
      try {
        localStorage.setItem(`diet_assistant_hydration_${prev.dateKey}`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Hydration undo error:', e);
      }
      return updated;
    });
  };

  const handleResetTodayWater = () => {
    setHydration((prev) => {
      const updated: DailyHydration = {
        ...prev,
        totalWater: 0,
        logs: [],
      };
      try {
        localStorage.setItem(`diet_assistant_hydration_${prev.dateKey}`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Hydration reset error:', e);
      }
      return updated;
    });
  };

  // Save history to localStorage
  const saveToHistory = (newMeal: MealAnalysis) => {
    setHistory((prev) => {
      const updated = [newMeal, ...prev.filter((m) => m.id !== newMeal.id)].slice(0, 50);
      try {
        localStorage.setItem('diet_assistant_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return updated;
    });
  };

  // Save profile & goal
  const handleSaveProfileAndGoal = (newProfile: UserProfile, newGoal: UserGoal) => {
    setProfile(newProfile);
    setGoal(newGoal);
    setHydration((prev) => ({ ...prev, targetWater: newGoal.targetWater || 2000 }));
    try {
      localStorage.setItem('diet_assistant_profile', JSON.stringify(newProfile));
      localStorage.setItem('diet_assistant_goal', JSON.stringify(newGoal));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Play cute voice explanation
  const handlePlayVoice = () => {
    if (!currentMeal.voiceScript) return;

    voiceAssistant.playCuteVoice(
      currentMeal.voiceScript,
      currentMeal.audioBase64,
      () => setIsPlayingVoice(true),
      () => setIsPlayingVoice(false)
    );
  };

  const handleStopVoice = () => {
    voiceAssistant.stop();
    setIsPlayingVoice(false);
  };

  // AI Meal Analysis Handler
  const handleAnalyzePhoto = async (imageBase64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // 免費 Static Space 示範模式：照片只留在瀏覽器，不呼叫付費 AI API。
      void mimeType;
      const sample = PRESET_MEALS[0];
      const now = Date.now();
      const analyzedMeal: MealAnalysis = {
        ...sample,
        id: `meal-${now}`,
        timestamp: now,
        imageUrl: imageBase64,
        mealName: '免費版示範餐點（非照片辨識）',
        foodItems: sample.foodItems.map((item) => ({ ...item })),
        positives: [...sample.positives],
        suggestions: [
          '免費展示模式使用預設範例營養資料，沒有分析這張照片。',
          ...sample.suggestions,
        ],
        voiceScript: '這是免費展示模式。畫面中的營養資料是範例，並沒有辨識或上傳您的照片。',
        audioBase64: undefined,
      };

      setCurrentMeal(analyzedMeal);
      saveToHistory(analyzedMeal);

      // Automatically play cute caring voice upon analysis completion!
      setTimeout(() => {
        voiceAssistant.playCuteVoice(
          analyzedMeal.voiceScript,
          analyzedMeal.audioBase64,
          () => setIsPlayingVoice(true),
          () => setIsPlayingVoice(false)
        );
      }, 500);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || '無法顯示示範餐點，請再試一次。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Compute 7-day intake data for Recharts
  const daysData = computePast7DaysIntake(history, goal.targetCalories, profile.bmr);
  const todaySummary = daysData[daysData.length - 1] || { totalCalories: 0 };
  const todayRemaining = Math.max(0, goal.targetCalories - todaySummary.totalCalories);

  return (
    <div className="min-h-screen bg-[#fffdf7] text-stone-800 flex flex-col font-sans">
      {/* Top Cute Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-amber-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-300 via-orange-300 to-rose-300 flex items-center justify-center text-2xl shadow-sm border-2 border-amber-400 animate-float">
              🐹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-lg md:text-xl text-stone-900 tracking-tight">
                  飲控小幫手
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                  波波在線 🌿
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                拍照秒懂卡路里 · Recharts 過去一週趨勢與達標警示
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Hydration Button */}
            <button
              onClick={() => setActiveTab('water')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-bold text-sky-900 transition active:scale-95 cursor-pointer shadow-2xs"
              title="點擊查看今日喝水進度水瓶"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>{hydration.totalWater}</span>
              <span className="hidden sm:inline text-[10px] text-sky-600">/ {hydration.targetWater}ml</span>
            </button>

            {/* User Profile Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-900 transition active:scale-95 cursor-pointer"
              title="點擊設定個人基本資料與目標"
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-extrabold">{profile.name}</span>
              <span className="hidden md:inline text-[11px] text-amber-700 font-semibold">
                (TDEE: {profile.tdee})
              </span>
            </button>

            {/* Goal Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-900 transition active:scale-95 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>{goal.dietType}</span>
              <span className="text-rose-600 font-black">{goal.targetCalories} kcal</span>
            </button>

            {/* History & Trend Button */}
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-bold text-stone-700 transition active:scale-95 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">歷史趨勢</span>
              <span className="w-4 h-4 rounded-full bg-amber-300 text-amber-950 text-[10px] flex items-center justify-center font-bold">
                {history.length}
              </span>
            </button>

            {/* Main Action: Camera / Upload Meal */}
            <button
              onClick={() => setIsCaptureModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-orange-200/60 active:scale-95 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>拍照分析</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong className="mr-2">免費展示模式</strong>
          不需要 API 金鑰。照片不會上傳；營養數值是範例資料，沒有依照片辨識或計算。
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-bold text-xs underline cursor-pointer"
            >
              關閉
            </button>
          </div>
        )}

        {/* Current Meal Quick Header Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative shrink-0">
              <img
                src={currentMeal.imageUrl}
                alt={currentMeal.mealName}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                {currentMeal.overallScore} 分
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {currentMeal.mealType}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(currentMeal.timestamp).toLocaleTimeString('zh-TW', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h2 className="font-black text-lg sm:text-xl text-stone-900 mt-1">
                {currentMeal.mealName}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>
                  評語：<strong className="text-amber-700">{currentMeal.scoreRating}</strong>
                </span>
                <span>·</span>
                <span>🔥 估計 {currentMeal.estimatedCalories} kcal</span>
                <span>·</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  今日累計: {todaySummary.totalCalories} / {goal.targetCalories} kcal
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsCaptureModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              拍新的一餐
            </button>
          </div>
        </div>

        {/* Voice Audio Assistant Widget */}
        <AudioPlayerWidget
          voiceScript={currentMeal.voiceScript}
          isPlaying={isPlayingVoice}
          onPlay={handlePlayVoice}
          onStop={handleStopVoice}
        />

        {/* View Mode Tabs: Canvas vs Details vs Recharts Trends */}
        <div className="flex items-center justify-between border-b-2 border-amber-100 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'canvas'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-200/60'
                  : 'bg-white hover:bg-amber-50 text-stone-600 border border-stone-200'
              }`}
            >
              <span>🎨</span>
              可愛 Canvas 互動繪圖板
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-200/60'
                  : 'bg-white hover:bg-amber-50 text-stone-600 border border-stone-200'
              }`}
            >
              <span>📊</span>
              完整營養明細清單
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-200/60'
                  : 'bg-white hover:bg-amber-50 text-stone-600 border border-stone-200'
              }`}
            >
              <span>📈</span>
              過去一週熱量趨勢 (Recharts)
            </button>

            <button
              onClick={() => setActiveTab('water')}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'water'
                  ? 'bg-sky-400 text-stone-950 shadow-md shadow-sky-200/60'
                  : 'bg-white hover:bg-sky-50 text-stone-600 border border-stone-200'
              }`}
            >
              <span>💧</span>
              喝水進度水瓶 ({hydration.totalWater}ml)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400 font-medium">
            <span>✨ 示範餐點快速體驗：</span>
            {PRESET_MEALS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => {
                  setCurrentMeal(p);
                  voiceAssistant.stop();
                  setIsPlayingVoice(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentMeal.id === p.id
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {i === 0 ? '鮭魚彩蔬' : i === 1 ? '舒肥雞胸' : '放縱漢堡'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Body Switcher */}
        {activeTab === 'canvas' ? (
          <div className="space-y-6">
            <CanvasDashboard
              meal={currentMeal}
              onPlayVoice={handlePlayVoice}
              isPlayingVoice={isPlayingVoice}
              waterIntake={hydration.totalWater}
              waterTarget={hydration.targetWater}
            />

            {/* Daily Hydration Tracker on Dashboard */}
            <WaterBottleWidget
              hydration={hydration}
              onAddWater={handleAddWater}
              onUndoLastWater={handleUndoLastWater}
              onResetTodayWater={handleResetTodayWater}
            />

            <MealDetailCards meal={currentMeal} />
          </div>
        ) : activeTab === 'details' ? (
          <div className="space-y-6">
            <MealDetailCards meal={currentMeal} />
          </div>
        ) : activeTab === 'trends' ? (
          <div className="space-y-6">
            <WeeklyTrendChart
              daysData={daysData}
              goal={goal}
              profile={profile}
              onSelectDate={(dateKey) => {
                setIsHistoryModalOpen(true);
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <WaterBottleWidget
              hydration={hydration}
              onAddWater={handleAddWater}
              onUndoLastWater={handleUndoLastWater}
              onResetTodayWater={handleResetTodayWater}
            />
          </div>
        )}
      </main>

      {/* Cute Footer */}
      <footer className="mt-12 py-6 bg-white border-t border-amber-200 text-center text-xs text-stone-400 space-y-1">
        <p className="flex items-center justify-center gap-1 font-bold text-stone-500">
          <span>🐹 飲控小幫手波波</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>陪伴你每一天的健康好食光</span>
        </p>
        <p className="text-[11px]">
          本應用程式為飲食輔助分析與熱量估算，請依照個人身體狀況與醫師、營養師專業指示調整飲食。
        </p>
      </footer>

      {/* Modals */}
      <PhotoCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onAnalyze={handleAnalyzePhoto}
        onSelectPreset={(preset) => {
          setCurrentMeal(preset);
          saveToHistory(preset);
          setTimeout(() => {
            voiceAssistant.playCuteVoice(
              preset.voiceScript,
              preset.audioBase64,
              () => setIsPlayingVoice(true),
              () => setIsPlayingVoice(false)
            );
          }, 300);
        }}
        isAnalyzing={isAnalyzing}
      />

      <MealHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onSelectMeal={(m) => {
          setCurrentMeal(m);
          voiceAssistant.stop();
          setIsPlayingVoice(false);
        }}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem('diet_assistant_history');
        }}
        goal={goal}
        profile={profile}
        onOpenProfileModal={() => {
          setIsHistoryModalOpen(false);
          setIsProfileModalOpen(true);
        }}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        goal={goal}
        onSave={handleSaveProfileAndGoal}
      />
    </div>
  );
}
