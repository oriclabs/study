/**
 * In-app question generator — runs entirely in the browser.
 * Generates randomized questions from templates for any subject.
 * Saves to IndexedDB via ContentPackManager.
 *
 * Template-based: each template is a function that produces a unique
 * question by randomizing numbers, words, and options.
 */

import type { PracticeQuestion, ContentPackManager } from './content-packs.js';

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]!; }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function nearOpts(correct: number, count = 3): string[] {
  const opts = new Set([String(correct)]);
  while (opts.size < count + 1) {
    const off = rand(1, Math.max(3, Math.ceil(Math.abs(correct) * 0.3)));
    opts.add(String(correct + (Math.random() > 0.5 ? off : -off)));
  }
  return shuffle([...opts]);
}

type QTemplate = (id: string, style: string, diff: number) => PracticeQuestion;

// ============================================================
// MATH TEMPLATES
// ============================================================
const mathTemplates: QTemplate[] = [
  // Arithmetic
  (id, style, diff) => {
    const a = rand(5, 50); const b = rand(2, 20); const c = rand(2, 8);
    const ans = a + b * c;
    return { id, style, difficulty: diff, topic: 'Arithmetic', question: `Calculate: ${a} + ${b} × ${c}`,
      options: nearOpts(ans), answer: String(ans), solutionSteps: [`BODMAS: ${b} × ${c} = ${b*c}`, `${a} + ${b*c} = ${ans}`] };
  },
  // Percentages
  (id, style, diff) => {
    const pct = pick([10, 15, 20, 25, 30, 40, 50, 75]); const base = rand(4, 30) * 10;
    const ans = base * pct / 100;
    return { id, style, difficulty: diff, topic: 'Percentages', question: `What is ${pct}% of ${base}?`,
      options: nearOpts(ans), answer: String(ans), solutionSteps: [`${pct}% of ${base} = ${base} × ${pct}/100 = ${ans}`] };
  },
  // Discount
  (id, style, diff) => {
    const orig = rand(4, 25) * 10; const disc = pick([10, 15, 20, 25, 30, 40]);
    const sale = orig * (100 - disc) / 100;
    return { id, style, difficulty: diff, topic: 'Percentages', question: `A $${orig} item is ${disc}% off. Sale price?`,
      options: nearOpts(sale).map(v => `$${v}`), answer: `$${sale}`,
      solutionSteps: [`$${orig} × ${(100-disc)/100} = $${sale}`] };
  },
  // Linear equation
  (id, style, diff) => {
    const a = rand(2, 9); const x = rand(1, 15); const b = rand(1, 20);
    const rhs = a * x + b;
    return { id, style, difficulty: diff, topic: 'Linear Equations', question: `Solve: ${a}x + ${b} = ${rhs}`,
      options: nearOpts(x).map(v => `x = ${v}`), answer: `x = ${x}`,
      solutionSteps: [`${a}x = ${rhs} - ${b} = ${rhs-b}`, `x = ${(rhs-b)}/${a} = ${x}`] };
  },
  // Two-step equation
  (id, style, diff) => {
    const a = rand(2, 6); const b = rand(2, 6); const x = rand(1, 10);
    const rhs = a * (x + b);
    return { id, style, difficulty: diff, topic: 'Linear Equations', question: `Solve: ${a}(x + ${b}) = ${rhs}`,
      options: nearOpts(x).map(v => `x = ${v}`), answer: `x = ${x}`,
      solutionSteps: [`${a}x + ${a*b} = ${rhs}`, `${a}x = ${rhs - a*b}`, `x = ${x}`] };
  },
  // Quadratic
  (id, style, diff) => {
    const r1 = rand(1, 9); const r2 = rand(r1, 12);
    const b = r1 + r2; const c = r1 * r2;
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Quadratics', question: `Solve: x² − ${b}x + ${c} = 0`,
      options: shuffle([`x = ${r1}, ${r2}`, `x = ${-r1}, ${-r2}`, `x = ${r1+1}, ${r2-1}`, `x = ${r1-1}, ${r2+1}`]),
      answer: `x = ${r1}, ${r2}`, solutionSteps: [`Factors of ${c} that add to ${b}: ${r1} and ${r2}`, `(x−${r1})(x−${r2}) = 0`] };
  },
  // Pythagoras
  (id, style, diff) => {
    const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[7,24,25],[20,21,29]];
    const [a, b, c] = pick(triples); const k = rand(1, 3);
    return { id, style, difficulty: diff, topic: 'Pythagoras', question: `Right triangle: legs ${a*k} and ${b*k}. Hypotenuse?`,
      options: nearOpts(c*k), answer: String(c*k),
      solutionSteps: [`c² = ${a*k}² + ${b*k}² = ${(a*k)**2} + ${(b*k)**2} = ${(c*k)**2}`, `c = ${c*k}`] };
  },
  // Circle area
  (id, style, diff) => {
    const r = rand(2, 15); const area = Math.round(Math.PI * r * r * 10) / 10;
    return { id, style, difficulty: diff, topic: 'Area', question: `Circle radius ${r} cm. Area? (1 d.p.)`,
      options: nearOpts(area).map(v => `${v} cm²`), answer: `${area} cm²`,
      solutionSteps: [`A = πr² = π × ${r}² = ${area} cm²`] };
  },
  // Volume
  (id, style, diff) => {
    const l = rand(3, 15); const w = rand(3, 12); const h = rand(2, 10);
    const v = l * w * h;
    return { id, style, difficulty: diff, topic: 'Volume', question: `Box: ${l} × ${w} × ${h} cm. Volume?`,
      options: nearOpts(v).map(v => `${v} cm³`), answer: `${v} cm³`,
      solutionSteps: [`V = ${l} × ${w} × ${h} = ${v} cm³`] };
  },
  // Angles
  (id, style, diff) => {
    const a1 = rand(25, 75); const a2 = rand(25, 75); const a3 = 180 - a1 - a2;
    if (a3 <= 5) return { id, style, difficulty: diff, topic: 'Angles', question: `Triangle angles: ${a1}° and ${80}°. Third?`,
      options: nearOpts(180-a1-80).map(v => `${v}°`), answer: `${180-a1-80}°`, solutionSteps: [`180 - ${a1} - 80 = ${180-a1-80}°`] };
    return { id, style, difficulty: diff, topic: 'Angles', question: `Triangle angles: ${a1}° and ${a2}°. Third?`,
      options: nearOpts(a3).map(v => `${v}°`), answer: `${a3}°`, solutionSteps: [`180 - ${a1} - ${a2} = ${a3}°`] };
  },
  // Sequence nth term
  (id, style, diff) => {
    const a1 = rand(1, 10); const d = rand(2, 8); const n = rand(10, 30);
    const ans = a1 + (n - 1) * d;
    return { id, style, difficulty: diff, topic: 'Sequences', question: `Arithmetic: first = ${a1}, d = ${d}. ${n}th term?`,
      options: nearOpts(ans), answer: String(ans), solutionSteps: [`a = ${a1} + (${n}-1)×${d} = ${ans}`] };
  },
  // Ratio sharing
  (id, style, diff) => {
    const a = rand(1, 5); const b = rand(1, 5); const total = rand(5, 20) * (a + b);
    const larger = total * Math.max(a, b) / (a + b);
    return { id, style, difficulty: diff, topic: 'Ratios', question: `Share $${total} in ratio ${a}:${b}. Larger share?`,
      options: nearOpts(larger).map(v => `$${v}`), answer: `$${larger}`,
      solutionSteps: [`Parts = ${a+b}`, `Larger = $${total} × ${Math.max(a,b)}/${a+b} = $${larger}`] };
  },
  // Statistics mean
  (id, style, diff) => {
    const data = Array.from({ length: 5 }, () => rand(10, 50));
    const mean = Math.round(data.reduce((s, v) => s + v, 0) / 5 * 10) / 10;
    return { id, style, difficulty: diff, topic: 'Statistics', question: `Data: ${data.join(', ')}. Mean?`,
      options: nearOpts(mean), answer: String(mean),
      solutionSteps: [`Sum = ${data.reduce((s,v)=>s+v,0)}`, `Mean = ${data.reduce((s,v)=>s+v,0)}/5 = ${mean}`] };
  },
  // Probability
  (id, style, diff) => {
    const r = rand(2, 8); const b = rand(2, 8); const total = r + b;
    return { id, style, difficulty: diff, topic: 'Probability', question: `Bag: ${r} red, ${b} blue. P(red)?`,
      options: shuffle([`${r}/${total}`, `${b}/${total}`, `${r}/${total+1}`, `1/${total}`]),
      answer: `${r}/${total}`, solutionSteps: [`P(red) = ${r}/${total}`] };
  },
  // Midpoint
  (id, style, diff) => {
    const x1 = rand(-8, 8); const y1 = rand(-8, 8); const x2 = rand(-8, 8); const y2 = rand(-8, 8);
    const mx = (x1+x2)/2; const my = (y1+y2)/2;
    return { id, style, difficulty: diff, topic: 'Coordinate Geometry', question: `Midpoint of (${x1},${y1}) and (${x2},${y2})?`,
      options: shuffle([`(${mx},${my})`, `(${mx+1},${my})`, `(${mx},${my+1})`, `(${mx-1},${my-1})`]),
      answer: `(${mx},${my})`, solutionSteps: [`M = ((${x1}+${x2})/2, (${y1}+${y2})/2) = (${mx},${my})`] };
  },
  // Speed/Distance/Time
  (id, style, diff) => {
    const d = rand(5, 40) * 10; const t = pick([1, 1.5, 2, 2.5, 3, 4, 5]);
    const s = d / t;
    return { id, style, difficulty: diff, topic: 'Speed', question: `${d} km in ${t} hours. Speed?`,
      options: nearOpts(s).map(v => `${v} km/h`), answer: `${s} km/h`,
      solutionSteps: [`Speed = ${d} ÷ ${t} = ${s} km/h`] };
  },
  // === WORD PROBLEMS (long-form, exam-style) ===
  // Shopping multi-item
  (id, style, diff) => {
    const name = pick(['Emma','Liam','Zoe','Jack','Mia','Aisha','Ravi','Sophie']);
    const item1 = pick(['muffins','cupcakes','meat pies','sushi rolls']); const p1 = pick([3.5, 4, 4.5, 5]); const n1 = rand(2, 5);
    const item2 = pick(['bottles of juice','cups of coffee','smoothies','milkshakes']); const p2 = pick([4, 4.5, 5, 5.5, 6]); const n2 = rand(1, 4);
    const paid = pick([50, 20]);
    const cost = n1 * p1 + n2 * p2; const change = paid - cost;
    if (change <= 0) return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `${name} visits a bakery to buy food for a school event. They purchase 3 meat pies at $4.50 each and 2 bottles of juice at $3.50 each. ${name} pays with a $50 note. How much change should ${name} receive?`,
      options: nearOpts(29.5).map(v=>`$${v}`), answer: '$29.50',
      solutionSteps: ['Pies: 3 × $4.50 = $13.50', 'Juice: 2 × $3.50 = $7.00', 'Total = $13.50 + $7.00 = $20.50', 'Change = $50.00 − $20.50 = $29.50'] };
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `${name} visits a cafe to buy food for a group outing. They purchase ${n1} ${item1} at $${p1.toFixed(2)} each and ${n2} ${item2} at $${p2.toFixed(2)} each. ${name} pays with a $${paid} note. How much change should ${name} receive?`,
      options: nearOpts(change).map(v => `$${Number(v).toFixed(2)}`), answer: `$${change.toFixed(2)}`,
      solutionSteps: [`${item1}: ${n1} × $${p1.toFixed(2)} = $${(n1*p1).toFixed(2)}`, `${item2}: ${n2} × $${p2.toFixed(2)} = $${(n2*p2).toFixed(2)}`, `Total = $${(n1*p1).toFixed(2)} + $${(n2*p2).toFixed(2)} = $${cost.toFixed(2)}`, `Change = $${paid}.00 − $${cost.toFixed(2)} = $${change.toFixed(2)}`] };
  },
  // Age comparison
  (id, style, diff) => {
    const name1 = pick(['Tom','Sara','Ali','Priya','Marcus','Lily']); const name2 = pick(['their father','their mother','their uncle','their aunt']);
    const age = rand(8, 14); const parentAge = age + rand(22, 35); const years = rand(3, 10);
    const sumFuture = (age + years) + (parentAge + years);
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `${name1} is currently ${age} years old, and ${name2} is ${parentAge} years old. ${name1} notices that ${name2}'s age is currently more than double ${name1}'s age. In ${years} years' time, what will be the sum of their ages? Will ${name2} still be more than double ${name1}'s age?`,
      options: nearOpts(sumFuture), answer: String(sumFuture),
      solutionSteps: [`In ${years} years: ${name1} = ${age+years}, ${name2} = ${parentAge+years}`, `Sum = ${age+years} + ${parentAge+years} = ${sumFuture}`, `Double check: ${parentAge+years} vs 2×${age+years} = ${2*(age+years)}`, `${parentAge+years > 2*(age+years) ? 'Yes, still more than double' : 'No, no longer more than double'}`] };
  },
  // Journey with two legs
  (id, style, diff) => {
    const name = pick(['A family','A delivery truck','A school bus','A courier']);
    const s1 = pick([40, 50, 60, 80]); const t1 = pick([1.5, 2, 2.5]);
    const s2 = pick([30, 40, 50, 60]); const t2 = pick([1, 1.5, 2]);
    const d1 = s1 * t1; const d2 = s2 * t2;
    const totalDist = d1 + d2; const totalTime = t1 + t2;
    const avgSpeed = Math.round(totalDist / totalTime * 10) / 10;
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `${name} drives from Town A to Town B at an average speed of ${s1} km/h, taking ${t1} hours. They then continue from Town B to Town C at ${s2} km/h, taking ${t2} hours. What is the total distance travelled, and what is the average speed for the entire journey from A to C?`,
      options: shuffle([`${totalDist} km, ${avgSpeed} km/h`, `${totalDist} km, ${(s1+s2)/2} km/h`, `${d1} km, ${s1} km/h`, `${totalDist+10} km, ${avgSpeed+5} km/h`]),
      answer: `${totalDist} km, ${avgSpeed} km/h`,
      solutionSteps: [`A→B: ${s1} × ${t1} = ${d1} km`, `B→C: ${s2} × ${t2} = ${d2} km`, `Total distance = ${d1} + ${d2} = ${totalDist} km`, `Total time = ${t1} + ${t2} = ${totalTime} hours`, `Average speed = ${totalDist} ÷ ${totalTime} = ${avgSpeed} km/h`, `Note: average speed ≠ average of the two speeds`] };
  },
  // Discount then tax
  (id, style, diff) => {
    const name = pick(['Sarah','David','Mei','Jake']);
    const item = pick(['laptop','bicycle','guitar','camera','drone']);
    const orig = rand(20, 80) * 10; const disc = pick([15, 20, 25, 30]);
    const afterDisc = orig * (100 - disc) / 100;
    const tax = 10; const final = Math.round(afterDisc * (100 + tax) / 100 * 100) / 100;
    return { id, style, difficulty: 3, topic: 'Word Problems',
      question: `${name} wants to buy a ${item} that has a recommended retail price of $${orig}. The store is offering a ${disc}% discount for a weekend sale. After the discount is applied, a ${tax}% goods and services tax (GST) is added to the discounted price. What is the final price ${name} must pay?`,
      options: nearOpts(final).map(v => `$${Number(v).toFixed(2)}`), answer: `$${final.toFixed(2)}`,
      solutionSteps: [`Original price: $${orig}`, `Discount: ${disc}% of $${orig} = $${(orig * disc / 100).toFixed(2)}`, `After discount: $${orig} − $${(orig * disc / 100).toFixed(2)} = $${afterDisc.toFixed(2)}`, `GST: ${tax}% of $${afterDisc.toFixed(2)} = $${(afterDisc * tax / 100).toFixed(2)}`, `Final: $${afterDisc.toFixed(2)} + $${(afterDisc * tax / 100).toFixed(2)} = $${final.toFixed(2)}`] };
  },
  // Garden with path — detailed
  (id, style, diff) => {
    const l = rand(10, 25); const w = rand(6, 15); const path = pick([1, 1.5, 2]);
    const outer = (l + 2*path) * (w + 2*path); const inner = l * w;
    const pathArea = outer - inner; const costPerSqm = pick([12, 15, 18, 20, 25]);
    const totalCost = pathArea * costPerSqm;
    return { id, style, difficulty: 3, topic: 'Word Problems',
      question: `A rectangular garden measures ${l} metres long and ${w} metres wide. The owner wants to build a concrete path of uniform width ${path} metres around the entire garden. The concrete costs $${costPerSqm} per square metre to lay. Calculate the area of the path and the total cost of concreting the path.`,
      options: shuffle([`${pathArea} m², $${totalCost}`, `${outer} m², $${outer * costPerSqm}`, `${pathArea + 10} m², $${(pathArea + 10) * costPerSqm}`, `${inner} m², $${inner * costPerSqm}`]),
      answer: `${pathArea} m², $${totalCost}`,
      solutionSteps: [`Outer dimensions: (${l} + 2×${path}) × (${w} + 2×${path}) = ${l+2*path} × ${w+2*path} = ${outer} m²`, `Garden area: ${l} × ${w} = ${inner} m²`, `Path area: ${outer} − ${inner} = ${pathArea} m²`, `Cost: ${pathArea} × $${costPerSqm} = $${totalCost}`] };
  },
  // Workers/rate — detailed
  (id, style, diff) => {
    const w1 = rand(4, 8); const d1 = rand(6, 15);
    const w2 = rand(w1 + 2, w1 + 8);
    const d2 = Math.round(w1 * d1 / w2 * 10) / 10;
    const project = pick(['painting a school building','building a fence','laying tiles in a hall','assembling furniture for a new office']);
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `A team of ${w1} workers is hired to complete the job of ${project}. Working at the same rate, they can finish the job in ${d1} days. Due to a tight deadline, the project manager decides to hire additional workers so that ${w2} workers are now on the job. If all workers work at the same rate, how many days will it now take to complete the job?`,
      options: nearOpts(d2).map(v => `${v} days`), answer: `${d2} days`,
      solutionSteps: [`Total work = ${w1} workers × ${d1} days = ${w1*d1} worker-days`, `With ${w2} workers: ${w1*d1} ÷ ${w2} = ${d2} days`, `More workers = fewer days (inverse proportion)`] };
  },
  // Mixture — detailed
  (id, style, diff) => {
    const vol1 = rand(2, 8) * 100; const pct1 = rand(10, 30);
    const vol2 = rand(2, 8) * 100; const pct2 = rand(50, 80);
    const totalVol = vol1 + vol2;
    const totalSolute = vol1 * pct1 / 100 + vol2 * pct2 / 100;
    const finalPct = Math.round(totalSolute / totalVol * 1000) / 10;
    return { id, style, difficulty: 3, topic: 'Word Problems',
      question: `A chemistry student needs to create a solution of a specific concentration for an experiment. They have ${vol1} mL of a ${pct1}% salt solution and ${vol2} mL of a ${pct2}% salt solution. They decide to mix both solutions together in a single beaker. What is the concentration of salt in the resulting mixture? Give your answer to one decimal place.`,
      options: nearOpts(finalPct).map(v => `${v}%`), answer: `${finalPct}%`,
      solutionSteps: [`Salt in first solution: ${vol1} × ${pct1}/100 = ${vol1 * pct1 / 100} mL`, `Salt in second solution: ${vol2} × ${pct2}/100 = ${vol2 * pct2 / 100} mL`, `Total salt: ${totalSolute} mL`, `Total volume: ${vol1} + ${vol2} = ${totalVol} mL`, `Concentration: ${totalSolute}/${totalVol} × 100 = ${finalPct}%`] };
  },
  // Profit/loss — multi-step
  (id, style, diff) => {
    const cost = rand(8, 40) * 10; const markup = pick([25, 30, 40, 50]); const discAfter = pick([10, 15, 20]);
    const sell = cost * (1 + markup/100); const salePrice = sell * (1 - discAfter/100);
    const profit = Math.round((salePrice - cost) * 100) / 100;
    const pctProfit = Math.round(profit / cost * 1000) / 10;
    const item = pick(['jacket','pair of shoes','handbag','watch','headphones']);
    return { id, style, difficulty: 3, topic: 'Word Problems',
      question: `A retailer purchases a ${item} from a wholesaler for $${cost}. The retailer marks up the price by ${markup}% and displays it in the store. After two weeks, the ${item} has not sold, so the retailer offers a ${discAfter}% discount on the marked-up price. At this discounted price, does the retailer still make a profit? If so, what is the profit as a percentage of the original cost?`,
      options: shuffle([`Yes, ${pctProfit}% profit`, `No, makes a loss`, `Yes, ${markup - discAfter}% profit`, `Yes, ${markup}% profit`]),
      answer: `Yes, ${pctProfit}% profit`,
      solutionSteps: [`Cost price: $${cost}`, `Marked-up price: $${cost} × ${1 + markup/100} = $${sell}`, `Discounted price: $${sell} × ${1 - discAfter/100} = $${salePrice}`, `Profit: $${salePrice} − $${cost} = $${profit}`, `Profit %: $${profit} ÷ $${cost} × 100 = ${pctProfit}%`, `Note: ${markup}% up then ${discAfter}% down ≠ ${markup - discAfter}% (common trap)`] };
  },
  // Train meeting — detailed
  (id, style, diff) => {
    const city1 = pick(['Melbourne','Sydney','Adelaide','Brisbane']); const city2 = pick(['Geelong','Ballarat','Bendigo','Wollongong']);
    const d = rand(15, 40) * 10; const s1 = pick([60, 70, 80, 90, 100]); const s2 = pick([50, 60, 70, 80, 90]);
    const combined = s1 + s2; const time = Math.round(d / combined * 100) / 100;
    const hours = Math.floor(time); const mins = Math.round((time - hours) * 60);
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `A train departs from ${city1} heading towards ${city2} at a constant speed of ${s1} km/h. At exactly the same time, another train departs from ${city2} heading towards ${city1} at a constant speed of ${s2} km/h. The distance between the two cities by rail is ${d} km. After how many hours will the two trains meet? How far from ${city1} will the meeting point be?`,
      options: shuffle([`${time} hours, ${Math.round(s1 * time)} km from ${city1}`, `${time} hours, ${Math.round(s2 * time)} km from ${city1}`, `${Math.round(d/s1 * 10)/10} hours, ${d/2} km from ${city1}`, `${time + 0.5} hours, ${Math.round(s1 * (time+0.5))} km from ${city1}`]),
      answer: `${time} hours, ${Math.round(s1 * time)} km from ${city1}`,
      solutionSteps: [`Trains approach each other: combined speed = ${s1} + ${s2} = ${combined} km/h`, `Time to meet: ${d} ÷ ${combined} = ${time} hours (${hours}h ${mins}min)`, `Distance from ${city1}: ${s1} × ${time} = ${Math.round(s1 * time)} km`, `Distance from ${city2}: ${s2} × ${time} = ${Math.round(s2 * time)} km`, `Check: ${Math.round(s1 * time)} + ${Math.round(s2 * time)} ≈ ${d} km ✓`] };
  },
  // Swimming pool filling
  (id, style, diff) => {
    const h1 = rand(4, 10); const h2 = rand(h1 + 2, h1 + 8);
    const combined = Math.round(h1 * h2 / (h1 + h2) * 10) / 10;
    return { id, style, difficulty: 3, topic: 'Word Problems',
      question: `A swimming pool can be filled by Pipe A alone in ${h1} hours, or by Pipe B alone in ${h2} hours. If both pipes are turned on at the same time, how long will it take to fill the pool? Give your answer to one decimal place.`,
      options: nearOpts(combined).map(v => `${v} hours`), answer: `${combined} hours`,
      solutionSteps: [`Rate of Pipe A: 1/${h1} pool per hour`, `Rate of Pipe B: 1/${h2} pool per hour`, `Combined rate: 1/${h1} + 1/${h2} = (${h2} + ${h1})/(${h1} × ${h2}) = ${h1+h2}/${h1*h2}`, `Time = ${h1*h2}/${h1+h2} = ${combined} hours`] };
  },
];

