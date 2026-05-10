/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BlockCategory = 'Lights' | 'Control' | 'Sensors' | 'Logic' | 'Variables' | 'Communication';

export type BlockType = 
  | 'led_on' 
  | 'led_off'
  | 'led_brightness'
  | 'delay' 
  | 'repeat' 
  | 'setup' 
  | 'loop'
  | 'if_pressed'
  | 'if_else_pressed'
  | 'sensor_light'
  | 'sensor_touch'
  | 'analog_read'
  | 'map_value'
  | 'var_set'
  | 'var_get'
  | 'serial_say';

export interface BlockInstance {
  id: string;
  type: BlockType;
  category: BlockCategory;
  parameters: Record<string, string | number>;
  children?: BlockInstance[]; // For nested blocks like "repeat"
  elseChildren?: BlockInstance[]; // For if/else blocks
}

export interface ArduinoPin {
  id: number;
  label: string;
  type: 'digital' | 'analog' | 'ground' | 'power';
  isActive?: boolean;
}

export const INITIAL_PINS: ArduinoPin[] = [
  { id: 13, label: '13', type: 'digital' },
  { id: 12, label: '12', type: 'digital' },
  { id: 11, label: '11', type: 'digital' },
  { id: 10, label: '10', type: 'digital' },
  { id: 9, label: '9', type: 'digital' },
  { id: 8, label: '8', type: 'digital' },
  { id: 7, label: '7', type: 'digital' },
  { id: 6, label: '6', type: 'digital' },
  { id: 5, label: '5', type: 'digital' },
  { id: 4, label: '4', type: 'digital' },
  { id: 3, label: '3', type: 'digital' },
  { id: 2, label: '2', type: 'digital' },
  { id: 0, label: 'GND', type: 'ground' },
];

export const BLOCK_METADATA: Record<BlockType, { label: string; color: string; icon: string }> = {
  led_on: { label: 'Light On', color: 'bg-[#0984E3]', icon: 'Sun' },
  led_off: { label: 'Light Off', color: 'bg-[#74B9FF]', icon: 'Moon' },
  led_brightness: { label: 'Brightness', color: 'bg-[#00CEC9]', icon: 'Sun' },
  delay: { label: 'Wait 1 Sec', color: 'bg-[#FDCB6E]', icon: 'Clock' },
  repeat: { label: 'Forever', color: 'bg-[#FD79A8]', icon: 'RefreshCcw' },
  setup: { label: 'On Start', color: 'bg-[#FF7675]', icon: 'Play' },
  loop: { label: 'Forever', color: 'bg-[#FD79A8]', icon: 'IterationCcw' },
  if_pressed: { label: 'If Pressed', color: 'bg-[#6C5CE7]', icon: 'Zap' },
  if_else_pressed: { label: 'If/Else', color: 'bg-[#6C5CE7]', icon: 'Split' },
  sensor_light: { label: 'Light Sensor', color: 'bg-[#A29BFE]', icon: 'Eye' },
  sensor_touch: { label: 'Touch Sensor', color: 'bg-[#A29BFE]', icon: 'Fingerprint' },
  analog_read: { label: 'Analog Read', color: 'bg-[#A29BFE]', icon: 'Activity' },
  map_value: { label: 'Map Value', color: 'bg-[#00B894]', icon: 'Scale' },
  var_set: { label: 'Set Memory', color: 'bg-[#E17055]', icon: 'Save' },
  var_get: { label: 'Use Memory', color: 'bg-[#E17055]', icon: 'CloudDownload' },
  serial_say: { label: 'Say Message', color: 'bg-[#2D3436]', icon: 'MessageSquare' },
};
