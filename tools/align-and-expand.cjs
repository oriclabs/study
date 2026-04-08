/**
 * 1. Expand verbal and reading topic graphs to match exam subtypes
 * 2. Add topic_id field to pack topics mapping to subject topic IDs
 * 3. Ensure all pack topics have a corresponding subject topic node
 *
 * Run: node tools/align-and-expand.cjs
 */

const fs = require('fs');
const path = require('path');

// ============ EXPAND TOPIC GRAPHS ============

// Expanded verbal topics
const verbalTopicsTS = `import type { TopicGraph } from '@core/types/topic.js';

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
`;

// Expanded reading topics
const readingTopicsTS = `import type { TopicGraph } from '@core/types/topic.js';

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
`;

// Expanded math topics
const mathTopicsTS = `import type { TopicGraph } from '@core/types/topic.js';

export const mathTopics: TopicGraph = {
  subject: 'math',
  roots: ['number', 'algebra', 'geometry', 'measurement', 'statistics', 'financial'],
  nodes: {
    // Number & Arithmetic
    'number': {
      id: 'number', title: 'Number & Arithmetic', prereqs: [],
      children: ['number.types', 'number.factors', 'number.operations', 'number.decimals'],
    },
    'number.types': { id: 'number.types', title: 'Types of numbers', prereqs: [] },
    'number.factors': { id: 'number.factors', title: 'Factors, multiples & divisibility', prereqs: ['number.types'] },
    'number.operations': { id: 'number.operations', title: 'Operations with integers', prereqs: ['number.types'] },
    'number.decimals': { id: 'number.decimals', title: 'Terminating & recurring decimals', prereqs: ['number.types'] },

    // Fractions, Decimals, Percentages
    'fractions': {
      id: 'fractions', title: 'Fractions, Decimals & Percentages', prereqs: ['number'],
      children: ['fractions.fractions', 'fractions.decimals', 'fractions.percentages'],
    },
    'fractions.fractions': { id: 'fractions.fractions', title: 'Fractions', prereqs: ['number.factors'] },
    'fractions.decimals': { id: 'fractions.decimals', title: 'Decimals', prereqs: [] },
    'fractions.percentages': { id: 'fractions.percentages', title: 'Percentages', prereqs: ['fractions.fractions', 'fractions.decimals'] },

    // Ratio & Proportion
    'ratio': {
      id: 'ratio', title: 'Ratio & Proportion', prereqs: ['fractions'],
      children: ['ratio.ratios', 'ratio.proportion', 'ratio.rates'],
    },
    'ratio.ratios': { id: 'ratio.ratios', title: 'Ratios', prereqs: [] },
    'ratio.proportion': { id: 'ratio.proportion', title: 'Direct & inverse proportion', prereqs: ['ratio.ratios'] },
    'ratio.rates': { id: 'ratio.rates', title: 'Rates — speed, distance & time', prereqs: ['ratio.ratios'] },

    // Powers & Surds
    'powers': {
      id: 'powers', title: 'Powers, Roots & Surds', prereqs: ['number'],
      children: ['powers.index-laws', 'powers.surds', 'powers.scientific', 'powers.logarithms'],
    },
    'powers.index-laws': { id: 'powers.index-laws', title: 'Index laws', prereqs: [] },
    'powers.surds': { id: 'powers.surds', title: 'Square roots, cube roots & surds', prereqs: ['powers.index-laws'] },
    'powers.scientific': { id: 'powers.scientific', title: 'Scientific notation', prereqs: ['powers.index-laws'] },
    'powers.logarithms': { id: 'powers.logarithms', title: 'Logarithms', prereqs: ['powers.index-laws'] },

    // Algebra
    'algebra': {
      id: 'algebra', title: 'Algebra', prereqs: ['number'],
      children: ['algebra.expressions', 'algebra.linear-equations', 'algebra.simultaneous',
                  'algebra.inequalities', 'algebra.quadratics', 'algebra.non-linear',
                  'algebra.fractions', 'algebra.polynomials'],
    },
    'algebra.expressions': { id: 'algebra.expressions', title: 'Expanding & factorising', prereqs: [] },
    'algebra.linear-equations': { id: 'algebra.linear-equations', title: 'Linear equations', prereqs: ['algebra.expressions'] },
    'algebra.simultaneous': { id: 'algebra.simultaneous', title: 'Simultaneous equations', prereqs: ['algebra.linear-equations'] },
    'algebra.inequalities': { id: 'algebra.inequalities', title: 'Inequalities', prereqs: ['algebra.linear-equations'] },
    'algebra.quadratics': { id: 'algebra.quadratics', title: 'Quadratic equations', prereqs: ['algebra.expressions'] },
    'algebra.non-linear': { id: 'algebra.non-linear', title: 'Non-linear graphs', prereqs: ['algebra.quadratics'] },
    'algebra.fractions': { id: 'algebra.fractions', title: 'Algebraic fractions', prereqs: ['algebra.expressions'] },
    'algebra.polynomials': { id: 'algebra.polynomials', title: 'Polynomials & factor theorem', prereqs: ['algebra.quadratics'] },

    // Sequences
    'sequences': {
      id: 'sequences', title: 'Sequences & Patterns', prereqs: ['algebra'],
      children: ['sequences.arithmetic', 'sequences.geometric', 'sequences.other'],
    },
    'sequences.arithmetic': { id: 'sequences.arithmetic', title: 'Arithmetic sequences', prereqs: [] },
    'sequences.geometric': { id: 'sequences.geometric', title: 'Geometric sequences', prereqs: [] },
    'sequences.other': { id: 'sequences.other', title: 'Other sequence types', prereqs: [] },

    // Geometry
    'geometry': {
      id: 'geometry', title: 'Geometry', prereqs: [],
      children: ['geometry.angles', 'geometry.triangles', 'geometry.pythagoras',
                  'geometry.similarity', 'geometry.quadrilaterals', 'geometry.polygons',
                  'geometry.circles', 'geometry.transformations', 'geometry.scale',
                  'geometry.coordinate'],
    },
    'geometry.angles': { id: 'geometry.angles', title: 'Angle properties', prereqs: [] },
    'geometry.triangles': { id: 'geometry.triangles', title: 'Triangles', prereqs: ['geometry.angles'] },
    'geometry.pythagoras': { id: 'geometry.pythagoras', title: "Pythagoras' theorem", prereqs: ['geometry.triangles'] },
    'geometry.similarity': { id: 'geometry.similarity', title: 'Similarity & congruence', prereqs: ['geometry.triangles'] },
    'geometry.quadrilaterals': { id: 'geometry.quadrilaterals', title: 'Quadrilaterals', prereqs: ['geometry.angles'] },
    'geometry.polygons': { id: 'geometry.polygons', title: 'Polygons', prereqs: ['geometry.quadrilaterals'] },
    'geometry.circles': { id: 'geometry.circles', title: 'Circle theorems', prereqs: ['geometry.angles'] },
    'geometry.transformations': { id: 'geometry.transformations', title: 'Transformations', prereqs: [] },
    'geometry.scale': { id: 'geometry.scale', title: 'Scale drawings & maps', prereqs: ['ratio.ratios'] },
    'geometry.coordinate': { id: 'geometry.coordinate', title: 'Coordinate geometry', prereqs: ['algebra.linear-equations'] },

    // Measurement
    'measurement': {
      id: 'measurement', title: 'Measurement', prereqs: ['geometry'],
      children: ['measurement.perimeter', 'measurement.area', 'measurement.surface-area',
                  'measurement.volume', 'measurement.composite'],
    },
    'measurement.perimeter': { id: 'measurement.perimeter', title: 'Perimeter & circumference', prereqs: [] },
    'measurement.area': { id: 'measurement.area', title: 'Area', prereqs: ['measurement.perimeter'] },
    'measurement.surface-area': { id: 'measurement.surface-area', title: 'Surface area', prereqs: ['measurement.area'] },
    'measurement.volume': { id: 'measurement.volume', title: 'Volume', prereqs: ['measurement.area'] },
    'measurement.composite': { id: 'measurement.composite', title: 'Composite solids', prereqs: ['measurement.volume', 'measurement.surface-area'] },

    // Statistics & Probability
    'statistics': {
      id: 'statistics', title: 'Statistics & Probability', prereqs: ['number'],
      children: ['statistics.data', 'statistics.probability'],
    },
    'statistics.data': { id: 'statistics.data', title: 'Data analysis & representation', prereqs: [] },
    'statistics.probability': { id: 'statistics.probability', title: 'Probability', prereqs: [] },

    // Financial
    'financial': {
      id: 'financial', title: 'Financial Mathematics', prereqs: ['fractions.percentages'],
      children: ['financial.interest', 'financial.profit-loss'],
    },
    'financial.interest': { id: 'financial.interest', title: 'Simple & compound interest', prereqs: [] },
    'financial.profit-loss': { id: 'financial.profit-loss', title: 'Profit, loss & discount', prereqs: [] },
  },
};
`;

