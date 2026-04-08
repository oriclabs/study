/**
 * Converts snotes example objects (question + solution_steps + answer)
 * into animated Lesson objects that the Renderer can play.
 *
 * Enhanced: auto-detects math content in steps and adds visual ops
 * (graphs, number lines, highlights) to provide visual explanations
 * beyond just typing out text.
 */

import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';
import { identify } from '@subjects/math/classifier.js';
import { getStrategiesFor } from '@subjects/math/strategies/index.js';

function writeOp(text: string, variant?: 'explain' | 'answer'): Op {
  return variant
    ? { op: 'write', style: { variant }, data: { text } }
    : { op: 'write', data: { text } };
}

function txOp(from: string, to: string, operation: string): Op {
  return { op: 'transform', data: { from, to, operation, strikeSource: true } };
}

function pauseOp(ms: number): Op {
  return { op: 'pause', data: { ms } };
}

function graphOp(
  xRange: [number, number],
  yRange: [number, number],
  plots: { expr: string; color?: string; label?: string }[],
  points?: { x: number; y: number; label?: string }[],
): Op {
  return { op: 'graph', data: { xRange, yRange, plots, points } };
}

function numberlineOp(
  from: number,
  to: number,
  marks: number[],
  labels?: Record<string, string>,
): Op {
  return { op: 'numberline', data: { from, to, marks, labels } };
}

function highlightOp(style: 'underline' | 'box' | 'circle'): Op {
  return { op: 'highlight', data: { style } };
}

function makeStep(id: string, kind: Step['kind'], ops: Op[], waitAfterMs?: number): Step {
  return { id, kind, ops, ...(waitAfterMs !== undefined ? { waitAfterMs } : {}) };
}

export interface SnotesExample {
  question?: string;
  solution_steps?: string[];
  answer?: string;
  [key: string]: unknown;
}

/**
 * Try to extract a plottable expression from an equation like "y = 2x + 3"
 * or factored form "(x + 3)(x + 4)".
 */
function extractPlottable(text: string): { expr: string; label: string } | null {
  // "= (x + a)(x + b)" → expand to plottable
  const factoredMatch = text.match(/\(x\s*([+-]\s*\d+)\)\s*\(x\s*([+-]\s*\d+)\)/i);
  if (factoredMatch) {
    const a = parseFloat(factoredMatch[1]!.replace(/\s/g, ''));
    const b = parseFloat(factoredMatch[2]!.replace(/\s/g, ''));
    // (x+a)(x+b) = x² + (a+b)x + ab
    const bCoeff = a + b;
    const cCoeff = a * b;
    let expr = 'x^2';
    if (bCoeff !== 0) expr += bCoeff > 0 ? `+${bCoeff}*x` : `${bCoeff}*x`;
    if (cCoeff !== 0) expr += cCoeff > 0 ? `+${cCoeff}` : `${cCoeff}`;
    return { expr, label: `y = (x${a >= 0 ? '+' : ''}${a})(x${b >= 0 ? '+' : ''}${b})` };
  }

  // "y = ax + b" or similar linear
  const linearMatch = text.match(/=\s*(-?\d*\.?\d*)x\s*([+-]\s*\d+\.?\d*)?$/i);
  if (linearMatch) {
    const a = linearMatch[1] === '' || linearMatch[1] === '+' ? 1
      : linearMatch[1] === '-' ? -1
      : parseFloat(linearMatch[1]!);
    const b = linearMatch[2] ? parseFloat(linearMatch[2].replace(/\s/g, '')) : 0;
    const expr = b === 0 ? `${a}*x` : `${a}*x${b > 0 ? '+' : ''}${b}`;
    return { expr, label: text.trim() };
  }

  return null;
}

/**
 * Detect if the answer is a standalone numeric value like "x = 5", "5", "-3.5",
 * or a simple unit answer like "11" or "$168.30" or "−295 m".
 * Does NOT match coefficients in expressions like "x² − 4x − 10".
 */
function extractNumericAnswer(answer: string): number | null {
  const trimmed = answer.trim();

  // Skip if answer contains variables (it's an expression, not a number)
  if (/[a-wyz]/i.test(trimmed)) return null;  // allow 'x' only in "x = ..."

  // "x = 5" or "x = -3.5"
  const xEquals = trimmed.match(/^x\s*=\s*(-?\d+\.?\d*)$/);
  if (xEquals) return parseFloat(xEquals[1]!);

  // Pure number, optionally with currency/unit: "$5", "11", "−295 m", "-3.5"
  const pureNum = trimmed.match(/^[−\-$]?\s*(\d+\.?\d*)\s*\w{0,3}$/);
  if (pureNum) {
    const val = parseFloat(pureNum[1]!);
    return trimmed.startsWith('−') || trimmed.startsWith('-') ? -val : val;
  }

  return null;
}

