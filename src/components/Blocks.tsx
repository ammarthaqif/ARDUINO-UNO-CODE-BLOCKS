import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'motion/react';
import { BlockType, BLOCK_METADATA } from '../types';
import * as LucideIcons from 'lucide-react';
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
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `toolbox-${type}`,
    data: { type, isToolbox: true }
  });

  const metadata = BLOCK_METADATA[type];
  const Icon = ({ 
    Sun, Moon, Clock, RefreshCcw, Zap, Split, Fingerprint, Eye, Activity, Scale,
    MessageSquare, Save, CloudDownload, IterationCcw, Play,
    Volume2, Music, Wind, Octagon, Compass, Eraser, Monitor
  } as any)[metadata.icon] || Zap;

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

interface WorkspaceBlockProps {
  id: string;
  type: BlockType;
  index: number;
  parameters: Record<string, string | number>;
  onUpdate?: (id: string, parameters: any) => void;
  isExecuting?: boolean;
}

// WORKSPACE INSTANCE
export const WorkspaceBlock: React.FC<WorkspaceBlockProps> = ({ id, type, index, parameters, onUpdate, isExecuting }) => {
  const metadata = BLOCK_METADATA[type];
  const Icon = ({ 
    Sun, Moon, Clock, RefreshCcw, Zap, Split, Fingerprint, Eye, Activity, Scale,
    MessageSquare, Save, CloudDownload, IterationCcw, Play,
    Volume2, Music, Wind, Octagon, Compass, Eraser, Monitor
  } as any)[metadata.icon] || Zap;

  const handleChange = (key: string, value: any) => {
    if (onUpdate) {
      onUpdate(id, { ...parameters, [key]: value });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: isExecuting ? 1.05 : 1,
        borderColor: isExecuting ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.2)',
        backgroundColor: isExecuting ? '#FFF' : undefined,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      className={cn(
        "relative w-[480px] h-20 rounded-2xl border-b-8 flex items-center justify-between px-8 shadow-xl shadow-black/10 transition-all mb-4",
        isExecuting ? "!text-dark shadow-white/20 scale-105 z-20" : (metadata.color + " text-white border-black/20")
      )}
    >
      {isExecuting && (
        <motion.div 
          layoutId="highlight"
          className="absolute -inset-2 rounded-3xl border-4 border-white/50 animate-pulse pointer-events-none"
        />
      )}
      <div className="flex items-center gap-6">
        <div className={cn("p-4 rounded-2xl transition-colors", isExecuting ? "bg-gray-100" : "bg-white/20")}>
          <Icon size={32} className={isExecuting ? "text-dark" : "text-white"} />
        </div>
        <div>
          <h4 className="font-black text-xl leading-tight tracking-tight">{metadata.label}</h4>
          <p className={cn("text-[11px] font-black uppercase tracking-[0.2em]", isExecuting ? "text-gray-400" : "text-white/60")}>Step #{index + 1}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
         {parameters?.pin !== undefined && (
            <div className="flex flex-col items-center">
              <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isExecuting ? "text-gray-400" : "opacity-50")}>Target Pin</span>
              <select 
                className={cn(
                  "w-24 border-2 rounded-xl px-2 py-1.5 text-xs font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none appearance-none cursor-pointer transition-colors shadow-inner",
                  isExecuting ? "bg-gray-100 border-gray-200 text-dark" : "bg-black/30 border-white/10 text-white hover:bg-black/40"
                )} 
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
              <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isExecuting ? "text-gray-400" : "opacity-50")}>Delay Ms</span>
              <input 
                type="number" 
                className={cn(
                  "w-20 border-2 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner",
                  isExecuting ? "bg-gray-100 border-gray-200 text-dark" : "bg-black/30 border-white/10 text-white"
                )} 
                value={parameters.ms}
                onChange={(e) => handleChange('ms', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
          {parameters?.value !== undefined && (
            <div className="flex flex-col items-center">
              <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isExecuting ? "text-gray-400" : "opacity-50")}>Value</span>
              <input 
                type="number" 
                className={cn(
                  "w-20 border-2 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner",
                  isExecuting ? "bg-gray-100 border-gray-200 text-dark" : "bg-black/30 border-white/10 text-white"
                )} 
                value={parameters.value}
                onChange={(e) => handleChange('value', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
          {parameters?.name !== undefined && (
            <div className="flex flex-col items-center">
              <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isExecuting ? "text-gray-400" : "opacity-50")}>Variable</span>
              <input 
                type="text" 
                className={cn(
                  "w-24 border-2 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner",
                  isExecuting ? "bg-gray-100 border-gray-200 text-dark" : "bg-black/30 border-white/10 text-white"
                )} 
                value={parameters.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
          )}
          {parameters?.text !== undefined && (
            <div className="flex flex-col items-center">
              <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isExecuting ? "text-gray-400" : "opacity-50")}>Display Text</span>
              <input 
                type="text" 
                className={cn(
                  "w-32 border-2 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner",
                  isExecuting ? "bg-gray-100 border-gray-200 text-dark" : "bg-black/30 border-white/10 text-white"
                )} 
                value={parameters.text}
                onChange={(e) => handleChange('text', e.target.value)}
              />
            </div>
          )}
          {parameters?.frequency !== undefined && (
             <div className="flex flex-col items-center">
               <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isExecuting ? "text-gray-400" : "opacity-50")}>Pitch (Hz)</span>
               <input 
                 type="number" 
                 className={cn(
                   "w-24 border-2 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner",
                   isExecuting ? "bg-gray-100 border-gray-200 text-dark" : "bg-black/30 border-white/10 text-white"
                 )} 
                 value={parameters.frequency}
                 onChange={(e) => handleChange('frequency', parseInt(e.target.value) || 1)}
               />
             </div>
           )}
           {parameters?.speed !== undefined && (
             <div className="flex flex-col items-center">
               <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isExecuting ? "text-gray-400" : "opacity-50")}>Power</span>
               <input 
                 type="number" 
                 className={cn(
                   "w-20 border-2 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner",
                   isExecuting ? "bg-gray-100 border-gray-200 text-dark" : "bg-black/30 border-white/10 text-white"
                 )} 
                 value={parameters.speed}
                 onChange={(e) => handleChange('speed', parseInt(e.target.value) || 0)}
               />
             </div>
           )}
           {parameters?.angle !== undefined && (
             <div className="flex flex-col items-center">
               <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isExecuting ? "text-gray-400" : "opacity-50")}>Angle°</span>
               <input 
                 type="number" 
                 className={cn(
                   "w-20 border-2 rounded-xl px-2 py-1.5 text-sm font-mono font-black text-center focus:ring-2 focus:ring-white/50 focus:outline-none shadow-inner",
                   isExecuting ? "bg-gray-100 border-gray-200 text-dark" : "bg-black/30 border-white/10 text-white"
                 )} 
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
