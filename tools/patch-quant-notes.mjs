/**
 * Patches quantitative.json to add difficulty tiers to all examples
 * and fill gaps in topics missing worked examples.
 *
 * Run: node tools/patch-quant-notes.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/content/notes/vic-selective/quantitative.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));

// Assign difficulty to all examples
function assignDifficulty(example) {
  if (example.difficulty) return;
  const steps = example.solution_steps || [];
  const q = (example.question || '').toLowerCase();
  if (steps.length >= 5 || q.includes('two') && q.includes('then') || q.includes('combined')) {
    example.difficulty = 3; return;
  }
  if (steps.length >= 3 || q.includes('how many') || q.includes('how much') || q.includes('how long') || q.includes('find')) {
    example.difficulty = 2; return;
  }
  example.difficulty = 1;
}

function findTopic(titlePart) {
  for (const cat of data.categories) {
    for (const topic of (cat.topics || [])) {
      if (topic.title && topic.title.includes(titlePart)) return topic;
    }
  }
  return null;
}

// Tag all existing examples
for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    if (topic.examples) {
      for (const ex of topic.examples) assignDifficulty(ex);
    }
  }
}

// Add examples to topics that have none
const patches = [
  {
    topic: "Coordinate Geometry",
    examples: [
      { question: "Find the midpoint of (2, 3) and (8, 7).", solution_steps: ["M = ((2+8)/2, (3+7)/2)", "M = (5, 5)"], answer: "(5, 5)", difficulty: 1 },
      { question: "What is the gradient of the line through (1, 2) and (4, 11)?", solution_steps: ["m = (11−2)/(4−1) = 9/3 = 3"], answer: "3", difficulty: 2 },
    ]
  },
  {
    topic: "Tables & Charts",
    examples: [
      { question: "A bar chart shows Mon=12, Tue=8, Wed=15, Thu=10, Fri=5 visitors. What is the mean?", solution_steps: ["Total = 12+8+15+10+5 = 50", "Mean = 50/5 = 10"], answer: "10 visitors", difficulty: 1 },
      { question: "A pie chart shows 25% sport, 40% music, rest is reading. If 200 students surveyed, how many chose reading?", solution_steps: ["Reading = 100% − 25% − 40% = 35%", "35% of 200 = 70"], answer: "70 students", difficulty: 2 },
    ]
  },
  {
    topic: "Matrix",
    examples: [
      { question: "In a 3×3 grid, each row, column, and diagonal sums to 15. Fill in: [2,?,6], [?,5,?], [?,?,?]", solution_steps: ["Row 1: 2+?+6=15 → ?=7", "Col 1: 2+?+?=15", "Diagonal: 2+5+?=15 → ?=8 (bottom right)", "Continue using sum=15 for each line"], answer: "2,7,6 / 9,5,1 / 4,3,8", difficulty: 2 },
    ]
  },
  {
    topic: "Logical Deduction",
    examples: [
      { question: "All cats are animals. Some animals are pets. Which must be true? A) All cats are pets B) Some cats may be pets C) No cats are pets", solution_steps: ["'All cats are animals' ✓", "'Some animals are pets' — but not necessarily cats", "Some cats COULD be pets, but it's not guaranteed", "B is the only safe conclusion"], answer: "B) Some cats may be pets", difficulty: 2 },
    ]
  },
  {
    topic: "Time Problems",
    examples: [
      { question: "A train departs at 8:45 am and arrives at 11:20 am. How long is the journey?", solution_steps: ["8:45 → 9:00 = 15 min", "9:00 → 11:00 = 2 hours", "11:00 → 11:20 = 20 min", "Total = 2 h 35 min"], answer: "2 hours 35 minutes", difficulty: 1 },
      { question: "It is 3:50 pm in Melbourne (AEST, UTC+10). What time is it in London (UTC)?", solution_steps: ["Melbourne is UTC+10", "3:50 pm − 10 hours = 5:50 am (same day)"], answer: "5:50 am", difficulty: 2 },
    ]
  },
  {
    topic: "Money & Finance",
    examples: [
      { question: "A shirt costs $45 after a 25% discount. What was the original price?", solution_steps: ["$45 = 75% of original (100% − 25%)", "Original = 45 / 0.75 = $60"], answer: "$60", difficulty: 2 },
    ]
  },
];

for (const patch of patches) {
  const topic = findTopic(patch.topic);
  if (topic) {
    if (!topic.examples) topic.examples = [];
    topic.examples.push(...patch.examples);
  }
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');

let totalTopics = 0, totalExamples = 0, withDifficulty = 0;
for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    totalTopics++;
    if (topic.examples) {
      for (const ex of topic.examples) { totalExamples++; if (ex.difficulty) withDifficulty++; }
    }
  }
}
console.log(`Done. ${data.categories.length} categories, ${totalTopics} topics, ${totalExamples} examples (${withDifficulty} with difficulty tags).`);
