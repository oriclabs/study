/**
 * Patches math.json to add:
 * 1. Missing critical topics (Pythagoras, Transformations, Trig, Similarity/Congruence, etc.)
 * 2. Difficulty tiers on all examples (1=Foundation/Y8, 2=Standard/Y9, 3=Extension/Y10)
 * 3. More examples where topics have none
 *
 * Run: node tools/patch-math-notes.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/content/notes/vic-selective/math.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));

// ============================================================
// 1. ADD MISSING TOPICS
// ============================================================

// Find category by name
function findCat(name) {
  return data.categories.find(c => c.category && c.category.includes(name));
}

// --- CAT07: Add Pythagoras + Similarity/Congruence to "Geometry — Lines, Angles & Triangles" ---
const cat07 = findCat('Triangles');
if (cat07) {
  cat07.topics.push({
    id: "CAT07-T03",
    title: "Pythagoras' Theorem",
    concept_explanation: "In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c², where c is the hypotenuse (the longest side, opposite the right angle).",
    key_formulas: [
      "a² + b² = c² (find hypotenuse)",
      "a² = c² − b² (find a shorter side)",
      "Distance between two points: d = √[(x₂−x₁)² + (y₂−y₁)²]"
    ],
    identification_cues: [
      "Right-angled triangle with one unknown side",
      "Distance between two points on a grid",
      "Ladder leaning against a wall",
      "'Find the length of...' with a right angle shown"
    ],
    solving_steps: [
      "Identify the right angle and label sides (hypotenuse = longest side opposite right angle)",
      "Write a² + b² = c² with known values",
      "Solve for the unknown side",
      "Take the square root for the final answer",
      "Check: does the hypotenuse exceed each shorter side?"
    ],
    examples: [
      {
        question: "A right triangle has legs of 6 cm and 8 cm. Find the hypotenuse.",
        solution_steps: ["a² + b² = c²", "6² + 8² = c²", "36 + 64 = c²", "100 = c²", "c = √100 = 10 cm"],
        answer: "10 cm",
        difficulty: 1
      },
      {
        question: "A ladder 13 m long leans against a wall. The base is 5 m from the wall. How high does it reach?",
        solution_steps: ["5² + h² = 13²", "25 + h² = 169", "h² = 144", "h = √144 = 12 m"],
        answer: "12 m",
        difficulty: 1
      },
      {
        question: "Find the distance between points A(1, 3) and B(7, 11).",
        solution_steps: ["d = √[(7−1)² + (11−3)²]", "d = √[6² + 8²]", "d = √[36 + 64]", "d = √100 = 10"],
        answer: "10 units",
        difficulty: 2
      },
      {
        question: "A rectangular field is 48 m by 36 m. What is the length of the diagonal?",
        solution_steps: ["d² = 48² + 36²", "d² = 2304 + 1296", "d² = 3600", "d = √3600 = 60 m"],
        answer: "60 m",
        difficulty: 2
      },
      {
        question: "Two ships leave port: one sails 24 km north, the other 32 km east. How far apart are they?",
        solution_steps: ["They form a right angle at the port", "d² = 24² + 32²", "d² = 576 + 1024 = 1600", "d = √1600 = 40 km"],
        answer: "40 km",
        difficulty: 2
      },
      {
        question: "In triangle PQR, PQ = 15 cm, QR = 9 cm, and angle Q = 90°. Find PR and the area of the triangle.",
        solution_steps: ["PR² = PQ² + QR² (Pythagoras, as Q is the right angle... wait, recheck: Q=90° means PQ and QR are the legs)", "Actually: PR² = 15² + 9² — No. PQ=15 is a leg, QR=9 is a leg. PR is hypotenuse.", "PR² = 15² + 9² = 225 + 81 = 306", "PR = √306 ≈ 17.49 cm", "Area = ½ × 15 × 9 = 67.5 cm²"],
        answer: "PR ≈ 17.5 cm, Area = 67.5 cm²",
        difficulty: 3
      }
    ],
    pythagorean_triples: [
      "3, 4, 5 (and multiples: 6,8,10 / 9,12,15 / 15,20,25)",
      "5, 12, 13 (and multiples: 10,24,26)",
      "8, 15, 17",
      "7, 24, 25"
    ],
    tips_and_tricks: [
      "Memorise Pythagorean triples — they appear constantly: 3-4-5, 5-12-13, 8-15-17",
      "Always check which side is the hypotenuse (longest, opposite right angle)",
      "If the answer isn't a whole number, leave as a surd (√) unless told otherwise",
      "For 3D problems, apply Pythagoras twice: once for the base diagonal, once for the space diagonal"
    ]
  });

  cat07.topics.push({
    id: "CAT07-T04",
    title: "Similarity & Congruence",
    concept_explanation: "Congruent shapes are identical (same size and shape). Similar shapes have the same shape but different sizes — corresponding angles are equal and corresponding sides are in proportion.",
    congruence_conditions: {
      "SSS": "Three pairs of equal sides",
      "SAS": "Two pairs of equal sides with the included angle equal",
      "AAS": "Two pairs of equal angles with a corresponding side equal",
      "RHS": "Right angle, hypotenuse, and one other side equal"
    },
    similarity_conditions: {
      "AA": "Two pairs of equal angles (third is automatic)",
      "SSS ratio": "All three pairs of sides in the same ratio",
      "SAS ratio": "Two pairs of sides in the same ratio with included angle equal"
    },
    key_formulas: [
      "Scale factor (k) = corresponding side of image ÷ corresponding side of original",
      "If lengths scale by k, then areas scale by k², volumes by k³"
    ],
    solving_steps: [
      "Identify corresponding vertices/sides by matching angles or given information",
      "For congruence: check if one of SSS/SAS/AAS/RHS is satisfied",
      "For similarity: find the scale factor from known corresponding sides",
      "Use the scale factor to find unknown sides: unknown = known × k",
      "For area/volume: square/cube the scale factor"
    ],
    examples: [
      {
        question: "Two triangles have sides 3,4,5 and 6,8,10. Are they similar? What is the scale factor?",
        solution_steps: ["6/3 = 2, 8/4 = 2, 10/5 = 2", "All ratios equal → similar (SSS ratio)", "Scale factor = 2"],
        answer: "Yes, similar. Scale factor = 2",
        difficulty: 1
      },
      {
        question: "A flagpole casts a 12 m shadow. A 1.5 m stick casts a 2 m shadow at the same time. Find the height of the flagpole.",
        solution_steps: ["Similar triangles (same sun angle)", "height/shadow = 1.5/2", "h/12 = 1.5/2", "h = 12 × 1.5/2 = 9 m"],
        answer: "9 m",
        difficulty: 2
      },
      {
        question: "Two similar containers have heights 10 cm and 25 cm. The smaller holds 400 mL. What does the larger hold?",
        solution_steps: ["Scale factor k = 25/10 = 2.5", "Volume scales by k³", "Volume = 400 × 2.5³", "= 400 × 15.625 = 6250 mL"],
        answer: "6250 mL (6.25 L)",
        difficulty: 3
      }
    ],
    tips_and_tricks: [
      "In similar triangles, always match corresponding sides carefully — draw them separately if needed",
      "Scale factor for area = k², for volume = k³ — this catches many students out",
      "Shadow problems and map/model questions always use similarity",
      "If two angles of a triangle match, the triangles are similar (AA) — you don't need all three"
    ]
  });
}

// --- NEW CATEGORY: Transformations ---
data.categories.splice(9, 0, {
  category: "Transformations & Symmetry",
  topics: [
    {
      id: "CAT-TRANS-T01",
      title: "Transformations — Reflection, Rotation, Translation",
      concept_explanation: "A transformation changes the position, size, or orientation of a shape. The three rigid transformations (size stays the same) are: reflection (flip), rotation (turn), and translation (slide).",
      definitions: {
        "Translation": "Slides every point the same distance in the same direction. Described by a vector, e.g. (3, −2) means 3 right and 2 down.",
        "Reflection": "Flips the shape across a mirror line. Each point is the same distance from the line on the opposite side.",
        "Rotation": "Turns the shape around a fixed centre point by a given angle and direction (clockwise or anticlockwise).",
        "Dilation (Enlargement)": "Scales the shape from a centre point by a scale factor. Factor > 1 enlarges, 0 < factor < 1 shrinks."
      },
      identification_cues: [
        "Shape has moved position but looks identical → translation",
        "Shape is 'flipped' (mirror image, letters reversed) → reflection",
        "Shape is 'turned' around a point → rotation",
        "Shape is bigger/smaller but same proportions → dilation"
      ],
      key_rules: [
        "Reflection in x-axis: (x, y) → (x, −y)",
        "Reflection in y-axis: (x, y) → (−x, y)",
        "Reflection in y = x: (x, y) → (y, x)",
        "Rotation 90° clockwise about origin: (x, y) → (y, −x)",
        "Rotation 90° anticlockwise about origin: (x, y) → (−y, x)",
        "Rotation 180° about origin: (x, y) → (−x, −y)",
        "Translation by (a, b): (x, y) → (x+a, y+b)"
      ],
      examples: [
        {
          question: "Point A(3, 5) is reflected in the x-axis. What are the coordinates of A'?",
          solution_steps: ["Reflection in x-axis: (x, y) → (x, −y)", "A(3, 5) → A'(3, −5)"],
          answer: "A'(3, −5)",
          difficulty: 1
        },
        {
          question: "Triangle with vertices (1,1), (4,1), (1,3) is translated by vector (−2, 5). Find the new vertices.",
          solution_steps: ["Add (−2, 5) to each vertex:", "(1,1) → (−1, 6)", "(4,1) → (2, 6)", "(1,3) → (−1, 8)"],
          answer: "(−1, 6), (2, 6), (−1, 8)",
          difficulty: 1
        },
        {
          question: "Point B(2, 3) is rotated 90° clockwise about the origin. Find B'.",
          solution_steps: ["90° clockwise rule: (x, y) → (y, −x)", "B(2, 3) → B'(3, −2)"],
          answer: "B'(3, −2)",
          difficulty: 2
        },
        {
          question: "A shape is reflected in the line y = x, then translated by (3, 0). Point P(2, 5) is on the original. Where does it end up?",
          solution_steps: ["Reflect in y = x: (2, 5) → (5, 2)", "Translate by (3, 0): (5, 2) → (8, 2)"],
          answer: "(8, 2)",
          difficulty: 3
        },
        {
          question: "Describe fully the single transformation that maps triangle A(1,1), B(3,1), C(1,4) onto A'(−1,−1), B'(−3,−1), C'(−1,−4).",
          solution_steps: ["Each coordinate is negated: (x,y) → (−x,−y)", "This is a rotation of 180° about the origin"],
          answer: "Rotation 180° about the origin",
          difficulty: 3
        }
      ],
      tips_and_tricks: [
        "For reflection: fold the paper along the mirror line — the shape should land on its image",
        "For rotation: use tracing paper mentally — pin at the centre and turn",
        "Memorise the coordinate rules for reflections and rotations about the origin",
        "Combined transformations: apply in order, step by step — don't try to do them all at once"
      ]
    },
    {
      id: "CAT-TRANS-T02",
      title: "Scale Drawings & Maps",
      concept_explanation: "A scale drawing represents a real object with all lengths reduced or enlarged by the same ratio. The scale tells you the ratio between the drawing and reality.",
      key_formulas: [
        "Real length = drawing length × scale factor",
        "Drawing length = real length ÷ scale factor",
        "Real area = drawing area × (scale factor)²"
      ],
      examples: [
        {
          question: "A map has scale 1:50000. Two towns are 8 cm apart on the map. What is the real distance?",
          solution_steps: ["Real = 8 cm × 50000", "= 400000 cm", "= 4000 m = 4 km"],
          answer: "4 km",
          difficulty: 1
        },
        {
          question: "A building is 45 m tall. On a scale drawing at 1:500, how tall is it?",
          solution_steps: ["Drawing = 45 m ÷ 500", "= 4500 cm ÷ 500 = 9 cm"],
          answer: "9 cm",
          difficulty: 2
        },
        {
          question: "On a 1:200 plan, a room measures 4 cm by 3 cm. What is the real floor area?",
          solution_steps: ["Real length = 4 × 200 = 800 cm = 8 m", "Real width = 3 × 200 = 600 cm = 6 m", "Area = 8 × 6 = 48 m²"],
          answer: "48 m²",
          difficulty: 2
        }
      ],
      tips_and_tricks: [
        "Always convert to the same units before calculating",
        "For area, square the scale factor; for volume, cube it",
        "Common map scales: 1:50000 means 1 cm = 500 m = 0.5 km"
      ]
    }
  ]
});

// --- NEW CATEGORY: Trigonometry ---
data.categories.splice(10, 0, {
  category: "Trigonometry",
  topics: [
    {
      id: "CAT-TRIG-T01",
      title: "Trigonometric Ratios — sin, cos, tan",
      concept_explanation: "In a right-angled triangle, the trigonometric ratios relate the angles to the sides. SOH-CAH-TOA is the mnemonic: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent.",
      key_formulas: [
        "sin θ = Opposite / Hypotenuse",
        "cos θ = Adjacent / Hypotenuse",
        "tan θ = Opposite / Adjacent",
        "Mnemonic: SOH-CAH-TOA"
      ],
      identification_cues: [
        "Right-angled triangle with an angle and one side given — find another side",
        "Right-angled triangle with two sides given — find an angle",
        "'Angle of elevation' or 'angle of depression' problems",
        "Any triangle problem where Pythagoras alone isn't enough (you have an angle, not just sides)"
      ],
      solving_steps: [
        "Label the sides relative to the given angle: Opposite (O), Adjacent (A), Hypotenuse (H)",
        "Choose the right ratio based on which sides you know/need: SOH, CAH, or TOA",
        "Substitute known values into the formula",
        "Solve for the unknown (rearrange if needed)",
        "For finding an angle: use inverse functions (sin⁻¹, cos⁻¹, tan⁻¹)"
      ],
      key_angles: [
        { angle: "30°", sin: "0.5", cos: "0.866", tan: "0.577" },
        { angle: "45°", sin: "0.707", cos: "0.707", tan: "1" },
        { angle: "60°", sin: "0.866", cos: "0.5", tan: "1.732" }
      ],
      examples: [
        {
          question: "A right triangle has hypotenuse 10 cm and an angle of 30°. Find the side opposite the 30° angle.",
          solution_steps: ["sin 30° = Opposite / Hypotenuse", "0.5 = O / 10", "O = 10 × 0.5 = 5 cm"],
          answer: "5 cm",
          difficulty: 1
        },
        {
          question: "A ladder makes a 65° angle with the ground. The base is 3 m from the wall. How long is the ladder?",
          solution_steps: ["cos 65° = Adjacent / Hypotenuse", "cos 65° = 3 / H", "H = 3 / cos 65°", "H = 3 / 0.4226 ≈ 7.1 m"],
          answer: "≈ 7.1 m",
          difficulty: 2
        },
        {
          question: "From a point 50 m from a building, the angle of elevation to the roof is 40°. How tall is the building?",
          solution_steps: ["tan 40° = Opposite / Adjacent", "tan 40° = h / 50", "h = 50 × tan 40°", "h = 50 × 0.8391 ≈ 42.0 m"],
          answer: "≈ 42 m",
          difficulty: 2
        },
        {
          question: "In a right triangle, the two shorter sides are 7 cm and 10 cm. Find all angles.",
          solution_steps: [
            "tan θ = 7/10 = 0.7",
            "θ = tan⁻¹(0.7) ≈ 35.0°",
            "Other angle = 90° − 35.0° = 55.0°",
            "Angles: 35°, 55°, 90°"
          ],
          answer: "35°, 55°, 90°",
          difficulty: 2
        },
        {
          question: "A plane flies 200 km on a bearing of 040°. How far north and how far east has it travelled?",
          solution_steps: [
            "North = 200 × cos 40° = 200 × 0.766 ≈ 153.2 km",
            "East = 200 × sin 40° = 200 × 0.643 ≈ 128.6 km"
          ],
          answer: "≈ 153 km north, ≈ 129 km east",
          difficulty: 3
        },
        {
          question: "A kite string is 80 m long, making a 55° angle with the ground. A bird sits on the string 50 m from the person. How high is the bird?",
          solution_steps: [
            "The bird is 50 m along the string at 55° to ground",
            "Height = 50 × sin 55°",
            "= 50 × 0.8192 ≈ 41.0 m"
          ],
          answer: "≈ 41 m",
          difficulty: 3
        }
      ],
      tips_and_tricks: [
        "SOH-CAH-TOA — say it, memorise it, use it every time",
        "Label O, A, H FIRST before choosing a formula",
        "The hypotenuse is ALWAYS the longest side and ALWAYS opposite the right angle",
        "For bearings: north = adjacent (cos), east = opposite (sin) when measured from north",
        "Memorise sin 30° = 0.5, cos 60° = 0.5, tan 45° = 1 — they appear frequently",
        "Angle of elevation = looking UP, angle of depression = looking DOWN (they're alternate angles, so equal)"
      ]
    },
    {
      id: "CAT-TRIG-T02",
      title: "Estimation & Approximation",
      concept_explanation: "Estimation is checking whether an answer is reasonable before or after calculating. Rounding, mental arithmetic, and order-of-magnitude checks catch many careless errors in exams.",
      solving_steps: [
        "Round each number to 1 significant figure",
        "Do the calculation mentally with rounded numbers",
        "Compare with your exact answer — if they're wildly different, recheck",
        "For multiple choice: estimate first, then eliminate impossible options"
      ],
      examples: [
        {
          question: "Estimate 389 × 21",
          solution_steps: ["≈ 400 × 20 = 8000", "Exact: 389 × 21 = 8169", "Estimate is close ✓"],
          answer: "≈ 8000",
          difficulty: 1
        },
        {
          question: "A circle has radius 4.8 cm. Estimate the area.",
          solution_steps: ["A ≈ π × 5² ≈ 3 × 25 = 75 cm²", "Exact: π × 4.8² = 72.4 cm²"],
          answer: "≈ 75 cm²",
          difficulty: 2
        },
        {
          question: "Without a calculator, estimate √(48.7)",
          solution_steps: ["√49 = 7, √48 is just under 7", "48.7 is between 48 and 49, closer to 49", "≈ 6.98, so roughly 7"],
          answer: "≈ 7",
          difficulty: 2
        }
      ],
      tips_and_tricks: [
        "ALWAYS estimate before calculating — it catches sign errors, decimal place errors, and formula mix-ups",
        "For multiple choice: estimate → eliminate → then calculate precisely if needed",
        "Round to 1 significant figure for quick mental maths",
        "Know your squares (1-15), cubes (1-10), and fraction-decimal equivalents by heart"
      ]
    }
  ]
});

// ============================================================
// 2. ADD DIFFICULTY TO ALL EXISTING EXAMPLES
// ============================================================

// Heuristic: assign difficulty based on solution_steps count and content
function assignDifficulty(example, topicTitle) {
  if (example.difficulty) return; // already has one

  const steps = example.solution_steps || [];
  const q = (example.question || '').toLowerCase();

  // Extension indicators
  if (q.includes('prove') || q.includes('show that') || q.includes('hence') || steps.length >= 6) {
    example.difficulty = 3;
    return;
  }

  // Standard indicators
  if (steps.length >= 3 || q.includes('word problem') || q.includes('how many') ||
      q.includes('how much') || q.includes('how long') || q.includes('how far') ||
      q.includes('find the equation') || q.includes('simultaneous')) {
    example.difficulty = 2;
    return;
  }

  // Foundation
  example.difficulty = 1;
}

// Walk all topics and tag examples
for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    // Tag examples
    if (topic.examples) {
      for (const ex of topic.examples) {
        assignDifficulty(ex, topic.title);
      }
    }
    // Tag problem_types examples too
    if (topic.problem_types) {
      for (const pt of topic.problem_types) {
        if (pt.question && pt.answer) {
          assignDifficulty(pt, topic.title);
        }
      }
    }
  }
}

// ============================================================
// 3. ADD EXAMPLES WHERE TOPICS HAVE NONE
// ============================================================

// Helper to find topic by title substring
function findTopic(titlePart) {
  for (const cat of data.categories) {
    for (const topic of (cat.topics || [])) {
      if (topic.title && topic.title.includes(titlePart)) return topic;
    }
  }
  return null;
}

// Add examples to topics that are formula-only
const patches = [
  {
    topic: "Perimeter & Circumference",
    examples: [
      { question: "Find the perimeter of a rectangle 12 cm by 7 cm.", solution_steps: ["P = 2(l + w)", "P = 2(12 + 7) = 2 × 19 = 38 cm"], answer: "38 cm", difficulty: 1 },
      { question: "A semicircular arch has diameter 14 m. Find the perimeter of the arch (straight edge + curved edge).", solution_steps: ["Curved edge = ½ × π × 14 = 7π ≈ 22 m", "Straight edge = 14 m", "Total = 14 + 22 = 36 m"], answer: "≈ 36 m", difficulty: 2 },
    ]
  },
  {
    topic: "Quadrilaterals",
    examples: [
      { question: "A parallelogram has base 15 cm and height 8 cm. Find the area.", solution_steps: ["A = base × height", "A = 15 × 8 = 120 cm²"], answer: "120 cm²", difficulty: 1 },
      { question: "A trapezium has parallel sides 10 cm and 16 cm, and height 7 cm. Find the area.", solution_steps: ["A = ½(a + b) × h", "A = ½(10 + 16) × 7", "A = ½ × 26 × 7 = 91 cm²"], answer: "91 cm²", difficulty: 2 },
    ]
  },
  {
    topic: "Probability",
    examples: [
      { question: "A bag has 5 red and 3 blue balls. One is drawn. P(red)?", solution_steps: ["P(red) = 5/(5+3) = 5/8"], answer: "5/8", difficulty: 1 },
      { question: "Two dice are rolled. What is the probability the sum is 7?", solution_steps: ["Possible combinations summing to 7: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) = 6", "Total outcomes = 36", "P = 6/36 = 1/6"], answer: "1/6", difficulty: 2 },
      { question: "A bag has 4 red, 3 blue balls. Two are drawn without replacement. P(both red)?", solution_steps: ["P(1st red) = 4/7", "P(2nd red|1st red) = 3/6 = 1/2", "P(both) = 4/7 × 1/2 = 4/14 = 2/7"], answer: "2/7", difficulty: 3 },
    ]
  },
  {
    topic: "Linear Equations",
    examples: [
      { question: "Solve: 3x + 7 = 22", solution_steps: ["3x = 22 − 7 = 15", "x = 15/3 = 5"], answer: "x = 5", difficulty: 1 },
      { question: "Solve: 5(2x − 3) = 3(x + 4)", solution_steps: ["10x − 15 = 3x + 12", "10x − 3x = 12 + 15", "7x = 27", "x = 27/7 ≈ 3.86"], answer: "x = 27/7", difficulty: 2 },
    ]
  },
  {
    topic: "Quadratic Equations",
    examples: [
      { question: "Solve: x² − 9 = 0", solution_steps: ["x² = 9", "x = ±3"], answer: "x = 3 or x = −3", difficulty: 1 },
      { question: "Solve by factoring: x² + 5x + 6 = 0", solution_steps: ["Find two numbers: multiply to 6, add to 5 → 2 and 3", "(x + 2)(x + 3) = 0", "x = −2 or x = −3"], answer: "x = −2 or x = −3", difficulty: 2 },
      { question: "Solve: 2x² − 7x + 3 = 0", solution_steps: ["Using quadratic formula: a=2, b=−7, c=3", "D = 49 − 24 = 25", "x = (7 ± 5)/4", "x = 3 or x = 0.5"], answer: "x = 3 or x = 0.5", difficulty: 3 },
    ]
  },
  {
    topic: "Algebraic Expressions",
    examples: [
      { question: "Expand: 3(2x + 5)", solution_steps: ["= 3 × 2x + 3 × 5", "= 6x + 15"], answer: "6x + 15", difficulty: 1 },
      { question: "Factorise: x² + 7x + 12", solution_steps: ["Find two numbers: multiply to 12, add to 7 → 3 and 4", "= (x + 3)(x + 4)"], answer: "(x + 3)(x + 4)", difficulty: 2 },
      { question: "Expand and simplify: (2x + 3)(x − 4) − (x + 1)(x − 2)", solution_steps: ["(2x+3)(x−4) = 2x² − 8x + 3x − 12 = 2x² − 5x − 12", "(x+1)(x−2) = x² − 2x + x − 2 = x² − x − 2", "Subtract: 2x² − 5x − 12 − x² + x + 2", "= x² − 4x − 10"], answer: "x² − 4x − 10", difficulty: 3 },
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

// ============================================================
// WRITE
// ============================================================
writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');

// Stats
let totalTopics = 0, totalExamples = 0, withDifficulty = 0;
for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    totalTopics++;
    if (topic.examples) {
      for (const ex of topic.examples) {
        totalExamples++;
        if (ex.difficulty) withDifficulty++;
      }
    }
  }
}
console.log(`Done. ${data.categories.length} categories, ${totalTopics} topics, ${totalExamples} examples (${withDifficulty} with difficulty tags).`);
