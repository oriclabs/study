import type { Op, OpKind } from '@core/types/op.js';
import type { RenderContext } from '../state.js';
import type { TTSAdapter } from '@platform/types.js';

import { writeOp } from './write.js';
import { labelOp } from './label.js';
import { strikeOp } from './strike.js';
import { eraseOp } from './erase.js';
import { drawOp } from './draw.js';
import { highlightOp } from './highlight.js';
import { pauseOp } from './pause.js';
import { graphOp } from './graph.js';
import { numberlineOp } from './numberline.js';
import { passageOp, annotateOp } from './passage.js';
import { createSpeakOp } from './speak.js';
import { moveOp, rotateOp, particlesOp, glowOp } from './motion.js';
import { symbolOp } from './symbols.js';
import { transformOp } from './transform.js';
import { tableOp } from './table.js';
import { mathOp } from './math-render.js';
import { moleculeOp, reactionOp, waveOp, fieldOp, diagramOp, processOp, circuitOp } from './science.js';

export type OpHandler = (op: Op, ctx: RenderContext) => Promise<void>;

export function buildOpRegistry(tts: TTSAdapter): Record<OpKind, OpHandler> {
  return {
    write: writeOp as OpHandler,
    label: labelOp as OpHandler,
    strike: strikeOp as OpHandler,
    erase: eraseOp as OpHandler,
    draw: drawOp as OpHandler,
    highlight: highlightOp as OpHandler,
    pause: pauseOp as OpHandler,
    graph: graphOp as OpHandler,
    numberline: numberlineOp as OpHandler,
    passage: passageOp as OpHandler,
    annotate: annotateOp as OpHandler,
    speak: createSpeakOp(tts) as OpHandler,
    move: moveOp as OpHandler,
    rotate: rotateOp as OpHandler,
    particles: particlesOp as OpHandler,
    glow: glowOp as OpHandler,
    symbol: symbolOp as OpHandler,
    transform: transformOp as OpHandler,
    table: tableOp as OpHandler,
    math: mathOp as OpHandler,
    molecule: moleculeOp as OpHandler,
    reaction: reactionOp as OpHandler,
    wave: waveOp as OpHandler,
    field: fieldOp as OpHandler,
    diagram: diagramOp as OpHandler,
    process: processOp as OpHandler,
    circuit: circuitOp as OpHandler,
  };
}
