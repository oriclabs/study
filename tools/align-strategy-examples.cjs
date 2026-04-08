/**
 * Regenerate strategy worked examples so each example
 * traces through the strategy steps in order.
 *
 * The worked example's steps should mirror the strategy steps,
 * applying each one to a concrete problem.
 *
 * Run: node tools/align-strategy-examples.cjs
 */

const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');
const d = JSON.parse(fs.readFileSync(PACK_PATH, 'utf8'));

/**
 * Given strategy steps and a topic title, generate a worked example
 * that demonstrates each step with a concrete problem.
 */
function generateAlignedExample(strategySteps, topicTitle, subjectId, existingExamples) {
  const title = topicTitle.toLowerCase();

  // Try to find an existing example that has solution_steps
  // and pick the simplest one to rebuild around the strategy
  let baseExample = null;
  if (existingExamples && existingExamples.length > 0) {
    // Prefer difficulty 1, then 2
    for (const diff of [1, 2, 3]) {
      baseExample = existingExamples.find(e => e.difficulty === diff && e.solution_steps && e.solution_steps.length > 0);
      if (baseExample) break;
    }
    if (!baseExample) baseExample = existingExamples[0];
  }

  // Build a worked example that follows strategy steps
  const question = baseExample?.question || generateQuestion(topicTitle, subjectId);
  const answer = baseExample?.answer || '';

  // Map each strategy step to a concrete action on the example
  const exampleSteps = strategySteps.map((stratStep, i) => {
    const s = stratStep.toLowerCase();

    // If we have existing solution steps, try to align
    if (baseExample?.solution_steps && baseExample.solution_steps[i]) {
      return `${stratStep} → ${baseExample.solution_steps[i]}`;
    }

    // Otherwise generate a generic application
    return applyStrategyStep(stratStep, question, answer, i);
  });

  // Add final answer step if not covered
  if (answer && !exampleSteps.some(s => s.includes(answer))) {
    exampleSteps.push(`Answer: ${answer}`);
  }

  return { question, steps: exampleSteps, answer };
}

function applyStrategyStep(stratStep, question, answer, index) {
  const s = stratStep.toLowerCase();

  // Common patterns
  if (s.includes('read') && s.includes('question') || s.includes('identify what')) {
    return `${stratStep} → Given: "${shortenQ(question)}"`;
  }
  if (s.includes('formula') || s.includes('write down')) {
    return `${stratStep} → Apply to this problem`;
  }
  if (s.includes('substitute') || s.includes('plug')) {
    return `${stratStep} → Plug in the values from the question`;
  }
  if (s.includes('check') || s.includes('verify')) {
    if (answer) return `${stratStep} → Verify: ${answer} ✓`;
    return `${stratStep} → Check the answer is reasonable`;
  }
  if (s.includes('eliminate')) {
    return `${stratStep} → Remove obviously wrong options`;
  }
  if (s.includes('simplif')) {
    return `${stratStep} → Simplify the expression`;
  }

  return stratStep;
}

function shortenQ(q) {
  return q.length > 50 ? q.substring(0, 47) + '...' : q;
}

function generateQuestion(title, subjectId) {
  // Fallback generic questions per subject
  const t = title.toLowerCase();
  if (subjectId === 'math' || subjectId === 'quantitative') {
    if (t.includes('fraction')) return 'Calculate: 2/3 + 1/4';
    if (t.includes('percent')) return 'Find 30% of 250';
    if (t.includes('ratio')) return 'Share $120 in the ratio 3:5';
    if (t.includes('area')) return 'Find the area of a rectangle 8 cm by 5 cm';
    if (t.includes('angle')) return 'Find the missing angle in a triangle with angles 55° and 70°';
    if (t.includes('algebra') || t.includes('equation')) return 'Solve: 3x + 7 = 22';
    if (t.includes('sequence')) return 'Find the next term: 3, 7, 11, 15, ...';
    if (t.includes('probability')) return 'A bag has 3 red and 5 blue balls. P(red)?';
    return 'Solve the following problem';
  }
  if (subjectId === 'verbal') return 'Choose the best answer from the options given';
  if (subjectId === 'reading') return 'Read the passage and answer the question';
  if (subjectId === 'writing') return 'Write a response to the following prompt';
  return 'Solve the following';
}

let updated = 0;

for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const topic of (cat.topics || [])) {
      const s = topic.solving_strategy;
      if (!s || typeof s !== 'object' || Array.isArray(s)) continue;
      if (!s.steps || !Array.isArray(s.steps)) continue;

      const aligned = generateAlignedExample(
        s.steps,
        topic.title || '',
        subj.id,
        topic.examples || [],
      );

      s.worked_example = aligned;
      updated++;
    }
  }
}

fs.writeFileSync(PACK_PATH, JSON.stringify(d, null, 2));
console.log('Updated', updated, 'worked examples to align with strategy steps');