// ============================================================
// QUANTITATIVE TEMPLATES
// ============================================================
const quantTemplates: QTemplate[] = [
  // Number sequence (additive)
  (id, style, diff) => {
    const start = rand(1, 20); const d = rand(2, 9);
    const seq = Array.from({length: 5}, (_, i) => start + i * d);
    const ans = start + 5 * d;
    return { id, style, difficulty: diff, topic: 'Sequences', question: `Next: ${seq.join(', ')}, ?`,
      options: nearOpts(ans), answer: String(ans), solutionSteps: [`+${d} each time. ${seq[4]} + ${d} = ${ans}`] };
  },
  // Number sequence (multiplicative)
  (id, style, diff) => {
    const start = rand(1, 5); const r = pick([2, 3]);
    const seq = Array.from({length: 5}, (_, i) => start * Math.pow(r, i));
    const ans = start * Math.pow(r, 5);
    return { id, style, difficulty: diff, topic: 'Sequences', question: `Next: ${seq.join(', ')}, ?`,
      options: nearOpts(ans), answer: String(ans), solutionSteps: [`×${r} pattern. ${seq[4]} × ${r} = ${ans}`] };
  },
  // Spatial: rotation 180
  (id, style, diff) => {
    const x = rand(-9, 9); const y = rand(-9, 9);
    return { id, style, difficulty: diff, topic: 'Spatial', question: `(${x},${y}) rotated 180° about origin?`,
      options: shuffle([`(${-x},${-y})`, `(${x},${-y})`, `(${-x},${y})`, `(${y},${x})`]),
      answer: `(${-x},${-y})`, solutionSteps: [`180°: (x,y)→(−x,−y) = (${-x},${-y})`] };
  },
  // Spatial: reflection in x-axis
  (id, style, diff) => {
    const x = rand(-9, 9); const y = rand(-9, 9);
    return { id, style, difficulty: diff, topic: 'Spatial', question: `(${x},${y}) reflected in x-axis?`,
      options: shuffle([`(${x},${-y})`, `(${-x},${y})`, `(${-x},${-y})`, `(${y},${x})`]),
      answer: `(${x},${-y})`, solutionSteps: [`x-axis: (x,y)→(x,−y) = (${x},${-y})`] };
  },
  // Paper folding
  (id, style, diff) => {
    const n = rand(1, 4); const holes = Math.pow(2, n);
    return { id, style, difficulty: diff, topic: 'Paper Folding', question: `Paper folded ${n} time(s), 1 hole punched. Holes when unfolded?`,
      options: nearOpts(holes), answer: String(holes), solutionSteps: [`${n} folds = ${holes} layers = ${holes} holes`] };
  },
  // Word problem (unit cost)
  (id, style, diff) => {
    const items = pick(['apples', 'pens', 'books', 'tickets', 'shirts']);
    const price = rand(2, 20); const count = rand(3, 12); const total = price * count;
    return { id, style, difficulty: diff, topic: 'Word Problems', question: `${count} ${items} cost $${total}. Price each?`,
      options: nearOpts(price).map(v => `$${v}`), answer: `$${price}`,
      solutionSteps: [`$${total} ÷ ${count} = $${price}`] };
  },
  // Mental math shortcuts
  (id, style, diff) => {
    const a = rand(10, 99); const b = pick([5, 11, 25]); const ans = a * b;
    return { id, style, difficulty: diff, topic: 'Mental Math', question: `${a} × ${b} = ?`,
      options: nearOpts(ans), answer: String(ans),
      solutionSteps: b === 25 ? [`${a}÷4×100 = ${ans}`] : b === 11 ? [`${a}×11 = ${ans}`] : [`${a}×5 = ${a}÷2×10 = ${ans}`] };
  },
  // Venn diagram
  (id, style, diff) => {
    const total = rand(30, 60); const a = rand(15, total-10); const b = rand(10, total-10);
    const both = rand(3, Math.min(a, b) - 2); const neither = total - (a + b - both);
    if (neither < 0) return { id, style, difficulty: diff, topic: 'Venn Diagrams',
      question: `40 students: 22 play cricket, 18 soccer, 7 both. Neither?`,
      options: nearOpts(7), answer: '7', solutionSteps: ['Either=22+18-7=33', 'Neither=40-33=7'] };
    return { id, style, difficulty: diff, topic: 'Venn Diagrams',
      question: `${total} students: ${a} play cricket, ${b} soccer, ${both} both. Neither?`,
      options: nearOpts(neither), answer: String(neither),
      solutionSteps: [`Either=${a}+${b}-${both}=${a+b-both}`, `Neither=${total}-${a+b-both}=${neither}`] };
  },
  // Data mean
  (id, style, diff) => {
    const vals = Array.from({length: 5}, () => rand(5, 40));
    const mean = Math.round(vals.reduce((s,v)=>s+v,0) / 5 * 10) / 10;
    return { id, style, difficulty: diff, topic: 'Data', question: `Data: ${vals.join(', ')}. Mean?`,
      options: nearOpts(mean), answer: String(mean),
      solutionSteps: [`Total=${vals.reduce((s,v)=>s+v,0)}`, `Mean=${vals.reduce((s,v)=>s+v,0)}/5=${mean}`] };
  },
  // Probability
  (id, style, diff) => {
    const r = rand(2, 8); const b = rand(2, 8); const g = rand(0, 4); const total = r+b+g;
    const col = pick(['red', 'blue']); const n = col === 'red' ? r : b;
    return { id, style, difficulty: diff, topic: 'Probability', question: `Bag: ${r} red, ${b} blue${g ? `, ${g} green` : ''}. P(${col})?`,
      options: shuffle([`${n}/${total}`, `${n}/${total+1}`, `${n+1}/${total}`, `${total-n}/${total}`]),
      answer: `${n}/${total}`, solutionSteps: [`P(${col}) = ${n}/${total}`] };
  },
  // Speed
  (id, style, diff) => {
    const d = rand(5, 50) * 10; const t = pick([1, 1.5, 2, 2.5, 3, 4, 5]); const s = d/t;
    return { id, style, difficulty: diff, topic: 'Speed', question: `${d} km in ${t} hours. Speed?`,
      options: nearOpts(s).map(v => `${v} km/h`), answer: `${s} km/h`, solutionSteps: [`${d}÷${t}=${s} km/h`] };
  },
  // Logic ordering
  (id, style, diff) => {
    const names = shuffle(['Alex', 'Ben', 'Cara', 'Dan', 'Eve']).slice(0, 4);
    return { id, style, difficulty: diff, topic: 'Logic',
      question: `${names[0]} is taller than ${names[1]}. ${names[1]} is taller than ${names[2]}. ${names[2]} is taller than ${names[3]}. Who is shortest?`,
      options: shuffle(names), answer: names[3]!, solutionSteps: [`Order: ${names.join(' > ')}`] };
  },
  // === QUANTITATIVE WORD PROBLEMS (long-form, exam-style) ===
  // Sharing with remainders
  (id, style, diff) => {
    const totalItems = rand(20, 60); const groups = rand(3, 7);
    const each = Math.floor(totalItems / groups); const remainder = totalItems % groups;
    const context = pick(['Year 7 students','scouts','volunteers','team members']);
    const item = pick(['books','certificates','badges','prizes','stickers']);
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `A teacher has ${totalItems} ${item} to distribute equally among ${groups} groups of ${context}. Each group receives the same number of ${item}, and any remaining ${item} are kept by the teacher. How many ${item} does each group receive, and how many does the teacher keep?`,
      options: shuffle([`${each} each, ${remainder} kept`, `${each+1} each, 0 kept`, `${each} each, ${groups} kept`, `${each-1} each, ${remainder+groups} kept`]),
      answer: `${each} each, ${remainder} kept`,
      solutionSteps: [`${totalItems} ÷ ${groups} = ${each} remainder ${remainder}`, `Each group: ${each} ${item}`, `Teacher keeps: ${remainder} ${item}`] };
  },
  // Multi-step money with context
  (id, style, diff) => {
    const name = pick(['Ella','Noah','Ruby','Oscar','Zara','Kai']);
    const weeklyPocket = rand(10, 25); const weeks = rand(3, 8);
    const itemCost = rand(40, 120); const saved = weeklyPocket * weeks;
    const shortfall = itemCost - saved;
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `${name} receives $${weeklyPocket} pocket money each week and saves all of it. After ${weeks} weeks, ${name} wants to buy a pair of headphones that costs $${itemCost}. Does ${name} have enough money? If not, how much more does ${name} need to save?`,
      options: shuffle([shortfall > 0 ? `No, needs $${shortfall} more` : `Yes, has $${-shortfall} extra`, `Yes, has $${saved} exactly`, `No, needs $${weeklyPocket} more`, `No, needs $${itemCost} more`]),
      answer: shortfall > 0 ? `No, needs $${shortfall} more` : `Yes, has $${-shortfall} extra`,
      solutionSteps: [`Saved: ${weeks} × $${weeklyPocket} = $${saved}`, `Cost: $${itemCost}`, shortfall > 0 ? `Short by: $${itemCost} − $${saved} = $${shortfall}` : `Extra: $${saved} − $${itemCost} = $${-shortfall}`] };
  },
  // Timetable/schedule
  (id, style, diff) => {
    const startH = rand(8, 10); const startM = pick([0, 15, 30]);
    const lessonMins = pick([45, 50, 55]); const breakMins = pick([10, 15, 20]); const lessons = rand(3, 5);
    const totalMins = lessons * lessonMins + (lessons - 1) * breakMins;
    const endH = startH + Math.floor((startM + totalMins) / 60);
    const endM = (startM + totalMins) % 60;
    return { id, style, difficulty: Math.max(diff, 2), topic: 'Word Problems',
      question: `A school morning session starts at ${startH}:${String(startM).padStart(2, '0')} am. There are ${lessons} lessons of ${lessonMins} minutes each, with a ${breakMins}-minute break between each lesson. At what time does the morning session end? How many minutes long is the entire morning session including breaks?`,
      options: shuffle([`${endH > 12 ? endH-12 : endH}:${String(endM).padStart(2,'0')} ${endH >= 12 ? 'pm' : 'am'}, ${totalMins} minutes`, `${endH > 12 ? endH-12 : endH}:${String(endM).padStart(2,'0')} ${endH >= 12 ? 'pm' : 'am'}, ${lessons * lessonMins} minutes`, `${endH > 12 ? endH-12+1 : endH+1}:${String(endM).padStart(2,'0')} ${endH >= 12 ? 'pm' : 'am'}, ${totalMins} minutes`, `${endH > 12 ? endH-12 : endH}:${String((endM+15)%60).padStart(2,'0')} ${endH >= 12 ? 'pm' : 'am'}, ${totalMins+15} minutes`]),
      answer: `${endH > 12 ? endH-12 : endH}:${String(endM).padStart(2,'0')} ${endH >= 12 ? 'pm' : 'am'}, ${totalMins} minutes`,
      solutionSteps: [`Lesson time: ${lessons} × ${lessonMins} = ${lessons * lessonMins} min`, `Break time: ${lessons - 1} × ${breakMins} = ${(lessons-1) * breakMins} min`, `Total: ${lessons * lessonMins} + ${(lessons-1) * breakMins} = ${totalMins} min`, `Start ${startH}:${String(startM).padStart(2,'0')} + ${totalMins} min = ${endH > 12 ? endH-12 : endH}:${String(endM).padStart(2,'0')} ${endH >= 12 ? 'pm' : 'am'}`] };
  },
  // Percentage increase then decrease (trap)
  (id, style, diff) => {
    const original = rand(10, 50) * 10; const up = pick([10, 20, 25, 30, 40]); const down = pick([10, 20, 25, 30]);
    const after = Math.round(original * (1 + up/100) * (1 - down/100) * 100) / 100;
    const change = Math.round((after - original) * 100) / 100;
    const pctChange = Math.round(change / original * 1000) / 10;
    return { id, style, difficulty: 3, topic: 'Word Problems',
      question: `The value of a collectible card was $${original} at the start of the year. During the first six months, its value increased by ${up}%. During the second six months, its value decreased by ${down}%. What is the value of the card at the end of the year? Is it worth more or less than at the start?`,
      options: shuffle([`$${after} (${change >= 0 ? 'more' : 'less'})`, `$${original} (same)`, `$${original * (up - down) / 100 + original} (${up > down ? 'more' : 'less'})`, `$${Math.round(original * up / 100)} (more)`]),
      answer: `$${after} (${change >= 0 ? 'more' : 'less'})`,
      solutionSteps: [`After ${up}% increase: $${original} × ${1 + up/100} = $${(original * (1 + up/100)).toFixed(2)}`, `After ${down}% decrease: $${(original * (1 + up/100)).toFixed(2)} × ${1 - down/100} = $${after}`, `Change: $${after} − $${original} = $${change} (${change >= 0 ? 'increase' : 'decrease'} of ${Math.abs(pctChange)}%)`, `Trap: ${up}% up then ${down}% down ≠ ${up - down}% change`] };
  },
];

