import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Volume2, Cpu, Wind, Info, Zap } from 'lucide-react';

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
    <div className="relative w-full aspect-[1.1/1] bg-[#005F92] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-0 overflow-hidden border-[8px] border-[#004A72] flex items-center justify-center">
      {/* High Fidelity PCB Pattern (Silk Screen) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 680">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
             <circle cx="1" cy="1" r="0.5" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Silk Screen Lines */}
          <rect x="50" y="50" width="700" height="580" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" rx="10" />
          <text x="400" y="340" fontSize="120" fontWeight="900" fill="white" fillOpacity="0.05" textAnchor="middle">UNO</text>
          
          {/* Copper Traces (Decorative) */}
          <path d="M 100 100 L 700 100" stroke="#FFD700" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
          <path d="M 100 580 L 700 580" stroke="#FFD700" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        </svg>
      </div>

      {/* Main Board Structure */}
      <div className="w-[750px] h-[600px] relative">
        
        {/* USB Connector (Top Left) */}
        <div className="absolute -top-12 left-10 w-44 h-32 bg-[#C0C0C0] rounded-b-lg shadow-xl flex items-center justify-center border-x-4 border-b-8 border-gray-400">
           <div className="w-24 h-16 bg-gray-600 rounded-md shadow-inner flex items-center justify-center">
              <div className="w-16 h-8 bg-[#C0C0C0] rounded-sm" />
           </div>
           <div className="absolute top-2 text-[10px] font-black text-gray-500 uppercase">USB-B PORT</div>
        </div>

        {/* DC Jack (Bottom Left) */}
        <div className="absolute -bottom-12 left-10 w-40 h-44 bg-[#1A1A1A] rounded-t-lg shadow-xl border-x-4 border-t-8 border-gray-800 flex flex-col items-center justify-end pb-4">
           <div className="w-20 h-20 rounded-full bg-black border-4 border-gray-900 shadow-inner" />
           <div className="text-[10px] font-black text-gray-600 uppercase mt-2">7-12V DC</div>
        </div>

        {/* ATmega328P (Center Bottom) */}
        <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-[400px] h-[70px] bg-[#1A1A1A] rounded-sm border-2 border-gray-700 shadow-2xl flex items-center justify-center relative">
           <div className="absolute top-[-10px] left-4 w-6 h-6 bg-[#1A1A1A] rounded-full border-2 border-gray-700" />
           <span className="text-gray-500 font-mono text-xl uppercase tracking-[0.4em] font-black">ATmega328P-PU</span>
           
           {/* Pins on top */}
           <div className="absolute -top-4 w-full flex justify-between px-8">
              {[...Array(14)].map((_, i) => (
                 <div key={i} className="w-1.5 h-4 bg-gray-500 rounded-t-sm shadow-sm" />
              ))}
           </div>
           {/* Pins on bottom */}
           <div className="absolute -bottom-4 w-full flex justify-between px-8">
              {[...Array(14)].map((_, i) => (
                 <div key={i} className="w-1.5 h-4 bg-gray-500 rounded-b-sm shadow-sm" />
              ))}
           </div>
        </div>

        {/* DIGITAL PINS HEADER (Top) */}
        <div className="absolute top-10 left-[220px] h-14 w-[500px] bg-[#1A1A1A] rounded-t-sm shadow-lg flex items-center px-4 gap-3 border-x-2 border-t-8 border-gray-800">
           <div className="absolute -top-6 left-0 flex flex-col">
              <span className="text-white text-[11px] font-black uppercase tracking-widest">Digital (PWM~)</span>
           </div>
           {[13, 12, 11, 10, 9, 8].map(p => (
              <PinSocket key={p} label={p.toString()} isActive={pinStates[p] > 0} color="border-primary" pwm={p === 3 || p === 5 || p === 6 || p === 9 || p === 10 || p === 11} />
           ))}
           <div className="w-4" /> {/* Gap */}
           {[7, 6, 5, 4, 3, 2, 1, 0].map(p => (
              <PinSocket key={p} label={p.toString()} isActive={pinStates[p] > 0} color="border-primary" pwm={p === 3 || p === 5 || p === 6} />
           ))}
        </div>

        {/* ANALOG IN HEADER (Bottom Right) */}
        <div className="absolute bottom-10 right-0 h-14 w-[280px] bg-[#1A1A1A] rounded-b-sm shadow-lg flex items-center px-4 gap-3 border-x-2 border-b-8 border-gray-800">
           <div className="absolute -bottom-6 right-0 text-white text-[11px] font-black uppercase tracking-widest">Analog IN</div>
           {[0, 1, 2, 3, 4, 5].map(p => (
              <PinSocket key={`A${p}`} label={`A${p}`} isActive={pinStates[`A${p}`] > 0} color="border-secondary" />
           ))}
        </div>

        {/* POWER HEADER (Bottom Center-ish) */}
        <div className="absolute bottom-10 left-[180px] h-14 w-[280px] bg-[#1A1A1A] rounded-b-sm shadow-lg flex items-center px-4 gap-3 border-x-2 border-b-8 border-gray-800">
           <div className="absolute -bottom-6 left-0 text-white text-[11px] font-black uppercase tracking-widest">Power</div>
           {['Vin', 'GND', 'GND', '5V', '3.3V', 'RST'].map(p => (
              <PinSocket key={p} label={p} isActive={p === '5V' || p === '3.3V'} color="border-accent" sx={{ fontSize: '7px' }} />
           ))}
        </div>

        {/* ICSP Header (Far Right) */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-2 bg-[#1A1A1A] p-2 rounded-sm border-2 border-gray-800 shadow-md">
           {[...Array(6)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-500 rounded-full border-2 border-gray-400 shadow-inner" />
           ))}
        </div>

        {/* PERIPHERALS (The "Interactive" layer away from the board a bit) */}
        <div className="absolute -right-[150px] top-0 h-full flex flex-col gap-8 items-center justify-center">
           {/* LCD Module */}
           <div className="w-[320px] bg-[#2D5A27] rounded-xl border-[8px] border-[#1B3E18] shadow-2xl p-4 flex flex-col font-mono overflow-hidden">
            <div className="flex-1 bg-[#88B04B]/80 rounded p-2 text-[#0A2E05] text-lg leading-tight shadow-inner overflow-hidden min-h-[60px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={displayText}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="break-all"
                >
                  {displayText || "Ready for code..."}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-2 flex justify-between px-1">
              <div className="w-2 h-2 rounded-full bg-black/20" />
              <div className="w-2 h-2 rounded-full bg-black/20" />
            </div>
          </div>

          <div className="flex gap-6">
            {/* Input Module */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border-2 border-white/10 flex flex-col items-center gap-4 shadow-xl">
               <div className="flex items-center gap-6">
                  {/* Push Button */}
                  <div className="flex flex-col items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9, y: 2 }}
                      onMouseDown={() => onSensorTrigger?.(2, 1)}
                      onMouseUp={() => onSensorTrigger?.(2, 0)}
                      className="w-16 h-16 bg-[#EE4266] rounded-full border-b-[6px] border-black/40 shadow-xl flex items-center justify-center active:border-b-0 active:translate-y-1 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full border-4 border-white/10" />
                    </motion.button>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pin 2</span>
                  </div>

                  {/* Potentiometer */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16 bg-dark/50 rounded-full border-2 border-white/10 flex items-center justify-center">
                       <motion.div 
                         animate={{ rotate: ((pinStates['A0'] || 0) / 1023) * 270 - 135 }}
                         className="w-1 h-8 bg-accent rounded-full origin-bottom -translate-y-4 shadow-[0_0_10px_#3BCEAC]"
                       />
                    </div>
                    <input 
                      type="range" min="0" max="1023" step="1" 
                      value={pinStates['A0'] || 0}
                      onChange={(e) => onSensorTrigger?.('A0', parseInt(e.target.value))}
                      className="w-24 accent-accent cursor-pointer" 
                    />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pin A0</span>
                  </div>
               </div>
            </div>

            {/* Output Components */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border-2 border-white/10 flex flex-col gap-6 shadow-xl min-w-[200px]">
               <AnimatePresence>
                 {motorSpeed > 0 && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border-2 border-emerald-500/30">
                         <motion.div animate={{ rotate: 360 }} transition={{ duration: motorSpeed > 127 ? 0.3 : 0.8, repeat: Infinity, ease: 'linear' }}>
                            <Wind className="text-emerald-400" size={32} />
                         </motion.div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white">Fan Speed</span>
                        <span className="text-[10px] font-mono text-emerald-400">{motorSpeed} PWM</span>
                      </div>
                   </motion.div>
                 )}
                 {servoAngle !== 0 && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-info/20 rounded-2xl flex items-center justify-center border-2 border-info/30">
                        <motion.div animate={{ rotate: servoAngle }} className="w-12 h-2 bg-info rounded-full" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white">Servo Angle</span>
                        <span className="text-[10px] font-mono text-info">{servoAngle}°</span>
                      </div>
                   </motion.div>
                 )}
                 {pinStates[13] === 1 && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center border-2 border-accent/50 animate-pulse shadow-[0_0_20px_#3BCEAC]">
                         <Lightbulb className="text-accent" size={24} />
                      </div>
                      <span className="text-xs font-black text-accent uppercase tracking-widest">Pin 13 LED</span>
                   </motion.div>
                 )}
               </AnimatePresence>
               {!(motorSpeed > 0 || servoAngle !== 0 || pinStates[13] === 1) && (
                 <div className="text-white/20 text-[10px] font-black uppercase text-center py-4 tracking-widest">
                   No Active Outputs
                 </div>
               )}
            </div>
          </div>
        </div>

      </div>

      {/* Connection Wires (Stylized) */}
      <svg className="absolute inset-0 pointer-events-none stroke-current opacity-30">
         {/* A0 trace */}
         <motion.path 
           d="M 650 550 C 650 630 200 630 200 550" 
           stroke={pinStates['A0'] > 0 ? "#3BCEAC" : "#444"} 
           strokeWidth="2" fill="none" 
         />
         {/* D2 trace */}
         <motion.path 
           d="M 600 550 C 600 680 400 680 400 100" 
           stroke={pinStates[2] === 1 ? "#EE4266" : "#444"} 
           strokeWidth="2" fill="none" 
         />
      </svg>
    </div>
  );
};

const PinSocket = ({ label, isActive, color, pwm, sx }: { label: string, isActive?: boolean, color?: string, pwm?: boolean, sx?: any }) => (
  <div className="flex flex-col items-center">
    <div className={`w-8 h-8 rounded-sm bg-[#111] border-2 border-gray-600 flex items-center justify-center shadow-inner transition-all duration-300 ${isActive ? `bg-gray-800 border-white shadow-[0_0_15px_white]` : ''}`}>
       <div className={`w-3 h-3 rounded-full border-2 border-gray-800 ${isActive ? 'bg-white' : 'bg-black'}`} />
    </div>
    <span className="text-[8px] font-bold text-gray-500 mt-1" style={sx}>
      {pwm && "~"}{label}
    </span>
  </div>
);
