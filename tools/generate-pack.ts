/**
 * Pack template generator — creates a content pack skeleton from a curriculum definition.
 *
 * Usage:
 *   npx ts-node tools/generate-pack.ts --name "NAPLAN Year 9" --subjects math,science --output packs/naplan-y9.json
 *   npx ts-node tools/generate-pack.ts --template science --output packs/science-general.json
 *
 * Templates: math, science, english, all
 * Or specify custom subjects with --subjects
 */

interface PackTemplate {
  packId: string;
  packVersion: number;
  exam: string;
  description: string;
  subjects: SubjectTemplate[];
  testStyles?: { id: string; label: string; secsPerQuestion: number }[];
}

interface SubjectTemplate {
  id: string;
  label: string;
  notes: {
    exam: { name: string; subject: string; version: string; description: string };
    categories: CategoryTemplate[];
  };
  practice: PracticeQuestion[];
  mockExams: MockExam[];
}

interface CategoryTemplate {
  title: string;
  topics: TopicTemplate[];
}

interface TopicTemplate {
  id: string;
  title: string;
  topic_id?: string;
  concept_explanation: string;
  key_points?: string[];
  formulas?: string[];
  examples: ExampleTemplate[];
}

interface ExampleTemplate {
  question: string;
  solution_steps: string[];
  answer: string;
  difficulty: number;
}

interface PracticeQuestion {
  id: string;
  topic: string;
  topic_id?: string;
  question: string;
  options?: string[];
  answer: string;
  solutionSteps?: string[];
  difficulty?: number;
}

interface MockExam {
  id: string;
  title: string;
  timeMinutes: number;
  questionCount: number;
  style?: string;
}

// ─── Subject Templates ───────────────────────────────────────────

