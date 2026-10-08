import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, MessageCircleHeart } from 'lucide-react';

interface AudioPlayerWidgetProps {
  voiceScript: string;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onSpeedChange?: (speed: number) => void;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  voiceScript,
  isPlaying,
  onPlay,
  onStop,
}) => {
  const [speed, setSpeed] = useState<number>(1.0);

  const togglePlay = () => {
    if (isPlaying) {
      onStop();
    } else {
      onPlay();
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 via-pink-50 to-orange-50 rounded-3xl p-5 border-2 border-amber-200/80 shadow-md relative overflow-hidden">
      {/* Decorative background paw / sparkles */}
      <div className="absolute top-2 right-3 text-pink-200 opacity-40 select-none text-6xl pointer-events-none">
        🐾
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Mascot Avatar & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner ${isPlaying ? 'animate-bounce' : ''}`}>
              🐹
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-stone-800 flex items-center gap-1.5">
                <MessageCircleHeart className="w-4 h-4 text-pink-500" />
                波波營養師的暖心語音
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900">
                可愛關懷版
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {isPlaying ? '正在用溫柔甜美的聲音為你朗讀建議中...' : '點擊播放聽取專屬餐點分析語音'}
            </p>
          </div>
        </div>

        {/* Center: Equalizer Animation when playing */}
        {isPlaying ? (
          <div className="flex items-center gap-1 h-8 px-4 bg-white/70 backdrop-blur-sm rounded-full border border-amber-200 shadow-sm">
            {[40, 75, 95, 60, 85, 50, 90, 65, 45].map((height, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-pink-400 to-amber-400 rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
            <span className="text-xs font-semibold text-amber-700 ml-1">語音播放中</span>
          </div>
        ) : null}

        {/* Right: Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition shadow-md active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
                : 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-amber-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                暫停語音
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-amber-950" />
                播放語音說明
              </>
            )}
          </button>

          <button
            onClick={() => {
              onStop();
              setTimeout(onPlay, 100);
            }}
            title="重新播放"
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spoken Script Transcription Box */}
      <div className="mt-3.5 bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 border border-amber-200/60 shadow-sm">
        <p className="text-xs md:text-sm text-stone-700 leading-relaxed font-medium">
          <span className="text-pink-500 font-bold mr-1">“</span>
          {voiceScript}
          <span className="text-pink-500 font-bold ml-1">”</span>
        </p>
      </div>
    </div>
  );
};
