// problem-details.ts

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: unknown;
}

export interface ValidationProblemDetails extends ProblemDetails {
  errors: Record<string, string[]>;
}

export function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'type'     in value ||
    'title'    in value ||
    'status'   in value ||
    'detail'   in value ||
    'instance' in value
  );
}

export function isValidationProblemDetails(value: unknown): value is ValidationProblemDetails {
  if (!isProblemDetails(value)) return false;
  const v = value as ValidationProblemDetails;
  return typeof v.errors === "object" && v.errors !== null;
}

export function getFirstError(problem: ProblemDetails): string | null {
  if (isValidationProblemDetails(problem)) {
    return Object.values(problem.errors)[0]?.[0] ?? null;
  } else {
    return problem.detail ?? null;
  }
}
