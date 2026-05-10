import React from 'react';
import { motion } from 'motion/react';
import { ArduinoPin } from '../types';

interface ArduinoBoardProps {
  activePins: number[];
}

export const ArduinoBoard: React.FC<ArduinoBoardProps> = ({ activePins }) => {
  return (
    <div className="relative w-full aspect-[1.4/1] bg-[#0A2E36] rounded-2xl shadow-2xl p-8 overflow-hidden border-4 border-[#143D48]">
      {/* Circuit Trace Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" className="stroke-white">
          <path d="M0 50 L100 50 M50 0 L50 100" strokeWidth="2" fill="none" />
          <circle cx="50" cy="50" r="40" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Main Board Label */}
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center font-bold text-white shadow-lg">UNO</div>
        <span className="text-info/80 font-mono text-xs uppercase tracking-widest font-bold">MakerBlock Edition</span>
      </div>

      {/* Digital Pins Header */}
      <div className="absolute top-1/4 right-8 flex flex-col gap-3">
        {[13, 12, 11, 10, 9, 8].map(p => (
          <PinHeader key={p} label={p.toString()} isActive={activePins.includes(p)} />
        ))}
      </div>
      
      <div className="absolute top-1/4 right-20 flex flex-col gap-3">
        {[7, 6, 5, 4, 3, 2].map(p => (
          <PinHeader key={p} label={p.toString()} isActive={activePins.includes(p)} />
        ))}
      </div>

      {/* Main Microcontroller Chip */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 bg-[#1A1A1A] rounded-md border-2 border-gray-700 flex flex-col items-center justify-center">
        <div className="w-20 h-2 bg-[#2a2a2a] mb-2 rounded-full" />
        <span className="text-[10px] text-gray-500 font-mono uppercase">ATmega328P</span>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-1 bg-gray-600 rounded-full" />)}
        </div>
      </div>

      {/* Power Components */}
      <div className="absolute left-10 bottom-10 flex gap-4">
        <div className="w-12 h-16 bg-[#333] rounded shadow-inner" />
        <div className="w-16 h-10 bg-[#444] rounded shadow-inner" />
      </div>

      {/* Animated LEDs for Active Pins */}
      <div className="absolute right-4 top-1/4 flex flex-col gap-[29px] pt-1">
        {[13, 12, 11, 10, 9, 8].map(p => (
          <LED key={p} color="#3BCEAC" active={activePins.includes(p)} />
        ))}
      </div>
    </div>
  );
};

interface PinHeaderProps {
  label: string;
  isActive?: boolean;
}

const PinHeader: React.FC<PinHeaderProps> = ({ label, isActive }) => (
  <div className={`w-8 h-6 rounded flex items-center justify-center text-[10px] font-bold font-mono transition-colors ${isActive ? 'bg-secondary text-dark shadow-[0_0_15px_rgba(59,206,172,0.5)]' : 'bg-dark/50 text-gray-400'}`}>
    {label}
  </div>
);

interface LEDProps {
  color: string;
  active?: boolean;
}

const LED: React.FC<LEDProps> = ({ color, active }) => (
  <motion.div
    initial={false}
    animate={{ 
      backgroundColor: active ? color : '#333',
      scale: active ? 1.2 : 1,
      boxShadow: active ? `0 0 20px ${color}` : 'none'
    }}
    className="w-3 h-3 rounded-full"
  />
);
