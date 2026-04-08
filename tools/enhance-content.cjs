/**
 * Enhance all topics with:
 * 1. solving_strategy — if missing
 * 2. tips_and_tricks — enhanced format with tip/explanation/example
 * 3. tips_and_tricks — generated if completely missing
 *
 * Run: node tools/enhance-content.js
 */

const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');
const d = JSON.parse(fs.readFileSync(PACK_PATH, 'utf8'));

// ============ STRATEGY GENERATORS BY SUBJECT ============

function generateStrategy(subjectId, topic) {
  const title = topic.title || '';
  const desc = topic.description || topic.concept_explanation || '';
  const hasExamples = topic.examples && topic.examples.length > 0;

  switch (subjectId) {
    case 'math': return generateMathStrategy(title, desc, topic);
    case 'verbal': return generateVerbalStrategy(title, desc, topic);
    case 'quantitative': return generateQuantStrategy(title, desc, topic);
    case 'reading': return generateReadingStrategy(title, desc, topic);
    case 'writing': return generateWritingStrategy(title, desc, topic);
    default: return null;
  }
}

function generateMathStrategy(title, desc, topic) {
  const t = title.toLowerCase();

  if (t.includes('factor') || t.includes('hcf') || t.includes('lcm')) return [
    "List factors or use prime factorisation for both numbers",
    "For HCF: pick common primes with lowest powers and multiply",
    "For LCM: pick all primes with highest powers and multiply",
    "Verify: HCF must divide both numbers; LCM must be divisible by both"
  ];
  if (t.includes('fraction')) return [
    "Find a common denominator (LCD) for addition/subtraction",
    "Multiply numerators and denominators separately for multiplication",
    "Flip the second fraction and multiply for division (KFC: Keep, Flip, Change)",
    "Always simplify the final answer"
  ];
  if (t.includes('decimal')) return [
    "Line up decimal points for addition/subtraction",
    "Count total decimal places for multiplication",
    "Move decimal points to make the divisor a whole number for division",
    "Convert to fractions if decimals get complex"
  ];
  if (t.includes('percentage') || t.includes('percent')) return [
    "Convert percentage to decimal (÷ 100) or fraction",
    "For 'percentage of': multiply — e.g. 25% of 80 = 0.25 × 80",
    "For 'what percentage': divide part by whole × 100",
    "For percentage change: (change ÷ original) × 100"
  ];
  if (t.includes('ratio')) return [
    "Write the ratio in the order mentioned in the question",
    "Simplify by dividing all parts by the HCF",
    "For sharing in ratio: find total parts, then divide total by parts",
    "Check: the parts must add up to the whole"
  ];
  if (t.includes('algebra') || t.includes('equation') || t.includes('linear')) return [
    "Identify what you need to find (the unknown)",
    "Collect like terms on each side",
    "Use inverse operations to isolate the variable",
    "Check your answer by substituting back into the original equation"
  ];
  if (t.includes('quadratic')) return [
    "Write in standard form: ax² + bx + c = 0",
    "Try factoring first (fastest if it works)",
    "Use the quadratic formula if factoring doesn't work",
    "Check discriminant (b²-4ac) to know how many solutions exist"
  ];
  if (t.includes('angle') || t.includes('parallel')) return [
    "Mark all known angles on the diagram",
    "Identify angle relationships (vertically opposite, co-interior, alternate, corresponding)",
    "Set up equations using angle rules (angles on a line = 180°, angles in a triangle = 180°)",
    "Work step by step — find one missing angle at a time"
  ];
  if (t.includes('triangle')) return [
    "Identify the triangle type (equilateral, isosceles, scalene, right-angled)",
    "Use appropriate properties (equal sides → equal angles)",
    "Apply angle sum = 180° to find missing angles",
    "For right-angled triangles, consider Pythagoras' theorem"
  ];
  if (t.includes('area') || t.includes('perimeter')) return [
    "Identify the shape and recall its formula",
    "For compound shapes: break into simple shapes, find each area, then add",
    "For shaded regions: total area minus unshaded area",
    "Check units are consistent before calculating"
  ];
  if (t.includes('volume') || t.includes('surface')) return [
    "Identify the 3D shape (prism, cylinder, sphere, cone, pyramid)",
    "Volume of prism = base area × height",
    "Surface area = sum of all face areas",
    "Draw a net to help visualise faces for surface area"
  ];
  if (t.includes('circle')) return [
    "Identify what's given (radius, diameter, circumference, or area)",
    "Remember: d = 2r, C = πd = 2πr, A = πr²",
    "For sectors: fraction of the full circle × formula",
    "Leave answer in terms of π unless told to use 3.14"
  ];
  if (t.includes('coordinate') || t.includes('graph')) return [
    "Plot or identify the key points",
    "For midpoint: average the x-coordinates and y-coordinates",
    "For distance: use Pythagoras or the distance formula",
    "For gradient: rise ÷ run = (y₂-y₁)/(x₂-x₁)"
  ];
  if (t.includes('probability')) return [
    "Count favourable outcomes and total outcomes",
    "P(event) = favourable ÷ total",
    "For 'and' (both): multiply probabilities (if independent)",
    "For 'or' (either): add probabilities (if mutually exclusive)"
  ];
  if (t.includes('statistic') || t.includes('data') || t.includes('mean') || t.includes('average')) return [
    "Mean = sum of values ÷ number of values",
    "Median = middle value when sorted (average of two middles if even count)",
    "Mode = most frequent value",
    "Range = highest − lowest"
  ];
  if (t.includes('integer') || t.includes('negative') || t.includes('operation')) return [
    "Follow BODMAS/PEMDAS order strictly",
    "Work one operation at a time, rewriting after each step",
    "For negative numbers: same signs → positive, different signs → negative",
    "Use brackets to keep track of signs"
  ];
  if (t.includes('index') || t.includes('power') || t.includes('exponent') || t.includes('surd')) return [
    "Apply index laws: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ",
    "Remember: a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/n) = ⁿ√a",
    "Simplify surds by finding perfect square factors",
    "Rationalise denominators: multiply top and bottom by the surd"
  ];
  if (t.includes('sequence') || t.includes('pattern')) return [
    "Find the difference between consecutive terms",
    "If constant difference → arithmetic (nth term = a + (n-1)d)",
    "If constant ratio → geometric (nth term = arⁿ⁻¹)",
    "Check by substituting n = 1, 2, 3 into your formula"
  ];
  if (t.includes('simultaneous')) return [
    "Label the equations (1) and (2)",
    "Choose elimination or substitution based on coefficients",
    "Elimination: make coefficients equal, then add/subtract",
    "Substitution: express one variable in terms of the other, then substitute"
  ];
  if (t.includes('inequalit')) return [
    "Solve like an equation but FLIP the sign when multiplying/dividing by negative",
    "Represent the solution on a number line",
    "Open circle = not included (<, >), closed circle = included (≤, ≥)",
    "Check your answer by testing a value in the solution range"
  ];
  if (t.includes('pythag')) return [
    "Identify the hypotenuse (longest side, opposite right angle)",
    "If finding hypotenuse: c² = a² + b²",
    "If finding a shorter side: a² = c² − b²",
    "Check with Pythagorean triples: 3-4-5, 5-12-13, 8-15-17"
  ];
  if (t.includes('proportion')) return [
    "Identify if direct or inverse proportion",
    "Direct: as one increases, the other increases → y = kx",
    "Inverse: as one increases, the other decreases → y = k/x",
    "Find k using the given values, then solve for the unknown"
  ];
  if (t.includes('transform') || t.includes('symmetry') || t.includes('reflect') || t.includes('rotation')) return [
    "Identify the transformation type (reflection, rotation, translation, enlargement)",
    "For reflection: each point moves equal distance on the other side of the mirror line",
    "For rotation: identify centre, angle, and direction",
    "For enlargement: multiply distances from centre by scale factor"
  ];
  if (t.includes('mensuration') || t.includes('unit')) return [
    "Convert all measurements to the same units first",
    "For area conversions: square the linear conversion factor (1 m² = 10000 cm²)",
    "For volume conversions: cube the factor (1 m³ = 1000000 cm³)",
    "Draw diagrams and label all dimensions"
  ];
  // Generic math fallback
  return [
    "Read the question carefully — identify what is given and what is asked",
    "Write down the relevant formula or rule",
    "Substitute known values and solve step by step",
    "Check your answer by substituting back or estimating"
  ];
}

