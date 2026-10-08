import React from 'react';
import { MealAnalysis } from '../types';
import { Heart, ThumbsUp, Sparkles, AlertCircle, Droplets, Utensils, Activity, ShieldCheck } from 'lucide-react';

interface MealDetailCardsProps {
  meal: MealAnalysis;
}

export const MealDetailCards: React.FC<MealDetailCardsProps> = ({ meal }) => {
  return (
    <div className="w-full space-y-6">
      {/* 1. Identified Ingredients / Food List */}
      <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
              🍱
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-800">
                照片偵測食材與份量
              </h3>
              <p className="text-xs text-stone-400">AI 智慧視覺自動辨識盤中餐點</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            共偵測到 {meal.foodItems.length} 項食材
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {meal.foodItems.map((item, idx) => (
            <div
              key={idx}
              className="group bg-amber-50/50 hover:bg-amber-100/60 rounded-2xl p-3.5 border border-amber-200/70 transition duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-stone-800">{item.name}</span>
                <span className="text-xs font-bold text-rose-500 bg-white px-2 py-0.5 rounded-full border border-rose-100 shadow-xs">
                  {item.calories} kcal
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-stone-500">
                <span>份量: {item.portion}</span>
                <span className="font-medium text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-md">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Praise & Gentle Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Praise & Positives */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/60 rounded-3xl p-6 border-2 border-emerald-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-1.5">
                做得超棒的地方！
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                  波波誇獎
                </span>
              </h3>
              <p className="text-xs text-emerald-700/80">值得繼續保持的健康亮點</p>
            </div>
          </div>

          <ul className="space-y-3">
            {meal.positives.map((pos, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-emerald-200/60 text-xs sm:text-sm text-emerald-900 font-medium"
              >
                <ThumbsUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{pos}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Loving Suggestions */}
        <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/60 rounded-3xl p-6 border-2 border-amber-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-lg">
              🌱
            </div>
            <div>
              <h3 className="font-extrabold text-base text-amber-950 flex items-center gap-1.5">
                波波的溫柔小叮嚀
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                  輕鬆微調
                </span>
              </h3>
              <p className="text-xs text-amber-700/80">不造成心理壓力的健康小妙招</p>
            </div>
          </div>

          <ul className="space-y-3">
            {meal.suggestions.map((sug, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/60 text-xs sm:text-sm text-stone-800 font-medium"
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Detailed Micronutrient & Health Indicators */}
      <div className="bg-white rounded-3xl p-6 border-2 border-stone-200/80 shadow-sm">
        <h3 className="font-extrabold text-base text-stone-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          健康指標小幫手檢查
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Fiber */}
          <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-xl">
              🥦
            </div>
            <div>
              <div className="text-xs font-bold text-stone-500">膳食纖維</div>
              <div className="text-base font-extrabold text-stone-800">
                {meal.macroNutrients.fiber.grams} 克
              </div>
              <span className="text-[11px] font-semibold text-sky-600">
                狀態：{meal.macroNutrients.fiber.evaluation}
              </span>
            </div>
          </div>

          {/* Sodium */}
          <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl">
              🧂
            </div>
            <div>
              <div className="text-xs font-bold text-stone-500">估計鈉含量</div>
              <div className="text-base font-extrabold text-stone-800">
                {meal.macroNutrients.sodium.mg} 毫克
              </div>
              <span className="text-[11px] font-semibold text-rose-600">
                狀態：{meal.macroNutrients.sodium.evaluation}
              </span>
            </div>
          </div>

          {/* Glycemic Index */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <div className="text-xs font-bold text-stone-500">升糖指數 (GI)</div>
              <div className="text-base font-extrabold text-stone-800">
                {meal.glycemicIndex}
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">
                {meal.glycemicIndex === '低 GI' ? '血糖波動平緩 😊' : '注意適當餐後走動 🚶'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
