/**
 * Creates a single importable VIC Selective Entry Exam content pack
 * from the three existing notes JSON files.
 *
 * Run: node tools/create-vic-selective-pack.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const math = JSON.parse(readFileSync('public/content/notes/vic-selective/math.json', 'utf8'));
const verbal = JSON.parse(readFileSync('public/content/notes/vic-selective/verbal.json', 'utf8'));
const quant = JSON.parse(readFileSync('public/content/notes/vic-selective/quantitative.json', 'utf8'));

const pack = {
  packId: "vic-selective",
  packVersion: "2025.1",
  exam: "VIC Selective Entry Exam",
  description: "Victorian Selective Entry High Schools Examination — Mathematics, Verbal Reasoning, and Quantitative Reasoning. Covers Victorian Curriculum Level 8 with Year 9-10 extension questions.",
  subjects: [
    {
      id: "math",
      label: "Mathematics",
      notes: math,
    },
    {
      id: "verbal",
      label: "Verbal Reasoning",
      notes: verbal,
    },
    {
      id: "quantitative",
      label: "Quantitative Reasoning",
      notes: quant,
    },
  ],
};

// Count content
let totalExamples = 0;
for (const subj of pack.subjects) {
  const cats = subj.notes.categories || [];
  for (const cat of cats) {
    for (const topic of (cat.topics || [])) {
      totalExamples += (topic.examples || []).length;
    }
  }
}

writeFileSync('packs/vic-selective-exam.json', JSON.stringify(pack, null, 2), 'utf8');

console.log('Created: packs/vic-selective-exam.json');
console.log(`  Subjects: ${pack.subjects.length}`);
console.log(`  Total examples: ${totalExamples}`);
const size = (JSON.stringify(pack).length / 1024).toFixed(0);
console.log(`  File size: ~${size} KB`);
