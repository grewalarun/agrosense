import { sendMessageChunkAction } from "@/lib/actions/admin";
import type { AdminMessage } from "@/lib/types";

// Sends a message chunk by chunk until nothing is waiting, reporting progress after each
// chunk. Stops at the first error and returns it with the latest known state.
export async function sendUntilDone(
  id: string,
  { retryFailed = false, onProgress }: { retryFailed?: boolean; onProgress: (message: AdminMessage) => void }
): Promise<{ message?: AdminMessage; error?: string }> {
  let last: AdminMessage | undefined;
  let retry = retryFailed;
  for (let i = 0; i < 1000; i++) {
    const result = await sendMessageChunkAction(id, retry);
    if (result.error !== undefined) return { message: last, error: result.error };
    retry = false;
    last = result.data;
    onProgress(last);
    if (last.status !== "SENDING" || last.pending === 0) return { message: last };
  }
  return { message: last };
}
