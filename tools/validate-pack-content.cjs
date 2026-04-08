const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const strictDepth = args.includes('--strict-depth');
const packArgs = args.filter((arg) => arg !== '--strict-depth');

const rootDir = path.join(__dirname, '..');
const packPaths = packArgs.length > 0
  ? packArgs.map((packPath) => path.resolve(rootDir, packPath))
  : [path.join(rootDir, 'packs', 'vic-selective-exam.json')];

const depthTargets = {
  math: { minExamples: 2, requireWhyThisMatters: false, requireQuickCheck: false },
  verbal: { minExamples: 2, requireWhyThisMatters: true, requireQuickCheck: true },
  quantitative: { minExamples: 2, requireWhyThisMatters: true, requireQuickCheck: true },
  reading: { minExamples: 1, requireWhyThisMatters: true, requireQuickCheck: true },
  writing: { minExamples: 2, requireWhyThisMatters: true, requireQuickCheck: true },
};

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasQuickCheck(topic) {
  return isNonEmptyArray(topic.quick_check)
    || (topic.solving_strategy
      && typeof topic.solving_strategy === 'object'
      && !Array.isArray(topic.solving_strategy)
      && isNonEmptyArray(topic.solving_strategy.quick_check));
}

function hasSolvingSteps(topic) {
  return topic.solving_strategy
    && typeof topic.solving_strategy === 'object'
    && !Array.isArray(topic.solving_strategy)
    && isNonEmptyArray(topic.solving_strategy.steps);
}

function topicLabel(subject, category, topic) {
  return `${subject.id} / ${category.category} / ${topic.title || topic.id || '<untitled>'}`;
}

function validatePack(packPath) {
  const raw = fs.readFileSync(packPath, 'utf8');
  const pack = JSON.parse(raw);
  const errors = [];
  const warnings = [];

  if (!Array.isArray(pack.subjects) || pack.subjects.length === 0) {
    errors.push('Pack is missing a non-empty subjects array.');
    return { errors, warnings };
  }

  for (const subject of pack.subjects) {
    const categories = subject?.notes?.categories;
    if (!Array.isArray(categories) || categories.length === 0) {
      errors.push(`${subject?.id || '<unknown subject>'} is missing notes.categories.`);
      continue;
    }

    const depthTarget = depthTargets[subject.id] || { minExamples: 1, requireWhyThisMatters: false, requireQuickCheck: false };

    for (const category of categories) {
      if (!isNonEmptyString(category.category)) {
        errors.push(`${subject.id} has a category with no category name.`);
      }
      if (!Array.isArray(category.topics) || category.topics.length === 0) {
        errors.push(`${subject.id} / ${category.category || '<unnamed category>'} is missing topics.`);
        continue;
      }

      for (const topic of category.topics) {
        const label = topicLabel(subject, category, topic);

        if (!isNonEmptyString(topic.title)) {
          errors.push(`${label}: missing title.`);
        }
        if (!isNonEmptyString(topic.topic_id)) {
          errors.push(`${label}: missing topic_id.`);
        }
        if (!isNonEmptyString(topic.concept_explanation)) {
          errors.push(`${label}: missing concept_explanation.`);
        }
        if (!isNonEmptyArray(topic.identification_cues)) {
          errors.push(`${label}: missing identification_cues.`);
        }
        if (!hasSolvingSteps(topic)) {
          errors.push(`${label}: solving_strategy.steps must be a non-empty array.`);
        }
        if (!isNonEmptyArray(topic.tips_and_tricks)) {
          errors.push(`${label}: missing tips_and_tricks.`);
        }
        if (!isNonEmptyArray(topic.common_mistakes)) {
          errors.push(`${label}: missing common_mistakes.`);
        }
        if (!isNonEmptyArray(topic.related_topics)) {
          errors.push(`${label}: missing related_topics.`);
        }

        const exampleCount = Array.isArray(topic.examples) ? topic.examples.length : 0;
        if (exampleCount < depthTarget.minExamples) {
          warnings.push(
            `${label}: has ${exampleCount} example(s); target is ${depthTarget.minExamples}+ for ${subject.id}.`
          );
        }
        if (depthTarget.requireWhyThisMatters && !isNonEmptyString(topic.why_this_matters)) {
          warnings.push(`${label}: missing why_this_matters.`);
        }
        if (depthTarget.requireQuickCheck && !hasQuickCheck(topic)) {
          warnings.push(`${label}: missing quick_check.`);
        }
      }
    }
  }

  return { errors, warnings };
}

let totalErrors = 0;
let totalWarnings = 0;

for (const packPath of packPaths) {
  const relPath = path.relative(rootDir, packPath);
  const { errors, warnings } = validatePack(packPath);

  console.log(`\nValidating ${relPath}`);
  if (errors.length === 0) {
    console.log('  Schema: ok');
  } else {
    console.log(`  Schema errors: ${errors.length}`);
    for (const error of errors) {
      console.log(`  - ${error}`);
    }
  }

  if (warnings.length === 0) {
    console.log('  Depth warnings: none');
  } else {
    console.log(`  Depth warnings: ${warnings.length}`);
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }

  totalErrors += errors.length;
  totalWarnings += warnings.length;
}

console.log(`\nSummary: ${totalErrors} schema error(s), ${totalWarnings} depth warning(s)`);

if (totalErrors > 0 || (strictDepth && totalWarnings > 0)) {
  process.exit(1);
}
