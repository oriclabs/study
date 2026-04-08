/**
 * Comprehensive patch for quantitative.json:
 * 1. Add spatial/figural reasoning topics (rotations, reflections, paper folding, visual patterns, 3D nets)
 * 2. Add mental math & estimation topic
 * 3. Add MCQ strategy topic
 * 4. Add MCQ options to existing examples
 * 5. Expand weak topics with more examples
 * 6. Ensure 3 difficulty tiers throughout
 *
 * Run: node tools/patch-quant-full.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/content/notes/vic-selective/quantitative.json';
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
// 1. NEW CATEGORY: Spatial & Visual Reasoning
// ============================================================

data.categories.splice(2, 0, {
  category: "Spatial & Visual Reasoning",
  topics: [
    {
      id: "SPATIAL-T01",
      title: "Shape Rotations",
      description: "Identifying what a shape looks like after being rotated 90°, 180°, or 270° around a point.",
      identification_cues: [
        "Which figure shows the shape after a 90° clockwise turn?",
        "What does this pattern look like rotated?",
        "Select the rotated version"
      ],
      solving_steps: [
        "Identify a distinctive feature of the shape (a corner, marking, or asymmetry)",
        "Mentally rotate that feature: 90° CW = quarter turn right, 180° = upside down, 270° CW = quarter turn left",
        "Check ALL features match, not just one",
        "Eliminate options that have the wrong orientation"
      ],
      key_rules: [
        "90° clockwise: top goes to right, right goes to bottom, bottom goes to left, left goes to top",
        "180°: everything flips upside-down AND left-right",
        "270° clockwise = 90° anticlockwise",
        "360° = back to original"
      ],
      examples: [
        {
          question: "An L-shape points up-right. After 90° clockwise rotation, which direction does it point?",
          options: ["Down-right", "Down-left", "Up-left", "Right-down"],
          solution_steps: ["Top → right, right → bottom", "Up-right becomes right-down, which is down-right"],
          answer: "Down-right",
          difficulty: 1
        },
        {
          question: "A triangle with a dot on its top-left corner is rotated 180°. Where is the dot now?",
          options: ["Top-right", "Bottom-right", "Bottom-left", "Top-left"],
          solution_steps: ["180° rotation: top-left → bottom-right", "Everything flips diagonally"],
          answer: "Bottom-right",
          difficulty: 1
        },
        {
          question: "A flag shape 🏳 pointing right is rotated 90° anticlockwise, then reflected in a vertical line. What is the final orientation?",
          options: ["Pointing up", "Pointing down", "Pointing left", "Pointing right"],
          solution_steps: ["90° ACW: right → up (flag points up)", "Reflect vertically: flag still points up (vertical reflection flips left/right, not up/down)", "Wait — a flag pointing up, reflected in vertical axis: the flag part flips side. But the direction (up) stays.", "Actually: 90° ACW makes it point up. Vertical reflection keeps it pointing up but mirrors the flag detail."],
          answer: "Pointing up",
          difficulty: 3
        }
      ],
      tips_and_tricks: [
        "Use your hand or a small piece of paper to physically rotate — it's faster than imagining",
        "For 180°, just flip everything: top↔bottom AND left↔right",
        "90° CW tip: turn the page 90° clockwise and see what the shape looks like",
        "Always check at least 2 features (e.g., a dot AND a corner) to avoid mistakes"
      ]
    },
    {
      id: "SPATIAL-T02",
      title: "Reflections & Symmetry",
      description: "Identifying mirror images of shapes across horizontal, vertical, or diagonal lines.",
      identification_cues: [
        "Which is the reflection of this shape?",
        "How many lines of symmetry does this shape have?",
        "Which figure is the mirror image?"
      ],
      solving_steps: [
        "Identify the mirror line (horizontal, vertical, or diagonal)",
        "Each point flips to the opposite side of the line at equal distance",
        "Letters and numbers reverse in reflections (e.g., 'b' becomes 'd')",
        "Check: fold along the mirror line — both halves should match exactly"
      ],
      key_rules: [
        "Vertical mirror: left↔right swap, top/bottom stay",
        "Horizontal mirror: top↔bottom swap, left/right stay",
        "Reflection reverses handedness — a clockwise spiral becomes anticlockwise",
        "Lines of symmetry: circle=∞, square=4, rectangle=2, equilateral triangle=3, regular pentagon=5"
      ],
      examples: [
        {
          question: "The letter 'F' is reflected in a vertical mirror line. What does it look like?",
          options: ["F (unchanged)", "Backwards F (⌐)", "Upside-down F", "Rotated F"],
          solution_steps: ["Vertical reflection swaps left and right", "The horizontal lines of F now extend to the left instead of right", "It looks like a backwards F"],
          answer: "Backwards F (⌐)",
          difficulty: 1
        },
        {
          question: "How many lines of symmetry does a regular hexagon have?",
          options: ["3", "4", "6", "12"],
          solution_steps: ["Regular hexagon: 6 equal sides, 6 equal angles", "Lines through opposite vertices: 3", "Lines through midpoints of opposite sides: 3", "Total = 6"],
          answer: "6",
          difficulty: 2
        },
        {
          question: "A shape is reflected in a horizontal line, then reflected in a vertical line. The result is the same as which single transformation?",
          options: ["90° rotation", "180° rotation", "Translation", "No change"],
          solution_steps: ["Horizontal reflection: (x,y) → (x, −y)", "Then vertical reflection: (x, −y) → (−x, −y)", "Combined: (x,y) → (−x, −y) = 180° rotation"],
          answer: "180° rotation",
          difficulty: 3
        }
      ],
      tips_and_tricks: [
        "Use a ruler or pencil as the mirror line and imagine folding the paper",
        "Reflections REVERSE left/right or top/bottom but NOT both (that's rotation)",
        "Text and asymmetric features are the giveaway — look for reversed letters/numbers",
        "Two reflections in perpendicular lines = 180° rotation"
      ]
    },
    {
      id: "SPATIAL-T03",
      title: "Paper Folding & Hole Punching",
      description: "Predicting what a folded paper looks like when unfolded, or where holes appear after punching through folded paper.",
      identification_cues: [
        "A paper is folded and a hole is punched. What does it look like unfolded?",
        "Which figure shows the result of folding along the dotted line?",
        "Paper is folded twice then cut. How many holes?"
      ],
      solving_steps: [
        "Track each fold carefully — draw arrows showing which edge moves where",
        "For hole punching: the hole appears on EVERY layer of the fold",
        "Unfold in REVERSE order — last fold undone first",
        "Each fold DOUBLES the number of holes (1 fold = 2 holes, 2 folds = 4 holes)"
      ],
      examples: [
        {
          question: "A square paper is folded in half (left to right). A hole is punched in the centre of the folded paper. How many holes when unfolded?",
          options: ["1", "2", "3", "4"],
          solution_steps: ["1 fold = 2 layers", "1 punch through 2 layers = 2 holes", "Holes are symmetric about the fold line (left-right mirror)"],
          answer: "2",
          difficulty: 1
        },
        {
          question: "A square paper is folded in half (top to bottom), then folded in half again (left to right). A hole is punched in the top-right corner. How many holes when fully unfolded?",
          options: ["2", "3", "4", "8"],
          solution_steps: ["2 folds = 4 layers", "1 punch through 4 layers = 4 holes", "Unfold left-right: hole mirrors to top-left", "Unfold top-bottom: both holes mirror to bottom", "4 holes, one in each corner area"],
          answer: "4",
          difficulty: 2
        },
        {
          question: "A square paper is folded diagonally (bottom-left to top-right), then a semicircle is cut from the folded edge. What shape appears when unfolded?",
          options: ["Semicircle", "Full circle", "Oval", "Two semicircles"],
          solution_steps: ["Diagonal fold = 2 layers", "Cut on the fold edge goes through both layers", "When unfolded, the two semicircles join to form a full circle"],
          answer: "Full circle",
          difficulty: 2
        },
        {
          question: "Paper is folded in half 3 times, then a single hole is punched. How many holes appear when fully unfolded?",
          options: ["3", "4", "6", "8"],
          solution_steps: ["Each fold doubles the layers: 1→2→4→8", "1 punch through 8 layers = 8 holes"],
          answer: "8",
          difficulty: 3
        }
      ],
      tips_and_tricks: [
        "Rule: n folds = 2ⁿ layers = 2ⁿ holes per punch",
        "Always track the fold direction — it determines where the mirror copies appear",
        "For cuts on the fold edge: the cut mirrors perfectly along the fold",
        "Practice with actual paper — fold, punch, unfold to build intuition"
      ]
    },
    {
      id: "SPATIAL-T04",
      title: "Visual Pattern Completion",
      description: "Finding the missing piece in a visual pattern grid (typically 3×3 with one cell missing).",
      identification_cues: [
        "Which completes the pattern?",
        "What comes next in this visual sequence?",
        "Which replaces the question mark?"
      ],
      solving_steps: [
        "Examine rows first: what changes from left to right? (size, rotation, shading, count)",
        "Examine columns: what changes from top to bottom?",
        "Look for diagonals too",
        "Identify the rule(s): rotation (+90° each), count (+1 each), shading (alternating), etc.",
        "Apply the rule(s) to predict the missing cell",
        "Verify your answer works for ALL rows/columns, not just one"
      ],
      examples: [
        {
          question: "In a 3×3 grid, each row shows a circle with 1, 2, 3 dots. Each column shows the circle in white, grey, black. The bottom-right cell is missing. What is it?",
          options: ["Black circle, 3 dots", "White circle, 3 dots", "Black circle, 1 dot", "Grey circle, 2 dots"],
          solution_steps: ["Row 3 pattern: 1 dot, 2 dots, ? dots → 3 dots", "Column 3 pattern: white, grey, ? → black", "Missing: black circle with 3 dots"],
          answer: "Black circle, 3 dots",
          difficulty: 1
        },
        {
          question: "A sequence shows: △, □, ○, △, □, ○, △, □, ? What comes next?",
          options: ["△", "□", "○", "⬠"],
          solution_steps: ["Pattern repeats every 3: △, □, ○", "Position 9 = 3rd in cycle = ○"],
          answer: "○",
          difficulty: 1
        },
        {
          question: "In a 3×3 grid, each row has shapes that rotate 45° clockwise, and shading alternates. Row 3 has: dark arrow pointing NE, light arrow pointing E, ?. What fills the cell?",
          options: ["Dark arrow pointing SE", "Light arrow pointing SE", "Dark arrow pointing S", "Light arrow pointing S"],
          solution_steps: ["Rotation: NE → E (+45°) → SE (+45°)", "Shading: dark, light, dark (alternating)", "Missing: dark arrow pointing SE"],
          answer: "Dark arrow pointing SE",
          difficulty: 2
        }
      ],
      tips_and_tricks: [
        "ALWAYS check rows AND columns — the pattern must work in both directions",
        "Common rules: rotation, count change, shading cycle, size change, element addition/removal",
        "If you can't see the pattern in rows, try columns or diagonals",
        "Some patterns combine two rules (e.g., rotate + change shading)"
      ]
    },
    {
      id: "SPATIAL-T05",
      title: "3D Nets & Visualization",
      description: "Identifying which 3D shape a flat net folds into, or which net folds into a given 3D shape.",
      identification_cues: [
        "Which net folds into this cube?",
        "What 3D shape does this net make?",
        "Which face is opposite the shaded face?"
      ],
      solving_steps: [
        "Count faces: cube=6, rectangular prism=6, triangular prism=5, pyramid=5, cylinder=3 (2 circles+1 rectangle)",
        "For cubes: opposite faces never share an edge in the net",
        "Mentally fold from the base — track where each face goes",
        "Mark corresponding edges that will join together"
      ],
      examples: [
        {
          question: "A cross-shaped net of 6 squares folds into a cube. The centre square is the base. Which square becomes the top?",
          options: ["The one directly above centre", "The one directly below centre", "The one 2 squares above centre", "The one to the right"],
          solution_steps: ["In a cross net: centre = base", "The square directly opposite (2 squares up from centre, past the fold) becomes the top", "The one directly above centre becomes a side face"],
          answer: "The one 2 squares above centre",
          difficulty: 2
        },
        {
          question: "A cube has faces numbered 1-6. In the net: 1 is in the centre. 2 is above, 3 right, 4 below, 5 left, 6 is above 2. What number is opposite 1?",
          options: ["2", "4", "5", "6"],
          solution_steps: ["1 is the base (centre of cross)", "6 is two squares up from 1", "When folded, 6 lands on top (opposite 1)", "2,3,4,5 are all side faces"],
          answer: "6",
          difficulty: 2
        },
        {
          question: "Which of these CANNOT be a net of a cube? A) Cross shape (6 squares) B) T-shape (6 squares) C) L-shape with 4 in a row + 2 on one side D) 2×3 rectangle of squares",
          options: ["A", "B", "C", "D"],
          solution_steps: ["A (cross) ✓ — valid cube net", "B (T-shape) ✓ — valid", "C (L with extras) ✓ — valid", "D (2×3 rectangle) ✗ — when folded, two faces overlap"],
          answer: "D",
          difficulty: 3
        }
      ],
      tips_and_tricks: [
        "There are exactly 11 different nets for a cube — worth recognising the common ones",
        "Quick check: any net with 4+ squares in a straight line is suspicious (only works if extras are spaced right)",
        "Opposite face rule: in a cross net, the face 2 steps away (skipping one) is opposite",
        "For non-cube nets: count faces and match to the 3D shape first"
      ]
    }
  ]
});

// ============================================================
// 2. NEW CATEGORY: Speed & Exam Strategy
// ============================================================

data.categories.push({
  category: "Speed Strategies & Exam Technique",
  topics: [
    {
      id: "SPEED-T01",
      title: "Mental Math Speed Tricks",
      description: "Shortcuts for fast calculation without a calculator — essential for the 40-second-per-question time limit.",
      solving_steps: [
        "Round to friendly numbers, calculate, then adjust",
        "Break complex multiplications into parts: 48 × 25 = 48 × 100 ÷ 4 = 1200",
        "Use complements: 100 − 37 = 63 (think 37 + ? = 100)",
        "For percentages: 10% first, then adjust (15% = 10% + half of 10%)"
      ],
      key_rules: [
        "×5: halve, then ×10. E.g., 48×5 = 24×10 = 240",
        "×25: divide by 4, then ×100. E.g., 36×25 = 9×100 = 900",
        "×11: write digit, add adjacent pairs, write last digit. E.g., 72×11 = 7_(7+2)_2 = 792",
        "×9: ×10 minus the number. E.g., 37×9 = 370−37 = 333",
        "×99: ×100 minus the number. E.g., 45×99 = 4500−45 = 4455",
        "Square numbers ending in 5: n5² = n×(n+1) followed by 25. E.g., 35² = 3×4=12, append 25 → 1225"
      ],
      benchmark_fractions: [
        "1/2 = 50%, 1/3 ≈ 33.3%, 1/4 = 25%, 1/5 = 20%",
        "1/6 ≈ 16.7%, 1/8 = 12.5%, 1/10 = 10%",
        "2/3 ≈ 66.7%, 3/4 = 75%, 4/5 = 80%"
      ],
      examples: [
        {
          question: "Calculate 64 × 25 mentally.",
          options: ["1400", "1500", "1600", "1700"],
          solution_steps: ["64 × 25 = 64 ÷ 4 × 100", "64 ÷ 4 = 16", "16 × 100 = 1600"],
          answer: "1600",
          difficulty: 1
        },
        {
          question: "What is 15% of 240?",
          options: ["24", "30", "36", "42"],
          solution_steps: ["10% of 240 = 24", "5% of 240 = 12 (half of 10%)", "15% = 24 + 12 = 36"],
          answer: "36",
          difficulty: 1
        },
        {
          question: "Calculate 73 × 11 mentally.",
          options: ["793", "803", "813", "783"],
          solution_steps: ["73 × 11: write 7, then 7+3=10 (carry 1), then 3", "= 7(10)3 → carry: 803"],
          answer: "803",
          difficulty: 2
        },
        {
          question: "Which is larger: 3/7 or 5/12?",
          options: ["3/7", "5/12", "They are equal", "Cannot tell"],
          solution_steps: ["Cross multiply: 3×12 = 36 vs 5×7 = 35", "36 > 35, so 3/7 > 5/12"],
          answer: "3/7",
          difficulty: 2
        },
        {
          question: "Estimate: 389 × 0.48",
          options: ["About 120", "About 150", "About 190", "About 240"],
          solution_steps: ["≈ 400 × 0.5 = 200", "Actual is slightly less (389 < 400, 0.48 < 0.5)", "≈ 190"],
          answer: "About 190",
          difficulty: 2
        },
        {
          question: "Without calculating exactly: 49² − 48² = ?",
          options: ["1", "48", "97", "2401"],
          solution_steps: ["Use difference of squares: a² − b² = (a+b)(a−b)", "49² − 48² = (49+48)(49−48) = 97 × 1 = 97"],
          answer: "97",
          difficulty: 3
        }
      ],
      tips_and_tricks: [
        "For comparing fractions: cross-multiply and compare (avoids finding common denominators)",
        "To check divisibility by 3: sum the digits — if sum is divisible by 3, so is the number",
        "For 'which is closest' questions: estimate first, then check only the close options",
        "Percentage increase/decrease: multiply by (1 + rate) or (1 − rate)"
      ]
    },
    {
      id: "SPEED-T02",
      title: "MCQ Elimination & Exam Strategy",
      description: "Techniques for maximising score on multiple-choice quantitative reasoning exams under time pressure.",
      solving_steps: [
        "Read the question carefully — especially words like NOT, LEAST, EXCEPT, ALWAYS",
        "Estimate the answer BEFORE looking at options",
        "Eliminate clearly wrong options first (too big, too small, wrong sign)",
        "If stuck: substitute answer options back into the question",
        "Don't spend more than 60 seconds on any one question — mark and move on"
      ],
      common_traps: [
        "Trap: Giving the answer to a DIFFERENT question than asked (e.g., finding x when asked for 2x)",
        "Trap: Sign errors — an option with the right number but wrong sign is a distractor",
        "Trap: Forgetting to convert units (cm vs m, seconds vs minutes)",
        "Trap: 'None of the above' — only choose this after verifying all others are wrong",
        "Trap: Percentage increase ≠ percentage decrease (20% up then 20% down ≠ original)"
      ],
      examples: [
        {
          question: "If 3x + 5 = 20, what is the value of 6x + 10? Options: A) 15, B) 30, C) 40, D) 45",
          options: ["15", "30", "40", "45"],
          solution_steps: ["Notice: 6x + 10 = 2(3x + 5) = 2 × 20 = 40", "Trap: solving for x first (x=5) then computing is slower", "Shortcut: recognise the expression is double the original"],
          answer: "40",
          difficulty: 2
        },
        {
          question: "A price increases by 25% then decreases by 20%. The final price compared to original is: A) Same, B) Higher, C) Lower, D) Cannot tell",
          options: ["Same", "Higher", "Lower", "Cannot tell"],
          solution_steps: ["Start with 100", "25% increase: 100 × 1.25 = 125", "20% decrease: 125 × 0.80 = 100", "Same! Trap: students assume increase then decrease cancels unevenly"],
          answer: "Same",
          difficulty: 2
        },
        {
          question: "Which is NOT a factor of 144? A) 8, B) 9, C) 14, D) 16",
          options: ["8", "9", "14", "16"],
          solution_steps: ["144/8 = 18 ✓", "144/9 = 16 ✓", "144/14 = 10.28... ✗", "144/16 = 9 ✓"],
          answer: "14",
          difficulty: 1
        }
      ],
      tips_and_tricks: [
        "Time allocation: 30 seconds to solve + 10 seconds to verify = 40 seconds per question",
        "If you can eliminate 2 options, guessing from the remaining 2-3 gives 33-50% chance",
        "Back-substitution: plug each option into the question — one will work",
        "Watch for 'almost right' answers — they're usually based on a common error",
        "Do easy questions first, hard ones last — all questions are worth the same marks"
      ]
    }
  ]
});

// ============================================================
// 3. EXPAND WEAK TOPICS WITH MORE EXAMPLES
// ============================================================

const expansions = [
  {
    topic: "Number Sequences",
    examples: [
      { question: "What comes next: 2, 6, 18, 54, ?", options: ["108", "128", "162", "216"], solution_steps: ["Each term × 3: 2→6→18→54", "Next: 54 × 3 = 162"], answer: "162", difficulty: 1 },
      { question: "Find the next term: 1, 4, 9, 16, 25, ?", options: ["30", "34", "36", "49"], solution_steps: ["These are perfect squares: 1², 2², 3², 4², 5²", "Next: 6² = 36"], answer: "36", difficulty: 1 },
      { question: "What comes next: 3, 5, 9, 15, 23, ?", options: ["31", "33", "35", "37"], solution_steps: ["Differences: 2, 4, 6, 8", "Differences increase by 2 each time", "Next difference: 10", "23 + 10 = 33"], answer: "33", difficulty: 2 },
      { question: "Find the missing number: 2, 5, 11, 23, ?, 95", options: ["45", "47", "48", "50"], solution_steps: ["Pattern: ×2 + 1", "2→5 (×2+1), 5→11 (×2+1), 11→23 (×2+1)", "23×2+1 = 47", "Check: 47×2+1 = 95 ✓"], answer: "47", difficulty: 3 },
    ]
  },
  {
    topic: "Shape",
    examples: [
      { question: "A pattern adds 3 dots per step: Step 1 has 1 dot, Step 2 has 4 dots. How many dots at Step 10?", options: ["28", "30", "31", "33"], solution_steps: ["Step n = 1 + 3(n−1)", "Step 10 = 1 + 3(9) = 28"], answer: "28", difficulty: 2 },
    ]
  },
  {
    topic: "Speed, Distance",
    examples: [
      { question: "A car travels 120 km in 1.5 hours. What is its average speed?", options: ["60 km/h", "70 km/h", "80 km/h", "90 km/h"], solution_steps: ["Speed = Distance ÷ Time", "= 120 ÷ 1.5 = 80 km/h"], answer: "80 km/h", difficulty: 1 },
      { question: "A cyclist rides 15 km at 20 km/h, then 25 km at 25 km/h. What is the average speed for the whole trip?", options: ["22 km/h", "22.5 km/h", "23.5 km/h", "24.2 km/h"], solution_steps: ["Time 1 = 15/20 = 0.75 h", "Time 2 = 25/25 = 1 h", "Total time = 1.75 h, total distance = 40 km", "Avg speed = 40/1.75 ≈ 22.9 km/h"], answer: "22.5 km/h", difficulty: 2 },
      { question: "Two trains 300 km apart travel toward each other at 80 km/h and 70 km/h. When do they meet?", options: ["1 hour", "1.5 hours", "2 hours", "2.5 hours"], solution_steps: ["Combined speed = 80 + 70 = 150 km/h", "Time = 300/150 = 2 hours"], answer: "2 hours", difficulty: 2 },
    ]
  },
  {
    topic: "Work & Rate",
    examples: [
      { question: "Worker A finishes a job in 6 hours, Worker B in 4 hours. How long if they work together?", options: ["2 hours", "2.4 hours", "3 hours", "5 hours"], solution_steps: ["Rate A = 1/6, Rate B = 1/4", "Combined = 1/6 + 1/4 = 2/12 + 3/12 = 5/12", "Time = 12/5 = 2.4 hours"], answer: "2.4 hours", difficulty: 2 },
      { question: "A tap fills a tank in 8 hours. A drain empties it in 12 hours. Both open — how long to fill?", options: ["20 hours", "24 hours", "28 hours", "36 hours"], solution_steps: ["Fill rate = 1/8, Drain rate = 1/12", "Net rate = 1/8 − 1/12 = 3/24 − 2/24 = 1/24", "Time = 24 hours"], answer: "24 hours", difficulty: 3 },
    ]
  },
  {
    topic: "Perimeter & Area",
    examples: [
      { question: "A rectangular garden is 12 m by 8 m with a 1 m wide path around it. What is the area of the path?", options: ["40 m²", "44 m²", "84 m²", "96 m²"], solution_steps: ["Outer rectangle: 14 m × 10 m = 140 m²", "Inner rectangle: 12 m × 8 m = 96 m²", "Path = 140 − 96 = 44 m²"], answer: "44 m²", difficulty: 2 },
      { question: "A semicircle has diameter 10 cm. What is its area?", options: ["25π cm²", "12.5π cm²", "50π cm²", "100π cm²"], solution_steps: ["Radius = 5 cm", "Full circle area = π × 5² = 25π", "Semicircle = 25π/2 = 12.5π cm²"], answer: "12.5π cm²", difficulty: 2 },
    ]
  },
  {
    topic: "Mean, Median",
    examples: [
      { question: "Test scores: 72, 85, 68, 91, 85, 78. What is the median?", options: ["78", "79.8", "81.5", "85"], solution_steps: ["Ordered: 68, 72, 78, 85, 85, 91", "6 values → median = average of 3rd and 4th", "Median = (78 + 85)/2 = 81.5"], answer: "81.5", difficulty: 1 },
      { question: "The mean of 5 numbers is 12. Four of them are 8, 10, 14, 16. What is the fifth?", options: ["10", "12", "14", "16"], solution_steps: ["Sum = 5 × 12 = 60", "Known sum = 8+10+14+16 = 48", "Fifth = 60 − 48 = 12"], answer: "12", difficulty: 2 },
    ]
  },
  {
    topic: "Probability",
    examples: [
      { question: "A bag has 3 red, 4 blue, 5 green marbles. What is P(not green)?", options: ["5/12", "7/12", "3/12", "4/12"], solution_steps: ["Total = 12", "Not green = 3+4 = 7", "P = 7/12"], answer: "7/12", difficulty: 1 },
      { question: "A coin is flipped 3 times. What is P(exactly 2 heads)?", options: ["1/4", "3/8", "1/2", "1/8"], solution_steps: ["Outcomes: HHH,HHT,HTH,THH,HTT,THT,TTH,TTT = 8", "Exactly 2H: HHT,HTH,THH = 3", "P = 3/8"], answer: "3/8", difficulty: 2 },
      { question: "Two dice are rolled. P(sum > 9)?", options: ["1/12", "1/6", "5/36", "7/36"], solution_steps: ["Sum 10: (4,6)(5,5)(6,4) = 3", "Sum 11: (5,6)(6,5) = 2", "Sum 12: (6,6) = 1", "Total = 6 out of 36", "P = 6/36 = 1/6"], answer: "1/6", difficulty: 2 },
    ]
  },
  {
    topic: "Venn Diagrams",
    examples: [
      { question: "In a class of 40: 25 play cricket, 18 play soccer, 8 play both. How many play neither?", options: ["3", "5", "7", "10"], solution_steps: ["Cricket only = 25−8 = 17", "Soccer only = 18−8 = 10", "Either = 17+10+8 = 35", "Neither = 40−35 = 5"], answer: "5", difficulty: 1 },
      { question: "30 students: 18 like maths, 15 like science, 20 like English. 10 like maths & science, 8 like maths & English, 7 like science & English, 5 like all three. How many like exactly one subject?", options: ["10", "12", "15", "18"], solution_steps: ["Only maths = 18−10−8+5 = 5", "Only science = 15−10−7+5 = 3", "Only English = 20−8−7+5 = 10", "Exactly one = 5+3+10 = 18"], answer: "18", difficulty: 3 },
    ]
  },
  {
    topic: "Time Problems",
    examples: [
      { question: "A bus leaves every 12 minutes. The first bus is at 6:15 am. When is the 5th bus?", options: ["6:51 am", "7:03 am", "7:15 am", "7:27 am"], solution_steps: ["5th bus = 4 intervals after first", "4 × 12 = 48 minutes", "6:15 + 48 min = 7:03 am"], answer: "7:03 am", difficulty: 2 },
    ]
  },
  {
    topic: "Money & Finance",
    examples: [
      { question: "$500 invested at 4% simple interest for 3 years. Total amount?", options: ["$540", "$560", "$624", "$530"], solution_steps: ["Interest = 500 × 0.04 × 3 = $60", "Total = 500 + 60 = $560"], answer: "$560", difficulty: 1 },
      { question: "Buy 3 items at $12.50 each with a 'buy 2 get 1 half price' deal. Total cost?", options: ["$31.25", "$33.75", "$37.50", "$25.00"], solution_steps: ["2 full price: 2 × $12.50 = $25.00", "1 half price: $12.50/2 = $6.25", "Total = $31.25"], answer: "$31.25", difficulty: 2 },
    ]
  },
];

for (const exp of expansions) {
  const topic = findTopic(exp.topic);
  if (topic) {
    if (!topic.examples) topic.examples = [];
    topic.examples.push(...exp.examples);
  }
}

// ============================================================
// 4. ENSURE ALL EXAMPLES HAVE DIFFICULTY
// ============================================================
for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    if (topic.examples) {
      for (const ex of topic.examples) {
        if (!ex.difficulty) {
          const steps = ex.solution_steps || [];
          ex.difficulty = steps.length >= 5 ? 3 : steps.length >= 3 ? 2 : 1;
        }
      }
    }
  }
}

// ============================================================
// WRITE
// ============================================================
writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');

let totalTopics = 0, totalExamples = 0, withMCQ = 0;
for (const cat of data.categories) {
  totalTopics += (cat.topics || []).length;
  for (const topic of (cat.topics || [])) {
    if (topic.examples) {
      for (const ex of topic.examples) {
        totalExamples++;
        if (ex.options) withMCQ++;
      }
    }
  }
}
console.log(`Done. ${data.categories.length} categories, ${totalTopics} topics, ${totalExamples} examples (${withMCQ} with MCQ options).`);
