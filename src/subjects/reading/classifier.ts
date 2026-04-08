import type { Problem } from '@core/types/strategy.js';

/**
 * Reading comprehension classifier.
 *
 * Takes a question about a passage and classifies it into one of:
 *   'literal'    — finding stated information, sequencing, main idea
 *   'inference'  — drawing conclusions not explicitly stated
 *   'vocabulary' — word meaning in context
 *   'purpose'    — author's purpose or perspective
 *   'tone'       — tone, mood, atmosphere
 *   'evidence'   — identifying or evaluating textual evidence
 *
 * Returns null when the input doesn't look like a reading question.
 */

type ReadingProblemType = 'literal' | 'inference' | 'vocabulary' | 'purpose' | 'tone' | 'evidence';

interface PatternEntry {
  type: ReadingProblemType;
  patterns: RegExp[];
  topic: string;
  goal: string;
}

const CLASSIFICATION_RULES: PatternEntry[] = [
  {
    type: 'vocabulary',
    patterns: [
      /\bword\b.*\bmean/i,
      /\bmeaning\s+of\b/i,
      /\bvocabulary\b/i,
      /\bdefin(?:e|ition)\b/i,
      /\bsynonym\b/i,
      /\bantonym\b/i,
      /\bclosest\s+(?:in\s+)?meaning\b/i,
      /\b(?:used|means?)\s+(?:in|here)\b/i,
      /\bphrase\b.*\bsuggest/i,
      /\bterm\b.*\brefer/i,
    ],
    topic: 'comprehension.vocabulary',
    goal: 'determine word meaning from context',
  },
  {
    type: 'tone',
    patterns: [
      /\btone\b/i,
      /\bmood\b/i,
      /\batmosphere\b/i,
      /\bfeeling\b.*\b(?:passage|text|paragraph|author)\b/i,
      /\b(?:passage|text|paragraph|author)\b.*\bfeeling\b/i,
      /\battitude\b/i,
    ],
    topic: 'analysis.tone',
    goal: 'identify tone or mood',
  },
  {
    type: 'purpose',
    patterns: [
      /\bpurpose\b/i,
      /\bwhy\s+(?:did|does|do)\s+the\s+author\b/i,
      /\bauthor\b.*\b(?:intend|perspective|viewpoint|position|goal|aim)\b/i,
      /\b(?:intend|perspective|viewpoint|position)\b.*\bauthor\b/i,
      /\bpersuade\b/i,
      /\bconvince\b/i,
      /\bwritten\s+(?:in\s+order\s+)?to\b/i,
      /\bmain\s+reason\b.*\bwrite/i,
    ],
    topic: 'analysis.purpose',
    goal: 'determine author purpose',
  },
  {
    type: 'evidence',
    patterns: [
      /\bevidence\b/i,
      /\bsupport\b.*\b(?:answer|conclusion|claim|idea)\b/i,
      /\b(?:which|what)\s+(?:sentence|line|detail|quote|excerpt)\b/i,
      /\bbest\s+(?:supports?|demonstrates?|shows?|illustrates?)\b/i,
      /\btext\s+structure\b/i,
      /\borganiz(?:e|ed|ation)\b.*\b(?:passage|text|paragraph)\b/i,
      /\b(?:passage|text|paragraph)\b.*\borganiz(?:e|ed|ation)\b/i,
    ],
    topic: 'analysis.evidence',
    goal: 'find or evaluate textual evidence',
  },
  {
    type: 'inference',
    patterns: [
      /\binfer\b/i,
      /\bimpl(?:y|ied|ies|ication)\b/i,
      /\bsuggest\b/i,
      /\bconclu(?:de|sion)\b/i,
      /\bmost\s+likely\b/i,
      /\bprobably\b/i,
      /\bassum(?:e|ption)\b/i,
      /\bpredict\b/i,
      /\bcan\s+(?:you|we|be)\s+(?:tell|determine|conclude)\b/i,
    ],
    topic: 'analysis.inference',
    goal: 'make an inference from the text',
  },
  {
    type: 'literal',
    patterns: [
      /\bmain\s+idea\b/i,
      /\bcentral\s+(?:idea|theme|message)\b/i,
      /\bsummar(?:y|ize)\b/i,
      /\baccording\s+to\b/i,
      /\bstated?\s+(?:in|by)\b/i,
      /\bwhich\s+(?:of\s+the\s+following\s+)?(?:is|are)\s+true\b/i,
      /\bwhat\s+(?:happened|happens|did|does|is|are|was|were)\b/i,
      /\bwhen\s+(?:did|does|do)\b/i,
      /\bwhere\s+(?:did|does|do)\b/i,
      /\bwho\s+(?:did|does|is|was|were)\b/i,
      /\bhow\s+(?:many|much|did|does)\b/i,
      /\bsequence\b/i,
      /\border\b.*\bevents?\b/i,
      /\bevents?\b.*\border\b/i,
      /\bfirst\b.*\bthen\b/i,
      /\bdetail\b/i,
    ],
    topic: 'comprehension.stated-info',
    goal: 'find stated information',
  },
];

export function identify(input: string): Problem | null {
  const cleaned = input.trim();
  if (!cleaned) return null;

  // Require at least a few words to look like a reading question.
  if (cleaned.split(/\s+/).length < 3) return null;

  let bestMatch: PatternEntry | null = null;
  let bestConfidence = 0;

  for (const rule of CLASSIFICATION_RULES) {
    const matchCount = rule.patterns.filter(p => p.test(cleaned)).length;
    if (matchCount > 0) {
      const confidence = Math.min(0.95, 0.6 + matchCount * 0.1);
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestMatch = rule;
      }
    }
  }

  if (!bestMatch) return null;

  return {
    type: bestMatch.type,
    subject: 'reading',
    rawInput: cleaned,
    inputs: { question: cleaned },
    goal: bestMatch.goal,
    confidence: bestConfidence,
    topic: bestMatch.topic,
  };
}
