import { UserProfile, UserGoal, MealAnalysis, DailyIntakeSummary } from '../types';

// Calculate BMR using Mifflin-St Jeor equation
export function calculateBMR(profile: Omit<UserProfile, 'bmr' | 'tdee'>): number {
  const { weight, height, age, gender } = profile;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(Math.max(1000, bmr));
}

// Calculate TDEE based on activity level
export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  const multipliers: Record<UserProfile['activityLevel'], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

// Calculate Recommended Calorie Target based on diet type
export function calculateRecommendedCalories(
  tdee: number,
  dietType: UserGoal['dietType']
): number {
  switch (dietType) {
    case '減脂輕盈':
      return Math.round(Math.max(1200, tdee - 400));
    case '增肌運動':
      return Math.round(tdee + 350);
    case '減醣低碳':
      return Math.round(tdee - 150);
    case '均衡飲食':
    default:
      return Math.round(tdee);
  }
}

// Group meals into past 7 days and compute totals, progress, and alerts
export function computePast7DaysIntake(
  meals: MealAnalysis[],
  targetCalories: number,
  bmr: number = 1350
): DailyIntakeSummary[] {
  const days: DailyIntakeSummary[] = [];
  const now = new Date();

  // Create buckets for past 7 days (day 6 ago to today 0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const weekdayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const weekday = weekdayNames[d.getDay()];
    const isToday = i === 0;
    const displayDate = isToday ? `今天 (${month}/${day})` : `${month}/${day} ${weekday}`;

    // Filter meals for this day
    const dayMeals = meals.filter((m) => {
      const mealDate = new Date(m.timestamp);
      return (
        mealDate.getFullYear() === year &&
        String(mealDate.getMonth() + 1).padStart(2, '0') === month &&
        String(mealDate.getDate()).padStart(2, '0') === day
      );
    });

    const totalCalories = dayMeals.reduce((sum, m) => sum + (m.estimatedCalories || 0), 0);
    const totalProtein = dayMeals.reduce((sum, m) => sum + (m.macroNutrients?.protein?.grams || 0), 0);
    const totalCarbs = dayMeals.reduce((sum, m) => sum + (m.macroNutrients?.carbs?.grams || 0), 0);
    const totalFat = dayMeals.reduce((sum, m) => sum + (m.macroNutrients?.fat?.grams || 0), 0);
    const totalSodium = dayMeals.reduce((sum, m) => sum + (m.macroNutrients?.sodium?.mg || 0), 0);
    const averageScore =
      dayMeals.length > 0
        ? Math.round(dayMeals.reduce((sum, m) => sum + (m.overallScore || 0), 0) / dayMeals.length)
        : 0;

    const difference = totalCalories - targetCalories;
    let status: DailyIntakeSummary['status'] = 'optimal';
    let alertMessage: string | undefined = undefined;

    if (totalCalories === 0) {
      status = 'optimal';
      alertMessage = isToday ? '今天還沒記錄餐點喔，快拍一張吧！' : '當天無紀錄';
    } else if (totalCalories > targetCalories * 1.18) {
      status = 'surplus';
      alertMessage = `熱量超額 +${difference} kcal！波波提醒：適度散步 30 分鐘，晚餐多吃高纖青菜平衡喔～`;
    } else if (totalCalories < bmr && !isToday) {
      status = 'under';
      alertMessage = `攝取低於基礎代謝 (${totalCalories} < ${bmr} kcal)，過度少吃會降低新陳代謝喔！`;
    } else if (totalCalories >= targetCalories * 0.88 && totalCalories <= targetCalories * 1.15) {
      status = 'optimal';
      alertMessage = '🎉 黃金達標！熱量與目標控制得非常完美！';
    } else if (totalSodium > 2400) {
      status = 'warning';
      alertMessage = `鈉攝取偏高 (${totalSodium}mg)，注意水腫，記得多喝溫水排出多餘鹽分！`;
    } else {
      status = 'optimal';
    }

    days.push({
      dateKey,
      displayDate,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalSodium,
      mealCount: dayMeals.length,
      averageScore,
      targetCalories,
      difference,
      status,
      alertMessage,
    });
  }

  return days;
}

