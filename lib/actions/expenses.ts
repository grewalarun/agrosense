"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/dal";
import { type Result, run } from "@/lib/actions/run";
import type { Expense, ExpenseCategory } from "@/lib/types";

export type ExpenseInput = {
  category: ExpenseCategory;
  description?: string;
  notes?: string;
  amount: number;
  date: string;
};

export async function createExpenseAction(cycleId: string, input: ExpenseInput): Promise<Result<{ expenseId: string }>> {
  const result = await run(async () => {
    const { expense } = await apiFetch<{ expense: Expense }>(`/cycles/${encodeURIComponent(cycleId)}/expenses`, {
      method: "POST",
      body: input,
    });
    return { expenseId: expense._id };
  });
  if (result.data) revalidatePath("/", "layout");
  return result;
}

export async function deleteExpenseAction(expenseId: string): Promise<Result<null>> {
  const result = await run(async () => {
    await apiFetch(`/expenses/${encodeURIComponent(expenseId)}`, { method: "DELETE" });
    return null;
  });
  if (result.error === undefined) revalidatePath("/", "layout");
  return result;
}
