import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'motion/react';
import { BlockType, BLOCK_METADATA } from '../types';
import { Sun, Moon, Clock, RefreshCcw, Zap, Split, Fingerprint, Eye, MessageSquare, Save, CloudDownload, IterationCcw, Play, Activity, Scale } from 'lucide-react';

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
    MessageSquare, Save, CloudDownload, IterationCcw, Play 
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
export const WorkspaceBlock = ({ id, type, index, parameters }: { id: string; type: BlockType; index: number; parameters: any }) => {
  const metadata = BLOCK_METADATA[type];
  const Icon = { 
    Sun, Moon, Clock, RefreshCcw, Zap, Split, Fingerprint, Eye, Activity, Scale,
    MessageSquare, Save, CloudDownload, IterationCcw, Play 
  }[metadata.icon as any] || Zap;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className={cn(
        "relative w-full h-14 rounded-xl border-b-4 border-black/20 flex items-center justify-between px-6 shadow-md shadow-black/5",
        metadata.color,
        "text-white"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon size={24} />
        </div>
        <div>
          <h4 className="font-extrabold text-lg leading-tight">{metadata.label}</h4>
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">#{index + 1}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
         {parameters?.pin && (
           <div className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-mono font-bold">PIN: {parameters.pin}</div>
         )}
         {parameters?.ms && (
           <div className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-mono font-bold">{parameters.ms}ms</div>
         )}
         {parameters?.name && (
           <div className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-mono font-bold">VAR: {parameters.name}</div>
         )}
      </div>
      
      {/* Visual connectors */}
      <div className="absolute -top-2 left-12 w-8 h-4 bg-inherit rounded-t-lg opacity-50" />
      <div className="absolute -bottom-4 left-12 w-8 h-4 bg-inherit rounded-b-lg shadow-inner" />
    </motion.div>
  );
};