// Generate realistic initial 7-day seed meals if user starts fresh
export function generateSeed7DaysMeals(): MealAnalysis[] {
  const seedMeals: MealAnalysis[] = [];
  const now = Date.now();
  const oneDay = 24 * 3600 * 1000;

  // Day -6
  seedMeals.push({
    id: 'seed-d6-1',
    timestamp: now - 6 * oneDay + 8 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    mealName: '歐姆蛋生菜全麥三明治 🥪',
    mealType: '早餐',
    overallScore: 88,
    scoreRating: '元氣滿分 💖',
    mascotMood: 'happy',
    estimatedCalories: 380,
    calorieTargetPercent: 22,
    macroNutrients: {
      carbs: { grams: 44, percentage: 46, evaluation: '優質全麥' },
      protein: { grams: 18, percentage: 22, evaluation: '足量' },
      fat: { grams: 14, percentage: 32, evaluation: '適中' },
      fiber: { grams: 5.2, evaluation: '高纖' },
      sodium: { mg: 490, evaluation: '清爽' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '全麥三明治', portion: '1份', calories: 380, badge: '高纖全穀 🌾' }],
    positives: ['全穀澱粉能穩定晨間精神！'],
    suggestions: ['中午記得補充足夠蔬菜～'],
    voiceScript: '早安！三明治營養很均衡喔！',
  });
  seedMeals.push({
    id: 'seed-d6-2',
    timestamp: now - 6 * oneDay + 12.5 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    mealName: '炙燒鮭魚蕎麥彩蔬碗 🥗',
    mealType: '午餐',
    overallScore: 94,
    scoreRating: '營養模範生 🌟',
    mascotMood: 'ecstatic',
    estimatedCalories: 560,
    calorieTargetPercent: 32,
    macroNutrients: {
      carbs: { grams: 52, percentage: 38, evaluation: '低升糖' },
      protein: { grams: 36, percentage: 30, evaluation: '豐富' },
      fat: { grams: 20, percentage: 32, evaluation: '優質脂質' },
      fiber: { grams: 7.5, evaluation: '極高纖' },
      sodium: { mg: 510, evaluation: '清淡' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '炙燒鮭魚', portion: '140g', calories: 280, badge: 'Omega-3 🐟' }],
    positives: ['深海魚油保護心血管！'],
    suggestions: ['下午多喝水！'],
    voiceScript: '這餐真是太完美了！繼續保持！',
  });
  seedMeals.push({
    id: 'seed-d6-3',
    timestamp: now - 6 * oneDay + 18.5 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    mealName: '嫩煎雞里肌彩椒溫沙拉 🥗',
    mealType: '晚餐',
    overallScore: 90,
    scoreRating: '輕盈無負擔 👍',
    mascotMood: 'happy',
    estimatedCalories: 450,
    calorieTargetPercent: 26,
    macroNutrients: {
      carbs: { grams: 35, percentage: 32, evaluation: '輕量' },
      protein: { grams: 42, percentage: 44, evaluation: '高蛋白' },
      fat: { grams: 12, percentage: 24, evaluation: '低脂' },
      fiber: { grams: 6.8, evaluation: '豐富' },
      sodium: { mg: 420, evaluation: '清淡' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '嫩煎雞里肌', portion: '160g', calories: 210, badge: '低脂蛋白 🍗' }],
    positives: ['晚上少負擔好入眠！'],
    suggestions: ['睡前可喝點溫水。'],
    voiceScript: '晚餐吃得清爽又營養，波波給你一個大大的讚！',
  });

  // Day -5 (slightly low / busy day)
  seedMeals.push({
    id: 'seed-d5-1',
    timestamp: now - 5 * oneDay + 12 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80',
    mealName: '香煎牛排佐烤蔬菜餐盒 🥩',
    mealType: '午餐',
    overallScore: 86,
    scoreRating: '高蛋白能量補給 👍',
    mascotMood: 'happy',
    estimatedCalories: 680,
    calorieTargetPercent: 38,
    macroNutrients: {
      carbs: { grams: 48, percentage: 28, evaluation: '適中' },
      protein: { grams: 45, percentage: 36, evaluation: '優質高蛋白' },
      fat: { grams: 28, percentage: 36, evaluation: '適量' },
      fiber: { grams: 5.5, evaluation: '充足' },
      sodium: { mg: 620, evaluation: '適中' },
    },
    glycemicIndex: '中 GI',
    foodItems: [{ name: '頂級牛排', portion: '150g', calories: 340, badge: '鐵質紅肉 🥩' }],
    positives: ['鐵質與蛋白質充足，體力充沛！'],
    suggestions: ['晚餐可以多吃蔬菜喔～'],
    voiceScript: '牛排香氣撲鼻，蛋白質超充足！',
  });
  seedMeals.push({
    id: 'seed-d5-2',
    timestamp: now - 5 * oneDay + 19 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    mealName: '鮮蝦水煮蛋藜麥沙拉 🍤',
    mealType: '晚餐',
    overallScore: 89,
    scoreRating: '輕食低卡首選 🌟',
    mascotMood: 'happy',
    estimatedCalories: 460,
    calorieTargetPercent: 26,
    macroNutrients: {
      carbs: { grams: 40, percentage: 35, evaluation: '低GI' },
      protein: { grams: 35, percentage: 36, evaluation: '鮮甜高蛋白' },
      fat: { grams: 12, percentage: 29, evaluation: '優良油脂' },
      fiber: { grams: 6.2, evaluation: '高纖' },
      sodium: { mg: 540, evaluation: '清淡' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '無毒白蝦仁', portion: '100g', calories: 120, badge: '低脂高蛋白 🍤' }],
    positives: ['鮮蝦低脂又高蛋白！'],
    suggestions: ['保持這個節奏！'],
    voiceScript: '晚餐吃得好精緻，身體輕盈無負擔～',
  });

  // Day -4 (Surplus cheat day)
  seedMeals.push({
    id: 'seed-d4-1',
    timestamp: now - 4 * oneDay + 12 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    mealName: '起司牛肉漢堡佐黃金脆薯 🍔',
    mealType: '午餐',
    overallScore: 60,
    scoreRating: '療癒放縱小聚餐 🍩',
    mascotMood: 'encouraging',
    estimatedCalories: 950,
    calorieTargetPercent: 55,
    macroNutrients: {
      carbs: { grams: 92, percentage: 42, evaluation: '精緻澱粉多' },
      protein: { grams: 32, percentage: 18, evaluation: '足量' },
      fat: { grams: 48, percentage: 40, evaluation: '油脂偏高' },
      fiber: { grams: 2.5, evaluation: '纖維偏低' },
      sodium: { mg: 1420, evaluation: '重口味鈉高' },
    },
    glycemicIndex: '高 GI',
    foodItems: [{ name: '起司漢堡薯條', portion: '1套', calories: 950, badge: '高熱量美食 🍔' }],
    positives: ['心靈完全被療癒啦，偶爾放鬆很棒！'],
    suggestions: ['下午喝大杯溫水或無糖綠茶排水！'],
    voiceScript: '今天吃漢堡好享受呀！放鬆一下沒關係，明天再補青菜就平衡囉！',
  });
  seedMeals.push({
    id: 'seed-d4-2',
    timestamp: now - 4 * oneDay + 18.5 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    mealName: '清爽高纖蔬菜豆腐湯 🍲',
    mealType: '晚餐',
    overallScore: 92,
    scoreRating: '聰明平衡大師 🌟',
    mascotMood: 'ecstatic',
    estimatedCalories: 380,
    calorieTargetPercent: 22,
    macroNutrients: {
      carbs: { grams: 28, percentage: 30, evaluation: '低碳' },
      protein: { grams: 26, percentage: 34, evaluation: '植物蛋白' },
      fat: { grams: 14, percentage: 36, evaluation: '黃豆好油' },
      fiber: { grams: 8.5, evaluation: '極高纖' },
      sodium: { mg: 460, evaluation: '低鈉' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '蔬菜豆腐湯', portion: '1碗', calories: 380, badge: '高纖大豆 🥦' }],
    positives: ['午餐放縱後晚餐馬上用高纖蔬菜平衡，做得超棒！'],
    suggestions: ['喝杯溫水早點休息！'],
    voiceScript: '太聰明了！晚上用高纖蔬菜平衡，熱量完全沒有失控喔！',
  });

  // Day -3 (Golden balance)
  seedMeals.push({
    id: 'seed-d3-1',
    timestamp: now - 3 * oneDay + 12 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    mealName: '彩椒酪梨厚切鮭魚定食 🥑',
    mealType: '午餐',
    overallScore: 93,
    scoreRating: '營養模範生 🌟',
    mascotMood: 'ecstatic',
    estimatedCalories: 620,
    calorieTargetPercent: 35,
    macroNutrients: {
      carbs: { grams: 55, percentage: 36, evaluation: '優質全穀' },
      protein: { grams: 38, percentage: 30, evaluation: '充足' },
      fat: { grams: 22, percentage: 34, evaluation: '好脂質' },
      fiber: { grams: 7.2, evaluation: '豐富' },
      sodium: { mg: 520, evaluation: '清爽' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '彩椒鮭魚', portion: '1盤', calories: 620, badge: '五彩植化素 🌈' }],
    positives: ['酪梨與鮭魚提供超棒的單元與多元不飽和脂肪酸！'],
    suggestions: ['飯後散步 15 分鐘更助消化！'],
    voiceScript: '哇～今天的鮭魚與酪梨配色好美，營養完全滿分！',
  });
  seedMeals.push({
    id: 'seed-d3-2',
    timestamp: now - 3 * oneDay + 18.5 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    mealName: '舒肥雞胸溫沙拉配金黃地瓜 🍠',
    mealType: '晚餐',
    overallScore: 91,
    scoreRating: '元氣達人 👍',
    mascotMood: 'happy',
    estimatedCalories: 510,
    calorieTargetPercent: 30,
    macroNutrients: {
      carbs: { grams: 46, percentage: 38, evaluation: '慢碳' },
      protein: { grams: 40, percentage: 38, evaluation: '高蛋白' },
      fat: { grams: 11, percentage: 24, evaluation: '清爽' },
      fiber: { grams: 6.5, evaluation: '高纖' },
      sodium: { mg: 480, evaluation: '清淡' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '舒肥雞胸', portion: '150g', calories: 200, badge: '優質蛋白質 🍗' }],
    positives: ['地瓜飽足感強又富含纖維！'],
    suggestions: ['今天喝水量也達標囉！'],
    voiceScript: '晚上吃地瓜加舒肥雞胸肉，蛋白質與纖維一次補齊！',
  });

  // Day -2
  seedMeals.push({
    id: 'seed-d2-1',
    timestamp: now - 2 * oneDay + 12 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    mealName: '和風照燒鯛魚彩蔬五穀便當 🍱',
    mealType: '午餐',
    overallScore: 89,
    scoreRating: '均衡小達人 👍',
    mascotMood: 'happy',
    estimatedCalories: 590,
    calorieTargetPercent: 34,
    macroNutrients: {
      carbs: { grams: 62, percentage: 42, evaluation: '五穀好碳' },
      protein: { grams: 35, percentage: 28, evaluation: '鮮嫩白肉' },
      fat: { grams: 18, percentage: 30, evaluation: '健康植物油' },
      fiber: { grams: 5.8, evaluation: '良好' },
      sodium: { mg: 590, evaluation: '適中' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '和風照燒鯛魚', portion: '1份', calories: 590, badge: '低脂鯛魚 🐟' }],
    positives: ['鯛魚低脂容易消化，五穀米提供維生素B群！'],
    suggestions: ['下午記得多補充水分～'],
    voiceScript: '便當菜色很豐富耶！吃得香又不會太油膩～',
  });
  seedMeals.push({
    id: 'seed-d2-2',
    timestamp: now - 2 * oneDay + 19 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    mealName: '義式香草舒肥雞胸肉盤 🌿',
    mealType: '晚餐',
    overallScore: 88,
    scoreRating: '輕盈健美風 💖',
    mascotMood: 'happy',
    estimatedCalories: 480,
    calorieTargetPercent: 28,
    macroNutrients: {
      carbs: { grams: 38, percentage: 32, evaluation: '適中' },
      protein: { grams: 44, percentage: 42, evaluation: '高純度蛋白質' },
      fat: { grams: 13, percentage: 26, evaluation: '低脂' },
      fiber: { grams: 6.0, evaluation: '充足' },
      sodium: { mg: 510, evaluation: '適中' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '義式雞胸', portion: '150g', calories: 190, badge: '香草低脂 🌿' }],
    positives: ['蛋白質非常紮實！'],
    suggestions: ['睡個好覺讓肌肉修復！'],
    voiceScript: '蛋白質補給得恰到好處！明天也要繼續加油唷！',
  });

  // Day -1 (Yesterday)
  seedMeals.push({
    id: 'seed-d1-1',
    timestamp: now - 1 * oneDay + 12 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    mealName: '香煎大西洋鮭魚元氣彩蔬碗 🥗',
    mealType: '午餐',
    overallScore: 92,
    scoreRating: '營養模範生 🌟',
    mascotMood: 'ecstatic',
    estimatedCalories: 640,
    calorieTargetPercent: 36,
    macroNutrients: {
      carbs: { grams: 54, percentage: 35, evaluation: '慢碳' },
      protein: { grams: 39, percentage: 29, evaluation: '高蛋白' },
      fat: { grams: 25, percentage: 36, evaluation: '優質深海魚油' },
      fiber: { grams: 7.0, evaluation: '高纖' },
      sodium: { mg: 490, evaluation: '清淡' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '香煎大西洋鮭魚', portion: '140g', calories: 280, badge: '深海好魚 🐟' }],
    positives: ['Omega-3 充足，精神飽滿！'],
    suggestions: ['下午多喝水！'],
    voiceScript: '昨天午餐吃得很豐盛呢！',
  });
  seedMeals.push({
    id: 'seed-d1-2',
    timestamp: now - 1 * oneDay + 18.5 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    mealName: '清爽彩蔬水煮雞胸肉 🍗',
    mealType: '晚餐',
    overallScore: 90,
    scoreRating: '清爽無負擔 👍',
    mascotMood: 'happy',
    estimatedCalories: 460,
    calorieTargetPercent: 26,
    macroNutrients: {
      carbs: { grams: 36, percentage: 32, evaluation: '輕量' },
      protein: { grams: 42, percentage: 44, evaluation: '高蛋白' },
      fat: { grams: 11, percentage: 24, evaluation: '低脂' },
      fiber: { grams: 6.4, evaluation: '高纖' },
      sodium: { mg: 430, evaluation: '清淡' },
    },
    glycemicIndex: '低 GI',
    foodItems: [{ name: '水煮雞胸肉', portion: '150g', calories: 190, badge: '低脂 🍗' }],
    positives: ['維持輕盈好體態！'],
    suggestions: ['早點休息！'],
    voiceScript: '晚餐吃得好清爽，波波給你一百分！',
  });

  // Day 0 (Today)
  seedMeals.push({
    id: 'seed-d0-1',
    timestamp: now - 3 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80',
    mealName: '繽紛彩蔬嫩鮭魚元氣碗 🥗🐟',
    mealType: '午餐',
    overallScore: 92,
    scoreRating: '營養模範生 🌟',
    mascotMood: 'ecstatic',
    estimatedCalories: 485,
    calorieTargetPercent: 32,
    macroNutrients: {
      carbs: { grams: 42, percentage: 35, evaluation: '優質慢碳' },
      protein: { grams: 34, percentage: 30, evaluation: '充足高蛋白' },
      fat: { grams: 18, percentage: 35, evaluation: 'Omega-3 優脂' },
      fiber: { grams: 7.5, evaluation: '極豐富高纖' },
      sodium: { mg: 480, evaluation: '低鈉清爽' },
    },
    glycemicIndex: '低 GI',
    foodItems: [
      { name: '香煎大西洋鮭魚', portion: '約 120g', calories: 240, badge: '優質深海魚油 🐟' },
      { name: '綜合水耕生菜沙拉', portion: '約 150g', calories: 35, badge: '維生素C與植化素 🥬' },
      { name: '熟成酪梨片', portion: '約 40g', calories: 65, badge: '好膽固醇健康脂肪 🥑' },
      { name: '紅藜麥彩椒蒸飯', portion: '約 100g', calories: 125, badge: '低升糖全穀雜糧 🌾' },
    ],
    positives: [
      '色彩豐富達到五色蔬果標準，植化素與抗氧化力滿分！',
      '鮭魚富含豐富的 Omega-3 脂肪酸與優質蛋白質！'
    ],
    suggestions: [
      '這餐組合非常完美！下午多喝 400cc 溫水幫助代謝。'
    ],
    voiceScript: '哈囉～小幫手波波來看你的美味餐點囉！哇～這餐獲得了 92 分的超高榮譽！五彩繽紛的蔬菜加上香嫩鮭魚，蛋白質充足又低卡高纖，簡直是健康模範生！下午記得多喝點水幫助新陳代謝喔！',
  });

  return seedMeals;
}
