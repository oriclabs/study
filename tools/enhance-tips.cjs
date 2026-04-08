/**
 * Enhance all tips with contextual explanations and worked examples.
 * Replaces generic explanations with specific ones based on tip content and topic.
 *
 * Run: node tools/enhance-tips.cjs
 */

const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');
const d = JSON.parse(fs.readFileSync(PACK_PATH, 'utf8'));

const genericPhrases = [
  'rule without exceptions', 'comes up frequently', 'Keep this in mind',
  'Many students lose', 'order of operations matters', 'save time and prevent',
  'Memorise this relationship', 'Being aware of this pitfall',
  'The order of operations matters', 'doing this step first',
];

function isGeneric(explanation) {
  if (!explanation) return true;
  return genericPhrases.some(p => explanation.includes(p));
}

function generateExplanationAndExample(tipText, topicTitle, subjectId) {
  const t = tipText.toLowerCase();
  const topic = topicTitle.toLowerCase();

  // ============ MATH ============
  if (subjectId === 'math' || subjectId === 'quantitative') {
    // Fractions
    if (t.includes('simplify before multiply') || t.includes('cancel before')) {
      return {
        explanation: 'Cross-cancel common factors between numerators and denominators before multiplying. This avoids large numbers.',
        example: '4/9 × 3/8 → cancel 3 with 9 (÷3) and 4 with 8 (÷4) → 1/3 × 1/2 = 1/6'
      };
    }
    if (t.includes('kfc') || t.includes('keep, flip') || t.includes('keep flip') || (t.includes('flip') && t.includes('fraction'))) {
      return {
        explanation: 'To divide fractions: Keep the first fraction, Flip the second, Change ÷ to ×.',
        example: '3/4 ÷ 2/5 → Keep 3/4, Flip to 5/2, Change to × → 3/4 × 5/2 = 15/8'
      };
    }
    if (t.includes('common denominator') || t.includes('lcd') || t.includes('same denominator')) {
      return {
        explanation: 'You can only add or subtract fractions when they have the same denominator.',
        example: '1/3 + 1/4 → LCD = 12 → 4/12 + 3/12 = 7/12'
      };
    }
    if (t.includes('bodmas') || t.includes('pemdas') || t.includes('order of operation')) {
      return {
        explanation: 'BODMAS order: Brackets first, then Orders (powers), then Division/Multiplication (left to right), then Addition/Subtraction.',
        example: '3 + 4 × 2 = 3 + 8 = 11 (NOT 14). Multiply before adding!'
      };
    }
    if (t.includes('negative') && t.includes('sign') || t.includes('same sign')) {
      return {
        explanation: 'When multiplying or dividing: same signs → positive, different signs → negative.',
        example: '(-3) × (-4) = +12 (same signs), (-3) × 4 = -12 (different signs)'
      };
    }
    if (t.includes('hcf') && t.includes('lcm')) {
      return {
        explanation: 'This shortcut lets you find one if you know the other. HCF × LCM = product of the two numbers.',
        example: 'For 12 and 18: HCF = 6, so LCM = (12 × 18) ÷ 6 = 36'
      };
    }
    if (t.includes('hcf') && !t.includes('lcm')) {
      return {
        explanation: 'HCF uses the LOWEST powers because we want what both numbers share.',
        example: '12 = 2² × 3, 18 = 2 × 3². Common primes: 2¹ × 3¹ = 6'
      };
    }
    if (t.includes('lcm') && !t.includes('hcf')) {
      return {
        explanation: 'LCM uses the HIGHEST powers because we want a number divisible by both.',
        example: '12 = 2² × 3, 18 = 2 × 3². All primes with max powers: 2² × 3² = 36'
      };
    }
    if (t.includes('10%') || t.includes('percentage') && t.includes('quick') || t.includes('move decimal')) {
      return {
        explanation: 'Build up percentages from easy ones: 10% (÷10), 5% (half of 10%), 1% (÷100).',
        example: '35% of 200: 10% = 20, 30% = 60, 5% = 10 → 35% = 70'
      };
    }
    if (t.includes('of') && t.includes('multiply') || t.includes("'of' means")) {
      return {
        explanation: 'In percentage/fraction problems, the word "of" always means multiplication.',
        example: '25% of 80 = 0.25 × 80 = 20. Three-quarters of 60 = 3/4 × 60 = 45'
      };
    }
    if (t.includes('percent') && (t.includes('change') || t.includes('increase') || t.includes('decrease'))) {
      return {
        explanation: 'Percentage change = (difference ÷ original) × 100. Always divide by the ORIGINAL value.',
        example: 'Price rises from $40 to $50: change = 10, % change = (10/40) × 100 = 25% increase'
      };
    }
    if (t.includes('ratio') && t.includes('order')) {
      return {
        explanation: 'The order matters! "boys to girls" means boys first. Swapping gives a different ratio.',
        example: '3 boys and 5 girls → boys:girls = 3:5 (NOT 5:3)'
      };
    }
    if (t.includes('ratio') && t.includes('total part')) {
      return {
        explanation: 'Find the value of one part, then multiply for each share.',
        example: 'Share $120 in ratio 2:3 → total parts = 5, one part = $24 → shares: $48 and $72'
      };
    }
    if (t.includes('index') || t.includes('power') || t.includes('exponent')) {
      return {
        explanation: 'Index laws let you simplify expressions with powers quickly.',
        example: 'x³ × x⁴ = x⁷ (add powers), x⁸ ÷ x³ = x⁵ (subtract powers), (x²)³ = x⁶ (multiply powers)'
      };
    }
    if (t.includes('surd') || t.includes('√') || t.includes('square root')) {
      return {
        explanation: 'Simplify surds by finding the largest perfect square factor inside the root.',
        example: '√72 = √(36 × 2) = 6√2. √50 = √(25 × 2) = 5√2'
      };
    }
    if (t.includes('expand') && t.includes('bracket')) {
      return {
        explanation: 'Multiply each term inside the bracket by the term outside.',
        example: '3(2x + 5) = 6x + 15. For double brackets: (x+2)(x+3) = x² + 3x + 2x + 6 = x² + 5x + 6'
      };
    }
    if (t.includes('factoris') || t.includes('factor')) {
      return {
        explanation: 'Find the highest common factor and take it outside the bracket.',
        example: '6x + 15 = 3(2x + 5). For quadratics: x² + 5x + 6 = (x+2)(x+3)'
      };
    }
    if (t.includes('inverse operation') || t.includes('opposite operation')) {
      return {
        explanation: 'To isolate the variable, do the opposite: + ↔ −, × ↔ ÷, ² ↔ √.',
        example: '3x + 5 = 20 → subtract 5: 3x = 15 → divide by 3: x = 5'
      };
    }
    if (t.includes('substitut') && t.includes('back') || t.includes('check') && t.includes('answer')) {
      return {
        explanation: 'Plug your answer back into the original equation to verify it works.',
        example: 'If x = 5 for 3x + 5 = 20: check 3(5) + 5 = 15 + 5 = 20 ✓'
      };
    }
    if (t.includes('pythag') || t.includes('hypotenuse')) {
      return {
        explanation: 'The hypotenuse is always the longest side, opposite the right angle.',
        example: 'Sides 3 and 4: hypotenuse = √(9+16) = √25 = 5. Know the triples: 3-4-5, 5-12-13'
      };
    }
    if (t.includes('angle') && t.includes('180')) {
      return {
        explanation: 'Angles in a triangle always sum to 180°. Angles on a straight line also sum to 180°.',
        example: 'Triangle with angles 50° and 70°: third angle = 180° - 50° - 70° = 60°'
      };
    }
    if (t.includes('area') && (t.includes('compound') || t.includes('break') || t.includes('split'))) {
      return {
        explanation: 'Split complex shapes into rectangles, triangles, and semicircles, then add or subtract.',
        example: 'L-shape = two rectangles. Find each area and add: A = (4×6) + (3×2) = 24 + 6 = 30 cm²'
      };
    }
    if (t.includes('circumference') || t.includes('πd') || t.includes('2πr')) {
      return {
        explanation: 'C = πd or C = 2πr. For sectors, take the fraction of the full circumference.',
        example: 'Circle with r = 7: C = 2 × π × 7 = 14π ≈ 44 cm'
      };
    }
    if (t.includes('probabilit') && t.includes('between')) {
      return {
        explanation: 'Probability always ranges from 0 (impossible) to 1 (certain). P + P(not) = 1.',
        example: 'P(rain) = 0.3, so P(no rain) = 1 - 0.3 = 0.7'
      };
    }
    if (t.includes('mean') || t.includes('average')) {
      return {
        explanation: 'Mean = total sum ÷ count. To find a missing value, use: missing = mean × count - known sum.',
        example: 'Scores: 8, 6, 9, 7, ? with mean 8 → total needed = 40, sum so far = 30, missing = 10'
      };
    }
    if (t.includes('estimation') || t.includes('estimat') || t.includes('round')) {
      return {
        explanation: 'Round numbers to 1 significant figure for quick estimation, then compare with your exact answer.',
        example: '49 × 21 ≈ 50 × 20 = 1000. Exact: 1029. Close enough — your calculation is likely correct.'
      };
    }
    if (t.includes('unit') && t.includes('convert')) {
      return {
        explanation: 'Always convert to matching units before calculating. Common: 1 km = 1000 m, 1 hr = 60 min.',
        example: '3.5 km in metres = 3.5 × 1000 = 3500 m. 90 minutes in hours = 90 ÷ 60 = 1.5 hours'
      };
    }
    if (t.includes('number line')) {
      return {
        explanation: 'Visualise negative numbers and inequalities by placing values on a mental number line.',
        example: '-3 + 5: start at -3, move 5 right → land on 2. Or: -3 is left of -1, so -3 < -1'
      };
    }
    if (t.includes('elimination') || t.includes('simultaneous')) {
      return {
        explanation: 'Make the coefficient of one variable the same in both equations, then add or subtract to eliminate it.',
        example: '2x + y = 7 and x + y = 4 → subtract: x = 3, then y = 1'
      };
    }
    if (t.includes('gradient') || t.includes('slope') || t.includes('rise')) {
      return {
        explanation: 'Gradient = rise ÷ run = (y₂ - y₁) ÷ (x₂ - x₁). Positive = uphill, negative = downhill.',
        example: 'Points (1, 2) and (3, 8): gradient = (8-2)/(3-1) = 6/2 = 3'
      };
    }
    if (t.includes('interest') && t.includes('compound')) {
      return {
        explanation: 'Compound interest: A = P(1 + r)ⁿ. Interest earns interest each period.',
        example: '$1000 at 5% for 3 years: A = 1000(1.05)³ = 1000 × 1.1576 = $1157.63'
      };
    }
    if (t.includes('benchmark') && t.includes('fraction')) {
      return {
        explanation: 'Know these by heart for instant conversion: 1/4=0.25, 1/3≈0.333, 1/2=0.5, 3/4=0.75.',
        example: 'Is 0.4 bigger than 1/3? 1/3 ≈ 0.333, so 0.4 > 1/3 ✓'
      };
    }
  }

  // ============ VERBAL ============
  if (subjectId === 'verbal') {
    if (t.includes('bridge sentence')) {
      return {
        explanation: 'Create a specific sentence linking the pair: "A [relationship] B". Test each option with the same sentence.',
        example: 'GLOVE : HAND → "A glove is worn on a hand" → SHOE : ? → "A shoe is worn on a foot" → FOOT ✓'
      };
    }
    if (t.includes('elimina')) {
      return {
        explanation: 'Remove options you know are wrong to improve your odds. Even eliminating one option helps.',
        example: '4 options, eliminate 2 wrong ones → 50% chance instead of 25% on remaining two'
      };
    }
    if (t.includes('prefix') || t.includes('root') || t.includes('suffix')) {
      return {
        explanation: 'Break unknown words into parts: prefix (before) + root (core meaning) + suffix (after).',
        example: '"un-break-able" → un (not) + break + able (can be) = cannot be broken'
      };
    }
    if (t.includes('context clue') || t.includes('surrounding')) {
      return {
        explanation: 'The sentences around an unknown word often contain synonyms, antonyms, or definitions.',
        example: '"The garrulous man talked non-stop." → "non-stop" tells you garrulous means talkative'
      };
    }
    if (t.includes('connotation') || t.includes('positive') && t.includes('negative')) {
      return {
        explanation: 'Words can have positive, negative, or neutral connotations even with similar meanings.',
        example: '"Thrifty" (positive) vs "stingy" (negative) — both mean careful with money'
      };
    }
    if (t.includes('order') && t.includes('relationship')) {
      return {
        explanation: 'A:B is not the same as B:A. The direction of the relationship matters.',
        example: 'DOCTOR:HOSPITAL (works at) ≠ HOSPITAL:DOCTOR (employs). Match the exact direction.'
      };
    }
    if (t.includes('sound') && t.includes('similar') || t.includes('false friend') || t.includes('look similar')) {
      return {
        explanation: 'Some words look alike but have different meanings. Check carefully before choosing.',
        example: '"Accept" (receive) vs "except" (excluding). "Affect" (verb) vs "effect" (noun).'
      };
    }
    if (t.includes('all options') || t.includes('before choosing')) {
      return {
        explanation: 'The first plausible answer may not be the best. Read all options to find the closest match.',
        example: 'Question: synonym for "big". Options: large, huge, vast, grand → "large" is closest (same intensity)'
      };
    }
    if (t.includes('grammar') && t.includes('match') || t.includes('singular') || t.includes('tense')) {
      return {
        explanation: 'Your answer must match grammatically: same tense, same number (singular/plural), same part of speech.',
        example: '"She ___ to school daily" → needs present tense verb → "walks" ✓, "walked" ✗ (wrong tense)'
      };
    }
    if (t.includes('plug') && t.includes('back') || t.includes('read aloud')) {
      return {
        explanation: 'Insert your chosen word and read the whole sentence. If it sounds awkward, reconsider.',
        example: '"The ___ dog barked loudly." Test: "The angry dog barked loudly." Sounds natural ✓'
      };
    }
    if (t.includes('categor') || t.includes('group')) {
      return {
        explanation: 'For odd-one-out, find the category that connects the majority. The odd word breaks that pattern.',
        example: 'Apple, Banana, Carrot, Mango → Carrot is odd (vegetable among fruits)'
      };
    }
    if (t.includes('idiom') || t.includes('literal')) {
      return {
        explanation: 'Idioms have figurative meanings different from the literal words.',
        example: '"Break the ice" = start a conversation (NOT actually break ice)'
      };
    }
    if (t.includes('spell') && (t.includes('ie') || t.includes('ei'))) {
      return {
        explanation: 'The "i before e except after c" rule helps with many common words.',
        example: 'believe (ie), receive (ei after c), weird (exception — just memorise it!)'
      };
    }
  }

  // ============ READING ============
  if (subjectId === 'reading') {
    if (t.includes('always in the text') || t.includes('find it') || t.includes('re-read')) {
      return {
        explanation: 'In comprehension, every answer can be found in or supported by the passage. Never rely on outside knowledge.',
        example: 'Q: "What colour was the car?" — scan the text for colour words near "car". Don\'t guess "red".'
      };
    }
    if (t.includes('key word') || t.includes('locate') || t.includes('scan')) {
      return {
        explanation: 'Use important words from the question to scan the passage. Look for synonyms too.',
        example: 'Q asks about "the experiment results" → scan for "results", "findings", "outcome", "showed"'
      };
    }
    if (t.includes('trap') || t.includes('true in general')) {
      return {
        explanation: 'Wrong answers often contain true statements that aren\'t in THIS passage. Only choose what the text says.',
        example: 'Passage about dogs being loyal. Option: "Dogs need daily exercise." True generally, but not stated in text ✗'
      };
    }
    if (t.includes('first and last') || t.includes('topic sentence')) {
      return {
        explanation: 'The first sentence often introduces the paragraph\'s topic. The last sentence often summarises.',
        example: 'First sentence: "Climate change affects wildlife." → This paragraph is about climate + wildlife impacts.'
      };
    }
    if (t.includes('inference') || t.includes('not directly stated')) {
      return {
        explanation: 'Inference = reading between the lines. The answer isn\'t stated but logically follows from what IS stated.',
        example: '"She grabbed her umbrella and coat." → Inference: It was raining or about to rain.'
      };
    }
    if (t.includes('tone') || t.includes('mood')) {
      return {
        explanation: 'Tone = how the author feels. Look at word choice: positive words = positive tone, negative = critical/sad.',
        example: '"The magnificent sunset painted the sky" → admiring tone. "The blinding sun scorched everything" → harsh tone.'
      };
    }
    if (t.includes('evidence') || t.includes('support')) {
      return {
        explanation: 'Strong evidence directly supports the claim with specific facts, quotes, or details from the text.',
        example: 'Claim: "The character is brave." Evidence: "She ran into the burning building" ✓ (specific action)'
      };
    }
    if (t.includes('purpose') || t.includes('why') && t.includes('wrote')) {
      return {
        explanation: 'Ask: Is the author trying to inform (facts), persuade (opinion), entertain (story), or explain (how-to)?',
        example: 'A news article → inform. An advertisement → persuade. A fairy tale → entertain.'
      };
    }
    if (t.includes('skim') || t.includes('first') && t.includes('questions')) {
      return {
        explanation: 'Skim the passage first (30 seconds), read the questions, then re-read carefully to find answers.',
        example: 'Skim: "This is about pollution." Read Q1: "What causes X?" Re-read paragraph 2 where causes are discussed.'
      };
    }
    if (t.includes('underline')) {
      return {
        explanation: 'Underline key facts, names, dates, and opinions as you read. This saves time when answering.',
        example: 'Passage: "In 1969, Neil Armstrong became the first person on the moon." → Underline the date and name.'
      };
    }
  }

  // ============ WRITING ============
  if (subjectId === 'writing') {
    if (t.includes('plan') && (t.includes('5 minute') || t.includes('before'))) {
      return {
        explanation: '5 minutes planning saves 10 minutes rewriting. Jot beginning, middle, end as 3-4 bullet points.',
        example: 'Plan: (1) Lost in forest (2) Found a cabin (3) Helped by stranger (4) Made it home — learned courage'
      };
    }
    if (t.includes('show') && t.includes('tell')) {
      return {
        explanation: 'Instead of naming the emotion, describe what the character sees, hears, feels physically.',
        example: 'Don\'t write: "She was scared." Write: "Her hands trembled. Her breath came in short gasps."'
      };
    }
    if (t.includes('short sentence') || t.includes('sentence length') || t.includes('vary')) {
      return {
        explanation: 'Short sentences create tension and impact. Long sentences slow the pace. Mix both for rhythm.',
        example: '"The door creaked open. She held her breath. The room beyond was vast, dimly lit, with shadows pooling in every corner."'
      };
    }
    if (t.includes('first sentence') || t.includes('hook') || t.includes('opening')) {
      return {
        explanation: 'Start with action, dialogue, a question, or a surprising fact. Avoid "My name is" or "One day".',
        example: '"The letter arrived on a Tuesday — three years after she\'d given up waiting." (Creates mystery instantly)'
      };
    }
    if (t.includes('ending') || t.includes('conclusion') || t.includes('resolution')) {
      return {
        explanation: 'End with a reflection, surprise, or circle back to the opening. Avoid "it was all a dream".',
        example: '"She closed the door softly. The forest would always be there. But she no longer needed it to feel brave."'
      };
    }
    if (t.includes('dialogue') || t.includes('speech')) {
      return {
        explanation: 'Use dialogue to reveal character and advance the plot. Keep it short and natural.',
        example: '"We should go back," whispered Tom. "No," she said firmly. Two lines reveal conflict and character.'
      };
    }
    if (t.includes('proofread') || t.includes('check') || t.includes('spelling')) {
      return {
        explanation: 'Save 2 minutes at the end. Read backwards sentence-by-sentence to catch errors your brain skips.',
        example: 'Common fixes: their/there/they\'re, your/you\'re, comma splices, missing full stops.'
      };
    }
    if (t.includes('make up') || t.includes('creativity') || t.includes('real experience')) {
      return {
        explanation: 'The exam tests writing skill, not honesty. Invented stories often work better because you control the plot.',
        example: 'Prompt: "A time you were brave" — invent climbing a cliff, rescuing someone. More dramatic = better writing.'
      };
    }
  }

  // ============ FALLBACK — generate from tip text itself ============
  // Use the tip content to create a reasonable explanation
  const explanation = generateFallbackExplanation(tipText);
  const example = generateFallbackExample(tipText, topicTitle, subjectId);
  return { explanation, example };
}

