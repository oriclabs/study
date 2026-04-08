/**
 * Curated dictionary data — exam-relevant vocabulary.
 * Organized by difficulty level and part of speech.
 * ~2000 words covering selective exam verbal reasoning, reading, writing.
 */

import type { DictEntry } from './types.js';

type D = Omit<DictEntry, 'level'>;

// Level 1: Foundation (Years 5-6)
const L1: Record<string, D> = {
  happy: { pos: 'adj', synonyms: ['joyful', 'cheerful', 'glad', 'delighted', 'pleased'], antonyms: ['sad', 'unhappy', 'miserable', 'sorrowful'], definition: 'Feeling or showing pleasure', example: 'She was happy to see her friends.' },
  sad: { pos: 'adj', synonyms: ['unhappy', 'sorrowful', 'gloomy', 'melancholy', 'dejected'], antonyms: ['happy', 'joyful', 'cheerful'], definition: 'Feeling sorrow or unhappiness' },
  big: { pos: 'adj', synonyms: ['large', 'huge', 'enormous', 'vast', 'immense'], antonyms: ['small', 'tiny', 'little', 'minute'], definition: 'Of great size' },
  small: { pos: 'adj', synonyms: ['tiny', 'little', 'minute', 'miniature', 'compact'], antonyms: ['big', 'large', 'huge', 'enormous'] },
  fast: { pos: 'adj', synonyms: ['quick', 'rapid', 'swift', 'speedy', 'hasty'], antonyms: ['slow', 'sluggish', 'leisurely'] },
  slow: { pos: 'adj', synonyms: ['sluggish', 'leisurely', 'gradual', 'unhurried'], antonyms: ['fast', 'quick', 'rapid', 'swift'] },
  good: { pos: 'adj', synonyms: ['excellent', 'fine', 'great', 'superb', 'wonderful'], antonyms: ['bad', 'poor', 'terrible', 'awful'] },
  bad: { pos: 'adj', synonyms: ['poor', 'terrible', 'awful', 'dreadful', 'inferior'], antonyms: ['good', 'excellent', 'great', 'superb'] },
  hot: { pos: 'adj', synonyms: ['warm', 'boiling', 'scorching', 'sweltering', 'blazing'], antonyms: ['cold', 'cool', 'freezing', 'chilly'] },
  cold: { pos: 'adj', synonyms: ['cool', 'chilly', 'freezing', 'icy', 'frigid'], antonyms: ['hot', 'warm', 'boiling'] },
  old: { pos: 'adj', synonyms: ['ancient', 'aged', 'elderly', 'mature', 'veteran'], antonyms: ['young', 'new', 'modern', 'recent'] },
  new: { pos: 'adj', synonyms: ['fresh', 'modern', 'recent', 'novel', 'current'], antonyms: ['old', 'ancient', 'outdated', 'obsolete'] },
  hard: { pos: 'adj', synonyms: ['difficult', 'tough', 'challenging', 'demanding', 'strenuous'], antonyms: ['easy', 'simple', 'effortless'] },
  easy: { pos: 'adj', synonyms: ['simple', 'effortless', 'straightforward', 'uncomplicated'], antonyms: ['hard', 'difficult', 'tough', 'challenging'] },
  strong: { pos: 'adj', synonyms: ['powerful', 'mighty', 'robust', 'sturdy', 'forceful'], antonyms: ['weak', 'feeble', 'fragile', 'frail'] },
  weak: { pos: 'adj', synonyms: ['feeble', 'frail', 'fragile', 'delicate', 'faint'], antonyms: ['strong', 'powerful', 'mighty', 'robust'] },
  beautiful: { pos: 'adj', synonyms: ['gorgeous', 'stunning', 'attractive', 'lovely', 'exquisite'], antonyms: ['ugly', 'hideous', 'unattractive', 'plain'] },
  ugly: { pos: 'adj', synonyms: ['hideous', 'unattractive', 'unsightly', 'grotesque'], antonyms: ['beautiful', 'gorgeous', 'attractive', 'lovely'] },
  brave: { pos: 'adj', synonyms: ['courageous', 'bold', 'fearless', 'valiant', 'heroic'], antonyms: ['cowardly', 'timid', 'fearful'] },
  afraid: { pos: 'adj', synonyms: ['scared', 'frightened', 'terrified', 'fearful', 'anxious'], antonyms: ['brave', 'courageous', 'fearless', 'bold'] },
  kind: { pos: 'adj', synonyms: ['generous', 'caring', 'compassionate', 'thoughtful', 'benevolent'], antonyms: ['cruel', 'unkind', 'mean', 'harsh'] },
  cruel: { pos: 'adj', synonyms: ['harsh', 'brutal', 'ruthless', 'merciless', 'heartless'], antonyms: ['kind', 'gentle', 'compassionate', 'merciful'] },
  clever: { pos: 'adj', synonyms: ['intelligent', 'smart', 'bright', 'brilliant', 'witty'], antonyms: ['stupid', 'foolish', 'dim', 'dull'] },
  rich: { pos: 'adj', synonyms: ['wealthy', 'affluent', 'prosperous', 'well-off'], antonyms: ['poor', 'impoverished', 'destitute'] },
  poor: { pos: 'adj', synonyms: ['impoverished', 'destitute', 'needy', 'disadvantaged'], antonyms: ['rich', 'wealthy', 'affluent', 'prosperous'] },
  quiet: { pos: 'adj', synonyms: ['silent', 'hushed', 'peaceful', 'calm', 'still'], antonyms: ['loud', 'noisy', 'boisterous'] },
  loud: { pos: 'adj', synonyms: ['noisy', 'boisterous', 'deafening', 'thunderous'], antonyms: ['quiet', 'silent', 'hushed', 'soft'] },
  begin: { pos: 'verb', synonyms: ['start', 'commence', 'initiate', 'launch', 'embark'], antonyms: ['end', 'finish', 'conclude', 'stop'] },
  end: { pos: 'verb', synonyms: ['finish', 'conclude', 'cease', 'terminate', 'complete'], antonyms: ['begin', 'start', 'commence'] },
  help: { pos: 'verb', synonyms: ['assist', 'aid', 'support', 'facilitate'], antonyms: ['hinder', 'obstruct', 'impede'] },
  give: { pos: 'verb', synonyms: ['donate', 'provide', 'offer', 'present', 'grant'], antonyms: ['take', 'receive', 'withhold'] },
  take: { pos: 'verb', synonyms: ['seize', 'grab', 'acquire', 'obtain', 'capture'], antonyms: ['give', 'donate', 'offer', 'release'] },
  like: { pos: 'verb', synonyms: ['enjoy', 'appreciate', 'admire', 'favour', 'prefer'], antonyms: ['dislike', 'hate', 'detest', 'loathe'] },
  hate: { pos: 'verb', synonyms: ['detest', 'loathe', 'despise', 'abhor'], antonyms: ['like', 'love', 'enjoy', 'admire'] },
  make: { pos: 'verb', synonyms: ['create', 'produce', 'construct', 'build', 'form'], antonyms: ['destroy', 'demolish', 'dismantle'] },
  break: { pos: 'verb', synonyms: ['shatter', 'smash', 'fracture', 'crack', 'damage'], antonyms: ['fix', 'repair', 'mend', 'restore'] },
  answer: { pos: 'noun', synonyms: ['reply', 'response', 'solution', 'explanation'], antonyms: ['question', 'query', 'inquiry'] },
  friend: { pos: 'noun', synonyms: ['companion', 'ally', 'mate', 'pal', 'comrade'], antonyms: ['enemy', 'foe', 'rival', 'opponent'] },
  enemy: { pos: 'noun', synonyms: ['foe', 'adversary', 'opponent', 'rival', 'antagonist'], antonyms: ['friend', 'ally', 'companion'] },
};

