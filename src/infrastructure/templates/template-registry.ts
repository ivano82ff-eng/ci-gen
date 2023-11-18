import type { TemplateRegistry } from '../../application/ports/template-registry.js';
import type { CiTemplate } from '../../application/ports/ci-template.js';
import type { TemplateName } from '../../domain/config.js';
import { GenerationError } from '../../domain/errors.js';
import type { Result } from '../../application/result.js';
import { err, ok } from '../../application/result.js';
import { NodeTemplate } from './node-template.js';
import { PythonTemplate } from './python-template.js';
import { GoTemplate } from './go-template.js';

const defaultTemplates: Readonly<Record<TemplateName, CiTemplate>> = {
  node: new NodeTemplate(),
  python: new PythonTemplate(),
  go: new GoTemplate(),
};

export class DefaultTemplateRegistry implements TemplateRegistry {
  constructor(
    private readonly templates: Readonly<Record<TemplateName, CiTemplate>> = defaultTemplates,
  ) {}

  get(name: TemplateName): Result<CiTemplate, GenerationError> {
    const template = this.templates[name];
    if (!template) {
      return err(
        new GenerationError(
          `Неизвестный шаблон "${name}". Доступны: ${this.names().join(', ')}`,
        ),
      );
    }
    return ok(template);
  }

  names(): readonly TemplateName[] {
    return Object.keys(this.templates) as TemplateName[];
  }
}
