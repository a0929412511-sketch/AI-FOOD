export interface MacroNutrient {
  grams: number;
  percentage: number;
  evaluation: string;
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  badge: string;
}

export interface MealAnalysis {
  id: string;
  timestamp: number;
  imageUrl: string;
  mealName: string;
  mealType: '早餐' | '午餐' | '晚餐' | '下午茶 / 點心';
  overallScore: number;
  scoreRating: string;
  mascotMood: 'ecstatic' | 'happy' | 'encouraging' | 'gentle_warning';
  estimatedCalories: number;
  calorieTargetPercent: number;
  macroNutrients: {
    carbs: MacroNutrient;
    protein: MacroNutrient;
    fat: MacroNutrient;
    fiber: { grams: number; evaluation: string };
    sodium: { mg: number; evaluation: string };
  };
  glycemicIndex: '低 GI' | '中 GI' | '高 GI';
  foodItems: FoodItem[];
  positives: string[];
  suggestions: string[];
  voiceScript: string;
  audioBase64?: string;
}

export interface UserProfile {
  name: string;
  gender: 'female' | 'male' | 'other';
  age: number;
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  bmr: number;
  tdee: number;
}

export interface UserGoal {
  name: string;
  dietType: '均衡飲食' | '減脂輕盈' | '增肌運動' | '減醣低碳';
  targetCalories: number;
  targetProtein: number; // grams
  targetWater: number; // ml
}

export interface DailyIntakeSummary {
  dateKey: string; // YYYY-MM-DD
  displayDate: string; // 10/01 週三
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalSodium: number;
  mealCount: number;
  averageScore: number;
  targetCalories: number;
  difference: number; // totalCalories - targetCalories
  status: 'optimal' | 'surplus' | 'under' | 'warning';
  alertMessage?: string;
}

export interface WaterLogItem {
  id: string;
  timestamp: number;
  amount: number; // ml
  label: string;
}

export interface DailyHydration {
  dateKey: string; // YYYY-MM-DD
  totalWater: number; // ml
  targetWater: number; // ml
  logs: WaterLogItem[];
}

