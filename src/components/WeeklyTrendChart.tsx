import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DailyIntakeSummary, UserGoal, UserProfile } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Flame,
  Activity,
  Heart,
  ChevronRight,
  Info,
} from 'lucide-react';

interface WeeklyTrendChartProps {
  daysData: DailyIntakeSummary[];
  goal: UserGoal;
  profile: UserProfile;
  onSelectDate?: (dateKey: string) => void;
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({
  daysData,
  goal,
  profile,
  onSelectDate,
}) => {
  const [chartMode, setChartMode] = useState<'calories' | 'macros'>('calories');

  // Compute key weekly statistics
  const daysWithData = daysData.filter((d) => d.totalCalories > 0);
  const avgCalories =
    daysWithData.length > 0
      ? Math.round(
          daysWithData.reduce((acc, d) => acc + d.totalCalories, 0) / daysWithData.length
        )
      : 0;

  // Today's summary
  const todayData = daysData[daysData.length - 1] || {
    totalCalories: 0,
    difference: 0,
    status: 'optimal',
    mealCount: 0,
    totalSodium: 0,
  };

  const remainingCalories = Math.max(0, goal.targetCalories - todayData.totalCalories);
  const progressPercent = Math.min(100, Math.round((todayData.totalCalories / goal.targetCalories) * 100));

  // Count days on target (within target * 0.85 to 1.15)
  const onTargetDays = daysWithData.filter(
    (d) => d.totalCalories >= goal.targetCalories * 0.85 && d.totalCalories <= goal.targetCalories * 1.15
  ).length;
  const complianceRate = daysWithData.length > 0 ? Math.round((onTargetDays / daysWithData.length) * 100) : 100;

  // Determine overall weekly / today alert banner
  let alertType: 'success' | 'warning' | 'danger' | 'info' = 'success';
  let alertTitle = '今日飲食狀態良好 🌟';
  let alertDesc = '熱量攝取維持在建議區間，營養素均衡，繼續保持！';

  if (todayData.totalCalories > goal.targetCalories * 1.15) {
    alertType = 'danger';
    alertTitle = `今日熱量超額警示 (+${todayData.totalCalories - goal.targetCalories} kcal) 🍩`;
    alertDesc = '超出每日目標熱量上限！建議晚餐多補充高纖深綠色蔬菜，或稍後散步 30 分鐘幫助消耗～';
  } else if (todayData.totalCalories > 0 && todayData.totalCalories < profile.bmr && todayData.mealCount >= 2) {
    alertType = 'warning';
    alertTitle = `熱量低於基礎代謝率 (BMR: ${profile.bmr} kcal) ⚠️`;
    alertDesc = '過度少吃容易引起肌肉流失與代謝減緩，波波建議加顆水煮蛋、堅果或溫豆漿補充元氣！';
  } else if (todayData.totalSodium > 2400) {
    alertType = 'warning';
    alertTitle = `鈉含量超標警示 (${todayData.totalSodium} mg) 🧂`;
    alertDesc = '成人每日建議鈉上限為 2400mg，今日略高。建議多喝溫水促進代謝與預防水腫～';
  } else if (todayData.totalCalories === 0) {
    alertType = 'info';
    alertTitle = '今天還沒有記錄餐點喔 📸';
    alertDesc = '快拍下今天的第一餐，讓波波為你精準記錄熱量與營養！';
  }

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DailyIntakeSummary = payload[0].payload;
      const diff = data.totalCalories - goal.targetCalories;
      const diffText = diff > 0 ? `超標 +${diff} kcal` : diff < 0 ? `剩餘 ${Math.abs(diff)} kcal` : '剛好達標';

      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border-2 border-amber-300 text-xs space-y-1.5 min-w-[200px]">
          <div className="font-extrabold text-stone-900 border-b border-amber-100 pb-1 flex items-center justify-between">
            <span>{data.displayDate}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {data.mealCount} 餐紀錄
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-700">
            <span className="flex items-center gap-1 font-bold">
              🔥 總熱量:
            </span>
            <span className="font-black text-rose-600 text-sm">
              {data.totalCalories} kcal
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-500 text-[11px]">
            <span>🎯 目標差距:</span>
            <span className={`font-bold ${diff > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
              {diffText}
            </span>
          </div>

          <div className="pt-1.5 border-t border-stone-100 grid grid-cols-3 gap-1 text-[10px] text-stone-600 text-center">
            <div className="bg-amber-50 p-1 rounded-md">
              <span className="block text-stone-400">碳水</span>
              <span className="font-bold">{Math.round(data.totalCarbs)}g</span>
            </div>
            <div className="bg-emerald-50 p-1 rounded-md">
              <span className="block text-stone-400">蛋白</span>
              <span className="font-bold">{Math.round(data.totalProtein)}g</span>
            </div>
            <div className="bg-pink-50 p-1 rounded-md">
              <span className="block text-stone-400">脂肪</span>
              <span className="font-bold">{Math.round(data.totalFat)}g</span>
            </div>
          </div>

          {data.alertMessage && (
            <div className="mt-1 pt-1 border-t border-stone-100 text-[10px] text-amber-800 bg-amber-50/80 p-1.5 rounded-lg">
              💬 {data.alertMessage}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-5">
      {/* 1. KPI Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Today's Intake */}
        <div className="bg-white rounded-3xl p-4 border-2 border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">今日總攝取</span>
            <span className="text-lg">🔥</span>
          </div>
          <div className="my-1">
            <div className="text-xl sm:text-2xl font-black text-stone-900">
              {todayData.totalCalories}{' '}
              <span className="text-xs font-bold text-stone-400">/ {goal.targetCalories} kcal</span>
            </div>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                todayData.totalCalories > goal.targetCalories
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-amber-400 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1.5 font-medium">
            <span>達成 {progressPercent}%</span>
            <span>剩餘 {remainingCalories} kcal</span>
          </div>
        </div>

        {/* 7-Day Average */}
        <div className="bg-white rounded-3xl p-4 border-2 border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">週平均攝取</span>
            <span className="text-lg">📈</span>
          </div>
          <div className="my-1">
            <div className="text-xl sm:text-2xl font-black text-stone-900">
              {avgCalories}{' '}
              <span className="text-xs font-bold text-stone-400">kcal / 天</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {avgCalories > goal.targetCalories
              ? `高於每日目標 ${avgCalories - goal.targetCalories} kcal`
              : `低於目標 ${goal.targetCalories - avgCalories} kcal (良好)`}
          </p>
        </div>

        {/* Target Compliance Rate */}
        <div className="bg-white rounded-3xl p-4 border-2 border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">7天達標率</span>
            <span className="text-lg">🎯</span>
          </div>
          <div className="my-1">
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {complianceRate}%
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {onTargetDays} / {daysWithData.length} 天熱量落在黃金區間
          </p>
        </div>

        {/* User BMR / TDEE Quick Glance */}
        <div className="bg-white rounded-3xl p-4 border-2 border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">身體代謝指標</span>
            <span className="text-lg">⚡</span>
          </div>
          <div className="my-1">
            <div className="text-sm font-black text-stone-800">
              BMR: <span className="text-amber-700">{profile.bmr}</span> kcal
            </div>
            <div className="text-sm font-black text-stone-800 mt-0.5">
              TDEE: <span className="text-indigo-600">{profile.tdee}</span> kcal
            </div>
          </div>
          <p className="text-[10px] text-stone-400">
            依據個人體重、身高與活動量估算
          </p>
        </div>
      </div>

      {/* 2. Alert & Status Banner */}
      <div
        className={`rounded-3xl p-4 border-2 flex items-start gap-3.5 transition shadow-sm ${
          alertType === 'danger'
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : alertType === 'warning'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : alertType === 'info'
            ? 'bg-sky-50 border-sky-300 text-sky-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold ${
            alertType === 'danger'
              ? 'bg-rose-200 text-rose-800'
              : alertType === 'warning'
              ? 'bg-amber-200 text-amber-800'
              : alertType === 'info'
              ? 'bg-sky-200 text-sky-800'
              : 'bg-emerald-200 text-emerald-800'
          }`}
        >
          {alertType === 'danger' ? '🍩' : alertType === 'warning' ? '⚠️' : alertType === 'info' ? '💡' : '🎉'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm md:text-base">{alertTitle}</h4>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                alertType === 'danger'
                  ? 'bg-rose-200 text-rose-800'
                  : alertType === 'warning'
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-emerald-200 text-emerald-800'
              }`}
            >
              波波即時監控
            </span>
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{alertDesc}</p>
        </div>
      </div>

      {/* 3. Recharts Main Graph Card */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border-2 border-amber-200/80 shadow-sm space-y-4">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              📊
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                過去一週攝取熱量趨勢圖
              </h3>
              <p className="text-xs text-stone-400">
                即時比對每日目標熱量（{goal.targetCalories} kcal）與實際攝取
              </p>
            </div>
          </div>

          {/* Toggle between Calories line vs Macros Area */}
          <div className="flex bg-stone-100 p-1 rounded-2xl gap-1 text-xs font-bold text-stone-600 self-stretch sm:self-auto">
            <button
              onClick={() => setChartMode('calories')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                chartMode === 'calories'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'hover:bg-stone-200/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              熱量折線圖
            </button>
            <button
              onClick={() => setChartMode('macros')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                chartMode === 'macros'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'hover:bg-stone-200/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              三大營養素面積圖
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-72 sm:h-80 pt-2">
          {chartMode === 'calories' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daysData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="calorieLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={[0, (dataMax: number) => Math.max(goal.targetCalories + 400, Math.ceil(dataMax * 1.15))]}
                  unit=" kcal"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => {
                    if (value === 'totalCalories') return '實際攝取熱量 (kcal)';
                    return value;
                  }}
                />

                {/* Daily Goal Target Reference Line */}
                <ReferenceLine
                  y={goal.targetCalories}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `每日目標 ${goal.targetCalories} kcal`,
                    fill: '#d97706',
                    fontSize: 11,
                    position: 'top',
                  }}
                />

                {/* BMR Reference Line */}
                <ReferenceLine
                  y={profile.bmr}
                  stroke="#94a3b8"
                  strokeDasharray="2 2"
                  strokeWidth={1.5}
                  label={{
                    value: `基代 BMR ${profile.bmr} kcal`,
                    fill: '#94a3b8',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="totalCalories"
                  stroke="#f43f5e"
                  strokeWidth={3.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isOptimal =
                      payload.totalCalories >= goal.targetCalories * 0.85 &&
                      payload.totalCalories <= goal.targetCalories * 1.15;
                    const isSurplus = payload.totalCalories > goal.targetCalories * 1.15;
                    const fill = isSurplus ? '#f43f5e' : isOptimal ? '#10b981' : '#f59e0b';

                    return (
                      <circle
                        key={payload.dateKey}
                        cx={cx}
                        cy={cy}
                        r={5.5}
                        fill={fill}
                        stroke="#ffffff"
                        strokeWidth={2.5}
                        className="cursor-pointer hover:scale-125 transition-transform"
                        onClick={() => onSelectDate?.(payload.dateKey)}
                      />
                    );
                  }}
                  activeDot={{ r: 8, stroke: '#fef08a', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daysData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="carbsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="proteinArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fatArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} unit="g" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => {
                    if (value === 'totalCarbs') return '碳水化合物 (g)';
                    if (value === 'totalProtein') return '蛋白質 (g)';
                    if (value === 'totalFat') return '脂質 (g)';
                    return value;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalCarbs"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="url(#carbsArea)"
                />
                <Area
                  type="monotone"
                  dataKey="totalProtein"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#proteinArea)"
                />
                <Area
                  type="monotone"
                  dataKey="totalFat"
                  stackId="1"
                  stroke="#f43f5e"
                  fill="url(#fatArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend indicator notes */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              綠點: 黃金達標 (±15%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              紅點: 熱量超標
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              橘點: 偏低或微調
            </span>
          </div>

          <span className="text-stone-400">
            💡 點擊折線上的圓點可查看當天明細
          </span>
        </div>
      </div>
    </div>
  );
};
