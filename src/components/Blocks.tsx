import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'motion/react';
import { BlockType, BLOCK_METADATA } from '../types';
import { 
  Sun, Moon, Clock, RefreshCcw, Zap, Split, Fingerprint, Eye, 
  MessageSquare, Save, CloudDownload, IterationCcw, Play, 
  Activity, Scale, Volume2, Music, Wind, Octagon, Compass, 
  Eraser, Monitor 
} from 'lucide-react';

// Helper for Tailwind merge
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

// DRAGGABLE TOOLBOX BLOCK
export const ToolboxBlock = ({ type }: { type: BlockType }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `toolbox-${type}`,
    data: { type, isToolbox: true }
  });

  const metadata = BLOCK_METADATA[type];
  const Icon = { 
    Sun, Moon, Clock, RefreshCcw, Zap, Split, Fingerprint, Eye, Activity, Scale,
    MessageSquare, Save, CloudDownload, IterationCcw, Play,
    Volume2, Music, Wind, Octagon, Compass, Eraser, Monitor
  }[metadata.icon as any] || Zap;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group cursor-grab active:cursor-grabbing h-12 rounded-xl border-b-4 border-black/20 flex items-center px-4 text-white font-bold transition-all gap-3",
        metadata.color
      )}
    >
      <Icon size={20} />
      {metadata.label}
    </div>
  );
};

// WORKSPACE INSTANCE
export const WorkspaceBlock = ({ id, type, index, parameters, onUpdate }: { id: string; type: BlockType; index: number; parameters: any; onUpdate?: (id: string, params: any) => void }) => {
  const metadata = BLOCK_METADATA[type];
  const Icon = { 
    Sun, Moon, Clock, RefreshCcw, Zap, Split, Fingerprint, Eye, Activity, Scale,
    MessageSquare, Save, CloudDownload, IterationCcw, Play,
    Volume2, Music, Wind, Octagon, Compass, Eraser, Monitor
  }[metadata.icon as any] || Zap;

  const handleChange = (key: string, value: any) => {
    if (onUpdate) {
      onUpdate(id, { ...parameters, [key]: value });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className={cn(
        "relative w-[480px] h-20 rounded-2xl border-b-8 border-black/20 flex items-center justify-between px-8 shadow-xl shadow-black/10 transition-all mb-4",
        metadata.color,
        "text-white"
      )}
    >
      <div className="flex items-center gap-6">
        <div className="p-4 bg-white/20 rounded-2xl">
          <Icon size={32} />
        </div>
        <div>
          <h4 className="font-black text-xl leading-tight tracking-tight">{metadata.label}</h4>
          <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em]">Step #{index + 1}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
         {parameters?.pin !== undefined && (
           <div className="flex flex-col items-center">
             <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Target Pin</span>
             <select 
               className="w-24 bg-black/30 border-2 border-white/10 rounded-xl px-2 py-1.5 text-xs font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none appearance-none cursor-pointer hover:bg-black/40 transition-colors shadow-inner" 
               value={parameters.pin}
               onChange={(e) => {
                 const val = e.target.value;
                 handleChange('pin', val.startsWith('A') ? val : parseInt(val));
               }}
             >
               <optgroup label="Digital Output" className="bg-gray-900 text-white/50 text-[9px]">
                 {[13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2].map(p => (
                   <option key={p} value={p} className="text-white font-bold text-sm">Pin D{p}</option>
                 ))}
               </optgroup>
               <optgroup label="Analog Input" className="bg-gray-900 text-white/50 text-[9px]">
                 {['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map(p => (
                   <option key={p} value={p} className="text-white font-bold text-sm">Pin {p}</option>
                 ))}
               </optgroup>
             </select>
           </div>
         )}
         {parameters?.ms !== undefined && (
           <div className="flex flex-col items-center">
             <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Delay Ms</span>
             <input 
               type="number" 
               className="w-20 bg-black/30 border-2 border-white/10 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner" 
               value={parameters.ms}
               onChange={(e) => handleChange('ms', parseInt(e.target.value) || 0)}
             />
           </div>
         )}
         {parameters?.value !== undefined && (
           <div className="flex flex-col items-center">
             <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Value</span>
             <input 
               type="number" 
               className="w-20 bg-black/30 border-2 border-white/10 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner" 
               value={parameters.value}
               onChange={(e) => handleChange('value', parseInt(e.target.value) || 0)}
             />
           </div>
         )}
         {parameters?.name !== undefined && (
           <div className="flex flex-col items-center">
             <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Variable</span>
             <input 
               type="text" 
               className="w-24 bg-black/30 border-2 border-white/10 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner" 
               value={parameters.name}
               onChange={(e) => handleChange('name', e.target.value)}
             />
           </div>
         )}
         {parameters?.text !== undefined && (
           <div className="flex flex-col items-center">
             <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Display Text</span>
             <input 
               type="text" 
               className="w-32 bg-black/30 border-2 border-white/10 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner" 
               value={parameters.text}
               onChange={(e) => handleChange('text', e.target.value)}
             />
           </div>
         )}
         {parameters?.frequency !== undefined && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Pitch (Hz)</span>
              <input 
                type="number" 
                className="w-24 bg-black/30 border-2 border-white/10 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner" 
                value={parameters.frequency}
                onChange={(e) => handleChange('frequency', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
          {parameters?.speed !== undefined && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Power</span>
              <input 
                type="number" 
                className="w-20 bg-black/30 border-2 border-white/10 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner" 
                value={parameters.speed}
                onChange={(e) => handleChange('speed', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
          {parameters?.angle !== undefined && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Angle°</span>
              <input 
                type="number" 
                className="w-20 bg-black/30 border-2 border-white/10 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner" 
                value={parameters.angle}
                onChange={(e) => handleChange('angle', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
      </div>
      
      {/* Visual connectors */}
      <div className="absolute -top-2 left-12 w-8 h-4 bg-inherit rounded-t-lg opacity-50" />
      <div className="absolute -bottom-4 left-12 w-8 h-4 bg-inherit rounded-b-lg shadow-inner" />
    </motion.div>
  );
};