// ============================================================
// VERBAL TEMPLATES
// ============================================================
const analogyPairs = [
  ['HOT','COLD','TALL','SHORT'], ['BIRD','FLOCK','FISH','SCHOOL'], ['PEN','WRITE','KNIFE','CUT'],
  ['PUPPY','DOG','KITTEN','CAT'], ['PAGE','BOOK','BRICK','WALL'], ['RAIN','FLOOD','SPARK','FIRE'],
  ['CAPTAIN','SHIP','PILOT','PLANE'], ['WOOL','SHEEP','MILK','COW'], ['GLOVE','HAND','SHOE','FOOT'],
  ['ARTIST','PAINT','SCULPTOR','CHISEL'], ['BARK','DOG','MEOW','CAT'], ['DOCTOR','HOSPITAL','TEACHER','SCHOOL'],
  ['KING','QUEEN','PRINCE','PRINCESS'], ['OCEAN','WAVE','DESERT','DUNE'],
  ['HAPPY','ELATED','SAD','DEVASTATED'], ['HUNGRY','EAT','THIRSTY','DRINK'],
  ['TELESCOPE','STAR','MICROSCOPE','CELL'], ['ISLAND','WATER','OASIS','DESERT'],
  ['HAMMER','NAIL','SCREWDRIVER','SCREW'], ['CHAPTER','BOOK','VERSE','POEM'],
];
const distractors = ['MOUNTAIN','RIVER','CLOUD','STONE','FOREST','LAMP','TRAIN','PAPER','BRIDGE','WINDOW','GARDEN','WHEEL','TABLE','CHAIR','OCEAN'];
const oddSets = [
  { w: ['OAK','ELM','PINE','DAISY'], odd: 'DAISY', r: 'Trees vs flower' },
  { w: ['CRIMSON','SCARLET','MAROON','AZURE'], odd: 'AZURE', r: 'Reds vs blue' },
  { w: ['GUITAR','VIOLIN','DRUM','CELLO'], odd: 'DRUM', r: 'String vs percussion' },
  { w: ['MERCURY','VENUS','EARTH','MOON'], odd: 'MOON', r: 'Planets vs moon' },
  { w: ['SURGEON','DENTIST','ARCHITECT','NURSE'], odd: 'ARCHITECT', r: 'Medical vs not' },
  { w: ['ANGER','JOY','FEAR','TABLE'], odd: 'TABLE', r: 'Emotions vs object' },
  { w: ['COPPER','SILVER','GOLD','DIAMOND'], odd: 'DIAMOND', r: 'Metals vs gem' },
  { w: ['LION','TIGER','LEOPARD','WOLF'], odd: 'WOLF', r: 'Big cats vs canine' },
  { w: ['WHISPER','SHOUT','MURMUR','SPRINT'], odd: 'SPRINT', r: 'Speaking vs running' },
  { w: ['SWIM','DIVE','SURF','CLIMB'], odd: 'CLIMB', r: 'Water vs land' },
  { w: ['PIANO','FLUTE','TRUMPET','CLARINET'], odd: 'PIANO', r: 'Wind vs keyboard' },
  { w: ['SQUARE','CIRCLE','PENTAGON','TRIANGLE'], odd: 'CIRCLE', r: 'Polygons vs curve' },
  { w: ['SONNET','HAIKU','LIMERICK','NOVEL'], odd: 'NOVEL', r: 'Poetry vs prose' },
];
const sentenceTemplates = [
  { q: 'The weather was so ___ that we stayed indoors.', opts: ['beautiful','dreadful','warm','calm'], ans: 'dreadful' },
  { q: 'Despite her ___ efforts, the project failed.', opts: ['lazy','tireless','careless','brief'], ans: 'tireless' },
  { q: 'The abandoned house looked ___ in the moonlight.', opts: ['inviting','eerie','modern','bright'], ans: 'eerie' },
  { q: 'Her ___ speech inspired the audience.', opts: ['boring','eloquent','quiet','short'], ans: 'eloquent' },
  { q: 'After the hike, the ___ travelers rested.', opts: ['energetic','weary','excited','young'], ans: 'weary' },
  { q: 'His ___ behaviour earned respect.', opts: ['rude','exemplary','strange','ordinary'], ans: 'exemplary' },
  { q: 'The scientist made a ___ discovery.', opts: ['trivial','groundbreaking','minor','obvious'], ans: 'groundbreaking' },
  { q: 'The ___ child refused to share.', opts: ['generous','selfish','happy','quiet'], ans: 'selfish' },
  { q: 'The evidence was ___ to prove innocence.', opts: ['sufficient','insufficient','heavy','light'], ans: 'insufficient' },
  { q: 'The teacher praised the ___ answer.', opts: ['wrong','insightful','brief','loud'], ans: 'insightful' },
];
const vocabWords = [
  { w: 'benevolent', m: 'Kind and generous', d: ['Cruel','Intelligent','Cautious'] },
  { w: 'meticulous', m: 'Very careful and precise', d: ['Careless','Fast','Lazy'] },
  { w: 'ambiguous', m: 'Open to interpretation', d: ['Clear','Loud','Simple'] },
  { w: 'resilient', m: 'Able to recover quickly', d: ['Fragile','Slow','Angry'] },
  { w: 'eloquent', m: 'Fluent and persuasive', d: ['Silent','Confused','Shy'] },
  { w: 'pragmatic', m: 'Practical and realistic', d: ['Idealistic','Emotional','Lazy'] },
  { w: 'ominous', m: 'Threatening or worrying', d: ['Cheerful','Calm','Bright'] },
  { w: 'ephemeral', m: 'Short-lived', d: ['Permanent','Heavy','Dark'] },
  { w: 'tenacious', m: 'Persistent and determined', d: ['Weak','Gentle','Quick'] },
  { w: 'candid', m: 'Honest and direct', d: ['Dishonest','Quiet','Angry'] },
  { w: 'diligent', m: 'Hardworking and careful', d: ['Lazy','Fast','Loud'] },
  { w: 'obscure', m: 'Not well known', d: ['Famous','Bright','Large'] },
  { w: 'vivid', m: 'Bright and clear', d: ['Dull','Quiet','Small'] },
  { w: 'arduous', m: 'Difficult and tiring', d: ['Easy','Fun','Quick'] },
  { w: 'pristine', m: 'In original condition', d: ['Damaged','Old','Dirty'] },
];

