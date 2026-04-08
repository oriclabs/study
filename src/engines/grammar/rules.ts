/**
 * Grammar rules engine — pattern-based error detection.
 * Each rule tests the input text and returns errors found.
 */

import type { GrammarError } from './types.js';

type Rule = (text: string, words: string[], sentences: string[]) => GrammarError[];

// ─── Commonly confused words ─────────────────────────────────────

const CONFUSED_PAIRS: [RegExp, string, string, string][] = [
  [/\btheir\s+(is|are|was|were|has|have|will|can|should|would|could|do|does|did)\b/gi, 'their', "there", 'confused-their-there'],
  [/\bthere\s+(car|house|book|dog|cat|friend|mother|father|teacher|work|idea)\b/gi, 'there', "their", 'confused-there-their'],
  [/\byour\s+(is|are|was|were|going|coming|doing|welcome)\b/gi, 'your', "you're", 'confused-your-youre'],
  [/\byou're\s+(car|house|book|dog|friend|mother|father|teacher|idea)\b/gi, "you're", "your", 'confused-youre-your'],
  [/\bits\s+(a\s+)?(is|are|was|has|will)\b/gi, 'its', "it's", 'confused-its-its'],
  [/\baffect\b/gi, 'affect', 'effect (noun) / affect (verb)', 'affect-effect'],
  [/\bthen\b(?=\s+(?:I|you|he|she|we|they)\s+(?:am|is|are|was|were))/gi, 'then', 'than', 'confused-then-than'],
  [/\bto\s+(much|many|few|little|big|small|fast|slow|hard|easy)\b/gi, 'to', 'too', 'confused-to-too'],
  [/\baccepted?\s+(?:from|for)\b/gi, 'accept', 'except', 'confused-accept-except'],
];

// ─── Common misspellings ─────────────────────────────────────────

const MISSPELLINGS: Record<string, string> = {
  'accomodate': 'accommodate', 'acheive': 'achieve', 'accross': 'across',
  'agressive': 'aggressive', 'apparantly': 'apparently', 'arguement': 'argument',
  'begining': 'beginning', 'beleive': 'believe', 'buisness': 'business',
  'calender': 'calendar', 'catagory': 'category', 'comming': 'coming',
  'commited': 'committed', 'concious': 'conscious', 'definately': 'definitely',
  'desparate': 'desperate', 'diffrent': 'different', 'dissapear': 'disappear',
  'dissapoint': 'disappoint', 'enviroment': 'environment', 'exagerate': 'exaggerate',
  'excercise': 'exercise', 'existance': 'existence', 'experiance': 'experience',
  'foriegn': 'foreign', 'fourty': 'forty', 'freind': 'friend',
  'goverment': 'government', 'grammer': 'grammar', 'guarentee': 'guarantee',
  'happend': 'happened', 'harrass': 'harass', 'hieght': 'height',
  'humourous': 'humorous', 'immediatly': 'immediately', 'independant': 'independent',
  'intresting': 'interesting', 'knowlege': 'knowledge', 'liason': 'liaison',
  'libary': 'library', 'liscense': 'license', 'maintainance': 'maintenance',
  'millenium': 'millennium', 'mischievious': 'mischievous', 'necesary': 'necessary',
  'neccessary': 'necessary', 'noticable': 'noticeable', 'occassion': 'occasion',
  'occurence': 'occurrence', 'parliment': 'parliament', 'persistant': 'persistent',
  'posession': 'possession', 'prefered': 'preferred', 'privlege': 'privilege',
  'profesional': 'professional', 'publically': 'publicly', 'realy': 'really',
  'recieve': 'receive', 'recomend': 'recommend', 'refered': 'referred',
  'relevent': 'relevant', 'religous': 'religious', 'remeber': 'remember',
  'repitition': 'repetition', 'resturant': 'restaurant', 'rythm': 'rhythm',
  'seperate': 'separate', 'seige': 'siege', 'succesful': 'successful',
  'suprise': 'surprise', 'tommorow': 'tomorrow', 'truely': 'truly',
  'untill': 'until', 'wierd': 'weird', 'writting': 'writing',
  'thier': 'their', 'teh': 'the', 'reccomend': 'recommend',
  'occured': 'occurred', 'alot': 'a lot', 'should of': 'should have',
  'could of': 'could have', 'would of': 'would have',
};

// ─── Rule implementations ────────────────────────────────────────

const checkConfusedWords: Rule = (text) => {
  const errors: GrammarError[] = [];
  for (const [pattern, wrong, right, ruleId] of CONFUSED_PAIRS) {
    let m: RegExpExecArray | null;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((m = re.exec(text)) !== null) {
      errors.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        category: 'grammar',
        message: `Possibly confused "${wrong}" with "${right}".`,
        suggestions: [m[0].replace(new RegExp(wrong, 'i'), right)],
        ruleId,
      });
    }
  }
  return errors;
};

