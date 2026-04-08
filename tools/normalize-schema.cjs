/**
 * Normalize pack notes schema:
 * 1. Unify field names (golden_rule→golden_rules, concept→concept_explanation, etc.)
 * 2. Fix type inconsistencies (solving_strategy object→array, definitions array→object, etc.)
 * 3. Merge duplicate fields (formulas + key_formulas → key_formulas)
 * 4. Ensure description/concept_explanation consistency
 * 5. Normalize example format (solution→solution_steps)
 *
 * Run: node tools/normalize-schema.cjs
 */

const fs = require('fs');
const path = require('path');

const PACK_PATH = path.join(__dirname, '..', 'packs', 'vic-selective-exam.json');
const d = JSON.parse(fs.readFileSync(PACK_PATH, 'utf8'));

let changes = 0;

function log(subj, topic, msg) {
  // Uncomment for verbose: console.log(`  [${subj}/${topic}] ${msg}`);
  changes++;
}

for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      const sid = subj.id;
      const tid = t.title || t.id;

      // === 1. FIELD RENAMES ===

      // golden_rule (string) → golden_rules (array)
      if (t.golden_rule && !t.golden_rules) {
        t.golden_rules = [t.golden_rule];
        delete t.golden_rule;
        log(sid, tid, 'golden_rule → golden_rules');
      }

      // key_rule (string) → key_rules (array)
      if (t.key_rule && !t.key_rules) {
        t.key_rules = [t.key_rule];
        delete t.key_rule;
        log(sid, tid, 'key_rule → key_rules');
      }

      // critical_rule (string) → key_rules (array, merge)
      if (t.critical_rule) {
        if (!t.key_rules) t.key_rules = [];
        if (Array.isArray(t.key_rules)) t.key_rules.push(t.critical_rule);
        delete t.critical_rule;
        log(sid, tid, 'critical_rule → key_rules');
      }

      // concept (string) → concept_explanation
      if (t.concept && !t.concept_explanation) {
        t.concept_explanation = t.concept;
        delete t.concept;
        log(sid, tid, 'concept → concept_explanation');
      }

      // description → concept_explanation (if no concept_explanation exists)
      // Keep description as-is if concept_explanation also exists
      if (t.description && !t.concept_explanation) {
        t.concept_explanation = t.description;
        delete t.description;
        log(sid, tid, 'description → concept_explanation');
      }

      // formula (string) → key_formulas (array)
      if (t.formula && !t.key_formulas) {
        t.key_formulas = [t.formula];
        delete t.formula;
        log(sid, tid, 'formula → key_formulas');
      }

      // formulas → key_formulas (merge)
      if (t.formulas && !t.key_formulas) {
        t.key_formulas = Array.isArray(t.formulas) ? t.formulas : [t.formulas];
        delete t.formulas;
        log(sid, tid, 'formulas → key_formulas');
      } else if (t.formulas && t.key_formulas) {
        // Merge formulas into key_formulas
        const existing = Array.isArray(t.key_formulas) ? t.key_formulas : [t.key_formulas];
        const adding = Array.isArray(t.formulas) ? t.formulas : [t.formulas];
        t.key_formulas = [...existing, ...adding];
        delete t.formulas;
        log(sid, tid, 'formulas merged into key_formulas');
      }

      // basic_formula, fundamental_formula, derived_formulas → key_formulas
      for (const fk of ['basic_formula', 'fundamental_formula', 'derived_formulas',
                         'key_formula', 'key_equation', 'working_backwards_formula',
                         'average_speed_rule', 'combined_rate_rule', 'inverse_proportion_formula',
                         'expected_outcomes_formula', 'composite_shapes_rule',
                         'elapsed_time_method', 'elapsed_time_example']) {
        if (t[fk]) {
          if (!t.key_formulas) t.key_formulas = [];
          if (!Array.isArray(t.key_formulas)) t.key_formulas = [t.key_formulas];
          if (typeof t[fk] === 'string') {
            t.key_formulas.push(t[fk]);
          } else if (Array.isArray(t[fk])) {
            t.key_formulas.push(...t[fk]);
          }
          delete t[fk];
          log(sid, tid, fk + ' → key_formulas');
        }
      }

      // key_notes → key_rules
      if (t.key_notes && !t.key_rules) {
        t.key_rules = t.key_notes;
        delete t.key_notes;
        log(sid, tid, 'key_notes → key_rules');
      }

      // key_facts → key_rules
      if (t.key_facts && !t.key_rules) {
        t.key_rules = t.key_facts;
        delete t.key_facts;
        log(sid, tid, 'key_facts → key_rules');
      } else if (t.key_facts && t.key_rules) {
        if (Array.isArray(t.key_rules) && Array.isArray(t.key_facts)) {
          t.key_rules.push(...t.key_facts);
        }
        delete t.key_facts;
        log(sid, tid, 'key_facts merged into key_rules');
      }

      // common_traps → common_mistakes
      if (t.common_traps) {
        if (!t.common_mistakes) t.common_mistakes = [];
        if (!Array.isArray(t.common_mistakes)) t.common_mistakes = [t.common_mistakes];
        if (Array.isArray(t.common_traps)) {
          t.common_mistakes.push(...t.common_traps);
        } else {
          t.common_mistakes.push(t.common_traps);
        }
        delete t.common_traps;
        log(sid, tid, 'common_traps → common_mistakes');
      }

      // common_error_types → common_mistakes
      if (t.common_error_types) {
        if (!t.common_mistakes) t.common_mistakes = [];
        if (Array.isArray(t.common_error_types)) {
          t.common_mistakes.push(...t.common_error_types);
        }
        delete t.common_error_types;
        log(sid, tid, 'common_error_types → common_mistakes');
      }

      // solving_steps → solving_strategy (if no strategy exists)
      if (t.solving_steps && !t.solving_strategy) {
        t.solving_strategy = t.solving_steps;
        delete t.solving_steps;
        log(sid, tid, 'solving_steps → solving_strategy');
      } else if (t.solving_steps && t.solving_strategy) {
        delete t.solving_steps;
        log(sid, tid, 'removed duplicate solving_steps');
      }

      // identification_strategy → identification_cues
      if (t.identification_strategy && !t.identification_cues) {
        t.identification_cues = t.identification_strategy;
        delete t.identification_strategy;
        log(sid, tid, 'identification_strategy → identification_cues');
      }

      // what_it_looks_like → identification_cues
      if (t.what_it_looks_like) {
        if (!t.identification_cues) t.identification_cues = [];
        if (!Array.isArray(t.identification_cues)) t.identification_cues = [t.identification_cues];
        if (typeof t.what_it_looks_like === 'string') {
          t.identification_cues.push(t.what_it_looks_like);
        }
        delete t.what_it_looks_like;
        log(sid, tid, 'what_it_looks_like → identification_cues');
      }

      // key_principle → key_rules
      if (t.key_principle) {
        if (!t.key_rules) t.key_rules = [];
        if (!Array.isArray(t.key_rules)) t.key_rules = [t.key_rules];
        t.key_rules.push(t.key_principle);
        delete t.key_principle;
        log(sid, tid, 'key_principle → key_rules');
      }

      // useful_shortcuts → tips_and_tricks (merge)
      if (t.useful_shortcuts) {
        if (!t.tips_and_tricks) t.tips_and_tricks = [];
        if (Array.isArray(t.useful_shortcuts)) {
          for (const s of t.useful_shortcuts) {
            t.tips_and_tricks.push(typeof s === 'string' ? { tip: s, explanation: 'A useful shortcut for solving problems quickly.' } : s);
          }
        }
        delete t.useful_shortcuts;
        log(sid, tid, 'useful_shortcuts → tips_and_tricks');
      }

      // strategies → solving_strategy
      if (t.strategies && !t.solving_strategy) {
        t.solving_strategy = t.strategies;
        delete t.strategies;
        log(sid, tid, 'strategies → solving_strategy');
      } else if (t.strategies) {
        delete t.strategies;
        log(sid, tid, 'removed duplicate strategies');
      }

      // === 2. TYPE NORMALIZATION ===

      // solving_strategy: object → array
      if (t.solving_strategy && !Array.isArray(t.solving_strategy) && typeof t.solving_strategy === 'object') {
        // Convert object with steps/key_principle to array
        const obj = t.solving_strategy;
        const arr = [];
        if (obj.steps && Array.isArray(obj.steps)) arr.push(...obj.steps);
        if (obj.key_principle) arr.push(obj.key_principle);
        if (obj.description) arr.unshift(obj.description);
        t.solving_strategy = arr.length > 0 ? arr : [JSON.stringify(obj)];
        log(sid, tid, 'solving_strategy object → array');
      }

      // key_formulas: ensure array of strings
      if (t.key_formulas && !Array.isArray(t.key_formulas)) {
        if (typeof t.key_formulas === 'string') {
          t.key_formulas = [t.key_formulas];
        } else if (typeof t.key_formulas === 'object') {
          // Object with named formulas → flatten to array
          const arr = [];
          for (const [k, v] of Object.entries(t.key_formulas)) {
            if (typeof v === 'string') arr.push(`${k}: ${v}`);
            else if (Array.isArray(v)) arr.push(...v.map(x => typeof x === 'string' ? x : JSON.stringify(x)));
          }
          t.key_formulas = arr;
        }
        log(sid, tid, 'key_formulas normalized to array');
      }

      // problem_types: object → array of {type, description}
      if (t.problem_types && !Array.isArray(t.problem_types) && typeof t.problem_types === 'object') {
        t.problem_types = Object.entries(t.problem_types).map(([k, v]) => ({
          type: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: typeof v === 'string' ? v : JSON.stringify(v)
        }));
        log(sid, tid, 'problem_types object → array');
      }

      // === 3. EXAMPLE NORMALIZATION ===
      if (t.examples && Array.isArray(t.examples)) {
        for (const ex of t.examples) {
          // solution → solution_steps
          if (ex.solution && !ex.solution_steps) {
            ex.solution_steps = Array.isArray(ex.solution) ? ex.solution : [ex.solution];
            delete ex.solution;
            log(sid, tid, 'example solution → solution_steps');
          }
          // steps → solution_steps
          if (ex.steps && !ex.solution_steps) {
            ex.solution_steps = ex.steps;
            delete ex.steps;
            log(sid, tid, 'example steps → solution_steps');
          }
          // Ensure difficulty is a number
          if (ex.difficulty && typeof ex.difficulty === 'string') {
            ex.difficulty = parseInt(ex.difficulty) || 2;
            log(sid, tid, 'example difficulty string → number');
          }
          // Add default difficulty if missing
          if (!ex.difficulty) {
            ex.difficulty = 2;
          }
        }
      }

      // === 4. ENSURE MINIMUM FIELDS ===
      // Every topic should have at minimum: id, title, concept_explanation
      if (!t.concept_explanation && t.description) {
        t.concept_explanation = t.description;
        log(sid, tid, 'added concept_explanation from description');
      }
    }
  }
}