const PHYSICS_CATEGORIES: CategoryTemplate[] = [
  {
    title: 'Forces and Motion',
    topics: [
      {
        id: 'PHY-FM-01', title: 'Speed, Distance and Time', topic_id: 'physics.motion.sdt',
        concept_explanation: 'Speed measures how fast an object moves. Speed = Distance / Time.',
        key_points: ['Speed = Distance / Time', 'Distance = Speed × Time', 'Time = Distance / Speed'],
        formulas: ['v = d/t', 'd = v × t', 't = d/v'],
        examples: [
          { question: 'A car travels 150 km in 2.5 hours. Find its average speed.', solution_steps: ['Speed = Distance / Time', 'Speed = 150 / 2.5', 'Speed = 60 km/h'], answer: '60 km/h', difficulty: 1 },
          { question: 'A cyclist rides at 18 km/h for 45 minutes. How far does she travel?', solution_steps: ['Convert 45 min = 0.75 hours', 'Distance = Speed × Time', 'Distance = 18 × 0.75 = 13.5 km'], answer: '13.5 km', difficulty: 2 },
        ],
      },
      {
        id: 'PHY-FM-02', title: 'Acceleration and Newtons Laws', topic_id: 'physics.motion.acceleration',
        concept_explanation: 'Acceleration is the rate of change of velocity. Newtons Second Law: F = ma.',
        key_points: ['a = (v-u)/t', 'F = ma', 'Every action has an equal and opposite reaction'],
        formulas: ['a = (v-u)/t', 'F = m × a', 'v = u + at', 's = ut + ½at²'],
        examples: [
          { question: 'A 5 kg object accelerates at 3 m/s². What force is applied?', solution_steps: ['F = m × a', 'F = 5 × 3', 'F = 15 N'], answer: '15 N', difficulty: 1 },
          { question: 'A car accelerates from 10 m/s to 30 m/s in 4 seconds. Find the acceleration.', solution_steps: ['a = (v - u) / t', 'a = (30 - 10) / 4', 'a = 20 / 4 = 5 m/s²'], answer: '5 m/s²', difficulty: 2 },
        ],
      },
      {
        id: 'PHY-FM-03', title: 'Gravity and Weight', topic_id: 'physics.motion.gravity',
        concept_explanation: 'Weight is the force of gravity on an object. W = mg where g ≈ 9.8 m/s² on Earth.',
        formulas: ['W = m × g', 'g = 9.8 m/s²'],
        examples: [
          { question: 'Find the weight of a 12 kg object on Earth (g = 9.8 m/s²).', solution_steps: ['W = m × g', 'W = 12 × 9.8', 'W = 117.6 N'], answer: '117.6 N', difficulty: 1 },
        ],
      },
    ],
  },
  {
    title: 'Waves and Sound',
    topics: [
      {
        id: 'PHY-WV-01', title: 'Properties of Waves', topic_id: 'physics.waves.properties',
        concept_explanation: 'Waves transfer energy without transferring matter. Key properties: wavelength, frequency, amplitude, speed.',
        key_points: ['v = f × λ', 'Transverse: oscillation perpendicular to direction', 'Longitudinal: oscillation parallel to direction'],
        formulas: ['v = f × λ', 'T = 1/f'],
        examples: [
          { question: 'A wave has frequency 50 Hz and wavelength 0.4 m. Find its speed.', solution_steps: ['v = f × λ', 'v = 50 × 0.4', 'v = 20 m/s'], answer: '20 m/s', difficulty: 1 },
          { question: 'Sound travels at 340 m/s. A note has frequency 680 Hz. Find the wavelength.', solution_steps: ['v = f × λ', 'λ = v / f', 'λ = 340 / 680 = 0.5 m'], answer: '0.5 m', difficulty: 2 },
        ],
      },
    ],
  },
  {
    title: 'Electricity and Magnetism',
    topics: [
      {
        id: 'PHY-EM-01', title: 'Electric Circuits', topic_id: 'physics.electricity.circuits',
        concept_explanation: 'Electric current flows through circuits. Ohms Law: V = IR. Series and parallel circuits behave differently.',
        key_points: ['V = I × R (Ohms Law)', 'Series: same current, voltages add', 'Parallel: same voltage, currents add'],
        formulas: ['V = I × R', 'P = V × I', 'P = I²R', 'R_series = R1 + R2', '1/R_parallel = 1/R1 + 1/R2'],
        examples: [
          { question: 'A 12V battery drives a current of 3A through a resistor. Find the resistance.', solution_steps: ['V = I × R', 'R = V / I', 'R = 12 / 3 = 4 Ω'], answer: '4 Ω', difficulty: 1 },
          { question: 'Two resistors (6 Ω and 3 Ω) are connected in parallel. Find the total resistance.', solution_steps: ['1/R = 1/R1 + 1/R2', '1/R = 1/6 + 1/3 = 1/6 + 2/6 = 3/6', 'R = 6/3 = 2 Ω'], answer: '2 Ω', difficulty: 2 },
        ],
      },
      {
        id: 'PHY-EM-02', title: 'Energy and Power', topic_id: 'physics.electricity.power',
        concept_explanation: 'Electrical power is the rate of energy transfer. P = VI = I²R = V²/R.',
        formulas: ['P = V × I', 'E = P × t', 'P = I²R'],
        examples: [
          { question: 'A 240V kettle draws 10A. Find the power.', solution_steps: ['P = V × I', 'P = 240 × 10', 'P = 2400 W = 2.4 kW'], answer: '2400 W', difficulty: 1 },
        ],
      },
    ],
  },
  {
    title: 'Light and Optics',
    topics: [
      {
        id: 'PHY-LO-01', title: 'Reflection and Refraction', topic_id: 'physics.light.reflection',
        concept_explanation: 'Light reflects off surfaces (angle of incidence = angle of reflection) and refracts when passing between media (Snells Law).',
        key_points: ['Angle of incidence = angle of reflection', 'n₁ sin θ₁ = n₂ sin θ₂ (Snells Law)', 'Total internal reflection occurs at critical angle'],
        formulas: ['n = c/v', 'n₁ sin θ₁ = n₂ sin θ₂'],
        examples: [
          { question: 'Light hits a mirror at 35° to the normal. What is the angle of reflection?', solution_steps: ['Angle of incidence = angle of reflection', 'Angle of reflection = 35°'], answer: '35°', difficulty: 1 },
        ],
      },
    ],
  },
  {
    title: 'Energy and Thermal Physics',
    topics: [
      {
        id: 'PHY-TH-01', title: 'Energy Transfers and Conservation', topic_id: 'physics.energy.conservation',
        concept_explanation: 'Energy cannot be created or destroyed, only transferred or transformed. KE = ½mv², PE = mgh.',
        formulas: ['KE = ½mv²', 'PE = mgh', 'Efficiency = useful output / total input × 100%'],
        examples: [
          { question: 'Find the kinetic energy of a 2 kg ball moving at 5 m/s.', solution_steps: ['KE = ½mv²', 'KE = ½ × 2 × 5²', 'KE = ½ × 2 × 25 = 25 J'], answer: '25 J', difficulty: 1 },
          { question: 'A 3 kg object is lifted 4 m. Find the gravitational PE gained (g = 9.8 m/s²).', solution_steps: ['PE = mgh', 'PE = 3 × 9.8 × 4', 'PE = 117.6 J'], answer: '117.6 J', difficulty: 1 },
        ],
      },
    ],
  },
];

