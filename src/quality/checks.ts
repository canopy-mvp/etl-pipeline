export function checkNullFields(record: Record<string, unknown>, required: string[]): string[] {
  return required.filter(field => record[field] == null);
}
