export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

export interface ValidationProblemDetails extends ProblemDetails {
  errors?: Record<string, string[]>;
}

export function isValidationProblemDetails(problem: ProblemDetails): problem is ValidationProblemDetails {
  return 'errors' in problem && problem.errors !== undefined;
}

export function getFirstError(problem: ProblemDetails): string | undefined | null {
  if (isValidationProblemDetails(problem)) {
    return Object.values(problem)?.[0]?.[0];
  } else {
    return problem.detail;
  }
}
