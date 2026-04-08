const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./packs/vic-selective-exam.json', 'utf8'));

const fixes = {
  'Factors, Multiples & Divisibility': {
    question: 'Find the HCF and LCM of 24 and 36.',
    steps: [
      'List factors or use prime factorisation → 24 = 2³ × 3, 36 = 2² × 3²',
      'For HCF: pick common primes with lowest powers → 2² × 3¹ = 12',
      'For LCM: pick all primes with highest powers → 2³ × 3² = 72',
      'Verify: 12 divides 24 ✓ and 36 ✓. 72 ÷ 24 = 3 ✓, 72 ÷ 36 = 2 ✓',
    ],
    answer: 'HCF = 12, LCM = 72',
  },
  'Rates — Speed, Distance & Time': {
    question: 'A car travels 180 km at 60 km/h, then 120 km at 40 km/h. Find the average speed.',
    steps: [
      'Identify given: two legs with different speeds. Asked: average speed',
      'Use D = S × T to find time for each leg',
      'Leg 1: T = 180 ÷ 60 = 3 hours. Leg 2: T = 120 ÷ 40 = 3 hours',
      'Average speed = Total distance ÷ Total time = 300 ÷ 6 = 50 km/h',
      'Check: 50 is between 40 and 60 ✓ (must be between slowest and fastest)',
    ],
    answer: '50 km/h',
  },
  'Square Roots, Cube Roots & Surds': {
    question: 'Simplify √72 + √18.',
    steps: [
      'Apply index laws — find perfect square factors inside each root',
      '√72 = √(36 × 2) = 6√2',
      '√18 = √(9 × 2) = 3√2',
      'Combine like surds: 6√2 + 3√2 = 9√2',
    ],
    answer: '9√2',
  },
  'Inequalities': {
    question: 'Solve: 3x - 5 < 7',
    steps: [
      'Solve like an equation: add 5 to both sides → 3x < 12',
      'Divide both sides by 3 → x < 4',
      'On number line: open circle at 4, shade left',
      'Check with x = 3: 3(3) - 5 = 4 < 7 ✓. Check x = 5: 3(5) - 5 = 10, not < 7 ✓',
    ],
    answer: 'x < 4',
  },
  'Simple & Compound Interest': {
    question: '$2000 invested at 6% compound interest for 3 years. Find the total amount.',
    steps: [
      'Identify: P = $2000, r = 6% = 0.06, n = 3 years',
      'Use compound interest formula: A = P(1 + r)ⁿ',
      'A = 2000(1.06)³ = 2000 × 1.191016 = $2382.03',
      'Interest earned = $2382.03 - $2000 = $382.03',
    ],
    answer: '$2382.03',
  },
  'Useful Combinatorial Facts': {
    question: 'How many 3-digit numbers can be formed from digits 1-5 with no repeats?',
    steps: [
      'Identify: permutation (order matters), no repetition',
      'First digit: 5 choices. Second: 4 remaining. Third: 3 remaining.',
      'Total = 5 × 4 × 3 = 60',
      'Or use formula: ⁵P₃ = 5!/(5-3)! = 120/2 = 60',
    ],
    answer: '60',
  },
  'Statement & Conclusion Problems': {
    question: '"All birds have feathers. A penguin is a bird." Is "A penguin has feathers" a valid conclusion?',
    steps: [
      'Identify premises: (1) All birds have feathers (2) A penguin is a bird',
      'Apply deductive logic: penguin ∈ birds → penguin has feathers',
      'Check: does conclusion follow necessarily? Yes — if ALL birds have feathers and penguin IS a bird, it MUST have feathers',
      'Verify: no hidden assumptions or exceptions in the premises',
    ],
    answer: 'Yes, valid conclusion (follows logically from both premises)',
  },
  'Reading Comprehension Exam Technique': {
    question: '25 minutes, 5 passages, 3 questions each. What is your exam strategy?',
    steps: [
      'Skim all passages first (30 sec each) → 2.5 min total, get overview of topics',
      'Read questions BEFORE re-reading passage → know what to look for',
      'For each passage: re-read carefully, underline key facts → ~3 min per passage',
      'Answer easy questions first, mark uncertain ones to revisit → save time',
      'Never leave blanks — eliminate 2 options and guess from remaining → better odds',
    ],
    answer: '~5 min per passage (skim → read questions → re-read → answer)',
  },
};

let fixed = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      if (fixes[t.title] && t.solving_strategy?.worked_example) {
        t.solving_strategy.worked_example = fixes[t.title];
        fixed++;
      }
    }
  }
}

fs.writeFileSync('./packs/vic-selective-exam.json', JSON.stringify(d, null, 2));
console.log('Fixed', fixed, 'generic worked examples');
