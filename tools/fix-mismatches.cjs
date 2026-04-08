const fs = require("fs");
const d = JSON.parse(fs.readFileSync("./packs/vic-selective-exam.json", "utf8"));

for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      for (const tip of (t.tips_and_tricks || [])) {
        if (typeof tip !== "object") continue;
        const exp = (tip.explanation || "").toLowerCase();
        const tipT = (tip.tip || "").toLowerCase();
        if (!exp.includes("gradient")) continue;
        if (tipT.includes("gradient") || tipT.includes("slope")) continue;

        if (tipT.includes("sphere") || tipT.includes("volume") && tipT.includes("surface")) {
          tip.explanation = "These formulas are unique to spheres and must be memorised.";
          tip.example = "Sphere r=3: V = 4/3 x pi x 27 = 36pi, SA = 4 x pi x 9 = 36pi";
        } else if (tipT.includes("reflection") || tipT.includes("rotation") || tipT.includes("coordinate rule")) {
          tip.explanation = "Memorise: reflection in x-axis: (x,y) becomes (x,-y), in y-axis: (-x,y), rotation 90 clockwise: (y,-x).";
          tip.example = "Point (3,4) reflected in x-axis gives (3,-4). Rotated 90 clockwise gives (4,-3).";
        } else if (tipT.includes("soh") || tipT.includes("cah") || tipT.includes("toa")) {
          tip.explanation = "SOH-CAH-TOA: Sin=Opposite/Hypotenuse, Cos=Adjacent/Hypotenuse, Tan=Opposite/Adjacent.";
          tip.example = "Right triangle: opposite=3, hypotenuse=5. sin = 3/5 = 0.6";
        } else if (tipT.includes("sin 30") || tipT.includes("cos 60") || tipT.includes("tan 45")) {
          tip.explanation = "These exact values appear in nearly every trig exam question. Know them by heart.";
          tip.example = "sin 30 = 0.5, cos 60 = 0.5, tan 45 = 1, sin 60 = sqrt(3)/2";
        } else if (tipT.includes("benchmark") || tipT.includes("1/4=0.25")) {
          tip.explanation = "Knowing common fraction-decimal equivalents lets you compare and convert instantly.";
          tip.example = "Is 0.4 bigger than 1/3? 1/3 = 0.333, so yes 0.4 > 0.333";
        } else if (tipT.includes("square") || tipT.includes("15")) {
          tip.explanation = "Knowing perfect squares up to 225 helps with factoring, surds, and mental estimation.";
          tip.example = "12 squared = 144, 13 squared = 169, 14 squared = 196, 15 squared = 225";
        } else if (tipT.includes("cube")) {
          tip.explanation = "Perfect cubes come up in volume problems and simplifying cube roots.";
          tip.example = "2 cubed = 8, 3 cubed = 27, 4 cubed = 64, 5 cubed = 125";
        } else {
          tip.explanation = "Memorise this — it comes up frequently in exam questions.";
        }
        console.log("Fixed:", tip.tip.substring(0, 50));
      }
    }
  }
}

fs.writeFileSync("./packs/vic-selective-exam.json", JSON.stringify(d, null, 2));
console.log("Done");