/**
 * Detect factored roots from answer like "(x + 3)(x + 4)" → roots -3, -4
 */
function extractFactoredRoots(answer: string): number[] | null {
  const matches = [...answer.matchAll(/\(x\s*([+-]\s*\d+\.?\d*)\)/gi)];
  if (matches.length >= 2) {
    return matches.map(m => -parseFloat(m[1]!.replace(/\s/g, '')));
  }
  return null;
}

/**
 * Detect intermediate computed values in steps like "→ 3+64÷8" or "= 4".
 * Used to place number line marks.
 */
function extractComputedValues(steps: string[]): number[] {
  const values: number[] = [];
  for (const s of steps) {
    // Match "= number" at end of step
    const eqMatch = s.match(/=\s*(-?\d+\.?\d*)\s*$/);
    if (eqMatch) values.push(parseFloat(eqMatch[1]!));
    // Match "→ ...number" patterns (BODMAS steps)
    const arrowMatch = s.match(/→\s*.*?(-?\d+\.?\d*)\s*$/);
    if (arrowMatch) values.push(parseFloat(arrowMatch[1]!));
  }
  return values.filter(v => isFinite(v));
}

/** Compute a nice axis range. */
function niceRange(values: number[], padding = 2): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 2;
  return [Math.floor(min - span * 0.3 - padding), Math.ceil(max + span * 0.3 + padding)];
}

/**
 * Convert a snotes example into an animated Lesson with visual enhancements.
 * Returns null if the example has no solution_steps.
 */
