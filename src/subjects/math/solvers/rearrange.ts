/**
 * Formula rearrangement solver.
 * "Make r the subject of A = πr²"
 * Shows step-by-step algebraic manipulation to isolate the target variable.
 */

import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';
import { parse, toString, extractCoeffs, variables, type Expr } from '@core/math-parser/index.js';

function writeOp(text: string, variant?: 'explain' | 'answer'): Op {
  return variant ? { op: 'write', style: { variant }, data: { text } } : { op: 'write', data: { text } };
}
function txOp(from: string, to: string, operation: string): Op {
  return { op: 'transform', data: { from, to, operation, strikeSource: true } };
}
function mOp(expr: string, variant?: 'default' | 'answer' | 'explain'): Op {
  return { op: 'math', data: { expr, variant } };
}
function step(id: string, kind: Step['kind'], ops: Op[], wait?: number): Step {
  return { id, kind, ops, ...(wait ? { waitAfterMs: wait } : {}) };
}
function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(4)).toString();
}

/**
 * Common formula patterns for rearrangement.
 * Each pattern: { formula, forVar, steps }
 */
interface FormulaPattern {
  // Regex to match the formula (both sides of =)
  match: (lhs: string, rhs: string, target: string) => boolean;
  // Generate solution steps
  solve: (lhs: string, rhs: string, target: string, original: string) => Step[];
}

const PATTERNS: FormulaPattern[] = [
  // A = πr² → r = √(A/π)
  {
    match: (_lhs, rhs, target) => {
      const r = rhs.replace(/\s/g, '');
      return r.includes('pi') && r.includes(target + '^2');
    },
    solve: (_lhs, _rhs, target, original) => {
      const lhsVar = original.split('=')[0]!.trim();
      return [
        step('s2', 'explain', [writeOp(`Rearrange to make ${target} the subject:`, 'explain')]),
        step('s3', 'work', [txOp(original, `${target}^2 = ${lhsVar} / pi`, `divide both sides by \u03C0`)]),
        step('s4', 'work', [txOp(`${target}^2 = ${lhsVar} / pi`, `${target} = sqrt(${lhsVar} / pi)`, 'take square root')]),
        step('s5', 'checkpoint', [mOp(`${target} = sqrt(${lhsVar} / pi)`, 'answer')]),
      ];
    },
  },

  // V = lwh → h = V/(lw), etc.
  {
    match: (_lhs, rhs, target) => {
      const r = rhs.replace(/\s/g, '');
      // Product of variables: a*b*c and target is one of them
      return r.includes(target) && r.includes('*') && !r.includes('^') && !r.includes('+');
    },
    solve: (_lhs, rhs, target, original) => {
      const lhsVar = original.split('=')[0]!.trim();
      const r = rhs.replace(/\s/g, '');
      // Remove target from the product
      const parts = r.split('*').filter(p => p !== target);
      const divisor = parts.join(' * ');
      return [
        step('s2', 'explain', [writeOp(`Rearrange to make ${target} the subject:`, 'explain')]),
        step('s3', 'work', [txOp(original, `${target} = ${lhsVar} / (${divisor})`, `divide both sides by ${divisor}`)]),
        step('s4', 'checkpoint', [mOp(`${target} = ${lhsVar} / (${divisor})`, 'answer')]),
      ];
    },
  },

  // y = mx + c → x = (y - c) / m, or c = y - mx
  {
    match: (_lhs, rhs, target) => {
      return rhs.includes(target) && (rhs.includes('+') || rhs.includes('-'));
    },
    solve: (_lhs, rhs, target, original) => {
      const lhsVar = original.split('=')[0]!.trim();
      try {
        const ast = parse(rhs);
        const allVars = variables(ast);

        // Try to extract as polynomial in target
        const poly = extractCoeffs(ast, target);
        if (poly && poly.degree === 1) {
          const coeff = poly.coeffs.get(1) ?? 1;
          const constant = poly.coeffs.get(0) ?? 0;

          // lhs = coeff*target + constant → target = (lhs - constant) / coeff
          const steps: Step[] = [
            step('s2', 'explain', [writeOp(`Rearrange to make ${target} the subject:`, 'explain')]),
          ];

          if (constant !== 0) {
            // Build the constant expression from other variables
            const constStr = buildConstantExpr(ast, target, allVars);
            steps.push(step('s3', 'work', [
              txOp(original, `${coeff !== 1 ? fmt(coeff) + '*' : ''}${target} = ${lhsVar} - (${constStr})`, `move constant terms to other side`),
            ]));
          }

          if (coeff !== 1) {
            steps.push(step('s4', 'work', [
              txOp(`${fmt(coeff)}*${target} = ...`, `${target} = ... / ${fmt(coeff)}`, `divide by ${fmt(coeff)}`),
            ]));
          }

          // Final form
          const result = constant === 0
            ? (coeff === 1 ? lhsVar : `(${lhsVar}) / ${fmt(coeff)}`)
            : (coeff === 1 ? `${lhsVar} - (${buildConstantExpr(ast, target, allVars)})` : `(${lhsVar} - (${buildConstantExpr(ast, target, allVars)})) / ${fmt(coeff)}`);

          steps.push(step('s5', 'checkpoint', [mOp(`${target} = ${result}`, 'answer')]));
          return steps;
        }

        // Degree 2: target² involved
        if (poly && poly.degree === 2) {
          const a = poly.coeffs.get(2) ?? 0;
          const b = poly.coeffs.get(1) ?? 0;
          const c = poly.coeffs.get(0) ?? 0;
          const constStr = c !== 0 ? buildConstantExpr(ast, target, allVars) : '0';

          const steps: Step[] = [
            step('s2', 'explain', [writeOp(`Rearrange to make ${target} the subject:`, 'explain')]),
          ];

          if (c !== 0) {
            steps.push(step('s3', 'work', [txOp(original, `${fmt(a)}${target}^2 ${b !== 0 ? '+ ' + fmt(b) + target : ''} = ${lhsVar} - (${constStr})`, 'move constants')]));
          }

          if (b === 0) {
            // Simple: a*target² = ... → target = √(.../a)
            const divisor = a === 1 ? '' : ` / ${fmt(a)}`;
            steps.push(step('s4', 'work', [txOp(`${target}^2 = (${lhsVar}${c !== 0 ? ' - (' + constStr + ')' : ''})${divisor}`, `${target} = sqrt(...)`, 'take square root')]));
          }

          steps.push(step('s5', 'checkpoint', [
            writeOp(`${target} = \u221A((${lhsVar}${c !== 0 ? ' - ' + constStr : ''}) / ${fmt(a)})`, 'answer'),
          ]));
          return steps;
        }
      } catch { /* fall through to generic */ }

      // Generic fallback
      return [
        step('s2', 'explain', [writeOp(`Rearrange to make ${target} the subject:`, 'explain')]),
        step('s3', 'explain', [writeOp('Move all terms without ' + target + ' to the other side.', 'explain')]),
        step('s4', 'explain', [writeOp('Then isolate ' + target + ' by dividing or taking roots as needed.', 'explain')]),
      ];
    },
  },
];

