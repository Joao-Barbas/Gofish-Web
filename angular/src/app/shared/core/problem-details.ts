export interface ApplicationError {
  code: string;
  description: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

export interface ApplicationProblemDetails extends ProblemDetails {
  errors: ApplicationError[];
}

export interface ValidationProblemDetails extends ProblemDetails {
  errors: Record<string, string[]>;
}

export function isApplicationProblemDetails(
  problem: ProblemDetails
): problem is ApplicationProblemDetails {
  return "errors" in problem && Array.isArray(problem.errors);
}

export function isValidationProblemDetails(
  problem: ProblemDetails
): problem is ValidationProblemDetails {
  return "errors" in problem && !Array.isArray(problem.errors);
}
