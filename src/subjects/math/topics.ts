import type { TopicGraph } from '@core/types/topic.js';

export const mathTopics: TopicGraph = {
  subject: 'math',
  roots: ['number', 'algebra', 'geometry', 'measurement', 'statistics', 'financial'],
  nodes: {
    // Number & Arithmetic
    'number': {
      id: 'number', title: 'Number & Arithmetic', prereqs: [],
      children: ['number.types', 'number.factors', 'number.operations', 'number.decimals'],
    },
    'number.types': { id: 'number.types', title: 'Types of numbers', prereqs: [] },
    'number.factors': { id: 'number.factors', title: 'Factors, multiples & divisibility', prereqs: ['number.types'] },
    'number.operations': { id: 'number.operations', title: 'Operations with integers', prereqs: ['number.types'] },
    'number.decimals': { id: 'number.decimals', title: 'Terminating & recurring decimals', prereqs: ['number.types'] },

    // Fractions, Decimals, Percentages
    'fractions': {
      id: 'fractions', title: 'Fractions, Decimals & Percentages', prereqs: ['number'],
      children: ['fractions.fractions', 'fractions.decimals', 'fractions.percentages'],
    },
    'fractions.fractions': { id: 'fractions.fractions', title: 'Fractions', prereqs: ['number.factors'] },
    'fractions.decimals': { id: 'fractions.decimals', title: 'Decimals', prereqs: [] },
    'fractions.percentages': { id: 'fractions.percentages', title: 'Percentages', prereqs: ['fractions.fractions', 'fractions.decimals'] },

    // Ratio & Proportion
    'ratio': {
      id: 'ratio', title: 'Ratio & Proportion', prereqs: ['fractions'],
      children: ['ratio.ratios', 'ratio.proportion', 'ratio.rates'],
    },
    'ratio.ratios': { id: 'ratio.ratios', title: 'Ratios', prereqs: [] },
    'ratio.proportion': { id: 'ratio.proportion', title: 'Direct & inverse proportion', prereqs: ['ratio.ratios'] },
    'ratio.rates': { id: 'ratio.rates', title: 'Rates — speed, distance & time', prereqs: ['ratio.ratios'] },

    // Powers & Surds
    'powers': {
      id: 'powers', title: 'Powers, Roots & Surds', prereqs: ['number'],
      children: ['powers.index-laws', 'powers.surds', 'powers.scientific', 'powers.logarithms'],
    },
    'powers.index-laws': { id: 'powers.index-laws', title: 'Index laws', prereqs: [] },
    'powers.surds': { id: 'powers.surds', title: 'Square roots, cube roots & surds', prereqs: ['powers.index-laws'] },
    'powers.scientific': { id: 'powers.scientific', title: 'Scientific notation', prereqs: ['powers.index-laws'] },
    'powers.logarithms': { id: 'powers.logarithms', title: 'Logarithms', prereqs: ['powers.index-laws'] },

    // Algebra
    'algebra': {
      id: 'algebra', title: 'Algebra', prereqs: ['number'],
      children: ['algebra.expressions', 'algebra.linear-equations', 'algebra.simultaneous',
                  'algebra.inequalities', 'algebra.quadratics', 'algebra.non-linear',
                  'algebra.fractions', 'algebra.polynomials'],
    },
    'algebra.expressions': { id: 'algebra.expressions', title: 'Expanding & factorising', prereqs: [] },
    'algebra.linear-equations': { id: 'algebra.linear-equations', title: 'Linear equations', prereqs: ['algebra.expressions'] },
    'algebra.simultaneous': { id: 'algebra.simultaneous', title: 'Simultaneous equations', prereqs: ['algebra.linear-equations'] },
    'algebra.inequalities': { id: 'algebra.inequalities', title: 'Inequalities', prereqs: ['algebra.linear-equations'] },
    'algebra.quadratics': { id: 'algebra.quadratics', title: 'Quadratic equations', prereqs: ['algebra.expressions'] },
    'algebra.non-linear': { id: 'algebra.non-linear', title: 'Non-linear graphs', prereqs: ['algebra.quadratics'] },
    'algebra.fractions': { id: 'algebra.fractions', title: 'Algebraic fractions', prereqs: ['algebra.expressions'] },
    'algebra.polynomials': { id: 'algebra.polynomials', title: 'Polynomials & factor theorem', prereqs: ['algebra.quadratics'] },

    // Sequences
    'sequences': {
      id: 'sequences', title: 'Sequences & Patterns', prereqs: ['algebra'],
      children: ['sequences.arithmetic', 'sequences.geometric', 'sequences.other'],
    },
    'sequences.arithmetic': { id: 'sequences.arithmetic', title: 'Arithmetic sequences', prereqs: [] },
    'sequences.geometric': { id: 'sequences.geometric', title: 'Geometric sequences', prereqs: [] },
    'sequences.other': { id: 'sequences.other', title: 'Other sequence types', prereqs: [] },

    // Geometry
    'geometry': {
      id: 'geometry', title: 'Geometry', prereqs: [],
      children: ['geometry.angles', 'geometry.triangles', 'geometry.pythagoras',
                  'geometry.similarity', 'geometry.quadrilaterals', 'geometry.polygons',
                  'geometry.circles', 'geometry.transformations', 'geometry.scale',
                  'geometry.coordinate'],
    },
    'geometry.angles': { id: 'geometry.angles', title: 'Angle properties', prereqs: [] },
    'geometry.triangles': { id: 'geometry.triangles', title: 'Triangles', prereqs: ['geometry.angles'] },
    'geometry.pythagoras': { id: 'geometry.pythagoras', title: "Pythagoras' theorem", prereqs: ['geometry.triangles'] },
    'geometry.similarity': { id: 'geometry.similarity', title: 'Similarity & congruence', prereqs: ['geometry.triangles'] },
    'geometry.quadrilaterals': { id: 'geometry.quadrilaterals', title: 'Quadrilaterals', prereqs: ['geometry.angles'] },
    'geometry.polygons': { id: 'geometry.polygons', title: 'Polygons', prereqs: ['geometry.quadrilaterals'] },
    'geometry.circles': { id: 'geometry.circles', title: 'Circle theorems', prereqs: ['geometry.angles'] },
    'geometry.transformations': { id: 'geometry.transformations', title: 'Transformations', prereqs: [] },
    'geometry.scale': { id: 'geometry.scale', title: 'Scale drawings & maps', prereqs: ['ratio.ratios'] },
    'geometry.coordinate': { id: 'geometry.coordinate', title: 'Coordinate geometry', prereqs: ['algebra.linear-equations'] },

    // Measurement
    'measurement': {
      id: 'measurement', title: 'Measurement', prereqs: ['geometry'],
      children: ['measurement.perimeter', 'measurement.area', 'measurement.surface-area',
                  'measurement.volume', 'measurement.composite'],
    },
    'measurement.perimeter': { id: 'measurement.perimeter', title: 'Perimeter & circumference', prereqs: [] },
    'measurement.area': { id: 'measurement.area', title: 'Area', prereqs: ['measurement.perimeter'] },
    'measurement.surface-area': { id: 'measurement.surface-area', title: 'Surface area', prereqs: ['measurement.area'] },
    'measurement.volume': { id: 'measurement.volume', title: 'Volume', prereqs: ['measurement.area'] },
    'measurement.composite': { id: 'measurement.composite', title: 'Composite solids', prereqs: ['measurement.volume', 'measurement.surface-area'] },

    // Statistics & Probability
    'statistics': {
      id: 'statistics', title: 'Statistics & Probability', prereqs: ['number'],
      children: ['statistics.data', 'statistics.probability'],
    },
    'statistics.data': { id: 'statistics.data', title: 'Data analysis & representation', prereqs: [] },
    'statistics.probability': { id: 'statistics.probability', title: 'Probability', prereqs: [] },

    // Financial
    'financial': {
      id: 'financial', title: 'Financial Mathematics', prereqs: ['fractions.percentages'],
      children: ['financial.interest', 'financial.profit-loss'],
    },
    'financial.interest': { id: 'financial.interest', title: 'Simple & compound interest', prereqs: [] },
    'financial.profit-loss': { id: 'financial.profit-loss', title: 'Profit, loss & discount', prereqs: [] },
  },
};
