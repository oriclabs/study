/**
 * Adds ALL Victorian Curriculum gaps (Level 8, 9, 10, 10A) to math.json.
 * Each topic tagged with curriculum_level field.
 *
 * Run: node tools/patch-math-all-levels.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/content/notes/vic-selective/math.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));

function findCat(name) {
  return data.categories.find(c => c.category && c.category.includes(name));
}

// ============================================================
// TAG EXISTING TOPICS WITH CURRICULUM LEVELS
// ============================================================
const levelMap = {
  'Types of Numbers': '7', 'Factors, Multiples': '7', 'Operations with Integers': '7',
  'Fractions': '7', 'Decimals': '7', 'Percentages': '7',
  'Ratios': '7-8', 'Direct & Inverse': '8-10', 'Rates': '7-8',
  'Index Laws': '8-10', 'Square Roots': '8-10', 'Scientific Notation': '8-9',
  'Algebraic Expressions': '7-10', 'Linear Equations': '7-10', 'Simultaneous': '9-10',
  'Inequalities': '9-10', 'Quadratic': '10-10A',
  'Arithmetic Seq': '8-9', 'Geometric Seq': '9-10', 'Other Sequence': '8-10',
  'Angle Properties': '7-8', 'Triangles': '7-8', "Pythagoras'": '8-9',
  'Similarity': '9-10', 'Quadrilaterals': '7-8', 'Polygons': '7-8',
  'Circle Theorems': '10-10A',
  'Perimeter': '7-8', 'Area': '7-9', 'Surface Area': '8-10', 'Volume': '8-10',
  'Transformations': '7-8', 'Scale Drawings': '8-9',
  'Trigonometric': '9-10', 'Estimation': '7-8',
  'Coordinate Geometry': '8-10',
  'Measures of Central': '7-8', 'Probability': '7-9',
  'Data Displays': '8-10', 'Distribution': '9-10',
  'Profit': '8-9', 'Simple & Compound': '9-10',
  'Problem Solving': '7-10', 'Venn': '8-10', 'Combinatorial': '9-10',
  'Quick Problem': '7-10',
};

for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    for (const [key, level] of Object.entries(levelMap)) {
      if (topic.title && topic.title.includes(key)) {
        topic.curriculum_level = level;
        break;
      }
    }
    if (!topic.curriculum_level) topic.curriculum_level = '7-8';
  }
}

// ============================================================
// LEVEL 8 — Core exam level
// ============================================================

// Number: Terminating/recurring decimals, irrational numbers
const numCat = findCat('Number Systems');
if (numCat) {
  numCat.topics.push({
    id: "L8-NUM-01",
    title: "Terminating & Recurring Decimals, Irrational Numbers",
    curriculum_level: "8",
    concept_explanation: "Terminating decimals end (e.g., 0.25). Recurring decimals repeat forever (e.g., 0.333...). Irrational numbers cannot be written as fractions — their decimals never terminate or repeat (e.g., π, √2).",
    definitions: {
      "Terminating decimal": "Ends after a finite number of digits. E.g., 1/4 = 0.25, 3/8 = 0.375",
      "Recurring decimal": "Has a repeating pattern. E.g., 1/3 = 0.333... = 0.3̄, 2/7 = 0.285714̄",
      "Irrational number": "Cannot be expressed as a/b. Decimal never terminates or repeats. E.g., √2, π, √3",
      "Real number": "All rational + irrational numbers. Everything on the number line."
    },
    key_rules: [
      "A fraction terminates if the denominator (in lowest terms) has only factors of 2 and/or 5",
      "All other fractions produce recurring decimals",
      "√n is irrational unless n is a perfect square",
      "π ≈ 3.14159... is irrational (memorise to 3.14 for exams)"
    ],
    examples: [
      { question: "Is 7/8 terminating or recurring?", options: ["Terminating", "Recurring", "Irrational", "Cannot tell"], solution_steps: ["8 = 2³ — only factor of 2", "Therefore terminating: 7/8 = 0.875"], answer: "Terminating (0.875)", difficulty: 1 },
      { question: "Convert 0.363636... to a fraction.", solution_steps: ["Let x = 0.363636...", "100x = 36.363636...", "100x − x = 36", "99x = 36", "x = 36/99 = 4/11"], answer: "4/11", difficulty: 2 },
      { question: "Which is irrational: √16, √20, 22/7, 0.101001000100001...?", options: ["√16", "√20 and 0.10100...", "22/7", "All of them"], solution_steps: ["√16 = 4 (rational)", "22/7 ≈ 3.142857... (rational — it's a fraction)", "√20 = 2√5 (irrational — 20 isn't a perfect square)", "0.10100100010000... (non-repeating pattern — irrational)"], answer: "√20 and 0.10100...", difficulty: 2 }
    ],
    tips_and_tricks: [
      "Quick test: can you simplify the denominator to only 2s and 5s? If yes → terminates",
      "To convert recurring decimal to fraction: multiply by 10ⁿ where n = length of repeating block",
      "π is NOT 22/7 — that's just an approximation. π is irrational."
    ]
  });
}

// Statistics: Complementary events, two-way tables, sampling
const statsCat = findCat('Statistics');
if (statsCat) {
  statsCat.topics.push({
    id: "L8-STAT-01",
    title: "Complementary Events & Probability Language",
    curriculum_level: "8",
    concept_explanation: "Complementary events are opposites — they cover ALL possibilities. If P(rain) = 0.3, then P(no rain) = 0.7. The words 'at least', 'or', 'and' have precise mathematical meanings in probability.",
    key_formulas: [
      "P(A') = 1 − P(A)  where A' is the complement of A",
      "P(A or B) = P(A) + P(B) − P(A and B)  for overlapping events",
      "P(A or B) = P(A) + P(B)  for mutually exclusive events",
      "'At least one' = 1 − P(none)"
    ],
    definitions: {
      "Complementary": "P(A) + P(not A) = 1. They account for all outcomes.",
      "Mutually exclusive": "Events that cannot happen at the same time. P(A and B) = 0.",
      "Independent": "One event doesn't affect the other. P(A and B) = P(A) × P(B).",
      "'At least one'": "One or more. Easiest to calculate as 1 − P(none).",
      "Inclusive OR": "A or B or both. P(A ∪ B).",
      "Exclusive OR": "A or B but not both."
    },
    examples: [
      { question: "P(passing a test) = 0.85. What is P(failing)?", options: ["0.85", "0.15", "0.50", "1.85"], solution_steps: ["Complement: P(fail) = 1 − P(pass) = 1 − 0.85 = 0.15"], answer: "0.15", difficulty: 1 },
      { question: "A coin is flipped 3 times. P(at least one head)?", options: ["7/8", "3/4", "1/2", "1/8"], solution_steps: ["P(no heads) = P(TTT) = (1/2)³ = 1/8", "P(at least one head) = 1 − 1/8 = 7/8"], answer: "7/8", difficulty: 2 },
      { question: "In a class: 15 play sport, 12 play music, 5 play both. P(student plays sport OR music)?", options: ["27/30", "22/30", "15/30", "5/30"], solution_steps: ["P(sport or music) = P(sport) + P(music) − P(both)", "Assume class of 30: = 15/30 + 12/30 − 5/30 = 22/30"], answer: "22/30", difficulty: 2 }
    ],
    tips_and_tricks: [
      "'At least one' is ALWAYS easier as 1 − P(none)",
      "Draw a Venn diagram for 'or'/'and' questions — it prevents double-counting",
      "Mutually exclusive: no overlap in Venn diagram",
      "If events are independent, multiply. If dependent, use conditional probability."
    ]
  });

  statsCat.topics.push({
    id: "L8-STAT-02",
    title: "Two-Way Tables & Sampling",
    curriculum_level: "8-9",
    concept_explanation: "Two-way tables organise data by TWO categories simultaneously. Sampling means selecting a subset of a population to study — the method matters for how reliable the results are.",
    definitions: {
      "Population": "The entire group you want to study",
      "Sample": "A subset of the population that you actually collect data from",
      "Random sample": "Every member has an equal chance of being selected — most reliable",
      "Convenience sample": "Easiest to access — often biased",
      "Census": "Data from EVERY member of the population (rare — expensive and slow)"
    },
    examples: [
      {
        question: "A two-way table shows: Boys who like pizza: 20, Boys who don't: 10. Girls who like pizza: 15, Girls who don't: 5. What fraction of ALL students like pizza?",
        options: ["35/50", "20/50", "15/50", "20/30"],
        solution_steps: ["Total who like pizza = 20 + 15 = 35", "Total students = 20 + 10 + 15 + 5 = 50", "Fraction = 35/50 = 7/10"],
        answer: "35/50 = 7/10",
        difficulty: 1
      },
      {
        question: "A school surveys 50 Year 8 students by asking the first 50 to arrive at school. Is this a good sample to represent all Year 8 students?",
        options: ["Yes — 50 is enough", "No — it's a convenience sample", "Yes — they're all Year 8", "No — should survey Year 7 too"],
        solution_steps: ["First 50 to arrive = convenience sample", "Early arrivals may differ from late arrivals (e.g., live closer, more motivated)", "Not random → may be biased"],
        answer: "No — it's a convenience sample (biased toward early arrivals)",
        difficulty: 2
      }
    ],
    tips_and_tricks: [
      "Two-way table: always calculate row AND column totals — they help find missing values",
      "Random sampling is the gold standard — the exam will ask you to identify bias in other methods",
      "Sample size matters: bigger samples give more reliable results",
      "When reading a two-way table, be clear whether the question asks about a row, column, or the whole table"
    ]
  });
}

// ============================================================
// LEVEL 9-10 — Extension
// ============================================================

// Non-linear graphs
const algCat = findCat('Algebra');
if (algCat) {
  algCat.topics.push({
    id: "L9-ALG-01",
    title: "Non-Linear Graphs — Parabolas, Hyperbolas, Exponentials",
    curriculum_level: "9-10",
    concept_explanation: "Not all relationships are linear. A parabola (y = x²) is U-shaped, a hyperbola (y = 1/x) has two separate curves, and an exponential (y = 2ˣ) grows rapidly. Recognising these shapes is essential.",
    key_formulas: [
      "Parabola: y = ax² + bx + c — U-shape (or ∩ if a < 0). Vertex at x = −b/2a",
      "Hyperbola: y = k/x — two curves in opposite quadrants. Never crosses axes.",
      "Exponential growth: y = aˣ (a > 1) — starts slow, gets steep fast",
      "Exponential decay: y = a⁻ˣ — starts steep, flattens toward zero",
      "Circle: x² + y² = r² — centred at origin, radius r"
    ],
    identification_cues: [
      "x² in equation → parabola",
      "1/x or x in denominator → hyperbola",
      "x in exponent → exponential",
      "x² + y² → circle"
    ],
    examples: [
      { question: "Sketch y = x² − 4. Where does it cross the x-axis?", solution_steps: ["Set y = 0: x² − 4 = 0", "x² = 4, x = ±2", "Crosses x-axis at (−2, 0) and (2, 0)", "Vertex at (0, −4) — U-shape opening up"], answer: "x-intercepts at x = −2 and x = 2", difficulty: 2 },
      { question: "Which graph passes through (0, 1) and gets steeper as x increases?", options: ["y = x²", "y = 2ˣ", "y = 1/x", "y = 2x + 1"], solution_steps: ["At x=0: y = 2⁰ = 1 ✓", "Gets steeper = exponential growth", "y = x² also passes through (0,0) not (0,1)"], answer: "y = 2ˣ", difficulty: 2 },
      { question: "A population doubles every year starting at 100. Write the formula and find the population after 5 years.", solution_steps: ["P = 100 × 2ⁿ where n = years", "After 5 years: P = 100 × 2⁵ = 100 × 32 = 3200"], answer: "P = 100 × 2ⁿ; after 5 years = 3200", difficulty: 2 }
    ],
    tips_and_tricks: [
      "For parabolas: if a > 0, opens up (∪). If a < 0, opens down (∩)",
      "Exponential growth is MUCH faster than quadratic for large x",
      "Hyperbola: as x → 0, y → ∞. As x → ∞, y → 0. Never touches the axes.",
      "To sketch any graph: find x-intercepts (set y=0), y-intercept (set x=0), and a few key points"
    ]
  });

  // Algebraic fractions
  algCat.topics.push({
    id: "L10-ALG-01",
    title: "Algebraic Fractions & Making Variables the Subject",
    curriculum_level: "10",
    concept_explanation: "Algebraic fractions have variables in the numerator or denominator. Rearranging formulas means isolating a specific variable — 'making it the subject'.",
    key_rules: [
      "To solve: multiply both sides by the denominator to clear fractions",
      "To add/subtract algebraic fractions: find common denominator (like numerical fractions)",
      "To rearrange a formula: use inverse operations to isolate the target variable",
      "Never divide by zero — check that denominators ≠ 0"
    ],
    examples: [
      { question: "Solve: x/3 + x/4 = 7", solution_steps: ["LCD = 12", "4x/12 + 3x/12 = 7", "7x/12 = 7", "7x = 84", "x = 12"], answer: "x = 12", difficulty: 2 },
      { question: "Make r the subject of A = πr²", solution_steps: ["A = πr²", "r² = A/π", "r = √(A/π)"], answer: "r = √(A/π)", difficulty: 2 },
      { question: "Solve: 2/(x+1) = 3/(x+3)", solution_steps: ["Cross-multiply: 2(x+3) = 3(x+1)", "2x + 6 = 3x + 3", "6 − 3 = 3x − 2x", "x = 3"], answer: "x = 3", difficulty: 3 }
    ],
    tips_and_tricks: [
      "Cross-multiplication works when you have one fraction = one fraction",
      "When rearranging, do the same operation to BOTH sides",
      "If the target variable is squared, you'll need a square root at the end",
      "Check your answer by substituting back into the ORIGINAL equation"
    ]
  });
}

// Coordinate geometry: gradients of parallel/perpendicular lines
const coordCat = findCat('Coordinate');
if (coordCat) {
  coordCat.topics.push({
    id: "L10-COORD-01",
    title: "Parallel & Perpendicular Line Gradients",
    curriculum_level: "10",
    concept_explanation: "Parallel lines have the SAME gradient. Perpendicular lines have gradients that multiply to −1 (negative reciprocals).",
    key_formulas: [
      "Parallel lines: m₁ = m₂",
      "Perpendicular lines: m₁ × m₂ = −1, so m₂ = −1/m₁",
      "Gradient from two points: m = (y₂ − y₁) / (x₂ − x₁)",
      "Equation of a line: y − y₁ = m(x − x₁)  or  y = mx + c"
    ],
    examples: [
      { question: "Line A has gradient 3. What is the gradient of a line parallel to A? Perpendicular to A?", solution_steps: ["Parallel: same gradient = 3", "Perpendicular: m = −1/3"], answer: "Parallel: 3. Perpendicular: −1/3", difficulty: 1 },
      { question: "Find the equation of a line through (2, 5) perpendicular to y = 2x + 1.", solution_steps: ["Given line has m = 2", "Perpendicular gradient: m = −1/2", "y − 5 = −1/2(x − 2)", "y = −x/2 + 1 + 5 = −x/2 + 6"], answer: "y = −x/2 + 6", difficulty: 2 },
      { question: "Are the lines y = 3x − 1 and 3y + x = 6 perpendicular?", solution_steps: ["Line 1: m₁ = 3", "Line 2: 3y = −x + 6 → y = −x/3 + 2 → m₂ = −1/3", "m₁ × m₂ = 3 × (−1/3) = −1 ✓"], answer: "Yes — product of gradients is −1", difficulty: 2 }
    ],
    tips_and_tricks: [
      "Parallel = same slope. Perpendicular = flip and negate the slope.",
      "To check perpendicular: multiply the gradients. If you get −1, they're perpendicular.",
      "Horizontal lines (m=0) are perpendicular to vertical lines (undefined gradient)",
      "Always rearrange to y = mx + c form to read the gradient easily"
    ]
  });
}

// Scatter plots, conditional probability, composite solids
if (statsCat) {
  statsCat.topics.push({
    id: "L10-STAT-01",
    title: "Scatter Plots, Line of Best Fit & Bivariate Data",
    curriculum_level: "10",
    concept_explanation: "A scatter plot shows the relationship between two numerical variables. A line of best fit summarises the trend. The relationship can be positive (both increase), negative (one increases, other decreases), or no correlation.",
    definitions: {
      "Positive correlation": "As x increases, y increases. Points trend upward.",
      "Negative correlation": "As x increases, y decreases. Points trend downward.",
      "No correlation": "No pattern. Points scattered randomly.",
      "Line of best fit": "A straight line that best represents the trend. Roughly equal points above and below.",
      "Interpolation": "Predicting within the data range — reliable.",
      "Extrapolation": "Predicting outside the data range — less reliable."
    },
    examples: [
      { question: "A scatter plot of study hours vs test scores shows points trending upward. What type of correlation?", options: ["Positive", "Negative", "No correlation", "Perfect"], answer: "Positive", solution_steps: ["As study hours increase, test scores increase", "Upward trend = positive correlation"], difficulty: 1 },
      { question: "The line of best fit for height (cm) vs shoe size is y = 0.15x − 14. Predict shoe size for height 170 cm. Is this interpolation or extrapolation if data ranges from 150-185 cm?", solution_steps: ["y = 0.15(170) − 14 = 25.5 − 14 = 11.5", "170 cm is within the data range (150-185)", "Therefore interpolation — reliable prediction"], answer: "Shoe size ≈ 11.5 (interpolation)", difficulty: 2 }
    ],
    tips_and_tricks: [
      "Correlation ≠ causation: ice cream sales correlate with drowning (both happen in summer), but ice cream doesn't cause drowning",
      "Line of best fit doesn't need to pass through any actual data points",
      "Be suspicious of extrapolation — trends don't always continue beyond the data",
      "Strong correlation: points cluster tightly around the line. Weak: widely scattered."
    ]
  });

  statsCat.topics.push({
    id: "L10-STAT-02",
    title: "Conditional Probability",
    curriculum_level: "10",
    concept_explanation: "Conditional probability is the probability of an event GIVEN that another event has already happened. Written as P(A|B) = probability of A given B.",
    key_formulas: [
      "P(A|B) = P(A and B) / P(B)",
      "If independent: P(A|B) = P(A) — knowing B doesn't change A's probability",
      "Tree diagrams: multiply along branches, add across branches"
    ],
    examples: [
      { question: "A bag has 5 red and 3 blue balls. You draw one, don't replace it, then draw another. P(2nd is red | 1st was red)?", options: ["5/8", "4/7", "5/7", "4/8"], solution_steps: ["After removing 1 red: 4 red, 3 blue remain (7 total)", "P(2nd red | 1st red) = 4/7"], answer: "4/7", difficulty: 2 },
      { question: "In a school: 60% of students play sport. Of those who play sport, 40% also play music. What % of ALL students play both sport AND music?", solution_steps: ["P(sport) = 0.60", "P(music | sport) = 0.40", "P(sport AND music) = P(sport) × P(music | sport)", "= 0.60 × 0.40 = 0.24 = 24%"], answer: "24%", difficulty: 2 },
      { question: "Two dice are rolled. P(sum > 8 | first die shows 5)?", solution_steps: ["Given first die = 5", "Need sum > 8, so second die > 3", "Second die can be 4, 5, or 6 → 3 outcomes out of 6", "P = 3/6 = 1/2"], answer: "1/2", difficulty: 3 }
    ],
    tips_and_tricks: [
      "Key word: 'given that', 'knowing that', 'if' → conditional probability",
      "Without replacement → probabilities CHANGE after each draw (dependent events)",
      "Tree diagrams are the safest method — draw them for 2+ step problems",
      "The denominator in P(A|B) is ONLY the outcomes where B happened"
    ]
  });

  statsCat.topics.push({
    id: "L10-STAT-03",
    title: "Quartiles, IQR & Box Plots",
    curriculum_level: "10",
    concept_explanation: "Quartiles divide ordered data into four equal parts. The interquartile range (IQR) measures spread of the middle 50%. Box plots display the five-number summary visually.",
    key_formulas: [
      "Q1 (lower quartile) = median of lower half",
      "Q2 (median) = middle value of whole dataset",
      "Q3 (upper quartile) = median of upper half",
      "IQR = Q3 − Q1",
      "Outlier if value < Q1 − 1.5×IQR or > Q3 + 1.5×IQR"
    ],
    examples: [
      { question: "Data: 3, 5, 7, 8, 12, 14, 18, 21, 25. Find Q1, Q2, Q3, IQR.", solution_steps: ["9 values → Q2 (median) = 5th value = 12", "Lower half: 3, 5, 7, 8 → Q1 = (5+7)/2 = 6", "Upper half: 14, 18, 21, 25 → Q3 = (18+21)/2 = 19.5", "IQR = 19.5 − 6 = 13.5"], answer: "Q1=6, Q2=12, Q3=19.5, IQR=13.5", difficulty: 2 },
      { question: "A box plot shows: min=10, Q1=25, median=35, Q3=45, max=90. Is 90 an outlier?", solution_steps: ["IQR = 45 − 25 = 20", "Upper fence = Q3 + 1.5 × IQR = 45 + 30 = 75", "90 > 75 → yes, 90 is an outlier"], answer: "Yes — 90 exceeds the upper fence (75)", difficulty: 2 }
    ],
    tips_and_tricks: [
      "Always ORDER the data first before finding quartiles",
      "Box plot: the box = middle 50% of data, whiskers = range (excluding outliers)",
      "Parallel box plots are excellent for comparing two groups",
      "Outliers are shown as individual dots beyond the whiskers"
    ]
  });
}

// Mensuration: composite solids
const mensCat = findCat('Mensuration');
if (mensCat) {
  mensCat.topics.push({
    id: "L10-MENS-01",
    title: "Composite Solids — Pyramids, Cones, Spheres",
    curriculum_level: "10-10A",
    concept_explanation: "Composite solids are made from combining basic 3D shapes. To find their volume or surface area, break them into parts, calculate each, then combine.",
    key_formulas: [
      "Pyramid: V = 1/3 × base area × height",
      "Cone: V = 1/3 × πr²h, SA = πr² + πrl (l = slant height)",
      "Sphere: V = 4/3 × πr³, SA = 4πr²",
      "Hemisphere: V = 2/3 × πr³, SA = 3πr² (curved + flat)",
      "Composite: split into parts → calculate each → add/subtract"
    ],
    examples: [
      { question: "A cone has radius 6 cm and height 8 cm. Find its volume.", solution_steps: ["V = 1/3 × π × 6² × 8", "V = 1/3 × π × 36 × 8", "V = 96π ≈ 301.6 cm³"], answer: "96π ≈ 301.6 cm³", difficulty: 2 },
      { question: "An ice cream cone (cone + hemisphere on top): cone height 12 cm, radius 4 cm. Total volume?", solution_steps: ["Cone: V = 1/3 × π × 4² × 12 = 64π", "Hemisphere: V = 2/3 × π × 4³ = 128π/3", "Total = 64π + 128π/3 = 192π/3 + 128π/3 = 320π/3 ≈ 335.1 cm³"], answer: "320π/3 ≈ 335 cm³", difficulty: 3 }
    ],
    tips_and_tricks: [
      "Cone and pyramid: both are 1/3 × base × height (same formula, different bases)",
      "Sphere: memorise 4/3 πr³ for volume, 4πr² for surface area",
      "For composite solids: sketch and label EACH part before calculating",
      "Slant height of cone: use Pythagoras (l² = r² + h²)"
    ]
  });
}

// ============================================================
// LEVEL 10A — Advanced extension
// ============================================================

// Logarithms
const powersCat = findCat('Powers');
if (powersCat) {
  powersCat.topics.push({
    id: "L10A-LOG-01",
    title: "Logarithms",
    curriculum_level: "10A",
    concept_explanation: "A logarithm answers: 'What power do I raise the base to, to get this number?' If 2³ = 8, then log₂(8) = 3. Logarithms are the inverse of exponentials.",
    key_formulas: [
      "If aˣ = b, then log_a(b) = x",
      "log_a(mn) = log_a(m) + log_a(n)  — product rule",
      "log_a(m/n) = log_a(m) − log_a(n)  — quotient rule",
      "log_a(mⁿ) = n × log_a(m)  — power rule",
      "log_a(a) = 1, log_a(1) = 0"
    ],
    examples: [
      { question: "Find log₂(32)", solution_steps: ["2 to what power = 32?", "2⁵ = 32", "So log₂(32) = 5"], answer: "5", difficulty: 1 },
      { question: "Simplify: log₃(27) + log₃(9)", solution_steps: ["log₃(27) = 3 (since 3³ = 27)", "log₃(9) = 2 (since 3² = 9)", "Total = 3 + 2 = 5", "OR: log₃(27 × 9) = log₃(243) = 5 (since 3⁵ = 243)"], answer: "5", difficulty: 2 },
      { question: "Solve: 2ˣ = 64", solution_steps: ["Take log base 2: x = log₂(64)", "2⁶ = 64", "x = 6"], answer: "x = 6", difficulty: 2 }
    ],
    tips_and_tricks: [
      "log₁₀ is written as just 'log' (common logarithm — used on calculators)",
      "The three log laws mirror the index laws — learn them together",
      "To solve exponential equations: take the log of both sides",
      "Logarithmic scales: earthquakes (Richter), sound (decibels), pH"
    ]
  });
}

// Sine/cosine rules for any triangle
const trigCat = findCat('Trigonometry');
if (trigCat) {
  trigCat.topics.push({
    id: "L10A-TRIG-01",
    title: "Sine Rule, Cosine Rule & Area Rule",
    curriculum_level: "10A",
    concept_explanation: "SOH-CAH-TOA only works for right-angled triangles. For ANY triangle, use the sine rule (relates sides to opposite angles) or cosine rule (extension of Pythagoras). The area rule finds area from two sides and the included angle.",
    key_formulas: [
      "Sine rule: a/sin(A) = b/sin(B) = c/sin(C)",
      "Cosine rule: c² = a² + b² − 2ab·cos(C)  (find a side)",
      "Cosine rule rearranged: cos(C) = (a² + b² − c²) / 2ab  (find an angle)",
      "Area rule: Area = ½ab·sin(C)  (two sides and included angle)"
    ],
    identification_cues: [
      "Use SINE RULE when you have: a side and its opposite angle + one other piece",
      "Use COSINE RULE when you have: 2 sides + included angle (SAS), or 3 sides (SSS)",
      "Use AREA RULE when you have: 2 sides + included angle and need the area"
    ],
    examples: [
      { question: "Triangle: A = 40°, B = 65°, a = 10 cm. Find b.", solution_steps: ["Sine rule: a/sin(A) = b/sin(B)", "10/sin(40°) = b/sin(65°)", "b = 10 × sin(65°)/sin(40°)", "b = 10 × 0.906/0.643 ≈ 14.1 cm"], answer: "≈ 14.1 cm", difficulty: 2 },
      { question: "Triangle: a = 7, b = 9, C = 50°. Find side c.", solution_steps: ["Cosine rule: c² = 7² + 9² − 2(7)(9)cos(50°)", "c² = 49 + 81 − 126 × 0.643", "c² = 130 − 81.0 = 49.0", "c = √49 = 7"], answer: "c = 7", difficulty: 2 },
      { question: "Triangle with sides 8 cm and 11 cm, included angle 35°. Find the area.", solution_steps: ["Area = ½ × 8 × 11 × sin(35°)", "= ½ × 88 × 0.574", "= 25.2 cm²"], answer: "≈ 25.2 cm²", difficulty: 2 }
    ],
    tips_and_tricks: [
      "Decision flowchart: Right angle? → SOH-CAH-TOA. Not right-angled? → Sine or Cosine rule.",
      "Sine rule: need a PAIR (side + opposite angle). Cosine rule: don't have a pair.",
      "The cosine rule becomes Pythagoras when C = 90° (cos 90° = 0)",
      "Area rule is MUCH faster than base × height when you don't know the height"
    ]
  });
}

// Standard deviation
if (statsCat) {
  statsCat.topics.push({
    id: "L10A-STAT-01",
    title: "Standard Deviation",
    curriculum_level: "10A",
    concept_explanation: "Standard deviation measures how spread out data is from the mean. A small SD means data clusters tightly around the mean; a large SD means data is widely spread.",
    key_formulas: [
      "Step 1: Find the mean (x̄)",
      "Step 2: For each value, calculate (value − mean)²",
      "Step 3: Find the mean of these squared differences = variance",
      "Step 4: Standard deviation = √variance",
      "Formula: σ = √[Σ(xᵢ − x̄)² / n]"
    ],
    examples: [
      {
        question: "Data: 4, 8, 6, 10, 2. Find the standard deviation.",
        solution_steps: [
          "Mean = (4+8+6+10+2)/5 = 30/5 = 6",
          "Differences from mean: −2, 2, 0, 4, −4",
          "Squared differences: 4, 4, 0, 16, 16",
          "Variance = (4+4+0+16+16)/5 = 40/5 = 8",
          "SD = √8 ≈ 2.83"
        ],
        answer: "σ ≈ 2.83",
        difficulty: 2
      },
      {
        question: "Class A scores: mean 72, SD 5. Class B scores: mean 72, SD 15. Which class performed more consistently?",
        options: ["Class A (smaller SD)", "Class B (larger SD)", "Same — equal means", "Cannot tell"],
        solution_steps: ["Both have the same mean (72)", "Class A: SD=5 → scores cluster within 67-77", "Class B: SD=15 → scores spread from 57-87", "Smaller SD = more consistent"],
        answer: "Class A — smaller SD means more consistent scores",
        difficulty: 2
      }
    ],
    tips_and_tricks: [
      "SD is always ≥ 0. SD = 0 means all values are identical.",
      "About 68% of data falls within 1 SD of the mean (for normal distributions)",
      "About 95% falls within 2 SDs — useful for identifying unusual values",
      "Adding a constant to all values doesn't change SD. Multiplying all values by k multiplies SD by k."
    ]
  });
}

// Polynomials
if (algCat) {
  algCat.topics.push({
    id: "L10A-ALG-01",
    title: "Polynomials, Factor & Remainder Theorems",
    curriculum_level: "10A",
    concept_explanation: "A polynomial is an expression like 2x³ + 5x² − 3x + 7. The degree is the highest power. The Factor Theorem says: if P(a) = 0, then (x − a) is a factor. The Remainder Theorem says: when P(x) is divided by (x − a), the remainder is P(a).",
    key_formulas: [
      "Factor Theorem: if P(a) = 0, then (x − a) is a factor of P(x)",
      "Remainder Theorem: P(x) ÷ (x − a) has remainder P(a)",
      "If P(x) = (x − a) × Q(x) + R, then R = P(a)"
    ],
    examples: [
      { question: "Is (x − 2) a factor of P(x) = x³ − 3x² + 4?", solution_steps: ["P(2) = 8 − 12 + 4 = 0", "Since P(2) = 0, yes (x − 2) is a factor"], answer: "Yes — P(2) = 0", difficulty: 2 },
      { question: "Find the remainder when x³ + 2x − 5 is divided by (x − 1).", solution_steps: ["P(1) = 1 + 2 − 5 = −2", "Remainder = −2 (by Remainder Theorem)"], answer: "Remainder = −2", difficulty: 2 },
      { question: "Factorise completely: x³ − 6x² + 11x − 6", solution_steps: ["Try x = 1: P(1) = 1 − 6 + 11 − 6 = 0 ✓ → (x − 1) is a factor", "Divide: x³ − 6x² + 11x − 6 = (x − 1)(x² − 5x + 6)", "Factorise quadratic: = (x − 1)(x − 2)(x − 3)"], answer: "(x − 1)(x − 2)(x − 3)", difficulty: 3 }
    ],
    tips_and_tricks: [
      "To find factors: try P(1), P(−1), P(2), P(−2), P(3)... — factors of the constant term",
      "Once you find one factor, divide to get a quadratic, then factorise normally",
      "The degree tells you the maximum number of roots (a cubic has up to 3 roots)",
      "Factor Theorem is just a shortcut — you could do long division, but this is faster"
    ]
  });
}

// ============================================================
// WRITE
// ============================================================
writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');

let totalTopics = 0, totalExamples = 0;
const levelCount = {};
for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    totalTopics++;
    totalExamples += (topic.examples || []).length;
    const lv = topic.curriculum_level || '?';
    levelCount[lv] = (levelCount[lv] || 0) + 1;
  }
}
console.log(`Done. ${data.categories.length} categories, ${totalTopics} topics, ${totalExamples} examples.`);
console.log('By level:', JSON.stringify(levelCount));