const CHEMISTRY_CATEGORIES: CategoryTemplate[] = [
  {
    title: 'Atomic Structure',
    topics: [
      {
        id: 'CHM-AS-01', title: 'Atoms, Elements and Compounds', topic_id: 'chemistry.atoms.structure',
        concept_explanation: 'Atoms are made of protons, neutrons and electrons. Proton number = atomic number. Mass number = protons + neutrons.',
        key_points: ['Protons: positive, in nucleus', 'Neutrons: neutral, in nucleus', 'Electrons: negative, in shells', 'Atomic number = number of protons'],
        examples: [
          { question: 'Carbon has atomic number 6 and mass number 12. How many protons, neutrons and electrons?', solution_steps: ['Protons = atomic number = 6', 'Neutrons = mass number - atomic number = 12 - 6 = 6', 'Electrons = protons (neutral atom) = 6'], answer: '6 protons, 6 neutrons, 6 electrons', difficulty: 1 },
        ],
      },
      {
        id: 'CHM-AS-02', title: 'Electron Configuration', topic_id: 'chemistry.atoms.electrons',
        concept_explanation: 'Electrons fill shells: 2 in first, 8 in second, 8 in third. Configuration determines chemical properties.',
        examples: [
          { question: 'Write the electron configuration of sodium (Na, atomic number 11).', solution_steps: ['Shell 1: 2 electrons', 'Shell 2: 8 electrons', 'Shell 3: 1 electron', 'Configuration: 2, 8, 1'], answer: '2, 8, 1', difficulty: 1 },
        ],
      },
    ],
  },
  {
    title: 'Chemical Bonding',
    topics: [
      {
        id: 'CHM-CB-01', title: 'Ionic and Covalent Bonds', topic_id: 'chemistry.bonding.types',
        concept_explanation: 'Ionic bonds: electrons transferred (metal + non-metal). Covalent bonds: electrons shared (non-metal + non-metal).',
        key_points: ['Ionic: metal gives electrons to non-metal', 'Covalent: atoms share electron pairs', 'Metallic: sea of delocalised electrons'],
        examples: [
          { question: 'What type of bond forms between sodium (Na) and chlorine (Cl)?', solution_steps: ['Na is a metal, Cl is a non-metal', 'Metal + non-metal = ionic bond', 'Na loses 1 electron → Na⁺', 'Cl gains 1 electron → Cl⁻'], answer: 'Ionic bond (NaCl)', difficulty: 1 },
          { question: 'What type of bond forms in a water molecule (H₂O)?', solution_steps: ['H and O are both non-metals', 'Non-metal + non-metal = covalent bond', 'Each H shares 1 electron with O', 'O has 2 bonding pairs and 2 lone pairs'], answer: 'Covalent bond', difficulty: 1 },
        ],
      },
    ],
  },
  {
    title: 'Chemical Reactions',
    topics: [
      {
        id: 'CHM-CR-01', title: 'Balancing Equations', topic_id: 'chemistry.reactions.balancing',
        concept_explanation: 'Chemical equations must be balanced — same number of each atom on both sides. Adjust coefficients, not subscripts.',
        examples: [
          { question: 'Balance: H₂ + O₂ → H₂O', solution_steps: ['Left: 2 H, 2 O', 'Right: 2 H, 1 O — not balanced', 'Put 2 in front of H₂O: H₂ + O₂ → 2H₂O', 'Now right: 4 H, 2 O', 'Put 2 in front of H₂: 2H₂ + O₂ → 2H₂O', 'Left: 4 H, 2 O ✓ Right: 4 H, 2 O ✓'], answer: '2H₂ + O₂ → 2H₂O', difficulty: 2 },
        ],
      },
      {
        id: 'CHM-CR-02', title: 'Types of Reactions', topic_id: 'chemistry.reactions.types',
        concept_explanation: 'Main types: combination (synthesis), decomposition, single displacement, double displacement, combustion.',
        key_points: ['Combustion: fuel + O₂ → CO₂ + H₂O', 'Neutralisation: acid + base → salt + water', 'Decomposition: AB → A + B'],
        examples: [
          { question: 'What type of reaction is: 2Mg + O₂ → 2MgO?', solution_steps: ['Two reactants combine to form one product', 'This is a combination (synthesis) reaction', 'Also an oxidation reaction (Mg is oxidised)'], answer: 'Combination/synthesis reaction', difficulty: 1 },
        ],
      },
    ],
  },
  {
    title: 'Acids and Bases',
    topics: [
      {
        id: 'CHM-AB-01', title: 'pH Scale and Indicators', topic_id: 'chemistry.acids.ph',
        concept_explanation: 'pH measures acidity: 0-6 acidic, 7 neutral, 8-14 alkaline. pH = -log[H⁺].',
        key_points: ['pH < 7: acidic', 'pH = 7: neutral', 'pH > 7: alkaline/basic', 'Strong acids fully dissociate'],
        examples: [
          { question: 'A solution has [H⁺] = 0.001 M. What is the pH?', solution_steps: ['pH = -log[H⁺]', 'pH = -log(0.001)', 'pH = -log(10⁻³) = 3'], answer: 'pH = 3 (acidic)', difficulty: 2 },
        ],
      },
    ],
  },
];