function generateFallbackExplanation(tipText) {
  const t = tipText.toLowerCase();
  if (t.includes('≠') || t.includes('not the same') || t.includes('don\'t confuse'))
    return 'This is a common confusion that catches many students. Understanding the difference is key.';
  if (t.includes('always') || t.includes('never'))
    return 'This is a reliable rule to follow — it applies consistently in exam problems.';
  if (t.includes('check') || t.includes('verify'))
    return 'A quick verification step catches careless errors and can save marks.';
  if (t.includes('first') || t.includes('before') || t.includes('start'))
    return 'Getting this step right early prevents cascading errors through the rest of the solution.';
  if (t.includes('trap') || t.includes('mistake') || t.includes('careful') || t.includes('watch'))
    return 'This is a frequently tested trap in exams. Being aware of it gives you an advantage.';
  if (t.includes('quick') || t.includes('shortcut') || t.includes('fast') || t.includes('mental'))
    return 'This shortcut saves valuable time in timed exams while maintaining accuracy.';
  return 'Applying this consistently improves both speed and accuracy in exam problems.';
}

function generateFallbackExample(tipText, topicTitle, subjectId) {
  // Try to extract a concrete example from the tip text itself
  // Many tips already contain examples after a colon or dash
  const colonMatch = tipText.match(/(?:e\.g\.|for example|like|such as)[,:]\s*(.+)/i);
  if (colonMatch) return colonMatch[1].trim();

  const dashExample = tipText.match(/—\s*(.+)/);
  if (dashExample && dashExample[1].length > 10) return dashExample[1].trim();

  // If tip contains numbers or math, it's self-explanatory
  if (/\d+\s*[×÷+\-=]\s*\d+/.test(tipText)) return undefined;

  return undefined;
}

