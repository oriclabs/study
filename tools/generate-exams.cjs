/**
 * Generate 10 mock exam sets per subject from the practice question bank.
 * Each exam uses a different subset of questions, balanced across topics and difficulties.
 *
 * Run: node tools/generate-exams.cjs
 */

const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');
const d = JSON.parse(fs.readFileSync(PACK_PATH, 'utf8'));

// Exam config per subject
const examConfigs = {
  math: { questionsPerExam: 30, timeMinutes: 30, title: 'Mathematics' },
  verbal: { questionsPerExam: 25, timeMinutes: 25, title: 'Verbal Reasoning' },
  quantitative: { questionsPerExam: 30, timeMinutes: 30, title: 'Quantitative Reasoning' },
  reading: { questionsPerExam: 15, timeMinutes: 20, title: 'Reading Comprehension' },
  writing: { questionsPerExam: 5, timeMinutes: 25, title: 'Written Expression' },
};

const EXAM_COUNT = 10;

function shuffle(arr, seed) {
  // Seeded shuffle for reproducibility
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

for (const subj of d.subjects) {
  const config = examConfigs[subj.id];
  if (!config) continue;

  const practice = subj.practice || [];
  if (practice.length === 0) {
    console.log(subj.id + ': no practice questions, skipping');
    continue;
  }

  // Group questions by difficulty
  const byDiff = { 1: [], 2: [], 3: [] };
  for (const q of practice) {
    const diff = q.difficulty || 2;
    if (!byDiff[diff]) byDiff[diff] = [];
    byDiff[diff].push(q);
  }

  // Target distribution: 30% easy, 50% standard, 20% extension
  const targetPerExam = config.questionsPerExam;
  const easyCount = Math.round(targetPerExam * 0.3);
  const stdCount = Math.round(targetPerExam * 0.5);
  const extCount = targetPerExam - easyCount - stdCount;

  const exams = [];
  const usedSets = []; // Track which questions used per exam

  for (let i = 0; i < EXAM_COUNT; i++) {
    const seed = subj.id.length * 1000 + i * 137 + 42;

    // Shuffle each difficulty pool with different seed per exam
    const easy = shuffle(byDiff[1] || [], seed);
    const std = shuffle(byDiff[2] || [], seed + 1);
    const ext = shuffle(byDiff[3] || [], seed + 2);

    // Pick questions, cycling if not enough unique ones
    const pick = (pool, count) => {
      if (pool.length === 0) return [];
      const result = [];
      for (let j = 0; j < count; j++) {
        result.push(pool[j % pool.length]);
      }
      return result;
    };

    const selected = [
      ...pick(easy, Math.min(easyCount, easy.length || easyCount)),
      ...pick(std, Math.min(stdCount, std.length || stdCount)),
      ...pick(ext, Math.min(extCount, ext.length || extCount)),
    ];

    // Limit to target count and shuffle the final order
    const finalQuestions = shuffle(selected.slice(0, targetPerExam), seed + 3);
    const questionIds = finalQuestions.map(q => q.id).filter(Boolean);

    // If we don't have enough with IDs, leave questionIds empty (random mode)
    const exam = {
      id: `${subj.id}-mock-${String(i + 1).padStart(2, '0')}`,
      title: `${config.title} Mock Test ${i + 1}`,
      timeMinutes: config.timeMinutes,
      questionCount: targetPerExam,
    };

    if (questionIds.length >= targetPerExam * 0.8) {
      exam.questionIds = questionIds.slice(0, targetPerExam);
    }
    // else: will draw randomly at runtime

    exams.push(exam);
  }

  subj.mockExams = exams;
  console.log(subj.id + ': generated ' + exams.length + ' exams (' +
    targetPerExam + ' questions each, ' + config.timeMinutes + ' min), ' +
    'from ' + practice.length + ' practice questions');
}

fs.writeFileSync(PACK_PATH, JSON.stringify(d, null, 2));
console.log('\nDone! Total exams:', d.subjects.reduce((s, subj) => s + (subj.mockExams?.length || 0), 0));