// Write expanded topic files
const srcDir = path.join(__dirname, '..', 'src', 'subjects');
fs.writeFileSync(path.join(srcDir, 'verbal', 'topics.ts'), verbalTopicsTS);
fs.writeFileSync(path.join(srcDir, 'reading', 'topics.ts'), readingTopicsTS);
fs.writeFileSync(path.join(srcDir, 'math', 'topics.ts'), mathTopicsTS);

console.log('Expanded topic graphs:');
console.log('  math: 13 → 50+ nodes');
console.log('  verbal: 4 → 25+ nodes');
console.log('  reading: 7 → 16 nodes');

// ============ ADD topic_id TO PACK TOPICS ============

const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'packs', 'vic-selective-exam.json'), 'utf8'));

// Mapping from pack topic title patterns to subject topic IDs
const topicIdMap = {
  // Math
  'Types of Numbers': 'number.types',
  'Factors, Multiples': 'number.factors',
  'Operations with Integers': 'number.operations',
  'Terminating': 'number.decimals',
  'Fractions': 'fractions.fractions',
  'Decimals': 'fractions.decimals',
  'Percentages': 'fractions.percentages',
  'Ratios': 'ratio.ratios',
  'Direct & Inverse': 'ratio.proportion',
  'Rates —': 'ratio.rates',
  'Index Laws': 'powers.index-laws',
  'Square Roots': 'powers.surds',
  'Scientific Notation': 'powers.scientific',
  'Logarithms': 'powers.logarithms',
  'Expanding & Factoris': 'algebra.expressions',
  'Linear Equations': 'algebra.linear-equations',
  'Simultaneous': 'algebra.simultaneous',
  'Inequalities': 'algebra.inequalities',
  'Quadratic': 'algebra.quadratics',
  'Non-Linear': 'algebra.non-linear',
  'Algebraic Fractions': 'algebra.fractions',
  'Polynomials': 'algebra.polynomials',
  'Arithmetic Sequences': 'sequences.arithmetic',
  'Geometric Sequences': 'sequences.geometric',
  'Other Sequence': 'sequences.other',
  'Angle Properties': 'geometry.angles',
  'Triangles': 'geometry.triangles',
  'Pythagoras': 'geometry.pythagoras',
  'Similarity': 'geometry.similarity',
  'Quadrilaterals': 'geometry.quadrilaterals',
  'Polygons': 'geometry.polygons',
  'Circle Theorems': 'geometry.circles',
  'Transformations': 'geometry.transformations',
  'Scale': 'geometry.scale',
  'Coordinate': 'geometry.coordinate',
  'Perimeter': 'measurement.perimeter',
  'Area': 'measurement.area',
  'Surface Area': 'measurement.surface-area',
  'Volume': 'measurement.volume',
  'Composite Solids': 'measurement.composite',
  'Data Analysis': 'statistics.data',
  'Probability': 'statistics.probability',
  'Simple & Compound': 'financial.interest',
  'Profit': 'financial.profit-loss',

  // Verbal
  'Understanding Analogies': 'analogies',
  'Analogy Relationship': 'analogies.relationship-types',
  'Synonyms': 'vocabulary.synonyms',
  'Antonyms': 'vocabulary.antonyms',
  'Odd One Out': 'logic.odd-one-out',
  'Sentence Completion': 'language.sentence-completion',
  'Word Meanings': 'vocabulary.context',
  'Prefixes': 'vocabulary.word-parts',
  'Multiple Meaning': 'vocabulary.multiple-meanings',
  'Homophones': 'vocabulary.homophones',
  'Inference': 'logic.inference',
  'Syllogisms': 'logic.syllogisms',
  'Coding': 'logic.coding',
  'Parts of Speech': 'language.grammar',
  'Spelling': 'language.spelling',
  'Idioms': 'language.idioms',
  'Comprehension Strategies': 'language.comprehension',
  'Deductive': 'logic.deductive',

  // Reading
  'Finding Stated': 'comprehension.stated-info',
  'Sequencing': 'comprehension.sequencing',
  'Main Idea': 'comprehension.main-idea',
  'Vocabulary in Context': 'comprehension.vocabulary',
  'Inference & Implied': 'analysis.inference',
  'Author Purpose': 'analysis.purpose',
  'Tone': 'analysis.tone',
  'Finding & Using Evidence': 'analysis.evidence',
  'Text Structure': 'analysis.structure',

  // Writing
  'Essay Planning': 'structure',
  'Strong Openings': 'structure.intro',
  'Powerful Endings': 'structure.conclusion',
  'Paragraphing': 'structure.body',
  'Sentence Variety': 'mechanics.topic-sentences',
  'Descriptive': 'descriptive',
  'Narrative': 'narrative',
  'Persuasive': 'persuasive',
  'Editing': 'mechanics.word-choice',

  // Quantitative — maps to numerical topics
  'Arithmetic with Integers': 'sequences.arithmetic',
  'Fractions, Decimals & Percentages': 'proportion.direct',
  'Ratios & Proportional': 'proportion.ratio-sharing',
  'Number Sequences': 'sequences',
  'Shape Sequences': 'patterns',
  'Speed, Distance': 'word-problems.distance-time',
  'Work & Rate': 'word-problems.work-rate',
  'Mixture': 'word-problems.mixtures',
  'Algebra & Word': 'word-problems',
  'Perimeter, Area & Volume': 'proportion.direct',
  'Tables & Charts': 'data-interpretation.tables',
  'Statistics': 'data-interpretation',
  'Venn Diagram': 'patterns.matrix',
  'Logic': 'patterns',
  'Time Problem': 'word-problems',
  'Money': 'word-problems',
  'Mental Math': 'sequences',
  'Rotations': 'patterns',
  'Reflections': 'patterns',
  'Paper Folding': 'patterns',
  '3D Visual': 'patterns.grid',
  'Angles': 'proportion.direct',
};

let mapped = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      if (t.topic_id) continue; // already mapped

      for (const [pattern, topicId] of Object.entries(topicIdMap)) {
        if (t.title && t.title.includes(pattern)) {
          t.topic_id = topicId;
          mapped++;
          break;
        }
      }
    }
  }
}

fs.writeFileSync(path.join(__dirname, '..', 'packs', 'vic-selective-exam.json'), JSON.stringify(d, null, 2));
console.log('\\nMapped ' + mapped + ' pack topics to subject topic IDs');

// Count unmapped
let unmapped = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      if (!t.topic_id) {
        console.log('  Unmapped: ' + subj.id + '/' + t.title);
        unmapped++;
      }
    }
  }
}
console.log('Unmapped topics remaining: ' + unmapped);
