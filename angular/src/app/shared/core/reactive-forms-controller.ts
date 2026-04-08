/* reactive-forms-controller.ts */

import { AbstractControl, FormGroup } from "@angular/forms";
import { getFirstError, isValidationProblemDetails, ProblemDetails, ValidationProblemDetails } from "@gofish/shared/core/problem-details";

// TODO: We lost type safety. But oh well this is nice

export class FormErrorMessages {
  private _controls?: Record<string, Record<string, string>>;
  private _group?: Record<string, string>;

  constructor(messages: {
    controls?: Record<string, Record<string, string>>
    group?: Record<string, string>
  } = {}){
    this._controls = messages.controls;
    this._group = messages.group;
  }

  get controls(): Record<string, Record<string, string>> | undefined { return this._controls; }
  get group(): Record<string, string> | undefined { return this._group; }
};

export class ReactiveFormsController<TControl extends { [K in keyof TControl]: AbstractControl<any>; } = any> {
  private _messages?: FormErrorMessages;
  private _problems?: ProblemDetails;

  private _form: FormGroup<TControl>;

  constructor(form: FormGroup<TControl>, messages?: FormErrorMessages){
    this._form = form;
    this._messages = messages;
  }

  get messages(): FormErrorMessages | undefined { return this._messages; }
  get form(): FormGroup<TControl> { return this._form; }

  private applyProblemDetails(problems: ProblemDetails): void {
    // Field-level errors from API (e.g. { errors: { Email: ["Already taken"] } })
    if (isValidationProblemDetails(problems)) {
      for (let [field, messages] of Object.entries(problems.errors)) {
        let control = this._form.get(field.toLowerCase()) ?? this._form.get(field);
        if (!control) continue;
        control.setErrors({ api: messages[0] });
        control.markAsTouched();
      }
    }
    // General error (not tied to a field)
    if (problems.detail) {
      this._form.setErrors({ api: problems.detail });
    }
  }

  setProblemDetails(problems: ProblemDetails | ValidationProblemDetails | null | undefined): void {
    this._problems = problems ?? undefined;
    if (problems) this.applyProblemDetails(problems);
  }

  private getFirstControllError(): string | null {
    if (!this._messages?.controls) return null;
    for (let [field, messages] of Object.entries(this._messages.controls)) {
      let control = this._form.get(field);
      if (!control) continue;
      if (control.valid || (!control.touched && !control.dirty)) continue;
      // Mapped client errors
      for (let [key, message] of Object.entries(messages)) {
        if (control.hasError(key)) return message;
      }
      // API errors
      if (control.hasError('api')) return control.getError('api');
    }
    return null;
  }

  private getFirstGroupError(): string | null {
    if (!this._messages?.group) return null;
    for (let [key, message] of Object.entries(this._messages.group)) {
      if (this._form.hasError(key)) return message;
    }
    return null;
  }

  getFirstError(): string | null {
    return this.getFirstControllError() // Control-level errors
      || this.getFirstGroupError() // Group-level errors
      || (this._form.hasError('api') && this._form.getError('api')) // API group-level
      || (this._problems && getFirstError(this._problems)) // Whatever API retuned we were unable to map
      || null; // WWE got nothing
  }
}
