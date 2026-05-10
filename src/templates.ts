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
  }
];