const verbalTemplates: QTemplate[] = [
  // Analogy
  (id, style, diff) => {
    const p = pick(analogyPairs);
    const wrongs = shuffle(distractors).slice(0, 3);
    return { id, style, difficulty: diff, topic: 'Analogies',
      question: `${p[0]} is to ${p[1]} as ${p[2]} is to`,
      options: shuffle([p[3]!, ...wrongs]), answer: p[3]! };
  },
  // Reverse analogy
  (id, style, diff) => {
    const p = pick(analogyPairs);
    const wrongs = shuffle(distractors).slice(0, 3);
    return { id, style, difficulty: diff, topic: 'Analogies',
      question: `${p[2]} is to ${p[3]} as ${p[0]} is to`,
      options: shuffle([p[1]!, ...wrongs]), answer: p[1]! };
  },
  // Odd one out
  (id, style, diff) => {
    const s = pick(oddSets);
    return { id, style, difficulty: diff, topic: 'Odd One Out',
      question: `Which doesn't belong: ${shuffle(s.w).join(', ')}?`,
      options: shuffle(s.w), answer: s.odd, explanation: s.r };
  },
  // Sentence completion
  (id, style, diff) => {
    const t = pick(sentenceTemplates);
    return { id, style, difficulty: diff, topic: 'Sentence Completion',
      question: t.q, options: shuffle(t.opts), answer: t.ans };
  },
  // Vocabulary
  (id, style, diff) => {
    const v = pick(vocabWords);
    return { id, style, difficulty: diff, topic: 'Vocabulary',
      question: `What does "${v.w}" mean?`, options: shuffle([v.m, ...v.d]), answer: v.m };
  },
  // Figurative language
  (id, style, diff) => {
    const types = [
      { q: '"The wind whispered through the trees."', a: 'Personification', d: ['Simile','Metaphor','Hyperbole'] },
      { q: '"She was as brave as a lion."', a: 'Simile', d: ['Metaphor','Personification','Hyperbole'] },
      { q: '"I\'ve told you a million times!"', a: 'Hyperbole', d: ['Simile','Metaphor','Personification'] },
      { q: '"Time is money."', a: 'Metaphor', d: ['Simile','Hyperbole','Personification'] },
      { q: '"The stars danced in the sky."', a: 'Personification', d: ['Simile','Metaphor','Hyperbole'] },
      { q: '"He runs like the wind."', a: 'Simile', d: ['Metaphor','Personification','Alliteration'] },
      { q: '"Life is a journey."', a: 'Metaphor', d: ['Simile','Personification','Hyperbole'] },
    ];
    const t = pick(types);
    return { id, style, difficulty: diff, topic: 'Figurative Language',
      question: `Identify: ${t.q}`, options: shuffle([t.a, ...t.d]), answer: t.a };
  },
];

