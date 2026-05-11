import { BlockInstance } from './types';

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  blocks: BlockInstance[];
  color: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'disco-lights',
    title: 'Disco Party!',
    description: 'Make your lights dance like they are in a disco!',
    difficulty: 'Easy',
    color: 'bg-[#FD79A8]',
    blocks: [
      { id: '1', type: 'led_on', category: 'Lights', parameters: { pin: 13 } },
      { id: '2', type: 'delay', category: 'Control', parameters: { ms: 100 } },
      { id: '3', type: 'led_off', category: 'Lights', parameters: { pin: 13 } },
      { id: '4', type: 'delay', category: 'Control', parameters: { ms: 100 } }
    ]
  },
  {
    id: 'traffic-light',
    title: 'Traffic Control',
    description: 'Learn how real city traffic lights work.',
    difficulty: 'Medium',
    color: 'bg-[#00B894]',
    blocks: [
      { id: '1', type: 'led_on', category: 'Lights', parameters: { pin: 12 } }, // Green
      { id: '2', type: 'delay', category: 'Control', parameters: { ms: 3000 } },
      { id: '3', type: 'led_off', category: 'Lights', parameters: { pin: 12 } },
      { id: '4', type: 'led_on', category: 'Lights', parameters: { pin: 11 } }, // Yellow
      { id: '5', type: 'delay', category: 'Control', parameters: { ms: 1000 } }
    ]
  },
  {
    id: 'sos-signal',
    title: 'S.O.S Signal',
    description: 'A critical code used by ships and explorers.',
    difficulty: 'Hard',
    color: 'bg-[#6C5CE7]',
    blocks: [
      { id: '1', type: 'led_on', category: 'Lights', parameters: { pin: 13 } },
      { id: '2', type: 'delay', category: 'Control', parameters: { ms: 200 } },
      { id: '3', type: 'led_off', category: 'Lights', parameters: { pin: 13 } },
      { id: '4', type: 'delay', category: 'Control', parameters: { ms: 200 } }
    ]
  },
  {
    id: 'night-light',
    title: 'Smart Night Light',
    description: 'A light that turns on automatically when it gets dark!',
    difficulty: 'Medium',
    color: 'bg-[#F9CA24]',
    blocks: [
      { id: '1', type: 'sensor_light', category: 'Sensors', parameters: { pin: 'A0' } },
      { id: '2', type: 'if_pressed', category: 'Logic', parameters: { pin: 'A0' } }, // Simplified logic for kids
      { id: '3', type: 'led_on', category: 'Lights', parameters: { pin: 13 } },
      { id: '4', type: 'delay', category: 'Control', parameters: { ms: 500 } }
    ]
  },
  {
    id: 'servo-sweep',
    title: 'Waving Hand',
    description: 'Make a robotic hand wave hello!',
    difficulty: 'Medium',
    color: 'bg-[#EB4D4B]',
    blocks: [
      { id: '1', type: 'servo_angle', category: 'Motor', parameters: { pin: 10, angle: 0 } },
      { id: '2', type: 'delay', category: 'Control', parameters: { ms: 500 } },
      { id: '3', type: 'servo_angle', category: 'Motor', parameters: { pin: 10, angle: 180 } },
      { id: '4', type: 'delay', category: 'Control', parameters: { ms: 500 } }
    ]
  },
  {
    id: 'display-greet',
    title: 'Digital Sign',
    description: 'Write your name on the digital screen!',
    difficulty: 'Easy',
    color: 'bg-[#3498DB]',
    blocks: [
      { id: '1', type: 'display_clear', category: 'Display', parameters: {} },
      { id: '2', type: 'display_show', category: 'Display', parameters: { text: "HELLO KIDS!" } },
      { id: '3', type: 'sound_beep', category: 'Sound', parameters: { pin: 9 } }
    ]
  },
  {
    id: 'police-siren',
    title: 'Police Siren',
    description: 'Make sounds and lights like a police car!',
    difficulty: 'Hard',
    color: 'bg-[#1E3799]',
    blocks: [
      { id: '1', type: 'led_on', category: 'Lights', parameters: { pin: 13 } },
      { id: '2', type: 'sound_tone', category: 'Sound', parameters: { pin: 9, frequency: 600 } },
      { id: '3', type: 'delay', category: 'Control', parameters: { ms: 200 } },
      { id: '4', type: 'led_off', category: 'Lights', parameters: { pin: 13 } },
      { id: '5', type: 'led_on', category: 'Lights', parameters: { pin: 12 } },
      { id: '6', type: 'sound_tone', category: 'Sound', parameters: { pin: 9, frequency: 900 } },
      { id: '7', type: 'delay', category: 'Control', parameters: { ms: 200 } },
      { id: '8', type: 'led_off', category: 'Lights', parameters: { pin: 12 } }
    ]
  },
  {
    id: 'burglar-alarm',
    title: 'Secret Agent Alarm',
    description: 'Protect your room! Beeps and flashes when the door opens.',
    difficulty: 'Hard',
    color: 'bg-[#FF7675]',
    blocks: [
      { id: '1', type: 'sensor_touch', category: 'Sensors', parameters: { pin: 2 } },
      { id: '2', type: 'if_pressed', category: 'Logic', parameters: { pin: 2 } },
      { id: '3', type: 'sound_beep', category: 'Sound', parameters: { pin: 9 } },
      { id: '4', type: 'led_on', category: 'Lights', parameters: { pin: 13 } },
      { id: '5', type: 'delay', category: 'Control', parameters: { ms: 500 } }
    ]
  },
  {
    id: 'automatic-fan',
    title: 'Self-Cooling Fan',
    description: 'A fan that turns on when you press the button.',
    difficulty: 'Medium',
    color: 'bg-[#55E6C1]',
    blocks: [
      { id: '1', type: 'sensor_touch', category: 'Sensors', parameters: { pin: 2 } },
      { id: '2', type: 'if_pressed', category: 'Logic', parameters: { pin: 2 } },
      { id: '3', type: 'motor_run', category: 'Motor', parameters: { pin: 5, speed: 255 } },
      { id: '4', type: 'delay', category: 'Control', parameters: { ms: 2000 } },
      { id: '5', type: 'motor_stop', category: 'Motor', parameters: { pin: 5 } }
    ]
  },
  {
    id: 'distance-piano',
    title: 'Light Piano',
    description: 'Play music by moving your hand over the light sensor!',
    difficulty: 'Hard',
    color: 'bg-[#9B59B6]',
    blocks: [
      { id: '1', type: 'sensor_light', category: 'Sensors', parameters: { pin: 'A0', variable: 'light' } },
      { id: '2', type: 'map_value', category: 'Logic', parameters: { input: 'light', output: 'note', inMin: 0, inMax: 1023, outMin: 200, outMax: 1000 } },
      { id: '3', type: 'sound_tone', category: 'Sound', parameters: { pin: 9, frequency: 440 } } // Note: logic would need more blocks to be truly dynamic, but this is a good start
    ]
  },
  {
    id: 'digital-clock-sim',
    title: 'Hello Screen',
    description: 'Show a welcome message and clear it.',
    difficulty: 'Easy',
    color: 'bg-[#2980B9]',
    blocks: [
      { id: '1', type: 'display_clear', category: 'Display', parameters: {} },
      { id: '2', type: 'display_show', category: 'Display', parameters: { text: "WELCOME!" } },
      { id: '3', type: 'delay', category: 'Control', parameters: { ms: 3000 } },
      { id: '4', type: 'display_clear', category: 'Display', parameters: {} },
      { id: '5', type: 'display_show', category: 'Display', parameters: { text: "LET'S CODE!" } }
    ]
  },
  {
    id: 'mood-lamp',
    title: 'Color Mood Lamp',
    description: 'Switch between different colors to set the mood!',
    difficulty: 'Medium',
    color: 'bg-[#00CEC9]',
    blocks: [
      { id: '1', type: 'led_on', category: 'Lights', parameters: { pin: 11 } },
      { id: '2', type: 'delay', category: 'Control', parameters: { ms: 1000 } },
      { id: '3', type: 'led_off', category: 'Lights', parameters: { pin: 11 } },
      { id: '4', type: 'led_on', category: 'Lights', parameters: { pin: 10 } },
      { id: '5', type: 'delay', category: 'Control', parameters: { ms: 1000 } },
      { id: '6', type: 'led_off', category: 'Lights', parameters: { pin: 10 } }
    ]
  },
  {
    id: 'digital-meter',
    title: 'Light Meter',
    description: 'Show the brightness level on your screen!',
    difficulty: 'Hard',
    color: 'bg-[#B2BEC3]',
    blocks: [
      { id: '1', type: 'sensor_light', category: 'Sensors', parameters: { pin: 'A0', variable: 'brightness' } },
      { id: '2', type: 'display_clear', category: 'Display', parameters: {} },
      { id: '3', type: 'display_show', category: 'Display', parameters: { text: "BRIGHTNESS:" } },
      { id: '4', type: 'display_show', category: 'Display', parameters: { text: "WAITING..." } }
    ]
  },
  {
    id: 'laser-tripwire',
    title: 'Laser Tripwire',
    description: 'Buzzer sounds when someone breaks the invisible laser beam!',
    difficulty: 'Hard',
    color: 'bg-[#D63031]',
    blocks: [
      { id: '1', type: 'sensor_light', category: 'Sensors', parameters: { pin: 'A0' } },
      { id: '2', type: 'if_pressed', category: 'Logic', parameters: { pin: 'A0' } },
      { id: '3', type: 'sound_tone', category: 'Sound', parameters: { pin: 9, frequency: 1000 } },
      { id: '4', type: 'delay', category: 'Control', parameters: { ms: 500 } }
    ]
  },
  {
    id: 'robot-wave',
    title: 'Robot Greeting',
    description: 'Your robot waves and beeps when it sees you!',
    difficulty: 'Medium',
    color: 'bg-[#6AB04C]',
    blocks: [
      { id: '1', type: 'sensor_touch', category: 'Sensors', parameters: { pin: 2 } },
      { id: '2', type: 'servo_angle', category: 'Motor', parameters: { pin: 10, angle: 45 } },
      { id: '3', type: 'sound_beep', category: 'Sound', parameters: { pin: 9 } },
      { id: '4', type: 'delay', category: 'Control', parameters: { ms: 3000 } },
      { id: '5', type: 'servo_angle', category: 'Motor', parameters: { pin: 10, angle: 135 } }
    ]
  }
];