function generateVerbalStrategy(title, desc, topic) {
  const t = title.toLowerCase();
  if (t.includes('analog')) return [
    "Form a precise 'bridge sentence' linking the first pair",
    "Apply the exact same relationship pattern to the second pair",
    "Eliminate options that fit a vague relationship but not the precise one",
    "If stuck, try reversing the order or making the bridge more specific"
  ];
  if (t.includes('synonym')) return [
    "Read the target word and think of its meaning before looking at options",
    "Use word parts (prefix, root, suffix) to decode unfamiliar words",
    "Eliminate obvious wrong answers first",
    "Consider the word's connotation (positive/negative) to narrow down"
  ];
  if (t.includes('antonym')) return [
    "Define the target word first, then think of its opposite",
    "Watch for degree traps — 'warm' opposite is 'cool', not 'freezing'",
    "Use prefixes to help: un-, in-, dis-, mis- often create antonyms",
    "Check: your chosen word should be as far from the original as the original is from it"
  ];
  if (t.includes('odd') || t.includes('out')) return [
    "Find what ALL the words have in common",
    "The odd one out breaks the pattern that connects the other three/four",
    "Consider multiple possible groupings — pick the strongest one",
    "Common categories: parts of speech, size, function, category, origin"
  ];
  if (t.includes('spelling') || t.includes('spell')) return [
    "Look for common misspelling patterns: ie/ei, double letters, silent letters",
    "Sound out the word syllable by syllable",
    "Apply spelling rules: i before e except after c, drop e before -ing",
    "If unsure, write both versions and pick the one that looks right"
  ];
  if (t.includes('sentence') || t.includes('complet')) return [
    "Read the whole sentence including the blank to understand context",
    "Look for signal words: 'but', 'however' (contrast), 'and', 'also' (addition)",
    "Grammar must match: singular/plural, tense, part of speech",
    "Plug your answer back in and read aloud — does it sound natural?"
  ];
  if (t.includes('vocabulary') || t.includes('word')) return [
    "Break unknown words into parts: prefix + root + suffix",
    "Use context clues from surrounding text",
    "Consider words with similar roots you already know",
    "Learn common Latin and Greek roots for exam advantage"
  ];
  // Generic verbal fallback
  return [
    "Read all options before choosing",
    "Eliminate obviously wrong answers to improve your odds",
    "Use context and word parts to decode unfamiliar words",
    "If stuck between two options, re-read with each inserted to test fit"
  ];
}