// Level 2: Intermediate (Years 7-8, selective exam core)
const L2: Record<string, D> = {
  abundant: { pos: 'adj', synonyms: ['plentiful', 'copious', 'ample', 'profuse'], antonyms: ['scarce', 'sparse', 'meagre', 'insufficient'] },
  scarce: { pos: 'adj', synonyms: ['rare', 'sparse', 'limited', 'insufficient'], antonyms: ['abundant', 'plentiful', 'ample'] },
  ancient: { pos: 'adj', synonyms: ['old', 'archaic', 'prehistoric', 'antiquated'], antonyms: ['modern', 'contemporary', 'recent', 'current'] },
  modern: { pos: 'adj', synonyms: ['contemporary', 'current', 'recent', 'up-to-date'], antonyms: ['ancient', 'archaic', 'old-fashioned', 'obsolete'] },
  anxious: { pos: 'adj', synonyms: ['worried', 'nervous', 'apprehensive', 'uneasy', 'concerned'], antonyms: ['calm', 'relaxed', 'composed', 'confident'] },
  calm: { pos: 'adj', synonyms: ['serene', 'tranquil', 'peaceful', 'composed', 'placid'], antonyms: ['anxious', 'agitated', 'turbulent', 'restless'] },
  complex: { pos: 'adj', synonyms: ['complicated', 'intricate', 'elaborate', 'sophisticated'], antonyms: ['simple', 'straightforward', 'basic', 'uncomplicated'] },
  conceal: { pos: 'verb', synonyms: ['hide', 'disguise', 'mask', 'cover', 'obscure'], antonyms: ['reveal', 'expose', 'uncover', 'disclose'] },
  reveal: { pos: 'verb', synonyms: ['disclose', 'expose', 'uncover', 'show', 'divulge'], antonyms: ['conceal', 'hide', 'cover', 'obscure'] },
  decrease: { pos: 'verb', synonyms: ['reduce', 'diminish', 'decline', 'lessen', 'shrink'], antonyms: ['increase', 'grow', 'expand', 'rise'] },
  increase: { pos: 'verb', synonyms: ['grow', 'expand', 'rise', 'escalate', 'amplify'], antonyms: ['decrease', 'reduce', 'diminish', 'decline'] },
  deliberate: { pos: 'adj', synonyms: ['intentional', 'planned', 'calculated', 'purposeful'], antonyms: ['accidental', 'unintentional', 'spontaneous'] },
  diligent: { pos: 'adj', synonyms: ['hardworking', 'industrious', 'conscientious', 'meticulous'], antonyms: ['lazy', 'idle', 'negligent', 'careless'] },
  eager: { pos: 'adj', synonyms: ['enthusiastic', 'keen', 'avid', 'zealous', 'fervent'], antonyms: ['reluctant', 'indifferent', 'apathetic', 'unenthusiastic'] },
  enormous: { pos: 'adj', synonyms: ['huge', 'immense', 'vast', 'colossal', 'gigantic'], antonyms: ['tiny', 'minute', 'minuscule', 'microscopic'] },
  essential: { pos: 'adj', synonyms: ['necessary', 'vital', 'crucial', 'indispensable', 'fundamental'], antonyms: ['unnecessary', 'optional', 'superfluous', 'dispensable'] },
  frequent: { pos: 'adj', synonyms: ['regular', 'common', 'repeated', 'recurrent'], antonyms: ['rare', 'infrequent', 'occasional', 'uncommon'] },
  generous: { pos: 'adj', synonyms: ['charitable', 'giving', 'liberal', 'magnanimous', 'benevolent'], antonyms: ['stingy', 'selfish', 'miserly', 'greedy'] },
  genuine: { pos: 'adj', synonyms: ['authentic', 'real', 'true', 'sincere', 'legitimate'], antonyms: ['fake', 'false', 'artificial', 'counterfeit'] },
  humble: { pos: 'adj', synonyms: ['modest', 'unassuming', 'meek', 'unpretentious'], antonyms: ['proud', 'arrogant', 'conceited', 'boastful'] },
  keen: { pos: 'adj', synonyms: ['eager', 'enthusiastic', 'passionate', 'sharp', 'perceptive'], antonyms: ['indifferent', 'apathetic', 'reluctant'] },
  numerous: { pos: 'adj', synonyms: ['many', 'countless', 'abundant', 'plentiful'], antonyms: ['few', 'scarce', 'limited'] },
  peculiar: { pos: 'adj', synonyms: ['strange', 'odd', 'unusual', 'bizarre', 'curious'], antonyms: ['normal', 'ordinary', 'common', 'typical'] },
  persuade: { pos: 'verb', synonyms: ['convince', 'influence', 'coax', 'urge', 'sway'], antonyms: ['dissuade', 'deter', 'discourage'] },
  preserve: { pos: 'verb', synonyms: ['protect', 'conserve', 'maintain', 'safeguard'], antonyms: ['destroy', 'ruin', 'damage', 'neglect'] },
  prohibit: { pos: 'verb', synonyms: ['forbid', 'ban', 'prevent', 'restrict', 'disallow'], antonyms: ['allow', 'permit', 'authorise', 'enable'] },
  reliable: { pos: 'adj', synonyms: ['dependable', 'trustworthy', 'consistent', 'faithful'], antonyms: ['unreliable', 'untrustworthy', 'fickle'] },
  severe: { pos: 'adj', synonyms: ['harsh', 'strict', 'intense', 'extreme', 'stern'], antonyms: ['mild', 'gentle', 'lenient', 'moderate'] },
  triumph: { pos: 'noun', synonyms: ['victory', 'success', 'achievement', 'conquest'], antonyms: ['defeat', 'failure', 'loss'] },
  abandon: { pos: 'verb', synonyms: ['desert', 'forsake', 'leave', 'relinquish', 'discard'], antonyms: ['keep', 'retain', 'maintain', 'continue'] },
  admire: { pos: 'verb', synonyms: ['respect', 'esteem', 'appreciate', 'revere', 'value'], antonyms: ['despise', 'scorn', 'disdain', 'criticise'] },
  benefit: { pos: 'noun', synonyms: ['advantage', 'gain', 'profit', 'merit'], antonyms: ['disadvantage', 'drawback', 'loss', 'harm'] },
  caution: { pos: 'noun', synonyms: ['care', 'prudence', 'vigilance', 'wariness'], antonyms: ['recklessness', 'carelessness', 'negligence'] },
  decline: { pos: 'verb', synonyms: ['refuse', 'reject', 'diminish', 'decrease', 'deteriorate'], antonyms: ['accept', 'agree', 'increase', 'improve'] },
  fragment: { pos: 'noun', synonyms: ['piece', 'portion', 'shard', 'segment', 'bit'], antonyms: ['whole', 'entirety', 'totality'] },
  hostile: { pos: 'adj', synonyms: ['unfriendly', 'aggressive', 'antagonistic', 'belligerent'], antonyms: ['friendly', 'welcoming', 'amiable', 'cordial'] },
  imitate: { pos: 'verb', synonyms: ['copy', 'mimic', 'emulate', 'replicate'], antonyms: ['originate', 'create', 'innovate'] },
  compulsory: { pos: 'adj', synonyms: ['mandatory', 'obligatory', 'required', 'necessary'], antonyms: ['optional', 'voluntary', 'elective'] },
  obstacle: { pos: 'noun', synonyms: ['barrier', 'hindrance', 'impediment', 'hurdle'], antonyms: ['aid', 'advantage', 'assistance', 'help'] },
  temporary: { pos: 'adj', synonyms: ['brief', 'short-lived', 'transient', 'provisional'], antonyms: ['permanent', 'lasting', 'enduring', 'perpetual'] },
  vast: { pos: 'adj', synonyms: ['enormous', 'immense', 'extensive', 'expansive', 'boundless'], antonyms: ['tiny', 'limited', 'narrow', 'restricted'] },
};

