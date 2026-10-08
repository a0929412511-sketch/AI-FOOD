import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MealAnalysis } from '../types';
import { Sparkles, Download, Volume2, RotateCcw, Heart, CheckCircle2 } from 'lucide-react';

interface CanvasDashboardProps {
  meal: MealAnalysis;
  onPlayVoice: () => void;
  isPlayingVoice: boolean;
  waterIntake?: number;
  waterTarget?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  shape: 'circle' | 'heart' | 'star' | 'confetti';
}

export const CanvasDashboard: React.FC<CanvasDashboardProps> = ({
  meal,
  onPlayVoice,
  isPlayingVoice,
  waterIntake = 0,
  waterTarget = 2000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [boboBounce, setBoboBounce] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameId = useRef<number | null>(null);

  // Animation states
  const scoreProgressRef = useRef(0);
  const targetScore = meal.overallScore;
  const timeRef = useRef(0);

  // Initialize confetti & particles
  const triggerConfetti = useCallback(() => {
    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#fbbf24'];
    const newParticles: Particle[] = [];
    const count = meal.overallScore >= 80 ? 60 : 35;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      newParticles.push({
        x: 400,
        y: 260,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        shape: Math.random() > 0.6 ? 'heart' : Math.random() > 0.3 ? 'star' : 'confetti',
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, [meal.overallScore]);

  // Initial trigger when meal changes
  useEffect(() => {
    scoreProgressRef.current = 0;
    particlesRef.current = [];
    triggerConfetti();
  }, [meal.id, triggerConfetti]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;
      timeRef.current += 0.03;
      const t = timeRef.current;

      // Animate score counter smoothly
      if (scoreProgressRef.current < targetScore) {
        scoreProgressRef.current += Math.max(0.4, (targetScore - scoreProgressRef.current) * 0.08);
        if (Math.abs(scoreProgressRef.current - targetScore) < 0.2) {
          scoreProgressRef.current = targetScore;
        }
      }

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background & draw lovely gradient with cute pastel tones
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (targetScore >= 85) {
        bgGrad.addColorStop(0, '#fef9c3'); // soft lemon yellow
        bgGrad.addColorStop(0.5, '#ecfdf5'); // fresh mint
        bgGrad.addColorStop(1, '#fed7aa'); // peach
      } else if (targetScore >= 70) {
        bgGrad.addColorStop(0, '#eff6ff'); // soft blue sky
        bgGrad.addColorStop(0.5, '#fef3c7'); // warm cream
        bgGrad.addColorStop(1, '#fce7f3'); // baby pink
      } else {
        bgGrad.addColorStop(0, '#fff1f2'); // soft rose
        bgGrad.addColorStop(0.5, '#fef3c7'); // warm amber
        bgGrad.addColorStop(1, '#ffedd5'); // sweet orange
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw cute background polka dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const dotSpacing = 36;
      for (let x = 18; x < width; x += dotSpacing) {
        for (let y = 18; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw floating gentle bubbles
      for (let i = 0; i < 6; i++) {
        const bx = (width * 0.15 * (i + 1) + Math.sin(t + i) * 20) % width;
        const by = (height * 0.18 * ((i * 2) % 5 + 1) + Math.cos(t * 0.7 + i) * 15);
        const bRad = 18 + (i % 3) * 12;
        ctx.beginPath();
        ctx.arc(bx, by, bRad, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 2. Draw Top Cute Banner: Meal Name & Type
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.06)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Banner card
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 30, 24, width - 60, 68, 20);
      ctx.fill();
      ctx.restore();

      // Meal Type Tag
      ctx.fillStyle = '#fb7185';
      roundRect(ctx, 46, 36, 70, 28, 14);
      ctx.fill();
      ctx.font = 'bold 14px "M PLUS Rounded 1c", "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(meal.mealType, 81, 55);

      // Meal Name
      ctx.font = 'bold 22px "Fredoka", "M PLUS Rounded 1c", "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'left';
      ctx.fillText(meal.mealName, 130, 56);

      // Low/Mid/High GI tag
      const giColor = meal.glycemicIndex === '低 GI' ? '#10b981' : meal.glycemicIndex === '中 GI' ? '#f59e0b' : '#f43f5e';
      ctx.fillStyle = giColor;
      roundRect(ctx, width - 130, 36, 80, 28, 14);
      ctx.fill();
      ctx.font = 'bold 13px "M PLUS Rounded 1c", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(meal.glycemicIndex, width - 90, 55);

      // 3. Draw Center Left: Animated Mascot "波波 Bobo"
      const boboX = 180;
      const boboBaseY = 250;
      const boboY = boboBaseY - Math.sin(t * 3) * 6 - boboBounce;

      drawCuteBobo(ctx, boboX, boboY, meal.mascotMood, t, isPlayingVoice);

      // 4. Speech Bubble from Bobo
      drawSpeechBubble(ctx, boboX + 80, boboY - 60, meal.voiceScript, isPlayingVoice, t);

      // 5. Draw Center Right: Big Animated Score Dial
      const dialX = width - 200;
      const dialY = 230;
      const dialRadius = 90;

      drawScoreDial(ctx, dialX, dialY, dialRadius, scoreProgressRef.current, targetScore, meal.scoreRating, t);

      // 6. Draw Bottom Section: Macro Nutrients & Calorie Cards
      const cardY = 380;
      const cardHeight = 160;

      // Card Background
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.06)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      roundRect(ctx, 30, cardY, width - 60, cardHeight, 24);
      ctx.fill();
      ctx.restore();

      // Card Header
      ctx.font = 'bold 16px "M PLUS Rounded 1c", "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.textAlign = 'left';
      ctx.fillText('🥗 營養素均衡度評估', 52, cardY + 32);

      // Hydration badge on Canvas
      const waterPillX = width - 425;
      ctx.fillStyle = '#f0f9ff';
      roundRect(ctx, waterPillX, cardY + 14, 180, 32, 16);
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 13px "Fredoka", "M PLUS Rounded 1c", sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.textAlign = 'center';
      const waterPercent = Math.min(100, Math.round((waterIntake / waterTarget) * 100));
      ctx.fillText(`💧 補水: ${waterIntake}/${waterTarget}ml (${waterPercent}%)`, waterPillX + 90, cardY + 35);

      // Calorie highlight pill
      ctx.fillStyle = '#fef2f2';
      roundRect(ctx, width - 230, cardY + 14, 180, 32, 16);
      ctx.fill();
      ctx.strokeStyle = '#fecaca';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 15px "Fredoka", sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 估算熱量: ${meal.estimatedCalories} kcal`, width - 140, cardY + 35);

      // Draw 4 Macro Progress Bars (Carbs, Protein, Fat, Fiber)
      const macros = [
        {
          label: '🍚 碳水',
          val: `${meal.macroNutrients.carbs.grams}g (${meal.macroNutrients.carbs.percentage}%)`,
          eval: meal.macroNutrients.carbs.evaluation,
          percent: Math.min(100, (meal.macroNutrients.carbs.grams / 70) * 100),
          color: '#fbbf24',
          x: 52,
        },
        {
          label: '🥩 蛋白質',
          val: `${meal.macroNutrients.protein.grams}g (${meal.macroNutrients.protein.percentage}%)`,
          eval: meal.macroNutrients.protein.evaluation,
          percent: Math.min(100, (meal.macroNutrients.protein.grams / 40) * 100),
          color: '#34d399',
          x: 232,
        },
        {
          label: '🥑 脂質',
          val: `${meal.macroNutrients.fat.grams}g (${meal.macroNutrients.fat.percentage}%)`,
          eval: meal.macroNutrients.fat.evaluation,
          percent: Math.min(100, (meal.macroNutrients.fat.grams / 30) * 100),
          color: '#f472b6',
          x: 412,
        },
        {
          label: '🥦 纖維',
          val: `${meal.macroNutrients.fiber.grams}g`,
          eval: meal.macroNutrients.fiber.evaluation,
          percent: Math.min(100, (meal.macroNutrients.fiber.grams / 10) * 100),
          color: '#38bdf8',
          x: 592,
        },
      ];

      const barWidth = 155;
      macros.forEach((m) => {
        // Label & value
        ctx.font = 'bold 14px "M PLUS Rounded 1c", sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'left';
        ctx.fillText(m.label, m.x, cardY + 70);

        ctx.font = '12px "Fredoka", sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'right';
        ctx.fillText(m.val, m.x + barWidth, cardY + 70);

        // Progress bar background track
        ctx.fillStyle = '#f3f4f6';
        roundRect(ctx, m.x, cardY + 80, barWidth, 12, 6);
        ctx.fill();

        // Active progress bar
        const fillW = Math.max(8, (barWidth * m.percent) / 100);
        ctx.fillStyle = m.color;
        roundRect(ctx, m.x, cardY + 80, fillW, 12, 6);
        ctx.fill();

        // Evaluation badge
        ctx.fillStyle = '#f9fafb';
        roundRect(ctx, m.x, cardY + 104, barWidth, 24, 8);
        ctx.fill();
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = 'bold 12px "M PLUS Rounded 1c", sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.textAlign = 'center';
        ctx.fillText(`✨ ${m.eval}`, m.x + barWidth / 2, cardY + 120);
      });

      // 7. Update and Draw Confetti / Heart Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.rotation += p.vRot;
        p.alpha -= 0.012;

        if (p.alpha <= 0 || p.y > height + 20) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'heart') {
          drawHeart(ctx, 0, 0, p.size);
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [meal, isPlayingVoice, targetScore, boboBounce, waterIntake, waterTarget]);

  // Click Mascot to bounce & confetti
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicked Bobo area (approx x: 100-260, y: 160-320)
    if (x >= 90 && x <= 270 && y >= 150 && y <= 330) {
      setBoboBounce(18);
      setTimeout(() => setBoboBounce(0), 300);
      triggerConfetti();
      onPlayVoice();
    }
  };

  // Export Canvas as cute high-res PNG image
  const handleExportCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `飲控小幫手_${meal.mealName.replace(/[^\w\u4e00-\u9fa5]/g, '')}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      {/* Canvas Wrapper */}
      <div className="relative w-full overflow-hidden rounded-3xl shadow-xl border-4 border-amber-200 bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={560}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer block select-none"
          title="點擊可愛波波聽語音與慶祝！"
        />

        {/* Floating Quick Action Overlay Buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => {
              triggerConfetti();
              setBoboBounce(15);
              setTimeout(() => setBoboBounce(0), 300);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-pink-100 hover:bg-pink-200 text-pink-700 transition shadow-sm border border-pink-300 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" />
            慶祝撒花
          </button>

          <button
            onClick={onPlayVoice}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm border active:scale-95 cursor-pointer ${
              isPlayingVoice
                ? 'bg-amber-400 text-amber-950 border-amber-500 animate-pulse'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isPlayingVoice ? '波波說話中...' : '波波語音講解'}
          </button>

          <button
            onClick={handleExportCard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition shadow-sm active:scale-95 cursor-pointer"
          >
            {copySuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                已下載卡片!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                儲存分享卡
              </>
            )}
          </button>
        </div>

        {/* Interactive Click Tip Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full text-[11px] font-medium text-stone-500 border border-amber-200 pointer-events-none flex items-center gap-1">
          <Heart className="w-3 h-3 text-pink-500 fill-pink-500 animate-bounce" />
          點擊畫面中的營養師波波，會跳躍撒花並為你加油喔！
        </div>
      </div>
    </div>
  );
};

// ================= Canvas Drawing Helper Functions ================= //

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCuteBobo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  mood: string,
  t: number,
  isSpeaking: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  // Bobo's shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(0, 68, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bobo's Main Body (Golden Creamy Fluffy Hamster / Cat)
  ctx.fillStyle = '#fde68a'; // soft golden amber
  ctx.beginPath();
  ctx.ellipse(0, 10, 50, 54, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly Patch
  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.ellipse(0, 24, 34, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute Floppy Ears
  // Left ear
  ctx.fillStyle = '#fcd34d';
  ctx.beginPath();
  ctx.ellipse(-38, -32, 16, 20, -0.2 + Math.sin(t * 4) * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f472b6'; // pink inner ear
  ctx.beginPath();
  ctx.ellipse(-38, -32, 8, 12, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Right ear
  ctx.fillStyle = '#fcd34d';
  ctx.beginPath();
  ctx.ellipse(38, -32, 16, 20, 0.2 - Math.sin(t * 4) * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.ellipse(38, -32, 8, 12, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Blushing Cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.55)';
  ctx.beginPath();
  ctx.arc(-28, 8, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(28, 8, 11, 0, Math.PI * 2);
  ctx.fill();

  // Cute Eyes
  const blink = Math.sin(t * 2) > 0.96;
  ctx.fillStyle = '#1c1917';
  if (blink) {
    // Happy squint eyes
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(-18, -2, 8, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(18, -2, 8, Math.PI, 0);
    ctx.stroke();
  } else {
    // Round sparkling eyes
    ctx.beginPath();
    ctx.arc(-18, -2, 7, 0, Math.PI * 2);
    ctx.arc(18, -2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Catchlights in eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-20, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(16, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiny cute nose
  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.ellipse(0, 4, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute Mouth
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (isSpeaking) {
    // Open animated mouth when talking!
    const mouthOpen = 4 + Math.sin(t * 14) * 4;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, 12, mouthOpen, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (mood === 'ecstatic' || mood === 'happy') {
    // 'w' shape kawaii mouth
    ctx.arc(-4, 10, 4, 0, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(4, 10, 4, Math.PI * 0.15, Math.PI);
    ctx.stroke();
  } else {
    // gentle smile
    ctx.arc(0, 10, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // Paws
  // Left paw holding spoon/fork
  ctx.fillStyle = '#fef3c7';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-32, 28 + Math.sin(t * 3) * 3, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right paw waving
  const wave = Math.sin(t * 6) * 12;
  ctx.beginPath();
  ctx.arc(32, 26 + wave, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Chef/Dietitian Hat
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Hat band
  roundRect(ctx, -26, -54, 52, 14, 5);
  ctx.fill();
  ctx.stroke();
  // Hat puffy top
  ctx.beginPath();
  ctx.arc(-16, -64, 18, 0, Math.PI * 2);
  ctx.arc(0, -74, 22, 0, Math.PI * 2);
  ctx.arc(16, -64, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hat badge: Cute strawberry or green leaf
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🥑', 0, -56);

  ctx.restore();
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  isSpeaking: boolean,
  t: number
) {
  ctx.save();
  const bubbleW = 280;
  const bubbleH = 100;

  // Float speech bubble slightly
  const by = y + Math.sin(t * 2) * 3;

  ctx.shadowColor = 'rgba(0,0,0,0.06)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  // Bubble background
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, by, bubbleW, bubbleH, 18);
  ctx.fill();
  ctx.strokeStyle = isSpeaking ? '#f59e0b' : '#fde68a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Speech bubble pointer arrow
  ctx.beginPath();
  ctx.moveTo(x, by + 40);
  ctx.lineTo(x - 14, by + 48);
  ctx.lineTo(x, by + 56);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header inside bubble
  ctx.font = 'bold 13px "M PLUS Rounded 1c", sans-serif';
  ctx.fillStyle = '#d97706';
  ctx.textAlign = 'left';
  ctx.fillText(isSpeaking ? '🎙️ 波波正在為你朗讀...' : '💬 波波營養師悄悄話：', x + 16, by + 25);

  // Short preview of speech script
  ctx.font = '13px "M PLUS Rounded 1c", "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#374151';

  // Truncate or line wrap
  const maxLine1 = text.slice(0, 18);
  const maxLine2 = text.slice(18, 36) + (text.length > 36 ? '...' : '');

  ctx.fillText(maxLine1, x + 16, by + 50);
  ctx.fillText(maxLine2, x + 16, by + 72);

  // Animated speaking music notes if speaking
  if (isSpeaking) {
    ctx.font = '16px sans-serif';
    ctx.fillText('🎵', x + bubbleW - 30, by + 26 + Math.sin(t * 6) * 4);
  }
}

function drawScoreDial(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  currentScore: number,
  targetScore: number,
  rating: string,
  t: number
) {
  ctx.save();

  // Outer glowing ring
  ctx.save();
  ctx.shadowColor = targetScore >= 80 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Background track arc
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const totalArc = endAngle - startAngle;

  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#f3f4f6';
  ctx.stroke();

  // Active Score Arc
  const currentArc = startAngle + totalArc * (currentScore / 100);
  const scoreGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  if (targetScore >= 85) {
    scoreGrad.addColorStop(0, '#34d399');
    scoreGrad.addColorStop(1, '#059669');
  } else if (targetScore >= 70) {
    scoreGrad.addColorStop(0, '#fbbf24');
    scoreGrad.addColorStop(1, '#ea580c');
  } else {
    scoreGrad.addColorStop(0, '#fb7185');
    scoreGrad.addColorStop(1, '#e11d48');
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, currentArc);
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.strokeStyle = scoreGrad;
  ctx.stroke();

  // Score Number text
  ctx.font = 'bold 44px "Fredoka", sans-serif';
  ctx.fillStyle = '#111827';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(currentScore)}`, cx, cy - 8);

  // Subtitle "/ 100 分"
  ctx.font = 'bold 14px "M PLUS Rounded 1c", sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText('健康評分 / 100', cx, cy + 24);

  // Rating Badge ribbon below
  ctx.save();
  const badgeW = 150;
  const badgeH = 30;
  const bx = cx - badgeW / 2;
  const by = cy + r - 12;

  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = targetScore >= 80 ? '#ecfdf5' : '#fef3c7';
  roundRect(ctx, bx, by, badgeW, badgeH, 15);
  ctx.fill();
  ctx.strokeStyle = targetScore >= 80 ? '#a7f3d0' : '#fde68a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 13px "M PLUS Rounded 1c", "Noto Sans TC", sans-serif';
  ctx.fillStyle = targetScore >= 80 ? '#065f46' : '#92400e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(rating, cx, by + badgeH / 2);
  ctx.restore();

  // Decorative revolving star
  const starAngle = t * 1.5;
  const sx = cx + Math.cos(starAngle) * (r + 14);
  const sy = cy + Math.sin(starAngle) * (r + 14);
  drawStar(ctx, sx, sy, 4, 6, 3);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();

  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
  ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
  ctx.fill();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}