function generateQuantStrategy(title, desc, topic) {
  const t = title.toLowerCase();
  if (t.includes('arithmetic') || t.includes('integer')) return [
    "Follow BODMAS order: Brackets, Orders, Division/Multiplication, Addition/Subtraction",
    "Work one operation at a time, rewriting the expression after each step",
    "For negative numbers: use a number line mentally",
    "Check by estimation before doing exact calculation"
  ];
  if (t.includes('fraction') || t.includes('decimal') || t.includes('percent')) return [
    "Identify which representation is easiest for the problem",
    "Convert between forms as needed: fraction ↔ decimal ↔ percentage",
    "For comparison: convert all to the same form (usually decimals)",
    "Use benchmark values: 1/4=25%, 1/3≈33%, 1/2=50%, 3/4=75%"
  ];
  if (t.includes('ratio') || t.includes('proportion')) return [
    "Write the ratio in the order stated in the question",
    "Simplify by dividing by the HCF",
    "For sharing: find total parts → value of one part → value of each share",
    "For proportion: set up equivalent ratios and cross-multiply"
  ];
  if (t.includes('pattern') || t.includes('sequence')) return [
    "Write out the first few terms and look for a pattern",
    "Calculate differences between consecutive terms",
    "If differences are constant → arithmetic sequence",
    "If differences grow → try second differences or multiplication patterns"
  ];
  if (t.includes('spatial') || t.includes('visual') || t.includes('rotation') || t.includes('reflect')) return [
    "Mentally rotate or trace the shape step by step",
    "Use elimination — rule out impossible options first",
    "For rotations: track one distinctive feature (corner, dot, mark)",
    "For reflections: every point flips equal distance across the mirror line"
  ];
  if (t.includes('paper') || t.includes('fold')) return [
    "Trace the fold line and imagine flipping one half onto the other",
    "Holes punched go through ALL layers — count the layers at each point",
    "Unfold step by step in reverse order",
    "Symmetry: each fold creates a mirror line"
  ];
  if (t.includes('cube') || t.includes('3d') || t.includes('dice') || t.includes('net')) return [
    "Identify opposite faces — they never share an edge",
    "Use the cross-shaped net as a reference for standard dice",
    "Track one face through rotations to find orientation",
    "For nets: fold mentally and check which edges meet"
  ];
  if (t.includes('algebra') || t.includes('equation') || t.includes('unknown')) return [
    "Translate words into algebra: 'more than' = +, 'less than' = −, 'times' = ×",
    "Set up the equation with the unknown as x",
    "Solve using inverse operations",
    "Check by substituting your answer back into the original words"
  ];
  if (t.includes('geometry') || t.includes('area') || t.includes('angle') || t.includes('perim')) return [
    "Draw or annotate the diagram with all known values",
    "Identify the shape type and recall its formula",
    "For compound shapes: break into simple shapes",
    "Check units and whether the answer is reasonable"
  ];
  if (t.includes('data') || t.includes('table') || t.includes('chart') || t.includes('graph') || t.includes('statistic')) return [
    "Read the title, axis labels, and legend first",
    "Identify exactly what the question asks (value, trend, comparison)",
    "For calculations: extract the exact numbers from the chart",
    "Watch for scale tricks — axes that don't start at zero"
  ];
  if (t.includes('probability')) return [
    "List all possible outcomes systematically",
    "Count favourable outcomes carefully",
    "P(event) = favourable ÷ total possible",
    "Check: all probabilities must be between 0 and 1"
  ];
  if (t.includes('logic') || t.includes('venn') || t.includes('matrix') || t.includes('deduct')) return [
    "Organise information in a table, grid, or Venn diagram",
    "Start with the most restrictive clue",
    "Use elimination: cross out impossibilities",
    "Check that every clue is satisfied by your answer"
  ];
  if (t.includes('time') || t.includes('money') || t.includes('finance')) return [
    "Convert all time to the same unit (usually hours or minutes)",
    "For money problems: track carefully using a table",
    "For interest: Simple = P×r×t, Compound = P(1+r)ᵗ",
    "Check: does the final amount make sense?"
  ];
  if (t.includes('speed') || t.includes('rate') || t.includes('work')) return [
    "Identify the rate (per hour, per minute, per item)",
    "Use the formula: Work = Rate × Time",
    "For combined work: add the rates, not the times",
    "Convert all units to match before calculating"
  ];
  if (t.includes('mental') || t.includes('strateg') || t.includes('exam')) return [
    "Read the question carefully — underline key information",
    "Estimate first to check your calculation is reasonable",
    "For multiple choice: work backwards from the options if stuck",
    "Skip hard questions and come back — don't waste time"
  ];
  // Generic fallback
  return [
    "Read the question twice — underline what's given and what's asked",
    "Choose the most efficient method (mental, written, or estimation)",
    "Show your working step by step",
    "Check your answer against the original question"
  ];
}

