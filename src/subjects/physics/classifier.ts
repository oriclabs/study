import type { Problem } from '@core/types/strategy.js';

/**
 * Physics problem classifier.
 *
 * Accepts structured input like:
 *   "u=5, a=2, t=3, find v"
 *   "u=0 v=20 a=10 find s"
 *   "given v=15, a=-2, s=50, find u"
 *
 * Extracts named inputs and a goal variable. More sophisticated word-problem
 * classification would use build-time LLM tagging — this simple parser
 * covers the pattern teachers actually use when presenting formula problems.
 */

const KINEMATIC_VARS = new Set(['u', 'v', 'a', 't', 's']);

export function identify(input: string): Problem | null {
  const cleaned = input.trim().toLowerCase();
  if (!cleaned) return null;

  // Extract variable assignments: name=value
  const assignRe = /([a-z]+)\s*=\s*(-?\d+\.?\d*)/g;
  const inputs: Record<string, number> = {};
  let m: RegExpExecArray | null;
  while ((m = assignRe.exec(cleaned)) !== null) {
    const name = m[1]!;
    const value = parseFloat(m[2]!);
    if (!isNaN(value)) inputs[name] = value;
  }

  // Extract goal: "find X" or "solve for X"
  const goalMatch = cleaned.match(/(?:find|solve\s+for|calculate)\s+([a-z]+)/);
  if (!goalMatch) return null;
  const goalVar = goalMatch[1]!;

  // Determine problem type by input vocabulary
  const keys = Object.keys(inputs);
  const isKinematic = keys.length > 0 && keys.every(k => KINEMATIC_VARS.has(k)) && KINEMATIC_VARS.has(goalVar);

  if (!isKinematic) return null;

  // Require at least 2 known inputs besides the goal
  if (keys.length < 2) return null;

  return {
    type: 'kinematics',
    subject: 'physics',
    rawInput: input,
    inputs,
    goal: `find ${goalVar}`,
    confidence: 0.95,
    topic: 'mechanics.kinematics',
  };
}
