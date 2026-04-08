/**
 * Generate worked examples for strategies that are missing them.
 */
const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');
const d = JSON.parse(fs.readFileSync(PACK_PATH, 'utf8'));

const examples = {
  // Math
  'Factors, Multiples & Divisibility': { question: 'Find the HCF and LCM of 12 and 18.', steps: ['Prime factorise: 12 = 2² × 3, 18 = 2 × 3²', 'HCF = common primes, lowest powers: 2¹ × 3¹ = 6', 'LCM = all primes, highest powers: 2² × 3² = 36', 'Check: 6 × 36 = 216 = 12 × 18 ✓'], answer: 'HCF = 6, LCM = 36' },
  'Percentages': { question: 'A shirt costs $80 and is reduced by 25%. What is the sale price?', steps: ['25% of $80 = 0.25 × 80 = $20', 'Sale price = $80 − $20 = $60', 'Or shortcut: $80 × 0.75 = $60'], answer: '$60' },
  'Ratios': { question: 'Share $150 in the ratio 2:3.', steps: ['Total parts = 2 + 3 = 5', 'Value of 1 part = $150 ÷ 5 = $30', 'First share = 2 × $30 = $60', 'Second share = 3 × $30 = $90', 'Check: $60 + $90 = $150 ✓'], answer: '$60 and $90' },
  'Rates — Speed, Distance & Time': { question: 'A car travels 180 km at 60 km/h, then 120 km at 40 km/h. Average speed?', steps: ['Time 1 = 180 ÷ 60 = 3 hours', 'Time 2 = 120 ÷ 40 = 3 hours', 'Total distance = 300 km, Total time = 6 hours', 'Average speed = 300 ÷ 6 = 50 km/h'], answer: '50 km/h' },
  'Square Roots, Cube Roots & Surds': { question: 'Simplify √72.', steps: ['Find largest perfect square factor: 72 = 36 × 2', '√72 = √36 × √2 = 6√2'], answer: '6√2' },
  'Other Sequence Types': { question: 'Find the next term: 2, 6, 18, 54, ...', steps: ['Check ratio: 6÷2 = 3, 18÷6 = 3, 54÷18 = 3', 'Geometric sequence with ratio = 3', 'Next term = 54 × 3 = 162'], answer: '162' },
  'Angle Properties': { question: 'Two angles on a straight line are x° and (2x + 30)°. Find x.', steps: ['Angles on a straight line sum to 180°', 'x + 2x + 30 = 180', '3x + 30 = 180', '3x = 150, x = 50°'], answer: 'x = 50°' },
  'Simple & Compound Interest': { question: 'Calculate compound interest on $1000 at 5% p.a. for 2 years.', steps: ['A = P(1 + r)ⁿ = 1000(1.05)²', 'A = 1000 × 1.1025 = $1102.50', 'Interest = $1102.50 − $1000 = $102.50'], answer: '$102.50' },
  'Useful Combinatorial Facts': { question: 'How many ways can 3 students sit in a row of 5 chairs?', steps: ['This is permutation: ⁵P₃ = 5!/(5-3)!', '= 5 × 4 × 3 = 60 ways'], answer: '60' },

  // Verbal
  'Synonyms': { question: 'Find the synonym: ARDUOUS (a) simple (b) strenuous (c) pleasant (d) quick', steps: ['ARDUOUS means requiring great effort', 'Test each: simple=opposite, strenuous=great effort ✓', 'pleasant=not related, quick=not related'], answer: '(b) strenuous' },
  'Antonyms': { question: 'Find the antonym: BENEVOLENT (a) kind (b) malevolent (c) generous (d) calm', steps: ['BENEVOLENT means kind, well-meaning', 'Opposite = ill-meaning, hostile', 'MALEVOLENT means wishing harm → opposite ✓'], answer: '(b) malevolent' },
  'Odd One Out': { question: 'Which is the odd one out? Apple, Banana, Carrot, Mango', steps: ['Apple, Banana, Mango = fruits', 'Carrot = vegetable', 'The pattern: three fruits and one vegetable'], answer: 'Carrot (vegetable among fruits)' },
  'Word Classification / Grouping': { question: 'Group: Mercury, Mars, Pluto, Jupiter, Saturn', steps: ['Mercury, Mars, Jupiter, Saturn = planets in our solar system', 'Pluto = dwarf planet (reclassified 2006)', 'Odd one: Pluto does not belong to the "planet" group'], answer: 'Pluto (dwarf planet, not a planet)' },
  'Hidden Words': { question: 'Find the hidden word: "The PEAcock was beautiful."', steps: ['Look for a word hidden within the sentence', 'PEAcock contains PEA', 'Scan letter by letter across word boundaries'], answer: 'PEA (hidden in PEAcock)' },
  'Word Meanings in Context': { question: '"The bank of the river was steep." What does "bank" mean here?', steps: ['Read the surrounding context: "of the river"', '"Bank" has multiple meanings: financial institution, riverbank, to rely on', 'Context "river" → bank = the sloping land beside a river'], answer: 'The edge/slope of a river' },
  'Prefixes, Suffixes & Root Words': { question: 'What does "unbreakable" mean? Break it into parts.', steps: ['un- = not (prefix)', 'break = to separate into pieces (root)', '-able = capable of being (suffix)', 'Together: not capable of being broken'], answer: 'Not able to be broken' },
  'Multiple Meaning Words (Homonyms & Polysemy)': { question: '"She had to bear the heavy load." What does "bear" mean?', steps: ['Bear can mean: animal, to carry, to endure', 'Context: "heavy load" → carrying something', 'Bear = to carry or support'], answer: 'To carry/support' },
  'Homophones & Commonly Confused Words': { question: 'Choose the correct word: "Their/There/They\'re going to the park."', steps: ['Their = belonging to them', 'There = in that place', "They're = they are", '"___ going" needs "they are" → They\'re'], answer: "They're" },
  'Single-Blank Sentence Completion': { question: '"The ___ weather forced the match to be cancelled." (a) fair (b) inclement (c) warm (d) mild', steps: ['The match was cancelled → weather must be bad', 'fair/warm/mild = good weather → wrong', 'inclement = harsh, stormy → matches "cancelled"'], answer: '(b) inclement' },
  'Double-Blank Sentence Completion': { question: '"The ___ speaker ___ the audience with her wit." (a) boring/annoyed (b) eloquent/captivated', steps: ['The sentence has a positive tone ("her wit")', '"boring/annoyed" = negative → mismatch', '"eloquent/captivated" = positive → matches wit'], answer: '(b) eloquent/captivated' },
  'Cloze Passages': { question: '"The cat sat on the ___ and watched the birds in the ___."', steps: ['First blank: where does a cat sit? mat, roof, chair, fence', 'Second blank: where are birds? sky, tree, garden', 'Read back: "The cat sat on the mat and watched the birds in the garden."'], answer: 'mat, garden (or similar contextual fit)' },
  'Comprehension Question Types': { question: 'Identify the question type: "What can you infer about the character from paragraph 3?"', steps: ['Key word: "infer" = read between the lines', 'This is an INFERENCE question, not literal', 'Strategy: find evidence in the text, then make a logical conclusion'], answer: 'Inference question → find evidence, then deduce' },
  'Inference & Critical Reading': { question: '"She slammed the door and stomped upstairs." How does she feel?', steps: ['Evidence: slammed (forceful), stomped (heavy, angry steps)', 'Neither word is gentle → she is upset', 'Inference: she is angry or frustrated'], answer: 'Angry/frustrated (inferred from actions)' },
  'Syllogisms & Deductive Reasoning': { question: 'All dogs are animals. Rex is a dog. What can you conclude?', steps: ['Premise 1: All dogs are animals', 'Premise 2: Rex is a dog', 'Conclusion: Rex must be an animal (valid deduction)'], answer: 'Rex is an animal' },
  'Statement & Conclusion Problems': { question: '"All students passed the test. John is a student." Is "John passed the test" valid?', steps: ['All students passed → every single one', 'John is a student → he belongs to the group', 'Therefore John passed → logically follows'], answer: 'Yes, valid conclusion' },
  'Parts of Speech': { question: 'Identify the adjective: "The tall boy ran quickly."', steps: ['Nouns: boy', 'Verbs: ran', 'Adjectives (describe nouns): tall → describes "boy"', 'Adverbs (describe verbs): quickly → describes "ran"'], answer: '"tall" is the adjective' },
  'Common Grammar Rules': { question: 'Fix the error: "Each of the students have completed their work."', steps: ['"Each" is singular → verb must be singular', '"have" → should be "has"', '"their" → could be "his or her" (formal) or "their" (accepted)'], answer: '"Each of the students has completed their work."' },
  'Rearranging Words & Sentences': { question: 'Rearrange: "garden / the / beautiful / in / flowers / bloom"', steps: ['Find the subject: flowers', 'Find the verb: bloom', 'Add description: beautiful flowers', 'Add location: in the garden', 'Assemble: Beautiful flowers bloom in the garden.'], answer: 'Beautiful flowers bloom in the garden.' },
  'Sentence Correction & Error Identification': { question: 'Find the error: "Me and him went to the store."', steps: ['"Me went" is wrong → should be "I"', '"Him went" is wrong → should be "He"', 'Subject pronouns needed: I, He (not Me, Him)'], answer: '"He and I went to the store."' },
  'Idioms': { question: 'What does "break the ice" mean?', steps: ['Literal meaning: physically breaking ice', 'Figurative meaning: to start a conversation or ease tension', 'Context: usually at social gatherings or first meetings'], answer: 'To initiate conversation / ease social awkwardness' },
  'Proverbs': { question: 'What does "A stitch in time saves nine" mean?', steps: ['Literal: one stitch now prevents needing nine later', 'Figurative: fixing a small problem early prevents bigger problems', 'Application: don\'t procrastinate on important tasks'], answer: 'Dealing with problems early prevents them from getting worse' },
  'Figurative Language': { question: 'Identify the figurative device: "The wind whispered through the trees."', steps: ['Wind can\'t literally whisper — that\'s a human action', 'Giving human qualities to non-human things = personification', 'Other options: simile (like/as), metaphor (is), hyperbole (exaggeration)'], answer: 'Personification' },
  'Spelling Rules': { question: 'Which is correct: "acheive" or "achieve"?', steps: ['Apply the rule: i before e, except after c', '"ach" — no c before the ie/ei', 'So i before e → "achieve" ✓'], answer: '"achieve" (i before e)' },
  'Word Completion & Letter Patterns': { question: 'Complete: B_A_T_F_L', steps: ['Count letters: B_A_T_F_L = 9 positions (with 4 blanks)', 'Try common words: BEAUTIFUL fits! B-E-A-U-T-I-F-U-L', 'Check: B(E)A(U)T(I)F(U)L ✓'], answer: 'BEAUTIFUL' },

  // Reading
  'Reading Comprehension Exam Technique': { question: 'You have 25 minutes for 5 passages with 3 questions each. What\'s the strategy?', steps: ['Total: 15 questions in 25 minutes ≈ 1.5 min per question', 'Skim each passage first (30 sec), then read questions', 'Answer easy questions first, mark hard ones to return to', 'Never leave a multiple choice blank — eliminate and guess'], answer: '~5 min per passage (30s skim + 1.5 min per question)' },
};

let filled = 0;

for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const topic of (cat.topics || [])) {
      const s = topic.solving_strategy;
      if (!s || typeof s !== 'object' || Array.isArray(s)) continue;
      if (s.worked_example) continue;

      const ex = examples[topic.title];
      if (ex) {
        s.worked_example = ex;
        filled++;
      }
    }
  }
}

fs.writeFileSync(PACK_PATH, JSON.stringify(d, null, 2));
console.log('Filled', filled, 'worked examples');

// Verify remaining
let remaining = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      const s = t.solving_strategy;
      if (s && typeof s === 'object' && !Array.isArray(s) && !s.worked_example) {
        console.log('  Still missing:', t.title);
        remaining++;
      }
    }
  }
}
console.log('Remaining without example:', remaining);
