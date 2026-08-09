import { apiFetch } from "./client";

export interface RoutineStep {
  id: string;
  productId: string;
  productName: string;
  stepOrder: number;
  completed: boolean;
}

export interface Routine {
  id: string;
  name: string;
  timeOfDay: "morning" | "evening";
  steps: RoutineStep[];
}

export function getMyRoutines() {
  return apiFetch<Routine[]>("/routines/me");
}

export function logRoutineStep(stepId: string, completed: boolean) {
  return apiFetch(`/routine-steps/${stepId}/log`, {
    method: "POST",
    body: JSON.stringify({ completed }),
  });
}

export interface CreateRoutineInput {
  name: string;
  timeOfDay: "morning" | "evening";
  productIds: string[];
}

export function createRoutine(data: CreateRoutineInput) {
  return apiFetch<Routine>("/routines", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteRoutine(id: string) {
  return apiFetch(`/routines/${id}`, { method: "DELETE" });
}
