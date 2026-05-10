/**
 * Минимальный шаблонизатор, совместимый по синтаксису с Mustache/Liquid
 * для простых переменных:   `{{ student.fio }}`, `{{ amount }}`.
 *
 * Намеренно без зависимостей: нам пока нужна только подстановка по
 * dotted-path. Условий/циклов — нет. Когда понадобится — заменим на
 * handlebars/mustache, API-совместимость гарантирована.
 */

const TAG = /\{\{\s*([a-zA-Z_][\w.]*)\s*\}\}/g;

export function renderTemplate(
  template: string,
  variables: Record<string, unknown> | null | undefined,
): string {
  if (!template) return '';
  if (!variables) return template;

  return template.replace(TAG, (full, path: string) => {
    const value = resolvePath(variables, path);
    if (value == null) return '';
    return String(value);
  });
}

function resolvePath(source: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = source;
  for (const key of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}
