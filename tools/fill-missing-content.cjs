/**
 * fill-missing-content.cjs
 *
 * Fills missing concept_explanation, identification_cues, common_mistakes,
 * and related_topics for every topic in vic-selective-exam.json.
 *
 * Only adds fields that are missing — never overwrites existing content.
 */

const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');

// ─── Content database keyed by subject → topic title ────────────────────────

const CONTENT = {
  // ══════════════════════════════════════════════════════════════════════════
  // MATH (60 topics)
  // ══════════════════════════════════════════════════════════════════════════
  math: {
    "Types of Numbers": {
      concept_explanation: "Numbers are classified into sets such as natural, whole, integer, rational, irrational, and real. Understanding these categories helps you determine which operations and properties apply to different numbers.",
      identification_cues: [
        "Question asks you to classify or identify a number type (e.g., 'Which is irrational?')",
        "Involves terms like prime, composite, rational, or integer",
        "Asks whether a number belongs to a particular set"
      ],
      common_mistakes: [
        "Forgetting that 1 is neither prime nor composite",
        "Thinking √9 is irrational — it simplifies to 3, which is rational",
        "Confusing 'whole numbers' (includes 0) with 'natural numbers' (starts at 1)",
        "Not recognising that all integers are also rational numbers (e.g., 5 = 5/1)"
      ],
      related_topics: ["Factors, Multiples & Divisibility", "Fractions", "Irrational Numbers"]
    },
    "Factors, Multiples & Divisibility": {
      concept_explanation: "Factors divide exactly into a number; multiples are produced by multiplying a number by integers. HCF (highest common factor) and LCM (lowest common multiple) are essential tools for simplifying fractions and solving word problems.",
      identification_cues: [
        "Question asks for the 'largest number that divides…' (HCF) or 'smallest number divisible by…' (LCM)",
        "Involves divisibility rules or prime factorisation",
        "Word problems about grouping, tiling, or scheduling events"
      ],
      common_mistakes: [
        "Mixing up HCF and LCM — HCF uses lowest powers, LCM uses highest powers",
        "Forgetting to include 1 and the number itself when listing factors",
        "Stopping the factor tree before reaching all prime factors",
        "Not checking all divisibility rules when testing a large number"
      ],
      related_topics: ["Types of Numbers", "Fractions", "Profit, Loss & Discount"]
    },
    "Operations with Integers": {
      concept_explanation: "Integer operations include addition, subtraction, multiplication, and division with positive and negative whole numbers. Mastering sign rules and order of operations is crucial for accuracy.",
      identification_cues: [
        "Question involves negative numbers in calculations",
        "Uses terms like 'sum', 'difference', 'product', or 'quotient' with integers",
        "Requires applying sign rules (negative × negative = positive)"
      ],
      common_mistakes: [
        "Forgetting that subtracting a negative is the same as adding: 5 − (−3) = 8",
        "Getting sign wrong in multiplication: negative × negative = positive, not negative",
        "Not following BODMAS/BIDMAS order of operations",
        "Confusing −3² (= −9) with (−3)² (= 9)"
      ],
      related_topics: ["Types of Numbers", "Index Laws (Laws of Exponents)", "Fractions"]
    },
    "Terminating & Recurring Decimals, Irrational Numbers": {
      concept_explanation: "Terminating decimals end after a finite number of digits (e.g., 0.25), recurring decimals repeat a pattern forever (e.g., 0.333...), and irrational numbers have non-terminating, non-repeating decimals (e.g., √2, π).",
      identification_cues: [
        "Question asks you to classify a decimal as terminating, recurring, or irrational",
        "Involves converting fractions to decimals or vice versa",
        "Mentions numbers like √2, √3, or π"
      ],
      common_mistakes: [
        "Assuming all square roots are irrational — √4 = 2 is rational",
        "Incorrectly converting a recurring decimal to a fraction (e.g., 0.̄6 = 2/3, not 6/9 unsimplified)",
        "Thinking that a long decimal must be irrational — 0.142857142857... is rational (1/7)",
        "Rounding a recurring decimal and treating it as terminating"
      ],
      related_topics: ["Types of Numbers", "Fractions", "Decimals"]
    },
    "Fractions": {
      concept_explanation: "A fraction represents a part of a whole, written as numerator/denominator. Understanding fractions is essential for comparing quantities, performing arithmetic, and solving problems involving parts and wholes.",
      identification_cues: [
        "Question mentions parts, halves, quarters, or 'out of'",
        "Involves numerator/denominator notation like 2/3",
        "Asks to compare, order, or operate on fractional values"
      ],
      common_mistakes: [
        "Adding fractions without finding a common denominator: 1/2 + 1/3 ≠ 2/5",
        "Forgetting to simplify the final answer",
        "Confusing numerator and denominator when dividing fractions (flip the second fraction)",
        "Not converting mixed numbers to improper fractions before multiplying"
      ],
      related_topics: ["Decimals", "Percentages", "Ratios"]
    },
    "Decimals": {
      concept_explanation: "Decimals are another way to represent fractions using base-10 place value. Operations with decimals follow the same rules as whole numbers, but require careful attention to the decimal point position.",
      identification_cues: [
        "Numbers contain a decimal point (e.g., 3.14, 0.007)",
        "Question asks to convert between fractions and decimals",
        "Involves ordering or comparing numbers with different decimal places"
      ],
      common_mistakes: [
        "Misaligning decimal points when adding or subtracting",
        "Forgetting to count total decimal places when multiplying (e.g., 0.3 × 0.2 = 0.06, not 0.6)",
        "Moving the decimal the wrong direction when dividing by powers of 10",
        "Thinking 0.5 > 0.45 is wrong because 45 > 5 — must compare place by place"
      ],
      related_topics: ["Fractions", "Percentages", "Terminating & Recurring Decimals, Irrational Numbers"]
    },
    "Percentages": {
      concept_explanation: "A percentage is a fraction out of 100. Percentage calculations are used for discounts, interest, profit/loss, and comparing proportional quantities.",
      identification_cues: [
        "Question uses the % symbol or the word 'percent'",
        "Asks for increase, decrease, or comparison as a proportion",
        "Involves sale prices, tax, or 'what fraction of' problems"
      ],
      common_mistakes: [
        "Calculating percentage increase/decrease from the wrong base value",
        "Confusing 'percentage of' with 'percentage change' — 20% of 50 ≠ a 20% increase on 50",
        "Forgetting that a 50% decrease followed by a 50% increase does NOT return to the original",
        "Not converting percentage to a decimal before multiplying (25% = 0.25)"
      ],
      related_topics: ["Fractions", "Decimals", "Profit, Loss & Discount"]
    },
    "Ratios": {
      concept_explanation: "A ratio compares two or more quantities in the same units. Ratios can be simplified like fractions and are used to divide quantities into parts or compare rates.",
      identification_cues: [
        "Question uses the colon notation (e.g., 3:5) or 'in the ratio'",
        "Asks to divide or share a quantity into parts",
        "Involves scaling recipes, maps, or models"
      ],
      common_mistakes: [
        "Not simplifying ratios to lowest terms",
        "Confusing ratio order — 3:5 is not the same as 5:3",
        "Forgetting to add ratio parts to find the total when sharing a quantity",
        "Mixing up ratios and fractions — a ratio 3:5 means 3/8 and 5/8 of the total, not 3/5"
      ],
      related_topics: ["Fractions", "Direct & Inverse Proportion", "Percentages"]
    },
    "Direct & Inverse Proportion": {
      concept_explanation: "In direct proportion, as one quantity increases, the other increases at the same rate (y = kx). In inverse proportion, as one increases, the other decreases (y = k/x). The constant k is found from given values.",
      identification_cues: [
        "Question states quantities are 'directly proportional' or 'inversely proportional'",
        "Involves 'if x doubles, what happens to y?'",
        "Word problems about workers and time, speed and distance, or cost per unit"
      ],
      common_mistakes: [
        "Confusing direct and inverse proportion — more workers = less time is inverse",
        "Forgetting to find the constant k first before solving",
        "Assuming all relationships are linear (direct) when they may be inverse",
        "Not checking units match when setting up proportions"
      ],
      related_topics: ["Ratios", "Rates — Speed, Distance & Time", "Linear Equations"]
    },
    "Rates — Speed, Distance & Time": {
      concept_explanation: "Rate problems involve the relationship Speed = Distance ÷ Time. These problems require careful unit conversion and understanding of average speed versus instantaneous speed.",
      identification_cues: [
        "Question mentions km/h, m/s, or travel between locations",
        "Involves 'how long', 'how far', or 'how fast'",
        "Describes journeys with multiple legs at different speeds"
      ],
      common_mistakes: [
        "Using the wrong formula rearrangement: D = S × T, T = D ÷ S",
        "Averaging speeds incorrectly — average speed ≠ (speed1 + speed2) / 2 for equal distances",
        "Not converting units (e.g., minutes to hours, or km to metres)",
        "Forgetting rest stops count in total time but not in distance"
      ],
      related_topics: ["Direct & Inverse Proportion", "Estimation & Approximation", "Linear Equations"]
    },
    "Index Laws (Laws of Exponents)": {
      concept_explanation: "Index laws govern how to simplify expressions with powers. Key rules include: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, a⁰ = 1, and a⁻ⁿ = 1/aⁿ.",
      identification_cues: [
        "Question contains expressions with superscript numbers (powers/exponents)",
        "Asks to simplify expressions like 2³ × 2⁵ or (3²)⁴",
        "Involves negative or zero exponents"
      ],
      common_mistakes: [
        "Adding exponents when bases are different: 2³ × 3² cannot be simplified using index laws",
        "Multiplying exponents instead of adding when multiplying same bases: 2³ × 2⁵ = 2⁸, not 2¹⁵",
        "Forgetting that a⁰ = 1 for any non-zero a",
        "Confusing (2³)² = 2⁶ with 2³ × 2² = 2⁵"
      ],
      related_topics: ["Square Roots, Cube Roots & Surds", "Scientific Notation", "Logarithms"]
    },
    "Square Roots, Cube Roots & Surds": {
      concept_explanation: "A square root of n is the number that, multiplied by itself, gives n. A cube root of n is the number that, cubed, gives n. Surds are irrational roots (like √2) that cannot be simplified to a rational number.",
      identification_cues: [
        "Question contains √ or ∛ symbols",
        "Asks to simplify expressions involving roots",
        "Involves rationalising the denominator or simplifying surds like √50"
      ],
      common_mistakes: [
        "Thinking √(a + b) = √a + √b — this is WRONG",
        "Not simplifying surds fully: √50 = 5√2, not left as √50",
        "Forgetting that √(a²) = |a|, not just a (consider negative values)",
        "Incorrectly rationalising: multiply both numerator and denominator by the surd"
      ],
      related_topics: ["Index Laws (Laws of Exponents)", "Pythagoras' Theorem", "Trigonometric Ratios — sin, cos, tan"]
    },
    "Scientific Notation": {
      concept_explanation: "Scientific notation expresses very large or very small numbers as a × 10ⁿ where 1 ≤ a < 10 and n is an integer. It simplifies calculations and comparisons of extreme values.",
      identification_cues: [
        "Numbers are written as × 10ⁿ (e.g., 3.2 × 10⁵)",
        "Question involves very large (millions, billions) or very small (millionths) numbers",
        "Asks to convert between standard form and scientific notation"
      ],
      common_mistakes: [
        "Having 'a' outside the range 1 ≤ a < 10 (e.g., writing 32 × 10⁴ instead of 3.2 × 10⁵)",
        "Moving the decimal point the wrong direction when converting",
        "Adding exponents when multiplying numbers in scientific notation but forgetting to adjust 'a'",
        "Confusing positive exponents (large numbers) with negative exponents (small numbers)"
      ],
      related_topics: ["Index Laws (Laws of Exponents)", "Estimation & Approximation", "Operations with Integers"]
    },
    "Logarithms": {
      concept_explanation: "A logarithm answers the question 'what power must the base be raised to, to get this number?' — logₐ(x) = n means aⁿ = x. Logarithms are the inverse of exponentiation.",
      identification_cues: [
        "Question uses 'log' notation or asks 'what power'",
        "Involves exponential equations where the unknown is the exponent",
        "Requires converting between exponential and logarithmic form"
      ],
      common_mistakes: [
        "Confusing log(a × b) = log a + log b with log(a + b) — there is no simple rule for log(a + b)",
        "Forgetting that log₁₀(1) = 0 and log₁₀(10) = 1",
        "Applying log rules incorrectly: log(aⁿ) = n·log a, not (log a)ⁿ",
        "Not recognising that you cannot take the log of zero or a negative number"
      ],
      related_topics: ["Index Laws (Laws of Exponents)", "Scientific Notation", "Quadratic Equations"]
    },
    "Algebraic Expressions — Expanding & Factorising": {
      concept_explanation: "Expanding involves multiplying out brackets using the distributive law, while factorising is the reverse — writing an expression as a product of factors. Both skills are essential for simplifying and solving equations.",
      identification_cues: [
        "Question contains brackets with variables, e.g., 3(x + 2) or (x + 3)(x − 1)",
        "Asks to 'expand', 'factorise', or 'simplify' an algebraic expression",
        "Involves recognising special products like difference of two squares"
      ],
      common_mistakes: [
        "Forgetting to multiply every term inside the brackets: 3(x + 2) = 3x + 6, not 3x + 2",
        "Sign errors when expanding: (x − 3)(x + 2) — the −3 must multiply both terms",
        "Not recognising difference of two squares: a² − b² = (a+b)(a−b)",
        "Leaving factorisation incomplete: 2x² + 4x = 2x(x + 2), not just 2(x² + 2x)"
      ],
      related_topics: ["Linear Equations", "Quadratic Equations", "Algebraic Fractions & Making Variables the Subject"]
    },
    "Linear Equations": {
      concept_explanation: "A linear equation has variables raised to the power of 1 and graphs as a straight line. Solving means isolating the variable using inverse operations on both sides.",
      identification_cues: [
        "Equation contains x (or another variable) to the power of 1 only",
        "Asks to 'solve for x' or 'find the value of'",
        "Involves expressions like 3x + 5 = 17 or y = 2x − 1"
      ],
      common_mistakes: [
        "Not performing the same operation on both sides of the equation",
        "Sign errors when moving terms across the equals sign",
        "Forgetting to distribute when there are brackets: 2(x + 3) = 2x + 6, not 2x + 3",
        "Not checking the solution by substituting back into the original equation"
      ],
      related_topics: ["Simultaneous Equations", "Inequalities", "Key Coordinate Geometry Formulas"]
    },
    "Simultaneous Equations": {
      concept_explanation: "Simultaneous equations are two or more equations with two or more unknowns that must be solved together. Common methods are substitution (replace one variable) and elimination (add/subtract equations to remove a variable).",
      identification_cues: [
        "Question gives two equations with two unknowns (x and y)",
        "Word problem describing two relationships between two quantities",
        "Asks for values that satisfy multiple conditions at once"
      ],
      common_mistakes: [
        "Forgetting to multiply ALL terms when scaling an equation for elimination",
        "Substituting back into the wrong equation (always check in both)",
        "Sign errors when subtracting equations — distribute the negative to every term",
        "Not reading the question carefully to set up the correct pair of equations"
      ],
      related_topics: ["Linear Equations", "Algebraic Expressions — Expanding & Factorising", "Quadratic Equations"]
    },
    "Inequalities": {
      concept_explanation: "Inequalities use <, >, ≤, ≥ instead of = and represent a range of solutions rather than a single value. They are solved like equations, but the inequality sign reverses when multiplying or dividing by a negative number.",
      identification_cues: [
        "Question uses inequality symbols <, >, ≤, ≥",
        "Asks for a 'range of values' or 'which values satisfy'",
        "Involves phrases like 'at least', 'at most', 'more than', 'fewer than'"
      ],
      common_mistakes: [
        "Forgetting to reverse the inequality when multiplying or dividing by a negative number",
        "Confusing open circle (< or >) with closed circle (≤ or ≥) on number lines",
        "Not reading 'at least' as ≥ and 'at most' as ≤",
        "Incorrectly combining two inequalities (e.g., 2 < x < 5 means x is between 2 and 5 exclusive)"
      ],
      related_topics: ["Linear Equations", "Quadratic Equations", "Algebraic Expressions — Expanding & Factorising"]
    },
    "Quadratic Equations": {
      concept_explanation: "A quadratic equation has the form ax² + bx + c = 0 and can have 0, 1, or 2 solutions. Solving methods include factorising, completing the square, and the quadratic formula x = (−b ± √(b²−4ac)) / 2a.",
      identification_cues: [
        "Equation contains x² (highest power is 2)",
        "Expression can be written in the form ax² + bx + c",
        "Question asks for roots, solutions, or x-intercepts of a parabola"
      ],
      common_mistakes: [
        "Forgetting to set the equation equal to zero before factorising",
        "Dividing both sides by x and losing the x = 0 solution",
        "Sign errors in the quadratic formula, especially with the ± and the −b",
        "Not checking the discriminant (b²−4ac) to determine how many solutions exist"
      ],
      related_topics: ["Algebraic Expressions — Expanding & Factorising", "Non-Linear Graphs — Parabolas, Hyperbolas, Exponentials", "Polynomials, Factor & Remainder Theorems"]
    },
    "Non-Linear Graphs — Parabolas, Hyperbolas, Exponentials": {
      concept_explanation: "Non-linear graphs include parabolas (y = ax²), hyperbolas (y = k/x), and exponentials (y = aˣ). Each has distinctive shapes and key features like turning points, asymptotes, and intercepts.",
      identification_cues: [
        "Question shows a curved graph or asks you to sketch one",
        "Equation contains x², 1/x, or aˣ",
        "Asks about turning points, asymptotes, or end behaviour"
      ],
      common_mistakes: [
        "Confusing the shapes: parabola is U-shaped, hyperbola has two branches, exponential curves steeply",
        "Forgetting that y = −x² opens downward (reflected parabola)",
        "Not identifying asymptotes for hyperbolas and exponentials",
        "Misreading the scale or axis on a graph question"
      ],
      related_topics: ["Quadratic Equations", "Key Coordinate Geometry Formulas", "Index Laws (Laws of Exponents)"]
    },
    "Algebraic Fractions & Making Variables the Subject": {
      concept_explanation: "Algebraic fractions contain variables in the numerator or denominator and follow the same rules as numerical fractions. Making a variable the subject means rearranging a formula so that variable is isolated on one side.",
      identification_cues: [
        "Question has fractions with x or other variables in them",
        "Asks to 'simplify', 'add', or 'solve' expressions with algebraic fractions",
        "Says 'make x the subject' or 'rearrange the formula for y'"
      ],
      common_mistakes: [
        "Cancelling terms instead of factors: (x + 2)/(x + 3) cannot cancel the x's",
        "Not finding a common denominator when adding algebraic fractions",
        "Forgetting to swap operations correctly when rearranging (e.g., square root vs square)",
        "Sign errors when cross-multiplying"
      ],
      related_topics: ["Fractions", "Linear Equations", "Algebraic Expressions — Expanding & Factorising"]
    },
    "Polynomials, Factor & Remainder Theorems": {
      concept_explanation: "A polynomial is an expression with multiple terms of different powers. The Factor Theorem states that (x − a) is a factor of P(x) if P(a) = 0. The Remainder Theorem states that the remainder when dividing P(x) by (x − a) is P(a).",
      identification_cues: [
        "Question involves expressions with x³ or higher powers",
        "Asks to factorise a cubic or find remainders after polynomial division",
        "Uses terms like 'factor', 'root', or 'remainder'"
      ],
      common_mistakes: [
        "Substituting the wrong value: for factor (x − 2), substitute x = 2, not x = −2",
        "Forgetting to include all terms (including zero coefficients) in polynomial long division",
        "Not checking all possible rational roots systematically",
        "Confusing the factor theorem (remainder = 0) with the remainder theorem (remainder = P(a))"
      ],
      related_topics: ["Quadratic Equations", "Algebraic Expressions — Expanding & Factorising", "Index Laws (Laws of Exponents)"]
    },
    "Arithmetic Sequences": {
      concept_explanation: "An arithmetic sequence has a constant difference (d) between consecutive terms. The nth term formula is Tₙ = a + (n−1)d, and the sum of n terms is Sₙ = n/2 × (2a + (n−1)d) or Sₙ = n/2 × (first + last).",
      identification_cues: [
        "Sequence has a constant difference between consecutive terms (e.g., 3, 7, 11, 15...)",
        "Question asks for the 'nth term' or 'sum of the first n terms'",
        "Involves equally spaced numbers or linear patterns"
      ],
      common_mistakes: [
        "Confusing 'common difference' with 'common ratio' (that's geometric)",
        "Off-by-one errors: the nth term uses (n−1)d, not nd",
        "Using the wrong formula for the sum — Sₙ requires knowing n, a, and d (or last term)",
        "Not identifying negative common differences in decreasing sequences"
      ],
      related_topics: ["Geometric Sequences", "Other Sequence Types", "Linear Equations"]
    },
    "Geometric Sequences": {
      concept_explanation: "A geometric sequence has a constant ratio (r) between consecutive terms. The nth term formula is Tₙ = ar^(n−1), and the sum of n terms is Sₙ = a(rⁿ − 1)/(r − 1) when r ≠ 1.",
      identification_cues: [
        "Sequence has a constant ratio between consecutive terms (e.g., 2, 6, 18, 54...)",
        "Terms grow or shrink by multiplication, not addition",
        "Question involves exponential growth, doubling, or repeated percentage change"
      ],
      common_mistakes: [
        "Confusing common ratio with common difference — divide consecutive terms to find r",
        "Forgetting that the nth term uses r^(n−1), not rⁿ",
        "Not recognising alternating sequences (negative ratio, e.g., 1, −2, 4, −8...)",
        "Errors in the sum formula when r is a fraction less than 1"
      ],
      related_topics: ["Arithmetic Sequences", "Index Laws (Laws of Exponents)", "Simple & Compound Interest"]
    },
    "Other Sequence Types": {
      concept_explanation: "Beyond arithmetic and geometric, sequences can follow quadratic patterns (second differences are constant), Fibonacci-like rules (each term is the sum of the two before it), or other recursive rules. Identifying the pattern requires checking differences at multiple levels.",
      identification_cues: [
        "First differences are not constant but second differences are (quadratic sequence)",
        "Each term depends on the previous two or more terms (recursive)",
        "Pattern does not fit simple arithmetic or geometric rules"
      ],
      common_mistakes: [
        "Assuming all sequences are arithmetic or geometric without checking",
        "Not computing second or third differences when first differences vary",
        "Guessing the pattern from too few terms — always verify with multiple terms",
        "Forgetting to check whether the sequence involves squares, cubes, or triangular numbers"
      ],
      related_topics: ["Arithmetic Sequences", "Geometric Sequences", "Problem Solving Strategies"]
    },
    "Angle Properties": {
      concept_explanation: "Angle properties include rules about angles on a straight line (180°), angles at a point (360°), vertically opposite angles (equal), and angles formed by parallel lines cut by a transversal (alternate, co-interior, and corresponding angles).",
      identification_cues: [
        "Diagram shows intersecting lines, parallel lines with a transversal, or angles to find",
        "Question asks to 'find the value of x' where x is an angle",
        "Involves terms like complementary, supplementary, alternate, or corresponding"
      ],
      common_mistakes: [
        "Confusing alternate angles (Z-shape, equal) with co-interior angles (C-shape, sum to 180°)",
        "Assuming lines are parallel when not explicitly stated",
        "Forgetting that vertically opposite angles are equal",
        "Adding angles incorrectly — angles on a straight line sum to 180°, not 360°"
      ],
      related_topics: ["Triangles", "Polygons", "Quadrilaterals"]
    },
    "Triangles": {
      concept_explanation: "Triangles have interior angles summing to 180°. Types include equilateral (all sides and angles equal), isosceles (two equal sides), scalene (no equal sides), and right-angled. Key properties relate side lengths to angles.",
      identification_cues: [
        "Diagram shows a three-sided shape or mentions triangle properties",
        "Question involves angle sums, side relationships, or triangle types",
        "Uses terms like equilateral, isosceles, scalene, or hypotenuse"
      ],
      common_mistakes: [
        "Forgetting that the angle sum of a triangle is always 180°",
        "Confusing isosceles properties — the base angles are equal, not the apex angle",
        "Not recognising an exterior angle equals the sum of the two non-adjacent interior angles",
        "Assuming a triangle is right-angled without verification"
      ],
      related_topics: ["Pythagoras' Theorem", "Trigonometric Ratios — sin, cos, tan", "Similarity & Congruence"]
    },
    "Pythagoras' Theorem": {
      concept_explanation: "In a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides: c² = a² + b². It is used to find unknown side lengths and to verify if a triangle is right-angled.",
      identification_cues: [
        "Question involves a right-angled triangle with two known sides",
        "Asks for a distance, diagonal, or unknown side length",
        "Diagram shows a right angle (square corner symbol)"
      ],
      common_mistakes: [
        "Using a² + b² = c² when finding a shorter side — rearrange to a² = c² − b²",
        "Forgetting that c (hypotenuse) is always the LONGEST side, opposite the right angle",
        "Not recognising Pythagorean triples (3-4-5, 5-12-13, 8-15-17)",
        "Forgetting to take the square root at the final step"
      ],
      related_topics: ["Triangles", "Trigonometric Ratios — sin, cos, tan", "Key Coordinate Geometry Formulas"]
    },
    "Similarity & Congruence": {
      concept_explanation: "Congruent shapes are identical in size and shape (SSS, SAS, ASA, RHS). Similar shapes have the same shape but different sizes — corresponding angles are equal and corresponding sides are in the same ratio (scale factor).",
      identification_cues: [
        "Question mentions 'similar', 'congruent', or 'scale factor'",
        "Diagrams show two shapes that look alike but may differ in size",
        "Asks to find a missing side using proportional reasoning"
      ],
      common_mistakes: [
        "Confusing similarity (same shape, different size) with congruence (same shape and size)",
        "Matching the wrong corresponding sides when calculating scale factors",
        "Forgetting that area scales by k² and volume by k³ when linear dimensions scale by k",
        "Not using the correct congruence test (e.g., AAA proves similarity, not congruence)"
      ],
      related_topics: ["Triangles", "Scale Drawings & Maps", "Area"]
    },
    "Quadrilaterals": {
      concept_explanation: "Quadrilaterals are four-sided polygons with interior angles summing to 360°. Common types include squares, rectangles, parallelograms, rhombuses, trapeziums, and kites, each with specific properties regarding sides, angles, and diagonals.",
      identification_cues: [
        "Diagram shows a four-sided shape",
        "Question asks about properties of parallelograms, trapeziums, etc.",
        "Involves angle sums or diagonal properties of four-sided figures"
      ],
      common_mistakes: [
        "Forgetting that a square is a special type of rectangle AND rhombus",
        "Not knowing that opposite angles in a parallelogram are equal",
        "Confusing trapezium (one pair of parallel sides) with parallelogram (two pairs)",
        "Assuming diagonals always bisect each other — only true for parallelograms"
      ],
      related_topics: ["Polygons", "Angle Properties", "Area"]
    },
    "Polygons": {
      concept_explanation: "A polygon is a closed shape with straight sides. The interior angle sum of an n-sided polygon is (n−2) × 180°. For regular polygons, each interior angle is (n−2) × 180° ÷ n, and each exterior angle is 360° ÷ n.",
      identification_cues: [
        "Question involves pentagons, hexagons, octagons, or other multi-sided shapes",
        "Asks for interior/exterior angle sums or individual angles of a regular polygon",
        "Mentions 'regular' polygon or equal sides and angles"
      ],
      common_mistakes: [
        "Using the wrong value for n (number of sides, not angles — though they are equal)",
        "Confusing interior and exterior angle formulas",
        "Forgetting that exterior angles always sum to 360° regardless of the number of sides",
        "Not recognising that interior + exterior angle = 180° at each vertex"
      ],
      related_topics: ["Angle Properties", "Quadrilaterals", "Triangles"]
    },
    "Circle Theorems": {
      concept_explanation: "Circle theorems describe relationships between angles, chords, tangents, and arcs in a circle. Key theorems include: angle at centre = 2× angle at circumference, angles in the same segment are equal, angle in a semicircle = 90°, and opposite angles in a cyclic quadrilateral sum to 180°.",
      identification_cues: [
        "Diagram shows a circle with chords, tangents, or inscribed angles",
        "Question asks for an angle in or around a circle",
        "Involves terms like tangent, chord, arc, sector, or cyclic quadrilateral"
      ],
      common_mistakes: [
        "Confusing 'angle at centre' with 'angle at circumference'",
        "Forgetting that a tangent meets the radius at exactly 90°",
        "Not recognising a cyclic quadrilateral (all four vertices on the circle)",
        "Mixing up the 'same segment' theorem with the 'alternate segment' theorem"
      ],
      related_topics: ["Angle Properties", "Triangles", "Perimeter & Circumference"]
    },
    "Perimeter & Circumference": {
      concept_explanation: "Perimeter is the total distance around a shape. For circles, the perimeter is called circumference and equals 2πr or πd. Composite shapes require adding the perimeters of individual parts and subtracting overlapping edges.",
      identification_cues: [
        "Question asks for the 'distance around' or 'perimeter' of a shape",
        "Involves circles and asks for circumference",
        "Diagram shows a composite shape with curved and straight edges"
      ],
      common_mistakes: [
        "Confusing circumference (2πr) with area (πr²)",
        "Using diameter in the formula for radius or vice versa",
        "Including internal edges when calculating the perimeter of composite shapes",
        "Forgetting to add all sides — especially in irregular shapes"
      ],
      related_topics: ["Area", "Circle Theorems", "Estimation & Approximation"]
    },
    "Area": {
      concept_explanation: "Area is the space inside a 2D shape measured in square units. Key formulas: rectangle = l×w, triangle = ½bh, parallelogram = bh, trapezium = ½(a+b)h, circle = πr². Composite areas are found by adding or subtracting simpler shapes.",
      identification_cues: [
        "Question asks 'what is the area' or mentions square units (cm², m²)",
        "Involves shaded regions or 'area between' two shapes",
        "Requires finding the space inside a flat shape"
      ],
      common_mistakes: [
        "Using the slant height instead of the perpendicular height in triangle/parallelogram formulas",
        "Forgetting to halve for triangles: area = ½ × base × height",
        "Confusing radius and diameter in circle area: πr², not π(2r)²",
        "Not breaking composite shapes into simpler parts before calculating"
      ],
      related_topics: ["Perimeter & Circumference", "Surface Area", "Similarity & Congruence"]
    },
    "Surface Area": {
      concept_explanation: "Surface area is the total area of all faces of a 3D solid. For prisms, it is 2 × base area + perimeter of base × height. For cylinders, SA = 2πr² + 2πrh. Nets can be drawn to visualise all faces laid flat.",
      identification_cues: [
        "Question asks to find the 'surface area' of a 3D object",
        "Involves cubes, rectangular prisms, cylinders, or other solids",
        "Diagram shows a net (unfolded 3D shape) or a 3D solid with dimensions"
      ],
      common_mistakes: [
        "Forgetting to include all faces — a box has 6 faces, not 4",
        "Confusing surface area with volume",
        "Using the wrong formula for the curved surface of a cylinder (2πrh, not πr²h)",
        "Not doubling the base area when needed (top and bottom faces)"
      ],
      related_topics: ["Area", "Volume", "Composite Solids — Pyramids, Cones, Spheres"]
    },
    "Volume": {
      concept_explanation: "Volume is the space inside a 3D solid, measured in cubic units. For prisms and cylinders, V = base area × height. For pyramids and cones, V = ⅓ × base area × height. For spheres, V = 4/3 × πr³.",
      identification_cues: [
        "Question asks to find the 'volume' or 'capacity' of a 3D shape",
        "Involves filling, pouring, or packing problems",
        "Mentions cubic units (cm³, m³, litres)"
      ],
      common_mistakes: [
        "Forgetting the ⅓ factor for pyramids and cones",
        "Using diameter instead of radius in cylinder/cone/sphere volume formulas",
        "Confusing volume units (cm³) with area units (cm²) or length units (cm)",
        "Not converting between mL and cm³ (1 mL = 1 cm³)"
      ],
      related_topics: ["Surface Area", "Area", "Composite Solids — Pyramids, Cones, Spheres"]
    },
    "Composite Solids — Pyramids, Cones, Spheres": {
      concept_explanation: "Composite solids are formed by combining basic 3D shapes. Finding their volume or surface area requires breaking them into components, calculating each separately, then adding (or subtracting for hollow shapes).",
      identification_cues: [
        "Diagram shows a 3D shape made from two or more simple solids joined together",
        "Question involves a hemisphere on top of a cylinder, a cone on a prism, etc.",
        "Asks for total volume or total surface area of a combined shape"
      ],
      common_mistakes: [
        "Forgetting to subtract the joining face when calculating surface area of composite solids",
        "Using the sphere volume formula (4/3 πr³) instead of hemisphere (2/3 πr³)",
        "Not recognising which formula applies to each component",
        "Forgetting the slant height vs perpendicular height for cone surface area"
      ],
      related_topics: ["Volume", "Surface Area", "Pythagoras' Theorem"]
    },
    "Transformations — Reflection, Rotation, Translation": {
      concept_explanation: "Transformations change the position or orientation of shapes. Reflections flip across a mirror line, rotations turn around a centre point, and translations slide by a vector. The shape's size and shape are preserved (congruent image).",
      identification_cues: [
        "Question shows a shape and its image after transformation",
        "Asks to describe a transformation or find coordinates after one",
        "Involves mirror lines, centres of rotation, or direction vectors"
      ],
      common_mistakes: [
        "Reflecting over the wrong axis (x-axis vs y-axis)",
        "Forgetting that rotation requires both a centre point and an angle (plus direction)",
        "Confusing clockwise and anticlockwise rotation directions",
        "Not maintaining equal distance from the mirror line for all reflected points"
      ],
      related_topics: ["Key Coordinate Geometry Formulas", "Similarity & Congruence", "Polygons"]
    },
    "Scale Drawings & Maps": {
      concept_explanation: "A scale drawing represents real objects at a reduced or enlarged size using a consistent scale factor. Map scales like 1:50000 mean 1 cm on the map represents 50000 cm (500 m) in reality.",
      identification_cues: [
        "Question gives a scale ratio like 1:200 or 1 cm = 5 km",
        "Involves maps, floor plans, or model measurements",
        "Asks to convert between real-life and scale dimensions"
      ],
      common_mistakes: [
        "Multiplying when you should divide (or vice versa) to convert scales",
        "Forgetting to square the scale factor for area calculations",
        "Not converting units correctly (e.g., cm on a map to km in reality)",
        "Applying a linear scale factor to areas or volumes without adjusting"
      ],
      related_topics: ["Similarity & Congruence", "Ratios", "Area"]
    },
    "Trigonometric Ratios — sin, cos, tan": {
      concept_explanation: "In a right-angled triangle, sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent (SOH CAH TOA). These ratios connect angles to side lengths.",
      identification_cues: [
        "Question involves a right-angled triangle with an angle and side lengths",
        "Asks to find a missing side or angle using trigonometry",
        "Mentions sin, cos, tan, or SOH CAH TOA"
      ],
      common_mistakes: [
        "Choosing the wrong ratio — always identify opposite, adjacent, and hypotenuse relative to the angle",
        "Using degrees when the calculator is set to radians (or vice versa)",
        "Confusing sin⁻¹ (inverse sin, to find an angle) with 1/sin",
        "Forgetting which sides are 'opposite' and 'adjacent' relative to the given angle"
      ],
      related_topics: ["Pythagoras' Theorem", "Sine Rule, Cosine Rule & Area Rule", "Triangles"]
    },
    "Estimation & Approximation": {
      concept_explanation: "Estimation involves rounding numbers to simplify calculations and check whether answers are reasonable. Useful techniques include rounding to significant figures, using compatible numbers, and front-end estimation.",
      identification_cues: [
        "Question asks for an 'approximate' or 'estimated' answer",
        "Multiple-choice options are spread far apart, suggesting estimation",
        "Involves large numbers or complex calculations where exact computation is slow"
      ],
      common_mistakes: [
        "Rounding too aggressively, leading to inaccurate estimates",
        "Not using estimation to check MCQ answers — eliminate clearly wrong options first",
        "Confusing significant figures with decimal places",
        "Forgetting to estimate both directions (some rounded up, some down) to balance errors"
      ],
      related_topics: ["Scientific Notation", "Operations with Integers", "Problem Solving Strategies"]
    },
    "Sine Rule, Cosine Rule & Area Rule": {
      concept_explanation: "The sine rule (a/sin A = b/sin B) applies to any triangle when you know an angle-side pair. The cosine rule (c² = a² + b² − 2ab cos C) is used when you know two sides and the included angle. The area rule gives area = ½ab sin C.",
      identification_cues: [
        "Triangle is NOT right-angled but asks for a side or angle",
        "Two sides and an included angle are given, or two angles and a side",
        "Question asks for the area of a triangle given two sides and the included angle"
      ],
      common_mistakes: [
        "Using the sine rule when the cosine rule is needed (and vice versa)",
        "Forgetting to check for the ambiguous case in the sine rule (two possible triangles)",
        "Sign errors in the cosine rule formula, especially the −2ab cos C term",
        "Not labelling sides opposite to their corresponding angles correctly"
      ],
      related_topics: ["Trigonometric Ratios — sin, cos, tan", "Triangles", "Area"]
    },
    "Key Coordinate Geometry Formulas": {
      concept_explanation: "Coordinate geometry connects algebra and geometry on the Cartesian plane. Key formulas include: distance = √((x₂−x₁)² + (y₂−y₁)²), midpoint = ((x₁+x₂)/2, (y₁+y₂)/2), and gradient = (y₂−y₁)/(x₂−x₁). The equation of a line is y = mx + c.",
      identification_cues: [
        "Question gives coordinates of points and asks for distance, midpoint, or gradient",
        "Involves finding the equation of a line through given points",
        "Asks about parallel or perpendicular lines on a coordinate grid"
      ],
      common_mistakes: [
        "Subtracting coordinates in the wrong order in the gradient formula",
        "Forgetting to take the square root in the distance formula",
        "Mixing up x and y coordinates when calculating midpoints",
        "Not recognising that a vertical line has undefined gradient"
      ],
      related_topics: ["Linear Equations", "Parallel & Perpendicular Line Gradients", "Pythagoras' Theorem"]
    },
    "Parallel & Perpendicular Line Gradients": {
      concept_explanation: "Parallel lines have equal gradients (m₁ = m₂). Perpendicular lines have gradients that are negative reciprocals (m₁ × m₂ = −1). These relationships are essential for finding equations of lines in coordinate geometry.",
      identification_cues: [
        "Question mentions parallel or perpendicular lines",
        "Asks for the gradient or equation of a line parallel/perpendicular to a given line",
        "Involves proving lines are parallel or perpendicular"
      ],
      common_mistakes: [
        "Forgetting the negative sign in the perpendicular gradient — it's −1/m, not just 1/m",
        "Confusing parallel (same gradient) with perpendicular (negative reciprocal gradients)",
        "Not converting the equation to y = mx + c form to read off the gradient",
        "Thinking horizontal and vertical lines are parallel — they are perpendicular"
      ],
      related_topics: ["Key Coordinate Geometry Formulas", "Linear Equations", "Transformations — Reflection, Rotation, Translation"]
    },
    "Measures of Central Tendency": {
      concept_explanation: "The mean (average), median (middle value), and mode (most frequent value) summarise a data set. The choice of measure depends on the data distribution — median is preferred for skewed data, mode for categorical data.",
      identification_cues: [
        "Question asks for the mean, median, or mode of a data set",
        "Involves finding an 'average' or 'typical value'",
        "Data is presented in a list, table, or frequency chart"
      ],
      common_mistakes: [
        "Forgetting to order data before finding the median",
        "Not dividing by the correct number of values when calculating the mean",
        "Confusing 'no mode' with 'mode is zero'",
        "For grouped data, using class boundaries instead of midpoints to estimate the mean"
      ],
      related_topics: ["Quartiles, IQR & Box Plots", "Distribution Shape — Skewness, Outliers & Spread", "Data Displays — Stem-and-Leaf, Dot Plots, Histograms"]
    },
    "Probability": {
      concept_explanation: "Probability measures how likely an event is to occur, from 0 (impossible) to 1 (certain). P(event) = favourable outcomes ÷ total outcomes. Combined events use addition (OR) and multiplication (AND) rules.",
      identification_cues: [
        "Question asks 'what is the probability' or 'how likely'",
        "Involves dice, coins, cards, spinners, or random selection",
        "Uses terms like 'chance', 'likelihood', or 'at random'"
      ],
      common_mistakes: [
        "Adding probabilities for 'AND' events instead of multiplying",
        "Not subtracting the overlap when using P(A or B) = P(A) + P(B) − P(A and B)",
        "Confusing 'with replacement' and 'without replacement' in successive draws",
        "Giving probability as a number greater than 1"
      ],
      related_topics: ["Complementary Events & Probability Language", "Conditional Probability", "Venn Diagrams"]
    },
    "Data Displays — Stem-and-Leaf, Dot Plots, Histograms": {
      concept_explanation: "Different data displays suit different data types. Stem-and-leaf plots preserve individual values, dot plots show frequency of each value, and histograms display frequency of grouped continuous data with bars touching.",
      identification_cues: [
        "Question shows or asks you to interpret a graph or chart",
        "Involves reading values from a stem-and-leaf plot, dot plot, or histogram",
        "Asks to construct or compare data displays"
      ],
      common_mistakes: [
        "Misreading stem-and-leaf plots — the stem is the tens digit, leaf is the units",
        "Confusing histograms (continuous data, bars touching) with bar charts (categorical, gaps between bars)",
        "Not reading scales carefully on histogram axes",
        "Forgetting that a back-to-back stem-and-leaf plot reads LEFT side backwards"
      ],
      related_topics: ["Measures of Central Tendency", "Distribution Shape — Skewness, Outliers & Spread", "Quartiles, IQR & Box Plots"]
    },
    "Distribution Shape — Skewness, Outliers & Spread": {
      concept_explanation: "Data distributions can be symmetric, positively skewed (tail to right), or negatively skewed (tail to left). Outliers are values far from the rest. Spread is measured by range, IQR, or standard deviation.",
      identification_cues: [
        "Question asks about the 'shape', 'spread', or 'skew' of data",
        "Involves identifying outliers or describing a distribution",
        "Histogram or box plot shows asymmetric data"
      ],
      common_mistakes: [
        "Confusing positive skew (tail to right, mean > median) with negative skew",
        "Defining outliers without using the IQR rule: outlier < Q1 − 1.5×IQR or > Q3 + 1.5×IQR",
        "Using range as a reliable measure of spread — it is affected by outliers",
        "Assuming all data sets are normally distributed"
      ],
      related_topics: ["Measures of Central Tendency", "Quartiles, IQR & Box Plots", "Standard Deviation"]
    },
    "Complementary Events & Probability Language": {
      concept_explanation: "Complementary events cover all possible outcomes: P(not A) = 1 − P(A). Probability language includes certain, likely, even chance, unlikely, and impossible. Understanding complements simplifies many calculations.",
      identification_cues: [
        "Question asks for the probability of something NOT happening",
        "Uses phrases like 'at least one', 'none of', or 'not all'",
        "Involves probability language descriptions (certain, likely, unlikely)"
      ],
      common_mistakes: [
        "Forgetting that P(at least one) = 1 − P(none) — the complement approach is easier",
        "Confusing 'not A' with 'B' when A and B are not complementary",
        "Using the complement rule incorrectly for dependent events",
        "Not recognising when to use complements to simplify the calculation"
      ],
      related_topics: ["Probability", "Conditional Probability", "Venn Diagrams"]
    },
    "Two-Way Tables & Sampling": {
      concept_explanation: "Two-way tables organise data by two categories, with row and column totals. They are useful for finding conditional probabilities and comparing groups. Sampling methods include random, stratified, and systematic.",
      identification_cues: [
        "Question presents data in a table with row and column categories",
        "Asks to complete a two-way table or find probabilities from it",
        "Involves sampling methods or survey design"
      ],
      common_mistakes: [
        "Not checking that rows and columns sum to their correct totals",
        "Confusing joint probability with conditional probability in two-way tables",
        "Not recognising that biased sampling leads to unreliable conclusions",
        "Forgetting to use the correct total (row, column, or grand) as the denominator"
      ],
      related_topics: ["Probability", "Conditional Probability", "Venn Diagrams"]
    },
    "Scatter Plots, Line of Best Fit & Bivariate Data": {
      concept_explanation: "Scatter plots display the relationship between two numerical variables. A line of best fit approximates the trend. Correlation can be positive, negative, or none, and its strength varies from weak to strong.",
      identification_cues: [
        "Question shows a scatter plot or asks about the relationship between two variables",
        "Involves correlation, trend lines, or predicting values",
        "Asks whether a relationship is positive, negative, or has no correlation"
      ],
      common_mistakes: [
        "Confusing correlation with causation — just because two variables correlate doesn't mean one causes the other",
        "Drawing the line of best fit without equal numbers of points above and below",
        "Extrapolating beyond the data range (unreliable predictions)",
        "Ignoring outliers that distort the apparent trend"
      ],
      related_topics: ["Measures of Central Tendency", "Distribution Shape — Skewness, Outliers & Spread", "Linear Equations"]
    },
    "Conditional Probability": {
      concept_explanation: "Conditional probability is the probability of an event given that another event has occurred: P(A|B) = P(A and B) / P(B). Tree diagrams and two-way tables help visualise conditional probabilities.",
      identification_cues: [
        "Question uses 'given that', 'if we know', or 'among those who'",
        "Involves selecting from a subgroup or restricted sample space",
        "Tree diagrams with multiple branches and outcomes"
      ],
      common_mistakes: [
        "Confusing P(A|B) with P(B|A) — the condition matters",
        "Using the wrong denominator (should be the total for the given condition)",
        "Not updating probabilities for 'without replacement' scenarios",
        "Forgetting to multiply along branches and add across branches in tree diagrams"
      ],
      related_topics: ["Probability", "Two-Way Tables & Sampling", "Complementary Events & Probability Language"]
    },
    "Quartiles, IQR & Box Plots": {
      concept_explanation: "Quartiles divide ordered data into four equal parts. Q1 is the 25th percentile, Q2 is the median, Q3 is the 75th percentile. IQR = Q3 − Q1 measures the middle 50% spread. Box plots display the five-number summary: min, Q1, Q2, Q3, max.",
      identification_cues: [
        "Question asks for quartiles, interquartile range, or five-number summary",
        "Involves drawing or interpreting a box plot (box-and-whisker diagram)",
        "Asks to compare distributions using box plots side by side"
      ],
      common_mistakes: [
        "Not ordering data before finding quartiles",
        "Including the median in both halves when finding Q1 and Q3 for odd-sized data sets",
        "Confusing IQR with range — IQR = Q3 − Q1, range = max − min",
        "Misreading the median from a box plot (it's the line inside the box, not the middle of the whiskers)"
      ],
      related_topics: ["Measures of Central Tendency", "Distribution Shape — Skewness, Outliers & Spread", "Standard Deviation"]
    },
    "Standard Deviation": {
      concept_explanation: "Standard deviation measures how spread out data values are from the mean. A small SD means values cluster near the mean; a large SD means they are widely spread. It is calculated as the square root of the variance.",
      identification_cues: [
        "Question asks about the 'spread' or 'variability' of data",
        "Involves comparing consistency between data sets",
        "Mentions standard deviation, variance, or σ (sigma)"
      ],
      common_mistakes: [
        "Forgetting to square the deviations before averaging (variance step)",
        "Not taking the square root of the variance to get standard deviation",
        "Confusing population SD (÷ n) with sample SD (÷ (n−1))",
        "Thinking a higher mean implies higher spread — mean and SD are independent measures"
      ],
      related_topics: ["Quartiles, IQR & Box Plots", "Measures of Central Tendency", "Distribution Shape — Skewness, Outliers & Spread"]
    },
    "Profit, Loss & Discount": {
      concept_explanation: "Profit = selling price − cost price; loss occurs when selling price < cost price. Percentage profit/loss is calculated on the cost price. Discounts reduce the marked price, and successive discounts multiply the remaining percentages.",
      identification_cues: [
        "Question involves buying, selling, cost price, or selling price",
        "Mentions discounts, mark-ups, or sale prices",
        "Asks for profit or loss as a percentage"
      ],
      common_mistakes: [
        "Calculating percentage profit/loss on selling price instead of cost price",
        "Applying successive discounts by adding them: 20% + 10% ≠ 30% total discount",
        "Confusing mark-up (on cost) with margin (on selling price)",
        "Not reading whether the question asks for the amount or the percentage"
      ],
      related_topics: ["Percentages", "Simple & Compound Interest", "Ratios"]
    },
    "Simple & Compound Interest": {
      concept_explanation: "Simple interest is calculated on the original principal only: I = PRT/100. Compound interest is calculated on the principal plus accumulated interest: A = P(1 + r/100)ⁿ. Compound interest grows faster over time.",
      identification_cues: [
        "Question mentions 'interest', 'investment', 'loan', or 'deposit'",
        "Specifies 'simple' or 'compound' interest with a rate and time period",
        "Asks for the total amount, interest earned, or time to reach a target"
      ],
      common_mistakes: [
        "Using the simple interest formula when compound interest is specified",
        "Not converting the interest rate to a decimal or matching the time units",
        "Confusing the total amount (A = P + I) with just the interest (I)",
        "Forgetting to adjust the rate when compounding is not annual (e.g., monthly compounding divides rate by 12)"
      ],
      related_topics: ["Percentages", "Geometric Sequences", "Profit, Loss & Discount"]
    },
    "Problem Solving Strategies": {
      concept_explanation: "Problem solving involves selecting the right approach for unfamiliar questions. Key strategies include: drawing a diagram, working backwards, guess-and-check, making a table, looking for patterns, and using logical reasoning.",
      identification_cues: [
        "Question is a multi-step word problem with no obvious formula",
        "Involves a real-world context requiring mathematical modelling",
        "Requires combining multiple skills or trying different approaches"
      ],
      common_mistakes: [
        "Jumping into calculations without understanding what the question is really asking",
        "Not drawing a diagram when one would clarify the problem",
        "Forgetting to check whether the answer makes sense in context",
        "Getting stuck on one approach instead of trying a different strategy"
      ],
      related_topics: ["Estimation & Approximation", "Quick Problem Identification — What Strategy to Use", "Venn Diagrams"]
    },
    "Venn Diagrams": {
      concept_explanation: "Venn diagrams use overlapping circles to show relationships between sets. The overlap represents elements in both sets. They are useful for organising information, solving probability problems, and finding counts using the inclusion-exclusion principle.",
      identification_cues: [
        "Question presents information about overlapping groups or categories",
        "Uses phrases like 'both', 'either', 'neither', or 'only'",
        "Asks to find how many belong to a specific region of the diagram"
      ],
      common_mistakes: [
        "Forgetting that the intersection is counted in both circles — don't double-count",
        "Starting from the outside instead of the intersection when filling in a Venn diagram",
        "Not including those in 'neither' category (outside all circles)",
        "Confusing 'A or B' (union, at least one) with 'A and B' (intersection, both)"
      ],
      related_topics: ["Probability", "Problem Solving Strategies", "Two-Way Tables & Sampling"]
    },
    "Useful Combinatorial Facts": {
      concept_explanation: "Combinatorics counts the number of ways to arrange or select items. Key concepts include the multiplication principle (if A has m ways and B has n ways, together they have m×n ways), permutations (order matters), and combinations (order doesn't matter).",
      identification_cues: [
        "Question asks 'how many ways' or 'how many different arrangements'",
        "Involves choosing, ordering, or arranging items from a set",
        "Uses terms like 'combinations', 'permutations', or 'arrangements'"
      ],
      common_mistakes: [
        "Confusing permutations (order matters) with combinations (order doesn't matter)",
        "Forgetting to consider repetitions or restrictions in counting problems",
        "Not using the multiplication principle for multi-step counting",
        "Overcounting by not accounting for identical items"
      ],
      related_topics: ["Probability", "Problem Solving Strategies", "Venn Diagrams"]
    },
    "Quick Problem Identification — What Strategy to Use": {
      concept_explanation: "Quickly identifying what type of problem you're facing is critical in timed exams. Look for keywords, given information, and what's being asked to determine whether it's algebra, geometry, statistics, etc.",
      identification_cues: [
        "Multi-step problem where the method isn't immediately obvious",
        "Mixed-topic questions near the end of the exam",
        "Question requires you to choose between multiple possible approaches"
      ],
      common_mistakes: [
        "Spending too long on one question — skip and return if stuck after 90 seconds",
        "Not reading all answer choices before starting to solve — sometimes you can eliminate quickly",
        "Misidentifying the problem type and applying the wrong method entirely",
        "Forgetting exam strategy: do easier questions first to secure marks"
      ],
      related_topics: ["Problem Solving Strategies", "Estimation & Approximation", "Venn Diagrams"]
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VERBAL REASONING (27 topics)
  // ══════════════════════════════════════════════════════════════════════════
  verbal: {
    "Understanding Analogies": {
      concept_explanation: "An analogy shows a relationship between two pairs of words — the relationship in the first pair must match the relationship in the second pair (e.g., Hot:Cold :: Light:Dark). Identifying the type of relationship is key.",
      identification_cues: [
        "Question uses the format 'A is to B as C is to ?' or 'A:B :: C:?'",
        "Asks you to find a word that completes a pair relationship",
        "Involves comparing relationships such as synonym, antonym, part-whole, or degree"
      ],
      common_mistakes: [
        "Choosing a word related to only one of the pair instead of matching the relationship type",
        "Reversing the direction of the analogy (A:B is not the same relationship as B:A)",
        "Not considering multiple meanings of a word — the analogy may use a less common meaning",
        "Failing to identify the specific relationship type before looking at answer choices"
      ],
      related_topics: ["Synonyms", "Antonyms", "Word Classification / Grouping"]
    },
    "Synonyms": {
      concept_explanation: "Synonyms are words with similar meanings (e.g., happy/joyful, brave/courageous). In the VIC selective exam, synonym questions test your vocabulary breadth and ability to identify nuanced similarities between words.",
      identification_cues: [
        "Question asks for a word that 'means the same as' or 'is closest in meaning to'",
        "Involves selecting from multiple options the word most similar to the given word",
        "May test less common or formal vocabulary"
      ],
      common_mistakes: [
        "Choosing a word that is related but not similar in meaning (e.g., 'rain' for 'cloud')",
        "Not considering the specific context — a word may have multiple meanings",
        "Picking the first familiar-sounding word without checking all options",
        "Confusing synonyms with antonyms under time pressure"
      ],
      related_topics: ["Antonyms", "Word Meanings in Context", "Understanding Analogies"]
    },
    "Antonyms": {
      concept_explanation: "Antonyms are words with opposite meanings (e.g., hot/cold, generous/stingy). Questions may test direct antonyms or require you to recognise degrees of opposition and contextual opposites.",
      identification_cues: [
        "Question asks for a word that 'means the opposite of' or 'is most unlike'",
        "Involves selecting the word most different in meaning from the given word",
        "May require distinguishing between near-antonyms and true opposites"
      ],
      common_mistakes: [
        "Choosing a word that is merely different rather than truly opposite",
        "Not considering the correct part of speech — the antonym should be the same word type",
        "Confusing antonyms with synonyms when reading quickly",
        "Overlooking that some words have different antonyms depending on context (e.g., 'light' can mean 'not heavy' or 'not dark')"
      ],
      related_topics: ["Synonyms", "Understanding Analogies", "Word Meanings in Context"]
    },
    "Odd One Out": {
      concept_explanation: "Odd-one-out questions present a group of words and ask you to identify which one does not belong. The key is finding the shared category or pattern that all other words have in common.",
      identification_cues: [
        "Question presents 4-5 words and asks which does not belong",
        "All words except one share a common category, pattern, or relationship",
        "May involve meaning, word structure, or linguistic patterns"
      ],
      common_mistakes: [
        "Identifying a superficial connection instead of the deeper shared category",
        "Finding a reason why each word could be the odd one out — focus on the strongest connection",
        "Not considering all possible grouping criteria (meaning, grammar, letter patterns, etc.)",
        "Rushing and not checking that your chosen 'odd one' truly does not fit the others' shared trait"
      ],
      related_topics: ["Word Classification / Grouping", "Understanding Analogies", "Synonyms"]
    },
    "Word Classification / Grouping": {
      concept_explanation: "Word classification requires placing words into categories based on shared characteristics such as meaning, word class, origin, or structural patterns. It tests your ability to see connections between words.",
      identification_cues: [
        "Question asks you to group words into categories or identify which group a word belongs to",
        "Involves sorting words by meaning, function, or pattern",
        "May present two groups and ask which group a new word fits into"
      ],
      common_mistakes: [
        "Classifying based on surface similarity rather than the underlying shared feature",
        "Not considering that words can belong to multiple categories — choose the best fit",
        "Ignoring less obvious groupings like grammatical category or connotation",
        "Not testing your grouping by checking that ALL members fit the rule"
      ],
      related_topics: ["Odd One Out", "Understanding Analogies", "Parts of Speech"]
    },
    "Hidden Words": {
      concept_explanation: "Hidden word questions ask you to find a word concealed within a phrase or sentence by combining parts of adjacent words. The hidden word spans across word boundaries in the given text.",
      identification_cues: [
        "Question asks you to find a word 'hidden' in a sentence or phrase",
        "The answer word is formed by consecutive letters spanning across two or more words",
        "Instructions mention looking for a word 'within' or 'hidden in' the text"
      ],
      common_mistakes: [
        "Looking only within individual words instead of across word boundaries",
        "Missing the hidden word because of skipping over short common words like 'the', 'and'",
        "Not reading systematically letter by letter through the phrase",
        "Finding a shorter hidden word when a longer correct answer exists"
      ],
      related_topics: ["Word Completion & Letter Patterns", "Spelling Rules", "Word Meanings in Context"]
    },
    "Word Meanings in Context": {
      concept_explanation: "These questions test your ability to determine a word's meaning based on the surrounding sentence or passage. Many English words have multiple meanings, and context clues help you identify the intended definition.",
      identification_cues: [
        "Question presents a word used in a sentence and asks what it means",
        "The correct meaning depends on how the word is used in context",
        "May use words with multiple definitions (e.g., 'bank', 'light', 'fair')"
      ],
      common_mistakes: [
        "Choosing the most common meaning of the word without reading the context",
        "Ignoring context clues in the surrounding sentence",
        "Not substituting your chosen meaning back into the sentence to verify it makes sense",
        "Confusing connotation (feeling/association) with denotation (dictionary meaning)"
      ],
      related_topics: ["Synonyms", "Multiple Meaning Words (Homonyms & Polysemy)", "Prefixes, Suffixes & Root Words"]
    },
    "Prefixes, Suffixes & Root Words": {
      concept_explanation: "Word parts — prefixes (before the root), suffixes (after the root), and roots (the core meaning) — help you decode unfamiliar words. For example, 'un-' means 'not', '-able' means 'capable of', and 'port' means 'carry'.",
      identification_cues: [
        "Question asks about the meaning of a word you can break into parts",
        "Involves identifying what a prefix or suffix means",
        "Asks you to form new words by adding or changing affixes"
      ],
      common_mistakes: [
        "Assuming a prefix always means the same thing — context matters (e.g., 'in-' can mean 'not' or 'into')",
        "Not recognising common Latin and Greek roots that appear in many English words",
        "Confusing similar prefixes like 'pre-' (before) and 'pro-' (forward/for)",
        "Incorrectly splitting words — not every word starting with 're' has 're-' as a prefix (e.g., 'real')"
      ],
      related_topics: ["Word Meanings in Context", "Spelling Rules", "Synonyms"]
    },
    "Multiple Meaning Words (Homonyms & Polysemy)": {
      concept_explanation: "Homonyms are words spelled and pronounced the same but with different meanings (e.g., 'bat' — animal vs. sports equipment). Polysemy is when a single word has multiple related meanings (e.g., 'run' — a person runs, a river runs, a stocking runs).",
      identification_cues: [
        "Question asks you to identify which meaning of a word is being used",
        "Involves a common word used in an unusual or specific way",
        "Asks you to find a word that has two different meanings fitting two sentences"
      ],
      common_mistakes: [
        "Defaulting to the most familiar meaning without considering the context",
        "Not recognising that the same word can function as different parts of speech (e.g., 'light' as noun, adjective, verb)",
        "Confusing homonyms (same spelling) with homophones (same sound, different spelling)",
        "Overlooking less common meanings that fit the context perfectly"
      ],
      related_topics: ["Word Meanings in Context", "Homophones & Commonly Confused Words", "Synonyms"]
    },
    "Homophones & Commonly Confused Words": {
      concept_explanation: "Homophones are words that sound the same but have different spellings and meanings (e.g., their/there/they're, to/too/two). Commonly confused words include affect/effect, principal/principle, and stationary/stationery.",
      identification_cues: [
        "Question asks you to choose the correct word from similar-sounding options",
        "Involves completing a sentence with the right form of a homophone pair",
        "Tests knowledge of commonly confused word pairs"
      ],
      common_mistakes: [
        "Confusing 'their' (belonging to them), 'there' (place), and 'they're' (they are)",
        "Mixing up 'affect' (verb, to influence) and 'effect' (noun, result)",
        "Using 'your' instead of 'you're' or 'its' instead of 'it's'",
        "Not using a mnemonic or memory trick to remember the difference"
      ],
      related_topics: ["Spelling Rules", "Multiple Meaning Words (Homonyms & Polysemy)", "Common Grammar Rules"]
    },
    "Single-Blank Sentence Completion": {
      concept_explanation: "These questions present a sentence with one blank to fill. You must choose the word that best completes the meaning, using context clues, signal words, and logical reasoning to determine the correct answer.",
      identification_cues: [
        "Sentence has one blank (____) or gap to fill",
        "Multiple word choices are provided as options",
        "The sentence contains context clues like 'however', 'because', or 'therefore' that signal the answer"
      ],
      common_mistakes: [
        "Not using signal words (but, although, therefore) to determine whether the blank needs a similar or contrasting word",
        "Choosing a word that sounds right without checking it makes grammatical sense",
        "Ignoring the overall tone of the sentence when selecting the answer",
        "Not reading the entire sentence before choosing — the clue may come after the blank"
      ],
      related_topics: ["Double-Blank Sentence Completion", "Cloze Passages", "Word Meanings in Context"]
    },
    "Double-Blank Sentence Completion": {
      concept_explanation: "Double-blank questions require filling two gaps in a sentence. Both words must work together to create a logical, grammatically correct sentence. Test each pair of words — both must fit.",
      identification_cues: [
        "Sentence has two blanks to fill simultaneously",
        "Answer options are presented as pairs of words",
        "The relationship between the two blanks is often contrasting, cause-effect, or parallel"
      ],
      common_mistakes: [
        "Choosing a pair where one word fits but the other doesn't",
        "Not considering how the two blanks relate to each other",
        "Ignoring transitional words that connect the two parts of the sentence",
        "Only checking the first blank and assuming the second word must also be correct"
      ],
      related_topics: ["Single-Blank Sentence Completion", "Cloze Passages", "Word Meanings in Context"]
    },
    "Cloze Passages": {
      concept_explanation: "A cloze passage is a text with multiple words removed at regular intervals. You must fill each gap using context from the surrounding text, considering grammar, meaning, and the passage's overall theme.",
      identification_cues: [
        "A passage of text has multiple blanks (usually 5-10) throughout",
        "Requires understanding the whole passage to fill each gap",
        "Tests both vocabulary and reading comprehension simultaneously"
      ],
      common_mistakes: [
        "Filling blanks in isolation without reading the whole passage first",
        "Not checking that your chosen word fits grammatically (correct tense, number, etc.)",
        "Using a word that makes local sense but contradicts information elsewhere in the passage",
        "Not returning to recheck all blanks after completing the passage"
      ],
      related_topics: ["Single-Blank Sentence Completion", "Double-Blank Sentence Completion", "Word Meanings in Context"]
    },
    "Comprehension Question Types": {
      concept_explanation: "Verbal reasoning comprehension tests your ability to understand short passages and answer questions about explicit details, implicit meanings, vocabulary, and the author's intent. Questions range from literal recall to higher-order inference.",
      identification_cues: [
        "A short passage is followed by questions about its content",
        "Questions ask 'according to the passage', 'the author suggests', or 'it can be inferred'",
        "Tests multiple skills: finding facts, making inferences, and understanding vocabulary"
      ],
      common_mistakes: [
        "Answering based on general knowledge rather than what the passage actually says",
        "Not referring back to the passage to verify your answer",
        "Confusing stated information with inferences",
        "Spending too long reading the passage — skim first, then read questions, then re-read targeted sections"
      ],
      related_topics: ["Inference & Critical Reading", "Word Meanings in Context", "Single-Blank Sentence Completion"]
    },
    "Inference & Critical Reading": {
      concept_explanation: "Inference means drawing conclusions from evidence in the text that is implied but not explicitly stated. Critical reading involves evaluating the author's argument, identifying bias, and assessing the strength of evidence.",
      identification_cues: [
        "Question uses words like 'infer', 'imply', 'suggest', or 'most likely'",
        "Asks what can be concluded from the passage",
        "Requires reading between the lines rather than finding stated facts"
      ],
      common_mistakes: [
        "Making assumptions that go beyond what the text supports",
        "Confusing inference (supported by text evidence) with personal opinion",
        "Choosing an answer that is true in real life but not supported by the specific passage",
        "Not identifying the specific words or phrases in the text that support the inference"
      ],
      related_topics: ["Comprehension Question Types", "Word Meanings in Context", "Syllogisms & Deductive Reasoning"]
    },
    "Syllogisms & Deductive Reasoning": {
      concept_explanation: "A syllogism uses two premises to reach a logical conclusion (e.g., All dogs are animals; Rex is a dog; therefore Rex is an animal). Deductive reasoning moves from general rules to specific conclusions.",
      identification_cues: [
        "Question gives two or more statements and asks what must be true",
        "Uses 'All', 'Some', 'No', or 'If...then' structure",
        "Asks you to identify which conclusion logically follows from given premises"
      ],
      common_mistakes: [
        "Assuming the reverse is true — 'All A are B' does NOT mean 'All B are A'",
        "Confusing 'some' (at least one) with 'all'",
        "Drawing conclusions based on real-world knowledge rather than the given statements only",
        "Not checking whether a conclusion is definitely true vs. only possibly true"
      ],
      related_topics: ["Statement & Conclusion Problems", "Understanding Analogies", "Inference & Critical Reading"]
    },
    "Coding & Decoding": {
      concept_explanation: "Coding questions assign letters, numbers, or symbols to words using a pattern. You must identify the code system, then decode a new word or encode a given word following the same rules.",
      identification_cues: [
        "Question shows coded versions of words with their meanings",
        "Asks you to decode a new coded word or encode a given word",
        "Involves letter shifts, number substitutions, or symbol patterns"
      ],
      common_mistakes: [
        "Assuming simple one-step coding when the pattern involves multiple operations",
        "Not checking the code against ALL given examples — it must work for every one",
        "Confusing forward and backward letter shifts",
        "Overlooking that the code may reverse the word or rearrange letters"
      ],
      related_topics: ["Syllogisms & Deductive Reasoning", "Word Completion & Letter Patterns", "Hidden Words"]
    },
    "Statement & Conclusion Problems": {
      concept_explanation: "These questions give one or more statements and ask which conclusions definitely follow. You must evaluate each conclusion based ONLY on the given statements, ignoring outside knowledge.",
      identification_cues: [
        "Question gives statements and asks which conclusion(s) follow",
        "Uses phrases like 'based on the above', 'which must be true', or 'which conclusion follows'",
        "Tests logical reasoning rather than factual knowledge"
      ],
      common_mistakes: [
        "Using real-world knowledge to justify a conclusion instead of relying only on the given statements",
        "Confusing 'possible' with 'definite' — a valid conclusion MUST follow, not just could follow",
        "Not considering that multiple conclusions might follow from the same statements",
        "Accepting a conclusion that seems reasonable but isn't directly supported by the premises"
      ],
      related_topics: ["Syllogisms & Deductive Reasoning", "Inference & Critical Reading", "Comprehension Question Types"]
    },
    "Parts of Speech": {
      concept_explanation: "Parts of speech classify words by their function: nouns (things), verbs (actions), adjectives (describe nouns), adverbs (describe verbs), pronouns (replace nouns), prepositions (show relationships), conjunctions (join), and interjections (exclamations).",
      identification_cues: [
        "Question asks to identify the word class or function of a word in a sentence",
        "Involves selecting the correct form of a word (noun vs adjective vs verb)",
        "Tests understanding of how words function in sentences"
      ],
      common_mistakes: [
        "Confusing adjectives (describe nouns) with adverbs (describe verbs) — e.g., 'quick' vs 'quickly'",
        "Not recognising that the same word can be different parts of speech in different contexts",
        "Mixing up pronouns with nouns or prepositions with conjunctions",
        "Forgetting that '-ly' doesn't always make an adverb (e.g., 'friendly' is an adjective)"
      ],
      related_topics: ["Common Grammar Rules", "Sentence Correction & Error Identification", "Word Classification / Grouping"]
    },
    "Common Grammar Rules": {
      concept_explanation: "Grammar rules govern how sentences are constructed correctly. Key rules include subject-verb agreement, correct tense usage, pronoun-antecedent agreement, and proper use of punctuation.",
      identification_cues: [
        "Question asks you to identify or correct a grammatical error",
        "Involves choosing the correct form of a verb, pronoun, or tense",
        "Sentence sounds awkward or has a deliberate error to identify"
      ],
      common_mistakes: [
        "Failing to match subject and verb in number (e.g., 'The group of students are' should be 'is')",
        "Using the wrong tense — past, present, and future must be consistent",
        "Confusing 'who' (subject) with 'whom' (object)",
        "Missing comma in compound sentences or using commas incorrectly in lists"
      ],
      related_topics: ["Parts of Speech", "Sentence Correction & Error Identification", "Rearranging Words & Sentences"]
    },
    "Rearranging Words & Sentences": {
      concept_explanation: "These questions give jumbled words to form a sentence, or jumbled sentences to form a paragraph. Success requires understanding sentence structure (subject-verb-object) and logical paragraph flow.",
      identification_cues: [
        "Question presents words in random order and asks you to form a meaningful sentence",
        "Sentences are listed out of order and must be arranged into a logical paragraph",
        "Involves identifying the topic sentence, supporting details, and concluding statement"
      ],
      common_mistakes: [
        "Starting with a word that cannot grammatically begin a sentence",
        "Not checking that the rearranged sentence is both grammatically correct AND meaningful",
        "In paragraph ordering, not identifying the introduction and conclusion first",
        "Ignoring linking words (however, therefore, finally) that signal the correct order"
      ],
      related_topics: ["Common Grammar Rules", "Parts of Speech", "Sentence Correction & Error Identification"]
    },
    "Sentence Correction & Error Identification": {
      concept_explanation: "These questions present sentences with grammatical, spelling, or punctuation errors. You must identify the error or select the corrected version. Errors may involve subject-verb agreement, tense, word choice, or punctuation.",
      identification_cues: [
        "Question asks you to find the error in an underlined portion of a sentence",
        "Presents multiple versions of a sentence and asks which is correct",
        "Involves proofreading for grammar, spelling, or punctuation mistakes"
      ],
      common_mistakes: [
        "Choosing 'No Error' without carefully checking every part of the sentence",
        "Not reading the whole sentence — errors may only be apparent in context",
        "Fixing a non-error while missing the actual mistake",
        "Confusing formal written English with casual spoken English"
      ],
      related_topics: ["Common Grammar Rules", "Parts of Speech", "Homophones & Commonly Confused Words"]
    },
    "Idioms": {
      concept_explanation: "Idioms are phrases whose meaning cannot be understood from the individual words (e.g., 'break the ice' means to ease social tension, not literally breaking ice). Knowledge of common idioms is tested in verbal reasoning.",
      identification_cues: [
        "Question asks for the meaning of a figurative expression",
        "A phrase doesn't make literal sense in context — it's likely an idiom",
        "Involves matching an idiom to its correct meaning"
      ],
      common_mistakes: [
        "Interpreting the idiom literally instead of figuratively",
        "Confusing similar idioms (e.g., 'a piece of cake' vs 'icing on the cake')",
        "Not recognising less common idioms and guessing based on one word in the phrase",
        "Mixing up Australian/British idioms with American equivalents"
      ],
      related_topics: ["Proverbs", "Figurative Language", "Word Meanings in Context"]
    },
    "Proverbs": {
      concept_explanation: "Proverbs are short, well-known sayings that express general truths or advice (e.g., 'A stitch in time saves nine' means fixing a small problem early prevents a bigger one later). Questions test whether you understand the underlying message.",
      identification_cues: [
        "Question quotes a traditional saying and asks for its meaning",
        "Involves matching a proverb to a scenario it describes",
        "Asks which proverb best applies to a given situation"
      ],
      common_mistakes: [
        "Taking the proverb literally rather than understanding its metaphorical meaning",
        "Confusing similar proverbs (e.g., 'Don't count your chickens before they hatch' vs 'Don't put all your eggs in one basket')",
        "Not knowing common English proverbs and guessing based on a single word",
        "Applying a proverb to the wrong situation because of surface-level similarity"
      ],
      related_topics: ["Idioms", "Figurative Language", "Inference & Critical Reading"]
    },
    "Figurative Language": {
      concept_explanation: "Figurative language uses words beyond their literal meaning to create vivid imagery or comparisons. Types include simile (like/as), metaphor (direct comparison), personification (giving human qualities), hyperbole (exaggeration), and onomatopoeia (sound words).",
      identification_cues: [
        "Question asks you to identify a type of figurative language",
        "Sentence contains a comparison using 'like' or 'as' (simile) or a direct equation (metaphor)",
        "Involves interpreting non-literal expressions in a passage"
      ],
      common_mistakes: [
        "Confusing simile (uses 'like' or 'as') with metaphor (direct comparison without 'like'/'as')",
        "Not recognising personification when objects are given human actions",
        "Interpreting figurative language literally in comprehension questions",
        "Confusing hyperbole (exaggeration for effect) with lying or inaccuracy"
      ],
      related_topics: ["Idioms", "Proverbs", "Word Meanings in Context"]
    },
    "Spelling Rules": {
      concept_explanation: "Spelling rules help you spell words correctly and identify misspelled words. Key rules include: i before e except after c, doubling consonants before adding suffixes, dropping silent e before vowel suffixes, and changing y to i before adding suffixes.",
      identification_cues: [
        "Question asks you to identify the correctly or incorrectly spelled word",
        "Involves choosing the right spelling from similar options",
        "Tests knowledge of common spelling patterns and exceptions"
      ],
      common_mistakes: [
        "Forgetting exceptions to 'i before e': weird, seize, their, foreign",
        "Not doubling the final consonant when adding -ing or -ed to short vowel words (running, not runing)",
        "Dropping the silent e incorrectly — keep it before consonant suffixes (hopeful), drop before vowel suffixes (hoping)",
        "Misspelling common tricky words: accommodation, necessary, separate, definitely"
      ],
      related_topics: ["Homophones & Commonly Confused Words", "Word Completion & Letter Patterns", "Prefixes, Suffixes & Root Words"]
    },
    "Word Completion & Letter Patterns": {
      concept_explanation: "These questions give partial words with missing letters and ask you to complete them. Success requires recognising common letter patterns, word endings, and using process of elimination.",
      identification_cues: [
        "Question shows a word with missing letters (e.g., _e_u_i_ul = beautiful)",
        "Asks you to find a word that fits a given letter pattern",
        "Involves completing word puzzles or anagram-style problems"
      ],
      common_mistakes: [
        "Not considering all possible letters that could fill the blanks",
        "Fixating on one possible word and not trying alternatives",
        "Ignoring the number of missing letters as a constraint",
        "Not checking that the completed word is a real, correctly-spelled English word"
      ],
      related_topics: ["Spelling Rules", "Hidden Words", "Prefixes, Suffixes & Root Words"]
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QUANTITATIVE REASONING (31 topics)
  // ══════════════════════════════════════════════════════════════════════════
  quantitative: {
    "Arithmetic with Integers": {
      concept_explanation: "Quantitative reasoning arithmetic tests your ability to perform mental calculations quickly with whole numbers, including negative integers. Questions focus on speed and accuracy without a calculator.",
      identification_cues: [
        "Question involves basic operations (+, −, ×, ÷) with whole numbers",
        "Requires mental arithmetic or estimation to find the answer quickly",
        "Numbers may include negative values or require order of operations"
      ],
      common_mistakes: [
        "Making sign errors with negative numbers, especially (−) × (−) = (+)",
        "Not following BODMAS order — brackets and powers before multiplication/division",
        "Rushing and making careless arithmetic errors under time pressure",
        "Not estimating first to check whether the answer is reasonable"
      ],
      related_topics: ["Fractions, Decimals & Percentages", "Powers, Roots & Order of Operations", "Mental Math Speed Tricks"]
    },
    "Fractions, Decimals & Percentages": {
      concept_explanation: "These questions test converting between fractions, decimals, and percentages, and using them in calculations. Fluent conversion (e.g., 1/4 = 0.25 = 25%) is essential for speed in quantitative reasoning.",
      identification_cues: [
        "Question involves fractions, decimals, or percentages in applied contexts",
        "Asks you to convert between different representations",
        "Involves comparing, ordering, or calculating with mixed number formats"
      ],
      common_mistakes: [
        "Not knowing key fraction-decimal-percentage equivalences by heart (1/8 = 0.125 = 12.5%)",
        "Adding fractions without finding a common denominator",
        "Calculating percentage of a number incorrectly (e.g., 15% of 80 ≠ 80 ÷ 15)",
        "Confusing 'what percentage is A of B' (A/B × 100) with 'what is A% of B' (A/100 × B)"
      ],
      related_topics: ["Arithmetic with Integers", "Ratios & Proportions", "Money & Finance"]
    },
    "Ratios & Proportions": {
      concept_explanation: "Ratio and proportion questions in quantitative reasoning test your ability to scale quantities, share amounts, and solve problems involving equivalent ratios. They often appear in word problem contexts.",
      identification_cues: [
        "Question uses colon notation (3:5) or mentions sharing/dividing in a ratio",
        "Involves scaling a recipe, map distance, or model",
        "Asks you to find an unknown quantity given a proportional relationship"
      ],
      common_mistakes: [
        "Confusing the order of the ratio — 2:3 boys to girls is different from 3:2",
        "Not simplifying ratios or cross-multiplying correctly",
        "Forgetting to add ratio parts to find the total shares",
        "Applying ratios to the wrong quantity (e.g., ratio of boys to total vs boys to girls)"
      ],
      related_topics: ["Fractions, Decimals & Percentages", "Arithmetic with Integers", "Word Problems with Variables"]
    },
    "Powers, Roots & Order of Operations": {
      concept_explanation: "This topic tests your ability to evaluate expressions involving powers (exponents), square/cube roots, and the correct application of BODMAS/BIDMAS order of operations in multi-step calculations.",
      identification_cues: [
        "Expression contains powers (², ³), roots (√), or multiple operations in a single line",
        "Asks to evaluate or simplify a numerical expression",
        "Order of operations matters — brackets, indices, division/multiplication, addition/subtraction"
      ],
      common_mistakes: [
        "Evaluating left to right without respecting BODMAS order",
        "Confusing 2³ (= 8) with 3² (= 9) — base and exponent are not interchangeable",
        "Not computing brackets first in expressions like 3 × (4 + 2)²",
        "Forgetting that −3² = −9 but (−3)² = 9"
      ],
      related_topics: ["Arithmetic with Integers", "Number Sequences", "Solving for Unknowns"]
    },
    "Number Sequences": {
      concept_explanation: "Number sequence questions present a series of numbers following a pattern and ask you to find the next term or a missing term. Patterns may involve addition, multiplication, powers, Fibonacci-type rules, or alternating operations.",
      identification_cues: [
        "A series of numbers is given with a blank or question mark for the next/missing term",
        "Pattern involves regular differences, ratios, or alternating operations",
        "May combine two interleaved sequences or use multi-step rules"
      ],
      common_mistakes: [
        "Assuming the pattern is always simple addition — check multiplication, squares, and other operations",
        "Not checking second differences when first differences are not constant",
        "Looking at too few terms to identify the pattern reliably",
        "Not considering interleaved sequences (odd positions follow one rule, even positions another)"
      ],
      related_topics: ["Shape / Figural Sequences", "Powers, Roots & Order of Operations", "Solving for Unknowns"]
    },
    "Shape / Figural Sequences": {
      concept_explanation: "Figural sequence questions show a series of shapes or patterns that change according to rules (rotation, addition, removal, colour change, etc.). You must identify the rule and predict the next figure.",
      identification_cues: [
        "Question shows a sequence of diagrams or figures with a missing entry",
        "Shapes change systematically — rotating, reflecting, growing, or transforming",
        "May involve multiple simultaneous changes (e.g., shape rotates AND shading alternates)"
      ],
      common_mistakes: [
        "Focusing on only one aspect of the change while missing other simultaneous patterns",
        "Confusing clockwise and anticlockwise rotation directions",
        "Not checking your predicted answer against ALL previous figures in the sequence",
        "Overlooking small details like dots, lines, or shading changes"
      ],
      related_topics: ["Visual Pattern Completion", "Shape Rotations", "Reflections & Symmetry"]
    },
    "Shape Rotations": {
      concept_explanation: "Rotation questions test your ability to mentally rotate 2D shapes by specified angles (90°, 180°, 270°) around a point. You must visualise where each part of the shape ends up after rotation.",
      identification_cues: [
        "Question asks what a shape looks like after being rotated by a given angle",
        "Involves choosing the correct orientation from multiple options",
        "May show a shape on a grid that must be rotated around a specified point"
      ],
      common_mistakes: [
        "Confusing rotation with reflection — rotation turns, reflection flips",
        "Rotating in the wrong direction (clockwise vs anticlockwise)",
        "Not tracking individual points or features through the rotation",
        "Forgetting that 90° clockwise is the same as 270° anticlockwise"
      ],
      related_topics: ["Reflections & Symmetry", "Shape / Figural Sequences", "Visual Pattern Completion"]
    },
    "Reflections & Symmetry": {
      concept_explanation: "Reflection questions ask you to identify the mirror image of a shape across a given line. Symmetry questions test whether shapes have line symmetry (mirror) or rotational symmetry.",
      identification_cues: [
        "Question shows a shape and a mirror line, asking for the reflected image",
        "Asks how many lines of symmetry a shape has",
        "Involves identifying which of several images is the correct mirror reflection"
      ],
      common_mistakes: [
        "Confusing reflection with rotation — reflections flip, rotations turn",
        "Not maintaining equal perpendicular distance from the mirror line for all points",
        "Forgetting that reflected text reads backwards",
        "Confusing vertical and horizontal mirror lines"
      ],
      related_topics: ["Shape Rotations", "Shape / Figural Sequences", "Visual Pattern Completion"]
    },
    "Paper Folding & Hole Punching": {
      concept_explanation: "Paper folding questions show a piece of paper being folded and then cut or punched. You must visualise the result when the paper is unfolded. Key principle: holes and cuts are reflected symmetrically across each fold line.",
      identification_cues: [
        "Question shows step-by-step paper folding with a hole punch at the end",
        "Asks what the paper looks like when fully unfolded",
        "Involves tracking symmetry across one or more fold lines"
      ],
      common_mistakes: [
        "Not reflecting the hole/cut across EACH fold line in the correct order (unfold in reverse)",
        "Losing track of which corner is which after multiple folds",
        "Forgetting that the number of holes doubles with each fold (one fold = 2 holes, two folds = 4)",
        "Incorrectly reflecting — the hole position mirrors across the fold line, not across the page"
      ],
      related_topics: ["Reflections & Symmetry", "3D Nets & Visualization", "Visual Pattern Completion"]
    },
    "Visual Pattern Completion": {
      concept_explanation: "These questions present a grid or matrix of shapes following row and column rules. You must identify the pattern in each row and column to determine the missing figure. Common patterns involve rotation, addition/subtraction of elements, and alternation.",
      identification_cues: [
        "A 3×3 grid of figures with one missing (usually bottom-right)",
        "Patterns change across rows and down columns following rules",
        "Multiple choice options show possible figures for the missing cell"
      ],
      common_mistakes: [
        "Only checking rows OR columns — you must verify the pattern works in both directions",
        "Overlooking subtle differences between similar-looking options",
        "Assuming the same type of pattern applies to all elements within each figure",
        "Not checking your answer against all rows and columns before selecting"
      ],
      related_topics: ["Shape / Figural Sequences", "Shape Rotations", "Reflections & Symmetry"]
    },
    "3D Nets & Visualization": {
      concept_explanation: "3D nets questions show a flattened 2D shape (net) that folds into a 3D solid, or vice versa. You must visualise which faces are adjacent, which are opposite, and how patterns on faces align when folded.",
      identification_cues: [
        "Question shows a flat net and asks which 3D shape it forms (or which face is opposite another)",
        "Involves cube nets with patterns/letters on faces",
        "Asks you to identify which net(s) fold into a given 3D shape"
      ],
      common_mistakes: [
        "Not correctly identifying opposite faces on a cube net — opposite faces never share an edge",
        "Forgetting that patterns on faces rotate when the net is folded",
        "Not mentally folding systematically — track one face at a time",
        "Confusing valid cube nets with invalid ones (there are exactly 11 valid cube nets)"
      ],
      related_topics: ["Paper Folding & Hole Punching", "Visual Pattern Completion", "Shape Rotations"]
    },
    "Solving for Unknowns": {
      concept_explanation: "These questions present equations or number relationships where you must find an unknown value. Unlike pure maths, quantitative reasoning often uses symbols, shapes, or balance scales instead of traditional algebra.",
      identification_cues: [
        "An equation or balance with a missing value represented by a symbol, letter, or question mark",
        "Number puzzles where relationships between numbers define the unknown",
        "Involves working backwards from a result to find the starting value"
      ],
      common_mistakes: [
        "Not performing the same operation on both sides of an equation",
        "Misreading the relationship between symbols or shapes",
        "Forgetting to check the solution by substituting back",
        "Making arithmetic errors when working backwards through multiple steps"
      ],
      related_topics: ["Word Problems with Variables", "Substitution Problems", "Arithmetic with Integers"]
    },
    "Word Problems with Variables": {
      concept_explanation: "These problems describe real-world scenarios in words that must be translated into mathematical equations and solved. The key skill is converting English descriptions into algebraic expressions.",
      identification_cues: [
        "A paragraph describes a scenario with unknown quantities to find",
        "Uses phrases like 'how many', 'what is the total', or 'how much more'",
        "Requires setting up an equation from the given information"
      ],
      common_mistakes: [
        "Misinterpreting 'more than' and 'less than' — '5 more than x' is x + 5, not 5 − x",
        "Setting up the wrong equation by misreading the relationships described",
        "Forgetting to answer the actual question — solving for x when the question asks for 2x + 3",
        "Not checking units — make sure the answer matches what was asked (metres, dollars, etc.)"
      ],
      related_topics: ["Solving for Unknowns", "Substitution Problems", "Speed, Distance & Time (Kinematics)"]
    },
    "Substitution Problems": {
      concept_explanation: "Substitution involves replacing variables with given values and evaluating the resulting expression. These questions test your ability to follow order of operations carefully after inserting numbers.",
      identification_cues: [
        "Question gives values for variables and asks you to evaluate a formula or expression",
        "Uses symbols or letters with assigned numerical values",
        "Involves coded operations where symbols represent specific calculations"
      ],
      common_mistakes: [
        "Substituting values incorrectly — especially with negative numbers in brackets",
        "Not following order of operations after substitution",
        "Confusing which symbol or variable gets which value",
        "Forgetting to square or cube negative values correctly: (−2)² = 4, not −4"
      ],
      related_topics: ["Solving for Unknowns", "Word Problems with Variables", "Powers, Roots & Order of Operations"]
    },
    "Speed, Distance & Time (Kinematics)": {
      concept_explanation: "These applied problems use the relationship Speed = Distance ÷ Time in practical scenarios like travel, meeting points, and average speed over multiple legs. They require careful unit management and logical thinking.",
      identification_cues: [
        "Question describes journeys, travel times, or meeting points between moving objects",
        "Involves km/h, m/s, or minutes and asks for distance, speed, or time",
        "May include multiple legs at different speeds"
      ],
      common_mistakes: [
        "Average speed ≠ average of speeds — use total distance ÷ total time",
        "Not converting units consistently (e.g., mixing km/h and m/s)",
        "Forgetting that when two objects move toward each other, their speeds add",
        "Not accounting for rest stops in total time calculations"
      ],
      related_topics: ["Word Problems with Variables", "Ratios & Proportions", "Work & Rate Problems"]
    },
    "Work & Rate Problems": {
      concept_explanation: "Work-rate problems involve calculating how long tasks take when multiple workers or machines operate together. If A takes x hours and B takes y hours alone, together their combined rate is 1/x + 1/y per hour.",
      identification_cues: [
        "Question involves people or machines completing a job together",
        "Mentions 'working together' or 'combined rate'",
        "Asks how long a task takes with different numbers of workers"
      ],
      common_mistakes: [
        "Adding times directly instead of adding rates — if A takes 3 hours and B takes 6 hours, together ≠ 9 hours",
        "Not converting individual completion times to rates (work per hour) first",
        "Forgetting that more workers means less time (inverse relationship)",
        "Not handling the case where workers have different efficiencies"
      ],
      related_topics: ["Speed, Distance & Time (Kinematics)", "Fractions, Decimals & Percentages", "Ratios & Proportions"]
    },
    "Mixture & Concentration": {
      concept_explanation: "Mixture problems involve combining solutions of different concentrations to achieve a target concentration. The key principle is that the amount of pure substance before mixing equals the amount after mixing.",
      identification_cues: [
        "Question involves mixing liquids, alloys, or solutions of different strengths",
        "Mentions concentration, percentage purity, or mixing ratios",
        "Asks for the final concentration or how much of each component to use"
      ],
      common_mistakes: [
        "Averaging concentrations instead of using the weighted method",
        "Not tracking the amount of pure substance (concentration × volume) in each part",
        "Confusing the volume of solution with the amount of solute",
        "Forgetting that adding pure water (0% concentration) dilutes the mixture"
      ],
      related_topics: ["Ratios & Proportions", "Fractions, Decimals & Percentages", "Word Problems with Variables"]
    },
    "Perimeter & Area": {
      concept_explanation: "Quantitative reasoning perimeter and area problems test your ability to apply geometry formulas in practical and multi-step contexts, often combining different shapes or requiring you to work backwards from given information.",
      identification_cues: [
        "Question shows a shape with dimensions and asks for perimeter or area",
        "Involves composite shapes made from rectangles, triangles, circles, etc.",
        "Asks to find a missing dimension given the area or perimeter"
      ],
      common_mistakes: [
        "Using the wrong height — always use the perpendicular height, not the slant side",
        "Forgetting to halve for triangles or to use πr² (not πd²) for circles",
        "Not breaking composite shapes into simpler components",
        "Confusing perimeter (1D length) with area (2D space) and using wrong units"
      ],
      related_topics: ["Volume & Surface Area", "Angles & Lines", "Coordinate Geometry"]
    },
    "Volume & Surface Area": {
      concept_explanation: "These questions test calculating the space inside 3D objects (volume) and the total area of their surfaces. They often involve real-world contexts like filling containers, wrapping boxes, or painting surfaces.",
      identification_cues: [
        "Question involves 3D shapes like cubes, rectangular prisms, cylinders, or cones",
        "Asks how much a container can hold (volume) or how much material is needed to cover it (surface area)",
        "Mentions litres, cm³, m³, or asks about capacity"
      ],
      common_mistakes: [
        "Confusing volume formulas with surface area formulas",
        "Forgetting the ⅓ factor for pyramids and cones",
        "Not converting between cm³ and litres correctly (1000 cm³ = 1 litre)",
        "Using diameter instead of radius in cylinder or sphere calculations"
      ],
      related_topics: ["Perimeter & Area", "Angles & Lines", "3D Nets & Visualization"]
    },
    "Angles & Lines": {
      concept_explanation: "Angles and lines questions in quantitative reasoning test your knowledge of angle relationships (supplementary, complementary, vertically opposite) and properties of parallel lines cut by transversals, often in multi-step problems.",
      identification_cues: [
        "Diagram shows intersecting or parallel lines with angles to find",
        "Question involves angle calculations requiring multiple steps",
        "Uses properties of triangles, quadrilaterals, or parallel lines"
      ],
      common_mistakes: [
        "Confusing alternate angles (Z-shape, equal) with co-interior angles (C-shape, sum to 180°)",
        "Not recognising all the angle relationships in a complex diagram",
        "Assuming lines are parallel without this being stated",
        "Forgetting that the exterior angle of a triangle = sum of the two opposite interior angles"
      ],
      related_topics: ["Perimeter & Area", "Coordinate Geometry", "3D Nets & Visualization"]
    },
    "Coordinate Geometry": {
      concept_explanation: "Coordinate geometry questions in quantitative reasoning involve plotting points, reading coordinates, finding distances or midpoints, and understanding gradient — all in applied or multi-step contexts.",
      identification_cues: [
        "Question shows a coordinate grid or gives coordinates of points",
        "Asks for distances between points, midpoints, or gradients",
        "Involves finding points that satisfy given conditions on a grid"
      ],
      common_mistakes: [
        "Mixing up x and y coordinates (x is horizontal, y is vertical)",
        "Making sign errors with negative coordinates",
        "Forgetting to take the square root in the distance formula",
        "Not recognising that gradient = rise/run"
      ],
      related_topics: ["Perimeter & Area", "Angles & Lines", "Number Sequences"]
    },
    "Tables & Charts": {
      concept_explanation: "These questions require reading, interpreting, and performing calculations using data presented in tables, bar charts, pie charts, or line graphs. Speed and accuracy in data extraction are key.",
      identification_cues: [
        "Question presents data in a table, graph, or chart format",
        "Asks you to calculate totals, differences, averages, or percentages from the data",
        "Involves comparing data across categories or time periods"
      ],
      common_mistakes: [
        "Misreading the scale on a graph axis",
        "Not reading column/row headers carefully in tables",
        "Calculating percentage change from the wrong base value",
        "Not checking all the data before answering — the answer may require combining multiple rows/columns"
      ],
      related_topics: ["Mean, Median, Mode & Range", "Probability", "Fractions, Decimals & Percentages"]
    },
    "Mean, Median, Mode & Range": {
      concept_explanation: "These questions test calculating and interpreting measures of central tendency (mean, median, mode) and spread (range) in applied quantitative reasoning contexts. They may involve working backwards to find missing values.",
      identification_cues: [
        "Question asks for the mean, median, mode, or range of a data set",
        "Involves finding a missing value given the mean or median",
        "Data may be presented in a frequency table rather than a simple list"
      ],
      common_mistakes: [
        "Not ordering data before finding the median",
        "Using the wrong formula for mean from a frequency table (sum of f×x, divided by sum of f)",
        "Confusing range (max − min) with interquartile range",
        "Not considering whether adding or removing a value changes the median position"
      ],
      related_topics: ["Tables & Charts", "Probability", "Fractions, Decimals & Percentages"]
    },
    "Probability": {
      concept_explanation: "Quantitative reasoning probability questions test your ability to calculate the likelihood of events using counting methods, tree diagrams, and basic probability rules in applied contexts.",
      identification_cues: [
        "Question involves random selection, dice, coins, cards, or spinners",
        "Asks 'what is the probability' or 'how likely'",
        "Involves combined events (AND/OR) or successive trials"
      ],
      common_mistakes: [
        "Not listing all possible outcomes systematically",
        "Confusing 'with replacement' and 'without replacement'",
        "Adding probabilities when you should multiply (AND events)",
        "Forgetting that probabilities must be between 0 and 1"
      ],
      related_topics: ["Tables & Charts", "Venn Diagrams & Sets", "Fractions, Decimals & Percentages"]
    },
    "Venn Diagrams & Sets": {
      concept_explanation: "Venn diagram questions in quantitative reasoning use overlapping circles to represent groups. You must use given information to fill regions and answer questions about how many items belong to specific combinations of groups.",
      identification_cues: [
        "Question describes overlapping groups or categories with given totals",
        "Uses language like 'both', 'only', 'neither', or 'at least one'",
        "Involves filling in or interpreting a Venn diagram"
      ],
      common_mistakes: [
        "Double-counting the intersection — it's already included in each circle's total",
        "Not starting from the intersection when filling in a Venn diagram",
        "Forgetting those in 'neither' set (outside all circles)",
        "Confusing 'A only' (in A but not B) with 'A' (in A, possibly also in B)"
      ],
      related_topics: ["Probability", "Tables & Charts", "Logical Deduction"]
    },
    "Matrix / Grid Problems": {
      concept_explanation: "Matrix or grid problems present numbers arranged in a grid where rows, columns, or diagonals follow a pattern or rule. You must identify the rule and find missing values.",
      identification_cues: [
        "Numbers are arranged in a grid or table with a missing value",
        "Rows, columns, or diagonals follow a consistent mathematical rule",
        "May involve magic squares, cross-number puzzles, or operation grids"
      ],
      common_mistakes: [
        "Assuming the rule applies only to rows — always check columns and diagonals too",
        "Not testing the discovered rule against ALL available entries",
        "Overlooking that the operation might vary (e.g., row 1 uses addition, row 2 uses multiplication)",
        "Making arithmetic errors when verifying the pattern"
      ],
      related_topics: ["Number Sequences", "Solving for Unknowns", "Logical Deduction"]
    },
    "Logical Deduction": {
      concept_explanation: "Logical deduction in quantitative reasoning involves using given clues to determine facts, rankings, or arrangements. Process of elimination, creating tables or grids, and systematic testing are essential strategies.",
      identification_cues: [
        "Question gives a series of clues about people, objects, or positions",
        "Asks you to determine a ranking, order, or matching from the clues",
        "Involves 'if...then' reasoning or process of elimination"
      ],
      common_mistakes: [
        "Not using a systematic approach (grid or table) to track all possibilities",
        "Missing a clue or not fully utilising all given information",
        "Making an early assumption that contradicts a later clue",
        "Not double-checking the final answer against ALL clues"
      ],
      related_topics: ["Matrix / Grid Problems", "Venn Diagrams & Sets", "Number Sequences"]
    },
    "Time Problems": {
      concept_explanation: "Time problems involve calculating durations, converting between time formats (12-hour, 24-hour), and solving problems involving schedules, time zones, and elapsed time. They require careful handling of the base-60 system.",
      identification_cues: [
        "Question involves clocks, schedules, timetables, or time calculations",
        "Asks for elapsed time, arrival time, or time differences",
        "Involves converting between hours, minutes, and seconds"
      ],
      common_mistakes: [
        "Not accounting for the base-60 system: 1 hour = 60 minutes, not 100",
        "Errors when crossing midnight (12:00 AM) or noon (12:00 PM) in calculations",
        "Confusing AM and PM or 12-hour and 24-hour formats",
        "Not considering time zone differences in problems involving different locations"
      ],
      related_topics: ["Speed, Distance & Time (Kinematics)", "Word Problems with Variables", "Arithmetic with Integers"]
    },
    "Money & Finance": {
      concept_explanation: "Money problems in quantitative reasoning involve calculating costs, change, discounts, profit/loss, and best-value comparisons. They test practical numeracy in real-world financial contexts.",
      identification_cues: [
        "Question involves prices, costs, change, or financial calculations",
        "Asks for total cost, best value, or how much money is needed",
        "Involves discounts, taxes, tips, or currency conversions"
      ],
      common_mistakes: [
        "Rounding intermediate calculations and accumulating rounding errors",
        "Forgetting to include all costs (e.g., tax, delivery, or multiple items)",
        "Confusing 'per unit cost' comparisons when package sizes differ",
        "Not reading whether prices include or exclude GST/tax"
      ],
      related_topics: ["Fractions, Decimals & Percentages", "Word Problems with Variables", "Ratios & Proportions"]
    },
    "Mental Math Speed Tricks": {
      concept_explanation: "Mental maths tricks help you calculate faster in the non-calculator exam. Key techniques include: multiplying by 5 (÷ 2 then × 10), squaring numbers ending in 5, using compensation (e.g., 99 × 7 = 700 − 7), and splitting numbers.",
      identification_cues: [
        "Calculations that seem complex but have shortcuts",
        "Multiplying or dividing by numbers close to round values (99, 25, 50)",
        "Questions designed to test speed more than complexity"
      ],
      common_mistakes: [
        "Applying a trick incorrectly — always verify with estimation",
        "Trying to use mental tricks when the standard method would be faster",
        "Making errors in the compensation step (e.g., 99 × 7 = 100×7 − 7 = 693, not 703)",
        "Not practising enough — tricks only save time when they are automatic"
      ],
      related_topics: ["Arithmetic with Integers", "Fractions, Decimals & Percentages", "MCQ Elimination & Exam Strategy"]
    },
    "MCQ Elimination & Exam Strategy": {
      concept_explanation: "Exam strategy for quantitative reasoning MCQs includes: reading all options first, eliminating clearly wrong answers, estimating before calculating, and managing time effectively (about 1 minute per question).",
      identification_cues: [
        "Any multiple-choice question where you can eliminate options without full calculation",
        "Questions with widely spread answer options suited to estimation",
        "Complex problems where working backwards from answer choices is faster"
      ],
      common_mistakes: [
        "Spending too long on one question instead of moving on and returning later",
        "Not reading all answer options before starting to calculate",
        "Changing a correct answer to an incorrect one when second-guessing",
        "Not using answer choices strategically — substitute them back to check"
      ],
      related_topics: ["Mental Math Speed Tricks", "Arithmetic with Integers", "Solving for Unknowns"]
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // READING COMPREHENSION (9 topics)
  // ══════════════════════════════════════════════════════════════════════════
  reading: {
    "Finding Stated Information": {
      concept_explanation: "Stated information questions ask you to locate facts, details, or data explicitly mentioned in the passage. The answer is directly in the text — you do not need to infer or interpret.",
      identification_cues: [
        "Question asks 'according to the passage', 'the author states', or 'which fact is mentioned'",
        "The answer can be found by scanning the passage for key words from the question",
        "Involves locating specific details like names, numbers, dates, or descriptions"
      ],
      common_mistakes: [
        "Choosing an answer that sounds true but is not actually stated in the passage",
        "Not referring back to the passage — relying on memory instead of re-reading",
        "Confusing information from different parts of the passage",
        "Selecting an answer that uses the same words as the passage but changes the meaning slightly"
      ],
      related_topics: ["Sequencing & Details", "Making Inferences", "Finding & Using Evidence"]
    },
    "Sequencing & Details": {
      concept_explanation: "Sequencing questions ask you to identify the order of events or steps described in a passage. Detail questions require you to recall or locate specific information about characters, settings, or processes.",
      identification_cues: [
        "Question asks 'what happened first/next/last' or 'in what order'",
        "Involves arranging events from the passage chronologically",
        "Asks about specific details of a process, method, or sequence of actions"
      ],
      common_mistakes: [
        "Confusing the order in which events are mentioned with the order they occurred — authors may use flashbacks",
        "Not using time-signal words (first, then, before, after, finally) to track sequence",
        "Mixing up details from different events or characters",
        "Assuming chronological order when the passage uses a non-linear structure"
      ],
      related_topics: ["Finding Stated Information", "Making Inferences", "Text Structures"]
    },
    "Making Inferences": {
      concept_explanation: "Inference questions ask you to draw conclusions that are not directly stated but are strongly supported by evidence in the passage. Good inferences are logical extensions of what the text says, not wild guesses.",
      identification_cues: [
        "Question uses words like 'infer', 'imply', 'suggest', 'most likely', or 'can be concluded'",
        "The answer is not directly stated in the passage — you must read between the lines",
        "Requires combining multiple pieces of textual evidence to reach a conclusion"
      ],
      common_mistakes: [
        "Making inferences based on personal opinion or outside knowledge instead of the text",
        "Going too far beyond what the text supports — choose the most reasonable inference",
        "Confusing inference with stated information — if it's directly stated, it's not an inference",
        "Not identifying the specific text evidence that supports the inference"
      ],
      related_topics: ["Finding Stated Information", "Author's Purpose", "Finding & Using Evidence"]
    },
    "Vocabulary in Context": {
      concept_explanation: "These questions ask what a word or phrase means as it is used in a specific passage. The correct meaning depends on context — words often have multiple definitions, and the passage context determines which one applies.",
      identification_cues: [
        "Question asks 'as used in line X, the word ___ most nearly means'",
        "Involves a word with multiple possible meanings",
        "Tests whether you can determine meaning from surrounding text rather than relying on the most common definition"
      ],
      common_mistakes: [
        "Choosing the most common meaning without considering the specific context",
        "Not substituting the answer choice back into the sentence to check it makes sense",
        "Ignoring context clues in the sentences surrounding the target word",
        "Picking a definition that is correct in general but does not fit this passage"
      ],
      related_topics: ["Making Inferences", "Finding Stated Information", "Author's Purpose"]
    },
    "Author's Purpose": {
      concept_explanation: "Author's purpose questions ask why the author wrote the passage or used a particular technique. Common purposes include to inform, persuade, entertain, explain, or describe. Understanding purpose helps you interpret tone and structure.",
      identification_cues: [
        "Question asks 'why did the author write this passage' or 'what is the author's purpose'",
        "Asks about the reason for a specific detail, example, or structural choice",
        "Involves identifying the overall goal of the text (persuade, inform, entertain)"
      ],
      common_mistakes: [
        "Confusing the topic of the passage with the author's purpose — purpose is WHY they wrote it",
        "Not considering the overall tone and structure when determining purpose",
        "Choosing 'to entertain' for any narrative text — narrative can also inform or persuade",
        "Ignoring how specific details or examples serve the author's larger argument or message"
      ],
      related_topics: ["Tone & Mood", "Text Structures", "Making Inferences"]
    },
    "Tone & Mood": {
      concept_explanation: "Tone is the author's attitude toward the subject (e.g., critical, enthusiastic, sarcastic). Mood is the feeling the passage creates in the reader (e.g., suspenseful, peaceful, melancholic). Both are conveyed through word choice and style.",
      identification_cues: [
        "Question asks about the 'tone', 'attitude', or 'mood' of the passage or a section",
        "Involves identifying how the author feels about the topic",
        "Asks what feeling or atmosphere the passage creates"
      ],
      common_mistakes: [
        "Confusing tone (author's attitude) with mood (reader's feeling)",
        "Not paying attention to word choice (diction) that signals tone",
        "Choosing an extreme tone word when the passage is moderate or balanced",
        "Relying on one sentence instead of the overall passage to determine tone"
      ],
      related_topics: ["Author's Purpose", "Vocabulary in Context", "Finding & Using Evidence"]
    },
    "Text Structures": {
      concept_explanation: "Text structure is how information is organised within a passage. Common structures include chronological, cause-and-effect, compare-and-contrast, problem-solution, and description. Recognising structure helps you understand and locate information.",
      identification_cues: [
        "Question asks 'how is the passage organised' or 'what structure does the author use'",
        "Involves identifying signal words for specific structures (because, however, similarly, as a result)",
        "Asks about the relationship between different sections or paragraphs"
      ],
      common_mistakes: [
        "Not looking for signal words that indicate the structure type",
        "Confusing cause-and-effect with chronological order — not all sequences are causal",
        "Identifying the structure of one paragraph and applying it to the whole passage",
        "Not recognising that a passage can use multiple structures in different sections"
      ],
      related_topics: ["Author's Purpose", "Finding & Using Evidence", "Sequencing & Details"]
    },
    "Finding & Using Evidence": {
      concept_explanation: "Evidence questions ask you to identify which part of the text supports a given conclusion or answer. Strong evidence directly supports the claim and is specific (a quote or paraphrase from the passage), not a general impression.",
      identification_cues: [
        "Question asks 'which sentence best supports' or 'which evidence from the passage'",
        "Follows a previous question and asks you to justify your answer with text evidence",
        "Involves selecting the strongest piece of support for a claim"
      ],
      common_mistakes: [
        "Choosing evidence that is related to the topic but does not directly support the specific claim",
        "Selecting a quote that sounds important but addresses a different point",
        "Not distinguishing between strong evidence (directly supports) and weak evidence (vaguely related)",
        "Picking evidence from the wrong part of the passage"
      ],
      related_topics: ["Making Inferences", "Finding Stated Information", "Author's Purpose"]
    },
    "Reading Comprehension Exam Technique": {
      concept_explanation: "Effective exam technique for reading comprehension includes: reading the questions first, skimming the passage for structure, reading carefully for detail, and always referring back to the passage before selecting an answer.",
      identification_cues: [
        "Any reading comprehension question where time management or strategy affects performance",
        "Questions that test careful reading versus surface-level understanding",
        "Passages that are long or complex, requiring strategic reading"
      ],
      common_mistakes: [
        "Reading the passage slowly and thoroughly before looking at questions — read questions first to know what to look for",
        "Not referring back to the passage and relying on memory",
        "Spending too long on one question — flag it and move on, then return",
        "Changing answers without a strong reason — your first instinct is often correct"
      ],
      related_topics: ["Finding Stated Information", "Making Inferences", "Vocabulary in Context"]
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WRITING (9 topics)
  // ══════════════════════════════════════════════════════════════════════════
  writing: {
    "Essay Planning in 5 Minutes": {
      concept_explanation: "Spending 5 minutes planning before writing produces a better-structured, more coherent essay. A plan should include a brief introduction idea, 3-4 key points or plot events, and a strong ending concept.",
      identification_cues: [
        "When facing any writing prompt (creative or persuasive), planning is the first step",
        "Questions that give you a choice of prompts — planning helps you choose the best one",
        "Any timed writing task where structure and coherence are assessed"
      ],
      common_mistakes: [
        "Skipping the plan entirely and starting to write immediately — this leads to rambling",
        "Spending too long planning (more than 5 minutes) and not leaving enough writing time",
        "Planning too rigidly and not adapting if a better idea emerges while writing",
        "Not planning an ending — many students run out of time with no conclusion"
      ],
      related_topics: ["Strong Openings", "Building an Argument", "Common Writing Errors to Check"]
    },
    "Strong Openings": {
      concept_explanation: "A strong opening immediately captures the reader's attention and sets the tone for the essay. Effective techniques include starting with action, dialogue, a question, a vivid description, or a bold statement.",
      identification_cues: [
        "When writing any essay — the opening paragraph determines the reader's first impression",
        "Creative writing prompts where engagement and originality are marked",
        "Persuasive essays where the opening must hook the reader into the argument"
      ],
      common_mistakes: [
        "Starting with a boring, generic sentence like 'One day...' or 'This essay is about...'",
        "Beginning with dictionary definitions — overused and unoriginal",
        "Writing an opening that doesn't connect to the rest of the essay",
        "Making the opening too long — it should be concise and impactful (2-3 sentences max)"
      ],
      related_topics: ["Essay Planning in 5 Minutes", "Show, Don't Tell", "Vivid Vocabulary & Word Choice"]
    },
    "Show, Don't Tell": {
      concept_explanation: "'Show, don't tell' means using descriptive details, actions, and sensory language to convey emotions and scenes instead of stating them directly. Instead of 'She was scared', write 'Her hands trembled as she backed into the cold wall.'",
      identification_cues: [
        "When writing creative/narrative essays where description is marked",
        "Any scene involving emotions, settings, or character reactions",
        "Prompts that reward vivid, engaging writing over plain statements"
      ],
      common_mistakes: [
        "Telling emotions directly ('He was angry') instead of showing them through actions and body language",
        "Overusing 'show don't tell' for every single detail — sometimes telling is more efficient",
        "Using clichéd descriptions ('butterflies in her stomach', 'heart pounding like a drum')",
        "Not engaging multiple senses — descriptions should include sight, sound, touch, smell, taste"
      ],
      related_topics: ["Vivid Vocabulary & Word Choice", "Figurative Language in Writing", "Dialogue & Character"]
    },
    "Dialogue & Character": {
      concept_explanation: "Effective dialogue reveals character personality, advances the plot, and creates authentic voices. Each character should speak differently based on their age, personality, and background. Use speech tags and actions to break up dialogue.",
      identification_cues: [
        "When writing creative/narrative essays with characters",
        "Prompts involving interactions, conflicts, or relationships between characters",
        "Any story where characters need to feel real and distinct"
      ],
      common_mistakes: [
        "Making all characters sound the same — each character needs a distinct voice",
        "Overusing 'said' or, conversely, using too many fancy alternatives ('exclaimed', 'ejaculated')",
        "Writing dialogue that is too realistic (including all the 'ums' and 'ahs') — dialogue should be polished",
        "Not punctuating dialogue correctly (comma before closing quotation mark, new speaker = new paragraph)"
      ],
      related_topics: ["Show, Don't Tell", "Strong Openings", "Vivid Vocabulary & Word Choice"]
    },
    "Building an Argument": {
      concept_explanation: "A strong argument has a clear position (thesis), supporting reasons with evidence, consideration of counterarguments, and a convincing conclusion. Each paragraph should present one key point with specific examples.",
      identification_cues: [
        "Persuasive or argumentative essay prompts",
        "Questions asking for your opinion or position on an issue",
        "Any task where you must convince the reader of a viewpoint"
      ],
      common_mistakes: [
        "Not having a clear thesis statement — your position should be obvious from the start",
        "Using only personal opinions without supporting evidence or examples",
        "Ignoring the counterargument — addressing opposing views strengthens your argument",
        "Repeating the same point in different words instead of making new, distinct arguments"
      ],
      related_topics: ["Persuasive Techniques", "Essay Planning in 5 Minutes", "Strong Openings"]
    },
    "Persuasive Techniques": {
      concept_explanation: "Persuasive techniques are strategies used to convince the reader. Key techniques include rhetorical questions, emotive language, repetition for emphasis, inclusive language ('we'), expert opinions, statistics, anecdotes, and the rule of three.",
      identification_cues: [
        "When writing persuasive or argumentative essays",
        "Prompts asking you to convince, argue, or advocate for a position",
        "Tasks that will be marked on how effectively you persuade the reader"
      ],
      common_mistakes: [
        "Overusing one technique (e.g., too many rhetorical questions becomes annoying)",
        "Using emotive language that is too extreme or melodramatic",
        "Making up statistics or facts — it's better to use general evidence than fake specifics",
        "Not varying persuasive techniques throughout the essay — use a mix for maximum effect"
      ],
      related_topics: ["Building an Argument", "Vivid Vocabulary & Word Choice", "Figurative Language in Writing"]
    },
    "Vivid Vocabulary & Word Choice": {
      concept_explanation: "Using precise, varied, and sophisticated vocabulary elevates your writing. Replace generic words with specific ones ('strolled' instead of 'walked', 'crimson' instead of 'red'). However, the word must fit naturally — forced big words hurt readability.",
      identification_cues: [
        "Any assessed writing task — vocabulary is always a marking criterion",
        "When revising or editing your draft for improvement",
        "Creative writing where description and word choice are especially important"
      ],
      common_mistakes: [
        "Using complex words incorrectly — a misused big word is worse than a simple correct one",
        "Overusing a thesaurus and choosing words that don't quite fit the context",
        "Being repetitive — using the same adjective or verb multiple times",
        "Using informal or slang words in formal/persuasive writing"
      ],
      related_topics: ["Show, Don't Tell", "Figurative Language in Writing", "Common Writing Errors to Check"]
    },
    "Figurative Language in Writing": {
      concept_explanation: "Figurative language in writing includes similes, metaphors, personification, hyperbole, and onomatopoeia. Used well, these devices create vivid imagery and emotional impact. The key is to use them purposefully, not excessively.",
      identification_cues: [
        "When writing creative or descriptive essays",
        "Scenes that call for vivid imagery or emotional intensity",
        "Any writing task where language techniques are part of the marking criteria"
      ],
      common_mistakes: [
        "Using too many figurative devices in one paragraph — it becomes overwhelming",
        "Relying on clichéd similes ('as cold as ice', 'as fast as lightning') — create original comparisons",
        "Mixing metaphors within the same passage (e.g., 'drowning in a sea of flames')",
        "Using figurative language that doesn't match the tone of the piece"
      ],
      related_topics: ["Vivid Vocabulary & Word Choice", "Show, Don't Tell", "Persuasive Techniques"]
    },
    "Common Writing Errors to Check": {
      concept_explanation: "Before finishing, check for common errors: spelling mistakes, incorrect punctuation (especially apostrophes and commas), run-on sentences, sentence fragments, inconsistent tense, and paragraphing issues. Leave 2-3 minutes for proofreading.",
      identification_cues: [
        "The final 2-3 minutes of any timed writing task",
        "When you notice your writing feels rushed or error-prone",
        "Any assessed writing task where accuracy contributes to the mark"
      ],
      common_mistakes: [
        "Not proofreading at all — even a quick read catches obvious errors",
        "Writing in one long paragraph instead of breaking into logical paragraphs",
        "Switching between past and present tense inconsistently",
        "Using apostrophes incorrectly — 'it's' (it is) vs 'its' (belonging to it)"
      ],
      related_topics: ["Essay Planning in 5 Minutes", "Vivid Vocabulary & Word Choice", "Strong Openings"]
    },
  },
};


// ─── Main logic ─────────────────────────────────────────────────────────────

function main() {
  const raw = fs.readFileSync(PACK_PATH, 'utf-8');
  const data = JSON.parse(raw);

  let updated = 0;
  let skipped = 0;
  let totalTopics = 0;

  for (const subject of data.subjects) {
    const subjectId = subject.id;
    const subjectContent = CONTENT[subjectId];

    if (!subjectContent) {
      console.log(`WARNING: No content defined for subject "${subjectId}"`);
      continue;
    }

    for (const category of subject.notes.categories) {
      for (const topic of category.topics) {
        totalTopics++;
        const title = topic.title;
        const content = subjectContent[title];

        if (!content) {
          console.log(`WARNING: No content for "${subjectId}" > "${title}"`);
          skipped++;
          continue;
        }

        let changed = false;

        // Add concept_explanation if missing
        if (!topic.concept_explanation && content.concept_explanation) {
          topic.concept_explanation = content.concept_explanation;
          changed = true;
        }

        // Add identification_cues if missing
        if (!topic.identification_cues && content.identification_cues) {
          topic.identification_cues = content.identification_cues;
          changed = true;
        }

        // Add common_mistakes if missing
        if (!topic.common_mistakes && content.common_mistakes) {
          topic.common_mistakes = content.common_mistakes;
          changed = true;
        }

        // Add related_topics if missing (always missing per stats)
        if (!topic.related_topics && content.related_topics) {
          topic.related_topics = content.related_topics;
          changed = true;
        }

        if (changed) {
          updated++;
        }
      }
    }
  }

  // Write updated JSON
  fs.writeFileSync(PACK_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  console.log(`\nDone!`);
  console.log(`  Total topics: ${totalTopics}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (no content defined): ${skipped}`);
}

main();
