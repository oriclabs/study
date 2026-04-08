import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import { writeOp, step, buildLesson, getValues, getSubtype } from './helpers.js';

/**
 * Formula method strategy.
 *
 * Apply well-known formulas to structured word problems:
 *   - Distance = Speed × Time
 *   - Work done = Rate × Time
 *   - Mixture: weighted averages
 *   - Age: set up linear equations
 *   - Sequences: nth-term formulas
 *
 * Most effective when the problem maps cleanly to a known formula.
 */
export const formulaMethod: Strategy = {
  metadata: {
    id: 'formula-method',
    name: 'Formula Method',
    shortDescription: 'Apply a known formula (D=ST, Work=Rate×Time, nth-term) directly to the problem.',
    appliesTo: ['word-problem', 'sequence', 'proportion'],
    tradeoffs: {
      speed: 'fast',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['formula recall', 'algebraic substitution', 'unit awareness'],
      failsWhen: 'the problem does not map to a standard formula',
    },
    relatedStrategies: ['pattern-recognition', 'work-backwards'],
    commonMistakes: ['wrong-formula', 'unit-mismatch', 'misidentified-variables'],
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    const validTypes = ['word-problem', 'sequence', 'proportion'];
    if (!validTypes.includes(problem.type)) {
      return { applicable: false, reason: 'Not a problem type that uses standard formulas.' };
    }

    const passed: string[] = [];
    const failed: string[] = [];

    if (problem.type === 'word-problem') {
      const subtype = getSubtype(problem);
      const supported = ['distance-time', 'work-rate', 'age', 'mixtures'];
      if (supported.includes(subtype)) {
        passed.push(`recognised subtype: ${subtype}`);
        return {
          applicable: true,
          reason: `This is a ${subtype} problem — a standard formula applies.`,
          passedChecks: passed,
        };
      }
      failed.push(`subtype "${subtype}" has no standard formula in our bank`);
    }

    if (problem.type === 'sequence') {
      const values = getValues(problem);
      if (values.length >= 3) {
        passed.push('sequence with enough terms for nth-term formula');
        return {
          applicable: true,
          reason: 'Can apply nth-term formulas (arithmetic or geometric).',
          passedChecks: passed,
        };
      }
      failed.push('fewer than 3 terms — cannot determine formula');
    }

    if (problem.type === 'proportion') {
      passed.push('proportion problems use cross-multiplication');
      return {
        applicable: true,
        reason: 'Cross-multiplication or unitary method applies.',
        passedChecks: passed,
      };
    }

    if (failed.length > 0) {
      return { applicable: false, reason: 'No matching formula found.', failedChecks: failed };
    }

    return { applicable: true, reason: 'A standard formula can be applied.', passedChecks: passed };
  },

  cost(_problem: Problem): number { return 2; },

  solve(problem: Problem) {
    const values = getValues(problem);
    const subtype = getSubtype(problem);

    const stepsArr = [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp('Strategy: Formula Method', 'title'),
         writeOp('Identify the formula, substitute values, and solve.', 'explain')],
        undefined, 300),
    ];

    if (problem.type === 'word-problem') {
      stepsArr.push(...buildWordProblemSteps(subtype, values));
    } else if (problem.type === 'sequence') {
      stepsArr.push(...buildSequenceFormulaSteps(values));
    } else if (problem.type === 'proportion') {
      stepsArr.push(...buildProportionSteps(values));
    }

    return buildLesson({
      id: `numerical.strategy.formula-method.${Date.now()}`,
      topic: problem.topic ?? 'word-problems',
      title: `Formula Method: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['formula application', 'algebraic substitution'],
      steps: stepsArr,
    });
  },
};

// ---------------------------------------------------------------------------
// Step builders per subtype
// ---------------------------------------------------------------------------
function buildWordProblemSteps(subtype: string, values: number[]) {
  switch (subtype) {
    case 'distance-time':
      return [
        step('s3', 'explain',
          [writeOp('Formula: Distance = Speed × Time', 'explain'),
           writeOp('Rearranged: Speed = Distance ÷ Time, Time = Distance ÷ Speed')],
          undefined, 300),
        step('s4', 'work',
          [writeOp(`Given values: ${values.join(', ')}`),
           writeOp('Identify which value is distance, speed, and time, then substitute.')],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('Substitute the known values and solve for the unknown.', 'answer')]),
      ];
    case 'work-rate':
      return [
        step('s3', 'explain',
          [writeOp('Formula: Work = Rate × Time', 'explain'),
           writeOp('If A finishes in a days, A\'s rate = 1/a per day.'),
           writeOp('Combined rate = sum of individual rates.')],
          undefined, 300),
        step('s4', 'work',
          [writeOp(`Given values: ${values.join(', ')}`),
           writeOp('Compute individual rates, then add them.')],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('Time together = 1 ÷ combined rate.', 'answer')]),
      ];
    case 'age':
      return [
        step('s3', 'explain',
          [writeOp('Set up variables: let current ages be x and y.', 'explain'),
           writeOp('Translate each sentence into an equation.')],
          undefined, 300),
        step('s4', 'work',
          [writeOp(`Known numbers: ${values.join(', ')}`),
           writeOp('Write simultaneous equations and solve.')],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('Solve the system of equations for the unknown age.', 'answer')]),
      ];
    case 'mixtures':
      return [
        step('s3', 'explain',
          [writeOp('Formula: C_mix = (C₁V₁ + C₂V₂) ÷ (V₁ + V₂)', 'explain'),
           writeOp('Use weighted average of concentrations.')],
          undefined, 300),
        step('s4', 'work',
          [writeOp(`Given values: ${values.join(', ')}`),
           writeOp('Identify concentrations and volumes, then substitute.')],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('Compute the weighted average to find the mixture result.', 'answer')]),
      ];
    default:
      return [
        step('s3', 'explain',
          [writeOp('Identify the relevant formula for this problem type.', 'explain')],
          undefined, 300),
        step('s4', 'checkpoint',
          [writeOp('Substitute values and solve.', 'answer')]),
      ];
  }
}

function buildSequenceFormulaSteps(values: number[]) {
  const diffs = values.slice(1).map((v, i) => v - values[i]!);
  const isArithmetic = diffs.every(d => d === diffs[0]);

  if (isArithmetic) {
    const a = values[0]!;
    const d = diffs[0]!;
    return [
      step('s3', 'explain',
        [writeOp('Arithmetic sequence formula: aₙ = a₁ + (n-1)d', 'explain'),
         writeOp(`a₁ = ${a}, d = ${d}`)],
        undefined, 300),
      step('s4', 'work',
        [writeOp(`Next term (n=${values.length + 1}): ${a} + ${values.length}×${d} = ${a + values.length * d}`)],
        undefined, 300),
      step('s5', 'checkpoint',
        [writeOp(`aₙ = ${a} + (n-1)×${d}`, 'answer')]),
    ];
  }

  const ratios = values.slice(1).map((v, i) => values[i] !== 0 ? v / values[i]! : NaN);
  const isGeometric = ratios.length > 0 && ratios.every(r => r === ratios[0]) && ratios.every(r => !isNaN(r));

  if (isGeometric) {
    const a = values[0]!;
    const r = ratios[0]!;
    return [
      step('s3', 'explain',
        [writeOp('Geometric sequence formula: aₙ = a₁ × r^(n-1)', 'explain'),
         writeOp(`a₁ = ${a}, r = ${r}`)],
        undefined, 300),
      step('s4', 'work',
        [writeOp(`Next term (n=${values.length + 1}): ${a} × ${r}^${values.length} = ${a * Math.pow(r, values.length)}`)],
        undefined, 300),
      step('s5', 'checkpoint',
        [writeOp(`aₙ = ${a} × ${r}^(n-1)`, 'answer')]),
    ];
  }

  return [
    step('s3', 'explain',
      [writeOp('Sequence is not purely arithmetic or geometric.', 'explain'),
       writeOp('Try identifying the rule by examining differences and ratios.')],
      undefined, 300),
    step('s4', 'checkpoint',
      [writeOp('Apply the identified formula to find the next term.', 'answer')]),
  ];
}

function buildProportionSteps(values: number[]) {
  return [
    step('s3', 'explain',
      [writeOp('Use cross-multiplication: a/b = c/d → a×d = b×c', 'explain'),
       writeOp('Or use the unitary method: find the value of one unit first.')],
      undefined, 300),
    step('s4', 'work',
      [writeOp(`Given values: ${values.join(', ')}`),
       writeOp('Set up the proportion and cross-multiply.')],
      undefined, 400),
    step('s5', 'checkpoint',
      [writeOp('Solve for the unknown value.', 'answer')]),
  ];
}
