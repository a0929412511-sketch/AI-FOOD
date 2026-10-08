import React from 'react';
import { UserGoal } from '../types';
import { X, Target, Flame, HeartHandshake } from 'lucide-react';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: UserGoal;
  onSaveGoal: (goal: UserGoal) => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  goal,
  onSaveGoal,
}) => {
  const [dietType, setDietType] = React.useState(goal.dietType);
  const [targetCalories, setTargetCalories] = React.useState(goal.targetCalories);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveGoal({
      ...goal,
      dietType,
      targetCalories,
    });
    onClose();
  };

  const dietOptions: { type: UserGoal['dietType']; icon: string; desc: string }[] = [
    { type: '均衡飲食', icon: '🥗', desc: '三大營養素比例黃金平衡，健康維持' },
    { type: '減脂輕盈', icon: '🏃‍♀️', desc: '適度熱量赤字，提高蔬菜高纖飽足感' },
    { type: '增肌運動', icon: '💪', desc: '著重優質高蛋白質攝取與運動後修復' },
    { type: '減醣低碳', icon: '🥑', desc: '減少精緻碳水化合物，適度好油好蛋白' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-100 to-pink-100 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-extrabold text-base text-stone-800">
                個人飲控目標設定
              </h3>
              <p className="text-xs text-stone-500">波波會依照你的目標提供專屬建議喔！</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/60 text-stone-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5">
          {/* Diet Type Selector */}
          <div>
            <label className="text-xs font-black text-stone-700 block mb-2.5">
              選擇目前的飲控方向：
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {dietOptions.map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => setDietType(opt.type)}
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

          {/* Daily Calorie Target Slider */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                一日目標總熱量
              </span>
              <span className="text-base font-extrabold text-amber-900 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">
                {targetCalories} kcal
              </span>
            </div>
            <input
              type="range"
              min="1200"
              max="2800"
              step="50"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-medium mt-1">
              <span>1200 輕食減重</span>
              <span>1800 正常維持</span>
              <span>2800 增肌活力</span>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-stone-900 font-extrabold text-sm shadow-md shadow-amber-300/50 active:scale-95 transition cursor-pointer"
          >
            儲存目標設定
          </button>
        </div>
      </div>
    </div>
  );
};