const checkSpelling: Rule = (text) => {
  const errors: GrammarError[] = [];
  const wordRe = /\b[a-z]+\b/gi;
  let m: RegExpExecArray | null;
  while ((m = wordRe.exec(text)) !== null) {
    const word = m[0].toLowerCase();
    const correction = MISSPELLINGS[word];
    if (correction) {
      errors.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        category: 'spelling',
        message: `"${m[0]}" is commonly misspelled. Did you mean "${correction}"?`,
        suggestions: [correction],
        ruleId: 'misspelling',
      });
    }
  }

  // "should of" / "could of" / "would of"
  const ofRe = /\b(should|could|would)\s+of\b/gi;
  while ((m = ofRe.exec(text)) !== null) {
    errors.push({
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      category: 'grammar',
      message: `"${m[0]}" should be "${m[1]} have".`,
      suggestions: [`${m[1]} have`],
      ruleId: 'should-of',
    });
  }

  return errors;
};

const checkPunctuation: Rule = (text, _words, sentences) => {
  const errors: GrammarError[] = [];

  // Sentence should start with capital letter
  for (const sent of sentences) {
    const trimmed = sent.trim();
    if (!trimmed) continue;
    const idx = text.indexOf(trimmed);
    if (idx < 0) continue;
    if (trimmed[0] && /[a-z]/.test(trimmed[0])) {
      errors.push({
        start: idx,
        end: idx + 1,
        text: trimmed[0],
        category: 'punctuation',
        message: 'Sentence should start with a capital letter.',
        suggestions: [trimmed[0].toUpperCase()],
        ruleId: 'capitalize-sentence',
      });
    }
  }

  // Double spaces
  const dblSpace = /  +/g;
  let m: RegExpExecArray | null;
  while ((m = dblSpace.exec(text)) !== null) {
    errors.push({
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      category: 'punctuation',
      message: 'Extra spaces detected.',
      suggestions: [' '],
      ruleId: 'double-space',
    });
  }

  // Missing space after punctuation
  const missingSpace = /[.!?,;:][A-Za-z]/g;
  while ((m = missingSpace.exec(text)) !== null) {
    errors.push({
      start: m.index,
      end: m.index + 2,
      text: m[0],
      category: 'punctuation',
      message: 'Missing space after punctuation.',
      suggestions: [m[0][0] + ' ' + m[0][1]],
      ruleId: 'space-after-punctuation',
    });
  }

  return errors;
};

const checkSubjectVerb: Rule = (text) => {
  const errors: GrammarError[] = [];

  // Simple subject-verb agreement patterns
  const patterns: [RegExp, string, string, string][] = [
    [/\b(I)\s+(is|was not|has)\b/gi, '$1 $2', 'I am / I have', 'sv-i'],
    [/\b(he|she|it)\s+(are|have|were)\b(?!\s+been)/gi, '$1 $2', 'he/she/it is/has/was', 'sv-hesheit'],
    [/\b(they|we)\s+(is|has|was)\b/gi, '$1 $2', 'they/we are/have/were', 'sv-theywe'],
    [/\b(everyone|everybody|someone|somebody|anyone|anybody|nobody|each)\s+(are|have|were)\b/gi, '$1 $2', '$1 is/has/was (singular)', 'sv-indefinite'],
  ];

  for (const [pattern, _replace, suggestion, ruleId] of patterns) {
    let m: RegExpExecArray | null;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((m = re.exec(text)) !== null) {
      errors.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        category: 'grammar',
        message: `Subject-verb agreement: "${m[0]}" — consider "${suggestion}".`,
        suggestions: [suggestion],
        ruleId,
      });
    }
  }

  return errors;
};

const checkStyle: Rule = (text, words) => {
  const errors: GrammarError[] = [];

  // Repeated words: "the the", "is is"
  for (let i = 1; i < words.length; i++) {
    if (words[i]!.toLowerCase() === words[i - 1]!.toLowerCase() && words[i]!.length > 1) {
      const idx = text.toLowerCase().indexOf(words[i - 1]!.toLowerCase() + ' ' + words[i]!.toLowerCase());
      if (idx >= 0) {
        errors.push({
          start: idx,
          end: idx + words[i - 1]!.length + 1 + words[i]!.length,
          text: `${words[i - 1]} ${words[i]}`,
          category: 'style',
          message: `Repeated word: "${words[i]}".`,
          suggestions: [words[i]!],
          ruleId: 'repeated-word',
        });
      }
    }
  }

  // Very long sentences (>40 words)
  const sentenceRe = /[^.!?]+[.!?]+/g;
  let m: RegExpExecArray | null;
  while ((m = sentenceRe.exec(text)) !== null) {
    const wc = m[0].trim().split(/\s+/).length;
    if (wc > 40) {
      errors.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0].trim().slice(0, 50) + '...',
        category: 'style',
        message: `Very long sentence (${wc} words). Consider breaking it up.`,
        suggestions: [],
        ruleId: 'long-sentence',
      });
    }
  }

  return errors;
};

export const ALL_RULES: Rule[] = [
  checkSpelling,
  checkConfusedWords,
  checkPunctuation,
  checkSubjectVerb,
  checkStyle,
];
