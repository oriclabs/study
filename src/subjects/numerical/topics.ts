import type { TopicGraph } from '@core/types/topic.js';

/**
 * Numerical reasoning — distinct from math curriculum. Tests pattern
 * recognition, number sense, and problem decomposition rather than
 * specific algebraic/geometric syllabus topics. Common in selective
 * school entrance exams (AU selective, UK 11+, AMC, etc.).
 */
export const numericalTopics: TopicGraph = {
  subject: 'numerical',
  roots: ['sequences', 'patterns', 'word-problems', 'data-interpretation', 'proportion'],
  nodes: {
    'sequences': {
      id: 'sequences', title: 'Number sequences', prereqs: [],
      children: ['sequences.arithmetic', 'sequences.geometric', 'sequences.fibonacci', 'sequences.mixed'],
    },
    'sequences.arithmetic': { id: 'sequences.arithmetic', title: 'Arithmetic (constant difference)', prereqs: [] },
    'sequences.geometric': { id: 'sequences.geometric', title: 'Geometric (constant ratio)', prereqs: [] },
    'sequences.fibonacci': { id: 'sequences.fibonacci', title: 'Fibonacci-like (sum of two prior)', prereqs: [] },
    'sequences.mixed': { id: 'sequences.mixed', title: 'Mixed operations (×, +, alternating)', prereqs: ['sequences.arithmetic', 'sequences.geometric'] },

    'patterns': {
      id: 'patterns', title: 'Visual and number patterns', prereqs: [],
      children: ['patterns.grid', 'patterns.odd-one-out', 'patterns.matrix'],
    },
    'patterns.grid': { id: 'patterns.grid', title: 'Missing number in grid', prereqs: [] },
    'patterns.odd-one-out': { id: 'patterns.odd-one-out', title: 'Odd one out', prereqs: [] },
    'patterns.matrix': { id: 'patterns.matrix', title: 'Matrix patterns', prereqs: [] },

    'word-problems': {
      id: 'word-problems', title: 'Word problems', prereqs: [],
      children: ['word-problems.age', 'word-problems.work-rate', 'word-problems.distance-time', 'word-problems.mixtures'],
    },
    'word-problems.age': { id: 'word-problems.age', title: 'Age problems', prereqs: [] },
    'word-problems.work-rate': { id: 'word-problems.work-rate', title: 'Work and rate', prereqs: [] },
    'word-problems.distance-time': { id: 'word-problems.distance-time', title: 'Distance, speed, time', prereqs: [] },
    'word-problems.mixtures': { id: 'word-problems.mixtures', title: 'Mixture and proportion', prereqs: [] },

    'data-interpretation': {
      id: 'data-interpretation', title: 'Data interpretation', prereqs: [],
      children: ['data-interpretation.tables', 'data-interpretation.graphs', 'data-interpretation.charts'],
    },
    'data-interpretation.tables': { id: 'data-interpretation.tables', title: 'Reading tables', prereqs: [] },
    'data-interpretation.graphs': { id: 'data-interpretation.graphs', title: 'Line and bar graphs', prereqs: [] },
    'data-interpretation.charts': { id: 'data-interpretation.charts', title: 'Pie charts and percentages', prereqs: [] },

    'proportion': {
      id: 'proportion', title: 'Proportion and ratio reasoning', prereqs: [],
      children: ['proportion.direct', 'proportion.inverse', 'proportion.ratio-sharing'],
    },
    'proportion.direct': { id: 'proportion.direct', title: 'Direct proportion', prereqs: [] },
    'proportion.inverse': { id: 'proportion.inverse', title: 'Inverse proportion', prereqs: [] },
    'proportion.ratio-sharing': { id: 'proportion.ratio-sharing', title: 'Sharing in a ratio', prereqs: [] },
  },
};