// ============ MAIN ============

let enhanced = 0;
let skipped = 0;

for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const topic of (cat.topics || [])) {
      if (!topic.tips_and_tricks || !Array.isArray(topic.tips_and_tricks)) continue;

      for (let i = 0; i < topic.tips_and_tricks.length; i++) {
        const tip = topic.tips_and_tricks[i];
        if (typeof tip !== 'object') continue;

        // Skip if already has a good example (kinematics tips)
        if (tip.example && !isGeneric(tip.explanation)) {
          skipped++;
          continue;
        }

        // Only enhance if explanation is generic
        if (isGeneric(tip.explanation)) {
          const result = generateExplanationAndExample(tip.tip, topic.title || '', subj.id);
          tip.explanation = result.explanation;
          if (result.example) tip.example = result.example;
          enhanced++;
        }
      }
    }
  }
}

fs.writeFileSync(PACK_PATH, JSON.stringify(d, null, 2));
console.log('Enhanced', enhanced, 'tips with contextual explanations');
console.log('Skipped', skipped, 'already-good tips');

// Verify
let remaining = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const topic of (cat.topics || [])) {
      for (const tip of (topic.tips_and_tricks || [])) {
        if (typeof tip === 'object' && isGeneric(tip.explanation)) remaining++;
      }
    }
  }
}
console.log('Remaining generic:', remaining);
