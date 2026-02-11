export function logErrors(errors: string[]): void {
  errors.forEach(err => console.log(`  - ${err}`))
}
