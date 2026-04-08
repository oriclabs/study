import type { TopicGraph } from '@core/types/topic.js';

export const readingTopics: TopicGraph = {
  subject: 'reading',
  roots: ['comprehension', 'analysis', 'evaluation'],
  nodes: {
    // Comprehension
    'comprehension': {
      id: 'comprehension', title: 'Comprehension', prereqs: [],
      children: ['comprehension.stated-info', 'comprehension.sequencing', 'comprehension.main-idea',
                  'comprehension.vocabulary'],
    },
    'comprehension.stated-info': { id: 'comprehension.stated-info', title: 'Finding stated information', prereqs: [] },
    'comprehension.sequencing': { id: 'comprehension.sequencing', title: 'Sequencing & details', prereqs: ['comprehension.stated-info'] },
    'comprehension.main-idea': { id: 'comprehension.main-idea', title: 'Main idea & summary', prereqs: ['comprehension.stated-info'] },
    'comprehension.vocabulary': { id: 'comprehension.vocabulary', title: 'Vocabulary in context', prereqs: [] },

    // Analysis
    'analysis': {
      id: 'analysis', title: 'Analysis', prereqs: ['comprehension'],
      children: ['analysis.inference', 'analysis.purpose', 'analysis.tone',
                  'analysis.evidence', 'analysis.structure'],
    },
    'analysis.inference': { id: 'analysis.inference', title: 'Inference & implied meaning', prereqs: ['comprehension.stated-info'] },
    'analysis.purpose': { id: 'analysis.purpose', title: 'Author purpose & perspective', prereqs: ['analysis.inference'] },
    'analysis.tone': { id: 'analysis.tone', title: 'Tone, mood & atmosphere', prereqs: ['analysis.inference'] },
    'analysis.evidence': { id: 'analysis.evidence', title: 'Finding & using evidence', prereqs: ['comprehension.stated-info'] },
    'analysis.structure': { id: 'analysis.structure', title: 'Text structure & features', prereqs: [] },

    // Evaluation
    'evaluation': {
      id: 'evaluation', title: 'Evaluation', prereqs: ['analysis'],
      children: ['evaluation.compare', 'evaluation.critical', 'evaluation.strategy'],
    },
    'evaluation.compare': { id: 'evaluation.compare', title: 'Comparing & contrasting passages', prereqs: ['analysis.inference'] },
    'evaluation.critical': { id: 'evaluation.critical', title: 'Critical evaluation', prereqs: ['analysis.purpose'] },
    'evaluation.strategy': { id: 'evaluation.strategy', title: 'Exam reading strategy', prereqs: [] },
  },
};
