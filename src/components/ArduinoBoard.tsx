import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Volume2, Cpu, Wind } from 'lucide-react';

interface ArduinoBoardProps {
  activePins: number[];
  pinStates: Record<number | string, any>;
  displayText?: string;
  motorSpeed?: number;
  servoAngle?: number;
  onSensorTrigger?: (pin: number | string, value: any) => void;
}

export const ArduinoBoard: React.FC<ArduinoBoardProps> = ({ 
  activePins, 
  pinStates, 
  displayText = "", 
  motorSpeed = 0, 
  servoAngle = 0,
  onSensorTrigger
}) => {
  return (
    <div className="relative w-full aspect-[1.6/1] bg-[#0A2E36] rounded-[32px] shadow-2xl p-12 overflow-hidden border-[12px] border-[#143D48]">
      {/* High Fidelity PCB Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="pcb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#pcb-grid)" />
          {/* Copper Traces */}
          <path d="M 0 100 Q 100 100 150 150 T 300 200" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.1" />
          <path d="M 500 0 Q 500 100 450 150 T 300 300" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.1" />
        </svg>
      </div>

      {/* Virtual 16x2 LCD Display */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#2D5A27] rounded-xl border-[8px] border-[#1B3E18] shadow-2xl p-4 flex flex-col font-mono overflow-hidden">
        <div className="flex-1 bg-[#88B04B]/80 rounded p-2 text-[#0A2E05] text-lg leading-tight shadow-inner overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={displayText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="break-all"
            >
              {displayText || "Arduino Ready..."}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-2 flex justify-between px-1">
          <div className="w-2 h-2 rounded-full bg-black/20" />
          <div className="w-2 h-2 rounded-full bg-black/20" />
        </div>
      </div>

      {/* Main Board Label */}
      <div className="absolute top-10 left-10 flex items-center gap-4">
        <div className="w-20 h-20 bg-info rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-2xl rotate-[-5deg] border-4 border-white/20">UNO</div>
        <div className="flex flex-col">
          <span className="text-info font-mono text-2xl uppercase tracking-[0.2em] font-black drop-shadow-md">MakerBlock</span>
          <span className="text-[12px] text-info/50 font-mono uppercase tracking-[0.5em] font-bold">Simulator Engine 3.0</span>
        </div>
      </div>

      {/* Interactive Peripherals */}
      <div className="absolute bottom-16 left-12 flex gap-8 items-end">
        {/* Potentiometer / Analog Input */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-16 h-16 bg-[#222] rounded-full border-4 border-gray-700 shadow-xl flex items-center justify-center">
            <motion.div 
              animate={{ rotate: (pinStates['A0'] || 0) * 0.27 }} // mapped 0-1023 to 0-270
              className="w-1 h-8 bg-accent rounded-full origin-bottom -translate-y-4"
            />
          </div>
          <input 
            type="range" 
            min="0" 
            max="1023" 
            value={pinStates['A0'] || 0}
            onChange={(e) => onSensorTrigger?.('A0', parseInt(e.target.value))}
            className="w-24 accent-accent"
          />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pin A0</span>
        </div>

        {/* Push Button */}
        <div className="flex flex-col items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            onMouseDown={() => onSensorTrigger?.(2, 1)}
            onMouseUp={() => onSensorTrigger?.(2, 0)}
            onMouseLeave={() => onSensorTrigger?.(2, 0)}
            className="w-14 h-14 bg-[#EE4266] rounded-full border-b-8 border-r-4 border-black/30 shadow-xl active:border-b-0 active:translate-y-2 flex items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full border-4 border-white/10" />
          </motion.button>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pin D2</span>
        </div>

        {/* RGB LED (mapped to favorite pins) */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center justify-center relative">
            <div className="w-1 h-8 bg-gray-400 absolute bottom-0 translate-y-full flex gap-1">
              <div className="w-0.5 h-full bg-gray-500" />
              <div className="w-0.5 h-full bg-gray-500" />
              <div className="w-0.5 h-full bg-gray-500" />
            </div>
            <motion.div 
              animate={{ 
                backgroundColor: pinStates[13] || pinStates[12] || pinStates[11] ? '#FFF' : '#333',
                boxShadow: pinStates[13] ? '0 0 40px #EE4266' : pinStates[12] ? '0 0 40px #3BCEAC' : pinStates[11] ? '0 0 40px #0984E3' : 'none'
              }}
              className="w-10 h-12 rounded-t-full rounded-b-lg shadow-lg border-2 border-white/20" 
            />
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">RGB LED</span>
        </div>
      </div>

      {/* Component Visualizers (Expanded) */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 flex flex-col gap-6">
        <AnimatePresence>
          {motorSpeed > 0 && (
            <ComponentSprite 
              key="motor" 
              icon={<Wind size={32} />} 
              color="text-emerald-400" 
              label={`Motor: ${motorSpeed}`} 
              animate="spin"
              speed={motorSpeed}
            />
          )}
          {servoAngle !== 0 && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 bg-[#1a1a1a] rounded-2xl border-4 border-gray-700 relative overflow-hidden flex items-center justify-center">
                 <motion.div 
                   animate={{ rotate: servoAngle }}
                   className="w-16 h-4 bg-gray-300 rounded-full"
                 />
              </div>
              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Servo: {servoAngle}°</span>
            </div>
          )}
          {pinStates[9] === 1 && (
            <ComponentSprite key="buzzer" icon={<Volume2 size={32} />} color="text-sky-400" label="Buzzer Active" />
          )}
        </AnimatePresence>
      </div>

      {/* Digital Pins Header */}
      <div className="absolute top-10 right-10 flex items-center gap-6 bg-dark/40 backdrop-blur-sm p-3 rounded-2xl border-4 border-white/5 shadow-2xl">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-black text-white/20 uppercase text-center tracking-tighter">13-8</span>
          <div className="flex flex-col gap-3">
            {[13, 12, 11, 10, 9, 8].map(p => (
              <PinHeader key={p} label={p.toString()} isActive={pinStates[p] > 0} value={pinStates[p]} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-black text-white/20 uppercase text-center tracking-tighter">7-2</span>
          <div className="flex flex-col gap-3">
            {[7, 6, 5, 4, 3, 2].map(p => (
              <PinHeader key={p} label={p.toString()} isActive={pinStates[p] > 0} value={pinStates[p]} />
            ))}
          </div>
        </div>
      </div>

      {/* Analog Pins Header */}
      <div className="absolute bottom-10 right-10 flex flex-col gap-2 bg-dark/40 backdrop-blur-sm p-3 rounded-2xl border-4 border-white/5 shadow-2xl">
        <span className="text-[9px] font-black text-white/20 uppercase text-center tracking-widest">Analog IN</span>
        <div className="flex gap-3">
          {[5, 4, 3, 2, 1, 0].map(p => (
            <PinHeader key={`A${p}`} label={`A${p}`} isActive={pinStates[`A${p}`] > 0} value={pinStates[`A${p}`]} />
          ))}
        </div>
      </div>

      {/* Main IC Chip */}
      <motion.div 
        animate={activePins.length > 0 ? { 
          borderColor: ['#374151', '#00d2ff', '#374151'],
          boxShadow: ['0 0 20px rgba(0,210,255,0.1)', '0 0 50px rgba(0,210,255,0.2)', '0 0 20px rgba(0,210,255,0.1)']
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute left-1/2 bottom-12 -translate-x-1/2 w-64 h-24 bg-[#111] rounded-2xl border-4 border-gray-700 flex flex-col items-center justify-center shadow-2xl"
      >
        <span className="text-[14px] text-gray-500 font-mono uppercase tracking-[0.4em] font-black">ATmega328P-PU</span>
        <div className="absolute top-2 w-full flex justify-between px-6">
          {[1,2,3,4,5,6,7,8].map(i => (
             <div key={i} className="w-1.5 h-3 bg-[#222] rounded-t" />
          ))}
        </div>
        <div className="absolute bottom-2 w-full flex justify-between px-6">
          {[1,2,3,4,5,6,7,8].map(i => (
             <div key={i} className="w-1.5 h-3 bg-[#222] rounded-b" />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

interface ComponentSpriteProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  animate?: 'spin' | 'blink';
  speed?: number;
}

const ComponentSprite: React.FC<ComponentSpriteProps> = ({ icon, color, label, animate, speed = 1 }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="flex flex-col items-center gap-2"
  >
    <motion.div 
      animate={animate === 'spin' ? { rotate: 360 } : {}}
      transition={animate === 'spin' ? { duration: speed > 200 ? 0.2 : (speed > 100 ? 0.5 : 1), repeat: Infinity, ease: 'linear' } : {}}
      className={`w-20 h-20 bg-dark/50 rounded-[2rem] flex items-center justify-center border-4 border-white/5 shadow-2xl backdrop-blur-md ${color}`}
    >
      {icon}
    </motion.div>
    <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">{label}</span>
  </motion.div>
);

interface PinHeaderProps {
  label: string;
  isActive?: boolean;
  value?: any;
}

const PinHeader: React.FC<PinHeaderProps> = ({ label, isActive, value }) => (
  <div className={`w-10 h-8 rounded-lg flex flex-col items-center justify-center text-[9px] font-black font-mono transition-all duration-300 ${isActive ? 'bg-secondary text-dark shadow-[0_0_20px_rgba(59,206,172,0.6)] scale-110 z-10' : 'bg-dark/30 text-white/20'}`}>
    <span>{label}</span>
    {isActive && <span className="text-[7px] opacity-60 leading-none">{typeof value === 'number' && value > 1 ? value : ''}</span>}
  </div>
);