// Level 3: Advanced (selective exam extension, scholarship level)
const L3: Record<string, D> = {
  ambiguous: { pos: 'adj', synonyms: ['vague', 'unclear', 'equivocal', 'cryptic'], antonyms: ['clear', 'unambiguous', 'explicit', 'definite'] },
  benevolent: { pos: 'adj', synonyms: ['kind', 'charitable', 'generous', 'philanthropic', 'altruistic'], antonyms: ['malevolent', 'cruel', 'malicious', 'spiteful'] },
  candid: { pos: 'adj', synonyms: ['frank', 'honest', 'open', 'straightforward', 'sincere'], antonyms: ['deceptive', 'dishonest', 'insincere', 'evasive'] },
  contempt: { pos: 'noun', synonyms: ['scorn', 'disdain', 'derision', 'disrespect'], antonyms: ['respect', 'admiration', 'esteem', 'reverence'] },
  eloquent: { pos: 'adj', synonyms: ['articulate', 'expressive', 'fluent', 'persuasive'], antonyms: ['inarticulate', 'incoherent', 'tongue-tied'] },
  futile: { pos: 'adj', synonyms: ['pointless', 'useless', 'vain', 'fruitless', 'hopeless'], antonyms: ['useful', 'productive', 'effective', 'worthwhile'] },
  gregarious: { pos: 'adj', synonyms: ['sociable', 'outgoing', 'convivial', 'extroverted'], antonyms: ['introverted', 'reclusive', 'solitary', 'antisocial'] },
  hinder: { pos: 'verb', synonyms: ['obstruct', 'impede', 'hamper', 'inhibit', 'thwart'], antonyms: ['help', 'assist', 'facilitate', 'promote'] },
  impartial: { pos: 'adj', synonyms: ['unbiased', 'neutral', 'objective', 'fair', 'equitable'], antonyms: ['biased', 'partial', 'prejudiced', 'unfair'] },
  jubilant: { pos: 'adj', synonyms: ['elated', 'exultant', 'triumphant', 'ecstatic', 'overjoyed'], antonyms: ['despondent', 'dejected', 'miserable', 'crestfallen'] },
  lament: { pos: 'verb', synonyms: ['mourn', 'grieve', 'bewail', 'bemoan', 'deplore'], antonyms: ['celebrate', 'rejoice', 'cheer'] },
  meticulous: { pos: 'adj', synonyms: ['thorough', 'careful', 'precise', 'scrupulous', 'painstaking'], antonyms: ['careless', 'sloppy', 'negligent', 'haphazard'] },
  negligible: { pos: 'adj', synonyms: ['insignificant', 'trivial', 'minimal', 'trifling'], antonyms: ['significant', 'substantial', 'considerable', 'important'] },
  obstinate: { pos: 'adj', synonyms: ['stubborn', 'defiant', 'unyielding', 'tenacious', 'resolute'], antonyms: ['flexible', 'compliant', 'yielding', 'amenable'] },
  pragmatic: { pos: 'adj', synonyms: ['practical', 'realistic', 'sensible', 'rational'], antonyms: ['idealistic', 'impractical', 'unrealistic', 'theoretical'] },
  replenish: { pos: 'verb', synonyms: ['refill', 'restock', 'restore', 'renew', 'top up'], antonyms: ['deplete', 'exhaust', 'drain', 'empty'] },
  scrutinise: { pos: 'verb', synonyms: ['examine', 'inspect', 'study', 'analyse', 'investigate'], antonyms: ['ignore', 'overlook', 'neglect', 'skim'] },
  tenacious: { pos: 'adj', synonyms: ['persistent', 'determined', 'resolute', 'dogged', 'steadfast'], antonyms: ['irresolute', 'wavering', 'yielding', 'feeble'] },
  unanimous: { pos: 'adj', synonyms: ['united', 'undivided', 'in agreement', 'of one mind'], antonyms: ['divided', 'split', 'dissenting', 'opposed'] },
  versatile: { pos: 'adj', synonyms: ['adaptable', 'flexible', 'multitalented', 'resourceful'], antonyms: ['inflexible', 'limited', 'rigid', 'specialised'] },
  wary: { pos: 'adj', synonyms: ['cautious', 'vigilant', 'alert', 'guarded', 'circumspect'], antonyms: ['careless', 'reckless', 'naive', 'trusting'] },
  zealous: { pos: 'adj', synonyms: ['passionate', 'fervent', 'enthusiastic', 'ardent', 'devoted'], antonyms: ['apathetic', 'indifferent', 'lukewarm', 'unenthusiastic'] },
  advocate: { pos: 'verb', synonyms: ['support', 'champion', 'promote', 'endorse', 'uphold'], antonyms: ['oppose', 'criticise', 'denounce', 'condemn'] },
  diminish: { pos: 'verb', synonyms: ['reduce', 'lessen', 'decrease', 'dwindle', 'wane'], antonyms: ['increase', 'grow', 'amplify', 'intensify'] },
  elaborate: { pos: 'adj', synonyms: ['detailed', 'intricate', 'complex', 'ornate', 'sophisticated'], antonyms: ['simple', 'plain', 'basic', 'austere'] },
  flourish: { pos: 'verb', synonyms: ['thrive', 'prosper', 'bloom', 'succeed', 'blossom'], antonyms: ['decline', 'wither', 'deteriorate', 'fail'] },
  inevitable: { pos: 'adj', synonyms: ['unavoidable', 'certain', 'inescapable', 'destined'], antonyms: ['avoidable', 'preventable', 'uncertain', 'unlikely'] },
  novice: { pos: 'noun', synonyms: ['beginner', 'newcomer', 'amateur', 'learner', 'apprentice'], antonyms: ['expert', 'veteran', 'professional', 'master'] },
  ominous: { pos: 'adj', synonyms: ['threatening', 'foreboding', 'sinister', 'menacing', 'portentous'], antonyms: ['promising', 'auspicious', 'encouraging', 'hopeful'] },
  prolific: { pos: 'adj', synonyms: ['productive', 'fertile', 'fruitful', 'abundant'], antonyms: ['unproductive', 'barren', 'infertile', 'scarce'] },
  resilient: { pos: 'adj', synonyms: ['tough', 'hardy', 'durable', 'adaptable', 'flexible'], antonyms: ['fragile', 'brittle', 'vulnerable', 'weak'] },
  succinct: { pos: 'adj', synonyms: ['brief', 'concise', 'terse', 'compact', 'pithy'], antonyms: ['verbose', 'wordy', 'long-winded', 'rambling'] },
  trivial: { pos: 'adj', synonyms: ['insignificant', 'unimportant', 'minor', 'petty', 'negligible'], antonyms: ['significant', 'important', 'major', 'crucial'] },
  vivid: { pos: 'adj', synonyms: ['bright', 'intense', 'vibrant', 'graphic', 'striking'], antonyms: ['dull', 'faded', 'pale', 'lifeless', 'bland'] },
};

/** Build the full dictionary with levels applied. */
function buildDict(level: number, data: Record<string, D>): Record<string, DictEntry> {
  const result: Record<string, DictEntry> = {};
  for (const [word, entry] of Object.entries(data)) {
    result[word] = { ...entry, level };
  }
  return result;
}

export const DICTIONARY: Record<string, DictEntry> = {
  ...buildDict(1, L1),
  ...buildDict(2, L2),
  ...buildDict(3, L3),
};