const BIOLOGY_CATEGORIES: CategoryTemplate[] = [
  {
    title: 'Cells and Organisation',
    topics: [
      {
        id: 'BIO-CL-01', title: 'Cell Structure', topic_id: 'biology.cells.structure',
        concept_explanation: 'Cells are the basic unit of life. Animal and plant cells have different organelles.',
        key_points: ['Nucleus: contains DNA', 'Mitochondria: cellular respiration', 'Cell membrane: controls entry/exit', 'Plant cells also have: cell wall, chloroplasts, vacuole'],
        examples: [
          { question: 'Name the organelle responsible for cellular respiration.', solution_steps: ['Cellular respiration = converting glucose to energy (ATP)', 'This occurs in the mitochondria'], answer: 'Mitochondria', difficulty: 1 },
          { question: 'Which structures are found in plant cells but NOT animal cells?', solution_steps: ['Cell wall: rigid outer layer', 'Chloroplasts: for photosynthesis', 'Large central vacuole: stores water'], answer: 'Cell wall, chloroplasts, large vacuole', difficulty: 1 },
        ],
      },
      {
        id: 'BIO-CL-02', title: 'Cell Division', topic_id: 'biology.cells.division',
        concept_explanation: 'Mitosis produces identical cells for growth/repair. Meiosis produces gametes with half the chromosomes.',
        key_points: ['Mitosis: 1 cell → 2 identical cells', 'Meiosis: 1 cell → 4 different cells (half chromosomes)', 'Humans: 46 chromosomes (23 pairs)'],
        examples: [
          { question: 'A human cell has 46 chromosomes. How many chromosomes after mitosis? After meiosis?', solution_steps: ['Mitosis: identical copy → 46 chromosomes', 'Meiosis: halved → 23 chromosomes'], answer: 'Mitosis: 46, Meiosis: 23', difficulty: 1 },
        ],
      },
    ],
  },
  {
    title: 'Genetics and Evolution',
    topics: [
      {
        id: 'BIO-GN-01', title: 'DNA and Genes', topic_id: 'biology.genetics.dna',
        concept_explanation: 'DNA is a double helix made of nucleotides. Genes are sections of DNA that code for proteins.',
        key_points: ['Base pairs: A-T, C-G', 'Gene = section of DNA coding for a protein', 'Chromosome = long strand of DNA', 'Genome = all DNA in an organism'],
        examples: [
          { question: 'If one strand of DNA has the sequence ATCGGA, what is the complementary strand?', solution_steps: ['A pairs with T', 'T pairs with A', 'C pairs with G', 'G pairs with C', 'ATCGGA → TAGCCT'], answer: 'TAGCCT', difficulty: 1 },
        ],
      },
    ],
  },
  {
    title: 'Body Systems',
    topics: [
      {
        id: 'BIO-BS-01', title: 'Circulatory System', topic_id: 'biology.body.circulatory',
        concept_explanation: 'The heart pumps blood through arteries, capillaries and veins. Double circulation: pulmonary + systemic.',
        key_points: ['Arteries: carry blood AWAY from heart (high pressure)', 'Veins: carry blood TO heart (low pressure, valves)', 'Capillaries: exchange of substances (thin walls)'],
        examples: [
          { question: 'Which blood vessel carries oxygenated blood from the lungs to the heart?', solution_steps: ['Blood returns from lungs to heart', 'Returns via pulmonary vein', 'Pulmonary vein is special: carries oxygenated blood (unlike other veins)'], answer: 'Pulmonary vein', difficulty: 2 },
        ],
      },
      {
        id: 'BIO-BS-02', title: 'Respiratory System', topic_id: 'biology.body.respiratory',
        concept_explanation: 'Gas exchange occurs in the alveoli: oxygen diffuses into blood, carbon dioxide diffuses out.',
        key_points: ['Breathing: air → trachea → bronchi → bronchioles → alveoli', 'Alveoli: thin walls, large surface area, rich blood supply', 'Diffusion down concentration gradient'],
        examples: [
          { question: 'Why are alveoli well-adapted for gas exchange?', solution_steps: ['Large surface area (millions of alveoli)', 'Very thin walls (one cell thick)', 'Rich blood supply (dense capillary network)', 'Moist lining (gases dissolve)'], answer: 'Large surface area, thin walls, rich blood supply, moist lining', difficulty: 2 },
        ],
      },
    ],
  },
  {
    title: 'Ecology',
    topics: [
      {
        id: 'BIO-EC-01', title: 'Food Chains and Webs', topic_id: 'biology.ecology.foodchains',
        concept_explanation: 'Energy flows through ecosystems: producers → primary consumers → secondary consumers → tertiary consumers.',
        key_points: ['Producers: make own food (photosynthesis)', 'Consumers: eat other organisms', 'Decomposers: break down dead matter', 'Energy decreases at each trophic level (~10% transfer)'],
        examples: [
          { question: 'In the food chain: grass → rabbit → fox → eagle, identify the producer and secondary consumer.', solution_steps: ['Producer = makes own food = grass', 'Primary consumer = eats producer = rabbit', 'Secondary consumer = eats primary consumer = fox', 'Tertiary consumer = eagle'], answer: 'Producer: grass, Secondary consumer: fox', difficulty: 1 },
        ],
      },
    ],
  },
];

