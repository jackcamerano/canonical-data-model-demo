export interface ValidationSuccess<T> {
  ok: true
  data: T
}

export interface ValidationFailure {
  ok: false
  errors: string[]
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure
