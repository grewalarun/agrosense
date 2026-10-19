import { ApiError } from "@/lib/dal";

export type Result<T> = { data: T; error?: undefined } | { data?: undefined; error: string };

// Backend errors become a message for the form; anything else (including Next's
// redirect to /login when the session is gone) is rethrown.
export async function run<T>(request: () => Promise<T>): Promise<Result<T>> {
  try {
    return { data: await request() };
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
}