function generatePractice(categories: CategoryTemplate[], subjectId: string): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  let qNum = 1;
  for (const cat of categories) {
    for (const topic of cat.topics) {
      for (const ex of topic.examples) {
        questions.push({
          id: `${subjectId.toUpperCase()}-P${String(qNum++).padStart(3, '0')}`,
          topic: topic.title,
          topic_id: topic.topic_id,
          question: ex.question,
          answer: ex.answer,
          solutionSteps: ex.solution_steps,
          difficulty: ex.difficulty,
        });
      }
    }
  }
  return questions;
}

function buildSubject(id: string, label: string, examName: string, categories: CategoryTemplate[]): SubjectTemplate {
  return {
    id,
    label,
    notes: {
      exam: { name: examName, subject: label, version: '2025', description: `${label} study notes.` },
      categories,
    },
    practice: generatePractice(categories, id),
    mockExams: [
      { id: `${id}-full`, title: `Full ${label} Exam`, timeMinutes: 45, questionCount: 30 },
      { id: `${id}-quick`, title: `Quick ${label} Quiz`, timeMinutes: 15, questionCount: 10 },
    ],
  };
}

function generatePack(name: string, subjects: string[]): PackTemplate {
  const packId = `pack:${name.toLowerCase().replace(/\s+/g, '-')}`;
  const subjectTemplates: SubjectTemplate[] = [];

  for (const subj of subjects) {
    switch (subj) {
      case 'physics':
        subjectTemplates.push(buildSubject('physics', 'Physics', name, PHYSICS_CATEGORIES));
        break;
      case 'chemistry':
        subjectTemplates.push(buildSubject('chemistry', 'Chemistry', name, CHEMISTRY_CATEGORIES));
        break;
      case 'biology':
        subjectTemplates.push(buildSubject('biology', 'Biology', name, BIOLOGY_CATEGORIES));
        break;
    }
  }

  return {
    packId,
    packVersion: 1,
    exam: name,
    description: `${name} content pack with ${subjects.join(', ')}.`,
    subjects: subjectTemplates,
  };
}

// ─── CLI Entry ───────────────────────────────────────────────────

const args = process.argv.slice(2);
const nameIdx = args.indexOf('--name');
const name = nameIdx >= 0 ? args[nameIdx + 1]! : 'General Science';
const templateIdx = args.indexOf('--template');
const template = templateIdx >= 0 ? args[templateIdx + 1]! : '';
const subjIdx = args.indexOf('--subjects');
const subjStr = subjIdx >= 0 ? args[subjIdx + 1]! : '';
const outIdx = args.indexOf('--output');
const output = outIdx >= 0 ? args[outIdx + 1]! : 'packs/generated-pack.json';

let subjects: string[];
if (template === 'science') subjects = ['physics', 'chemistry', 'biology'];
else if (subjStr) subjects = subjStr.split(',');
else subjects = ['physics', 'chemistry', 'biology'];

const pack = generatePack(name, subjects);
const fs = require('fs');
fs.writeFileSync(output, JSON.stringify(pack, null, 2));
console.log(`✓ Generated pack: ${output}`);
console.log(`  ${pack.subjects.length} subjects, ${pack.subjects.reduce((n, s) => n + s.practice.length, 0)} practice questions`);
