import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArduinoPin } from '../types';
import { Lightbulb, Volume2, Cpu, Wind, Monitor } from 'lucide-react';

interface ArduinoBoardProps {
  activePins: number[];
}

export const ArduinoBoard: React.FC<ArduinoBoardProps> = ({ activePins }) => {
  return (
    <div className="relative w-full aspect-[1.4/1] bg-[#0A2E36] rounded-[32px] shadow-2xl p-12 overflow-hidden border-[12px] border-[#143D48]">
      {/* Clean Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Main Board Label */}
      <div className="absolute top-8 left-10 flex items-center gap-4">
        <div className="w-16 h-16 bg-info rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl rotate-[-5deg] border-4 border-white/20">UNO</div>
        <div className="flex flex-col">
          <span className="text-info font-mono text-xl uppercase tracking-[0.2em] font-black drop-shadow-md">MakerBlock</span>
          <span className="text-[10px] text-info/50 font-mono uppercase tracking-[0.5em] font-bold">Hardware Engine v2</span>
        </div>
      </div>

      {/* Component Visualizers (Floating based on active pins) */}
      <div className="absolute bottom-24 left-12 flex gap-6">
        <AnimatePresence>
          {activePins.includes(13) && (
            <ComponentSprite key="led" icon={<Lightbulb size={24} />} color="text-yellow-400" label="D13 LED" />
          )}
          {(activePins.includes(9) || activePins.includes(8)) && (
            <ComponentSprite key="buzzer" icon={<Volume2 size={24} />} color="text-sky-400" label="Buzzer" />
          )}
          {(activePins.includes(5) || activePins.includes(6)) && (
            <ComponentSprite key="motor" icon={<Wind size={24} />} color="text-emerald-400" label="Motor" animate="spin" />
          )}
          {activePins.some(p => p >= 18) && (
            <ComponentSprite key="sensor" icon={<Cpu size={24} />} color="text-pink-400" label="Sensors" />
          )}
          {activePins.some(p => p === 10 || p === 11) && (
            <ComponentSprite key="servo" icon={<Cpu size={24} className="rotate-45" />} color="text-orange-400" label="Servo" />
          )}
        </AnimatePresence>
      </div>

      {/* Digital Pins Header */}
      <div className="absolute top-[30px] right-12 flex items-center gap-6 bg-dark/20 p-2 rounded-xl border border-white/5">
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-black text-white/30 uppercase text-center">Group A</span>
          <div className="flex flex-col gap-2">
            {[13, 12, 11, 10, 9, 8].map(p => (
              <PinHeader key={p} label={p.toString()} isActive={activePins.includes(p)} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-black text-white/30 uppercase text-center">Group B</span>
          <div className="flex flex-col gap-2">
            {[7, 6, 5, 4, 3, 2].map(p => (
              <PinHeader key={p} label={p.toString()} isActive={activePins.includes(p)} />
            ))}
          </div>
        </div>
      </div>

      {/* Analog Pins Header (Bottom Center-ish) */}
      <div className="absolute bottom-12 right-12 flex flex-col gap-2 bg-dark/20 p-2 rounded-xl border border-white/5">
        <span className="text-[8px] font-black text-white/30 uppercase text-center tracking-widest">Analog Input</span>
        <div className="flex gap-2">
          {[5, 4, 3, 2, 1, 0].map(p => (
            <PinHeader key={`A${p}`} label={`A${p}`} isActive={activePins.includes(18 + p)} />
          ))}
        </div>
      </div>

      {/* Main Microcontroller Chip */}
      <motion.div 
        animate={activePins.length > 0 ? { 
          boxShadow: ['0 0 20px rgba(0,210,255,0.1)', '0 0 60px rgba(0,210,255,0.3)', '0 0 20px rgba(0,210,255,0.1)'],
          borderColor: ['#374151', '#00d2ff', '#374151']
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-[#111] rounded-2xl border-4 border-gray-700 flex flex-col items-center justify-center shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-info/20 to-transparent" />
        <div className="w-32 h-3 bg-[#222] mb-4 rounded-full shadow-inner" />
        <span className="text-[12px] text-gray-500 font-mono uppercase tracking-[0.2em] font-black">ATmega328P</span>
        <div className="grid grid-cols-2 gap-6 mt-8">
          {[1,2,3,4,5,6,7,8].map(i => (
            <motion.div 
              key={i} 
              animate={activePins.length > 0 ? { 
                backgroundColor: ['#4b5563', '#00d2ff', '#4b5563'],
                scale: [1, 1.2, 1]
              } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, repeat: activePins.length > 0 ? Infinity : 0 }}
              className="w-2.5 h-2.5 bg-gray-600 rounded-full shadow-lg" 
            />
          ))}
        </div>
        <div className="mt-auto mb-4 px-4 py-1 bg-info/5 rounded-full border border-info/10">
          <span className="text-[8px] font-black text-info uppercase tracking-widest">Processing...</span>
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
