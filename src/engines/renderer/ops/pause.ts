import type { PauseOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';

export async function pauseOp(op: PauseOp, ctx: RenderContext): Promise<void> {
  await ctx.sleep(op.data.ms);
}