// ============================================================
// CANONICAL TOPIC ID MAP — display label → dot-namespaced ID
// ============================================================
const topicIdMap: Record<string, string> = {
  // Math
  'Arithmetic': 'number.operations',
  'Percentages': 'fractions.percentages',
  'Linear Equations': 'algebra.linear-equations',
  'Quadratics': 'algebra.quadratics',
  'Pythagoras': 'geometry.pythagoras',
  'Area': 'measurement.area',
  'Volume': 'measurement.volume',
  'Angles': 'geometry.angles',
  'Sequences': 'patterns.sequences',
  'Ratios': 'ratio.ratios',
  'Statistics': 'statistics.statistics',
  'Probability': 'probability.probability',
  'Coordinate Geometry': 'geometry.coordinate',
  'Speed': 'ratio.rates',
  'Word Problems': 'problem-solving.word-problems',
  'Mental Math': 'number.operations',
  'Venn Diagrams': 'statistics.venn-diagrams',
  'Data': 'statistics.data',
  // Quantitative
  'Spatial': 'quantitative.spatial',
  'Paper Folding': 'quantitative.paper-folding',
  'Logic': 'quantitative.logic',
  // Verbal
  'Analogies': 'verbal.analogies',
  'Odd One Out': 'verbal.odd-one-out',
  'Sentence Completion': 'verbal.sentence-completion',
  'Vocabulary': 'verbal.vocabulary',
  'Figurative Language': 'verbal.figurative-language',
};