function generateReadingStrategy(title, desc, topic) {
  const t = title.toLowerCase();
  if (t.includes('main idea') || t.includes('central')) return [
    "Read the whole passage first for overall understanding",
    "Look at the first and last sentences of each paragraph",
    "Ask: 'What is the author mostly talking about?'",
    "Eliminate options that are too specific (detail) or too broad"
  ];
  if (t.includes('inference') || t.includes('imply')) return [
    "Find the evidence in the text that supports each option",
    "The answer is NOT directly stated — it requires a logical step",
    "Ask: 'What MUST be true based on what the text says?'",
    "Avoid options that go too far beyond what the text supports"
  ];
  if (t.includes('vocabulary') || t.includes('context')) return [
    "Read the sentence containing the word and the sentences around it",
    "Replace the word with each option — which makes the most sense?",
    "Look for context clues: synonyms, antonyms, examples nearby",
    "Don't pick the most common meaning — the question tests unusual usage"
  ];
  if (t.includes('purpose') || t.includes('author')) return [
    "Consider WHY the author wrote this — to inform, persuade, entertain, or explain?",
    "Look at the tone (formal, casual, urgent, humorous) for clues",
    "Consider the audience — who is this written for?",
    "The purpose often connects to the overall structure and tone"
  ];
  // Generic reading fallback
  return [
    "Skim the passage first, then read the questions, then re-read carefully",
    "Underline key information in the passage as you read",
    "Always find evidence in the text to support your answer",
    "Eliminate options that contradict or aren't supported by the passage"
  ];
}

function generateWritingStrategy(title, desc, topic) {
  const t = title.toLowerCase();
  if (t.includes('plan')) return [
    "Spend exactly 5 minutes planning before writing",
    "Decide: beginning (hook), middle (events/conflict), end (resolution)",
    "Write 3-4 bullet points — not full sentences",
    "Make sure your plan has a clear problem/conflict"
  ];
  if (t.includes('open') || t.includes('hook')) return [
    "Start with action, dialogue, a question, or a surprising statement",
    "Avoid 'My name is...' or 'One day...' — these are weak openings",
    "The first sentence should create curiosity",
    "Set the scene quickly: who, where, what's happening"
  ];
  if (t.includes('end') || t.includes('clos') || t.includes('conclusion')) return [
    "Resolve the main conflict or problem",
    "End with a reflection, lesson learned, or emotional moment",
    "Avoid 'and then I woke up' — this feels like a cheat",
    "A great ending connects back to the opening"
  ];
  // Generic writing fallback
  return [
    "Plan before you write — 5 minutes of planning saves 10 minutes of rewriting",
    "Show, don't tell: use sensory details (sight, sound, smell, touch, taste)",
    "Vary sentence length — short for impact, long for description",
    "Proofread in the last 2 minutes: fix spelling, punctuation, and unclear sentences"
  ];
}

