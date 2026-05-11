import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArduinoPin } from '../types';
import { Lightbulb, Volume2, Cpu, Wind, Monitor } from 'lucide-react';

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
          <path d="M20 20 L80 80 M80 20 L20 80" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="40" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Main Board Label */}
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center font-bold text-white shadow-lg">UNO</div>
        <div className="flex flex-col">
          <span className="text-info/80 font-mono text-xs uppercase tracking-widest font-black">MakerBlock</span>
          <span className="text-[8px] text-info/50 font-mono uppercase tracking-[0.3em]">Hardware Visualizer</span>
        </div>
      </div>

      {/* Component Visualizers (Floating based on active pins) */}
      <div className="absolute bottom-20 left-10 flex gap-4">
        <AnimatePresence>
          {activePins.includes(13) && (
            <ComponentSprite key="led" icon={<Lightbulb size={16} />} color="text-yellow-400" label="D13 LED" />
          )}
          {(activePins.includes(9) || activePins.includes(8)) && (
            <ComponentSprite key="buzzer" icon={<Volume2 size={16} />} color="text-sky-400" label="Buzzer" />
          )}
          {(activePins.includes(5) || activePins.includes(6)) && (
            <ComponentSprite key="motor" icon={<Wind size={16} />} color="text-emerald-400" label="Motor" animate="spin" />
          )}
          {activePins.some(p => p >= 18) && ( // A0-A5 mapped to 18-23 internally usually
            <ComponentSprite key="sensor" icon={<Cpu size={16} />} color="text-pink-400" label="Sensor Input" />
          )}
        </AnimatePresence>
      </div>

      {/* Digital Pins Header */}
      <div className="absolute top-[80px] right-8 flex flex-col gap-2">
        {[13, 12, 11, 10, 9, 8].map(p => (
          <PinHeader key={p} label={p.toString()} isActive={activePins.includes(p)} />
        ))}
      </div>
      
      <div className="absolute top-[80px] right-20 flex flex-col gap-2">
        {[7, 6, 5, 4, 3, 2].map(p => (
          <PinHeader key={p} label={p.toString()} isActive={activePins.includes(p)} />
        ))}
      </div>

      {/* Analog Pins Header (Bottom Right) */}
      <div className="absolute bottom-6 right-8 flex gap-2">
        {[5, 4, 3, 2, 1, 0].map(p => (
          <PinHeader key={`A${p}`} label={`A${p}`} isActive={activePins.includes(18 + p)} />
        ))}
      </div>

      {/* Main Microcontroller Chip */}
      <motion.div 
        animate={activePins.length > 0 ? { boxShadow: ['0 0 10px rgba(0,210,255,0.2)', '0 0 30px rgba(0,210,255,0.4)', '0 0 10px rgba(0,210,255,0.2)'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-36 bg-[#1A1A1A] rounded-md border-2 border-gray-700 flex flex-col items-center justify-center shadow-lg"
      >
        <div className="w-16 h-2 bg-[#2a2a2a] mb-2 rounded-full" />
        <span className="text-[8px] text-gray-500 font-mono uppercase tracking-tighter">ATmega328P</span>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {[1,2,3,4,5,6].map(i => (
            <motion.div 
              key={i} 
              animate={activePins.length > 0 ? { backgroundColor: ['#4b5563', '#00d2ff', '#4b5563'] } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, repeat: activePins.length > 0 ? Infinity : 0 }}
              className="w-1.5 h-1.5 bg-gray-600 rounded-full" 
            />
          ))}
        </div>
      </motion.div>

      {/* Power Components */}
      <div className="absolute left-8 bottom-8 flex gap-3">
        <div className="w-10 h-14 bg-[#333] rounded shadow-inner border border-white/5" />
        <div className="w-14 h-8 bg-[#444] rounded shadow-inner border border-white/5" />
      </div>

      {/* Animated LEDs for Active Pins */}
      <div className="absolute right-4 top-[80px] flex flex-col gap-[25px] pt-1.5">
        {[13, 12, 11, 10, 9, 8].map(p => (
          <LED key={p} color="#3BCEAC" active={activePins.includes(p)} />
        ))}
      </div>
    </div>
  );
};

interface ComponentSpriteProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  animate?: 'spin' | 'blink';
}

const ComponentSprite: React.FC<ComponentSpriteProps> = ({ icon, color, label, animate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.5 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.5 }}
    className="flex flex-col items-center gap-1"
  >
    <motion.div 
      animate={animate === 'spin' ? { rotate: 360 } : {}}
      transition={animate === 'spin' ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
      className={`w-10 h-10 bg-[#1A3A42] rounded-xl flex items-center justify-center border-2 border-[#244D58] shadow-lg ${color}`}
    >
      {icon}
    </motion.div>
    <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">{label}</span>
  </motion.div>
);

interface PinHeaderProps {
  label: string;
  isActive?: boolean;
}

const PinHeader: React.FC<PinHeaderProps> = ({ label, isActive }) => (
  <div className={`w-8 h-6 rounded flex items-center justify-center text-[8px] font-bold font-mono transition-all duration-300 ${isActive ? 'bg-secondary text-dark shadow-[0_0_15px_rgba(59,206,172,0.8)] scale-110 z-10' : 'bg-dark/50 text-gray-500'}`}>
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
      scale: active ? 1.5 : 1,
      boxShadow: active ? `0 0 25px ${color}, 0 0 10px rgba(59,206,172,0.5)` : 'none'
    }}
    className="w-2.5 h-2.5 rounded-full"
  />
);
