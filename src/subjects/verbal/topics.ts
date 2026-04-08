import type { TopicGraph } from '@core/types/topic.js';

export const verbalTopics: TopicGraph = {
  subject: 'verbal',
  roots: ['analogies', 'vocabulary', 'logic', 'language'],
  nodes: {
    // Analogies
    'analogies': {
      id: 'analogies', title: 'Analogies', prereqs: ['vocabulary'],
      children: ['analogies.relationship-types', 'analogies.bridge-sentences', 'analogies.complex'],
    },
    'analogies.relationship-types': { id: 'analogies.relationship-types', title: 'Analogy relationship types', prereqs: [] },
    'analogies.bridge-sentences': { id: 'analogies.bridge-sentences', title: 'Bridge sentence method', prereqs: ['analogies.relationship-types'] },
    'analogies.complex': { id: 'analogies.complex', title: 'Complex and multi-step analogies', prereqs: ['analogies.bridge-sentences'] },

    // Vocabulary
    'vocabulary': {
      id: 'vocabulary', title: 'Vocabulary', prereqs: [],
      children: ['vocabulary.synonyms', 'vocabulary.antonyms', 'vocabulary.context', 'vocabulary.word-parts',
                  'vocabulary.multiple-meanings', 'vocabulary.homophones'],
    },
    'vocabulary.synonyms': { id: 'vocabulary.synonyms', title: 'Synonyms', prereqs: [] },
    'vocabulary.antonyms': { id: 'vocabulary.antonyms', title: 'Antonyms', prereqs: ['vocabulary.synonyms'] },
    'vocabulary.context': { id: 'vocabulary.context', title: 'Word meanings in context', prereqs: [] },
    'vocabulary.word-parts': { id: 'vocabulary.word-parts', title: 'Prefixes, roots & suffixes', prereqs: [] },
    'vocabulary.multiple-meanings': { id: 'vocabulary.multiple-meanings', title: 'Multiple meaning words', prereqs: ['vocabulary.context'] },
    'vocabulary.homophones': { id: 'vocabulary.homophones', title: 'Homophones & confusable words', prereqs: [] },

    // Logic & deduction
    'logic': {
      id: 'logic', title: 'Logic & Deduction', prereqs: [],
      children: ['logic.odd-one-out', 'logic.syllogisms', 'logic.coding', 'logic.deductive', 'logic.inference'],
    },
    'logic.odd-one-out': { id: 'logic.odd-one-out', title: 'Odd one out', prereqs: [] },
    'logic.syllogisms': { id: 'logic.syllogisms', title: 'Syllogisms & deductive reasoning', prereqs: [] },
    'logic.coding': { id: 'logic.coding', title: 'Letter & number codes', prereqs: [] },
    'logic.deductive': { id: 'logic.deductive', title: 'Deductive reasoning', prereqs: ['logic.syllogisms'] },
    'logic.inference': { id: 'logic.inference', title: 'Drawing inferences', prereqs: [] },

    // Language skills
    'language': {
      id: 'language', title: 'Language Skills', prereqs: [],
      children: ['language.sentence-completion', 'language.spelling', 'language.grammar',
                  'language.idioms', 'language.comprehension'],
    },
    'language.sentence-completion': { id: 'language.sentence-completion', title: 'Sentence completion (cloze)', prereqs: ['vocabulary'] },
    'language.spelling': { id: 'language.spelling', title: 'Spelling patterns & rules', prereqs: [] },
    'language.grammar': { id: 'language.grammar', title: 'Grammar & parts of speech', prereqs: [] },
    'language.idioms': { id: 'language.idioms', title: 'Idioms & proverbs', prereqs: ['vocabulary.context'] },
    'language.comprehension': { id: 'language.comprehension', title: 'Reading comprehension (verbal)', prereqs: ['logic.inference'] },
  },
};
