import React, { useState } from 'react';
import { DailyHydration, WaterLogItem } from '../types';
import {
  Droplets,
  Plus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Heart,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  GlassWater,
  Coffee,
} from 'lucide-react';

interface WaterBottleWidgetProps {
  hydration: DailyHydration;
  onAddWater: (amount: number, label: string) => void;
  onUndoLastWater: () => void;
  onResetTodayWater: () => void;
}

export const WaterBottleWidget: React.FC<WaterBottleWidgetProps> = ({
  hydration,
  onAddWater,
  onUndoLastWater,
  onResetTodayWater,
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [showLogHistory, setShowLogHistory] = useState<boolean>(false);

  const total = hydration.totalWater;
  const target = hydration.targetWater || 2000;
  const percentage = Math.min(100, Math.round((total / target) * 100));
  const remaining = Math.max(0, target - total);

  // Dynamic Caring Reminder from Bobo
  const getBoboHydrationTip = () => {
    const currentHour = new Date().getHours();

    if (percentage >= 100) {
      return {
        mood: '🎉',
        title: '今日補水大達人！',
        text: '太厲害了！水分目標已完美達成，皮膚水潤代謝好，波波為你拍拍手～✨',
        bgColor: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      };
    }

    if (currentHour < 10) {
      return {
        mood: '🌅',
        title: '晨間喚醒補水提醒',
        text: '早安！起床先喝一杯 300ml 溫開水，喚醒沉睡一整夜的腸胃與新陳代謝唷！',
        bgColor: 'bg-sky-50 border-sky-300 text-sky-950',
      };
    } else if (currentHour >= 12 && currentHour < 14) {
      return {
        mood: '🍱',
        title: '午餐代謝小技巧',
        text: '午餐前後半小時補水，可以幫助消化並增加飽足感，避免暴飲暴食喔！',
        bgColor: 'bg-amber-50 border-amber-300 text-amber-950',
      };
    } else if (currentHour >= 14 && currentHour < 17) {
      if (percentage < 50) {
        return {
          mood: '⚠️',
          title: '午後疲倦提醒：可能缺水囉！',
          text: '下午容易昏昏欲睡？通常是身體缺水的警訊！快喝一杯 350ml 溫水提振精神吧～',
          bgColor: 'bg-rose-50 border-rose-300 text-rose-950',
        };
      }
      return {
        mood: '✨',
        title: '午後保持水嫩',
        text: '進度很棒喔！下午繼續規律小口啜飲，有助排出餐點中的多餘鈉與水腫～',
        bgColor: 'bg-sky-50 border-sky-300 text-sky-950',
      };
    } else {
      if (percentage < 70) {
        return {
          mood: '💧',
          title: '晚間補水溫和衝刺',
          text: '距離目標還差一點點！晚餐後慢慢補充溫水，睡前半小時喝一小口即可避免夜尿～',
          bgColor: 'bg-indigo-50 border-indigo-300 text-indigo-950',
        };
      }
      return {
        mood: '🌙',
        title: '睡前溫潤舒緩',
        text: '今日補水進度十分優良！睡前請小口微抿溫水，祝你有個甜甜的美夢～',
        bgColor: 'bg-purple-50 border-purple-300 text-purple-950',
      };
    }
  };

  const tip = getBoboHydrationTip();

  // Quick preset cup options
  const quickOptions = [
    { label: '小水杯', amount: 150, icon: '🥛', desc: '辦公室小啜' },
    { label: '馬克杯', amount: 250, icon: '☕', desc: '一般標準杯' },
    { label: '隨手瓶', amount: 350, icon: '🧴', desc: '外出環保杯' },
    { label: '運動水壺', amount: 500, icon: '🧋', desc: '大口暢飲' },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(customAmount, 10);
    if (!isNaN(amt) && amt > 0) {
      onAddWater(amt, '自訂水量');
      setCustomAmount('');
      setShowCustomInput(false);
    }
  };

  // Water level height percentage for bottle (with minimum 4% so empty bottle has slight bottom base)
  const fluidHeight = Math.max(4, Math.min(96, percentage));

  return (
    <div className="w-full bg-white rounded-3xl p-5 md:p-6 border-2 border-amber-200/80 shadow-sm space-y-5">
      {/* 1. Header with title & today's progress pill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xl shadow-xs">
            💧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base md:text-lg text-stone-900">
                每日喝水進度追蹤
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                補水小幫手
              </span>
            </div>
            <p className="text-xs text-stone-400">
              目標每日 {target} ml · 多喝溫水促進代謝消水腫
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {hydration.logs.length > 0 && (
            <button
              onClick={onUndoLastWater}
              className="px-2.5 py-1 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 text-xs font-bold flex items-center gap-1 transition hover:bg-stone-50 cursor-pointer"
              title="撤銷剛才記錄的上一筆喝水"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>復原</span>
            </button>
          )}

          <div className="bg-sky-50 border border-sky-200 px-3 py-1 rounded-2xl text-xs font-extrabold text-sky-800 flex items-center gap-1.5 shadow-2xs">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>
              已喝 <strong className="text-sky-600 text-sm">{total}</strong> / {target} ml
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Visual Interactive Center: Animated Bottle & Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Animated 3D-effect Water Bottle (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-48 h-72 flex flex-col items-center justify-end select-none">
            {/* Bottle Cap / Lid */}
            <div className="w-16 h-4 bg-stone-300 rounded-t-lg border-2 border-stone-400 shadow-xs z-20 flex items-center justify-center">
              <div className="w-8 h-1.5 bg-stone-200 rounded-full" />
            </div>
            <div className="w-12 h-3 bg-stone-200 border-x-2 border-stone-400 z-20" />

            {/* Bottle Glass Body Container */}
            <div className="relative w-44 h-64 rounded-3xl border-4 border-sky-300/80 bg-sky-50/20 backdrop-blur-xs overflow-hidden shadow-md flex flex-col justify-end">
              {/* Glass Glare Highlights */}
              <div className="absolute top-2 left-3 w-2.5 h-52 bg-white/40 rounded-full pointer-events-none z-30" />
              <div className="absolute top-4 right-3 w-1.5 h-44 bg-white/25 rounded-full pointer-events-none z-30" />

              {/* Tick Mark Measurements on Glass */}
              <div className="absolute inset-y-0 right-4 flex flex-col justify-between py-6 pointer-events-none z-20 text-[10px] font-bold text-stone-400/90 text-right">
                <span className="flex items-center gap-1 justify-end">
                  <span className="w-2.5 h-0.5 bg-stone-300 inline-block" />
                  {target}ml
                </span>
                <span className="flex items-center gap-1 justify-end">
                  <span className="w-2 h-0.5 bg-stone-300 inline-block" />
                  {Math.round(target * 0.75)}ml
                </span>
                <span className="flex items-center gap-1 justify-end">
                  <span className="w-2.5 h-0.5 bg-stone-300 inline-block" />
                  {Math.round(target * 0.5)}ml
                </span>
                <span className="flex items-center gap-1 justify-end">
                  <span className="w-2 h-0.5 bg-stone-300 inline-block" />
                  {Math.round(target * 0.25)}ml
                </span>
              </div>

              {/* Liquid Body with Dynamic Wave Top */}
              <div
                className="w-full relative transition-all duration-700 ease-out flex flex-col justify-end overflow-hidden"
                style={{ height: `${fluidHeight}%` }}
              >
                {/* Wave crests */}
                <div className="absolute -top-3 left-0 w-[200%] h-6 pointer-events-none z-10 flex animate-wave opacity-80">
                  <svg className="w-full h-full fill-sky-300" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,-30 1200,40 L1200,120 L0,120 Z" />
                  </svg>
                </div>
                <div className="absolute -top-3 left-0 w-[200%] h-6 pointer-events-none z-10 flex animate-wave-fast opacity-50">
                  <svg className="w-full h-full fill-cyan-400" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,40 C300,-30 550,120 700,50 C850,-20 1050,90 1200,20 L1200,120 L0,120 Z" />
                  </svg>
                </div>

                {/* Liquid Main Gradient Fill */}
                <div
                  className={`w-full h-full transition-colors duration-700 ${
                    percentage >= 100
                      ? 'bg-gradient-to-t from-emerald-500 via-teal-400 to-sky-400'
                      : percentage >= 50
                      ? 'bg-gradient-to-t from-sky-500 via-cyan-400 to-sky-300'
                      : 'bg-gradient-to-t from-sky-400 via-sky-300 to-cyan-200'
                  }`}
                >
                  {/* Floating Bubbles */}
                  <div className="absolute bottom-4 left-6 w-3 h-3 bg-white/60 rounded-full animate-bubble-1" />
                  <div className="absolute bottom-2 left-16 w-2 h-2 bg-white/70 rounded-full animate-bubble-2" />
                  <div className="absolute bottom-6 right-8 w-2.5 h-2.5 bg-white/50 rounded-full animate-bubble-3" />
                </div>
              </div>

              {/* Floating Percentage / Milestone Text Badge in Bottle Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 drop-shadow-sm">
                <span className="text-3xl font-black text-stone-900/90 tracking-tight">
                  {percentage}%
                </span>
                <span className="text-[11px] font-extrabold text-stone-700/80 bg-white/80 px-2 py-0.5 rounded-full mt-0.5 border border-white/60">
                  {total} / {target} ml
                </span>
                {percentage >= 100 && (
                  <span className="mt-1 text-[10px] font-black text-emerald-800 bg-emerald-200/90 px-2 py-0.5 rounded-full border border-emerald-300 animate-bounce">
                    🎉 目標達成！
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle progress hint */}
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-stone-500">
              {percentage >= 100
                ? '太棒了！已完全達標 🌟'
                : `還差 ${remaining} ml 就能達標囉！`}
            </span>
          </div>
        </div>

        {/* Right: Quick Fast-Tap Log Buttons & Guidance (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Quick-Log Cup Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-stone-700 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-sky-500" />
                快速點擊記錄喝水量：
              </span>
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 underline cursor-pointer"
              >
                {showCustomInput ? '收起自訂' : '+ 自訂水量'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {quickOptions.map((opt) => (
                <button
                  key={opt.amount}
                  type="button"
                  onClick={() => onAddWater(opt.amount, opt.label)}
                  className="group p-3 rounded-2xl border-2 border-sky-100 hover:border-sky-300 bg-sky-50/40 hover:bg-sky-50 active:scale-95 transition flex flex-col items-center text-center cursor-pointer shadow-xs"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {opt.icon}
                  </span>
                  <span className="font-extrabold text-xs text-stone-800">
                    +{opt.amount} ml
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom ML Input Panel */}
            {showCustomInput && (
              <form onSubmit={handleCustomSubmit} className="mt-3 p-3 bg-sky-50/70 rounded-2xl border border-sky-200 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="輸入毫升數 (例如 200)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-sky-300 bg-white text-xs font-bold focus:outline-none focus:border-sky-500"
                  min="10"
                  max="2000"
                  step="10"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
                >
                  確認記錄
                </button>
              </form>
            )}
          </div>

          {/* Bobo Hydration Caring Alert Reminder Banner */}
          <div className={`p-4 rounded-2xl border-2 ${tip.bgColor} shadow-2xs space-y-1`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{tip.mood}</span>
              <h4 className="font-black text-xs sm:text-sm">波波補水叮嚀：{tip.title}</h4>
            </div>
            <p className="text-xs leading-relaxed opacity-95">{tip.text}</p>
          </div>

          {/* Hydration Milestones Checklist */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
            <span className="text-[11px] font-black text-stone-600 block mb-2">
              📅 今日補水黃金里程碑：
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              {[
                { title: '晨間喚醒', target: 300, icon: '🌅' },
                { title: '午後代謝', target: 900, icon: '☀️' },
                { title: '下午提神', target: 1500, icon: '⚡' },
                { title: '全日達標', target: target, icon: '🌟' },
              ].map((ms, i) => {
                const reached = total >= ms.target;
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                      reached
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                        : 'bg-white border-stone-200 text-stone-400'
                    }`}
                  >
                    <span>{reached ? '✅' : ms.icon}</span>
                    <div>
                      <div className="truncate">{ms.title}</div>
                      <div className="text-[9px] opacity-80">{ms.target}ml</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Log History Drawer Toggle */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowLogHistory(!showLogHistory)}
              className="text-stone-500 hover:text-stone-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>今日飲水紀錄 ({hydration.logs.length} 次)</span>
              {showLogHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {hydration.logs.length > 0 && (
              <button
                onClick={onResetTodayWater}
                className="text-stone-400 hover:text-rose-500 text-[11px] font-medium underline cursor-pointer"
              >
                重設今日飲水
              </button>
            )}
          </div>

          {/* Accordion Log List */}
          {showLogHistory && (
            <div className="bg-stone-50/80 rounded-2xl p-3 border border-stone-200 max-h-40 overflow-y-auto space-y-1.5 text-xs animate-fade-in">
              {hydration.logs.length === 0 ? (
                <p className="text-stone-400 text-center py-2 text-[11px]">
                  今天還沒有喝水紀錄喔，快喝一杯吧！
                </p>
              ) : (
                hydration.logs.map((log) => {
                  const timeStr = new Date(log.timestamp).toLocaleTimeString('zh-TW', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={log.id}
                      className="bg-white p-2 rounded-xl border border-stone-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sky-500 font-black">+{log.amount} ml</span>
                        <span className="text-stone-500 text-[11px]">({log.label})</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">{timeStr}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
