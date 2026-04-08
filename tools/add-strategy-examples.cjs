/**
 * Convert solving_strategy from plain string arrays to structured format
 * with worked examples. Uses the topic's existing examples to create
 * a matching worked example for the strategy.
 *
 * Run: node tools/add-strategy-examples.cjs
 */

const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');
const d = JSON.parse(fs.readFileSync(PACK_PATH, 'utf8'));

let converted = 0;

for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const topic of (cat.topics || [])) {
      const strategy = topic.solving_strategy;
      if (!strategy) continue;

      // Skip if already converted to object format
      if (!Array.isArray(strategy)) continue;
      if (typeof strategy[0] !== 'string') continue;

      // Find the simplest example (difficulty 1 preferred, then 2)
      const examples = topic.examples || [];
      let bestExample = null;
      for (const diff of [1, 2, 3]) {
        bestExample = examples.find(e => e.difficulty === diff && e.solution_steps && e.solution_steps.length > 0);
        if (bestExample) break;
      }
      // Fallback to first example with steps
      if (!bestExample) {
        bestExample = examples.find(e => e.solution_steps && e.solution_steps.length > 0);
      }

      // Build the new object format
      const newStrategy = {
        steps: strategy,
      };

      if (bestExample) {
        newStrategy.worked_example = {
          question: bestExample.question || 'Example',
          steps: bestExample.solution_steps || [],
          answer: bestExample.answer || '',
        };
      }

      topic.solving_strategy = newStrategy;
      converted++;
    }
  }
}

fs.writeFileSync(PACK_PATH, JSON.stringify(d, null, 2));
console.log('Converted', converted, 'strategies to object format with worked examples');

// Verify
let withExample = 0, withoutExample = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const topic of (cat.topics || [])) {
      const s = topic.solving_strategy;
      if (!s) continue;
      if (typeof s === 'object' && !Array.isArray(s) && s.worked_example) withExample++;
      else if (typeof s === 'object' && !Array.isArray(s) && !s.worked_example) withoutExample++;
    }
  }
}
console.log('With worked example:', withExample);
console.log('Without worked example:', withoutExample);