export function exampleToLesson(example: SnotesExample, subjectId: string): Lesson | null {
  const steps = example.solution_steps;
  if (!steps || steps.length === 0) return null;

  const question = example.question || 'Example';
  const answer = example.answer;

  const lessonSteps: Step[] = [];
  let stepNum = 1;

  // Write the question
  lessonSteps.push(
    makeStep(`s${stepNum++}`, 'explain', [
      writeOp(question, 'explain'),
      pauseOp(400),
    ], 300)
  );

  // Write each solution step — use transformOp between consecutive work steps
  let prevWorkText: string | null = null;

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i]!;
    const isWork = /[=→⟹]/.test(s) || /^\s*[-\d(√]/.test(s);
    const isLast = i === steps.length - 1;

    if (!isWork) {
      // Explanation step — break the work chain
      prevWorkText = null;
      lessonSteps.push(
        makeStep(`s${stepNum++}`, 'explain', [writeOp(s, 'explain')], 300)
      );
      continue;
    }

    // Extract the math result and any inline annotation
    const { result, annotation } = parseWorkStep(s);

    // Skip if result is identical to previous (duplicate step)
    // But capture any annotation as an operation label for the NEXT step
    if (prevWorkText !== null && normalizeExpr(result) === normalizeExpr(prevWorkText)) {
      // If there's an annotation, show it as an explanation
      if (annotation) {
        lessonSteps.push(
          makeStep(`s${stepNum++}`, 'explain', [writeOp(annotation, 'explain')], 200)
        );
      }
      continue;
    }

    if (prevWorkText !== null) {
      // Consecutive work steps → show as transformation
      const operation = annotation || extractOperation(s);
      lessonSteps.push(
        makeStep(`s${stepNum++}`, 'work', [
          txOp(prevWorkText, result, operation),
        ], 300)
      );
      prevWorkText = result;
    } else {
      // First work step — just write it
      const ops: Op[] = [writeOp(result)];
      if (isLast) ops.push(highlightOp('underline'));
      lessonSteps.push(
        makeStep(`s${stepNum++}`, 'work', ops, 300)
      );
      prevWorkText = result;
    }
  }

  // Write the answer with highlight
  if (answer) {
    lessonSteps.push(
      makeStep(`s${stepNum++}`, 'work', [
        pauseOp(300),
        writeOp(`Answer: ${answer}`, 'answer'),
        highlightOp('box'),
      ], 500)
    );
  }

  // === Visual enhancements based on content analysis ===

  if (subjectId === 'math' || subjectId === 'numerical') {
    // Check for factorable/graphable content
    const answerStr = answer || '';
    const allText = [...steps, answerStr].join(' ');

    // Skip visuals if the answer is an algebraic expression (not a numeric result)
    // e.g. "x² − 4x − 10", "6x + 15" — these are simplification results, not solutions
    const answerHasVariable = /[a-wyz²³]/i.test(answerStr) && !/^x\s*=/.test(answerStr);

    // 1. Factored quadratic → show graph with roots (only if answer IS the factored form)
    const roots = answerHasVariable ? null : extractFactoredRoots(answerStr);
    const plottable = extractFactoredRoots(answerStr)
      ? extractPlottable(answerStr)  // answer is factored → plot it
      : answerHasVariable
        ? null                        // answer is expression → skip
        : extractPlottable(allText);  // answer is numeric → search steps

    if (roots && plottable) {
      const xR = niceRange(roots);
      const vertexX = (roots[0]! + roots[1]!) / 2;
      const vertexY = evalSimpleQuad(plottable.expr, vertexX);
      const yR = niceRange([0, vertexY ?? -4]);

      const points = roots.map(r => ({ x: r, y: 0, label: `x = ${r}` }));
      if (vertexY !== null) {
        points.push({ x: vertexX, y: vertexY, label: 'vertex' });
      }

      lessonSteps.push(
        makeStep(`s${stepNum++}`, 'explain', [
          writeOp('Graphically:', 'explain'),
          graphOp(xR, yR,
            [{ expr: plottable.expr, color: '#7c3aed', label: plottable.label }],
            points,
          ),
        ], 400)
      );

      // Number line with roots
      const nlFrom = Math.floor(Math.min(...roots) - 3);
      const nlTo = Math.ceil(Math.max(...roots) + 3);
      const labels: Record<string, string> = {};
      roots.forEach((r, i) => { labels[String(r)] = `x${i + 1} = ${r}`; });
      lessonSteps.push(
        makeStep(`s${stepNum++}`, 'explain', [
          numberlineOp(nlFrom, nlTo, roots, labels),
        ])
      );

    } else if (plottable) {
      // Linear or other plottable expression — show graph
      const numAnswer = extractNumericAnswer(answerStr);
      const xR: [number, number] = numAnswer !== null
        ? niceRange([0, numAnswer])
        : [-5, 5];
      const yR: [number, number] = [-5, 10];

      const points = numAnswer !== null
        ? [{ x: numAnswer, y: 0, label: `x = ${numAnswer}` }]
        : undefined;

      lessonSteps.push(
        makeStep(`s${stepNum++}`, 'explain', [
          writeOp('Graphically:', 'explain'),
          graphOp(xR, yR,
            [{ expr: plottable.expr, color: '#2563eb', label: plottable.label }],
            points,
          ),
        ], 400)
      );
    }

    // 2. Numeric answer → show on number line (if not already shown)
    if (!roots) {
      const numAnswer = extractNumericAnswer(answerStr);
      const computed = extractComputedValues(steps);

      if (numAnswer !== null && isFinite(numAnswer) && Math.abs(numAnswer) < 1000) {
        const allMarks = [...new Set([...computed.slice(-2), numAnswer])];
        const nlFrom = Math.floor(Math.min(...allMarks) - 3);
        const nlTo = Math.ceil(Math.max(...allMarks) + 3);
        const labels: Record<string, string> = {
          [String(numAnswer)]: `= ${numAnswer}`,
        };

        lessonSteps.push(
          makeStep(`s${stepNum++}`, 'explain', [
            numberlineOp(nlFrom, nlTo, [numAnswer], labels),
          ])
        );
      }
    }

    // 3. Show alternative strategies if this is a recognizable equation
    try {
      const problem = identify(question);
      if (problem) {
        const strategies = getStrategiesFor(problem);
        const applicable = strategies.filter(m => m.check.applicable);
        if (applicable.length > 1) {
          const methodList = applicable
            .map((m, i) => `${i + 1}. ${m.strategy.name} — ${m.strategy.shortDescription}`)
            .join('\n');
          lessonSteps.push(
            makeStep(`s${stepNum++}`, 'explain', [
              pauseOp(400),
              writeOp(`${applicable.length} ways to solve this:`, 'explain'),
            ], 200)
          );
          for (const m of applicable) {
            lessonSteps.push(
              makeStep(`s${stepNum++}`, 'explain', [
                writeOp(`  \u2022 ${m.strategy.name}: ${m.strategy.shortDescription}`),
              ], 200)
            );
          }
          lessonSteps.push(
            makeStep(`s${stepNum++}`, 'explain', [
              writeOp('Try the solver with "Pick a method" to compare!', 'explain'),
            ])
          );
        }
      }
    } catch {
      // Strategy detection is best-effort — skip if it fails
    }

    // 4. MCQ with function options → plot all options on one graph
    const options = (example as Record<string, unknown>)['options'] as string[] | undefined;
    if (options && options.length >= 2) {
      const plottableOptions = options
        .map(opt => {
          // Extract "y = expr" from option
          const m = opt.match(/y\s*=\s*(.+)/i);
          if (!m) return null;
          const raw = m[1]!.trim();
          // Convert to evaluatable expression
          const expr = raw
            .replace(/²/g, '^2').replace(/³/g, '^3')
            .replace(/\u00B2/g, '^2').replace(/\u00B3/g, '^3')
            .replace(/\u2212/g, '-')
            .replace(/(\d)x/g, '$1*x')  // 2x → 2*x
            .replace(/(\d)\(/g, '$1*(')  // 2( → 2*(
            .replace(/\u02E3/g, '^x')   // ˣ → ^x
            .replace(/2ˣ/g, '2^x').replace(/3ˣ/g, '3^x')
            .replace(/2x/g, '2*x').replace(/3x/g, '3*x');
          return { expr, label: opt, raw };
        })
        .filter((p): p is { expr: string; label: string; raw: string } => p !== null);

      if (plottableOptions.length >= 2) {
        const colors = ['#2563eb', '#7c3aed', '#ef4444', '#22c55e', '#f59e0b'];
        const plots = plottableOptions.map((p, i) => ({
          expr: p.expr,
          color: colors[i % colors.length]!,
          label: p.label,
        }));

        // Extract key points from question (e.g., "passes through (0, 1)")
        const pointMatch = question.match(/\((-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\)/);
        const points = pointMatch
          ? [{ x: parseFloat(pointMatch[1]!), y: parseFloat(pointMatch[2]!), label: `(${pointMatch[1]}, ${pointMatch[2]})` }]
          : undefined;

        lessonSteps.push(
          makeStep(`s${stepNum++}`, 'visual', [
            writeOp('Comparing the options:', 'explain'),
            graphOp(
              [-3, 5],
              [-2, 8],
              plots,
              points,
            ),
          ], 400)
        );
      }
    }
  }

  return {
    schemaVersion: 1,
    id: `steps.${subjectId}.${Date.now()}`,
    subject: subjectId,
    topic: 'general',
    title: question.length > 60 ? question.slice(0, 57) + '...' : question,
    meta: { difficulty: 2, source: 'generated', objectives: ['step-by-step walkthrough'] },
    steps: lessonSteps,
  };
}

/**
 * Parse a work step into its math result and optional annotation.
 * Examples:
 *   "= 3 × 2x + 3 × 5"              → { result: "3 × 2x + 3 × 5", annotation: "" }
 *   "= 3 × 2x + 3 × 5 - simplify"   → { result: "3 × 2x + 3 × 5", annotation: "simplify" }
 *   "Distribute → 6x + 15"           → { result: "6x + 15", annotation: "distribute" }
 *   "6x + 15"                        → { result: "6x + 15", annotation: "" }
 */
function parseWorkStep(step: string): { result: string; annotation: string } {
  const s = step.trim();

  // "Action → result" pattern
  const arrowIdx = s.search(/[→⟹]/);
  if (arrowIdx >= 0) {
    return {
      result: s.slice(arrowIdx + 1).trim(),
      annotation: s.slice(0, arrowIdx).trim().toLowerCase(),
    };
  }

  // Strip leading "= " and check for trailing annotation after " - "
  let expr = s.replace(/^=\s*/, '');

  // Trailing annotation: "3 × 2x + 3 × 5 - simplify"
  // Only match if the part after " - " looks like text, not math
  const dashMatch = expr.match(/^(.+?)\s+-\s+([a-zA-Z][a-zA-Z ]+)$/);
  if (dashMatch) {
    return { result: dashMatch[1]!.trim(), annotation: dashMatch[2]!.trim().toLowerCase() };
  }

  return { result: expr, annotation: '' };
}

/** Normalize expression for comparison — strip spaces and leading = */
function normalizeExpr(s: string): string {
  return s.replace(/^=\s*/, '').replace(/\s+/g, '');
}

/**
 * Extract the operation description from a solution step.
 */
function extractOperation(step: string): string {
  const { annotation } = parseWorkStep(step);
  return annotation || 'simplify';
}

/** Simple evaluation of a quadratic expression string at a given x. */
function evalSimpleQuad(expr: string, x: number): number | null {
  try {
    // Replace x^2 and x with values, then evaluate
    const substituted = expr
      .replace(/x\^2/g, `(${x * x})`)
      .replace(/x/g, `(${x})`);
    // Safe eval via Function (only digits, operators, parens)
    if (!/^[\d+\-*/.() ]+$/.test(substituted)) return null;
    return new Function(`return ${substituted}`)() as number;
  } catch {
    return null;
  }
}
