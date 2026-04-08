import type { TopicGraph } from '@core/types/topic.js';

export const grammarTopics: TopicGraph = {
  subject: 'grammar',
  roots: ['agreement', 'pronouns', 'punctuation', 'sentence-structure'],
  nodes: {
    'agreement': { id: 'agreement', title: 'Agreement', prereqs: [], children: ['agreement.subject-verb', 'agreement.tense'] },
    'agreement.subject-verb': { id: 'agreement.subject-verb', title: 'Subject-verb agreement', prereqs: [] },
    'agreement.tense': { id: 'agreement.tense', title: 'Tense consistency', prereqs: [] },

    'pronouns': { id: 'pronouns', title: 'Pronouns', prereqs: [], children: ['pronouns.antecedent', 'pronouns.case'] },
    'pronouns.antecedent': { id: 'pronouns.antecedent', title: 'Pronoun-antecedent agreement', prereqs: [] },
    'pronouns.case': { id: 'pronouns.case', title: 'Pronoun case', prereqs: [] },

    'punctuation': { id: 'punctuation', title: 'Punctuation', prereqs: [], children: ['punctuation.commas'] },
    'punctuation.commas': { id: 'punctuation.commas', title: 'Comma usage', prereqs: [] },

    'sentence-structure': { id: 'sentence-structure', title: 'Sentence structure', prereqs: [], children: ['sentence-structure.fragments'] },
    'sentence-structure.fragments': { id: 'sentence-structure.fragments', title: 'Fragments and run-ons', prereqs: [] },
  },
};
