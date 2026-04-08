/**
 * Inline SVG diagram generator for study notes.
 * Generates educational diagrams based on topic content.
 * SVGs are lightweight, scalable, and printable.
 */

const COLORS = {
  primary: '#3b82f6',
  secondary: '#4ade80',
  accent: '#f59e0b',
  red: '#f87171',
  purple: '#a78bfa',
  text: '#e2e8f0',
  muted: '#94a3b8',
  bg: '#1e293b',
  fill: 'rgba(59, 130, 246, 0.12)',
  fillGreen: 'rgba(74, 222, 128, 0.12)',
  fillRed: 'rgba(248, 113, 113, 0.1)',
  fillAmber: 'rgba(245, 158, 11, 0.1)',
};

function svg(width: number, height: number, content: string): string {
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:10px auto;">
    <style>text{font-family:'Inter',-apple-system,sans-serif;fill:${COLORS.text}} .label{font-size:13px} .formula{font-size:15px;font-weight:600;fill:${COLORS.primary}} .dim{font-size:12px;fill:${COLORS.accent}} .note{font-size:11px;fill:${COLORS.muted}}</style>
    ${content}
  </svg>`;
}

/** Generate a diagram SVG string for a topic, or null if not applicable */
export function generateDiagram(topicTitle: string): string | null {
  const t = topicTitle.toLowerCase();

  // --- Geometry (existing) ---
  if (t.includes('rectangle') || (t.includes('area') && !t.includes('surface') && !t.includes('circle')))
    return rectangleAreaDiagram();
  if (t.includes('triangle') && !t.includes('trig') && !t.includes('similar') && !t.includes('congru') && !t.includes('scale'))
    return triangleDiagram();
  if (t.includes('pythag'))
    return pythagorasDiagram();
  if (t.includes('circle') && !t.includes('coordinate'))
    return circleDiagram();
  if (t.includes('angle') && !t.includes('triangle') && !t.includes('parallel'))
    return anglesDiagram();
  if (t.includes('perimeter') || t.includes('circumference'))
    return perimeterDiagram();
  if (t.includes('volume') && !t.includes('surface'))
    return volumeDiagram();
  if (t.includes('surface area'))
    return surfaceAreaDiagram();
  if (t.includes('coordinate') || t.includes('graph') && t.includes('key'))
    return coordinateDiagram();
  if (t.includes('quadrilateral'))
    return quadrilateralsDiagram();
  if (t.includes('polygon'))
    return polygonsDiagram();
  if (t.includes('transform') || t.includes('reflect'))
    return transformDiagram();
  if (t.includes('fraction') && !t.includes('algebra'))
    return fractionDiagram();
  if (t.includes('inequalit'))
    return inequalityDiagram();
  if (t.includes('trig'))
    return trigDiagram();
  if (t.includes('ratio') && !t.includes('trig'))
    return ratioDiagram();
  if (t.includes('3d') || t.includes('net') || t.includes('composite solid') || t.includes('prism') || t.includes('cone') || t.includes('pyramid'))
    return netsDiagram();
  if (t.includes('rotation') || t.includes('symmetry'))
    return rotationDiagram();

  // --- Math: Numbers & Operations ---
  if (t.includes('types of number') || t.includes('number type') || t.includes('integer') && t.includes('rational'))
    return typesOfNumbersDiagram();
  if (t.includes('factor') || t.includes('multiple') || t.includes('divisib') || t.includes('hcf') || t.includes('lcm') || t.includes('prime factor'))
    return factorTreeDiagram();
  if (t.includes('operation') && t.includes('integer') || t.includes('negative number') || t.includes('directed number'))
    return integerOperationsDiagram();
  if (t.includes('decimal') && !t.includes('fraction'))
    return decimalsDiagram();
  if (t.includes('percentage') || t.includes('percent'))
    return percentagesDiagram();
  if (t.includes('proportion') || t.includes('direct') && t.includes('inverse'))
    return proportionDiagram();
  if (t.includes('index') || t.includes('indices') || t.includes('exponent') || t.includes('power'))
    return indexLawsDiagram();
  if (t.includes('square root') || t.includes('surd') || t.includes('radical'))
    return surdsDiagram();
  if (t.includes('scientific notation') || t.includes('standard form'))
    return scientificNotationDiagram();
  if (t.includes('logarithm') || t.includes('log'))
    return logarithmsDiagram();

  // --- Math: Algebra ---
  if (t.includes('algebraic expression') || t.includes('expanding') || t.includes('simplif') && t.includes('expression'))
    return algebraicExpressionsDiagram();
  if (t.includes('linear equation') || t.includes('solving equation') || t.includes('one-step') || t.includes('two-step'))
    return linearEquationsDiagram();
  if (t.includes('simultaneous'))
    return simultaneousEquationsDiagram();
  if (t.includes('quadratic'))
    return quadraticDiagram();
  if (t.includes('non-linear') || t.includes('nonlinear') || t.includes('exponential graph') || t.includes('reciprocal graph'))
    return nonLinearGraphsDiagram();
  if (t.includes('algebraic fraction'))
    return algebraicFractionsDiagram();
  if (t.includes('polynomial') || t.includes('cubic'))
    return polynomialsDiagram();

  // --- Math: Sequences ---
  if (t.includes('arithmetic sequence') || t.includes('arithmetic progression') || t.includes('linear sequence'))
    return arithmeticSequenceDiagram();
  if (t.includes('geometric sequence') || t.includes('geometric progression'))
    return geometricSequenceDiagram();
  if (t.includes('sequence') && (t.includes('fibonacci') || t.includes('other') || t.includes('special')))
    return otherSequencesDiagram();

  // --- Math: Geometry extra ---
  if (t.includes('scale drawing') || t.includes('scale factor') || t.includes('enlargement'))
    return scaleDrawingsDiagram();
  if (t.includes('similar') || t.includes('congru'))
    return similarityCongruenceDiagram();
  if (t.includes('estimation') || t.includes('rounding') || t.includes('approximat'))
    return estimationDiagram();
  if (t.includes('parallel') && t.includes('line') || t.includes('perpendicular') || t.includes('transversal'))
    return parallelLinesDiagram();

  // --- Math: Statistics & Probability ---
  if (t.includes('statistic') || t.includes('data') && (t.includes('chart') || t.includes('bar') || t.includes('display') || t.includes('represent')))
    return statisticsDiagram();
  if (t.includes('probability') && !t.includes('verbal') && !t.includes('spinner'))
    return probabilityDiagram();

  // --- Math: Financial ---
  if (t.includes('interest') || t.includes('compound') || t.includes('simple interest'))
    return interestDiagram();
  if (t.includes('profit') || t.includes('loss') || t.includes('cost price') || t.includes('selling price'))
    return profitLossDiagram();

  // --- Math: Problem Solving ---
  if (t.includes('problem solving') || t.includes('problem-solving') || t.includes('word problem'))
    return problemSolvingDiagram();

  // --- Verbal ---
  if (t.includes('analog'))
    return analogiesDiagram();
  if (t.includes('synonym'))
    return synonymsDiagram();
  if (t.includes('antonym'))
    return antonymsDiagram();
  if (t.includes('odd one out') || t.includes('odd-one-out'))
    return oddOneOutDiagram();
  if (t.includes('word classification') || t.includes('classify') && t.includes('word'))
    return wordClassificationDiagram();
  if (t.includes('sentence completion') || t.includes('cloze'))
    return sentenceCompletionDiagram();
  if (t.includes('word meaning') || t.includes('meaning in context') || t.includes('vocabulary') && t.includes('context') && !t.includes('reading'))
    return wordMeaningsContextDiagram();
  if (t.includes('prefix') || t.includes('suffix'))
    return prefixSuffixDiagram();
  if (t.includes('multiple meaning') || t.includes('polysem'))
    return multipleMeaningsDiagram();
  if (t.includes('homophone') || t.includes('homonym'))
    return homophonesDiagram();
  if (t.includes('inference') && !t.includes('reading'))
    return inferenceDiagram();
  if (t.includes('syllogism') || t.includes('logical reasoning'))
    return syllogismsDiagram();
  if (t.includes('coding') && !t.includes('program') || t.includes('letter shift') || t.includes('code') && t.includes('verbal'))
    return codingDiagram();
  if (t.includes('parts of speech') || t.includes('noun') && t.includes('verb') || t.includes('grammar'))
    return partsOfSpeechDiagram();
  if (t.includes('spelling'))
    return spellingDiagram();
  if (t.includes('idiom') || t.includes('figure of speech'))
    return idiomsDiagram();
  if (t.includes('comprehension') && !t.includes('reading'))
    return comprehensionDiagram();
  if (t.includes('deduction') || t.includes('deductive'))
    return deductionDiagram();

  // --- Quantitative ---
  if (t.includes('number sequence') || t.includes('sequence') && t.includes('pattern'))
    return numberSequencesDiagram();
  if (t.includes('speed') || t.includes('distance') && t.includes('time'))
    return speedDistanceTimeDiagram();
  if (t.includes('work') && t.includes('rate') || t.includes('pipe') && t.includes('tank'))
    return workRateDiagram();
  if (t.includes('spinner') || t.includes('dice') || t.includes('probability') && t.includes('quantitative'))
    return probabilitySpinnerDiagram();
  if (t.includes('venn'))
    return vennDiagramDiagram();
  if (t.includes('table') && t.includes('chart') || t.includes('bar chart') || t.includes('data table'))
    return tablesChartsDiagram();
  if (t.includes('mean') || t.includes('median') || t.includes('mode') || t.includes('average'))
    return meanMedianModeDiagram();
  if (t.includes('paper folding') || t.includes('paper cutting') || t.includes('paper fold'))
    return paperFoldingDiagram();
  if (t.includes('mental math') || t.includes('mental arithmetic') || t.includes('quick calc'))
    return mentalMathDiagram();
  if (t.includes('mcq') || t.includes('multiple choice') || t.includes('exam strategy') || t.includes('test strategy'))
    return mcqStrategyDiagram();

  // --- Reading ---
  if (t.includes('finding info') || t.includes('finding information') || t.includes('locate') && t.includes('text'))
    return findingInfoDiagram();
  if (t.includes('sequencing') || t.includes('sequence') && t.includes('event') || t.includes('order') && t.includes('event'))
    return sequencingDiagram();
  if (t.includes('inference') && t.includes('reading') || t.includes('infer') && t.includes('read'))
    return readingInferenceDiagram();
  if (t.includes('vocabulary') && t.includes('context') && t.includes('reading') || t.includes('context clue'))
    return vocabInContextDiagram();
  if (t.includes('author') && t.includes('purpose') || t.includes('purpose'))
    return authorPurposeDiagram();
  if (t.includes('tone') || t.includes('mood'))
    return toneDiagram();
  if (t.includes('text structure') || t.includes('cause') && t.includes('effect') || t.includes('compare') && t.includes('contrast'))
    return textStructureDiagram();
  if (t.includes('evidence') || t.includes('support') && t.includes('claim'))
    return evidenceDiagram();
  if (t.includes('exam technique') || t.includes('reading technique') || t.includes('test tip'))
    return examTechniqueDiagram();

  // --- Writing ---
  if (t.includes('essay') && t.includes('plan') || t.includes('essay structure') || t.includes('paragraph structure'))
    return essayPlanningDiagram();
  if (t.includes('opening') || t.includes('hook') || t.includes('introduction') && t.includes('writing'))
    return strongOpeningsDiagram();
  if (t.includes('show') && t.includes('tell') || t.includes('descriptive writing'))
    return showDontTellDiagram();
  if (t.includes('dialogue') || t.includes('speech') && t.includes('writing'))
    return dialogueDiagram();
  if (t.includes('argument') || t.includes('argumentative') || t.includes('discursive'))
    return argumentDiagram();
  if (t.includes('persuasive') || t.includes('persuasion') || t.includes('rhetoric'))
    return persuasiveTechniquesDiagram();
  if (t.includes('vocabulary') && t.includes('writing') || t.includes('word choice') || t.includes('vivid'))
    return vocabularyUpgradeDiagram();
  if (t.includes('figurative') || t.includes('simile') || t.includes('metaphor') || t.includes('personification'))
    return figurativeLanguageDiagram();
  if (t.includes('editing') || t.includes('proofread') || t.includes('revision'))
    return editingDiagram();

  // --- Fallback: try broader matches ---
  if (t.includes('sequence'))
    return numberSequencesDiagram();
  if (t.includes('data'))
    return statisticsDiagram();
  if (t.includes('graph'))
    return coordinateDiagram();
  if (t.includes('equation'))
    return linearEquationsDiagram();
  if (t.includes('number'))
    return typesOfNumbersDiagram();
  if (t.includes('vocabulary') || t.includes('vocab'))
    return vocabularyUpgradeDiagram();
  if (t.includes('writing'))
    return essayPlanningDiagram();
  if (t.includes('reading'))
    return findingInfoDiagram();

  return null;
}

function rectangleAreaDiagram(): string {
  return svg(360, 220, `
    <rect x="40" y="30" width="200" height="120" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="2"/>
    <!-- Grid -->
    ${[1,2,3,4].map(i => `<line x1="${40+i*40}" y1="30" x2="${40+i*40}" y2="150" stroke="${COLORS.primary}" stroke-width="0.5" opacity="0.3"/>`).join('')}
    ${[1,2].map(i => `<line x1="40" y1="${30+i*40}" x2="240" y2="${30+i*40}" stroke="${COLORS.primary}" stroke-width="0.5" opacity="0.3"/>`).join('')}
    <!-- Labels -->
    <text x="140" y="175" class="dim" text-anchor="middle">width = 5</text>
    <line x1="40" y1="165" x2="240" y2="165" stroke="${COLORS.accent}" stroke-width="1" marker-end="url(#arr)" marker-start="url(#arr2)"/>
    <text x="15" y="95" class="dim" text-anchor="middle" transform="rotate(-90,15,95)">height = 3</text>
    <text x="280" y="80" class="formula">A = w × h</text>
    <text x="280" y="100" class="formula">A = 5 × 3</text>
    <text x="280" y="120" class="formula" fill="${COLORS.secondary}">= 15 units²</text>
    <text x="130" y="100" class="note" text-anchor="middle">15 squares</text>
    <defs><marker id="arr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.accent}"/></marker><marker id="arr2" viewBox="0 0 6 6" refX="0" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M6,0 L0,3 L6,6" fill="${COLORS.accent}"/></marker></defs>
  `);
}

function triangleDiagram(): string {
  return svg(360, 240, `
    <polygon points="50,200 280,200 180,50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <!-- Height -->
    <line x1="180" y1="50" x2="180" y2="200" stroke="${COLORS.secondary}" stroke-width="1.5" stroke-dasharray="6,3"/>
    <rect x="172" y="188" width="10" height="10" fill="none" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="192" y="135" class="dim">h</text>
    <!-- Base -->
    <text x="165" y="218" class="dim" text-anchor="middle">base</text>
    <!-- Angle marks -->
    <path d="M70,200 A20,20 0 0,0 62,184" fill="none" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="80" y="188" class="note">α</text>
    <!-- Formula -->
    <text x="290" y="100" class="formula">A = ½bh</text>
    <text x="290" y="125" class="note">height must be</text>
    <text x="290" y="140" class="note">perpendicular ⊥</text>
    <text x="290" y="160" class="note">to the base</text>
  `);
}

function pythagorasDiagram(): string {
  // 3-4-5 triangle: base=3, height=4, hypotenuse=5
  // Scale: 40px per unit → base=120px, height=160px
  const sc = 40;
  const bx = 50, by = 210; // bottom-left corner
  const base = 3 * sc;  // 120px
  const height = 4 * sc; // 160px
  return svg(400, 240, `
    <!-- Right triangle (3:4:5 proportions) -->
    <polygon points="${bx},${by} ${bx+base},${by} ${bx+base},${by-height}" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="${bx+base-12}" y="${by-12}" width="12" height="12" fill="none" stroke="${COLORS.red}" stroke-width="1.5"/>
    <!-- Side labels — a=3 (base), b=4 (height), c=5 (hypotenuse) -->
    <text x="${bx+base/2}" y="${by+18}" class="dim" text-anchor="middle">a = 3</text>
    <text x="${bx+base+15}" y="${by-height/2+5}" class="dim">b = 4</text>
    <text x="${bx+base/2-30}" y="${by-height/2-5}" class="dim" transform="rotate(-53,${bx+base/2-30},${by-height/2-5})">c = 5</text>
    <!-- Small squares showing area -->
    <rect x="${bx}" y="${by+5}" width="${3*12}" height="${3*12}" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1" rx="1"/>
    <text x="${bx+18}" y="${by+25}" style="font-size:9px" fill="${COLORS.red}" text-anchor="middle">a²=9</text>
    <rect x="${bx+base+5}" y="${by-height}" width="${4*12}" height="${4*12}" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1" rx="1"/>
    <text x="${bx+base+5+24}" y="${by-height+30}" style="font-size:9px" fill="${COLORS.secondary}" text-anchor="middle">b²=16</text>
    <!-- Formula -->
    <text x="290" y="50" class="formula">a² + b² = c²</text>
    <text x="290" y="75" class="dim">9 + 16 = 25</text>
    <text x="290" y="95" class="dim">c = √25 = 5</text>
    <text x="290" y="130" class="note">Common triples:</text>
    <text x="290" y="148" class="note">3-4-5, 5-12-13</text>
    <text x="290" y="166" class="note">8-15-17, 7-24-25</text>
  `);
}

function circleDiagram(): string {
  return svg(400, 250, `
    <circle cx="140" cy="125" r="90" fill="${COLORS.fill}" stroke="${COLORS.purple}" stroke-width="2"/>
    <!-- Centre -->
    <circle cx="140" cy="125" r="3" fill="${COLORS.red}"/>
    <!-- Radius -->
    <line x1="140" y1="125" x2="230" y2="125" stroke="${COLORS.red}" stroke-width="2"/>
    <text x="185" y="118" class="dim">r</text>
    <!-- Diameter -->
    <line x1="50" y1="125" x2="230" y2="125" stroke="${COLORS.primary}" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="140" y="145" class="dim" text-anchor="middle">d = 2r</text>
    <!-- Formulas -->
    <text x="260" y="60" class="formula">Area = πr²</text>
    <text x="260" y="85" class="formula">C = 2πr = πd</text>
    <text x="260" y="120" class="note">π ≈ 3.14159...</text>
    <text x="260" y="145" class="note">r = radius</text>
    <text x="260" y="165" class="note">d = diameter = 2r</text>
    <!-- Sector hint -->
    <path d="M140,125 L230,125 A90,90 0 0,1 203,198 Z" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1"/>
    <text x="200" y="175" class="note" fill="${COLORS.accent}">sector</text>
    <text x="260" y="200" class="note">Sector area = θ/360 × πr²</text>
    <text x="260" y="220" class="note">Arc length = θ/360 × 2πr</text>
  `);
}

function anglesDiagram(): string {
  return svg(420, 200, `
    <!-- Straight line angles -->
    <line x1="20" y1="100" x2="180" y2="100" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="100" y1="100" x2="60" y2="30" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <path d="M85,100 A15,15 0 0,0 78,85" fill="none" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="72" y="92" style="font-size:11px" fill="${COLORS.accent}">a</text>
    <path d="M115,100 A15,15 0 0,1 78,85" fill="none" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="105" y="82" style="font-size:11px" fill="${COLORS.secondary}">b</text>
    <text x="60" y="170" class="note">a + b = 180°</text>
    <text x="45" y="185" class="note">(straight line)</text>
    <!-- Vertically opposite -->
    <line x1="240" y1="30" x2="380" y2="170" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="240" y1="170" x2="380" y2="30" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <text x="295" y="85" style="font-size:11px" fill="${COLORS.primary}">x</text>
    <text x="320" y="125" style="font-size:11px" fill="${COLORS.primary}">x</text>
    <text x="305" y="70" style="font-size:11px" fill="${COLORS.red}">y</text>
    <text x="305" y="145" style="font-size:11px" fill="${COLORS.red}">y</text>
    <text x="265" y="185" class="note">Vertically opposite</text>
    <text x="275" y="198" class="note">angles are equal</text>
  `);
}

function perimeterDiagram(): string {
  return svg(380, 200, `
    <!-- Rectangle -->
    <rect x="30" y="30" width="150" height="90" fill="none" stroke="${COLORS.primary}" stroke-width="2.5" rx="2"/>
    <text x="105" y="140" class="dim" text-anchor="middle">8 cm</text>
    <text x="5" y="80" class="dim" text-anchor="middle" transform="rotate(-90,5,80)">5 cm</text>
    <text x="200" y="55" class="formula">P = 2(l + w)</text>
    <text x="200" y="78" class="dim">= 2(8 + 5) = 26 cm</text>
    <!-- Circle -->
    <circle cx="280" cy="140" r="40" fill="none" stroke="${COLORS.purple}" stroke-width="2"/>
    <line x1="280" y1="140" x2="320" y2="140" stroke="${COLORS.red}" stroke-width="1.5"/>
    <text x="298" y="135" style="font-size:10px" fill="${COLORS.red}">r=4</text>
    <text x="330" y="130" class="formula">C = 2πr</text>
    <text x="330" y="150" class="dim">= 8π ≈ 25.1</text>
  `);
}

function volumeDiagram(): string {
  return svg(400, 200, `
    <!-- 3D box -->
    <polygon points="40,150 200,150 200,60 40,60" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <polygon points="200,60 240,40 240,130 200,150" fill="rgba(59,130,246,0.08)" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <polygon points="40,60 80,40 240,40 200,60" fill="rgba(59,130,246,0.06)" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="120" y="165" class="dim" text-anchor="middle">l = 5</text>
    <text x="25" y="110" class="dim">h = 3</text>
    <text x="225" y="38" class="dim">w = 2</text>
    <text x="270" y="70" class="formula">V = l × w × h</text>
    <text x="270" y="92" class="dim">= 5 × 2 × 3</text>
    <text x="270" y="112" class="formula" fill="${COLORS.secondary}">= 30 units³</text>
    <text x="270" y="145" class="note">Cylinder: V = πr²h</text>
    <text x="270" y="163" class="note">Sphere: V = 4/3 πr³</text>
    <text x="270" y="181" class="note">Cone: V = 1/3 πr²h</text>
  `);
}

function surfaceAreaDiagram(): string {
  return svg(380, 180, `
    <!-- Cube net (cross shape) -->
    <rect x="100" y="10" width="50" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <rect x="50" y="60" width="50" height="50" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <rect x="100" y="60" width="50" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <rect x="150" y="60" width="50" height="50" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <rect x="200" y="60" width="50" height="50" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1.5"/>
    <rect x="100" y="110" width="50" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="125" y="92" class="note" text-anchor="middle">front</text>
    <text x="75" y="92" class="note" text-anchor="middle">left</text>
    <text x="175" y="92" class="note" text-anchor="middle">right</text>
    <text x="225" y="92" class="note" text-anchor="middle">back</text>
    <text x="125" y="42" class="note" text-anchor="middle">top</text>
    <text x="125" y="142" class="note" text-anchor="middle">btm</text>
    <text x="280" y="50" class="formula">SA = 6s²</text>
    <text x="280" y="75" class="note">for a cube</text>
    <text x="280" y="105" class="formula">SA = 2(lw+lh+wh)</text>
    <text x="280" y="128" class="note">for a box</text>
  `);
}

function coordinateDiagram(): string {
  return svg(360, 260, `
    <!-- Axes -->
    <line x1="30" y1="230" x2="330" y2="230" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="160" y1="10" x2="160" y2="250" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <text x="335" y="234" class="note">x</text>
    <text x="164" y="10" class="note">y</text>
    <!-- Grid labels -->
    ${[-3,-2,-1,1,2,3].map(i => `<text x="${160+i*40}" y="248" style="font-size:10px" fill="${COLORS.muted}" text-anchor="middle">${i}</text>`).join('')}
    ${[-2,-1,1,2,3].map(i => `<text x="148" y="${230-i*40+4}" style="font-size:10px" fill="${COLORS.muted}" text-anchor="end">${i}</text>`).join('')}
    <!-- Line y = x + 1 -->
    <line x1="40" y1="190" x2="280" y2="30" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="275" y="25" style="font-size:12px" fill="${COLORS.primary}">y = x + 1</text>
    <!-- Point -->
    <circle cx="200" cy="150" r="4" fill="${COLORS.red}"/>
    <text x="210" y="145" style="font-size:11px" fill="${COLORS.red}">(1, 2)</text>
    <!-- Rise/run -->
    <line x1="160" y1="190" x2="200" y2="190" stroke="${COLORS.accent}" stroke-width="1.5" stroke-dasharray="4,2"/>
    <line x1="200" y1="190" x2="200" y2="150" stroke="${COLORS.secondary}" stroke-width="1.5" stroke-dasharray="4,2"/>
    <text x="178" y="205" style="font-size:10px" fill="${COLORS.accent}">run</text>
    <text x="206" y="175" style="font-size:10px" fill="${COLORS.secondary}">rise</text>
    <text x="210" y="230" class="note">gradient = rise/run</text>
  `);
}

function fractionDiagram(): string {
  return svg(380, 160, `
    <!-- 3/4 circle -->
    <circle cx="80" cy="80" r="55" fill="none" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <path d="M80,80 L80,25 A55,55 0 1,1 25,80 Z" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <line x1="80" y1="25" x2="80" y2="135" stroke="${COLORS.muted}" stroke-width="0.5"/>
    <line x1="25" y1="80" x2="135" y2="80" stroke="${COLORS.muted}" stroke-width="0.5"/>
    <text x="80" y="155" class="dim" text-anchor="middle">3/4 shaded</text>
    <!-- Bar model -->
    <rect x="180" y="30" width="180" height="30" fill="none" stroke="${COLORS.muted}" stroke-width="1"/>
    <rect x="180" y="30" width="90" height="30" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="225" y="50" style="font-size:11px" fill="${COLORS.primary}" text-anchor="middle">1/2</text>
    <rect x="180" y="75" width="180" height="30" fill="none" stroke="${COLORS.muted}" stroke-width="1"/>
    <rect x="180" y="75" width="60" height="30" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="210" y="95" style="font-size:11px" fill="${COLORS.secondary}" text-anchor="middle">1/3</text>
    <text x="270" y="130" class="note" text-anchor="middle">1/2 > 1/3</text>
  `);
}

function inequalityDiagram(): string {
  return svg(380, 100, `
    <!-- Number line: x < 4 -->
    <line x1="30" y1="35" x2="350" y2="35" stroke="${COLORS.muted}" stroke-width="1.5"/>
    ${[0,1,2,3,4,5,6].map(i => `<line x1="${30+i*45}" y1="28" x2="${30+i*45}" y2="42" stroke="${COLORS.muted}" stroke-width="1"/><text x="${30+i*45}" y="58" style="font-size:11px" fill="${COLORS.muted}" text-anchor="middle">${i}</text>`).join('')}
    <!-- Open circle at 4 -->
    <circle cx="210" cy="35" r="6" fill="${COLORS.bg}" stroke="${COLORS.red}" stroke-width="2"/>
    <!-- Shade left -->
    <line x1="30" y1="35" x2="204" y2="35" stroke="${COLORS.primary}" stroke-width="4"/>
    <polygon points="30,28 20,35 30,42" fill="${COLORS.primary}"/>
    <text x="120" y="18" class="dim" text-anchor="middle">x < 4</text>
    <!-- Legend -->
    <circle cx="260" cy="80" r="5" fill="${COLORS.bg}" stroke="${COLORS.red}" stroke-width="1.5"/>
    <text x="275" y="84" class="note">open = not included (<, >)</text>
    <circle cx="260" cy="95" r="5" fill="${COLORS.primary}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="275" y="99" class="note">closed = included (≤, ≥)</text>
  `);
}

function trigDiagram(): string {
  return svg(400, 200, `
    <polygon points="30,180 250,180 250,40" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="238" y="168" width="12" height="12" fill="none" stroke="${COLORS.red}" stroke-width="1.5"/>
    <path d="M55,180 A25,25 0 0,0 48,162" fill="none" stroke="${COLORS.accent}" stroke-width="2"/>
    <text x="65" y="170" class="dim">θ</text>
    <text x="140" y="198" class="dim" text-anchor="middle">adjacent</text>
    <text x="265" y="115" class="dim">opposite</text>
    <text x="125" y="100" class="dim" transform="rotate(-32,125,100)">hypotenuse</text>
    <text x="300" y="50" class="formula">SOH CAH TOA</text>
    <text x="300" y="75" class="note">sin θ = opp/hyp</text>
    <text x="300" y="93" class="note">cos θ = adj/hyp</text>
    <text x="300" y="111" class="note">tan θ = opp/adj</text>
    <text x="300" y="140" class="note">sin30°=0.5, cos60°=0.5</text>
    <text x="300" y="158" class="note">tan45°=1</text>
  `);
}

function quadrilateralsDiagram(): string {
  return svg(400, 180, `
    <!-- Square -->
    <rect x="20" y="20" width="60" height="60" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="50" y="100" class="note" text-anchor="middle">Square</text>
    <!-- Rectangle -->
    <rect x="110" y="20" width="80" height="50" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="150" y="100" class="note" text-anchor="middle">Rectangle</text>
    <!-- Parallelogram -->
    <polygon points="230,70 260,20 340,20 310,70" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="285" y="100" class="note" text-anchor="middle">Parallelogram</text>
    <!-- Trapezoid -->
    <polygon points="30,120 70,120 80,160 20,160" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1.5"/>
    <text x="50" y="175" class="note" text-anchor="middle">Trapezium</text>
    <!-- Rhombus -->
    <polygon points="150,115 180,140 150,165 120,140" fill="rgba(167,139,250,0.12)" stroke="${COLORS.purple}" stroke-width="1.5"/>
    <text x="150" y="178" class="note" text-anchor="middle">Rhombus</text>
    <!-- Kite -->
    <polygon points="260,115 285,140 260,175 235,140" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="260" y="185" class="note" text-anchor="middle">Kite</text>
  `);
}

function polygonsDiagram(): string {
  const shapes = [
    { n: 5, label: 'Pentagon', cx: 60, cy: 60 },
    { n: 6, label: 'Hexagon', cx: 170, cy: 60 },
    { n: 8, label: 'Octagon', cx: 280, cy: 60 },
  ];
  let content = '';
  for (const s of shapes) {
    const r = 35;
    const pts = Array.from({ length: s.n }, (_, i) => {
      const a = (i / s.n) * Math.PI * 2 - Math.PI / 2;
      return `${s.cx + r * Math.cos(a)},${s.cy + r * Math.sin(a)}`;
    }).join(' ');
    content += `<polygon points="${pts}" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>`;
    content += `<text x="${s.cx}" y="${s.cy + 55}" class="note" text-anchor="middle">${s.label}</text>`;
  }
  content += `<text x="20" y="150" class="note">Interior angle = (n-2)×180° ÷ n</text>`;
  content += `<text x="20" y="168" class="note">Exterior angle = 360° ÷ n</text>`;
  return svg(380, 180, content);
}

function transformDiagram(): string {
  return svg(380, 180, `
    <!-- Mirror line -->
    <line x1="190" y1="10" x2="190" y2="170" stroke="${COLORS.muted}" stroke-width="1" stroke-dasharray="5,3"/>
    <text x="190" y="180" class="note" text-anchor="middle">mirror line</text>
    <!-- Original -->
    <polygon points="80,40 140,40 140,100 100,100" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="100" y="125" class="note" text-anchor="middle">original</text>
    <!-- Reflection -->
    <polygon points="300,40 240,40 240,100 280,100" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="270" y="125" class="note" text-anchor="middle">reflection</text>
    <!-- Distance markers -->
    <line x1="140" y1="45" x2="190" y2="45" stroke="${COLORS.accent}" stroke-width="1" stroke-dasharray="3,2"/>
    <line x1="190" y1="45" x2="240" y2="45" stroke="${COLORS.accent}" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="165" y="38" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">d</text>
    <text x="215" y="38" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">d</text>
  `);
}

function ratioDiagram(): string {
  return svg(360, 100, `
    <!-- Bar model for ratio 2:3 -->
    <rect x="20" y="20" width="200" height="30" fill="none" stroke="${COLORS.muted}" stroke-width="1"/>
    <rect x="20" y="20" width="80" height="30" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <rect x="100" y="20" width="120" height="30" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="60" y="40" class="dim" text-anchor="middle">2 parts</text>
    <text x="160" y="40" class="dim" text-anchor="middle">3 parts</text>
    <text x="110" y="70" class="note" text-anchor="middle">Ratio 2:3 → total 5 parts</text>
    <text x="250" y="30" class="formula">Ratio 2:3</text>
    <text x="250" y="50" class="note">Share $100:</text>
    <text x="250" y="68" class="note">1 part = $100÷5 = $20</text>
    <text x="250" y="86" class="note">2 parts=$40, 3 parts=$60</text>
  `);
}

function netsDiagram(): string {
  return svg(350, 170, `
    <!-- Cube -->
    <polygon points="20,80 60,60 100,80 60,100" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <polygon points="60,60 100,80 100,40 60,20" fill="rgba(59,130,246,0.08)" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <polygon points="20,80 60,100 60,60 20,40" fill="rgba(59,130,246,0.05)" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="60" y="125" class="note" text-anchor="middle">Cube</text>
    <text x="60" y="140" class="note" text-anchor="middle">V=s³, SA=6s²</text>
    <!-- Cylinder -->
    <ellipse cx="180" cy="40" rx="30" ry="10" fill="none" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <line x1="150" y1="40" x2="150" y2="100" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <line x1="210" y1="40" x2="210" y2="100" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <ellipse cx="180" cy="100" rx="30" ry="10" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="180" y="125" class="note" text-anchor="middle">Cylinder</text>
    <text x="180" y="140" class="note" text-anchor="middle">V=πr²h</text>
    <!-- Cone -->
    <ellipse cx="300" cy="100" rx="25" ry="8" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <line x1="275" y1="100" x2="300" y2="30" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <line x1="325" y1="100" x2="300" y2="30" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="300" y="125" class="note" text-anchor="middle">Cone</text>
    <text x="300" y="140" class="note" text-anchor="middle">V=⅓πr²h</text>
  `);
}

function rotationDiagram(): string {
  return svg(360, 160, `
    <!-- Rotation example -->
    <line x1="180" y1="10" x2="180" y2="150" stroke="${COLORS.muted}" stroke-width="0.5" stroke-dasharray="3,3"/>
    <line x1="20" y1="80" x2="340" y2="80" stroke="${COLORS.muted}" stroke-width="0.5" stroke-dasharray="3,3"/>
    <!-- Centre -->
    <circle cx="180" cy="80" r="3" fill="${COLORS.red}"/>
    <text x="188" y="75" style="font-size:10px" fill="${COLORS.red}">centre</text>
    <!-- Original shape -->
    <polygon points="200,30 240,30 240,60 200,60" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <!-- 90° rotated -->
    <polygon points="200,100 230,100 230,140 200,140" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" opacity="0.7"/>
    <!-- Rotation arrow -->
    <path d="M235,45 A60,60 0 0,1 215,110" fill="none" stroke="${COLORS.accent}" stroke-width="1.5" marker-end="url(#arr)"/>
    <text x="250" y="80" class="dim">90° CW</text>
    <text x="40" y="145" class="note">Rotation rules about origin:</text>
    <text x="40" y="160" class="note">90° CW: (x,y)→(y,−x)  180°: (x,y)→(−x,−y)</text>
    <defs><marker id="arr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.accent}"/></marker></defs>
  `);
}

// ===================================================================
// MATH: Numbers & Operations
// ===================================================================

function typesOfNumbersDiagram(): string {
  return svg(420, 200, `
    <!-- Number line -->
    <line x1="20" y1="60" x2="400" y2="60" stroke="${COLORS.muted}" stroke-width="1.5"/>
    ${[-3,-2,-1,0,1,2,3].map((n, i) => `<line x1="${60+i*48}" y1="53" x2="${60+i*48}" y2="67" stroke="${COLORS.muted}" stroke-width="1"/><text x="${60+i*48}" y="82" style="font-size:11px" fill="${COLORS.muted}" text-anchor="middle">${n}</text>`).join('')}
    <!-- Markers -->
    <circle cx="60" cy="60" r="4" fill="${COLORS.primary}"/>
    <circle cx="108" cy="60" r="4" fill="${COLORS.primary}"/>
    <circle cx="156" cy="60" r="4" fill="${COLORS.primary}"/>
    <circle cx="204" cy="60" r="4" fill="${COLORS.secondary}"/>
    <circle cx="252" cy="60" r="4" fill="${COLORS.primary}"/>
    <circle cx="300" cy="60" r="4" fill="${COLORS.primary}"/>
    <circle cx="348" cy="60" r="4" fill="${COLORS.primary}"/>
    <!-- Fractions -->
    <circle cx="228" cy="60" r="3" fill="${COLORS.accent}"/>
    <text x="228" y="48" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">0.5</text>
    <circle cx="320" cy="60" r="3" fill="${COLORS.accent}"/>
    <text x="320" y="48" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">1.5</text>
    <!-- Irrational -->
    <circle cx="275" cy="60" r="3" fill="${COLORS.red}"/>
    <text x="275" y="48" style="font-size:9px" fill="${COLORS.red}" text-anchor="middle">√2</text>
    <!-- Categories -->
    <rect x="20" y="100" width="110" height="22" rx="4" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1"/>
    <text x="75" y="115" class="note" text-anchor="middle" fill="${COLORS.primary}">Integers: ...-2,-1,0,1,2...</text>
    <rect x="145" y="100" width="120" height="22" rx="4" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1"/>
    <text x="205" y="115" class="note" text-anchor="middle" fill="${COLORS.accent}">Rationals: p/q (q≠0)</text>
    <rect x="280" y="100" width="120" height="22" rx="4" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1"/>
    <text x="340" y="115" class="note" text-anchor="middle" fill="${COLORS.red}">Irrationals: √2, π</text>
    <text x="20" y="150" class="formula">Natural ⊂ Whole ⊂ Integer ⊂ Rational ⊂ Real</text>
    <text x="20" y="170" class="note">Natural: 1,2,3... | Whole: 0,1,2... | Prime: 2,3,5,7,11...</text>
  `);
}

function factorTreeDiagram(): string {
  return svg(400, 240, `
    <!-- Factor tree for 60 -->
    <text x="180" y="25" class="formula" text-anchor="middle">60</text>
    <line x1="170" y1="30" x2="120" y2="55" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="190" y1="30" x2="240" y2="55" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <text x="120" y="70" class="dim" text-anchor="middle">6</text>
    <text x="240" y="70" class="dim" text-anchor="middle">10</text>
    <line x1="110" y1="75" x2="70" y2="100" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="130" y1="75" x2="170" y2="100" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="230" y1="75" x2="200" y2="100" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="250" y1="75" x2="290" y2="100" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <circle cx="70" cy="112" r="14" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="70" y="117" class="dim" text-anchor="middle" fill="${COLORS.secondary}">2</text>
    <circle cx="170" cy="112" r="14" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="170" y="117" class="dim" text-anchor="middle" fill="${COLORS.secondary}">3</text>
    <circle cx="200" cy="112" r="14" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="200" y="117" class="dim" text-anchor="middle" fill="${COLORS.secondary}">2</text>
    <circle cx="290" cy="112" r="14" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="290" y="117" class="dim" text-anchor="middle" fill="${COLORS.secondary}">5</text>
    <text x="180" y="155" class="formula" text-anchor="middle">60 = 2² × 3 × 5</text>
    <text x="20" y="185" class="note">HCF = product of common prime factors</text>
    <text x="20" y="200" class="note">LCM = product of all prime factors (highest power)</text>
    <text x="20" y="220" class="note">Divisibility: by 2 (even), by 3 (digit sum÷3), by 5 (ends 0/5)</text>
  `);
}

function integerOperationsDiagram(): string {
  return svg(420, 180, `
    <!-- Number line -->
    <line x1="30" y1="70" x2="390" y2="70" stroke="${COLORS.muted}" stroke-width="1.5"/>
    ${[-5,-4,-3,-2,-1,0,1,2,3,4,5].map((n, i) => `<line x1="${35+i*33}" y1="63" x2="${35+i*33}" y2="77" stroke="${COLORS.muted}" stroke-width="1"/><text x="${35+i*33}" y="92" style="font-size:10px" fill="${COLORS.muted}" text-anchor="middle">${n}</text>`).join('')}
    <!-- -3 + 5 = 2 arrow -->
    <circle cx="${35+2*33}" cy="70" r="4" fill="${COLORS.red}"/>
    <text x="${35+2*33}" y="55" style="font-size:10px" fill="${COLORS.red}" text-anchor="middle">start: -3</text>
    <path d="M${35+2*33},58 Q${35+4.5*33},25 ${35+7*33},58" fill="none" stroke="${COLORS.secondary}" stroke-width="2" marker-end="url(#iarr)"/>
    <text x="${35+4.5*33}" y="25" style="font-size:11px" fill="${COLORS.secondary}" text-anchor="middle">+5</text>
    <circle cx="${35+7*33}" cy="70" r="4" fill="${COLORS.primary}"/>
    <text x="${35+7*33}" y="55" style="font-size:10px" fill="${COLORS.primary}" text-anchor="middle">= 2</text>
    <!-- Rules -->
    <text x="20" y="120" class="formula">-3 + 5 = 2</text>
    <text x="20" y="145" class="note">Same signs → add, keep sign: (-3)+(-2) = -5</text>
    <text x="20" y="160" class="note">Different signs → subtract, keep larger sign: (-3)+(5) = +2</text>
    <text x="20" y="175" class="note">(-) × (-) = (+)  |  (-) × (+) = (-)</text>
    <defs><marker id="iarr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.secondary}"/></marker></defs>
  `);
}

function decimalsDiagram(): string {
  return svg(420, 200, `
    <!-- Place value chart -->
    ${['Tens','Units','.','Tenths','Hundredths','Thousandths'].map((label, i) => {
      const x = 20 + i * 65;
      const w = i === 2 ? 15 : 60;
      if (i === 2) return `<text x="${x+7}" y="55" style="font-size:20px;font-weight:bold" fill="${COLORS.red}" text-anchor="middle">.</text>`;
      const adj = i > 2 ? i - 1 : i;
      return `<rect x="${x}" y="20" width="${w}" height="50" fill="${i < 2 ? COLORS.fill : COLORS.fillGreen}" stroke="${i < 2 ? COLORS.primary : COLORS.secondary}" stroke-width="1.5" rx="3"/>
      <text x="${x+w/2}" y="42" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">${label}</text>
      <text x="${x+w/2}" y="62" class="dim" text-anchor="middle">${'3.256'[adj] || ''}</text>`;
    }).join('')}
    <text x="20" y="100" class="formula">3.256</text>
    <text x="20" y="125" class="note">3 = 3 ones | 2 = 2 tenths (0.2) | 5 = 5 hundredths (0.05)</text>
    <text x="20" y="145" class="note">6 = 6 thousandths (0.006)</text>
    <text x="20" y="175" class="note">Multiply by 10: move decimal point 1 right</text>
    <text x="20" y="190" class="note">Divide by 10: move decimal point 1 left</text>
  `);
}

function percentagesDiagram(): string {
  return svg(420, 200, `
    <!-- Bar model: 30% of 200 -->
    <rect x="20" y="30" width="300" height="40" fill="none" stroke="${COLORS.muted}" stroke-width="1.5" rx="4"/>
    <rect x="20" y="30" width="90" height="40" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="4"/>
    <text x="65" y="55" class="dim" text-anchor="middle">30%</text>
    <text x="200" y="55" class="note" text-anchor="middle">70%</text>
    <text x="340" y="42" class="dim">200</text>
    <text x="340" y="58" class="note">total</text>
    <!-- Arrow to answer -->
    <text x="65" y="90" class="formula" text-anchor="middle">= 60</text>
    <!-- Formulas -->
    <text x="20" y="120" class="formula">30% of 200 = 30/100 × 200 = 60</text>
    <text x="20" y="150" class="note">Percentage = (part/whole) × 100</text>
    <text x="20" y="168" class="note">Increase: new = original × (1 + r/100)</text>
    <text x="20" y="186" class="note">Decrease: new = original × (1 - r/100)</text>
  `);
}

function proportionDiagram(): string {
  return svg(420, 240, `
    <!-- Direct proportion graph -->
    <text x="100" y="20" class="dim" text-anchor="middle">Direct</text>
    <line x1="30" y1="200" x2="200" y2="200" stroke="${COLORS.muted}" stroke-width="1"/>
    <line x1="30" y1="200" x2="30" y2="30" stroke="${COLORS.muted}" stroke-width="1"/>
    <line x1="30" y1="200" x2="180" y2="50" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="115" y="218" class="note" text-anchor="middle">x</text>
    <text x="18" y="115" class="note" text-anchor="middle" transform="rotate(-90,18,115)">y</text>
    <text x="150" y="80" class="dim" fill="${COLORS.primary}">y = kx</text>
    <!-- Inverse proportion graph -->
    <text x="330" y="20" class="dim" text-anchor="middle">Inverse</text>
    <line x1="240" y1="200" x2="410" y2="200" stroke="${COLORS.muted}" stroke-width="1"/>
    <line x1="240" y1="200" x2="240" y2="30" stroke="${COLORS.muted}" stroke-width="1"/>
    <path d="M260,50 Q300,100 410,185" fill="none" stroke="${COLORS.red}" stroke-width="2"/>
    <text x="330" y="218" class="note" text-anchor="middle">x</text>
    <text x="228" y="115" class="note" text-anchor="middle" transform="rotate(-90,228,115)">y</text>
    <text x="340" y="80" class="dim" fill="${COLORS.red}">y = k/x</text>
    <!-- Rules -->
    <text x="20" y="240" class="note">Direct: y∝x → as x doubles, y doubles | Inverse: y∝1/x → as x doubles, y halves</text>
  `);
}

function indexLawsDiagram(): string {
  return svg(420, 220, `
    <!-- Visual: 2^3 = 8 as cubes -->
    ${[0,1,2].map(i => `<rect x="${30+i*40}" y="30" width="30" height="30" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="3"/><text x="${45+i*40}" y="50" style="font-size:12px" fill="${COLORS.primary}" text-anchor="middle">2</text>`).join('')}
    <text x="170" y="50" class="formula">= 2 × 2 × 2 = 8</text>
    <text x="60" y="80" class="dim" text-anchor="middle">2³ means "2 multiplied 3 times"</text>
    <!-- Laws -->
    <text x="20" y="110" class="formula">Index Laws:</text>
    <text x="20" y="132" class="note">aᵐ × aⁿ = aᵐ⁺ⁿ</text>
    <text x="220" y="132" class="note">aᵐ ÷ aⁿ = aᵐ⁻ⁿ</text>
    <text x="20" y="152" class="note">(aᵐ)ⁿ = aᵐⁿ</text>
    <text x="220" y="152" class="note">a⁰ = 1</text>
    <text x="20" y="172" class="note">a⁻ⁿ = 1/aⁿ</text>
    <text x="220" y="172" class="note">a^(1/n) = ⁿ√a</text>
    <text x="20" y="200" class="note">Example: 2³ × 2⁴ = 2⁷ = 128 | (3²)³ = 3⁶ = 729</text>
  `);
}

function surdsDiagram(): string {
  return svg(400, 200, `
    <!-- Square with area 5 -->
    <rect x="30" y="30" width="100" height="100" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="2"/>
    <text x="80" y="85" class="formula" text-anchor="middle">Area = 5</text>
    <text x="80" y="150" class="dim" text-anchor="middle">side = √5</text>
    <text x="5" y="85" class="dim" text-anchor="middle" transform="rotate(-90,5,85)">√5</text>
    <!-- Rules -->
    <text x="170" y="40" class="formula">Surd Rules</text>
    <text x="170" y="65" class="note">√a × √b = √(ab)</text>
    <text x="170" y="83" class="note">√a ÷ √b = √(a/b)</text>
    <text x="170" y="101" class="note">a√n + b√n = (a+b)√n</text>
    <text x="170" y="125" class="note">Simplify: √12 = √(4×3) = 2√3</text>
    <text x="170" y="148" class="note">Rationalise: 1/√a = √a/a</text>
    <text x="170" y="175" class="note">√2 ≈ 1.414 | √3 ≈ 1.732 | √5 ≈ 2.236</text>
  `);
}

function scientificNotationDiagram(): string {
  return svg(420, 200, `
    <!-- Scale bar -->
    <line x1="30" y1="60" x2="400" y2="60" stroke="${COLORS.muted}" stroke-width="1.5"/>
    ${[0,1,2,3,4,5,6].map(i => `<line x1="${30+i*60}" y1="50" x2="${30+i*60}" y2="70" stroke="${COLORS.muted}" stroke-width="1.5"/><text x="${30+i*60}" y="90" style="font-size:11px" fill="${COLORS.muted}" text-anchor="middle">10${i === 0 ? '⁰' : i === 1 ? '¹' : i === 2 ? '²' : i === 3 ? '³' : i === 4 ? '⁴' : i === 5 ? '⁵' : '⁶'}</text><text x="${30+i*60}" y="105" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">${Math.pow(10,i).toLocaleString()}</text>`).join('')}
    <!-- Example point -->
    <circle cx="${30+3.5*60}" cy="60" r="5" fill="${COLORS.red}"/>
    <text x="${30+3.5*60}" y="45" class="dim" text-anchor="middle" fill="${COLORS.red}">3,500</text>
    <!-- Rules -->
    <text x="20" y="135" class="formula">a × 10ⁿ where 1 ≤ a &lt; 10</text>
    <text x="20" y="160" class="note">3,500 = 3.5 × 10³ (move decimal 3 left)</text>
    <text x="20" y="178" class="note">0.0042 = 4.2 × 10⁻³ (move decimal 3 right)</text>
    <text x="20" y="196" class="note">Large → positive power | Small → negative power</text>
  `);
}

function logarithmsDiagram(): string {
  return svg(420, 220, `
    <!-- Axes -->
    <line x1="40" y1="180" x2="400" y2="180" stroke="${COLORS.muted}" stroke-width="1"/>
    <line x1="40" y1="180" x2="40" y2="20" stroke="${COLORS.muted}" stroke-width="1"/>
    <text x="400" y="195" class="note">x</text>
    <text x="25" y="20" class="note">y</text>
    <!-- Exponential curve y = 2^x -->
    <path d="M40,170 Q100,165 160,140 Q220,100 280,50 Q320,25 360,15" fill="none" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="340" y="35" style="font-size:11px" fill="${COLORS.primary}">y = 2ˣ</text>
    <!-- Log curve y = log2(x) -->
    <path d="M50,180 Q60,160 90,130 Q130,90 180,70 Q240,50 360,30" fill="none" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="350" y="55" style="font-size:11px" fill="${COLORS.secondary}">y = log₂x</text>
    <!-- Mirror line y=x -->
    <line x1="40" y1="180" x2="220" y2="0" stroke="${COLORS.muted}" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="190" y="30" class="note">y = x</text>
    <!-- Rules -->
    <text x="40" y="210" class="formula">log_b(x) = y means bʸ = x</text>
    <text x="280" y="210" class="note">log rules: log(ab) = log a + log b</text>
  `);
}

// ===================================================================
// MATH: Algebra
// ===================================================================

function algebraicExpressionsDiagram(): string {
  return svg(420, 200, `
    <!-- Expanding brackets visual -->
    <text x="20" y="30" class="formula">Expanding: 3(x + 4)</text>
    <!-- Bracket -->
    <rect x="30" y="45" width="140" height="50" fill="none" stroke="${COLORS.primary}" stroke-width="2" rx="6"/>
    <text x="50" y="75" class="dim">x</text>
    <text x="95" y="75" class="dim">+</text>
    <text x="130" y="75" class="dim">4</text>
    <!-- Arrows showing multiplication -->
    <text x="15" y="75" class="formula">3</text>
    <line x1="25" y1="68" x2="48" y2="68" stroke="${COLORS.accent}" stroke-width="1.5" marker-end="url(#earr)"/>
    <line x1="25" y1="78" x2="120" y2="78" stroke="${COLORS.accent}" stroke-width="1.5" marker-end="url(#earr)"/>
    <!-- Result -->
    <text x="200" y="75" class="formula">= 3x + 12</text>
    <!-- Factorising -->
    <text x="20" y="120" class="formula">Factorising: 6x + 9 = 3(2x + 3)</text>
    <text x="20" y="150" class="note">Find the HCF: HCF of 6x and 9 is 3</text>
    <text x="20" y="170" class="note">Collecting like terms: 3x + 2y + 5x = 8x + 2y</text>
    <text x="20" y="190" class="note">Substitution: if x=4, then 3x+1 = 3(4)+1 = 13</text>
    <defs><marker id="earr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.accent}"/></marker></defs>
  `);
}

function linearEquationsDiagram(): string {
  return svg(420, 220, `
    <!-- Balance scale -->
    <!-- Fulcrum -->
    <polygon points="200,180 185,200 215,200" fill="${COLORS.muted}" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <!-- Beam -->
    <line x1="80" y1="180" x2="320" y2="180" stroke="${COLORS.text}" stroke-width="3"/>
    <!-- Left pan -->
    <rect x="80" y="145" width="90" height="30" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="4"/>
    <text x="125" y="165" class="dim" text-anchor="middle">x + 3</text>
    <!-- Right pan -->
    <rect x="240" y="145" width="80" height="30" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="4"/>
    <text x="280" y="165" class="dim" text-anchor="middle">7</text>
    <!-- Solution steps -->
    <text x="20" y="30" class="formula">Solve: x + 3 = 7</text>
    <text x="20" y="55" class="note">Step 1: x + 3 - 3 = 7 - 3</text>
    <text x="20" y="73" class="note">Step 2: x = 4</text>
    <text x="250" y="30" class="formula">Golden rule:</text>
    <text x="250" y="50" class="note">Whatever you do to</text>
    <text x="250" y="65" class="note">one side, do to the other</text>
    <text x="20" y="100" class="note">Inverse operations: + ↔ − and × ↔ ÷</text>
  `);
}

function simultaneousEquationsDiagram(): string {
  // Coordinate system: x: -1 to 6, y: -1 to 6
  // Origin at pixel (60, 190), scale 30px per unit
  const ox = 60, oy = 190, s = 30;
  const px = (x: number) => ox + x * s;
  const py = (y: number) => oy - y * s;
  // y = x + 1: at x=-1 y=0, at x=4 y=5
  // y = -x + 5: at x=0 y=5, at x=5 y=0
  // Intersection: x+1 = -x+5 → 2x=4 → x=2, y=3
  return svg(420, 240, `
    <!-- Grid -->
    ${[0,1,2,3,4,5].map(i => `<line x1="${px(i)}" y1="${py(0)+5}" x2="${px(i)}" y2="${py(5)}" stroke="${COLORS.muted}" stroke-width="0.3"/>`).join('')}
    ${[0,1,2,3,4,5].map(i => `<line x1="${px(0)-5}" y1="${py(i)}" x2="${px(5)}" y2="${py(i)}" stroke="${COLORS.muted}" stroke-width="0.3"/>`).join('')}
    <!-- Axes -->
    <line x1="${px(-1)}" y1="${py(0)}" x2="${px(6)}" y2="${py(0)}" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="${px(0)}" y1="${py(-0.5)}" x2="${px(0)}" y2="${py(5.5)}" stroke="${COLORS.muted}" stroke-width="1.5"/>
    ${[1,2,3,4,5].map(i => `<text x="${px(i)}" y="${py(0)+16}" style="font-size:10px" fill="${COLORS.muted}" text-anchor="middle">${i}</text>`).join('')}
    ${[1,2,3,4,5].map(i => `<text x="${px(0)-10}" y="${py(i)+4}" style="font-size:10px" fill="${COLORS.muted}" text-anchor="end">${i}</text>`).join('')}
    <!-- Line 1: y = x + 1 (through (0,1) and (4,5)) -->
    <line x1="${px(-1)}" y1="${py(0)}" x2="${px(4.5)}" y2="${py(5.5)}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="${px(4)}" y="${py(5.2)}" style="font-size:11px" fill="${COLORS.primary}">y = x + 1</text>
    <!-- Line 2: y = -x + 5 (through (0,5) and (5,0)) -->
    <line x1="${px(-0.5)}" y1="${py(5.5)}" x2="${px(5.5)}" y2="${py(-0.5)}" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="${px(4.5)}" y="${py(0.8)}" style="font-size:11px" fill="${COLORS.secondary}">y = -x + 5</text>
    <!-- Intersection at (2, 3) -->
    <circle cx="${px(2)}" cy="${py(3)}" r="6" fill="${COLORS.red}" stroke="${COLORS.bg}" stroke-width="2"/>
    <text x="${px(2)+10}" y="${py(3)-5}" class="dim" fill="${COLORS.red}">(2, 3)</text>
    <!-- Dashed lines to axes -->
    <line x1="${px(2)}" y1="${py(3)}" x2="${px(2)}" y2="${py(0)}" stroke="${COLORS.red}" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="${px(2)}" y1="${py(3)}" x2="${px(0)}" y2="${py(3)}" stroke="${COLORS.red}" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="270" y="50" class="formula">Solution: (2, 3)</text>
    <text x="270" y="70" class="note">Both lines pass through</text>
    <text x="270" y="85" class="note">the intersection point</text>
  `);
}

function quadraticDiagram(): string {
  // y = x² - 4: roots at x=-2 and x=2, vertex at (0, -4)
  // Coordinate system: x: -3 to 3, y: -5 to 5
  // Origin at pixel (200, 120), scale 30px per unit
  const ox = 200, oy = 120, s = 30;
  const px = (x: number) => ox + x * s;
  const py = (y: number) => oy - y * s;
  // Plot actual parabola points
  const points: string[] = [];
  for (let xi = -2.8; xi <= 2.8; xi += 0.2) {
    const yi = xi * xi - 4;
    if (yi > 5.5) continue;
    points.push(`${px(xi).toFixed(1)},${py(yi).toFixed(1)}`);
  }
  return svg(420, 260, `
    <!-- Grid -->
    ${[-2,-1,0,1,2].map(i => `<line x1="${px(i)}" y1="${py(-5)}" x2="${px(i)}" y2="${py(5)}" stroke="${COLORS.muted}" stroke-width="0.3"/>`).join('')}
    ${[-4,-3,-2,-1,0,1,2,3,4,5].map(i => `<line x1="${px(-3)}" y1="${py(i)}" x2="${px(3)}" y2="${py(i)}" stroke="${COLORS.muted}" stroke-width="0.3"/>`).join('')}
    <!-- Axes -->
    <line x1="${px(-3)}" y1="${py(0)}" x2="${px(3.2)}" y2="${py(0)}" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="${px(0)}" y1="${py(-5)}" x2="${px(0)}" y2="${py(5.5)}" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <text x="${px(3.2)+5}" y="${py(0)+4}" class="note">x</text>
    <text x="${px(0)+5}" y="${py(5.5)}" class="note">y</text>
    ${[-2,-1,1,2].map(i => `<text x="${px(i)}" y="${py(0)+14}" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">${i}</text>`).join('')}
    ${[-4,-3,-2,-1,1,2,3,4,5].map(i => `<text x="${px(0)-8}" y="${py(i)+3}" style="font-size:9px" fill="${COLORS.muted}" text-anchor="end">${i}</text>`).join('')}
    <!-- Parabola (plotted points) -->
    <polyline points="${points.join(' ')}" fill="none" stroke="${COLORS.primary}" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Roots at (-2, 0) and (2, 0) -->
    <circle cx="${px(-2)}" cy="${py(0)}" r="5" fill="${COLORS.red}"/>
    <text x="${px(-2)}" y="${py(0)+18}" class="dim" text-anchor="middle" fill="${COLORS.red}">x = -2</text>
    <circle cx="${px(2)}" cy="${py(0)}" r="5" fill="${COLORS.red}"/>
    <text x="${px(2)}" y="${py(0)+18}" class="dim" text-anchor="middle" fill="${COLORS.red}">x = 2</text>
    <!-- Vertex at (0, -4) — BELOW x-axis -->
    <circle cx="${px(0)}" cy="${py(-4)}" r="5" fill="${COLORS.secondary}"/>
    <text x="${px(0)+10}" y="${py(-4)+4}" class="dim" fill="${COLORS.secondary}">vertex (0, -4)</text>
    <!-- Axis of symmetry -->
    <line x1="${px(0)}" y1="${py(5)}" x2="${px(0)}" y2="${py(-4)}" stroke="${COLORS.accent}" stroke-width="1" stroke-dasharray="4,2"/>
    <text x="${px(0)+5}" y="${py(5)+4}" style="font-size:9px" fill="${COLORS.accent}">axis of symmetry</text>
    <!-- Label -->
    <text x="${px(2.5)}" y="${py(2.5)}" style="font-size:11px" fill="${COLORS.primary}">y = x² − 4</text>
    <text x="20" y="255" class="note">Roots: where y = 0 | Vertex: lowest point | Formula: x = -b/2a</text>
  `);
}

function nonLinearGraphsDiagram(): string {
  return svg(420, 240, `
    <!-- Axes -->
    <line x1="30" y1="200" x2="400" y2="200" stroke="${COLORS.muted}" stroke-width="1"/>
    <line x1="210" y1="10" x2="210" y2="220" stroke="${COLORS.muted}" stroke-width="1"/>
    <!-- Parabola -->
    <path d="M110,200 Q160,80 210,50 Q260,80 310,200" fill="none" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="310" y="190" style="font-size:10px" fill="${COLORS.primary}">y=x²</text>
    <!-- Hyperbola -->
    <path d="M230,30 Q260,80 300,120 Q340,160 400,180" fill="none" stroke="${COLORS.red}" stroke-width="2"/>
    <path d="M30,180 Q80,170 120,140 Q160,100 190,30" fill="none" stroke="${COLORS.red}" stroke-width="2"/>
    <text x="370" y="165" style="font-size:10px" fill="${COLORS.red}">y=1/x</text>
    <!-- Exponential -->
    <path d="M30,195 Q100,190 150,170 Q200,140 250,80 Q280,40 310,20" fill="none" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="300" y="30" style="font-size:10px" fill="${COLORS.secondary}">y=2ˣ</text>
    <!-- Labels -->
    <text x="20" y="235" class="note">Quadratic: U-shape | Reciprocal: two curves | Exponential: rapid growth</text>
  `);
}

function algebraicFractionsDiagram(): string {
  return svg(420, 180, `
    <!-- Fraction bar model with variables -->
    <rect x="20" y="20" width="180" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="4"/>
    <line x1="20" y1="45" x2="200" y2="45" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="110" y="40" class="formula" text-anchor="middle">x + 3</text>
    <text x="110" y="62" class="formula" text-anchor="middle">x - 1</text>
    <!-- Simplification example -->
    <text x="230" y="35" class="dim">Simplify:</text>
    <text x="230" y="55" class="formula">2x/4x = 1/2</text>
    <!-- Rules -->
    <text x="20" y="100" class="formula">Adding: a/c + b/c = (a+b)/c</text>
    <text x="20" y="125" class="note">Different denominators: find common denominator</text>
    <text x="20" y="145" class="note">Multiplying: (a/b) × (c/d) = ac/bd</text>
    <text x="20" y="165" class="note">Dividing: (a/b) ÷ (c/d) = (a/b) × (d/c)</text>
  `);
}

function polynomialsDiagram(): string {
  return svg(420, 220, `
    <!-- Axes -->
    <line x1="30" y1="180" x2="400" y2="180" stroke="${COLORS.muted}" stroke-width="1"/>
    <line x1="210" y1="10" x2="210" y2="200" stroke="${COLORS.muted}" stroke-width="1"/>
    <!-- Cubic curve y = x^3 -->
    <path d="M60,200 Q100,200 140,190 Q180,170 210,110 Q240,50 280,30 Q320,10 360,10" fill="none" stroke="${COLORS.purple}" stroke-width="2.5"/>
    <text x="350" y="30" style="font-size:11px" fill="${COLORS.purple}">y = x³</text>
    <!-- Key features -->
    <circle cx="210" cy="110" r="4" fill="${COLORS.red}"/>
    <text x="220" y="105" class="note" fill="${COLORS.red}">inflection</text>
    <!-- Info -->
    <text x="20" y="215" class="note">Cubic: y=ax³+bx²+cx+d | up to 3 roots, 2 turning points</text>
  `);
}

// ===================================================================
// MATH: Sequences
// ===================================================================

function arithmeticSequenceDiagram(): string {
  return svg(420, 180, `
    <!-- Dots showing pattern with common difference -->
    ${[0,1,2,3,4].map(i => {
      const x = 40 + i * 80;
      const val = 3 + i * 4;
      return `<circle cx="${x}" cy="50" r="16" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/><text x="${x}" y="55" class="dim" text-anchor="middle">${val}</text>${i < 4 ? `<text x="${x+40}" y="35" style="font-size:11px" fill="${COLORS.accent}" text-anchor="middle">+4</text><line x1="${x+18}" y1="45" x2="${x+62}" y2="45" stroke="${COLORS.accent}" stroke-width="1" stroke-dasharray="3,2"/>` : ''}`;
    }).join('')}
    <!-- Formula -->
    <text x="20" y="100" class="formula">aₙ = a₁ + (n-1)d</text>
    <text x="20" y="125" class="note">a₁ = first term = 3 | d = common difference = 4</text>
    <text x="20" y="145" class="note">Sum: Sₙ = n/2 × (2a₁ + (n-1)d) = n/2 × (first + last)</text>
    <text x="20" y="165" class="note">Example: 3, 7, 11, 15, 19, ... → a₅ = 3 + 4×4 = 19</text>
  `);
}

function geometricSequenceDiagram(): string {
  return svg(420, 180, `
    <!-- Doubling pattern -->
    ${[0,1,2,3,4].map(i => {
      const x = 30 + i * 80;
      const val = Math.pow(2, i);
      const size = 10 + i * 4;
      return `<rect x="${x-size/2}" y="${50-size/2}" width="${size}" height="${size}" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="2"/><text x="${x}" y="70" class="dim" text-anchor="middle">${val}</text>${i < 4 ? `<text x="${x+40}" y="35" style="font-size:11px" fill="${COLORS.accent}" text-anchor="middle">×2</text>` : ''}`;
    }).join('')}
    <!-- Formula -->
    <text x="20" y="100" class="formula">aₙ = a₁ × r⁽ⁿ⁻¹⁾</text>
    <text x="20" y="125" class="note">a₁ = first term = 1 | r = common ratio = 2</text>
    <text x="20" y="145" class="note">Sum: Sₙ = a₁(rⁿ-1)/(r-1) when r≠1</text>
    <text x="20" y="165" class="note">Example: 1, 2, 4, 8, 16, ... → a₅ = 1 × 2⁴ = 16</text>
  `);
}

function otherSequencesDiagram(): string {
  return svg(420, 200, `
    <!-- Fibonacci-like pattern -->
    <text x="20" y="25" class="formula">Fibonacci: each term = sum of two before</text>
    ${[1,1,2,3,5,8,13].map((v, i) => `<circle cx="${30+i*52}" cy="60" r="18" fill="${i < 2 ? COLORS.fillGreen : COLORS.fill}" stroke="${i < 2 ? COLORS.secondary : COLORS.primary}" stroke-width="1.5"/><text x="${30+i*52}" y="65" class="dim" text-anchor="middle">${v}</text>`).join('')}
    ${[0,1,2,3,4].map(i => `<path d="M${30+i*52+12},48 Q${56+i*52},30 ${82+i*52-12},48" fill="none" stroke="${COLORS.accent}" stroke-width="1" stroke-dasharray="2,2"/><text x="${56+i*52}" y="28" style="font-size:8px" fill="${COLORS.accent}" text-anchor="middle">+</text>`).join('')}
    <!-- Square numbers -->
    <text x="20" y="110" class="note">Square numbers: 1, 4, 9, 16, 25, ... (n²)</text>
    <text x="20" y="130" class="note">Cube numbers: 1, 8, 27, 64, 125, ... (n³)</text>
    <text x="20" y="150" class="note">Triangular numbers: 1, 3, 6, 10, 15, ... (n(n+1)/2)</text>
    <text x="20" y="175" class="formula">To find the rule: look at differences!</text>
    <text x="20" y="195" class="note">Constant 1st diff → linear | Constant 2nd diff → quadratic</text>
  `);
}

// ===================================================================
// MATH: Geometry Extra
// ===================================================================

function scaleDrawingsDiagram(): string {
  return svg(420, 200, `
    <!-- Small triangle -->
    <polygon points="30,160 100,160 65,100" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="65" y="180" class="note" text-anchor="middle">Original</text>
    <text x="65" y="130" class="dim" text-anchor="middle">3cm</text>
    <text x="40" y="165" style="font-size:10px" fill="${COLORS.muted}">4cm</text>
    <!-- Arrow -->
    <text x="135" y="130" class="formula">×2</text>
    <line x1="120" y1="130" x2="165" y2="130" stroke="${COLORS.accent}" stroke-width="2" marker-end="url(#sarr)"/>
    <!-- Big triangle -->
    <polygon points="180,160 320,160 250,40" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="250" y="180" class="note" text-anchor="middle">Enlarged</text>
    <text x="250" y="100" class="dim" text-anchor="middle">6cm</text>
    <text x="200" y="168" style="font-size:10px" fill="${COLORS.muted}">8cm</text>
    <!-- Scale factor -->
    <text x="340" y="60" class="formula">Scale factor = 2</text>
    <text x="340" y="80" class="note">New = Original × SF</text>
    <text x="340" y="100" class="note">Lengths × SF</text>
    <text x="340" y="118" class="note">Areas × SF²</text>
    <text x="340" y="136" class="note">Volumes × SF³</text>
    <defs><marker id="sarr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.accent}"/></marker></defs>
  `);
}

function similarityCongruenceDiagram(): string {
  return svg(420, 200, `
    <!-- Two similar triangles -->
    <polygon points="30,160 110,160 70,90" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="70" y="180" class="note" text-anchor="middle">A</text>
    <text x="55" y="165" style="font-size:10px" fill="${COLORS.accent}">4</text>
    <text x="45" y="125" style="font-size:10px" fill="${COLORS.accent}">5</text>
    <text x="95" y="130" style="font-size:10px" fill="${COLORS.accent}">3</text>
    <!-- Larger similar triangle -->
    <polygon points="170,160 310,160 240,50" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="240" y="180" class="note" text-anchor="middle">B</text>
    <text x="220" y="168" style="font-size:10px" fill="${COLORS.accent}">8</text>
    <text x="195" y="105" style="font-size:10px" fill="${COLORS.accent}">10</text>
    <text x="285" y="110" style="font-size:10px" fill="${COLORS.accent}">6</text>
    <!-- Info -->
    <text x="330" y="50" class="formula">Similar:</text>
    <text x="330" y="70" class="note">Same shape,</text>
    <text x="330" y="85" class="note">different size</text>
    <text x="330" y="105" class="note">Ratios equal:</text>
    <text x="330" y="120" class="note">4/8 = 3/6 = 5/10</text>
    <text x="330" y="145" class="formula">Congruent:</text>
    <text x="330" y="163" class="note">Same shape</text>
    <text x="330" y="178" class="note">AND same size</text>
  `);
}

function estimationDiagram(): string {
  return svg(420, 180, `
    <!-- Rounded vs exact -->
    <text x="20" y="25" class="formula">Estimation: round then calculate</text>
    <!-- Example -->
    <rect x="20" y="40" width="180" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/>
    <text x="110" y="60" class="dim" text-anchor="middle">Exact: 4.87 × 21.3</text>
    <text x="110" y="78" class="dim" text-anchor="middle">= 103.731</text>
    <text x="230" y="55" class="formula">≈</text>
    <rect x="255" y="40" width="150" height="50" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="6"/>
    <text x="330" y="60" class="dim" text-anchor="middle">Estimated: 5 × 20</text>
    <text x="330" y="78" class="dim" text-anchor="middle" fill="${COLORS.secondary}">= 100</text>
    <!-- Rules -->
    <text x="20" y="115" class="note">Round to 1 significant figure for quick estimates</text>
    <text x="20" y="135" class="note">Significant figures: 3.04 → 3 sf | 0.00520 → 3 sf</text>
    <text x="20" y="155" class="note">Decimal places: 3.142 → 3 dp</text>
    <text x="20" y="175" class="note">Check: is your answer reasonable? Use estimation to verify</text>
  `);
}

function parallelLinesDiagram(): string {
  return svg(420, 220, `
    <!-- Two parallel lines -->
    <line x1="30" y1="70" x2="340" y2="70" stroke="${COLORS.primary}" stroke-width="2"/>
    <line x1="30" y1="160" x2="340" y2="160" stroke="${COLORS.primary}" stroke-width="2"/>
    <!-- Parallel markers -->
    <text x="175" y="62" style="font-size:14px" fill="${COLORS.primary}" text-anchor="middle">▸▸</text>
    <text x="175" y="152" style="font-size:14px" fill="${COLORS.primary}" text-anchor="middle">▸▸</text>
    <!-- Transversal -->
    <line x1="100" y1="20" x2="250" y2="210" stroke="${COLORS.red}" stroke-width="2"/>
    <!-- Angle labels -->
    <text x="155" y="65" class="dim" fill="${COLORS.accent}">a</text>
    <text x="140" y="82" class="dim" fill="${COLORS.secondary}">b</text>
    <text x="195" y="155" class="dim" fill="${COLORS.accent}">a</text>
    <text x="180" y="172" class="dim" fill="${COLORS.secondary}">b</text>
    <!-- Labels -->
    <text x="270" y="40" class="note">Corresponding (F-shape): equal</text>
    <text x="270" y="58" class="note">Alternate (Z-shape): equal</text>
    <text x="270" y="76" class="note">Co-interior (C-shape): sum=180°</text>
    <!-- Rules -->
    <text x="20" y="210" class="formula">a = a (alternate) | a + b = 180° (co-interior)</text>
  `);
}

// ===================================================================
// MATH: Statistics & Probability
// ===================================================================

function statisticsDiagram(): string {
  return svg(420, 220, `
    <!-- Simple bar chart -->
    <line x1="40" y1="180" x2="280" y2="180" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="40" y1="180" x2="40" y2="20" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <!-- Bars -->
    <rect x="60" y="60" width="40" height="120" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="2"/>
    <rect x="120" y="100" width="40" height="80" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="2"/>
    <rect x="180" y="40" width="40" height="140" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5" rx="2"/>
    <text x="80" y="196" class="note" text-anchor="middle">A</text>
    <text x="140" y="196" class="note" text-anchor="middle">B</text>
    <text x="200" y="196" class="note" text-anchor="middle">C</text>
    <!-- Y axis labels -->
    <text x="32" y="184" style="font-size:9px" fill="${COLORS.muted}" text-anchor="end">0</text>
    <text x="32" y="144" style="font-size:9px" fill="${COLORS.muted}" text-anchor="end">4</text>
    <text x="32" y="104" style="font-size:9px" fill="${COLORS.muted}" text-anchor="end">8</text>
    <text x="32" y="64" style="font-size:9px" fill="${COLORS.muted}" text-anchor="end">12</text>
    <!-- Types -->
    <text x="300" y="40" class="formula">Data Display</text>
    <text x="300" y="65" class="note">Bar chart</text>
    <text x="300" y="83" class="note">Pictogram</text>
    <text x="300" y="101" class="note">Line graph</text>
    <text x="300" y="119" class="note">Pie chart</text>
    <text x="300" y="137" class="note">Scatter plot</text>
    <text x="300" y="165" class="note">Always label axes</text>
    <text x="300" y="183" class="note">and give a title!</text>
  `);
}

function probabilityDiagram(): string {
  return svg(420, 200, `
    <!-- Probability scale -->
    <line x1="30" y1="50" x2="390" y2="50" stroke="${COLORS.muted}" stroke-width="2"/>
    <text x="30" y="40" class="dim" text-anchor="middle">0</text>
    <text x="210" y="40" class="dim" text-anchor="middle">0.5</text>
    <text x="390" y="40" class="dim" text-anchor="middle">1</text>
    <text x="30" y="75" class="note" text-anchor="middle">Impossible</text>
    <text x="210" y="75" class="note" text-anchor="middle">Even chance</text>
    <text x="390" y="75" class="note" text-anchor="middle">Certain</text>
    <!-- Event markers -->
    <circle cx="80" cy="50" r="5" fill="${COLORS.red}"/>
    <text x="80" y="95" style="font-size:9px" fill="${COLORS.red}" text-anchor="middle">Rolling 7</text>
    <text x="80" y="107" style="font-size:9px" fill="${COLORS.red}" text-anchor="middle">on a die</text>
    <circle cx="210" cy="50" r="5" fill="${COLORS.accent}"/>
    <text x="210" y="95" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">Heads on</text>
    <text x="210" y="107" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">a coin</text>
    <circle cx="330" cy="50" r="5" fill="${COLORS.secondary}"/>
    <text x="330" y="95" style="font-size:9px" fill="${COLORS.secondary}" text-anchor="middle">Sun rises</text>
    <text x="330" y="107" style="font-size:9px" fill="${COLORS.secondary}" text-anchor="middle">tomorrow</text>
    <!-- Formula -->
    <text x="20" y="140" class="formula">P(event) = favourable outcomes / total outcomes</text>
    <text x="20" y="165" class="note">P(A or B) = P(A) + P(B) - P(A and B)</text>
    <text x="20" y="183" class="note">P(not A) = 1 - P(A) | All probabilities sum to 1</text>
  `);
}

// ===================================================================
// MATH: Financial
// ===================================================================

function interestDiagram(): string {
  return svg(420, 220, `
    <!-- Axes -->
    <line x1="40" y1="190" x2="380" y2="190" stroke="${COLORS.muted}" stroke-width="1"/>
    <line x1="40" y1="190" x2="40" y2="20" stroke="${COLORS.muted}" stroke-width="1"/>
    <text x="385" y="194" class="note">years</text>
    <text x="10" y="20" class="note">$</text>
    <!-- Simple interest (straight line) -->
    <line x1="40" y1="170" x2="360" y2="90" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="350" y="82" style="font-size:10px" fill="${COLORS.primary}">Simple</text>
    <!-- Compound interest (curve) -->
    <path d="M40,170 Q150,150 230,110 Q300,60 360,20" fill="none" stroke="${COLORS.secondary}" stroke-width="2.5"/>
    <text x="350" y="15" style="font-size:10px" fill="${COLORS.secondary}">Compound</text>
    <!-- Formulas -->
    <text x="40" y="215" class="note">Simple: I = P×r×t | Compound: A = P(1+r)ᵗ</text>
    <!-- Labels -->
    <text x="30" y="175" style="font-size:9px" fill="${COLORS.muted}" text-anchor="end">P</text>
    <text x="200" y="186" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">5</text>
    <text x="360" y="186" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">10</text>
  `);
}

function profitLossDiagram(): string {
  return svg(420, 200, `
    <!-- Cost price bar -->
    <rect x="40" y="40" width="120" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="4"/>
    <text x="100" y="60" class="note" text-anchor="middle">Cost Price</text>
    <text x="100" y="78" class="dim" text-anchor="middle">$80</text>
    <!-- Selling price bar (larger) -->
    <rect x="220" y="30" width="160" height="60" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" rx="4"/>
    <text x="300" y="55" class="note" text-anchor="middle">Selling Price</text>
    <text x="300" y="78" class="dim" text-anchor="middle">$100</text>
    <!-- Profit arrow -->
    <line x1="160" y1="65" x2="218" y2="65" stroke="${COLORS.accent}" stroke-width="2" marker-end="url(#parr)"/>
    <text x="190" y="55" class="dim" text-anchor="middle" fill="${COLORS.accent}">+$20</text>
    <!-- Formulas -->
    <text x="20" y="120" class="formula">Profit = SP - CP = $100 - $80 = $20</text>
    <text x="20" y="145" class="note">Profit % = (Profit/CP) × 100 = (20/80) × 100 = 25%</text>
    <text x="20" y="165" class="note">Loss = CP - SP (when CP > SP)</text>
    <text x="20" y="185" class="note">Discount = Marked Price - Selling Price</text>
    <defs><marker id="parr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.accent}"/></marker></defs>
  `);
}

// ===================================================================
// MATH: Problem Solving
// ===================================================================

function problemSolvingDiagram(): string {
  return svg(420, 180, `
    <!-- Flowchart: Read → Plan → Solve → Check -->
    ${['Read', 'Plan', 'Solve', 'Check'].map((step, i) => {
      const x = 30 + i * 100;
      const colors = [COLORS.primary, COLORS.accent, COLORS.secondary, COLORS.purple];
      const fills = [COLORS.fill, COLORS.fillAmber, COLORS.fillGreen, 'rgba(167,139,250,0.12)'];
      return `<rect x="${x}" y="30" width="80" height="40" fill="${fills[i]}" stroke="${colors[i]}" stroke-width="2" rx="8"/><text x="${x+40}" y="55" class="dim" text-anchor="middle" fill="${colors[i]}">${step}</text>${i < 3 ? `<line x1="${x+80}" y1="50" x2="${x+100}" y2="50" stroke="${COLORS.muted}" stroke-width="1.5" marker-end="url(#pfarr)"/>` : ''}`;
    }).join('')}
    <!-- Details -->
    <text x="30" y="100" class="note" fill="${COLORS.primary}">Read: underline key info, circle the question</text>
    <text x="30" y="118" class="note" fill="${COLORS.accent}">Plan: choose operation, draw diagram</text>
    <text x="30" y="136" class="note" fill="${COLORS.secondary}">Solve: show working, step by step</text>
    <text x="30" y="154" class="note" fill="${COLORS.purple}">Check: does the answer make sense? estimate</text>
    <text x="30" y="175" class="formula">RUCSAC: Read, Understand, Choose, Solve, Answer, Check</text>
    <defs><marker id="pfarr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.muted}"/></marker></defs>
  `);
}

// ===================================================================
// VERBAL
// ===================================================================

function analogiesDiagram(): string {
  return svg(420, 180, `
    <!-- A : B :: C : ? pattern -->
    <rect x="20" y="40" width="70" height="40" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="6"/>
    <text x="55" y="65" class="dim" text-anchor="middle">Cat</text>
    <text x="105" y="65" class="formula">:</text>
    <rect x="120" y="40" width="70" height="40" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" rx="6"/>
    <text x="155" y="65" class="dim" text-anchor="middle">Kitten</text>
    <text x="210" y="65" class="formula">::</text>
    <rect x="230" y="40" width="70" height="40" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="6"/>
    <text x="265" y="65" class="dim" text-anchor="middle">Dog</text>
    <text x="315" y="65" class="formula">:</text>
    <rect x="330" y="40" width="70" height="40" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="2" rx="6"/>
    <text x="365" y="65" class="dim" text-anchor="middle" fill="${COLORS.accent}">?</text>
    <!-- Relationship arrows -->
    <path d="M55,80 Q105,110 155,80" fill="none" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="105" y="108" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">parent→baby</text>
    <path d="M265,80 Q315,110 365,80" fill="none" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="315" y="108" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">parent→baby</text>
    <!-- Answer -->
    <text x="365" y="130" class="formula" text-anchor="middle">= Puppy</text>
    <text x="20" y="155" class="note">Step 1: Find the relationship between first pair</text>
    <text x="20" y="172" class="note">Step 2: Apply same relationship to second pair</text>
  `);
}

function synonymsDiagram(): string {
  return svg(420, 200, `
    <!-- Word web -->
    <circle cx="210" cy="80" r="35" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="210" y="85" class="formula" text-anchor="middle">Happy</text>
    <!-- Connected synonyms -->
    ${[
      { word: 'Joyful', x: 80, y: 30 },
      { word: 'Cheerful', x: 340, y: 30 },
      { word: 'Delighted', x: 60, y: 130 },
      { word: 'Pleased', x: 340, y: 130 },
      { word: 'Content', x: 210, y: 170 },
    ].map(s => `<line x1="210" y1="80" x2="${s.x}" y2="${s.y}" stroke="${COLORS.muted}" stroke-width="1" stroke-dasharray="3,2"/><rect x="${s.x-40}" y="${s.y-12}" width="80" height="24" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="12"/><text x="${s.x}" y="${s.y+5}" class="note" text-anchor="middle" fill="${COLORS.secondary}">${s.word}</text>`).join('')}
    <text x="20" y="200" class="note">Synonyms = words with similar meanings. Context matters!</text>
  `);
}

function antonymsDiagram(): string {
  return svg(420, 160, `
    <!-- Spectrum line -->
    <line x1="40" y1="50" x2="380" y2="50" stroke="${COLORS.muted}" stroke-width="3"/>
    <!-- Gradient -->
    <rect x="40" y="44" width="340" height="12" rx="6" fill="url(#antGrad)"/>
    <!-- Endpoints -->
    <circle cx="60" cy="50" r="12" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="2"/>
    <text x="60" y="55" style="font-size:11px" fill="${COLORS.red}" text-anchor="middle">Hot</text>
    <circle cx="360" cy="50" r="12" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="360" y="55" style="font-size:11px" fill="${COLORS.primary}" text-anchor="middle">Cold</text>
    <text x="210" y="55" class="note" text-anchor="middle">Warm / Cool</text>
    <!-- Arrow -->
    <text x="210" y="25" class="formula" text-anchor="middle">Antonyms = Opposite Meanings</text>
    <!-- Examples -->
    <text x="40" y="95" class="note">big ↔ small | fast ↔ slow | light ↔ dark</text>
    <text x="40" y="115" class="note">happy ↔ sad | increase ↔ decrease | ancient ↔ modern</text>
    <text x="40" y="140" class="note">Tip: prefixes often create antonyms: un-, dis-, im-, in-</text>
    <defs><linearGradient id="antGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COLORS.red}" stop-opacity="0.3"/><stop offset="1" stop-color="${COLORS.primary}" stop-opacity="0.3"/></linearGradient></defs>
  `);
}

function oddOneOutDiagram(): string {
  return svg(420, 180, `
    <!-- 4 items, one crossed out -->
    ${['Apple', 'Banana', 'Carrot', 'Orange'].map((item, i) => {
      const x = 30 + i * 100;
      const isOdd = i === 2;
      return `<rect x="${x}" y="30" width="80" height="50" fill="${isOdd ? COLORS.fillRed : COLORS.fill}" stroke="${isOdd ? COLORS.red : COLORS.primary}" stroke-width="2" rx="6"/><text x="${x+40}" y="60" class="dim" text-anchor="middle" fill="${isOdd ? COLORS.red : COLORS.text}">${item}</text>${isOdd ? `<line x1="${x+5}" y1="35" x2="${x+75}" y2="75" stroke="${COLORS.red}" stroke-width="2.5"/><line x1="${x+75}" y1="35" x2="${x+5}" y2="75" stroke="${COLORS.red}" stroke-width="2.5"/>` : ''}`;
    }).join('')}
    <text x="210" y="105" class="formula" text-anchor="middle">Carrot is the odd one out (vegetable, not fruit)</text>
    <text x="20" y="130" class="note">Strategy: Find what 3 items have in common</text>
    <text x="20" y="148" class="note">Look for: category, property, pattern, number of letters</text>
    <text x="20" y="168" class="note">Common groups: size, colour, shape, function, material</text>
  `);
}

function wordClassificationDiagram(): string {
  return svg(420, 200, `
    <!-- Venn-like grouping circles -->
    <ellipse cx="130" cy="90" rx="100" ry="65" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="70" y="50" class="dim" fill="${COLORS.primary}">Animals</text>
    <ellipse cx="300" cy="90" rx="100" ry="65" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="350" y="50" class="dim" fill="${COLORS.secondary}">Vehicles</text>
    <!-- Words -->
    <text x="90" y="80" class="note">dog</text>
    <text x="130" y="100" class="note">cat</text>
    <text x="100" y="120" class="note">bird</text>
    <text x="280" y="80" class="note">car</text>
    <text x="310" y="100" class="note">bus</text>
    <text x="290" y="120" class="note">train</text>
    <!-- Strategy -->
    <text x="20" y="175" class="formula">Group words by shared category or property</text>
    <text x="20" y="195" class="note">Look for meaning, word type, letter patterns, or number properties</text>
  `);
}

function sentenceCompletionDiagram(): string {
  return svg(420, 180, `
    <!-- Sentence with blank -->
    <text x="20" y="35" class="label">The cat sat on the _____ mat.</text>
    <rect x="175" y="20" width="60" height="22" fill="none" stroke="${COLORS.accent}" stroke-width="2" rx="3"/>
    <!-- Options -->
    ${['a) cold', 'b) warm', 'c) bright', 'd) tall'].map((opt, i) => {
      const x = 40 + i * 95;
      const correct = i === 1;
      return `<rect x="${x}" y="60" width="80" height="28" fill="${correct ? COLORS.fillGreen : 'none'}" stroke="${correct ? COLORS.secondary : COLORS.muted}" stroke-width="${correct ? 2 : 1}" rx="4"/><text x="${x+40}" y="79" class="note" text-anchor="middle" fill="${correct ? COLORS.secondary : COLORS.muted}">${opt}</text>`;
    }).join('')}
    <!-- Arrow to correct -->
    <text x="175" y="110" class="dim" fill="${COLORS.secondary}" text-anchor="middle">✓ warm</text>
    <!-- Tips -->
    <text x="20" y="135" class="formula">Strategy:</text>
    <text x="20" y="155" class="note">1. Read full sentence | 2. Check grammar fits | 3. Check meaning fits</text>
    <text x="20" y="173" class="note">4. Eliminate wrong answers | 5. Read with chosen word to confirm</text>
  `);
}

function wordMeaningsContextDiagram(): string {
  return svg(420, 180, `
    <!-- Sentence with highlighted word -->
    <text x="20" y="30" class="label">The bank was steep and muddy.</text>
    <rect x="49" y="16" width="40" height="20" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5" rx="3"/>
    <!-- Context clues -->
    <line x1="69" y1="38" x2="69" y2="55" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="69" y="70" class="dim" text-anchor="middle" fill="${COLORS.accent}">bank</text>
    <!-- Two possible meanings -->
    <rect x="20" y="85" width="160" height="30" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1" rx="4"/>
    <text x="100" y="105" class="note" text-anchor="middle" fill="${COLORS.red}">Financial institution ✗</text>
    <rect x="220" y="85" width="180" height="30" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" rx="4"/>
    <text x="310" y="105" class="note" text-anchor="middle" fill="${COLORS.secondary}">Riverside edge ✓</text>
    <!-- Clue arrows -->
    <text x="230" y="130" class="note" fill="${COLORS.accent}">Clues: "steep" + "muddy" → riverbank</text>
    <text x="20" y="155" class="formula">Use surrounding words as context clues</text>
    <text x="20" y="175" class="note">Look before and after the word for hints about meaning</text>
  `);
}

function prefixSuffixDiagram(): string {
  return svg(420, 200, `
    <!-- Word broken into parts -->
    <rect x="20" y="30" width="80" height="45" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="2" rx="4"/>
    <text x="60" y="48" class="note" text-anchor="middle" fill="${COLORS.red}">un</text>
    <text x="60" y="65" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">prefix</text>
    <rect x="105" y="30" width="100" height="45" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="4"/>
    <text x="155" y="48" class="dim" text-anchor="middle">help</text>
    <text x="155" y="65" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">root</text>
    <rect x="210" y="30" width="80" height="45" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" rx="4"/>
    <text x="250" y="48" class="note" text-anchor="middle" fill="${COLORS.secondary}">ful</text>
    <text x="250" y="65" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">suffix</text>
    <text x="315" y="55" class="formula">= unhelpful</text>
    <!-- Common prefixes -->
    <text x="20" y="100" class="formula">Common Prefixes:</text>
    <text x="20" y="118" class="note">un- (not) | re- (again) | pre- (before) | mis- (wrong)</text>
    <text x="20" y="136" class="note">dis- (not) | over- (too much) | sub- (under) | inter- (between)</text>
    <!-- Common suffixes -->
    <text x="20" y="160" class="formula">Common Suffixes:</text>
    <text x="20" y="178" class="note">-ful (full of) | -less (without) | -ness (state) | -ment (action)</text>
    <text x="20" y="196" class="note">-able (can be) | -ly (in a way) | -er (one who) | -tion (act of)</text>
  `);
}

function multipleMeaningsDiagram(): string {
  return svg(420, 200, `
    <!-- Central word -->
    <circle cx="210" cy="60" r="30" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="210" y="65" class="formula" text-anchor="middle">Bark</text>
    <!-- Branches to different meanings -->
    ${[
      { meaning: 'Dog sound', x: 60, y: 140, color: COLORS.red },
      { meaning: 'Tree covering', x: 210, y: 160, color: COLORS.secondary },
      { meaning: 'Small boat', x: 360, y: 140, color: COLORS.accent },
    ].map((m, i) => `<line x1="210" y1="90" x2="${m.x}" y2="${m.y-20}" stroke="${m.color}" stroke-width="1.5"/><rect x="${m.x-60}" y="${m.y-15}" width="120" height="28" fill="none" stroke="${m.color}" stroke-width="1.5" rx="6"/><text x="${m.x}" y="${m.y+5}" class="note" text-anchor="middle" fill="${m.color}">${m.meaning}</text>`).join('')}
    <text x="20" y="195" class="note">Multiple meaning words: use context to determine which meaning is intended</text>
  `);
}

function homophonesDiagram(): string {
  return svg(420, 200, `
    <!-- Three columns -->
    <text x="210" y="25" class="formula" text-anchor="middle">Homophones: same sound, different meaning</text>
    ${[
      { word: 'their', def: 'belonging to them', ex: 'their house', x: 60 },
      { word: 'there', def: 'in that place', ex: 'over there', x: 210 },
      { word: "they're", def: 'they are', ex: "they're happy", x: 360 },
    ].map(h => `<rect x="${h.x-60}" y="40" width="120" height="70" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/><text x="${h.x}" y="60" class="dim" text-anchor="middle">${h.word}</text><text x="${h.x}" y="78" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">${h.def}</text><text x="${h.x}" y="98" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">"${h.ex}"</text>`).join('')}
    <!-- Sound symbol -->
    <text x="210" y="135" class="note" text-anchor="middle">All sound like /ther/</text>
    <!-- More examples -->
    <text x="20" y="160" class="note">to/too/two | here/hear | where/wear | your/you're</text>
    <text x="20" y="178" class="note">its/it's | piece/peace | weather/whether | right/write</text>
    <text x="20" y="196" class="note">Tip: try substituting the full form to check (they are → they're)</text>
  `);
}

function inferenceDiagram(): string {
  return svg(420, 200, `
    <!-- Text box -->
    <rect x="20" y="20" width="260" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/>
    <text x="150" y="40" class="note" text-anchor="middle">"She grabbed her umbrella</text>
    <text x="150" y="55" class="note" text-anchor="middle">and looked at the grey sky."</text>
    <!-- Thought bubble -->
    <ellipse cx="340" cy="50" rx="60" ry="30" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="340" y="45" style="font-size:10px" fill="${COLORS.accent}" text-anchor="middle">It's going</text>
    <text x="340" y="58" style="font-size:10px" fill="${COLORS.accent}" text-anchor="middle">to rain!</text>
    <circle cx="278" cy="65" r="4" fill="${COLORS.accent}" opacity="0.5"/>
    <circle cx="288" cy="60" r="3" fill="${COLORS.accent}" opacity="0.4"/>
    <!-- Arrow -->
    <line x1="150" y1="75" x2="150" y2="100" stroke="${COLORS.accent}" stroke-width="1.5" marker-end="url(#infarr)"/>
    <text x="150" y="120" class="formula" text-anchor="middle">Inference = clues + prior knowledge</text>
    <text x="20" y="150" class="note">What the text says (explicit) + What you already know = Inference</text>
    <text x="20" y="170" class="note">Look for: actions, descriptions, dialogue, feelings</text>
    <text x="20" y="190" class="note">Ask: "What does this suggest?" not "What does it say?"</text>
    <defs><marker id="infarr" viewBox="0 0 6 6" refX="3" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L3,6 L6,0" fill="${COLORS.accent}"/></marker></defs>
  `);
}

function syllogismsDiagram(): string {
  return svg(420, 200, `
    <!-- Overlapping circles -->
    <circle cx="150" cy="100" r="70" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" opacity="0.8"/>
    <text x="100" y="70" class="dim" fill="${COLORS.primary}">Mammals</text>
    <circle cx="150" cy="120" r="35" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="150" y="125" class="note" text-anchor="middle" fill="${COLORS.secondary}">Dogs</text>
    <!-- Conclusion -->
    <text x="260" y="50" class="formula">Syllogism:</text>
    <text x="260" y="72" class="note">All mammals are warm-blooded</text>
    <text x="260" y="90" class="note">All dogs are mammals</text>
    <line x1="260" y1="98" x2="400" y2="98" stroke="${COLORS.muted}" stroke-width="1"/>
    <text x="260" y="115" class="note" fill="${COLORS.secondary}">∴ All dogs are warm-blooded</text>
    <!-- Rules -->
    <text x="20" y="190" class="note">If A contains B, and B contains C, then A contains C</text>
  `);
}

function codingDiagram(): string {
  return svg(420, 180, `
    <!-- Letter shift pattern -->
    <text x="20" y="25" class="formula">Letter Coding: shift pattern</text>
    <!-- Original letters -->
    ${['A','B','C','D','E'].map((l, i) => `<rect x="${30+i*55}" y="40" width="40" height="35" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="4"/><text x="${50+i*55}" y="63" class="dim" text-anchor="middle">${l}</text>`).join('')}
    <!-- Arrows -->
    ${[0,1,2,3,4].map(i => `<line x1="${50+i*55}" y1="78" x2="${50+i*55}" y2="98" stroke="${COLORS.accent}" stroke-width="1.5" marker-end="url(#carrs)"/><text x="${63+i*55}" y="92" style="font-size:9px" fill="${COLORS.accent}">+3</text>`).join('')}
    <!-- Coded letters -->
    ${['D','E','F','G','H'].map((l, i) => `<rect x="${30+i*55}" y="100" width="40" height="35" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="4"/><text x="${50+i*55}" y="123" class="dim" text-anchor="middle" fill="${COLORS.secondary}">${l}</text>`).join('')}
    <text x="310" y="75" class="formula">+3 shift</text>
    <text x="20" y="155" class="note">CAT → FDW (each letter shifted by +3)</text>
    <text x="20" y="175" class="note">Types: shift, reverse, substitute, position-based, mirror</text>
    <defs><marker id="carrs" viewBox="0 0 6 6" refX="3" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L3,6 L6,0" fill="${COLORS.accent}"/></marker></defs>
  `);
}

function partsOfSpeechDiagram(): string {
  return svg(420, 200, `
    <!-- Sentence with color-coded words -->
    <text x="20" y="25" class="formula">Parts of Speech</text>
    <!-- Example sentence -->
    <text x="30" y="55" style="font-size:14px" fill="${COLORS.red}">The</text>
    <text x="65" y="55" style="font-size:14px" fill="${COLORS.primary}">quick</text>
    <text x="120" y="55" style="font-size:14px" fill="${COLORS.accent}">fox</text>
    <text x="155" y="55" style="font-size:14px" fill="${COLORS.secondary}">jumps</text>
    <text x="215" y="55" style="font-size:14px" fill="${COLORS.purple}">over</text>
    <text x="265" y="55" style="font-size:14px" fill="${COLORS.red}">the</text>
    <text x="300" y="55" style="font-size:14px" fill="${COLORS.primary}">lazy</text>
    <text x="345" y="55" style="font-size:14px" fill="${COLORS.accent}">dog</text>
    <!-- Legend -->
    ${[
      { label: 'Noun (naming)', color: COLORS.accent, y: 85 },
      { label: 'Verb (action)', color: COLORS.secondary, y: 103 },
      { label: 'Adjective (describes noun)', color: COLORS.primary, y: 121 },
      { label: 'Adverb (describes verb)', color: COLORS.purple, y: 139 },
      { label: 'Determiner/Article', color: COLORS.red, y: 157 },
    ].map(p => `<rect x="30" y="${p.y-12}" width="12" height="12" fill="${p.color}" rx="2"/><text x="50" y="${p.y}" class="note" fill="${p.color}">${p.label}</text>`).join('')}
    <text x="230" y="100" class="note">Pronoun: he, she, it, they</text>
    <text x="230" y="118" class="note">Preposition: on, in, at, over</text>
    <text x="230" y="136" class="note">Conjunction: and, but, or</text>
    <text x="20" y="185" class="note">Every sentence needs at least a noun (subject) and a verb</text>
  `);
}

function spellingDiagram(): string {
  return svg(420, 200, `
    <!-- ie/ei rule -->
    <text x="20" y="25" class="formula">Spelling Rules</text>
    <rect x="20" y="40" width="180" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="6"/>
    <text x="110" y="58" class="dim" text-anchor="middle">i before e</text>
    <text x="110" y="78" class="dim" text-anchor="middle">except after c</text>
    <rect x="220" y="40" width="180" height="50" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="6"/>
    <text x="310" y="60" class="note" text-anchor="middle" fill="${COLORS.secondary}">believe, field, piece</text>
    <text x="310" y="78" class="note" text-anchor="middle" fill="${COLORS.red}">receive, ceiling, deceit</text>
    <!-- More rules -->
    <text x="20" y="115" class="note">Double the consonant: big → bigger, run → running</text>
    <text x="20" y="133" class="note">Drop the e: make → making, hope → hoping</text>
    <text x="20" y="151" class="note">Change y to i: happy → happiness, carry → carried</text>
    <text x="20" y="169" class="note">Plurals: -s, -es (box→boxes), -ies (baby→babies)</text>
    <text x="20" y="192" class="note">Mnemonics help! "Big Elephants Can Always Understand Small Elephants" = BECAUSE</text>
  `);
}

function idiomsDiagram(): string {
  return svg(420, 200, `
    <!-- Literal vs figurative -->
    <text x="210" y="25" class="formula" text-anchor="middle">"Break a leg"</text>
    <!-- Literal meaning (crossed out) -->
    <rect x="30" y="45" width="150" height="60" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1.5" rx="6"/>
    <text x="105" y="70" class="note" text-anchor="middle" fill="${COLORS.red}">Literal: actually</text>
    <text x="105" y="88" class="note" text-anchor="middle" fill="${COLORS.red}">break your leg ✗</text>
    <!-- Figurative meaning -->
    <rect x="230" y="45" width="170" height="60" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" rx="6"/>
    <text x="315" y="70" class="note" text-anchor="middle" fill="${COLORS.secondary}">Figurative: Good luck!</text>
    <text x="315" y="88" class="note" text-anchor="middle" fill="${COLORS.secondary}">Do well! ✓</text>
    <!-- More examples -->
    <text x="20" y="130" class="note">"Raining cats and dogs" = raining heavily</text>
    <text x="20" y="148" class="note">"Piece of cake" = very easy</text>
    <text x="20" y="166" class="note">"Hit the nail on the head" = exactly right</text>
    <text x="20" y="190" class="formula">Idiom = expression where meaning ≠ literal words</text>
  `);
}

function comprehensionDiagram(): string {
  return svg(420, 200, `
    <!-- Passage with annotation marks -->
    <rect x="20" y="20" width="260" height="100" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/>
    <text x="30" y="42" style="font-size:10px" fill="${COLORS.text}">The old lighthouse stood alone</text>
    <text x="30" y="58" style="font-size:10px" fill="${COLORS.text}">on the rocky cliff. Its beam cut</text>
    <text x="30" y="74" style="font-size:10px" fill="${COLORS.text}">through the thick fog, guiding</text>
    <text x="30" y="90" style="font-size:10px" fill="${COLORS.text}">ships safely to harbour...</text>
    <!-- Annotation marks -->
    <circle cx="255" cy="40" r="8" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1"/>
    <text x="255" y="44" style="font-size:8px" fill="${COLORS.accent}" text-anchor="middle">?</text>
    <line x1="27" y1="62" x2="200" y2="62" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <!-- Strategy -->
    <text x="300" y="40" class="formula">Strategy</text>
    <text x="300" y="60" class="note">1. Skim first</text>
    <text x="300" y="78" class="note">2. Read questions</text>
    <text x="300" y="96" class="note">3. Re-read closely</text>
    <text x="300" y="114" class="note">4. Underline evidence</text>
    <text x="20" y="145" class="note">Types: Retrieval (find it) | Inference (work it out) | Evaluation (judge it)</text>
    <text x="20" y="165" class="note">Always quote evidence from the text to support your answer</text>
    <text x="20" y="185" class="note">PEE: Point + Evidence + Explanation</text>
  `);
}

function deductionDiagram(): string {
  return svg(420, 180, `
    <!-- If → Then → Therefore chain -->
    <rect x="20" y="20" width="120" height="40" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="6"/>
    <text x="80" y="45" class="dim" text-anchor="middle">If P then Q</text>
    <line x1="140" y1="40" x2="170" y2="40" stroke="${COLORS.accent}" stroke-width="2" marker-end="url(#darr)"/>
    <rect x="170" y="20" width="100" height="40" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="2" rx="6"/>
    <text x="220" y="45" class="dim" text-anchor="middle">P is true</text>
    <line x1="270" y1="40" x2="300" y2="40" stroke="${COLORS.accent}" stroke-width="2" marker-end="url(#darr)"/>
    <rect x="300" y="20" width="100" height="40" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" rx="6"/>
    <text x="350" y="45" class="dim" text-anchor="middle" fill="${COLORS.secondary}">∴ Q is true</text>
    <!-- Example -->
    <text x="20" y="90" class="note">Example: If it rains, the ground gets wet.</text>
    <text x="20" y="108" class="note">It is raining. ∴ The ground is wet.</text>
    <!-- Rules -->
    <text x="20" y="135" class="formula">Deduction = general rule → specific case</text>
    <text x="20" y="158" class="note">Valid: If A→B and A is true, then B is true</text>
    <text x="20" y="175" class="note">Invalid: If A→B and B is true, A is NOT necessarily true</text>
    <defs><marker id="darr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.accent}"/></marker></defs>
  `);
}

// ===================================================================
// QUANTITATIVE
// ===================================================================

function numberSequencesDiagram(): string {
  return svg(420, 200, `
    <!-- Plotted terms on graph -->
    <line x1="40" y1="170" x2="400" y2="170" stroke="${COLORS.muted}" stroke-width="1"/>
    <line x1="40" y1="170" x2="40" y2="20" stroke="${COLORS.muted}" stroke-width="1"/>
    <text x="400" y="185" class="note">n</text>
    <text x="25" y="20" class="note">value</text>
    <!-- Points for sequence 2,5,8,11,14 -->
    ${[2,5,8,11,14].map((v, i) => `<circle cx="${80+i*70}" cy="${170-v*10}" r="5" fill="${COLORS.primary}"/><text x="${80+i*70}" y="${155-v*10}" style="font-size:10px" fill="${COLORS.primary}" text-anchor="middle">${v}</text><text x="${80+i*70}" y="185" style="font-size:10px" fill="${COLORS.muted}" text-anchor="middle">${i+1}</text>`).join('')}
    <!-- Connect with line -->
    <polyline points="80,150 150,120 220,90 290,60 360,30" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" stroke-dasharray="4,2"/>
    <!-- Rule -->
    <text x="20" y="210" class="note">2, 5, 8, 11, 14, ... → Rule: 3n - 1 | Common difference: +3</text>
  `);
}

function speedDistanceTimeDiagram(): string {
  return svg(420, 220, `
    <!-- Distance-time graph -->
    <line x1="40" y1="180" x2="380" y2="180" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="40" y1="180" x2="40" y2="20" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <text x="210" y="200" class="note" text-anchor="middle">Time (hours)</text>
    <text x="15" y="100" class="note" text-anchor="middle" transform="rotate(-90,15,100)">Distance (km)</text>
    <!-- Journey -->
    <polyline points="40,180 140,80 200,80 300,180" fill="none" stroke="${COLORS.primary}" stroke-width="2.5"/>
    <!-- Labels -->
    <text x="80" y="115" style="font-size:10px" fill="${COLORS.accent}">travelling</text>
    <text x="155" y="72" style="font-size:10px" fill="${COLORS.secondary}">stopped</text>
    <text x="255" y="115" style="font-size:10px" fill="${COLORS.red}">return</text>
    <!-- Triangle -->
    <text x="340" y="40" class="formula">S D T</text>
    <polygon points="340,48 310,85 370,85" fill="none" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="340" y="64" style="font-size:11px" fill="${COLORS.accent}" text-anchor="middle">D</text>
    <text x="322" y="82" style="font-size:11px" fill="${COLORS.primary}" text-anchor="middle">S</text>
    <text x="358" y="82" style="font-size:11px" fill="${COLORS.primary}" text-anchor="middle">T</text>
    <line x1="340" y1="68" x2="340" y2="85" stroke="${COLORS.muted}" stroke-width="0.5"/>
    <!-- Formulas -->
    <text x="300" y="110" class="note">Speed = Distance/Time</text>
    <text x="300" y="128" class="note">Distance = Speed × Time</text>
    <text x="300" y="146" class="note">Time = Distance/Speed</text>
  `);
}

function workRateDiagram(): string {
  return svg(420, 200, `
    <!-- Tank with two pipes -->
    <rect x="140" y="60" width="140" height="100" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="4"/>
    <text x="210" y="115" class="note" text-anchor="middle">Tank</text>
    <!-- Pipe A -->
    <line x1="60" y1="40" x2="160" y2="80" stroke="${COLORS.secondary}" stroke-width="3"/>
    <text x="60" y="30" class="dim" fill="${COLORS.secondary}">Pipe A</text>
    <text x="60" y="55" class="note" fill="${COLORS.secondary}">6 hours</text>
    <!-- Pipe B -->
    <line x1="360" y1="40" x2="260" y2="80" stroke="${COLORS.accent}" stroke-width="3"/>
    <text x="340" y="30" class="dim" fill="${COLORS.accent}">Pipe B</text>
    <text x="340" y="55" class="note" fill="${COLORS.accent}">3 hours</text>
    <!-- Water level -->
    <rect x="142" y="110" width="136" height="48" fill="${COLORS.fill}" stroke="none" rx="2" opacity="0.5"/>
    <!-- Formula -->
    <text x="20" y="185" class="formula">Combined rate = 1/6 + 1/3 = 1/2 → 2 hours together</text>
    <text x="20" y="203" class="note">Work rate = 1/time | Combined: add rates, then invert for time</text>
  `);
}

function probabilitySpinnerDiagram(): string {
  return svg(420, 200, `
    <!-- Spinner circle -->
    <circle cx="120" cy="100" r="70" fill="none" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <!-- Sections -->
    <path d="M120,100 L120,30 A70,70 0 0,1 190,100 Z" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="160" y="70" style="font-size:11px" fill="${COLORS.primary}" text-anchor="middle">1</text>
    <path d="M120,100 L190,100 A70,70 0 0,1 120,170 Z" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <text x="160" y="140" style="font-size:11px" fill="${COLORS.secondary}" text-anchor="middle">2</text>
    <path d="M120,100 L120,170 A70,70 0 0,1 50,100 Z" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="80" y="140" style="font-size:11px" fill="${COLORS.accent}" text-anchor="middle">3</text>
    <path d="M120,100 L50,100 A70,70 0 0,1 120,30 Z" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1.5"/>
    <text x="80" y="70" style="font-size:11px" fill="${COLORS.red}" text-anchor="middle">4</text>
    <!-- Arrow -->
    <line x1="120" y1="100" x2="145" y2="55" stroke="${COLORS.text}" stroke-width="2"/>
    <circle cx="120" cy="100" r="5" fill="${COLORS.text}"/>
    <!-- Probabilities -->
    <text x="230" y="40" class="formula">Equal spinner</text>
    <text x="230" y="62" class="note">P(1) = 1/4 = 0.25</text>
    <text x="230" y="80" class="note">P(even) = 2/4 = 0.5</text>
    <text x="230" y="98" class="note">P(>2) = 2/4 = 0.5</text>
    <!-- Dice -->
    <rect x="230" y="115" width="40" height="40" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/>
    <circle cx="240" cy="125" r="3" fill="${COLORS.text}"/>
    <circle cx="260" cy="145" r="3" fill="${COLORS.text}"/>
    <text x="285" y="130" class="note">P(6) = 1/6</text>
    <text x="285" y="148" class="note">P(odd) = 3/6 = 1/2</text>
    <text x="230" y="180" class="note">Total outcomes on a die = 6</text>
  `);
}

function vennDiagramDiagram(): string {
  return svg(420, 220, `
    <!-- Universal set rectangle -->
    <rect x="20" y="20" width="380" height="170" fill="none" stroke="${COLORS.muted}" stroke-width="1.5" rx="6"/>
    <text x="385" y="38" class="note" text-anchor="end">U</text>
    <!-- Circle A -->
    <circle cx="160" cy="105" r="65" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" opacity="0.8"/>
    <text x="110" y="85" class="dim" fill="${COLORS.primary}">A</text>
    <text x="110" y="105" class="note">5</text>
    <!-- Circle B -->
    <circle cx="260" cy="105" r="65" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" opacity="0.8"/>
    <text x="305" y="85" class="dim" fill="${COLORS.secondary}">B</text>
    <text x="305" y="105" class="note">8</text>
    <!-- Intersection -->
    <text x="210" y="105" class="dim" text-anchor="middle" fill="${COLORS.accent}">3</text>
    <!-- Outside -->
    <text x="370" y="170" class="note">2</text>
    <!-- Formula -->
    <text x="20" y="210" class="formula">A∪B = 5+3+8 = 16 | A∩B = 3 | n(U) = 18</text>
  `);
}

function tablesChartsDiagram(): string {
  return svg(420, 220, `
    <!-- Mini bar chart -->
    <line x1="40" y1="170" x2="220" y2="170" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <line x1="40" y1="170" x2="40" y2="30" stroke="${COLORS.muted}" stroke-width="1.5"/>
    <rect x="55" y="70" width="30" height="100" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="2"/>
    <rect x="95" y="110" width="30" height="60" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="2"/>
    <rect x="135" y="50" width="30" height="120" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5" rx="2"/>
    <rect x="175" y="90" width="30" height="80" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1.5" rx="2"/>
    <text x="70" y="185" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Mon</text>
    <text x="110" y="185" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Tue</text>
    <text x="150" y="185" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Wed</text>
    <text x="190" y="185" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Thu</text>
    <!-- Table -->
    <text x="250" y="40" class="formula">Reading Tables</text>
    <text x="250" y="65" class="note">1. Read title + headings</text>
    <text x="250" y="83" class="note">2. Check units/scale</text>
    <text x="250" y="101" class="note">3. Compare values</text>
    <text x="250" y="119" class="note">4. Calculate totals/diff</text>
    <text x="20" y="215" class="note">Types: bar chart, pie chart, line graph, pictogram, frequency table</text>
  `);
}

function meanMedianModeDiagram(): string {
  return svg(420, 220, `
    <!-- Sorted data -->
    <text x="20" y="25" class="formula">Data: 2, 3, 5, 5, 7, 8, 12</text>
    ${[2,3,5,5,7,8,12].map((v, i) => `<rect x="${25+i*52}" y="40" width="42" height="35" fill="${v === 5 ? COLORS.fillAmber : COLORS.fill}" stroke="${v === 5 ? COLORS.accent : COLORS.primary}" stroke-width="1.5" rx="4"/><text x="${46+i*52}" y="63" class="dim" text-anchor="middle">${v}</text>`).join('')}
    <!-- Median arrow -->
    <line x1="${46+3*52}" y1="80" x2="${46+3*52}" y2="100" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="${46+3*52}" y="115" class="dim" text-anchor="middle" fill="${COLORS.secondary}">Median = 5</text>
    <text x="${46+3*52}" y="130" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">(middle value)</text>
    <!-- Mean -->
    <text x="20" y="155" class="note" fill="${COLORS.primary}">Mean = (2+3+5+5+7+8+12) ÷ 7 = 42 ÷ 7 = 6</text>
    <!-- Mode -->
    <text x="20" y="175" class="note" fill="${COLORS.accent}">Mode = 5 (most frequent)</text>
    <!-- Range -->
    <text x="20" y="195" class="note" fill="${COLORS.red}">Range = 12 - 2 = 10 (largest - smallest)</text>
    <text x="20" y="218" class="note">Mean = average | Median = middle | Mode = most common | Range = spread</text>
  `);
}

function paperFoldingDiagram(): string {
  return svg(420, 200, `
    <!-- Step 1: flat paper -->
    <rect x="20" y="30" width="80" height="80" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <text x="60" y="130" class="note" text-anchor="middle">1. Start</text>
    <!-- Step 2: folded in half -->
    <rect x="130" y="30" width="40" height="80" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <line x1="130" y1="30" x2="130" y2="110" stroke="${COLORS.accent}" stroke-width="2" stroke-dasharray="4,2"/>
    <text x="150" y="130" class="note" text-anchor="middle">2. Fold</text>
    <!-- Step 3: hole punched -->
    <rect x="210" y="30" width="40" height="80" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <circle cx="230" cy="60" r="6" fill="${COLORS.bg}" stroke="${COLORS.red}" stroke-width="2"/>
    <text x="230" y="130" class="note" text-anchor="middle">3. Punch</text>
    <!-- Step 4: unfolded result -->
    <rect x="290" y="30" width="80" height="80" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5"/>
    <circle cx="320" cy="60" r="6" fill="${COLORS.bg}" stroke="${COLORS.red}" stroke-width="2"/>
    <circle cx="350" cy="60" r="6" fill="${COLORS.bg}" stroke="${COLORS.red}" stroke-width="2"/>
    <line x1="330" y1="30" x2="330" y2="110" stroke="${COLORS.accent}" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="330" y="130" class="note" text-anchor="middle">4. Unfold</text>
    <!-- Tips -->
    <text x="20" y="160" class="formula">Paper Folding Strategy</text>
    <text x="20" y="180" class="note">Track fold lines | Holes mirror across fold | Count layers</text>
    <text x="20" y="198" class="note">1 fold = 2 layers = symmetrical holes</text>
  `);
}

function mentalMathDiagram(): string {
  return svg(420, 200, `
    <!-- Breaking down 48 × 25 -->
    <text x="20" y="30" class="formula">Mental Math: 48 × 25</text>
    <!-- Step breakdown -->
    <rect x="20" y="45" width="380" height="120" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="8"/>
    <text x="40" y="70" class="note">Strategy: break into easier parts</text>
    <text x="40" y="95" class="dim">48 × 25 = 48 × 100 ÷ 4</text>
    <text x="40" y="115" class="dim">= 4800 ÷ 4</text>
    <text x="40" y="140" class="formula" fill="${COLORS.secondary}">= 1200</text>
    <text x="250" y="95" class="note">OR: 50 × 25 - 2 × 25</text>
    <text x="250" y="115" class="note">= 1250 - 50</text>
    <text x="250" y="140" class="note" fill="${COLORS.secondary}">= 1200 ✓</text>
    <!-- Tips -->
    <text x="20" y="185" class="note">×25 = ×100÷4 | ×50 = ×100÷2 | ×9 = ×10-×1 | ×11 = ×10+×1</text>
    <text x="20" y="203" class="note">Partition: split numbers into parts you can multiply easily</text>
  `);
}

function mcqStrategyDiagram(): string {
  return svg(420, 200, `
    <!-- Options with elimination -->
    <text x="20" y="25" class="formula">MCQ Strategy: Eliminate wrong answers</text>
    ${[
      { label: 'A) 24', eliminated: true, y: 45 },
      { label: 'B) 36', eliminated: false, y: 80 },
      { label: 'C) 48', eliminated: true, y: 115 },
      { label: 'D) 52', eliminated: true, y: 150 },
    ].map(o => `<rect x="30" y="${o.y}" width="150" height="28" fill="${o.eliminated ? COLORS.fillRed : COLORS.fillGreen}" stroke="${o.eliminated ? COLORS.red : COLORS.secondary}" stroke-width="${o.eliminated ? 1 : 2.5}" rx="4"/><text x="105" y="${o.y+19}" class="note" text-anchor="middle" fill="${o.eliminated ? COLORS.red : COLORS.secondary}">${o.label}</text>${o.eliminated ? `<line x1="35" y1="${o.y+14}" x2="175" y2="${o.y+14}" stroke="${COLORS.red}" stroke-width="2"/>` : `<text x="190" y="${o.y+20}" class="dim" fill="${COLORS.secondary}">✓</text>`}`).join('')}
    <!-- Strategy steps -->
    <text x="230" y="60" class="note">1. Read question carefully</text>
    <text x="230" y="80" class="note">2. Try to solve it first</text>
    <text x="230" y="100" class="note">3. Eliminate clearly wrong</text>
    <text x="230" y="120" class="note">4. Check remaining options</text>
    <text x="230" y="140" class="note">5. Substitute back to verify</text>
    <text x="20" y="195" class="note">Time management: skip hard questions, come back later. Never leave blank!</text>
  `);
}

// ===================================================================
// READING
// ===================================================================

function findingInfoDiagram(): string {
  return svg(420, 200, `
    <!-- Magnifying glass on text -->
    <rect x="20" y="20" width="240" height="120" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/>
    ${['The fox ran quickly through', 'the forest. It jumped over a', 'fallen log and disappeared', 'into the tall grass near the', 'river bank.'].map((line, i) => `<text x="30" y="${40+i*18}" style="font-size:10px" fill="${COLORS.text}">${line}</text>`).join('')}
    <!-- Highlight -->
    <rect x="28" y="28" width="155" height="16" fill="${COLORS.fillAmber}" stroke="none" rx="2" opacity="0.5"/>
    <!-- Magnifying glass -->
    <circle cx="300" cy="70" r="35" fill="none" stroke="${COLORS.accent}" stroke-width="3"/>
    <line x1="325" y1="95" x2="355" y2="125" stroke="${COLORS.accent}" stroke-width="4"/>
    <text x="300" y="65" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">Key words</text>
    <text x="300" y="78" style="font-size:9px" fill="${COLORS.accent}" text-anchor="middle">from question</text>
    <!-- Tips -->
    <text x="20" y="160" class="formula">Scan → Locate → Read around → Answer</text>
    <text x="20" y="180" class="note">Use key words from the question to scan the text quickly</text>
    <text x="20" y="198" class="note">Read the sentence before and after for full context</text>
  `);
}

function sequencingDiagram(): string {
  return svg(420, 180, `
    <!-- Numbered event timeline -->
    <line x1="30" y1="50" x2="390" y2="50" stroke="${COLORS.muted}" stroke-width="2"/>
    ${['Woke up', 'Ate breakfast', 'Walked to\nschool', 'Took test', 'Went home'].map((event, i) => {
      const x = 50 + i * 80;
      return `<circle cx="${x}" cy="50" r="12" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/><text x="${x}" y="54" style="font-size:11px" fill="${COLORS.primary}" text-anchor="middle">${i+1}</text><text x="${x}" y="80" style="font-size:9px" fill="${COLORS.text}" text-anchor="middle">${event.split('\\n')[0]}</text>${event.includes('\\n') ? `<text x="${x}" y="92" style="font-size:9px" fill="${COLORS.text}" text-anchor="middle">${event.split('\\n')[1]}</text>` : ''}`;
    }).join('')}
    <!-- Tips -->
    <text x="20" y="120" class="formula">Sequencing = putting events in order</text>
    <text x="20" y="142" class="note">Signal words: first, then, next, after, finally, meanwhile</text>
    <text x="20" y="160" class="note">Look for: time words, cause/effect, before/after clues</text>
    <text x="20" y="178" class="note">Tip: number the events in the margin as you read</text>
  `);
}

function readingInferenceDiagram(): string {
  return svg(420, 220, `
    <!-- Iceberg diagram -->
    <!-- Water line -->
    <line x1="20" y1="90" x2="400" y2="90" stroke="${COLORS.primary}" stroke-width="1.5" stroke-dasharray="6,3"/>
    <text x="405" y="94" style="font-size:9px" fill="${COLORS.primary}">surface</text>
    <!-- Above water (visible text) -->
    <polygon points="160,20 260,20 280,85 140,85" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="210" y="45" class="note" text-anchor="middle" fill="${COLORS.primary}">What the</text>
    <text x="210" y="60" class="note" text-anchor="middle" fill="${COLORS.primary}">text SAYS</text>
    <text x="210" y="75" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">(explicit)</text>
    <!-- Below water (hidden meaning) -->
    <polygon points="140,95 280,95 330,200 90,200" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="210" y="125" class="note" text-anchor="middle" fill="${COLORS.secondary}">What the</text>
    <text x="210" y="142" class="note" text-anchor="middle" fill="${COLORS.secondary}">text MEANS</text>
    <text x="210" y="160" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">(implicit)</text>
    <text x="210" y="180" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">feelings, themes,</text>
    <text x="210" y="193" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">hidden meanings</text>
    <!-- Label -->
    <text x="20" y="215" class="formula">Inference = reading between the lines</text>
  `);
}

function vocabInContextDiagram(): string {
  return svg(420, 180, `
    <!-- Sentence with context clues -->
    <rect x="20" y="20" width="380" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/>
    <text x="30" y="42" style="font-size:12px" fill="${COLORS.text}">The</text>
    <text x="55" y="42" style="font-size:12px" fill="${COLORS.accent}">lethargic</text>
    <text x="130" y="42" style="font-size:12px" fill="${COLORS.text}">dog lay on the sofa,</text>
    <text x="30" y="60" style="font-size:12px" fill="${COLORS.secondary}">too tired to move</text>
    <text x="160" y="60" style="font-size:12px" fill="${COLORS.text}">.</text>
    <!-- Highlight unknown word -->
    <rect x="50" y="29" width="78" height="18" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5" rx="2"/>
    <!-- Context clue highlight -->
    <rect x="25" y="47" width="132" height="18" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1" rx="2" opacity="0.5"/>
    <!-- Arrows -->
    <text x="210" y="95" class="formula" text-anchor="middle">Context clue → "too tired to move"</text>
    <text x="210" y="115" class="dim" text-anchor="middle" fill="${COLORS.accent}">lethargic = very tired, no energy</text>
    <text x="20" y="145" class="note">Types of context clues:</text>
    <text x="20" y="163" class="note">Definition | Synonym | Antonym | Example | General sense</text>
    <text x="20" y="180" class="note">Tip: replace the word with your guess — does the sentence still make sense?</text>
  `);
}

function authorPurposeDiagram(): string {
  return svg(420, 200, `
    <!-- Three purpose icons -->
    ${[
      { label: 'Inform', icon: 'i', desc: 'Facts, news,\ntextbooks', x: 70, color: COLORS.primary, fill: COLORS.fill },
      { label: 'Persuade', icon: '!', desc: 'Ads, speeches,\nopinions', x: 210, color: COLORS.accent, fill: COLORS.fillAmber },
      { label: 'Entertain', icon: '★', desc: 'Stories, poems,\njokes', x: 350, color: COLORS.secondary, fill: COLORS.fillGreen },
    ].map(p => `<circle cx="${p.x}" cy="60" r="35" fill="${p.fill}" stroke="${p.color}" stroke-width="2"/><text x="${p.x}" y="55" style="font-size:20px" fill="${p.color}" text-anchor="middle">${p.icon}</text><text x="${p.x}" y="110" class="dim" text-anchor="middle" fill="${p.color}">${p.label}</text><text x="${p.x}" y="130" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">${p.desc.split('\\n')[0]}</text><text x="${p.x}" y="143" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">${p.desc.split('\\n')[1]}</text>`).join('')}
    <!-- Additional purposes -->
    <text x="20" y="170" class="formula">PIE: Persuade, Inform, Entertain</text>
    <text x="20" y="192" class="note">Also: instruct, describe, explain, argue, advise, warn</text>
  `);
}

function toneDiagram(): string {
  return svg(420, 180, `
    <!-- Tone spectrum -->
    <line x1="30" y1="50" x2="390" y2="50" stroke="${COLORS.muted}" stroke-width="3"/>
    <rect x="30" y="44" width="360" height="12" rx="6" fill="url(#toneGrad)"/>
    <!-- Markers -->
    ${[
      { label: 'Joyful', x: 50, emoji: ':)' },
      { label: 'Calm', x: 130, emoji: ':|' },
      { label: 'Serious', x: 210, emoji: ':|' },
      { label: 'Anxious', x: 290, emoji: ':/' },
      { label: 'Angry', x: 370, emoji: '>:(' },
    ].map(t => `<circle cx="${t.x}" cy="50" r="8" fill="${COLORS.bg}" stroke="${COLORS.text}" stroke-width="1.5"/><text x="${t.x}" y="54" style="font-size:8px" fill="${COLORS.text}" text-anchor="middle">${t.emoji}</text><text x="${t.x}" y="80" class="note" text-anchor="middle">${t.label}</text>`).join('')}
    <!-- Tips -->
    <text x="20" y="110" class="formula">Tone = the author's attitude towards the subject</text>
    <text x="20" y="132" class="note">Look at: word choice, punctuation, sentence length, imagery</text>
    <text x="20" y="150" class="note">Mood = how the reader feels | Tone = how the author feels</text>
    <text x="20" y="170" class="note">Formal vs informal | Optimistic vs pessimistic | Humorous vs serious</text>
    <defs><linearGradient id="toneGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COLORS.secondary}" stop-opacity="0.3"/><stop offset="0.5" stop-color="${COLORS.accent}" stop-opacity="0.2"/><stop offset="1" stop-color="${COLORS.red}" stop-opacity="0.3"/></linearGradient></defs>
  `);
}

function textStructureDiagram(): string {
  return svg(420, 220, `
    <!-- Three structure types -->
    <!-- Cause → Effect -->
    <rect x="20" y="20" width="80" height="35" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="4"/>
    <text x="60" y="42" class="note" text-anchor="middle" fill="${COLORS.primary}">Cause</text>
    <line x1="100" y1="37" x2="130" y2="37" stroke="${COLORS.accent}" stroke-width="2" marker-end="url(#tsarr)"/>
    <rect x="130" y="20" width="80" height="35" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="4"/>
    <text x="170" y="42" class="note" text-anchor="middle" fill="${COLORS.secondary}">Effect</text>
    <!-- Compare / Contrast -->
    <circle cx="290" cy="37" r="22" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5"/>
    <circle cx="330" cy="37" r="22" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <text x="310" y="42" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">vs</text>
    <text x="310" y="75" class="note" text-anchor="middle">Compare/Contrast</text>
    <!-- Chronological -->
    <text x="20" y="85" class="note">Chronological (time order):</text>
    ${['First', 'Next', 'Then', 'Finally'].map((w, i) => `<rect x="${20+i*90}" y="95" width="75" height="25" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1" rx="4"/><text x="${57+i*90}" y="112" class="note" text-anchor="middle">${w}</text>${i < 3 ? `<line x1="${95+i*90}" y1="107" x2="${110+i*90}" y2="107" stroke="${COLORS.muted}" stroke-width="1" marker-end="url(#tsarr)"/>` : ''}`).join('')}
    <!-- Problem/Solution -->
    <text x="20" y="148" class="note">Problem → Solution | Description | Sequence</text>
    <text x="20" y="175" class="formula">Signal words help identify structure:</text>
    <text x="20" y="195" class="note">because/so (cause-effect) | however/but (contrast) | first/then (sequence)</text>
    <text x="20" y="213" class="note">similarly/likewise (compare) | the problem is/solution (problem-solution)</text>
    <defs><marker id="tsarr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.accent}"/></marker></defs>
  `);
}

function evidenceDiagram(): string {
  return svg(420, 200, `
    <!-- Text with quote marks -->
    <rect x="20" y="20" width="240" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/>
    <text x="30" y="38" style="font-size:10px" fill="${COLORS.text}">Text: "The wind howled</text>
    <text x="30" y="55" style="font-size:10px" fill="${COLORS.text}">through the broken windows."</text>
    <!-- Arrow to claim -->
    <line x1="140" y1="75" x2="140" y2="105" stroke="${COLORS.accent}" stroke-width="2" marker-end="url(#evarr)"/>
    <text x="180" y="92" class="note" fill="${COLORS.accent}">supports</text>
    <!-- Claim -->
    <rect x="20" y="110" width="280" height="40" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" rx="6"/>
    <text x="160" y="128" class="note" text-anchor="middle" fill="${COLORS.secondary}">Claim: The building was abandoned</text>
    <text x="160" y="143" class="note" text-anchor="middle" fill="${COLORS.secondary}">and in poor condition.</text>
    <!-- PEE structure -->
    <text x="320" y="40" class="formula">PEE Chain</text>
    <text x="320" y="60" class="note" fill="${COLORS.primary}">P - Point</text>
    <text x="320" y="78" class="note" fill="${COLORS.accent}">E - Evidence</text>
    <text x="320" y="96" class="note" fill="${COLORS.secondary}">E - Explain</text>
    <text x="20" y="175" class="note">Always quote directly from the text using quotation marks</text>
    <text x="20" y="195" class="note">Then explain HOW the evidence supports your point</text>
    <defs><marker id="evarr" viewBox="0 0 6 6" refX="3" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L3,6 L6,0" fill="${COLORS.accent}"/></marker></defs>
  `);
}

function examTechniqueDiagram(): string {
  return svg(420, 200, `
    <!-- Clock -->
    <circle cx="60" cy="60" r="40" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <line x1="60" y1="60" x2="60" y2="30" stroke="${COLORS.text}" stroke-width="2"/>
    <line x1="60" y1="60" x2="80" y2="55" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <circle cx="60" cy="60" r="3" fill="${COLORS.text}"/>
    <text x="60" y="115" class="note" text-anchor="middle">Manage time</text>
    <!-- Passage icon -->
    <rect x="140" y="25" width="70" height="70" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="4"/>
    ${[0,1,2,3,4].map(i => `<line x1="150" y1="${38+i*12}" x2="200" y2="${38+i*12}" stroke="${COLORS.muted}" stroke-width="1"/>`).join('')}
    <text x="175" y="115" class="note" text-anchor="middle">Read carefully</text>
    <!-- Checklist -->
    <rect x="250" y="25" width="70" height="70" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="4"/>
    ${[0,1,2].map(i => `<text x="265" y="${45+i*18}" style="font-size:10px" fill="${COLORS.secondary}">✓</text><line x1="280" y1="${40+i*18}" x2="310" y2="${40+i*18}" stroke="${COLORS.muted}" stroke-width="1"/>`).join('')}
    <text x="285" y="115" class="note" text-anchor="middle">Check answers</text>
    <!-- Tips -->
    <text x="20" y="140" class="formula">Exam Strategy</text>
    <text x="20" y="160" class="note">1. Skim passage first (2 min) | 2. Read questions | 3. Re-read for answers</text>
    <text x="20" y="178" class="note">4. Answer easy questions first | 5. Quote evidence | 6. Review at end</text>
    <text x="20" y="196" class="note">Time tip: marks ≈ minutes (a 3-mark question ≈ 3 minutes)</text>
  `);
}

// ===================================================================
// WRITING
// ===================================================================

function essayPlanningDiagram(): string {
  return svg(420, 200, `
    <!-- Beginning / Middle / End boxes with arrows -->
    <rect x="20" y="30" width="110" height="60" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="6"/>
    <text x="75" y="55" class="dim" text-anchor="middle" fill="${COLORS.primary}">Introduction</text>
    <text x="75" y="75" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Hook + thesis</text>
    <line x1="130" y1="60" x2="150" y2="60" stroke="${COLORS.accent}" stroke-width="2" marker-end="url(#essarr)"/>
    <rect x="155" y="20" width="110" height="80" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2" rx="6"/>
    <text x="210" y="45" class="dim" text-anchor="middle" fill="${COLORS.secondary}">Body</text>
    <text x="210" y="62" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Paragraph 1</text>
    <text x="210" y="75" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Paragraph 2</text>
    <text x="210" y="88" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Paragraph 3</text>
    <line x1="265" y1="60" x2="285" y2="60" stroke="${COLORS.accent}" stroke-width="2" marker-end="url(#essarr)"/>
    <rect x="290" y="30" width="110" height="60" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="2" rx="6"/>
    <text x="345" y="55" class="dim" text-anchor="middle" fill="${COLORS.accent}">Conclusion</text>
    <text x="345" y="75" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Summarise + final thought</text>
    <!-- Paragraph structure -->
    <text x="20" y="130" class="formula">Each paragraph: PEEL</text>
    <text x="20" y="150" class="note">Point → Evidence → Explain → Link back to question</text>
    <text x="20" y="170" class="note">Plan for 5 minutes before writing. Jot key ideas per paragraph.</text>
    <text x="20" y="190" class="note">Use connectives: However, Furthermore, In contrast, Therefore</text>
    <defs><marker id="essarr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${COLORS.accent}"/></marker></defs>
  `);
}

function strongOpeningsDiagram(): string {
  return svg(420, 220, `
    <text x="20" y="25" class="formula">Hook Types for Strong Openings</text>
    ${[
      { type: 'Question', example: '"Have you ever wondered...?"', y: 50, color: COLORS.primary },
      { type: 'Action', example: '"She sprinted through the rain..."', y: 90, color: COLORS.secondary },
      { type: 'Dialogue', example: '"Help!" screamed the child.', y: 130, color: COLORS.accent },
      { type: 'Fact/Stat', example: '"Every 3 seconds, a child..."', y: 170, color: COLORS.red },
    ].map(h => `<rect x="20" y="${h.y}" width="85" height="30" fill="none" stroke="${h.color}" stroke-width="2" rx="6"/><text x="62" y="${h.y+20}" class="note" text-anchor="middle" fill="${h.color}">${h.type}</text><text x="120" y="${h.y+20}" class="note">${h.example}</text>`).join('')}
    <text x="20" y="212" class="note">Avoid: "In this essay I will..." or "Once upon a time..."</text>
  `);
}

function showDontTellDiagram(): string {
  return svg(420, 200, `
    <!-- Tell (crossed out) -->
    <rect x="20" y="30" width="180" height="50" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="2" rx="6"/>
    <text x="110" y="50" class="note" text-anchor="middle" fill="${COLORS.red}">TELLING:</text>
    <text x="110" y="68" class="note" text-anchor="middle" fill="${COLORS.red}">"She was very sad."</text>
    <line x1="30" y1="35" x2="190" y2="75" stroke="${COLORS.red}" stroke-width="2.5"/>
    <!-- Show (highlighted) -->
    <rect x="220" y="30" width="190" height="50" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2.5" rx="6"/>
    <text x="315" y="50" class="note" text-anchor="middle" fill="${COLORS.secondary}">SHOWING:</text>
    <text x="315" y="68" class="note" text-anchor="middle" fill="${COLORS.secondary}">"Tears rolled down her cheeks."</text>
    <!-- Arrow -->
    <text x="210" y="55" class="formula">→</text>
    <!-- More examples -->
    <text x="20" y="110" class="formula">Show emotions through actions and senses</text>
    <text x="20" y="135" class="note">"He was angry" → "His fists clenched, jaw tight, nostrils flaring"</text>
    <text x="20" y="155" class="note">"It was cold" → "Frost crept across the window pane"</text>
    <text x="20" y="180" class="note">Use: body language, facial expressions, sounds, sensory detail</text>
    <text x="20" y="198" class="note">5 senses: sight, sound, smell, taste, touch</text>
  `);
}

function dialogueDiagram(): string {
  return svg(420, 200, `
    <!-- Speech bubble -->
    <rect x="60" y="20" width="200" height="50" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2" rx="12"/>
    <polygon points="100,70 120,90 140,70" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <line x1="101" y1="69" x2="139" y2="69" stroke="${COLORS.fill}" stroke-width="3"/>
    <text x="160" y="42" class="note" text-anchor="middle">"Where are you going?"</text>
    <text x="160" y="58" class="note" text-anchor="middle">asked Mum.</text>
    <!-- Format rules -->
    <text x="280" y="35" class="formula">Dialogue Rules</text>
    <text x="280" y="55" class="note">New speaker = new line</text>
    <text x="280" y="73" class="note">Use "speech marks"</text>
    <text x="280" y="91" class="note">Comma before closing</text>
    <!-- Example -->
    <rect x="20" y="105" width="380" height="55" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1" rx="4"/>
    <text x="30" y="125" style="font-size:10px" fill="${COLORS.text}">"I'm going out," said Tom.</text>
    <text x="30" y="145" style="font-size:10px" fill="${COLORS.text}">"Be back by six," replied Mum.</text>
    <!-- Tips -->
    <text x="20" y="180" class="note">Vary speech verbs: whispered, shouted, muttered, exclaimed</text>
    <text x="20" y="198" class="note">Add action: "Stop!" She slammed her fist on the table.</text>
  `);
}

function argumentDiagram(): string {
  return svg(420, 220, `
    <!-- Thesis → Evidence → Counter → Conclusion stack -->
    ${[
      { label: 'Thesis / Claim', desc: 'State your position', y: 20, color: COLORS.primary, fill: COLORS.fill },
      { label: 'Evidence 1 + 2', desc: 'Facts, examples, stats', y: 65, color: COLORS.secondary, fill: COLORS.fillGreen },
      { label: 'Counterargument', desc: 'Acknowledge other side', y: 110, color: COLORS.red, fill: COLORS.fillRed },
      { label: 'Rebuttal + Conclusion', desc: 'Refute and summarise', y: 155, color: COLORS.accent, fill: COLORS.fillAmber },
    ].map((s, i) => `<rect x="30" y="${s.y}" width="170" height="38" fill="${s.fill}" stroke="${s.color}" stroke-width="2" rx="6"/><text x="115" y="${s.y+24}" class="dim" text-anchor="middle" fill="${s.color}">${s.label}</text>${i < 3 ? `<line x1="115" y1="${s.y+38}" x2="115" y2="${s.y+47}" stroke="${COLORS.muted}" stroke-width="1.5" marker-end="url(#argarr)"/>` : ''}<text x="215" y="${s.y+24}" class="note">${s.desc}</text>`).join('')}
    <text x="30" y="210" class="formula">Strong argument = evidence + reasoning + addressing opposition</text>
    <defs><marker id="argarr" viewBox="0 0 6 6" refX="3" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L3,6 L6,0" fill="${COLORS.muted}"/></marker></defs>
  `);
}

function persuasiveTechniquesDiagram(): string {
  return svg(420, 220, `
    <!-- Ethos/Pathos/Logos triangle -->
    <polygon points="210,30 80,190 340,190" fill="none" stroke="${COLORS.primary}" stroke-width="2"/>
    <!-- Vertices -->
    <circle cx="210" cy="30" r="18" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="210" y="35" style="font-size:10px" fill="${COLORS.primary}" text-anchor="middle">Ethos</text>
    <circle cx="80" cy="190" r="18" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="80" y="195" style="font-size:10px" fill="${COLORS.secondary}" text-anchor="middle">Pathos</text>
    <circle cx="340" cy="190" r="18" fill="${COLORS.fillAmber}" stroke="${COLORS.accent}" stroke-width="2"/>
    <text x="340" y="195" style="font-size:10px" fill="${COLORS.accent}" text-anchor="middle">Logos</text>
    <!-- Labels -->
    <text x="240" y="25" class="note" fill="${COLORS.primary}">Credibility / Trust</text>
    <text x="80" y="215" class="note" text-anchor="middle" fill="${COLORS.secondary}">Emotion / Feelings</text>
    <text x="340" y="215" class="note" text-anchor="middle" fill="${COLORS.accent}">Logic / Facts</text>
    <!-- Center -->
    <text x="210" y="130" class="dim" text-anchor="middle">Persuasion</text>
    <!-- Techniques list -->
    <text x="130" y="100" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Repetition, Rhetorical Q,</text>
    <text x="130" y="113" style="font-size:9px" fill="${COLORS.muted}" text-anchor="middle">Rule of 3, Emotive words</text>
  `);
}

function vocabularyUpgradeDiagram(): string {
  return svg(420, 200, `
    <text x="20" y="25" class="formula">Upgrade Your Vocabulary</text>
    <!-- Boring → Vivid upgrades -->
    ${[
      { boring: 'said', vivid: 'exclaimed / whispered', y: 45 },
      { boring: 'nice', vivid: 'delightful / charming', y: 80 },
      { boring: 'big', vivid: 'enormous / colossal', y: 115 },
      { boring: 'walked', vivid: 'strolled / trudged', y: 150 },
    ].map(w => `<rect x="30" y="${w.y}" width="90" height="28" fill="${COLORS.fillRed}" stroke="${COLORS.red}" stroke-width="1" rx="4"/><text x="75" y="${w.y+19}" class="note" text-anchor="middle" fill="${COLORS.red}">${w.boring}</text><text x="140" y="${w.y+19}" class="formula">→</text><rect x="160" y="${w.y}" width="200" height="28" fill="${COLORS.fillGreen}" stroke="${COLORS.secondary}" stroke-width="1.5" rx="4"/><text x="260" y="${w.y+19}" class="note" text-anchor="middle" fill="${COLORS.secondary}">${w.vivid}</text>`).join('')}
    <text x="20" y="196" class="note">Choose precise words that create a clear picture in the reader's mind</text>
  `);
}

function figurativeLanguageDiagram(): string {
  return svg(420, 220, `
    <text x="20" y="25" class="formula">Figurative Language</text>
    ${[
      { type: 'Simile', def: 'Comparison using "like" or "as"', ex: 'Fast as lightning', color: COLORS.primary },
      { type: 'Metaphor', def: 'Direct comparison (is/was)', ex: 'Life is a journey', color: COLORS.secondary },
      { type: 'Personification', def: 'Giving human traits to objects', ex: 'The wind whispered', color: COLORS.accent },
      { type: 'Hyperbole', def: 'Exaggeration for effect', ex: "I've told you a million times", color: COLORS.red },
      { type: 'Onomatopoeia', def: 'Words that sound like meaning', ex: 'Buzz, crash, sizzle', color: COLORS.purple },
    ].map((f, i) => `<rect x="20" y="${40+i*35}" width="95" height="26" fill="none" stroke="${f.color}" stroke-width="1.5" rx="4"/><text x="67" y="${57+i*35}" class="note" text-anchor="middle" fill="${f.color}">${f.type}</text><text x="125" y="${57+i*35}" class="note">${f.def}</text><text x="340" y="${57+i*35}" style="font-size:9px;font-style:italic" fill="${COLORS.muted}">${f.ex}</text>`).join('')}
  `);
}

function editingDiagram(): string {
  return svg(420, 200, `
    <!-- Text with proofreading marks -->
    <rect x="20" y="20" width="280" height="100" fill="${COLORS.fill}" stroke="${COLORS.primary}" stroke-width="1.5" rx="6"/>
    <text x="30" y="42" style="font-size:11px" fill="${COLORS.text}">the cat sat on the mat</text>
    <!-- Proofread marks -->
    <text x="28" y="42" style="font-size:14px;font-weight:bold" fill="${COLORS.red}">T</text>
    <text x="30" y="56" style="font-size:9px" fill="${COLORS.red}">^ capitalize</text>
    <text x="90" y="70" style="font-size:11px" fill="${COLORS.text}">It was realy good</text>
    <text x="152" y="68" style="font-size:9px;font-weight:bold" fill="${COLORS.red}">ll</text>
    <text x="90" y="82" style="font-size:9px" fill="${COLORS.red}">^ spelling: really</text>
    <text x="30" y="100" style="font-size:11px" fill="${COLORS.text}">She walked slow home</text>
    <text x="150" y="108" style="font-size:9px" fill="${COLORS.secondary}">slowly ←</text>
    <!-- Checklist -->
    <text x="320" y="35" class="formula">Edit for:</text>
    <text x="320" y="55" class="note">☐ Spelling</text>
    <text x="320" y="73" class="note">☐ Punctuation</text>
    <text x="320" y="91" class="note">☐ Grammar</text>
    <text x="320" y="109" class="note">☐ Clarity</text>
    <!-- Process -->
    <text x="20" y="145" class="formula">Editing Process: CUPS</text>
    <text x="20" y="167" class="note">C = Capitals | U = Understanding (makes sense?) | P = Punctuation | S = Spelling</text>
    <text x="20" y="190" class="note">Read aloud to catch errors. Check one type at a time.</text>
  `);
}