// ============ TIP ENHANCER ============

function enhanceTip(tipText, subjectId, topicTitle) {
  // Generate a contextual explanation and example for a plain string tip
  const tip = tipText;
  const t = topicTitle.toLowerCase();

  // Try to create a meaningful explanation
  let explanation = '';
  let example = '';

  // Pattern: "X ≠ Y" or "not the same" → it's a common mistake warning
  if (tipText.includes('≠') || tipText.includes('not the same') || tipText.includes('NOT')) {
    explanation = 'This is a common mistake that costs marks in exams. Make sure you understand the difference.';
  }
  // Pattern: contains a formula or math symbols
  else if (/[=×÷√²³]/.test(tipText) || /\d+\/\d+/.test(tipText)) {
    explanation = 'Memorise this relationship — it comes up frequently in exam questions.';
  }
  // Pattern: "always" or "never"
  else if (/\b(always|never)\b/i.test(tipText)) {
    explanation = 'This is a rule without exceptions in this context — follow it every time.';
  }
  // Pattern: "watch" or "careful" or "trap"
  else if (/\b(watch|careful|trap|common|mistake|avoid)\b/i.test(tipText)) {
    explanation = 'Many students lose marks here. Being aware of this pitfall gives you an advantage.';
  }
  // Pattern: contains "first" or ordering
  else if (/\b(first|before|start)\b/i.test(tipText)) {
    explanation = 'The order of operations matters — doing this step first prevents errors later.';
  }
  // Default
  else {
    explanation = 'Keep this in mind when working through problems — it can save time and prevent errors.';
  }

  return {
    tip: tip,
    explanation: explanation
  };
}

// ============ MAIN PROCESSING ============

let statsStratAdded = 0;
let statsTipsEnhanced = 0;
let statsTipsGenerated = 0;

for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const topic of (cat.topics || [])) {
      // Skip kinematics — already enhanced
      if (topic.id === 'CAT04-T01') continue;

      // 1. Add strategies if missing
      if (!topic.solving_strategy) {
        const strategy = generateStrategy(subj.id, topic);
        if (strategy) {
          topic.solving_strategy = strategy;
          statsStratAdded++;
        }
      }

      // 2. Generate tips if completely missing
      if (!topic.tips_and_tricks || topic.tips_and_tricks.length === 0) {
        // Generate basic tips based on subject and title
        const t = topic.title?.toLowerCase() || '';
        let tips = [];
        switch (subj.id) {
          case 'math':
            tips = [
              { tip: 'Read the question carefully and identify what formula or rule applies', explanation: 'Many errors come from misreading the question, not from wrong calculations.' },
              { tip: 'Show all working — partial marks are awarded for correct steps', explanation: 'Even if your final answer is wrong, clear working can earn you marks.' },
              { tip: 'Check your answer by substituting back or estimating', explanation: 'A quick check catches careless errors that could cost marks.' }
            ];
            break;
          case 'verbal':
            tips = [
              { tip: 'Read all options before choosing your answer', explanation: 'The first plausible answer may not be the best one — always consider all choices.' },
              { tip: 'Use elimination to narrow down options', explanation: 'Removing obviously wrong answers improves your chances, even if you have to guess.' },
              { tip: 'Look for context clues in the surrounding words', explanation: 'The words around a blank or target word often hint at the answer.' }
            ];
            break;
          default:
            tips = [
              { tip: 'Read the question twice before answering', explanation: 'Understanding exactly what is asked prevents wasted time on wrong approaches.' },
              { tip: 'Use estimation to check your answer is reasonable', explanation: 'A quick sanity check catches obvious errors.' }
            ];
        }
        topic.tips_and_tricks = tips;
        statsTipsGenerated++;
      }
      // 3. Enhance plain string tips to object format
      else if (typeof topic.tips_and_tricks[0] === 'string') {
        topic.tips_and_tricks = topic.tips_and_tricks.map(tip =>
          enhanceTip(tip, subj.id, topic.title || '')
        );
        statsTipsEnhanced++;
      }
    }
  }
}

// Save
fs.writeFileSync(PACK_PATH, JSON.stringify(d, null, 2));

console.log('Done!');
console.log('Strategies added:', statsStratAdded);
console.log('Tips enhanced (plain → object):', statsTipsEnhanced);
console.log('Tips generated (none → new):', statsTipsGenerated);
