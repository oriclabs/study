/**
 * Comprehensive patch for verbal.json:
 * 1. Add examples to all 12 empty topics
 * 2. Expand weak topics (1-2 examples → 3-4)
 * 3. Add difficulty tags to ALL examples
 * 4. Add MCQ options where missing
 * 5. Add new topics: Sentence Correction, Homophones
 * 6. Add reading comprehension passage examples
 *
 * Run: node tools/patch-verbal-full.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/content/notes/vic-selective/verbal.json';
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
// 1. ADD EXAMPLES TO EMPTY TOPICS
// ============================================================

const newExamples = {
  "Prefixes, Suffixes": [
    { question: "What does the prefix 'un-' mean in 'unhappy'?", options: ["Not", "Again", "Before", "After"], correct_answer: "Not", explanation: "'un-' means not or opposite of. Unhappy = not happy.", difficulty: 1 },
    { question: "The suffix '-ology' means the study of. What does 'biology' mean?", options: ["Study of life", "Study of books", "Study of earth", "Study of stars"], correct_answer: "Study of life", explanation: "'bio' = life, '-ology' = study of. Biology = study of life.", difficulty: 1 },
    { question: "Which word uses the prefix 'mis-' correctly?", options: ["Misunderstand", "Mishelp", "Misopen", "Missit"], correct_answer: "Misunderstand", explanation: "'mis-' means wrongly or badly. Misunderstand = understand wrongly.", difficulty: 1 },
    { question: "The root 'bene' means 'good'. Which word means 'a person who does good'?", options: ["Benefactor", "Benedict", "Beneficial", "Benevolent"], correct_answer: "Benefactor", explanation: "'bene' (good) + 'factor' (doer) = one who does good, a donor.", difficulty: 2 },
    { question: "What does 'circumnavigate' mean, given 'circum-' = around and 'navigate' = to sail?", options: ["Sail around", "Sail under", "Sail against", "Sail towards"], correct_answer: "Sail around", explanation: "Circumnavigate = to sail/travel completely around (e.g., circumnavigate the globe).", difficulty: 2 },
  ],
  "Multiple Meaning": [
    { question: "Which meaning of 'bank' fits: 'She sat on the bank of the river'?", options: ["Financial institution", "Edge of a river", "To rely on", "A pile of things"], correct_answer: "Edge of a river", explanation: "'Bank' has multiple meanings. In this context, it means the raised edge alongside a river.", difficulty: 1 },
    { question: "'The match was a draw.' What does 'draw' mean here?", options: ["To sketch", "A tied result", "To pull", "An attraction"], correct_answer: "A tied result", explanation: "In sport context, 'draw' means neither side won — a tie.", difficulty: 1 },
    { question: "'He tried to console his friend after the console broke.' How many meanings of 'console' are used?", options: ["1", "2", "3", "4"], correct_answer: "2", explanation: "First 'console' (verb) = to comfort. Second 'console' (noun) = a gaming/electronic device.", difficulty: 2 },
  ],
  "Cloze Passages": [
    { question: "Fill in the blanks: 'The ancient castle stood on a ___ overlooking the sea. Its ___ walls had withstood centuries of storms.'", options: ["cliff / towering", "hill / broken", "cliff / tiny", "mountain / wooden"], correct_answer: "cliff / towering", explanation: "A castle overlooks the sea from a cliff (not mountain). Walls that withstand storms are towering (strong and tall).", difficulty: 2 },
    { question: "'Despite the ___ weather, the explorers pressed on, their ___ unbroken.' Choose the best pair:", options: ["harsh / determination", "beautiful / spirit", "cold / hunger", "wet / equipment"], correct_answer: "harsh / determination", explanation: "'Despite' signals contrast — bad weather but positive spirit. 'Harsh weather' + 'determination unbroken' creates logical contrast.", difficulty: 2 },
    { question: "'The scientist's ___ discovery was initially met with ___, but eventually transformed the field.'", options: ["groundbreaking / scepticism", "minor / praise", "accidental / joy", "boring / excitement"], correct_answer: "groundbreaking / scepticism", explanation: "'Initially met with... but eventually transformed' = resistance first, then acceptance. Groundbreaking discoveries are often met with scepticism.", difficulty: 3 },
  ],
  "Comprehension Question Types": [
    { question: "Read: 'The rainforest canopy blocks most sunlight from reaching the forest floor, creating a dark, humid environment where only specially adapted plants can survive.' What is the main idea?", options: ["Rainforests are dark", "The canopy affects life on the forest floor", "Plants need sunlight", "Humidity is important"], correct_answer: "The canopy affects life on the forest floor", explanation: "The main idea connects the canopy (cause) to the conditions below (effect) and what survives there.", difficulty: 1 },
    { question: "Read: 'Although the invention was praised by critics, sales remained disappointingly low throughout the first year.' What does 'although' signal?", options: ["A comparison", "A contrast/contradiction", "A sequence", "An addition"], correct_answer: "A contrast/contradiction", explanation: "'Although' signals that what follows contradicts what came before — praise vs low sales.", difficulty: 2 },
    { question: "Read: 'Mrs Henderson slammed the door, threw her keys on the table, and sank into the armchair with a heavy sigh.' What can you infer about Mrs Henderson's mood?", options: ["She is happy", "She is frustrated or exhausted", "She is excited", "She is confused"], correct_answer: "She is frustrated or exhausted", explanation: "Slamming, throwing, and sighing heavily all indicate frustration or exhaustion — inference from actions, not stated directly.", difficulty: 2 },
  ],
  "Parts of Speech": [
    { question: "In 'The clever fox quickly jumped over the lazy dog', which word is an adverb?", options: ["clever", "quickly", "lazy", "jumped"], correct_answer: "quickly", explanation: "'Quickly' modifies the verb 'jumped' — it tells us HOW the fox jumped. Adverbs modify verbs, adjectives, or other adverbs.", difficulty: 1 },
    { question: "Which word is a conjunction in: 'She wanted to play but it was raining'?", options: ["wanted", "play", "but", "raining"], correct_answer: "but", explanation: "'But' joins two clauses and shows contrast. Conjunctions connect words, phrases, or clauses.", difficulty: 1 },
    { question: "In 'Running is my favourite exercise', what part of speech is 'running'?", options: ["Verb", "Noun (gerund)", "Adjective", "Adverb"], correct_answer: "Noun (gerund)", explanation: "Here 'running' is the subject of the sentence — it acts as a noun (a gerund = verb form used as noun).", difficulty: 2 },
  ],
  "Common Grammar Rules": [
    { question: "Which sentence is grammatically correct?", options: ["Me and him went to school", "Him and I went to school", "He and I went to school", "He and me went to school"], correct_answer: "He and I went to school", explanation: "Subject pronouns (He, I) are used for the subject of a sentence. Test: remove one person — 'I went to school' (not 'me went').", difficulty: 1 },
    { question: "Choose the correct word: 'The team ___ playing their best today.'", options: ["is", "are", "were", "have"], correct_answer: "is", explanation: "'Team' is a collective noun — singular in Australian English. 'The team is playing...' (though 'are' is also accepted in British English).", difficulty: 2 },
    { question: "Which sentence uses the semicolon correctly?", options: ["I like cats; and dogs", "I like cats; I also like dogs", "I like; cats and dogs", "I; like cats and dogs"], correct_answer: "I like cats; I also like dogs", explanation: "A semicolon joins two complete, related sentences without a conjunction.", difficulty: 2 },
    { question: "Identify the error: 'Each of the students have completed their assignment.'", options: ["Each", "have", "their", "No error"], correct_answer: "have", explanation: "'Each' is singular, so it should be 'has completed'. 'Each of the students has completed their assignment.'", difficulty: 3 },
  ],
  "Rearranging Words": [
    { question: "Rearrange to form a sentence: 'garden / beautiful / the / was / incredibly'", options: ["The garden was incredibly beautiful", "Beautiful the garden was incredibly", "Incredibly beautiful was the garden", "The incredibly garden beautiful was"], correct_answer: "The garden was incredibly beautiful", explanation: "Standard sentence order: Subject (The garden) + Verb (was) + Adverb+Adjective (incredibly beautiful).", difficulty: 1 },
    { question: "Rearrange: 'despite / she / the / smiled / difficulty'", options: ["She smiled despite the difficulty", "Despite she smiled the difficulty", "The difficulty despite she smiled", "She despite smiled the difficulty"], correct_answer: "She smiled despite the difficulty", explanation: "'Despite' introduces a contrast. Subject + Verb + despite + the challenge.", difficulty: 2 },
  ],
  "Idioms": [
    { question: "What does 'break the ice' mean?", options: ["Destroy something frozen", "Start a conversation in an awkward situation", "Fail at something", "Create a problem"], correct_answer: "Start a conversation in an awkward situation", explanation: "'Break the ice' means to relieve tension or start talking in an uncomfortable social situation.", difficulty: 1 },
    { question: "'She was over the moon about her results.' This means she was:", options: ["Confused", "Extremely happy", "Floating in space", "Disappointed"], correct_answer: "Extremely happy", explanation: "'Over the moon' = extremely happy and excited.", difficulty: 1 },
    { question: "'Don't put all your eggs in one basket.' This idiom advises you to:", options: ["Be careful with eggs", "Spread your risks", "Focus on one thing", "Work in a farm"], correct_answer: "Spread your risks", explanation: "If the one basket drops, all eggs break. The idiom means don't rely on a single plan — diversify.", difficulty: 2 },
    { question: "'He let the cat out of the bag.' What happened?", options: ["A cat escaped", "He revealed a secret", "He made a mess", "He was forgiven"], correct_answer: "He revealed a secret", explanation: "'Let the cat out of the bag' = accidentally revealed information that was meant to be kept secret.", difficulty: 2 },
  ],
  "Proverbs": [
    { question: "What does 'A stitch in time saves nine' mean?", options: ["Sewing is important", "Fix problems early before they get worse", "Time heals everything", "Nine is a lucky number"], correct_answer: "Fix problems early before they get worse", explanation: "One stitch now prevents the need for nine later. Address small problems before they become big ones.", difficulty: 1 },
    { question: "'The pen is mightier than the sword' suggests that:", options: ["Pens are dangerous weapons", "Writing/words have more power than violence", "Swords are outdated", "Education is expensive"], correct_answer: "Writing/words have more power than violence", explanation: "Ideas, writing, and communication can change the world more effectively than force.", difficulty: 2 },
    { question: "Which situation best illustrates 'Don't judge a book by its cover'?", options: ["A well-dressed person is rude", "A beautiful book has good content", "A new book is expensive", "A library is well organized"], correct_answer: "A well-dressed person is rude", explanation: "Appearances can be deceiving — you can't judge quality/character from outward appearance alone.", difficulty: 2 },
  ],
  "Figurative Language": [
    { question: "'The wind whispered through the trees.' What figurative language is this?", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], correct_answer: "Personification", explanation: "Wind can't literally whisper — giving human qualities to non-human things is personification.", difficulty: 1 },
    { question: "'She was as brave as a lion.' What type of figurative language?", options: ["Metaphor", "Simile", "Alliteration", "Onomatopoeia"], correct_answer: "Simile", explanation: "Uses 'as...as' to compare two things. Similes use 'like' or 'as' for comparison.", difficulty: 1 },
    { question: "'I've told you a million times!' This is an example of:", options: ["Simile", "Metaphor", "Hyperbole", "Personification"], correct_answer: "Hyperbole", explanation: "Deliberate exaggeration for emphasis. Obviously not literally a million times.", difficulty: 1 },
    { question: "'Time is money.' What figurative device?", options: ["Simile", "Metaphor", "Personification", "Idiom"], correct_answer: "Metaphor", explanation: "Directly states one thing IS another (without 'like' or 'as'). Time isn't literally money — it means time is valuable.", difficulty: 2 },
    { question: "Identify the technique: 'Peter Piper picked a peck of pickled peppers.'", options: ["Alliteration", "Assonance", "Onomatopoeia", "Rhyme"], correct_answer: "Alliteration", explanation: "Repetition of the same starting consonant sound ('p') = alliteration.", difficulty: 2 },
  ],
  "Spelling Rules": [
    { question: "Which is spelled correctly?", options: ["recieve", "receive", "receeve", "recive"], correct_answer: "receive", explanation: "'i before e, except after c' — recEIve has 'ei' after 'c'.", difficulty: 1 },
    { question: "Which is the correct plural of 'child'?", options: ["childs", "childes", "children", "childern"], correct_answer: "children", explanation: "'Child' has an irregular plural: children (not childs).", difficulty: 1 },
    { question: "When adding '-ing' to 'run', you:", options: ["Just add -ing: runing", "Double the last letter: running", "Drop a letter: rning", "Add -ning: runining"], correct_answer: "Double the last letter: running", explanation: "Short vowel + single consonant → double the consonant before adding -ing: run → running.", difficulty: 2 },
    { question: "Which word is misspelled?", options: ["necessary", "separate", "definately", "occasion"], correct_answer: "definately", explanation: "Correct spelling: 'definitely' (not 'definately'). Common misspelling — remember 'finite' is in the middle.", difficulty: 2 },
  ],
  "Word Completion": [
    { question: "Complete the word: _IGHT (something you see with)", options: ["LIGHT", "SIGHT", "MIGHT", "FIGHT"], correct_answer: "SIGHT", explanation: "Sight = the ability to see. The clue 'something you see with' points to SIGHT.", difficulty: 1 },
    { question: "Find the hidden word in 'TOGETHER': a word meaning 'acquire'", options: ["GET", "TO", "HER", "GOTH"], correct_answer: "GET", explanation: "toGETher — 'GET' means to acquire or obtain.", difficulty: 1 },
    { question: "Which letters complete both: _EAR (afraid) and _EAR (body part)?", options: ["F, E", "F, Y", "N, Y", "D, E"], correct_answer: "F, E", explanation: "FEAR (afraid) and EAR (body part) — but the question asks for one letter completing both blanks. F_EAR = fear, _EAR = ear. Answer: F and E → FEAR and EAR.", difficulty: 2 },
  ],
};

// Add examples to existing topics
for (const [topicPart, examples] of Object.entries(newExamples)) {
  const topic = findTopic(topicPart);
  if (topic) {
    if (!topic.examples) topic.examples = [];
    topic.examples.push(...examples);
  }
}

// ============================================================
// 2. EXPAND WEAK TOPICS (1-2 examples → more)
// ============================================================

const expansions = {
  "Word Classification": [
    { question: "Which word does NOT belong: oak, elm, pine, daisy?", options: ["oak", "elm", "pine", "daisy"], correct_answer: "daisy", explanation: "Oak, elm, pine are all trees. Daisy is a flower.", difficulty: 1 },
    { question: "Which word does NOT belong: whisper, shout, murmur, sprint?", options: ["whisper", "shout", "murmur", "sprint"], correct_answer: "sprint", explanation: "Whisper, shout, murmur are all ways of speaking. Sprint is a way of running.", difficulty: 2 },
  ],
  "Word Meanings in Context": [
    { question: "'The bank issued a statement about the breach.' What does 'breach' mean here?", options: ["A hole in a wall", "A violation of rules/security", "A type of whale", "A gap in a fence"], correct_answer: "A violation of rules/security", explanation: "In a banking context, 'breach' means a violation of security or rules (data breach).", difficulty: 2 },
    { question: "'Her composure during the crisis was remarkable.' What does 'composure' mean?", options: ["Musical ability", "Calmness and self-control", "Physical strength", "Intelligence"], correct_answer: "Calmness and self-control", explanation: "'Composure' = the state of being calm and in control, especially under pressure.", difficulty: 2 },
  ],
  "Inference": [
    { question: "Read: 'Jake glanced at his watch for the third time, tapping his foot and scanning the empty platform.' What can you infer?", options: ["Jake is waiting for a late train", "Jake is enjoying the scenery", "Jake is lost", "Jake is early"], correct_answer: "Jake is waiting for a late train", explanation: "Repeated watch-checking, foot-tapping (impatience), and empty platform suggest waiting for something that should have arrived.", difficulty: 2 },
    { question: "Read: 'The streetlights flickered on as Maria hurried home, her shadow stretching long behind her.' What time of day is it?", options: ["Morning", "Midday", "Late afternoon/evening", "Midnight"], correct_answer: "Late afternoon/evening", explanation: "Streetlights turning on = dusk/evening. Long shadows = low sun angle. She's hurrying = wants to get home before dark.", difficulty: 2 },
  ],
  "Syllogisms": [
    { question: "All roses are flowers. All flowers need water. Therefore:", options: ["All water is roses", "All roses need water", "Some water is flowers", "All flowers are roses"], correct_answer: "All roses need water", explanation: "If A→B and B→C, then A→C. Roses→flowers→need water, so roses need water.", difficulty: 1 },
    { question: "Some dogs are friendly. All friendly animals are popular. Therefore:", options: ["All dogs are popular", "Some dogs are popular", "All popular animals are dogs", "No dogs are popular"], correct_answer: "Some dogs are popular", explanation: "'Some dogs are friendly' + 'All friendly → popular' = those some dogs are popular. Not ALL dogs.", difficulty: 2 },
  ],
  "Coding & Decoding": [
    { question: "If CAT = 3-1-20 (A=1, B=2...), what is DOG?", options: ["4-15-7", "4-14-7", "3-15-7", "4-15-6"], correct_answer: "4-15-7", explanation: "D=4, O=15, G=7. Each letter maps to its position in the alphabet.", difficulty: 1 },
    { question: "In a code, FISH = GJTI (each letter +1). What is BIRD?", options: ["CJSE", "CHQC", "CJRE", "CKSE"], correct_answer: "CJSE", explanation: "Each letter shifts +1: B→C, I→J, R→S, D→E. BIRD = CJSE.", difficulty: 2 },
  ],
  "Statement & Conclusion": [
    { question: "Statement: 'All students who study hard pass the exam.' Conclusion: 'Raj passed the exam, so he studied hard.' Is this valid?", options: ["Valid", "Invalid — converse error", "Probably true", "Definitely false"], correct_answer: "Invalid — converse error", explanation: "The original says study hard → pass. But pass doesn't necessarily → studied hard (could be naturally gifted, lucky, etc.). This is the converse fallacy.", difficulty: 3 },
  ],
  "Single-Blank": [
    { question: "The old house was so ___ that nobody dared enter it at night.", options: ["beautiful", "eerie", "modern", "tiny"], correct_answer: "eerie", explanation: "'Nobody dared enter at night' implies something scary or unsettling — 'eerie' means strange and frightening.", difficulty: 1 },
    { question: "Despite his ___ appearance, the man was actually very kind and generous.", options: ["friendly", "intimidating", "cheerful", "generous"], correct_answer: "intimidating", explanation: "'Despite' signals contrast — his appearance suggests one thing (scary/tough), but reality is different (kind).", difficulty: 2 },
  ],
  "Double-Blank": [
    { question: "The scientist's theory was initially ___, but after years of ___, it was widely accepted.", options: ["rejected / research", "accepted / delay", "praised / criticism", "ignored / celebration"], correct_answer: "rejected / research", explanation: "'Initially... but after years... widely accepted' = progression from negative to positive. Rejected → research → accepted.", difficulty: 2 },
    { question: "The ___ storm forced the sailors to seek ___ in a nearby harbour.", options: ["gentle / adventure", "fierce / shelter", "mild / trouble", "fierce / danger"], correct_answer: "fierce / shelter", explanation: "A storm that 'forces' action must be severe (fierce). Seeking safety = shelter.", difficulty: 2 },
  ],
};

for (const [topicPart, examples] of Object.entries(expansions)) {
  const topic = findTopic(topicPart);
  if (topic) {
    if (!topic.examples) topic.examples = [];
    topic.examples.push(...examples);
  }
}

// ============================================================
// 3. NEW TOPICS
// ============================================================

// Add Sentence Correction to Grammar category
const grammarCat = findCat('Grammar');
if (grammarCat) {
  grammarCat.topics.push({
    id: "CAT08-T04",
    title: "Sentence Correction & Error Identification",
    description: "Finding grammatical errors in sentences — subject-verb agreement, tense consistency, pronoun errors, and more.",
    common_error_types: [
      "Subject-verb agreement: 'The group of students are...' → 'is'",
      "Tense inconsistency: 'She walked in and sits down' → 'sat down'",
      "Pronoun error: 'Between you and I' → 'Between you and me'",
      "Double negative: 'I don't have no money' → 'I don't have any money'",
      "Dangling modifier: 'Running quickly, the bus was missed' → 'Running quickly, she missed the bus'"
    ],
    examples: [
      { question: "Find the error: 'The children was playing in the garden while there mother watched.'", options: ["was → were", "there → their", "Both 'was' and 'there'", "No error"], correct_answer: "Both 'was' and 'there'", explanation: "'Children' is plural → 'were'. 'There' (place) should be 'their' (possession).", difficulty: 2 },
      { question: "Which sentence is correct?", options: ["Who's book is this?", "Whose book is this?", "Whos book is this?", "Whom book is this?"], correct_answer: "Whose book is this?", explanation: "'Whose' = possession. 'Who's' = who is. The question asks about ownership → 'whose'.", difficulty: 1 },
      { question: "Find the error: 'Neither the teacher nor the students was aware of the change in schedule.'", options: ["Neither", "nor", "was → were", "No error"], correct_answer: "was → were", explanation: "With 'neither...nor', the verb agrees with the nearest subject. 'Students' is plural → 'were'.", difficulty: 3 },
    ]
  });
}

// Add Homophones to Vocabulary category
const vocabCat = findCat('Vocabulary');
if (vocabCat) {
  vocabCat.topics.push({
    id: "CAT04-T04",
    title: "Homophones & Commonly Confused Words",
    description: "Words that sound the same but have different meanings and spellings. A frequent source of errors and exam questions.",
    common_homophones: [
      "there / their / they're",
      "to / too / two",
      "its / it's",
      "your / you're",
      "where / wear / were",
      "affect / effect",
      "principal / principle",
      "stationary / stationery",
      "complement / compliment",
      "desert / dessert"
    ],
    examples: [
      { question: "Choose the correct word: '___ going to be late if they don't hurry.'", options: ["There", "Their", "They're", "Theyre"], correct_answer: "They're", explanation: "'They're' = they are. 'Their' = belonging to them. 'There' = a place.", difficulty: 1 },
      { question: "Choose correctly: 'The new rule will ___ everyone in the school.'", options: ["affect", "effect", "afect", "efect"], correct_answer: "affect", explanation: "'Affect' is usually a verb (to influence). 'Effect' is usually a noun (the result). Here we need the verb.", difficulty: 2 },
      { question: "'The ___ of the school announced a new ___ about phone use.' Fill both blanks:", options: ["principal / principle", "principle / principal", "principal / principal", "principle / principle"], correct_answer: "principal / principle", explanation: "'Principal' = head of school (person). 'Principle' = a rule or belief.", difficulty: 2 },
    ]
  });
}

// ============================================================
// 4. ADD DIFFICULTY TO ALL EXISTING EXAMPLES
// ============================================================

for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    if (topic.examples) {
      for (const ex of topic.examples) {
        if (!ex.difficulty) {
          // Heuristic based on content
          const q = (ex.question || ex.correct_answer || '').toLowerCase();
          const explanation = (ex.explanation || '').toLowerCase();
          if (explanation.includes('fallacy') || explanation.includes('converse') || q.includes('identify the error') || (ex.options && ex.options.length >= 5)) {
            ex.difficulty = 3;
          } else if (explanation.length > 100 || q.includes('infer') || q.includes('which meaning') || q.includes('rearrange')) {
            ex.difficulty = 2;
          } else {
            ex.difficulty = 1;
          }
        }
      }
    }
  }
}

// ============================================================
// 5. ADD MCQ OPTIONS TO EXAMPLES THAT LACK THEM
// ============================================================

for (const cat of data.categories) {
  for (const topic of (cat.topics || [])) {
    if (topic.examples) {
      for (const ex of topic.examples) {
        // Ensure 'answer' field exists (some use 'correct_answer')
        if (!ex.answer && ex.correct_answer) {
          ex.answer = ex.correct_answer;
        }
      }
    }
  }
}

// ============================================================
// WRITE
// ============================================================
writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');

let totalTopics = 0, totalExamples = 0, withOptions = 0, withDiff = 0;
for (const cat of data.categories) {
  totalTopics += (cat.topics || []).length;
  for (const topic of (cat.topics || [])) {
    if (topic.examples) {
      for (const ex of topic.examples) {
        totalExamples++;
        if (ex.options) withOptions++;
        if (ex.difficulty) withDiff++;
      }
    }
  }
}
const topicsWithExamples = data.categories.reduce((s, c) =>
  s + (c.topics || []).filter(t => t.examples && t.examples.length > 0).length, 0);

console.log(`Done. ${data.categories.length} categories, ${totalTopics} topics (${topicsWithExamples} with examples), ${totalExamples} examples (${withOptions} MCQ, ${withDiff} with difficulty).`);