// ============================================================
// GENERATOR ENGINE
// ============================================================

export interface GeneratorConfig {
  subject: 'math' | 'quantitative' | 'verbal' | 'reading';
  targetUnique: number;
  difficulty: 'balanced' | 'hard' | 'easy';
  style: 'acer' | 'edutest' | 'mixed';
}

function getDifficultyDist(mode: string): [number, number, number] {
  if (mode === 'hard') return [0.1, 0.4, 0.5];
  if (mode === 'easy') return [0.5, 0.4, 0.1];
  return [0.3, 0.5, 0.2]; // balanced
}

function getStyle(mode: string): string {
  if (mode === 'mixed') return pick(['acer', 'edutest', 'both']);
  return mode;
}

export function generateQuestions(config: GeneratorConfig): PracticeQuestion[] {
  const templates = config.subject === 'math' ? mathTemplates
    : config.subject === 'quantitative' ? quantTemplates
    : verbalTemplates; // verbal also used for reading as base

  const [pEasy, pMed, pHard] = getDifficultyDist(config.difficulty);
  const questions: PracticeQuestion[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  const maxAttempts = config.targetUnique * 5;

  while (questions.length < config.targetUnique && attempts < maxAttempts) {
    attempts++;
    const template = pick(templates);
    const r = Math.random();
    const diff = r < pEasy ? 1 : r < pEasy + pMed ? 2 : 3;
    const style = getStyle(config.style);
    const id = `GEN-${config.subject[0]!.toUpperCase()}${questions.length + 1}`;

    const q = template(id, style, diff);

    // Attach canonical topic_id from mapping
    if (q.topic && !q.topic_id) {
      q.topic_id = topicIdMap[q.topic];
    }

    // Dedup by question text
    const key = q.question.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) continue;
    seen.add(key);

    questions.push(q);
  }

  return questions;
}

/** Save generated questions to a pack in IndexedDB */
export async function saveGeneratedQuestions(
  packManager: ContentPackManager,
  packId: string,
  subjectId: string,
  questions: PracticeQuestion[],
  append: boolean,
): Promise<number> {
  const existing = append ? await packManager.loadPractice(packId, subjectId) : [];
  const existingKeys = new Set(existing.map(q => q.question.toLowerCase().trim()));

  // Filter out duplicates against existing
  const newQs = questions.filter(q => !existingKeys.has(q.question.toLowerCase().trim()));

  const merged = [...existing, ...newQs];
  // Store directly via storage — the pack manager's storage layout
  // pack.practice.<packId>.<subjectId>
  const storage = (packManager as any).storage;
  await storage.set(`pack.practice.${packId}.${subjectId}`, merged);

  // Update pack meta subject practice count
  const meta = await packManager.getPack(packId);
  if (meta) {
    const subj = meta.subjects.find(s => s.id === subjectId);
    if (subj) {
      subj.practiceCount = merged.length;
      await storage.set(`pack.meta.${packId}`, meta);
    }
  }

  return newQs.length;
}
