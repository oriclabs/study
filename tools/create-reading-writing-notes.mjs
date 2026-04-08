/**
 * Creates Reading Comprehension and Written Expression study notes
 * for the VIC Selective pack.
 *
 * Run: node tools/create-reading-writing-notes.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

// ============================================================
// READING COMPREHENSION
// ============================================================

const reading = {
  exam: {
    name: "Victorian Selective Entry Examination",
    subject: "Reading Comprehension",
    version: "2025",
    description: "Study notes covering all reading comprehension skills tested in the VIC Selective Entry Exam: literal understanding, inference, vocabulary in context, author's purpose, tone, text structure, and evidence analysis.",
    golden_rules: [
      "Read the questions BEFORE reading the passage — know what to look for",
      "Underline key words in both the passage and the question",
      "Every answer must be supported by evidence from the text — never guess from personal knowledge",
      "Eliminate answers that are too broad, too narrow, or not supported by the passage"
    ]
  },
  exam_overview: {
    format: "Passages followed by multiple-choice questions (4-5 options)",
    time_per_question_seconds: 50,
    skills_tested: [
      "Literal comprehension — finding stated facts",
      "Inference — reading between the lines",
      "Vocabulary in context — word meanings from surrounding text",
      "Author's purpose — why the text was written",
      "Tone and mood — the feeling of the writing",
      "Text structure — how the text is organised",
      "Evidence identification — finding support for claims"
    ]
  },
  categories: [
    {
      category: "Literal Comprehension",
      topics: [
        {
          id: "READ-T01",
          title: "Finding Stated Information",
          concept_explanation: "Literal comprehension means finding information that is directly stated in the text. The answer is right there — you just need to locate it.",
          identification_cues: [
            "According to the passage...",
            "The text states that...",
            "Which of the following is mentioned in the passage?",
            "What did the character do when..."
          ],
          solving_steps: [
            "Read the question carefully — identify exactly what's being asked",
            "Scan the passage for key words from the question",
            "Re-read the relevant sentence(s) carefully",
            "Match the answer to what the text actually says (not what you think)",
            "Beware of paraphrasing — the correct answer may use different words"
          ],
          examples: [
            {
              question: "Passage: 'The platypus, native to eastern Australia, is one of only five species of monotremes — mammals that lay eggs. Males possess a venomous spur on their hind legs.' According to the passage, what makes the platypus unusual among mammals?",
              options: ["It lives in Australia", "It lays eggs", "It has a bill", "It swims"],
              answer: "It lays eggs",
              solution_steps: ["The passage says 'mammals that lay eggs' — this is what makes monotremes (including platypus) unusual", "Other options aren't mentioned as unusual"],
              difficulty: 1
            },
            {
              question: "Passage: 'By 1850, the gold rush had transformed Melbourne from a small settlement of 29,000 to a bustling city of 125,000 in just three years.' What was Melbourne's population before the gold rush?",
              options: ["125,000", "29,000", "Three years", "1850"],
              answer: "29,000",
              solution_steps: ["'small settlement of 29,000' — this was BEFORE the transformation", "125,000 was after the gold rush", "Read carefully: 'from' indicates the starting point"],
              difficulty: 1
            }
          ],
          tips_and_tricks: [
            "The answer is ALWAYS in the text — if you can't find it, re-read",
            "Watch for trap answers that are true in general but not stated in THIS passage",
            "Key words from the question help you locate the right paragraph",
            "If two answers seem right, the one using the passage's own words is usually correct"
          ]
        },
        {
          id: "READ-T02",
          title: "Sequencing & Details",
          concept_explanation: "Some questions ask about the order of events or specific details like numbers, names, or descriptions. These require careful reading rather than interpretation.",
          examples: [
            {
              question: "Passage: 'First, the caterpillar forms a chrysalis. Inside, its body completely dissolves into a cellular soup. Then, new cells organise into wings, antennae, and legs. Finally, the butterfly emerges.' What happens AFTER the body dissolves?",
              options: ["A chrysalis forms", "New cells organise", "The butterfly emerges", "The caterpillar eats leaves"],
              answer: "New cells organise",
              solution_steps: ["The sequence: chrysalis → dissolves → new cells organise → butterfly emerges", "AFTER dissolving = next step = new cells organise"],
              difficulty: 1
            },
            {
              question: "Passage: 'The expedition set out on March 15, reached base camp on April 2, and summited on April 18 — exactly 34 days after departure.' How long from base camp to the summit?",
              options: ["34 days", "18 days", "16 days", "2 days"],
              answer: "16 days",
              solution_steps: ["Base camp: April 2. Summit: April 18.", "April 18 − April 2 = 16 days", "Trap: 34 days is the total expedition, not base camp to summit"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "For sequence questions, number the events in the passage margin",
            "Watch for time traps — the question may ask about part of a timeline, not all of it",
            "'Before' and 'after' are the most important words in sequence questions"
          ]
        }
      ]
    },
    {
      category: "Inference & Interpretation",
      topics: [
        {
          id: "READ-T03",
          title: "Making Inferences",
          concept_explanation: "Inference means reading between the lines — understanding something that isn't directly stated but is strongly implied by the evidence. Formula: Text Clues + Background Knowledge = Inference.",
          identification_cues: [
            "What can you infer from...",
            "The passage suggests that...",
            "It can be concluded that...",
            "The author implies...",
            "Based on the passage, it is likely that..."
          ],
          solving_steps: [
            "Identify the clues in the text (actions, descriptions, word choices)",
            "Ask: 'What does this evidence suggest?'",
            "Your inference must be SUPPORTED by the text — not just possible",
            "Eliminate answers that go beyond what the text supports",
            "The best inference is the most logical and least extreme"
          ],
          examples: [
            {
              question: "Passage: 'Sarah slammed her locker shut, shoved past two students in the corridor, and sat in her usual seat without looking at anyone.' What can you infer about Sarah?",
              options: ["She is happy", "She is upset or angry", "She is late for class", "She is shy"],
              answer: "She is upset or angry",
              solution_steps: ["Clues: slammed (force), shoved past (aggression), without looking at anyone (withdrawal)", "All three actions suggest negative emotion — anger or frustration", "Not 'late' — no mention of time. Not 'shy' — shoving isn't shy behaviour"],
              difficulty: 1
            },
            {
              question: "Passage: 'The old lighthouse keeper polished the lens one final time, placed the key on the desk, and walked slowly down the spiral stairs without looking back.' What is likely happening?",
              options: ["He is going to lunch", "He is retiring or leaving permanently", "He is going to sleep", "He is cleaning the lighthouse"],
              answer: "He is retiring or leaving permanently",
              solution_steps: ["'one final time' — suggests the last occasion", "'placed the key on the desk' — surrendering access/responsibility", "'without looking back' — not returning", "All clues point to permanent departure"],
              difficulty: 2
            },
            {
              question: "Passage: 'Despite the team's best efforts, the gap on the scoreboard continued to widen. Coach Martinez called a timeout with four minutes remaining, his jaw clenched.' What can you infer about the game?",
              options: ["The team is winning easily", "The team is losing and the coach is frustrated", "The game has just started", "The coach is happy with the team"],
              answer: "The team is losing and the coach is frustrated",
              solution_steps: ["'gap continued to widen' = other team pulling further ahead", "'jaw clenched' = physical sign of tension/frustration", "Timeout with 4 minutes left = desperate measure", "Combined: losing badly, coach frustrated"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Inference ≠ guess. Every inference must have evidence from the text",
            "Look for emotional language, actions, and descriptions as clues",
            "The correct inference is always the MOST supported, not just possible",
            "If the answer feels like a big leap from the text, it's probably wrong"
          ]
        },
        {
          id: "READ-T04",
          title: "Vocabulary in Context",
          concept_explanation: "These questions ask what a word means AS USED IN THE PASSAGE. The same word can have different meanings in different contexts. Always use the surrounding sentences to determine meaning.",
          solving_steps: [
            "Find the word in the passage and read the whole sentence",
            "Read the sentence before and after for additional context",
            "Try replacing the word with each answer option — which one makes sense?",
            "Don't pick the most common meaning — pick the one that fits THIS context"
          ],
          examples: [
            {
              question: "Passage: 'The novel's grave themes of loss and betrayal contrast with its moments of unexpected humour.' What does 'grave' mean here?",
              options: ["A burial place", "Serious and important", "Engraved", "Deep"],
              answer: "Serious and important",
              solution_steps: ["Context: describing themes of loss and betrayal", "'Grave' is used as an adjective here (describing themes), not a noun", "Replace: 'serious themes of loss' ✓ vs 'burial place themes' ✗"],
              difficulty: 1
            },
            {
              question: "Passage: 'The politician's address to the nation struck a chord with millions of viewers.' What does 'struck a chord' mean?",
              options: ["Played music", "Hit something", "Resonated emotionally", "Caused damage"],
              answer: "Resonated emotionally",
              solution_steps: ["'Struck a chord' is an idiom meaning to connect emotionally", "Context: a speech that affected millions — emotional resonance", "Not literal music or hitting"],
              difficulty: 2
            },
            {
              question: "Passage: 'The company's meteoric rise was followed by an equally swift decline.' What does 'meteoric' mean here?",
              options: ["Related to space rocks", "Extremely fast", "Burning", "Small"],
              answer: "Extremely fast",
              solution_steps: ["Meteors are fast-moving objects — the word is used figuratively", "Context: 'rise' + 'equally swift decline' confirms speed", "Not literally about space rocks"],
              difficulty: 2
            }
          ],
          common_mistakes: [
            "Picking the most common definition instead of the contextual one",
            "Not reading enough surrounding text for clues",
            "Confusing figurative/idiomatic use with literal meaning"
          ],
          tips_and_tricks: [
            "ALWAYS substitute your answer back into the sentence to check it works",
            "If a word has multiple meanings, the test will probably use the LESS common one",
            "Look for signal words nearby: 'but', 'however', 'unlike' can flip the meaning"
          ]
        }
      ]
    },
    {
      category: "Author's Purpose & Tone",
      topics: [
        {
          id: "READ-T05",
          title: "Author's Purpose",
          concept_explanation: "Every text is written for a reason. The four main purposes are: to Inform (give facts), to Persuade (change your mind), to Entertain (tell a story/amuse), and to Explain (teach how something works). Some texts have multiple purposes.",
          key_rules: [
            "Inform: news articles, encyclopedias, textbooks — neutral language, facts",
            "Persuade: opinion pieces, advertisements, speeches — emotional language, one-sided arguments",
            "Entertain: stories, poems, jokes — descriptive language, characters, plot",
            "Explain: instructions, how-to guides, recipes — step-by-step, clear language"
          ],
          examples: [
            {
              question: "Passage: 'Plastic pollution kills over 1 million sea birds every year. We must act now — ban single-use plastics before it's too late.' What is the author's primary purpose?",
              options: ["To inform about birds", "To persuade readers to ban plastics", "To entertain with a story", "To explain how plastic is made"],
              answer: "To persuade readers to ban plastics",
              solution_steps: ["'We must act now' = call to action", "'before it's too late' = urgency/emotional appeal", "While it informs, the primary purpose is persuasion (changing behaviour)"],
              difficulty: 1
            },
            {
              question: "Passage: 'The recipe calls for 200g flour, 100g butter, and 50g sugar. First, preheat the oven to 180°C...' What is the author's purpose?",
              options: ["To persuade", "To entertain", "To explain/instruct", "To argue"],
              answer: "To explain/instruct",
              solution_steps: ["Step-by-step format, specific measurements", "No opinion or story — pure instruction", "Purpose: teach the reader how to bake"],
              difficulty: 1
            },
            {
              question: "An article titled 'Why Chess Should Be Taught in Every School' uses research data AND personal anecdotes. What is the primary purpose?",
              options: ["Inform", "Persuade", "Entertain", "Explain"],
              answer: "Persuade",
              solution_steps: ["'Should be' = opinion/recommendation", "Using data AND anecdotes = building an argument", "Title reveals persuasive intent — advocating for chess in schools"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Look at the title first — it often reveals purpose immediately",
            "Persuasive texts use: 'should', 'must', 'we need to', 'it's time to'",
            "A text can inform AND persuade — pick the PRIMARY purpose",
            "If there are characters and a plot, it's primarily entertainment (even if educational)"
          ]
        },
        {
          id: "READ-T06",
          title: "Tone & Mood",
          concept_explanation: "Tone is the author's attitude toward the subject (how they feel). Mood is the feeling the text creates in the reader. Tone is identified through word choice, sentence structure, and what details the author includes or excludes.",
          definitions: {
            "Formal": "Academic, professional language. No slang or contractions.",
            "Informal": "Casual, conversational. May use slang, contractions.",
            "Optimistic": "Hopeful, positive outlook. Focus on possibilities.",
            "Pessimistic": "Negative outlook. Focus on problems and failures.",
            "Sarcastic": "Saying one thing but meaning the opposite. Often mocking.",
            "Objective": "Neutral, unbiased. Presents facts without opinion.",
            "Nostalgic": "Longing for the past. Warm but slightly sad.",
            "Urgent": "Demands immediate action. Short sentences, strong verbs."
          },
          examples: [
            {
              question: "Passage: 'What a wonderful idea — let's build a highway through the last remaining nature reserve. That should solve all our problems.' What is the tone?",
              options: ["Enthusiastic", "Sarcastic", "Objective", "Formal"],
              answer: "Sarcastic",
              solution_steps: ["The words sound positive ('wonderful', 'solve all our problems')", "But the meaning is negative — destroying a nature reserve is bad", "Saying positive things about something negative = sarcasm"],
              difficulty: 2
            },
            {
              question: "Passage: 'I remember the summer evenings on Grandma's porch — the smell of jasmine, the sound of cicadas, the way the light turned golden just before sunset.' What is the mood?",
              options: ["Tense", "Nostalgic", "Angry", "Formal"],
              answer: "Nostalgic",
              solution_steps: ["'I remember' = looking back at the past", "Sensory details (smell, sound, light) = warm, personal memories", "The tone is fond and slightly wistful = nostalgic"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Focus on ADJECTIVES and ADVERBS — they reveal tone most clearly",
            "Sarcasm is the trickiest tone — the words sound positive but the meaning is negative",
            "Read the passage out loud (mentally) — HOW would someone say this?",
            "Tone words to know: critical, dismissive, sympathetic, enthusiastic, detached, ironic"
          ]
        }
      ]
    },
    {
      category: "Text Structure & Analysis",
      topics: [
        {
          id: "READ-T07",
          title: "Text Structures",
          concept_explanation: "Authors organise their writing in specific patterns. Recognising the structure helps you predict what comes next and find information faster.",
          definitions: {
            "Chronological": "Events in time order. Signal words: first, then, next, finally, in 1990, after, before.",
            "Cause & Effect": "One thing leads to another. Signal words: because, therefore, as a result, consequently, due to.",
            "Compare & Contrast": "Similarities and differences. Signal words: however, similarly, on the other hand, unlike, both, whereas.",
            "Problem & Solution": "Identifies an issue then offers fixes. Signal words: the problem is, one solution, the challenge.",
            "Description": "Paints a picture with details. Signal words: for example, such as, including, characterised by."
          },
          examples: [
            {
              question: "Passage: 'Unlike dogs, which are social pack animals, cats are largely solitary hunters. However, both species have been domesticated for thousands of years.' What text structure is used?",
              options: ["Chronological", "Cause & Effect", "Compare & Contrast", "Problem & Solution"],
              answer: "Compare & Contrast",
              solution_steps: ["'Unlike' = signal word for contrast", "'However, both' = signal word for comparison", "Comparing dogs and cats = compare & contrast"],
              difficulty: 1
            },
            {
              question: "Passage: 'Rising sea temperatures have caused widespread coral bleaching. As a result, marine biodiversity in reef systems has declined by 40% since 2010.' What structure?",
              options: ["Description", "Compare & Contrast", "Cause & Effect", "Chronological"],
              answer: "Cause & Effect",
              solution_steps: ["'have caused' and 'As a result' = cause-effect signal words", "Temperature rise (cause) → coral bleaching → biodiversity decline (effects)"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Highlight signal words — they instantly reveal the structure",
            "A single passage can use multiple structures (e.g., chronological within a cause-effect argument)",
            "For the exam: identify the PRIMARY/OVERALL structure, not just one sentence's structure"
          ]
        },
        {
          id: "READ-T08",
          title: "Finding & Using Evidence",
          concept_explanation: "Many questions ask you to identify which part of the text supports a particular claim. This tests whether you can distinguish between evidence (facts from the text) and interpretation (what the facts mean).",
          solving_steps: [
            "Read the claim/statement in the question",
            "Go back to the passage and find the specific sentence(s) that DIRECTLY support it",
            "The best evidence is a direct quote or close paraphrase",
            "Eliminate options that are true but don't support THIS specific claim"
          ],
          examples: [
            {
              question: "Claim: 'The explorer was experienced.' Which line from the passage best supports this? A) 'He packed his bags carefully' B) 'This was his fifteenth expedition to the Arctic' C) 'The weather was harsh' D) 'He missed his family'",
              options: ["He packed his bags carefully", "This was his fifteenth expedition to the Arctic", "The weather was harsh", "He missed his family"],
              answer: "This was his fifteenth expedition to the Arctic",
              solution_steps: ["'Fifteenth expedition' = direct evidence of experience (many previous trips)", "'Packed carefully' suggests care but not necessarily experience", "Weather and family are irrelevant to experience"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Evidence must DIRECTLY support the claim, not just be related to the same topic",
            "The strongest evidence is specific and factual, not vague or general",
            "If two options seem to support the claim, pick the more DIRECT and SPECIFIC one"
          ]
        }
      ]
    },
    {
      category: "Exam Strategies for Reading",
      topics: [
        {
          id: "READ-T09",
          title: "Reading Comprehension Exam Technique",
          concept_explanation: "A systematic approach to reading comprehension questions maximises your score under time pressure.",
          solving_steps: [
            "Step 1: Skim the questions first (30 seconds) — know what to look for",
            "Step 2: Read the passage once, underlining key ideas (1-2 minutes)",
            "Step 3: Answer literal questions first (fastest — the answer is stated)",
            "Step 4: Tackle inference and analysis questions",
            "Step 5: For each answer, point to the specific evidence in the passage",
            "Step 6: Eliminate obviously wrong answers before choosing"
          ],
          common_traps: [
            "'Too broad' — the answer is true in general but the passage says something more specific",
            "'Too narrow' — the answer focuses on one detail but the question asks about the whole passage",
            "'Not in text' — the answer sounds reasonable but isn't actually supported by the passage",
            "'Opposite' — the answer contradicts what the passage says (reverses a negative, misquotes)",
            "'Partially correct' — half right, half wrong — read ALL of the answer before choosing"
          ],
          tips_and_tricks: [
            "Speed tip: literal questions take 20 seconds, inference questions take 40 seconds",
            "If stuck between two answers, re-read the relevant paragraph — one will have stronger support",
            "Never leave a question blank — eliminate what you can and guess from the rest",
            "Trust the passage, not your prior knowledge — the exam tests reading, not general knowledge"
          ]
        }
      ]
    }
  ],
  quick_reference: {
    question_types: ["Literal/Factual", "Inference", "Vocabulary in Context", "Author's Purpose", "Tone/Mood", "Text Structure", "Evidence"],
    signal_words: {
      "Cause/Effect": "because, therefore, as a result, consequently, due to, since",
      "Compare/Contrast": "however, similarly, unlike, whereas, on the other hand, both",
      "Chronological": "first, then, next, finally, before, after, meanwhile",
      "Problem/Solution": "the problem is, one solution, the challenge, to address this"
    },
    common_tones: ["formal, informal, sarcastic, optimistic, pessimistic, nostalgic, urgent, objective, critical, sympathetic, humorous, solemn"]
  }
};

// ============================================================
// WRITTEN EXPRESSION
// ============================================================

const writing = {
  exam: {
    name: "Victorian Selective Entry Examination",
    subject: "Written Expression",
    version: "2025",
    description: "Study notes for written expression — narrative, persuasive, and descriptive writing skills tested in the VIC Selective Entry Exam.",
    golden_rules: [
      "Plan before you write — spend 5 minutes planning, it saves 15 minutes of confusion",
      "Show, don't tell — 'Her hands trembled' is better than 'She was nervous'",
      "Every paragraph needs a clear purpose — if you can't summarise it in one sentence, rewrite it",
      "Proofread the last 5 minutes — fix spelling, punctuation, and unclear sentences"
    ]
  },
  exam_overview: {
    format: "Written response to a prompt (25-30 minutes)",
    types_tested: ["Narrative (creative story)", "Persuasive (argument/opinion)", "Descriptive (vivid scene/experience)"],
    marking_criteria: [
      "Ideas and content — originality, depth, relevance to prompt",
      "Structure — clear beginning, middle, end; paragraphing; logical flow",
      "Language — vocabulary, sentence variety, figurative language",
      "Mechanics — spelling, punctuation, grammar accuracy"
    ]
  },
  categories: [
    {
      category: "Planning & Structure",
      topics: [
        {
          id: "WRITE-T01",
          title: "Essay Planning in 5 Minutes",
          concept_explanation: "A quick plan prevents rambling and ensures your writing has a clear structure. Use a simple framework and stick to it.",
          solving_steps: [
            "Read the prompt twice — underline key words (especially the instruction: describe, argue, tell a story)",
            "Choose your angle in 30 seconds (don't overthink)",
            "Write a 4-box plan: Opening hook → Middle 1 → Middle 2 → Ending",
            "For each box, jot 3-4 key words (not full sentences)",
            "Start writing — your plan is your roadmap"
          ],
          key_rules: [
            "Narrative plan: Setting → Problem/Conflict → Climax → Resolution",
            "Persuasive plan: Hook + Thesis → Argument 1 + Evidence → Argument 2 + Evidence → Counterargument → Conclusion",
            "Descriptive plan: Overview → Sense 1 (sight) → Sense 2 (sound/smell) → Feeling/emotion → Reflection"
          ],
          examples: [
            {
              question: "Prompt: 'Write about a time you faced a difficult decision.' Plan this narrative in 4 boxes.",
              solution_steps: [
                "Box 1 (Opening): Setting the scene — school hallway, lunchtime, two friends arguing",
                "Box 2 (Problem): Both friends want me to take their side — torn loyalty",
                "Box 3 (Climax): I refuse to choose sides, try to mediate — one friend storms off",
                "Box 4 (Resolution): Next day, I talk to each separately — they reconcile, I learned about courage"
              ],
              answer: "A clear 4-part plan with setting, conflict, climax, and resolution",
              difficulty: 1
            }
          ],
          tips_and_tricks: [
            "Don't plan the perfect story — plan a CLEAR story. Clarity beats creativity under time pressure.",
            "If you can't think of a real experience, make one up — the exam tests writing skill, not honesty",
            "Your plan should take exactly 5 minutes. Set a mental timer."
          ]
        },
        {
          id: "WRITE-T02",
          title: "Strong Openings",
          concept_explanation: "The first 1-2 sentences determine whether the reader is engaged. A strong opening hooks attention immediately.",
          key_rules: [
            "Action opening: Start in the middle of something happening. 'The glass shattered across the kitchen floor.'",
            "Question opening: Pose a thought-provoking question. 'Have you ever wished you could turn back time?'",
            "Dialogue opening: Start with speech. '\"Run!\" screamed the lookout from the tower.'",
            "Setting opening: Paint a vivid scene. 'The fog hung so thick that morning, you could barely see your own hands.'",
            "AVOID: 'In this essay I will...' or 'One day I was walking...'"
          ],
          examples: [
            {
              question: "Which is a stronger opening for a narrative about fear?",
              options: [
                "I was walking in the forest and I got scared.",
                "The branch snapped somewhere behind me. I froze.",
                "This story is about a time I was afraid.",
                "Fear is a common human emotion."
              ],
              answer: "The branch snapped somewhere behind me. I froze.",
              solution_steps: ["Action opening — puts reader immediately in the scene", "Short sentences create tension", "Shows fear through action, doesn't tell"],
              difficulty: 1
            }
          ],
          tips_and_tricks: [
            "Write your opening LAST if you're stuck — start with the middle, then craft the hook",
            "Short sentences = tension. Long sentences = calm. Mix them for rhythm.",
            "The first sentence should make the reader want to read the second sentence. That's its only job."
          ]
        }
      ]
    },
    {
      category: "Narrative Writing",
      topics: [
        {
          id: "WRITE-T03",
          title: "Show, Don't Tell",
          concept_explanation: "Instead of stating emotions or facts directly, SHOW them through actions, dialogue, and sensory details. This is the single most important technique for scoring highly in creative writing.",
          definitions: {
            "Telling": "She was sad. (States the emotion directly — boring)",
            "Showing": "She stared at the empty chair across the table, turning the cold mug of tea in her hands. (Shows sadness through details — vivid)"
          },
          examples: [
            {
              question: "Rewrite 'He was angry' using 'show don't tell'.",
              options: [
                "He felt very angry indeed.",
                "His fist slammed the table, sending papers scattering across the floor.",
                "He was an angry person in general.",
                "Anger is a strong emotion."
              ],
              answer: "His fist slammed the table, sending papers scattering across the floor.",
              solution_steps: ["Shows anger through action (slamming) and consequence (papers scattering)", "The reader FEELS the anger without being told"],
              difficulty: 1
            },
            {
              question: "Rewrite 'The house was old and abandoned' using show don't tell.",
              options: [
                "The house was very old and nobody lived there.",
                "Peeling paint clung to the weatherboards like dead skin, and weeds had swallowed the front path whole.",
                "It was an abandoned house that looked old.",
                "The old, abandoned house stood on the corner."
              ],
              answer: "Peeling paint clung to the weatherboards like dead skin, and weeds had swallowed the front path whole.",
              solution_steps: ["Visual details (peeling paint, weeds) show age and abandonment", "Simile ('like dead skin') adds vivid imagery", "Personification ('swallowed') makes the description active"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "For every emotion you write, ask: 'What would the CAMERA see?' Describe that instead.",
            "Use the 5 senses: sight, sound, smell, touch, taste — at least 2 per paragraph",
            "Dialogue can show emotions too: 'Whatever.' vs 'Please don't go.'",
            "Action verbs are your best friend: stomped, whispered, clenched, trembled, beamed"
          ]
        },
        {
          id: "WRITE-T04",
          title: "Dialogue & Character",
          concept_explanation: "Good dialogue sounds natural, reveals character, and moves the story forward. Each character should sound different.",
          key_rules: [
            "New speaker = new paragraph",
            "Use 'said' most of the time — fancy alternatives ('exclaimed', 'retorted') should be rare",
            "Show HOW someone speaks: 'she whispered' vs 'she shouted'",
            "Dialogue should sound like real speech — contractions ('don't', 'I'm') are normal",
            "Each line of dialogue should reveal character or advance the plot"
          ],
          examples: [
            {
              question: "Which dialogue better reveals that a character is nervous?",
              options: [
                "'I am nervous,' said Tom nervously.",
                "'It's fine. Everything's fine. Why wouldn't it be fine?' Tom said, straightening his tie for the third time.",
                "'I feel nervous about the test,' Tom told his friend.",
                "Tom was nervous about the upcoming presentation."
              ],
              answer: "'It's fine. Everything's fine. Why wouldn't it be fine?' Tom said, straightening his tie for the third time.",
              solution_steps: ["Repetition of 'fine' = overcompensating = nervousness", "Physical action (straightening tie 'for the third time') = nervous habit", "Rhetorical question = defensive = hiding true feelings"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Read your dialogue out loud — if it sounds weird, rewrite it",
            "Don't have characters say each other's names constantly ('Well, Tom, I think...')",
            "Mix dialogue with action: 'She picked up the letter. \"It's from Dad.\"'",
            "Break the rule of 'said' only for strong emotions or whispers — otherwise it's invisible"
          ]
        }
      ]
    },
    {
      category: "Persuasive Writing",
      topics: [
        {
          id: "WRITE-T05",
          title: "Building an Argument",
          concept_explanation: "Persuasive writing convinces the reader to agree with your position. It uses evidence, logic, and emotional appeal. Structure: THESIS → ARGUMENTS + EVIDENCE → COUNTERARGUMENT → CONCLUSION.",
          key_rules: [
            "Thesis: State your position clearly in the first paragraph. 'School uniforms should be abolished because...'",
            "Arguments: Give 2-3 strong reasons, each in its own paragraph",
            "Evidence: Facts, statistics, examples, expert opinions for each argument",
            "Counterargument: Acknowledge the other side, then explain why your position is stronger",
            "Conclusion: Restate thesis + call to action"
          ],
          identification_cues: [
            "Prompt says: 'argue', 'persuade', 'do you agree', 'should/shouldn't'",
            "You need to take ONE side (even if you see both sides)"
          ],
          examples: [
            {
              question: "Prompt: 'Students should be allowed to use phones in school. Do you agree?' Write a thesis statement.",
              options: [
                "Phones are good and bad in schools.",
                "While some argue phones are distracting, they should be permitted as essential learning tools that prepare students for a digital world.",
                "I think phones are okay sometimes.",
                "Many students have phones."
              ],
              answer: "While some argue phones are distracting, they should be permitted as essential learning tools that prepare students for a digital world.",
              solution_steps: ["Acknowledges the counter ('some argue phones are distracting')", "States clear position ('should be permitted')", "Gives the reason ('essential learning tools')", "Broader significance ('prepare for digital world')"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Use PEEL for each body paragraph: Point, Evidence, Explanation, Link back to thesis",
            "Rhetorical questions engage the reader: 'Is this really the message we want to send our children?'",
            "Statistics don't need to be exact — 'Studies show that over 70% of students...' is acceptable in an exam",
            "Always address the counterargument — ignoring it makes your argument look weak"
          ]
        },
        {
          id: "WRITE-T06",
          title: "Persuasive Techniques",
          concept_explanation: "Persuasive writing uses specific techniques to convince the reader. The more techniques you use well, the higher your score.",
          key_rules: [
            "Rhetorical question: Engages reader. 'Would you want YOUR child in this situation?'",
            "Emotive language: Creates feelings. 'Devastating', 'innocent', 'heartbreaking'",
            "Repetition: Reinforces key ideas. 'We need change. We need it now. We need it together.'",
            "Inclusive language: Creates unity. 'We all know...', 'As Australians, we...'",
            "Expert opinion: Adds authority. 'According to Professor Smith...'",
            "Anecdote: Makes it personal. 'Last year, a student at my school...'",
            "Rule of three: 'Faster, stronger, smarter' — three items sound complete"
          ],
          examples: [
            {
              question: "Identify the persuasive technique: 'Every child, every family, every community deserves access to clean water.'",
              options: ["Rhetorical question", "Rule of three + repetition", "Expert opinion", "Anecdote"],
              answer: "Rule of three + repetition",
              solution_steps: ["Three items: 'every child, every family, every community' = rule of three", "'Every' repeated three times = repetition", "Both techniques combined for emphasis"],
              difficulty: 1
            }
          ],
          tips_and_tricks: [
            "Aim for at least 3 different techniques in a persuasive piece",
            "Don't overuse one technique — variety shows sophistication",
            "The conclusion should leave the reader with an emotional impact or call to action",
            "Use short, punchy sentences for impact. Then follow with a longer explanatory sentence for balance."
          ]
        }
      ]
    },
    {
      category: "Language & Vocabulary",
      topics: [
        {
          id: "WRITE-T07",
          title: "Vivid Vocabulary & Word Choice",
          concept_explanation: "Replacing common words with more specific, vivid alternatives instantly improves writing quality. Don't use a $1 word when a $10 word fits better.",
          key_rules: [
            "Replace 'said' with: whispered, murmured, snapped, announced, admitted, insisted (when appropriate)",
            "Replace 'walked' with: strolled, shuffled, marched, crept, stumbled, strode",
            "Replace 'big' with: enormous, vast, towering, sprawling, immense",
            "Replace 'happy' with: elated, content, overjoyed, thrilled, relieved",
            "Replace 'sad' with: devastated, melancholy, heartbroken, forlorn, dejected"
          ],
          examples: [
            {
              question: "Improve: 'The big dog walked slowly across the nice garden.'",
              options: [
                "The very big dog walked very slowly across the very nice garden.",
                "The enormous hound lumbered across the manicured garden.",
                "The dog went across the garden.",
                "A big canine walked in the garden area."
              ],
              answer: "The enormous hound lumbered across the manicured garden.",
              solution_steps: ["'big' → 'enormous' (more specific size)", "'dog' → 'hound' (more interesting)", "'walked slowly' → 'lumbered' (one word captures both movement and size)", "'nice' → 'manicured' (specific type of nice)"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Don't use a thesaurus word you don't fully understand — it often sounds wrong",
            "One precise verb beats an adverb + weak verb: 'sprinted' > 'ran quickly'",
            "Vary sentence length: short sentences for impact, longer for description",
            "Read widely — vocabulary comes from reading, not memorising word lists"
          ]
        },
        {
          id: "WRITE-T08",
          title: "Figurative Language in Writing",
          concept_explanation: "Using similes, metaphors, and personification in your writing shows sophistication and creates vivid imagery.",
          key_rules: [
            "Simile: Compares using 'like' or 'as'. 'The lake was as still as glass.'",
            "Metaphor: States one thing IS another. 'The classroom was a zoo.'",
            "Personification: Gives human qualities to non-human things. 'The wind whispered secrets.'",
            "Hyperbole: Exaggeration for effect. 'I've told you a million times.'",
            "Onomatopoeia: Words that sound like what they describe. 'The fire crackled and hissed.'"
          ],
          examples: [
            {
              question: "Add a simile to improve: 'The stars were bright.'",
              options: [
                "The stars were very very bright.",
                "The stars blazed like scattered diamonds across black velvet.",
                "The bright stars were in the sky.",
                "Stars = bright (fact)."
              ],
              answer: "The stars blazed like scattered diamonds across black velvet.",
              solution_steps: ["'like scattered diamonds' = simile (visual comparison)", "'blazed' = vivid verb replacing 'were bright'", "'black velvet' = metaphor for the night sky (adds texture)"],
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "One great metaphor is worth more than five weak ones — quality over quantity",
            "Avoid clichés: 'quiet as a mouse', 'fast as lightning' — create your own comparisons",
            "Use figurative language for KEY moments (the climax, the ending) — not every sentence",
            "Read your figurative language literally — if it sounds absurd, it might be a mixed metaphor"
          ]
        }
      ]
    },
    {
      category: "Proofreading & Polish",
      topics: [
        {
          id: "WRITE-T09",
          title: "Common Writing Errors to Check",
          concept_explanation: "The last 3-5 minutes of your writing time should be spent proofreading. Focus on the most common errors that lose marks.",
          key_rules: [
            "Spelling: their/there/they're, your/you're, its/it's, where/were/wear, too/to/two",
            "Punctuation: capital letters after full stops, commas before 'but' and 'however', apostrophes for possession",
            "Tense consistency: if you start in past tense, stay in past tense throughout",
            "Sentence fragments: every sentence needs a subject AND a verb",
            "Run-on sentences: if a sentence has more than 2 clauses, split it"
          ],
          examples: [
            {
              question: "Find ALL errors: 'Their going to there house becuase its raining and they dont want to get wet'",
              solution_steps: [
                "'Their' → 'They're' (they are)",
                "'there' → 'their' (possession)",
                "'becuase' → 'because' (spelling)",
                "'its' → 'it's' (it is)",
                "'dont' → 'don't' (apostrophe)",
                "Missing full stop at end"
              ],
              answer: "They're going to their house because it's raining and they don't want to get wet.",
              difficulty: 2
            }
          ],
          tips_and_tricks: [
            "Read your writing BACKWARDS (last sentence first) — this catches more errors because you're not reading for meaning",
            "Circle every 'their/there/they're' and 'your/you're' — check each one",
            "If a sentence feels too long, add a full stop and start a new sentence",
            "When in doubt about a comma, read the sentence aloud — pause where you naturally breathe"
          ]
        }
      ]
    }
  ],
  quick_reference: {
    narrative_structure: "Hook → Setting → Problem → Rising tension → Climax → Resolution → Reflection",
    persuasive_structure: "Hook + Thesis → Argument 1 (PEEL) → Argument 2 (PEEL) → Counterargument → Conclusion + Call to action",
    show_dont_tell_checklist: [
      "Replace emotion words with actions",
      "Use at least 2 senses per scene",
      "Replace 'was' with active verbs",
      "Add specific details (not 'a car' but 'a rusted blue Commodore')"
    ],
    power_words: {
      instead_of_good: "excellent, remarkable, outstanding, exceptional, superb",
      instead_of_bad: "dreadful, appalling, dire, catastrophic, abysmal",
      instead_of_said: "whispered, insisted, snapped, admitted, declared, murmured",
      instead_of_walked: "strolled, marched, crept, stumbled, shuffled, strode, lumbered"
    }
  }
};

// ============================================================
// UPDATE THE VIC SELECTIVE PACK
// ============================================================

const packFile = 'packs/vic-selective-exam.json';
const pack = JSON.parse(readFileSync(packFile, 'utf8'));

// Add reading and writing subjects
pack.subjects.push({
  id: "reading",
  label: "Reading Comprehension",
  notes: reading,
});

pack.subjects.push({
  id: "writing",
  label: "Written Expression",
  notes: writing,
});

// Bump version
pack.packVersion = "2025.2";
pack.changelog = "Added Reading Comprehension (9 topics, passages + MCQ examples) and Written Expression (9 topics, narrative/persuasive/descriptive techniques).";

writeFileSync(packFile, JSON.stringify(pack, null, 2), 'utf8');

// Stats
let totalTopics = 0, totalExamples = 0;
for (const subj of pack.subjects) {
  const cats = subj.notes?.categories || [];
  for (const cat of cats) {
    for (const topic of (cat.topics || [])) {
      totalTopics++;
      totalExamples += (topic.examples || []).length;
    }
  }
}
console.log(`Updated pack: ${pack.subjects.length} subjects, ${totalTopics} topics, ${totalExamples} examples.`);
console.log(`Pack version: ${pack.packVersion}`);
const size = (JSON.stringify(pack).length / 1024).toFixed(0);
console.log(`Pack size: ~${size} KB`);
