import React, { useState } from 'react';
import { UserProfile, UserGoal } from '../types';
import {
  calculateBMR,
  calculateTDEE,
  calculateRecommendedCalories,
} from '../utils/healthCalculators';
import { X, User, Target, Flame, Activity, Sparkles, Check, Heart, Droplets } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  goal: UserGoal;
  onSave: (profile: UserProfile, goal: UserGoal) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  goal,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'goal'>('profile');

  // Profile fields state
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<UserProfile['gender']>(profile.gender);
  const [age, setAge] = useState(profile.age);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight);
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(profile.activityLevel);

  // Goal fields state
  const [dietType, setDietType] = useState<UserGoal['dietType']>(goal.dietType);
  const [targetCalories, setTargetCalories] = useState(goal.targetCalories);
  const [targetProtein, setTargetProtein] = useState(goal.targetProtein || 75);
  const [targetWater, setTargetWater] = useState(goal.targetWater || 2000);

  if (!isOpen) return null;

  // Realtime calculated values
  const currentBMR = calculateBMR({
    name,
    gender,
    age: Number(age) || 25,
    height: Number(height) || 165,
    weight: Number(weight) || 60,
    targetWeight: Number(targetWeight) || 55,
    activityLevel,
  });

  const currentTDEE = calculateTDEE(currentBMR, activityLevel);
  const recommendedCalories = calculateRecommendedCalories(currentTDEE, dietType);
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

  const handleApplyRecommended = () => {
    setTargetCalories(recommendedCalories);
  };

  const handleSave = () => {
    const updatedProfile: UserProfile = {
      name: name.trim() || '飲控夥伴',
      gender,
      age: Number(age) || 25,
      height: Number(height) || 165,
      weight: Number(weight) || 60,
      targetWeight: Number(targetWeight) || 55,
      activityLevel,
      bmr: currentBMR,
      tdee: currentTDEE,
    };

    const updatedGoal: UserGoal = {
      name: `${updatedProfile.name}的飲控目標`,
      dietType,
      targetCalories: Number(targetCalories) || recommendedCalories,
      targetProtein: Number(targetProtein) || 75,
      targetWater: Number(targetWater) || 2000,
    };

    onSave(updatedProfile, updatedGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-100 via-pink-100 to-amber-100 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-300 text-amber-950 flex items-center justify-center text-xl shadow-xs">
              🐹
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                個人健康檔案與目標設定
              </h3>
              <p className="text-xs text-stone-500">
                精準估算 BMR / TDEE 與專屬熱量警示基準
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/60 text-stone-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-stone-200 bg-stone-50/70 p-1.5 gap-1.5 text-xs font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-stone-900 shadow-xs border border-amber-200'
                : 'hover:bg-stone-200/50'
            }`}
          >
            <User className="w-4 h-4 text-amber-500" />
            個人基本資料 (BMR/TDEE)
          </button>
          <button
            onClick={() => setActiveTab('goal')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'goal'
                ? 'bg-white text-stone-900 shadow-xs border border-amber-200'
                : 'hover:bg-stone-200/50'
            }`}
          >
            <Target className="w-4 h-4 text-rose-500" />
            飲控目標與每日指標
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'profile' ? (
            /* Personal Profile Form */
            <div className="space-y-4">
              {/* Nickname & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    暱稱 / 姓名
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-semibold"
                    placeholder="請輸入暱稱"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    生理性別
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        gender === 'female'
                          ? 'bg-pink-100 text-pink-700 border-pink-300'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      女性 👩
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        gender === 'male'
                          ? 'bg-sky-100 text-sky-700 border-sky-300'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      男性 👨
                    </button>
                  </div>
                </div>
              </div>

              {/* Age, Height, Weight */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    年齡 (歲)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-semibold"
                    min="10"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-semibold"
                    min="100"
                    max="220"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    目前體重 (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-semibold"
                    min="30"
                    max="200"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Target Weight */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-700 block">
                    🎯 目標理想體重
                  </span>
                  <span className="text-[11px] text-stone-400">
                    目前體重: {weight} kg · 差距: {(weight - targetWeight).toFixed(1)} kg
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white font-extrabold text-sm text-center"
                    step="0.5"
                  />
                  <span className="text-xs font-bold text-stone-600">kg</span>
                </div>
              </div>

              {/* Activity Level Selector */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  日常活動量 (攸關 TDEE 消耗估算)：
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'sedentary', label: '久坐不動', desc: '辦公室族、缺乏運動 (x1.2)' },
                    { key: 'light', label: '輕度活動', desc: '每週運動 1~3 天 (x1.375)' },
                    { key: 'moderate', label: '中度活動', desc: '每週規律運動 3~5 天 (x1.55)' },
                    { key: 'very_active', label: '高度活動', desc: '重訓勞力每週 6~7 天 (x1.725)' },
                  ].map((act) => (
                    <div
                      key={act.key}
                      onClick={() => setActivityLevel(act.key as UserProfile['activityLevel'])}
                      className={`p-2.5 rounded-2xl border-2 transition cursor-pointer ${
                        activityLevel === act.key
                          ? 'border-amber-400 bg-amber-50/70'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="font-extrabold text-stone-800">{act.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{act.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated Metabolic Stats Preview */}
              <div className="bg-gradient-to-r from-amber-100/60 to-rose-100/60 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-extrabold text-stone-800 flex items-center gap-1">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    波波科學健康代謝估算：
                  </span>
                  <span className="text-[11px] font-bold text-stone-500">
                    BMI: <strong className="text-stone-800">{bmi}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 shadow-xs">
                    <div className="text-[11px] text-stone-500 font-bold">基礎代謝率 (BMR)</div>
                    <div className="text-lg font-black text-amber-700">{currentBMR} kcal</div>
                    <div className="text-[10px] text-stone-400">維持基本生理最低熱量</div>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 shadow-xs">
                    <div className="text-[11px] text-stone-500 font-bold">每日總消耗 (TDEE)</div>
                    <div className="text-lg font-black text-rose-600">{currentTDEE} kcal</div>
                    <div className="text-[10px] text-stone-400">含日常活動熱量總消耗</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Diet Goal Form */
            <div className="space-y-4">
              {/* Diet Type Selector */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  目前飲控風格：
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: '均衡飲食', icon: '🥗', desc: '三大營養均衡，以 TDEE 為基準維持' },
                    { type: '減脂輕盈', icon: '🏃‍♀️', desc: '適度熱量赤字 (-400 kcal)，高纖飽足' },
                    { type: '增肌運動', icon: '💪', desc: '熱量微盈 (+350 kcal)，高蛋白修復' },
                    { type: '減醣低碳', icon: '🥑', desc: '適度控醣 (-150 kcal)，優質脂肪' },
                  ].map((opt) => (
                    <div
                      key={opt.type}
                      onClick={() => setDietType(opt.type as UserGoal['dietType'])}
                      className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center text-center ${
                        dietType === opt.type
                          ? 'border-amber-400 bg-amber-50 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl mb-1">{opt.icon}</span>
                      <span className="text-xs font-extrabold text-stone-800">{opt.type}</span>
                      <span className="text-[10px] text-stone-400 mt-1 leading-tight">{opt.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Calorie Banner */}
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    波波推薦每日熱量：{recommendedCalories} kcal
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">
                    依據你的 TDEE ({currentTDEE} kcal) 與「{dietType}」計算
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyRecommended}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                >
                  帶入推薦值
                </button>
              </div>

              {/* Target Calories Slider & Input */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-rose-500" />
                    每日目標攝取總熱量
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={targetCalories}
                      onChange={(e) => setTargetCalories(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg border border-amber-300 font-black text-sm text-amber-900 text-center bg-white"
                      min="1000"
                      max="3500"
                      step="50"
                    />
                    <span className="text-xs font-bold text-stone-500">kcal</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="3000"
                  step="50"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>1200 輕食減重</span>
                  <span>{currentBMR} BMR</span>
                  <span>{currentTDEE} TDEE</span>
                  <span>3000 高能增肌</span>
                </div>
              </div>

              {/* Protein & Hydration targets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
                  <span className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                    🥩 每日蛋白質目標
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={targetProtein}
                      onChange={(e) => setTargetProtein(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-xl border border-amber-300 font-bold text-sm bg-white text-center"
                    />
                    <span className="text-xs font-bold text-stone-500">克</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-1">
                    約體重 1.2~1.5 倍
                  </span>
                </div>

                <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-200">
                  <span className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    每日水分目標
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={targetWater}
                      onChange={(e) => setTargetWater(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-xl border border-sky-300 font-bold text-sm bg-white text-center"
                      step="100"
                    />
                    <span className="text-xs font-bold text-stone-500">ml</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-1">
                    約體重 x 35cc
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Save Button */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-100 transition cursor-pointer"
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 max-w-xs py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-stone-950 font-black text-sm shadow-md shadow-amber-200/50 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            儲存個人設定與目標
          </button>
        </div>
      </div>
    </div>
  );
};
