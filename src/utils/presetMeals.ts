import { MealAnalysis } from '../types';

export const PRESET_MEALS: MealAnalysis[] = [
  {
    id: 'preset-salmon',
    timestamp: Date.now() - 3600000,
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
      { name: '有機溏心蛋', portion: '半顆 (25g)', calories: 40, badge: '卵磷脂與維生素D 🥚' },
    ],
    positives: [
      '色彩豐富達到五色蔬果標準，植化素與抗氧化力滿分！',
      '鮭魚富含豐富的 Omega-3 脂肪酸與優質蛋白質，超助燃脂與修復！',
      '搭配低 GI 藜麥，血糖穩定不易昏睡～'
    ],
    suggestions: [
      '這餐組合非常完美！下午工作時可以多喝 400cc 溫水幫助代謝。',
      '如果晚點要運動，可以再補充一小把堅果或一份低糖水果喔！'
    ],
    voiceScript: '哈囉～小幫手波波來看你的美味餐點囉！哇～太厲害了，這餐獲得了 92 分的超高榮譽！五彩繽紛的蔬菜加上香嫩鮭魚，蛋白質充足又低卡高纖，簡直是健康模範生！下午記得多喝點水幫助新陳代謝，今天也要元氣滿滿喔！',
  },
  {
    id: 'preset-chicken',
    timestamp: Date.now() - 7200000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop&q=80',
    mealName: '舒肥迷迭香雞胸輕食盒 🍗🌿',
    mealType: '晚餐',
    overallScore: 86,
    scoreRating: '增肌減脂小達人 👍',
    mascotMood: 'happy',
    estimatedCalories: 430,
    calorieTargetPercent: 28,
    macroNutrients: {
      carbs: { grams: 38, percentage: 36, evaluation: '地瓜優碳' },
      protein: { grams: 38, percentage: 40, evaluation: '超充沛高蛋白' },
      fat: { grams: 11, percentage: 24, evaluation: '清爽低油脂' },
      fiber: { grams: 6.2, evaluation: '豐富纖維' },
      sodium: { mg: 520, evaluation: '適中微鹽' },
    },
    glycemicIndex: '低 GI',
    foodItems: [
      { name: '義式舒肥雞胸肉', portion: '約 150g', calories: 195, badge: '極低脂高蛋白 🍗' },
      { name: '黃金烤地瓜', portion: '約 110g', calories: 120, badge: '高纖複合碳水 🍠' },
      { name: '清蒸綠花椰菜', portion: '約 100g', calories: 35, badge: '十字花科抗氧化 🥦' },
      { name: '小番茄與水煮蛋', portion: '約 80g', calories: 80, badge: '茄紅素滿分 🍅' },
    ],
    positives: [
      '蛋白質高達 38g，對於肌肉修復與維持飽足感效果極佳！',
      '選用地瓜代替白米飯，膳食纖維更豐富且升糖指數溫和！'
    ],
    suggestions: [
      '整體油脂稍偏低，可以稍微淋一點點冷壓初榨橄欖油吸收脂溶性維生素。',
      '睡前如果容易肚子餓，喝一杯無糖溫豆漿就剛剛好囉～'
    ],
    voiceScript: '波波小幫手來檢查你的晚餐囉！這餐拿到 86 分的好成績呢！舒肥雞胸肉蛋白質超豐富，熱量控制得宜，地瓜也很高纖！波波溫柔提醒你，可以稍微補充一小匙優質橄欖油吸收維生素喔～你真的做得很棒，繼續保持！',
  },
  {
    id: 'preset-guilty',
    timestamp: Date.now() - 10800000,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=80',
    mealName: '雙層起司培根牛肉堡套餐 🍔🍟',
    mealType: '午餐',
    overallScore: 56,
    scoreRating: '幸福療癒放縱餐 🍩',
    mascotMood: 'encouraging',
    estimatedCalories: 920,
    calorieTargetPercent: 58,
    macroNutrients: {
      carbs: { grams: 88, percentage: 40, evaluation: '精緻澱粉偏高' },
      protein: { grams: 28, percentage: 15, evaluation: '足量但伴隨脂肪' },
      fat: { grams: 46, percentage: 45, evaluation: '飽和脂肪偏高' },
      fiber: { grams: 2.1, evaluation: '纖維嚴重不足' },
      sodium: { mg: 1350, evaluation: '偏重口味鈉高' },
    },
    glycemicIndex: '高 GI',
    foodItems: [
      { name: '厚切牛肉起司漢堡', portion: '約 240g', calories: 580, badge: '濃郁肉感與起司 🧀' },
      { name: '酥炸美式金黃脆薯', portion: '約 110g', calories: 340, badge: '高油香脆澱粉 🍟' },
    ],
    positives: [
      '偶爾享受美食能釋放壓力，讓心靈充電，美食當前開心最重要！',
      '牛肉提供了鐵質與蛋白質，體力瞬間補滿！'
    ],
    suggestions: [
      '今天晚餐建議多吃兩碗深綠色蔬菜，並改吃清蒸水煮輕食來平衡。',
      '下午記得大口喝足 600ml 的水或無糖綠茶，幫助排出多餘的鈉！',
      '如果晚上散步 30 分鐘，熱量就消耗一大半囉！波波陪你～'
    ],
    voiceScript: '哈囉哈囉～聞到漢堡的香味啦！這餐雖然油脂跟熱量比較高，拿到 56 分，但偶爾犒賞自己吃頓美味大餐是完全沒問題的唷！波波提醒你，今天下午多喝兩杯無糖綠茶或白開水，晚餐換成清爽的蔬菜湯或沙拉，就能完美平衡囉！抱一個～不用自責唷！',
  },
];