function buildConstantExpr(ast: Expr, target: string, _allVars: string[]): string {
  // Simple: extract the non-target part of the expression
  const poly = extractCoeffs(ast, target);
  if (poly) {
    const constant = poly.coeffs.get(0) ?? 0;
    if (constant !== 0) return fmt(constant);
  }
  return '...';
}

export function solveRearrange(formula: string, targetVar: string): Lesson | null {
  const normalized = formula
    .replace(/\u03C0/g, 'pi')
    .replace(/\u00B2/g, '^2').replace(/\u00B3/g, '^3')
    .replace(/\u2212/g, '-')
    // Add implicit multiplication: pi r → pi*r, 2r → 2*r
    .replace(/(\d)([a-zA-Z])/g, '$1*$2')
    .replace(/pi([a-zA-Z])/g, 'pi*$1')
    .replace(/([a-zA-Z])(\d)/g, '$1*$2')
    .replace(/\)(\w)/g, ')*$1')
    .replace(/(\w)\(/g, '$1*(');

  const sides = normalized.split('=');
  if (sides.length !== 2) return null;

  const lhs = sides[0]!.trim();
  const rhs = sides[1]!.trim();

  const steps: Step[] = [
    step('s1', 'work', [writeOp(`Make ${targetVar} the subject of ${formula}`)], 400),
  ];

  // Try each pattern
  for (const pattern of PATTERNS) {
    if (pattern.match(lhs, rhs, targetVar)) {
      steps.push(...pattern.solve(lhs, rhs, targetVar, normalized));

      // Add a diagram for area/volume formulas
      if (/pi/.test(rhs) && /r/.test(targetVar)) {
        steps.push(step('s_draw', 'visual', [{
          op: 'diagram', data: {
            shape: 'circle' as const, center: [150, 60] as [number, number], size: 100,
            parts: [
              { x: 0, y: 0, label: '\u2022' },  // center dot
              { x: 50, y: 0, label: `${targetVar} = ?`, color: '#ef4444' },  // at edge (radius = size/2 = 50)
            ],
            title: '',
          },
        }]));
      }

      return {
        schemaVersion: 1,
        id: `math.solve.rearrange.${Date.now()}`,
        subject: 'math',
        topic: 'algebra.expressions',
        title: `Make ${targetVar} the subject: ${formula}`,
        meta: { difficulty: 2, source: 'generated', objectives: ['rearranging formulas'] },
        steps,
      };
    }
  }

  // Also try swapped: maybe target is on the LHS
  for (const pattern of PATTERNS) {
    if (pattern.match(rhs, lhs, targetVar)) {
      steps.push(...pattern.solve(rhs, lhs, targetVar, `${rhs} = ${lhs}`));
      return {
        schemaVersion: 1,
        id: `math.solve.rearrange.${Date.now()}`,
        subject: 'math', topic: 'algebra.expressions',
        title: `Make ${targetVar} the subject: ${formula}`,
        meta: { difficulty: 2, source: 'generated', objectives: ['rearranging formulas'] },
        steps,
      };
    }
  }

  // Generic fallback: just show the approach
  steps.push(step('s2', 'explain', [
    writeOp(`To make ${targetVar} the subject:`, 'explain'),
    writeOp('1. Move all other terms to the other side', 'explain'),
    writeOp(`2. Isolate ${targetVar} (divide, take roots, etc.)`, 'explain'),
  ]));

  return {
    schemaVersion: 1,
    id: `math.solve.rearrange.${Date.now()}`,
    subject: 'math', topic: 'algebra.expressions',
    title: `Make ${targetVar} the subject: ${formula}`,
    meta: { difficulty: 2, source: 'generated', objectives: ['rearranging formulas'] },
    steps,
  };
}
