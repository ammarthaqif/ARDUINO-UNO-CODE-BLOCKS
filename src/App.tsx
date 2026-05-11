import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Code, Zap, BookOpen, Share2, Download, Play, Trophy, Rocket, LogIn, LogOut, Copy, Check, Undo, Redo } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';

import { ArduinoBoard } from './components/ArduinoBoard';
import { ToolboxBlock, WorkspaceBlock } from './components/Blocks';
import { BlockInstance, BlockType } from './types';
import { generateArduinoCode } from './utils/codeGenerator';
import { PROJECT_TEMPLATES } from './templates';
import { auth, db } from './lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [history, setHistory] = useState<BlockInstance[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState<'code' | 'board' | 'tutorial'>('code');
  const [activeTab, setActiveTab] = useState<'workspace' | 'tutorial'>('workspace');
  const [projectTitle, setProjectTitle] = useState("My Arduino Project");
  const [projectMetadata, setProjectMetadata] = useState<{ createdAt?: any, updatedAt?: any }>({});
  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [ shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Sound effect for snapping
  const playSnapSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio feedback failed:", e);
    }
  };

  // Authentication observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    // Test connection on boot
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        // Permissions error means we connected successfully but were denied (expected)
        if (error?.code === 'permission-denied') {
          console.log("Firestore connection verified (Permission Denied as expected).");
          return;
        }
        
        if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
          const errorCode = (error as any).code;
          console.error("Firebase connection issue detected:", errorCode, error.message);
        } else {
          console.error("Unexpected Firestore error during connection test:", error);
        }
      }
    }
    testConnection();

    return () => unsubscribe();
  }, []);

  // Load project from share link if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('project');
    if (pId) {
      loadProject(pId);
    }
  }, []);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const updateBlocksWithHistory = (newBlocks: BlockInstance[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    // Keep last 50 steps
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setBlocks(newBlocks);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setBlocks(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setBlocks(history[nextIndex]);
    }
  };

  const updateBlockParameters = (id: string, parameters: any) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, parameters } : b);
    updateBlocksWithHistory(newBlocks);
  };

  const loadProject = async (id: string) => {
    try {
      const docRef = doc(db, 'projects', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const loadedBlocks = JSON.parse(data.blocks);
        setBlocks(loadedBlocks);
        setProjectTitle(data.title || "Untitled Project");
        setProjectMetadata({
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
        setHistory([loadedBlocks]);
        setHistoryIndex(0);
        setShareId(id);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `projects/${id}`);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const saveProject = async () => {
    if (!user) {
      handleLogin();
      return;
    }

    setIsSaving(true);
    const id = shareId || `proj-${Date.now()}`;
    const projectPath = `projects/${id}`;
    
    try {
      await setDoc(doc(db, 'projects', id), {
        title: projectTitle,
        blocks: JSON.stringify(blocks),
        creatorUid: user.uid,
        creatorEmail: user.email,
        updatedAt: serverTimestamp(),
        createdAt: projectMetadata.createdAt || serverTimestamp(),
      });
      setShareId(id);
      setProjectMetadata(prev => ({
        ...prev,
        updatedAt: { seconds: Math.floor(Date.now() / 1000) } // Optimistic update
      }));
      confetti({ particleCount: 150, spread: 80 });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, projectPath);
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = () => {
    if (!shareId) return;
    const url = `${window.location.origin}${window.location.pathname}?project=${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Track active pins for the visualizer
  const activePins = Array.from(new Set(
    blocks
      .filter(b => ['led_on', 'sound_tone', 'sound_beep', 'motor_run', 'servo_angle', 'sensor_light', 'sensor_touch'].includes(b.type))
      .map(b => {
        const pin = b.parameters.pin;
        if (typeof pin === 'string' && pin.startsWith('A')) {
          const num = parseInt(pin.substring(1));
          return isNaN(num) ? 18 : 18 + num;
        }
        return (pin as number) || (b.type === 'servo_angle' ? 10 : (b.type.includes('sound') ? 9 : 13));
      })
  ));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'workspace-area') {
      const type = active.data.current?.type as BlockType;
      
      const defaultParams: Record<string, string | number> = { pin: 13, ms: 1000 };
      if (type === 'serial_say') defaultParams.message = "Hello Sparky!";
      if (type === 'var_set' || type === 'var_get') defaultParams.name = "score";
      if (type === 'led_brightness') defaultParams.value = 128;
      if (type === 'analog_read') { defaultParams.pin = 'A0'; defaultParams.variable = 'sensorValue'; }
      if (type === 'map_value') { 
        defaultParams.input = 'sensorValue'; 
        defaultParams.output = 'brightness';
        defaultParams.inMin = 0;
        defaultParams.inMax = 1023;
        defaultParams.outMin = 0;
        defaultParams.outMax = 255;
      }
      if (type === 'sound_tone') { defaultParams.pin = 9; defaultParams.frequency = 440; }
      if (type === 'motor_run') { defaultParams.pin = 5; defaultParams.speed = 255; }
      if (type === 'servo_angle') { defaultParams.pin = 10; defaultParams.angle = 90; }
      if (type === 'display_show') { defaultParams.text = "Hello!"; }

      const newBlock: BlockInstance = {
        id: `block-${Date.now()}`,
        type,
        category: 'Control', // Generic default
        parameters: defaultParams
      };
      
      updateBlocksWithHistory([...blocks, newBlock]);
      setIsSnapping(true);
      playSnapSound();
      setTimeout(() => setIsSnapping(false), 300);
      
      // Celebrate!
      if (blocks.length === 2) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD23F', '#3BCEAC', '#EE4266']
        });
      }
    }
  };

  const removeBlock = (id: string) => {
    updateBlocksWithHistory(blocks.filter(b => b.id !== id));
  };

  const downloadCode = () => {
    const code = generateArduinoCode(blocks);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyMakerProject.ino';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-[80px] bg-white border-b-8 border-primary flex items-center justify-between px-4 md:px-8 z-10 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-accent rounded-xl md:rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#D63031] md:shadow-[4px_4px_0px_#D63031] rotate-[-3deg]">
            <Rocket className="text-white fill-white w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight text-dark leading-none">Arduino Uno <span className="text-info tracking-wider">Blocks</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-success/10 text-success px-2 py-0.5 rounded-md text-xs font-extrabold focus:outline-none focus:ring-1 focus:ring-success/50 border-none w-32 md:w-48"
                placeholder="Project Name..."
              />
            </div>
          </div>
        </div>

          <div className="flex items-center gap-2 md:gap-4 ml-4">
            <div className="hidden lg:flex items-center bg-gray-100 p-1 rounded-xl gap-1">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRightPanelTab('board')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${rightPanelTab === 'board' ? 'bg-white shadow-sm text-secondary' : 'text-gray-500'}`}
              >
                BOARD
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRightPanelTab('code')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${rightPanelTab === 'code' ? 'bg-white shadow-sm text-info' : 'text-gray-500'}`}
              >
                CODE
              </motion.button>
            </div>
            
            <div className="hidden md:block h-8 w-px bg-gray-100 mx-1" />

            <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-0.5 md:gap-1">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (window.confirm("Start a new project? Unsaved changes will be lost.")) {
                  setBlocks([]);
                  setHistory([[]]);
                  setHistoryIndex(0);
                  setShareId(null);
                  setProjectTitle("My Arduino Project");
                  setProjectMetadata({});
                }
              }}
              className="px-2 md:px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[8px] md:text-[9px] font-black text-dark tracking-tighter md:tracking-widest transition-all uppercase"
            >
              NEW
            </motion.button>
            <div className="w-px h-4 md:h-6 bg-gray-200 mx-0.5 md:mx-1" />
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo"
            >
              <Undo size={14} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo"
            >
              <Redo size={14} />
            </motion.button>
          </div>

          <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-50">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-1.5 text-gray-300 hover:text-accent transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </motion.button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-dark text-white font-bold rounded-xl shadow-[2px_2px_0px_#000] md:shadow-[3px_3px_0px_#000] text-[10px] md:text-sm transition-all whitespace-nowrap"
            >
              <LogIn size={16} />
              JOIN
            </motion.button>
          )}

          {blocks.length > 0 && (
            <button 
              onClick={saveProject}
              disabled={isSaving}
              className={`px-3 md:px-5 py-2 bg-secondary text-white font-bold rounded-xl shadow-[2px_2px_0px_#00B894] md:shadow-[3px_3px_0px_#00B894] transition-all flex items-center gap-1.5 text-[10px] md:text-sm whitespace-nowrap ${isSaving ? 'opacity-50' : ''}`}
            >
              {isSaving ? <Zap className="animate-spin" size={16} /> : <span>💾</span>} SAVE
            </button>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCode}
            className="px-3 md:px-5 py-2 bg-[#6C5CE7] text-white font-bold rounded-xl shadow-[2px_2px_0px_#4834D4] md:shadow-[3px_3px_0px_#4834D4] flex items-center gap-1.5 transition-all text-[10px] md:text-sm whitespace-nowrap"
          >
            <span>🚀</span> UPLOAD
          </motion.button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter} sensors={sensors}>
          {/* Toolbox Sidebar (Left) */}
          <aside className="w-[280px] bg-white border-r-8 border-[#FAB1A0] p-4 flex flex-col gap-6 shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">💡 LIGHTS</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="led_on" />
                <ToolboxBlock type="led_off" />
                <ToolboxBlock type="led_brightness" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">⚙️ CONTROL</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="delay" />
                <ToolboxBlock type="repeat" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">🧩 LOGIC</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="if_pressed" />
                <ToolboxBlock type="if_else_pressed" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">📡 SENSORS</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="sensor_light" />
                <ToolboxBlock type="sensor_touch" />
                <ToolboxBlock type="analog_read" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">⚖️ MATH</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="map_value" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">💾 VARIABLES</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="var_set" />
                <ToolboxBlock type="var_get" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">💬 COMMS</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="serial_say" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">🔊 SOUND</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="sound_beep" />
                <ToolboxBlock type="sound_tone" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">🌀 MOTOR</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="motor_run" />
                <ToolboxBlock type="motor_stop" />
                <ToolboxBlock type="servo_angle" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">🖥️ DISPLAY</p>
              <div className="flex flex-col gap-3">
                <ToolboxBlock type="display_clear" />
                <ToolboxBlock type="display_show" />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-2" />

          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Starts</h3>
            <div className="grid grid-cols-1 gap-3">
              {PROJECT_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    updateBlocksWithHistory(tpl.blocks);
                    confetti({ particleCount: 50, spread: 40 });
                  }}
                  className={`p-4 rounded-2xl ${tpl.color} text-white font-bold text-left hover:scale-[1.02] active:scale-95 transition-all shadow-sm border-b-4 border-black/20`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase font-black opacity-70">{tpl.difficulty}</span>
                    <Play size={14} />
                  </div>
                  <h4 className="text-sm leading-tight">{tpl.title}</h4>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-[#FFEAA7] p-4 rounded-2xl border-2 border-primary">
              <p className="text-sm font-bold text-[#E17055] mb-2 uppercase tracking-wide">Badge Progress</p>
              <div className="flex gap-2 justify-center">
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-xs shadow-sm shadow-dark/10">🏆</div>
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-xs shadow-sm shadow-dark/10">💎</div>
                <div className="w-8 h-8 rounded-full bg-white/50 border-2 border-dashed border-primary flex items-center justify-center text-xs text-primary font-bold">?</div>
              </div>
              <p className="text-[10px] text-center mt-3 text-[#E17055] font-black uppercase tracking-widest">Next: Master of LED</p>
            </div>
          </div>
        </aside>

        {/* Programming Canvas (Center) */}
          <div className="flex-1 bg-bg-canvas relative flex flex-col p-8 overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-4 z-20">
              <div className="flex items-center bg-white/80 p-1 rounded-full border-2 border-gray-100 backdrop-blur-sm shadow-sm gap-1">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRightPanelTab('board')}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${rightPanelTab === 'board' ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  BOARD
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRightPanelTab('code')}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${rightPanelTab === 'code' ? 'bg-info text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  CODE
                </motion.button>
              </div>
            </div>

            {/* Drop Area */}
            <motion.div 
              id="workspace-area"
              animate={isSnapping ? { scale: [1, 1.01, 1], backgroundColor: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)'] } : {}}
              transition={{ duration: 0.2 }}
              className={`flex-1 rounded-[40px] flex flex-col p-8 overflow-y-auto min-h-0 transition-colors ${blocks.length === 0 ? 'bg-white/30 border-8 border-dashed border-white/50 items-center justify-center' : ''}`}
            >
              <AnimatePresence>
                {blocks.length === 0 ? (
                  <div className="text-center max-w-xs scale-125">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-info/10">
                      <Zap className="text-info" size={40} />
                    </div>
                    <h2 className="text-xl font-black text-gray-400">Drag a Magic Block here to start your adventure!</h2>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0 items-start ml-12">
                    {blocks.map((b, i) => (
                      <div key={b.id} className="group relative">
                        <WorkspaceBlock 
                          id={b.id} 
                          type={b.type} 
                          index={i} 
                          parameters={b.parameters} 
                          onUpdate={updateBlockParameters}
                        />
                        <motion.button 
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => removeBlock(b.id)}
                          className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </DndContext>

        {/* Code & Tutorials Sidebar (Right) */}
        <aside className="w-[300px] bg-white border-l-8 border-secondary flex flex-col shrink-0 overflow-hidden">
          <div className="flex border-b-4 border-gray-100 h-14 shrink-0">
            <button 
              onClick={() => setRightPanelTab('board')}
              className={`flex-1 font-black text-[10px] uppercase tracking-widest transition-all ${rightPanelTab === 'board' ? 'bg-white text-secondary border-b-4 border-secondary' : 'bg-gray-50 text-gray-400'}`}
            >
              Board
            </button>
            <button 
              onClick={() => setRightPanelTab('code')}
              className={`flex-1 font-black text-[10px] uppercase tracking-widest transition-all ${rightPanelTab === 'code' ? 'bg-white text-info border-b-4 border-info' : 'bg-gray-50 text-gray-400'}`}
            >
              IDE Code
            </button>
            <button 
              onClick={() => setRightPanelTab('tutorial')}
              className={`flex-1 font-black text-[10px] uppercase tracking-widest transition-all ${rightPanelTab === 'tutorial' ? 'bg-white text-accent border-b-4 border-accent' : 'bg-gray-50 text-gray-400'}`}
            >
              Library
            </button>
          </div>
          
          <div className="p-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
            {rightPanelTab === 'code' && (
              <div className="bg-dark rounded-2xl p-4 flex-1 overflow-auto font-mono text-[10px] shadow-inner mb-6">
                <pre className="text-secondary/80 whitespace-pre-wrap">
                  {generateArduinoCode(blocks)}
                </pre>
              </div>
            )}

            {rightPanelTab === 'board' && (
              <div className="flex-1 bg-gray-50 rounded-2xl flex items-center justify-center border-4 border-dashed border-gray-200 mb-6 relative overflow-hidden group">
                 <div className="absolute top-2 left-2 text-[8px] font-black text-gray-300 uppercase tracking-widest">Board Visualizer</div>
                 <ArduinoBoard activePins={activePins} />
              </div>
            )}

            {rightPanelTab === 'tutorial' && (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Starts</h3>
                <div className="grid grid-cols-1 gap-3">
                  {PROJECT_TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        updateBlocksWithHistory(tpl.blocks);
                        confetti({ particleCount: 50, spread: 40 });
                      }}
                      className={`p-4 rounded-2xl ${tpl.color} text-white font-bold text-left hover:scale-[1.02] active:scale-95 transition-all shadow-sm border-b-4 border-black/20`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase font-black opacity-70">{tpl.difficulty}</span>
                        <Play size={14} />
                      </div>
                      <h4 className="text-sm leading-tight">{tpl.title}</h4>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto bg-[#E1F5FE] p-4 rounded-2xl border-2 border-sky-100">
              <p className="font-black text-info uppercase text-[10px] mb-2 italic underline underline-offset-4 tracking-widest">Next Challenge</p>
              <h3 className="font-bold text-sm leading-tight text-[#01579B]">Can you make it blink faster?</h3>
              <p className="text-[11px] mt-2 text-[#0288D1] leading-relaxed">
                Change the "Wait" time to "100 ms" to make your Star blink super fast like a heartbeat!
              </p>
            </div>

            <div className="mt-6">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-white border-4 border-secondary rounded-2xl flex items-center justify-center gap-3 hover:shadow-md transition-all group active:translate-y-1"
              >
                <span className="text-2xl">📚</span>
                <span className="font-black text-[10px] text-secondary group-hover:text-secondary/80 uppercase tracking-widest">Open Library</span>
              </motion.button>
            </div>
          </div>
        </aside>
      </main>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {activeTab === 'tutorial' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/80 backdrop-blur-md z-50 p-12 flex items-center justify-center"
          >
            <div className="bg-white w-full max-w-4xl rounded-[60px] p-12 relative overflow-hidden">
               <button 
                onClick={() => setActiveTab('workspace')}
                className="absolute top-8 right-8 p-3 bg-gray-100 rounded-full text-gray-400 hover:text-dark transition-colors"
               >
                <Zap size={24} className="rotate-45" />
               </button>
               
               <div className="flex gap-12">
                 <div className="flex-1">
                   <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Beginner Lesson</span>
                   <h2 className="text-5xl font-black mt-6 mb-8 text-dark">Make a Heartbeat Light</h2>
                   <p className="text-xl text-gray-500 leading-relaxed mb-12">
                     Learn how to make an LED blink using the <span className="font-bold text-dark italic">"Wait"</span> command. This is exactly how emergency siren lights work!
                   </p>
                   
                   <div className="flex flex-col gap-6">
                     {[
                       "1. Drag 'Turn On Light' to the Sandbox",
                       "2. Snap a 'Wait' block underneath it",
                       "3. Add 'Turn Off Light'",
                       "4. Finish with one more 'Wait' block"
                     ].map((step, i) => (
                       <div key={i} className="flex items-center gap-6 group">
                         <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-300 group-hover:bg-info group-hover:text-white transition-all">{i + 1}</div>
                         <p className="font-bold text-gray-600">{step}</p>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="w-80 flex flex-col gap-6">
                    <div className="aspect-square bg-blue-50 rounded-[40px] flex items-center justify-center p-8 border-4 border-blue-100">
                       <Rocket className="text-blue-500 w-full h-full" />
                    </div>
                    <button 
                      onClick={() => setActiveTab('workspace')}
                      className="w-full bg-info text-white py-6 rounded-3xl font-black text-xl shadow-[0_8px_0_#0B8BC0] hover:translate-y-1 hover:shadow-[0_4px_0_#0B8BC0] transition-all"
                    >
                      LET'S GO!
                    </button>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Bottom Game Bar */}
      <footer className="h-12 bg-dark flex items-center px-8 justify-between text-white shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">⭐</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Level 4: Tinkerer</span>
          </div>
          <div className="w-48 h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              className="h-full bg-success shadow-[0_0_10px_rgba(85,239,196,0.5)]" 
            />
          </div>
        </div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] animate-pulse">
          Coding is your superpower! 🦸♂️
        </div>
      </footer>
    </div>
  );
}
