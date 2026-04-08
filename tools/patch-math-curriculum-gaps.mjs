/**
 * Patches math.json to add:
 * 1. Victorian Curriculum Level 7-8 gaps (stats displays, probability experiments)
 * 2. Enhanced problem-solving strategies with identification techniques
 * 3. Quick tips for each topic type
 *
 * Run: node tools/patch-math-curriculum-gaps.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/content/notes/vic-selective/math.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));

function findCat(name) {
  return data.categories.find(c => c.category && c.category.includes(name));
}
function findTopic(titlePart) {
  for (const cat of data.categories) {
    for (const topic of (cat.topics || [])) {
      if (topic.title && topic.title.includes(titlePart)) return topic;
    }
  }
  return null;
}

// ============================================================
// 1. EXPAND STATISTICS — add display types and distribution
// ============================================================

const statsCat = findCat('Statistics');
if (statsCat) {
  statsCat.topics.push({
    id: "CAT11-T03",
    title: "Data Displays — Stem-and-Leaf, Dot Plots, Histograms",
    concept_explanation: "Different data displays reveal different features of a dataset. Choosing the right display is key to understanding the data.",
    definitions: {
      "Stem-and-leaf plot": "Organises data by splitting each number into a 'stem' (leading digits) and 'leaf' (last digit). Shows individual values AND shape of distribution.",
      "Dot plot": "Each data point is a dot above a number line. Good for small datasets and spotting clusters/gaps.",
      "Histogram": "Bars represent frequency of data in ranges (bins). Unlike bar charts, bars touch because data is continuous.",
      "Box plot (box-and-whisker)": "Shows minimum, Q1, median, Q3, maximum. Good for comparing distributions."
    },
    key_rules: [
      "Stem-and-leaf: stems go in the left column (ascending), leaves in the right (ascending within each row)",
      "Back-to-back stem-and-leaf: two datasets share the same stems — useful for comparison",
      "Histogram bins must be equal width",
      "Box plot: the box contains the middle 50% of data (IQR = Q3 − Q1)"
    ],
    examples: [
      {
        question: "Data: 23, 25, 31, 35, 35, 38, 42, 44, 47. Create a stem-and-leaf plot and find the median.",
        solution_steps: [
          "Stems: 2, 3, 4",
          "2 | 3 5",
          "3 | 1 5 5 8",
          "4 | 2 4 7",
          "9 values → median = 5th value = 35"
        ],
        answer: "Median = 35",
        difficulty: 1
      },
      {
        question: "A histogram shows: 0-10 (freq 3), 10-20 (freq 7), 20-30 (freq 12), 30-40 (freq 5), 40-50 (freq 2). How many data points total? Which range is the mode?",
        options: ["29 total, mode range 20-30", "29 total, mode range 10-20", "27 total, mode range 20-30", "30 total, mode range 20-30"],
        solution_steps: ["Total = 3+7+12+5+2 = 29", "Highest frequency = 12 → mode range is 20-30"],
        answer: "29 total, mode range 20-30",
        difficulty: 2
      },
      {
        question: "Dataset A has median 50, Q1=35, Q3=65. Dataset B has median 48, Q1=42, Q3=56. Which dataset has more spread?",
        options: ["Dataset A (IQR=30)", "Dataset B (IQR=14)", "They're equal", "Cannot tell"],
        solution_steps: ["IQR(A) = 65−35 = 30", "IQR(B) = 56−42 = 14", "A has more spread (IQR 30 vs 14)"],
        answer: "Dataset A (IQR=30)",
        difficulty: 2
      }
    ],
    tips_and_tricks: [
      "Stem-and-leaf plots preserve ALL original data values — histograms don't",
      "For the exam: if asked to compare datasets, box plots are best",
      "Outlier rule: any value more than 1.5 × IQR below Q1 or above Q3",
      "Skewed right = long tail to the right = mean > median"
    ]
  });

  statsCat.topics.push({
    id: "CAT11-T04",
    title: "Distribution Shape — Skewness, Outliers & Spread",
    concept_explanation: "The shape of a data distribution tells you about the typical values and how spread out they are. Key shapes: symmetric, positively skewed, negatively skewed.",
    definitions: {
      "Symmetric": "Data is evenly distributed around the centre. Mean ≈ median. Bell-shaped.",
      "Positively skewed (right)": "Long tail extends to the RIGHT. Mean > median. Most values clustered left.",
      "Negatively skewed (left)": "Long tail extends to the LEFT. Mean < median. Most values clustered right.",
      "Outlier": "A data point far from the others. Can significantly affect the mean but not the median.",
      "Range": "Max − Min. Simple measure of spread.",
      "IQR": "Q3 − Q1. Measures spread of the middle 50% — not affected by outliers."
    },
    examples: [
      {
        question: "Test scores: 45, 67, 70, 72, 73, 74, 75, 78, 80. Is this distribution skewed? Which measure of centre is better?",
        solution_steps: [
          "Most scores cluster 67-80 with one low outlier (45)",
          "Mean = 70.4, Median = 73",
          "The low score pulls the mean down → negatively skewed",
          "Median (73) better represents the 'typical' student"
        ],
        answer: "Negatively skewed. Median is better.",
        difficulty: 2
      },
      {
        question: "House prices in a suburb: $350K, $380K, $400K, $420K, $450K, $2.1M. Which average should a real estate agent use to make the suburb look expensive? Which should a buyer use?",
        solution_steps: [
          "Mean = ($350K+$380K+$400K+$420K+$450K+$2100K)/6 = $683K",
          "Median = ($400K+$420K)/2 = $410K",
          "The $2.1M mansion is an outlier pulling the mean way up",
          "Agent uses mean ($683K) to look expensive",
          "Buyer uses median ($410K) for a realistic picture"
        ],
        answer: "Agent: mean ($683K). Buyer: median ($410K).",
        difficulty: 3
      }
    ],
    tips_and_tricks: [
      "If there's an outlier → use MEDIAN (not mean) as the centre measure",
      "Skew direction = direction of the LONG TAIL (not where most data sits)",
      "Exam trick: adding/removing an outlier — how does it change mean vs median?",
      "Range is sensitive to outliers. IQR is resistant to outliers."
    ]
  });

  // Expand probability topic
  const probTopic = findTopic("Probability");
  if (probTopic) {
    if (!probTopic.examples) probTopic.examples = [];
    probTopic.examples.push(
      {
        question: "Theoretical probability of rolling a 6 is 1/6. In 60 rolls, how many 6s would you expect? If you actually got 14, is this unusual?",
        solution_steps: [
          "Expected = 60 × 1/6 = 10",
          "Got 14, which is 4 more than expected",
          "With 60 trials, some variation is normal",
          "14 is a bit high but not extreme — experimental results vary"
        ],
        answer: "Expected: 10. Getting 14 is higher than expected but within normal variation for 60 trials.",
        difficulty: 2
      },
      {
        question: "A spinner has Red (50%), Blue (30%), Green (20%). In 200 spins, how many greens would you expect? What's the probability of NOT landing on red?",
        options: ["40 greens, P(not red) = 50%", "40 greens, P(not red) = 0.5", "20 greens, P(not red) = 0.5", "60 greens, P(not red) = 0.8"],
        solution_steps: [
          "Expected green = 200 × 0.20 = 40",
          "P(not red) = 1 − P(red) = 1 − 0.50 = 0.50 or 50%"
        ],
        answer: "40 greens, P(not red) = 50%",
        difficulty: 2
      }
    );
  }
}

// ============================================================
// 2. ENHANCED PROBLEM-SOLVING STRATEGIES
// ============================================================

const logicCat = findCat('Logic');
if (logicCat) {
  const psTopic = findTopic('Problem Solving Strategies');
  if (psTopic) {
    // Add comprehensive strategies if not already detailed
    if (!psTopic.strategies) {
      psTopic.strategies = [
        {
          name: "Draw a Diagram",
          when_to_use: "Geometry problems, distance problems, Venn diagrams, any problem with spatial relationships",
          steps: ["Read the problem", "Sketch the situation (even a rough diagram)", "Label all known values", "Identify what's missing", "Use the diagram to set up equations"],
          example: "Two ships leave port at the same time — draw a right triangle to use Pythagoras"
        },
        {
          name: "Work Backwards",
          when_to_use: "When you know the end result and need to find the starting value",
          steps: ["Start with the final answer", "Reverse each operation (+ becomes −, × becomes ÷)", "Work back step by step to the beginning"],
          example: "After a 20% discount and $5 cashback, the price was $35. What was the original? Start from $35, subtract $5 = $30, then $30 ÷ 0.80 = $37.50"
        },
        {
          name: "Guess and Check (with Table)",
          when_to_use: "When you can't easily set up an equation, or for multiple-choice where you can test options",
          steps: ["Make a reasonable first guess", "Check if it satisfies ALL conditions", "If too high, adjust down; if too low, adjust up", "Use a table to track guesses systematically"],
          example: "Two numbers add to 20 and multiply to 96. Guess: 10,10 → 100 (too high). Try 8,12 → 96 ✓"
        },
        {
          name: "Look for a Pattern",
          when_to_use: "Sequences, repeated operations, problems asking 'what comes next' or 'what's the 100th term'",
          steps: ["Write out the first few cases", "Calculate differences between consecutive terms", "If differences are constant → linear. If second differences are constant → quadratic", "Write the rule and verify"],
          example: "1, 4, 9, 16, 25... Differences: 3, 5, 7, 9. Second differences: 2, 2, 2. Pattern: n²"
        },
        {
          name: "Make it Simpler",
          when_to_use: "Complex problems with large numbers or many variables",
          steps: ["Replace large numbers with small ones", "Solve the simpler version", "Identify the method/pattern", "Apply the same method to the original problem"],
          example: "Find the sum of 1+2+3+...+100. Try small: 1+2+3 = 6 = 3×4/2. Pattern: n(n+1)/2 = 100×101/2 = 5050"
        },
        {
          name: "Eliminate Impossible Answers",
          when_to_use: "Multiple choice questions, especially when calculation is complex",
          steps: ["Estimate the approximate answer", "Check each option: is it the right order of magnitude?", "Is the sign correct? Are the units right?", "Does it pass a sanity check?"],
          example: "A rectangle 12m × 8m has area: A) 20 B) 96 C) 192 D) 960. Estimate: ~10×8=80. Only B (96) is close."
        }
      ];
    }

    // Add worked strategy examples
    if (!psTopic.examples) psTopic.examples = [];
    psTopic.examples.push(
      {
        question: "A farmer has chickens and cows. There are 30 animals and 86 legs total. How many chickens and how many cows?",
        solution_steps: [
          "Strategy: Set up simultaneous equations",
          "Let c = chickens, w = cows",
          "c + w = 30 (total animals)",
          "2c + 4w = 86 (total legs: chickens have 2, cows have 4)",
          "From equation 1: c = 30 − w",
          "Substitute: 2(30 − w) + 4w = 86",
          "60 − 2w + 4w = 86",
          "2w = 26 → w = 13 cows",
          "c = 30 − 13 = 17 chickens",
          "Check: 17×2 + 13×4 = 34 + 52 = 86 ✓"
        ],
        answer: "17 chickens and 13 cows",
        difficulty: 2
      },
      {
        question: "I think of a number, multiply by 3, add 7, divide by 2, and get 13. What was the number?",
        solution_steps: [
          "Strategy: Work backwards",
          "End: 13",
          "Undo 'divide by 2': 13 × 2 = 26",
          "Undo 'add 7': 26 − 7 = 19",
          "Undo 'multiply by 3': 19 ÷ 3 = 6.33...",
          "Hmm, not a whole number. Let me recheck: (n×3 + 7) ÷ 2 = 13",
          "n×3 + 7 = 26, n×3 = 19, n = 19/3",
          "Actually n = 19/3 ≈ 6.33. If the exam expects a whole number, reread the question."
        ],
        answer: "19/3 (or approximately 6.33)",
        difficulty: 2
      },
      {
        question: "How many squares are there on a standard 8×8 chessboard? (Not just 64!)",
        solution_steps: [
          "Strategy: Look for a pattern (start simple)",
          "1×1 board: 1 square",
          "2×2 board: 4 (1×1) + 1 (2×2) = 5",
          "3×3 board: 9 + 4 + 1 = 14",
          "Pattern: n² + (n-1)² + (n-2)² + ... + 1²",
          "8×8: 64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204"
        ],
        answer: "204 squares",
        difficulty: 3
      }
    );
  }

  // Add a new topic for quick identification
  logicCat.topics.push({
    id: "CAT13-T04",
    title: "Quick Problem Identification — What Strategy to Use",
    concept_explanation: "The first step in solving any problem is identifying WHAT TYPE of problem it is. This determines which strategy and formulas to use.",
    identification_cues: [
      "See '%' or 'increase/decrease by' → Percentages (multiply by 1±rate)",
      "See 'ratio' or ':' → Ratios (scale factor, sharing in ratio)",
      "See 'x' or 'unknown' or 'solve' → Algebra (form equation, solve)",
      "See 'triangle' + 'right angle' → Pythagoras or Trig",
      "See 'area', 'volume', 'perimeter' → Mensuration (pick the right formula)",
      "See 'average', 'mean', 'median' → Statistics",
      "See 'chance', 'probability', 'likely' → Probability",
      "See 'pattern', 'sequence', 'next term' → Sequences (find the rule)",
      "See 'graph', 'gradient', 'intercept' → Coordinate geometry",
      "See 'NOT', 'LEAST', 'EXCEPT' → Elimination (test each option)"
    ],
    key_rules: [
      "Read the WHOLE question before starting — the last sentence often tells you what to find",
      "Underline the KEY NUMBERS and the KEY QUESTION WORD",
      "If the question has multiple parts, answer them IN ORDER (earlier parts help later parts)",
      "For word problems: translate words to maths symbols first (total → +, product → ×, difference → −)",
      "For 'show that' questions: you MUST use the given information, not just state the answer"
    ],
    examples: [
      {
        question: "A rectangular pool is 12m long and 8m wide. A 1.5m-wide path surrounds it. Find the area of the path. What type of problem is this?",
        solution_steps: [
          "Identify: 'rectangular', 'area', 'path surrounds' → Composite area problem",
          "Strategy: Total area minus pool area",
          "Outer rectangle: (12+3) × (8+3) = 15 × 11 = 165 m²",
          "Inner (pool): 12 × 8 = 96 m²",
          "Path = 165 − 96 = 69 m²"
        ],
        answer: "69 m² (composite area problem — subtract inner from outer)",
        difficulty: 2
      },
      {
        question: "Quick identify — what strategy would you use? 'A shop marks up goods by 40% then offers a 25% discount. What is the actual percentage change?'",
        options: ["Algebra", "Percentage multiplication", "Trial and error", "Geometry"],
        solution_steps: [
          "See '% ... mark up ... % discount' → Chain percentage problem",
          "Strategy: Multiply factors. Start with 100.",
          "100 × 1.40 × 0.75 = 105 → 5% increase"
        ],
        answer: "Percentage multiplication — 5% increase overall",
        difficulty: 2
      }
    ],
    tips_and_tricks: [
      "The FIRST 10 seconds of reading determine whether you solve it in 30 seconds or waste 2 minutes",
      "If you can't identify the type in 15 seconds, skip it and come back",
      "Many hard questions are just two easy questions combined — break them into steps",
      "Draw a diagram for ANY geometry question, even if it seems unnecessary"
    ]
  });
}

// ============================================================
// WRITE
// ============================================================
writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');

let totalTopics = 0, totalExamples = 0;
for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    totalTopics++;
    totalExamples += (topic.examples || []).length;
  }
}
console.log(`Done. ${data.categories.length} categories, ${totalTopics} topics, ${totalExamples} examples.`);
