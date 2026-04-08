import type { Problem } from '@core/types/strategy.js';

/**
 * Writing classifier -- identifies what kind of writing task a prompt demands.
 *
 * Problem types:
 *   - 'narrative'   — personal experience, story telling, fiction
 *   - 'persuasive'  — opinion, argument, debate, "should" questions
 *   - 'descriptive' — describe a scene, place, person, or moment
 *   - 'planning'    — essay planning, outlines, structure tasks
 *   - 'editing'     — revise, improve, proofread existing text
 */

const PERSUASIVE_SIGNALS = [
  /\bshould\b/i,
  /\bdo you agree\b/i,
  /\bargue\b/i,
  /\bpersuade\b/i,
  /\bconvince\b/i,
  /\bdebate\b/i,
  /\bopinion\b/i,
  /\bfor or against\b/i,
  /\bis it right\b/i,
  /\bis it fair\b/i,
  /\bto what extent\b/i,
  /\bdiscuss whether\b/i,
];

const NARRATIVE_SIGNALS = [
  /\bwrite about a time\b/i,
  /\btell a story\b/i,
  /\btell the story\b/i,
  /\bwrite a story\b/i,
  /\bnarrate\b/i,
  /\bonce upon\b/i,
  /\bimagine you\b/i,
  /\ba memorable\b/i,
  /\ba time when\b/i,
  /\bpersonal experience\b/i,
  /\bwhat happened when\b/i,
  /\bcontinue the story\b/i,
  /\bwrite about the day\b/i,
];

const DESCRIPTIVE_SIGNALS = [
  /\bdescribe\b/i,
  /\bdescription of\b/i,
  /\bpaint a picture\b/i,
  /\bwhat does .+ look like\b/i,
  /\bfive senses\b/i,
  /\bshow,?\s*don'?t tell\b/i,
  /\bsetting\b/i,
  /\bscene\b/i,
];

const PLANNING_SIGNALS = [
  /\bplan\b/i,
  /\boutline\b/i,
  /\bbrainstorm\b/i,
  /\bmind map\b/i,
  /\bstructure\b/i,
  /\borganise\b/i,
  /\borganize\b/i,
  /\bparagraph plan\b/i,
];

const EDITING_SIGNALS = [
  /\bedit\b/i,
  /\brevise\b/i,
  /\bimprove\b/i,
  /\bproofread\b/i,
  /\brewrite\b/i,
  /\bre-write\b/i,
  /\bcorrect\b/i,
  /\bfix\b/i,
  /\bwhat.s wrong with\b/i,
];

interface TypeScore {
  type: 'narrative' | 'persuasive' | 'descriptive' | 'planning' | 'editing';
  score: number;
  topic: string;
  goal: string;
}

function countMatches(input: string, patterns: RegExp[]): number {
  return patterns.filter(p => p.test(input)).length;
}

export function identify(input: string): Problem | null {
  const cleaned = input.trim();
  if (!cleaned || cleaned.length < 5) return null;

  const candidates: TypeScore[] = [
    {
      type: 'persuasive',
      score: countMatches(cleaned, PERSUASIVE_SIGNALS),
      topic: 'persuasive',
      goal: 'construct a persuasive argument',
    },
    {
      type: 'narrative',
      score: countMatches(cleaned, NARRATIVE_SIGNALS),
      topic: 'narrative',
      goal: 'write a narrative with structure and detail',
    },
    {
      type: 'descriptive',
      score: countMatches(cleaned, DESCRIPTIVE_SIGNALS),
      topic: 'descriptive',
      goal: 'write a vivid description using sensory language',
    },
    {
      type: 'planning',
      score: countMatches(cleaned, PLANNING_SIGNALS),
      topic: 'structure',
      goal: 'create a structured writing plan',
    },
    {
      type: 'editing',
      score: countMatches(cleaned, EDITING_SIGNALS),
      topic: 'mechanics',
      goal: 'revise and improve existing writing',
    },
  ];

  // Sort by score descending, pick the best.
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0]!;

  if (best.score === 0) {
    // No signal matched -- default to narrative (the broadest category).
    return {
      type: 'narrative',
      subject: 'writing',
      rawInput: cleaned,
      goal: 'write a narrative with structure and detail',
      confidence: 0.4,
      topic: 'narrative',
    };
  }

  // Confidence scales with how many signals matched and how dominant the winner is.
  const secondBest = candidates[1]!;
  const gap = best.score - secondBest.score;
  const confidence = Math.min(0.95, 0.5 + gap * 0.15 + best.score * 0.1);

  return {
    type: best.type,
    subject: 'writing',
    rawInput: cleaned,
    goal: best.goal,
    confidence,
    topic: best.topic,
  };
}