fs.writeFileSync(PACK_PATH, JSON.stringify(d, null, 2));
console.log('Schema normalized. Total field changes:', changes);

// Verify — count remaining non-canonical fields
const canonical = new Set([
  'id', 'title', 'curriculum_level', 'concept_explanation', 'description',
  'definitions', 'key_formulas', 'key_rules', 'golden_rules',
  'solving_strategy', 'identification_cues', 'common_mistakes',
  'tips_and_tricks', 'examples', 'problem_types',
  // Subject-specific but canonical
  'methods', 'operations', 'properties', 'laws', 'theorems',
  'number_types', 'triangle_types', 'sequence_types',
  'unit_conversions', 'magic_triangle',
  // Vocab/language specific
  'key_vocabulary', 'analogy_relationship_types', 'common_prefixes', 'common_suffixes',
  'key_latin_roots', 'key_greek_roots', 'common_homophones',
  'examples_of_multiple_meaning_words', 'parts_of_speech',
  'common_idioms', 'common_proverbs', 'commonly_misspelled_words',
  'common_letter_patterns', 'signal_words', 'context_clue_types',
  'question_types', 'common_coding_types', 'syllogism_patterns',
  'vocabulary_strategies', 'categories_to_consider', 'nuance_guide',
  'inference_framework', 'active_reading_steps', 'what_inference_is_not',
  'rules', 'techniques',
  // Math specific
  'divisibility_rules', 'prime_factorisation', 'hcf_methods', 'lcm_methods',
  'converting_mixed_improper', 'comparing_fractions', 'place_values',
  'conversion', 'benchmark_conversions', 'benchmark_fractions',
  'key_operations', 'sharing_in_ratio_steps', 'solving_steps_sharing',
  'direct_proportion', 'inverse_proportion', 'surds',
  'converting_to', 'converting_from', 'expanding', 'factorising_types',
  'word_problem_translations', 'worked_word_problem', 'word_to_maths_translations',
  'symbols', 'number_line',
  'key_angle_facts', 'angle_facts', 'parallel_lines_transversal', 'angle_sum',
  'congruence_conditions', 'similarity_conditions', 'similarity_properties',
  'pythagoras_theorem', 'pythagorean_triples', 'exterior_angle_theorem',
  'common_polygons', 'hierarchy_note', 'key_angles',
  'parallel_perpendicular', 'gradient_description', 'measures',
  'simple_interest', 'compound_interest', 'facts',
  'proportion_types', 'conversions', 'pi_approximations',
  'probability_rules', 'common_question_types',
  'technique_examples', 'sign_rules', 'bodmas_order', 'perfect_squares', 'perfect_cubes',
]);

let nonCanonical = 0;
for (const subj of d.subjects) {
  for (const cat of (subj.notes?.categories || [])) {
    for (const t of (cat.topics || [])) {
      for (const key of Object.keys(t)) {
        if (!canonical.has(key)) {
          console.log('  Non-canonical: ' + subj.id + '/' + t.title + ' → ' + key);
          nonCanonical++;
        }
      }
    }
  }
}
console.log('Remaining non-canonical fields:', nonCanonical);
