import type { TopicGraph } from '@core/types/topic.js';

export const physicsTopics: TopicGraph = {
  subject: 'physics',
  roots: ['mechanics', 'electricity', 'waves', 'thermodynamics'],
  nodes: {
    'mechanics': { id: 'mechanics', title: 'Mechanics', prereqs: [], children: ['mechanics.kinematics', 'mechanics.forces', 'mechanics.energy'] },
    'mechanics.kinematics': { id: 'mechanics.kinematics', title: 'Kinematics', prereqs: [] },
    'mechanics.forces': { id: 'mechanics.forces', title: 'Forces & Newton\'s laws', prereqs: ['mechanics.kinematics'] },
    'mechanics.energy': { id: 'mechanics.energy', title: 'Work & energy', prereqs: ['mechanics.forces'] },

    'electricity': { id: 'electricity', title: 'Electricity', prereqs: [], children: ['electricity.ohms-law', 'electricity.circuits'] },
    'electricity.ohms-law': { id: 'electricity.ohms-law', title: 'Ohm\'s law', prereqs: [] },
    'electricity.circuits': { id: 'electricity.circuits', title: 'Circuits (series & parallel)', prereqs: ['electricity.ohms-law'] },

    'waves': { id: 'waves', title: 'Waves', prereqs: [], children: ['waves.basics'] },
    'waves.basics': { id: 'waves.basics', title: 'Wave basics', prereqs: [] },

    'thermodynamics': { id: 'thermodynamics', title: 'Thermodynamics', prereqs: [] },
  },
};
