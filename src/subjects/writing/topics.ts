import type { TopicGraph } from '@core/types/topic.js';

export const writingTopics: TopicGraph = {
  subject: 'writing',
  roots: ['structure', 'persuasive', 'descriptive', 'narrative', 'mechanics'],
  nodes: {
    'structure': {
      id: 'structure', title: 'Essay structure', prereqs: [],
      children: ['structure.intro', 'structure.body', 'structure.conclusion', 'structure.thesis'],
    },
    'structure.intro': { id: 'structure.intro', title: 'Writing an introduction', prereqs: [] },
    'structure.thesis': { id: 'structure.thesis', title: 'Thesis statements', prereqs: ['structure.intro'] },
    'structure.body': { id: 'structure.body', title: 'Body paragraphs (PEEL)', prereqs: ['structure.thesis'] },
    'structure.conclusion': { id: 'structure.conclusion', title: 'Writing a conclusion', prereqs: ['structure.body'] },

    'persuasive': {
      id: 'persuasive', title: 'Persuasive writing', prereqs: ['structure'],
      children: ['persuasive.ethos-pathos-logos', 'persuasive.techniques', 'persuasive.counterargument'],
    },
    'persuasive.ethos-pathos-logos': { id: 'persuasive.ethos-pathos-logos', title: 'Ethos, pathos, logos', prereqs: [] },
    'persuasive.techniques': { id: 'persuasive.techniques', title: 'Rhetorical techniques', prereqs: [] },
    'persuasive.counterargument': { id: 'persuasive.counterargument', title: 'Addressing counter-arguments', prereqs: ['persuasive.techniques'] },

    'descriptive': {
      id: 'descriptive', title: 'Descriptive writing', prereqs: [],
      children: ['descriptive.senses', 'descriptive.figurative'],
    },
    'descriptive.senses': { id: 'descriptive.senses', title: 'Show, don\'t tell (the five senses)', prereqs: [] },
    'descriptive.figurative': { id: 'descriptive.figurative', title: 'Similes, metaphors, personification', prereqs: [] },

    'narrative': {
      id: 'narrative', title: 'Narrative writing', prereqs: [],
      children: ['narrative.arc', 'narrative.character', 'narrative.dialogue'],
    },
    'narrative.arc': { id: 'narrative.arc', title: 'Story arc (setup, conflict, resolution)', prereqs: [] },
    'narrative.character': { id: 'narrative.character', title: 'Developing characters', prereqs: [] },
    'narrative.dialogue': { id: 'narrative.dialogue', title: 'Writing dialogue', prereqs: [] },

    'mechanics': {
      id: 'mechanics', title: 'Mechanics', prereqs: [],
      children: ['mechanics.topic-sentences', 'mechanics.transitions', 'mechanics.word-choice'],
    },
    'mechanics.topic-sentences': { id: 'mechanics.topic-sentences', title: 'Topic sentences', prereqs: [] },
    'mechanics.transitions': { id: 'mechanics.transitions', title: 'Transition words', prereqs: [] },
    'mechanics.word-choice': { id: 'mechanics.word-choice', title: 'Strong word choice', prereqs: [] },
  },
};
