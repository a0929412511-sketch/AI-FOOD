import React, { useState } from 'react';
import { MealAnalysis, UserGoal, UserProfile, DailyIntakeSummary } from '../types';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { computePast7DaysIntake } from '../utils/healthCalculators';
import { X, Calendar, Clock, Trash2, ArrowRight, TrendingUp, ListOrdered, Target, User } from 'lucide-react';

interface MealHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MealAnalysis[];
  onSelectMeal: (meal: MealAnalysis) => void;
  onClearHistory: () => void;
  goal: UserGoal;
  profile: UserProfile;
  onOpenProfileModal: () => void;
}

export const MealHistoryModal: React.FC<MealHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectMeal,
  onClearHistory,
  goal,
  profile,
  onOpenProfileModal,
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'list'>('chart');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute 7-day intake data for Recharts
  const daysData: DailyIntakeSummary[] = computePast7DaysIntake(
    history,
    goal.targetCalories,
    profile.bmr
  );

  // Filter history if user clicked a specific date dot on the chart
  const filteredHistory = selectedDateFilter
    ? history.filter((m) => {
        const d = new Date(m.timestamp);
        const y = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${mo}-${day}` === selectedDateFilter;
      })
    : history;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-100 via-pink-100 to-amber-100 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📈</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-stone-900">
                  飲食歷史紀錄與趨勢分析
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  共 {history.length} 餐紀錄
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Recharts 過去一週熱量折線圖 · 每日合計達標與警示
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 transition shadow-xs cursor-pointer"
              title="調整個人目標"
            >
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>目標: {goal.targetCalories} kcal</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/60 text-stone-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switchers: Chart vs List */}
        <div className="flex border-b border-stone-200 bg-stone-50/70 p-1.5 gap-1.5 text-xs font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-white text-stone-900 shadow-xs border border-amber-200'
                : 'hover:bg-stone-200/50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-rose-500" />
            過去一週熱量走勢圖 (Recharts)
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-stone-900 shadow-xs border border-amber-200'
                : 'hover:bg-stone-200/50'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-amber-500" />
            歷史餐點明細清單 ({filteredHistory.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'chart' ? (
            /* Recharts Weekly Trend Chart & Alerts */
            <div className="space-y-4">
              <WeeklyTrendChart
                daysData={daysData}
                goal={goal}
                profile={profile}
                onSelectDate={(dateKey) => {
                  setSelectedDateFilter(dateKey);
                  setActiveTab('list');
                }}
              />

              {/* Quick switch to list prompt */}
              <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <span>想檢視每一餐的菜色照片與營養？</span>
                <button
                  onClick={() => setActiveTab('list')}
                  className="font-bold underline cursor-pointer hover:text-amber-700"
                >
                  切換至歷史餐點清單 👉
                </button>
              </div>
            </div>
          ) : (
            /* Meal List View */
            <div className="space-y-3">
              {selectedDateFilter && (
                <div className="flex items-center justify-between bg-amber-100/70 p-2.5 rounded-2xl text-xs font-bold text-amber-900">
                  <span>📅 正在篩選日期：{selectedDateFilter}</span>
                  <button
                    onClick={() => setSelectedDateFilter(null)}
                    className="underline text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    清除篩選（查看全部）
                  </button>
                </div>
              )}

              {filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-stone-400 flex flex-col items-center">
                  <span className="text-4xl mb-2">🍽️</span>
                  <p className="text-sm font-bold">該日期沒有餐點紀錄喔！</p>
                  <p className="text-xs mt-1">快拍下你的餐點，讓小幫手波波幫你評分吧～</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredHistory.map((item) => {
                    const dateStr = new Date(item.timestamp).toLocaleString('zh-TW', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectMeal(item);
                          onClose();
                        }}
                        className="flex items-center gap-3.5 p-3 rounded-2xl border-2 border-stone-200/80 hover:border-amber-300 bg-stone-50/50 hover:bg-amber-50/50 transition cursor-pointer group shadow-xs"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.mealName}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-stone-800 truncate group-hover:text-amber-800 transition">
                              {item.mealName}
                            </h4>
                            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
                              {item.overallScore} 分
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                            <span className="font-bold text-amber-700">🔥 {item.estimatedCalories} kcal</span>
                            <span>⏰ {dateStr}</span>
                            <span className="hidden sm:inline bg-white px-2 py-0.5 rounded-md border border-stone-200">
                              {item.mealType}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 shrink-0 group-hover:translate-x-1 transition" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs">
            <span className="text-stone-400">點選任一筆紀錄即可載入 Canvas 儀表板重新聆聽語音</span>
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-bold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空紀錄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
