const fs = require("fs");
const d = JSON.parse(fs.readFileSync("./packs/vic-selective-exam.json", "utf8"));

const extraMap = {
  "Estimation & Approximation": "number.operations",
  "Parallel & Perpendicular": "geometry.coordinate",
  "Measures of Central": "statistics.data",
  "Data Displays": "statistics.data",
  "Distribution Shape": "statistics.data",
  "Two-Way Tables": "statistics.data",
  "Scatter Plots": "statistics.data",
  "Quartiles": "statistics.data",
  "Standard Deviation": "statistics.data",
  "Problem Solving Strategies": "number.types",
  "Useful Combinatorial": "statistics.probability",
  "Quick Problem": "number.types",
  "Word Classification": "logic.odd-one-out",
  "Hidden Words": "vocabulary.context",
  "Cloze Passages": "language.sentence-completion",
  "Comprehension Question": "language.comprehension",
  "Statement & Conclusion": "logic.deductive",
  "Common Grammar Rules": "language.grammar",
  "Rearranging Words": "language.sentence-completion",
  "Sentence Correction": "language.grammar",
  "Proverbs": "language.idioms",
  "Figurative Language in": "descriptive.figurative",
  "Figurative Language": "vocabulary.context",
  "Word Completion": "vocabulary.word-parts",
  "Powers, Roots & Order": "sequences.arithmetic",
  "Shape / Figural": "patterns",
  "Visual Pattern": "patterns.grid",
  "3D Nets": "patterns.grid",
  "Solving for Unknowns": "word-problems",
  "Word Problems with": "word-problems",
  "Substitution Problems": "word-problems",
  "Mean, Median": "data-interpretation",
  "Matrix / Grid": "patterns.matrix",
  "MCQ Elimination": "sequences",
  "Author's Purpose": "analysis.purpose",
  "Reading Comprehension Exam": "evaluation.strategy",
  "Show, Don't Tell": "descriptive.senses",
  "Dialogue & Character": "narrative.dialogue",
  "Building an Argument": "persuasive",
  "Vivid Vocabulary": "mechanics.word-choice",
  "Common Writing Errors": "mechanics.word-choice",
};

let mapped = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      if (t.topic_id) continue;
      for (const [pattern, topicId] of Object.entries(extraMap)) {
        if (t.title && t.title.includes(pattern)) {
          t.topic_id = topicId;
          mapped++;
          break;
        }
      }
    }
  }
}

fs.writeFileSync("./packs/vic-selective-exam.json", JSON.stringify(d, null, 2));
console.log("Mapped " + mapped + " more topics");

let unmapped = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      if (!t.topic_id) { console.log("  Still unmapped: " + t.title); unmapped++; }
    }
  }
}
console.log("Remaining unmapped: " + unmapped);
