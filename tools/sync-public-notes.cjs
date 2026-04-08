/**
 * Sync public/content/notes files from the normalized pack data.
 * Also normalize sample-pack.json.
 */

const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');
const d = JSON.parse(fs.readFileSync(PACK_PATH, 'utf8'));

// Map subject IDs to public/content/notes filenames
const subjectToFile = {
  math: 'public/content/notes/vic-selective/math.json',
  verbal: 'public/content/notes/vic-selective/verbal.json',
  quantitative: 'public/content/notes/vic-selective/quantitative.json',
};

for (const subj of d.subjects) {
  const file = subjectToFile[subj.id];
  if (!file) continue;

  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) continue;

  // Write the normalized notes from the pack
  const notes = subj.notes;
  if (notes) {
    fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
    const topicCount = (notes.categories || []).reduce((sum, c) => sum + (c.topics || []).length, 0);
    console.log(`Updated ${file}: ${topicCount} topics`);
  }
}

// Normalize sample-pack.json
const samplePath = path.join(__dirname, '..', 'sample-pack.json');
if (fs.existsSync(samplePath)) {
  const sp = JSON.parse(fs.readFileSync(samplePath, 'utf8'));

  for (const subj of (sp.subjects || [])) {
    for (const cat of (subj.notes?.categories || [])) {
      for (const t of (cat.topics || [])) {
        // Apply same field renames
        if (t.golden_rule && !t.golden_rules) {
          t.golden_rules = [t.golden_rule]; delete t.golden_rule;
        }
        if (t.concept && !t.concept_explanation) {
          t.concept_explanation = t.concept; delete t.concept;
        }
        if (t.formulas && !t.key_formulas) {
          t.key_formulas = Array.isArray(t.formulas) ? t.formulas : [t.formulas];
          delete t.formulas;
        }
        if (t.solving_steps && !t.solving_strategy) {
          t.solving_strategy = t.solving_steps; delete t.solving_steps;
        }

        // Normalize examples
        if (t.examples) {
          for (const ex of t.examples) {
            if (ex.solution && !ex.solution_steps) {
              ex.solution_steps = Array.isArray(ex.solution) ? ex.solution : [ex.solution];
              delete ex.solution;
            }
            if (ex.correct_answer && !ex.answer) {
              ex.answer = ex.correct_answer; delete ex.correct_answer;
            }
            if (!ex.difficulty) ex.difficulty = 2;
          }
        }
      }
    }
  }

  fs.writeFileSync(samplePath, JSON.stringify(sp, null, 2));
  console.log('Updated sample-pack.json');
}

console.log('Done');
