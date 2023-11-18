# ci-gen

CLI-генератор `.gitlab-ci.yml` из YAML-конфига. Пайплайн описывается декларативно, валидируется через zod и собирается стратегиями рендеринга.

Пакет: [ci-gen на npm](https://www.npmjs.com/package/ci-gen)

## Установка

```bash
npm install -g ci-gen
# или локально
npm install
```

Требуется Node.js >= 20.

## Быстрый старт

```bash
npm install
npx ci-gen generate -i examples/ci-gen.yml -o .gitlab-ci.yml
```

Источник правды — YAML-конфиг. Сгенерированный `.gitlab-ci.yml` руками не редактируют.

## Пример конфига

```yaml
project: my-service
nodeVersion: "20"

jobs:
  - name: install
    stage: build
    script:
      - npm ci
  - name: test
    stage: test
    script:
      - npm test -- --coverage
  - name: deploy
    stage: deploy
    script:
      - ./scripts/deploy.sh
    rules:
      - $CI_COMMIT_BRANCH == "main"
```

Полный пример со всеми тремя типами job'ов: [`examples/ci-gen.yml`](examples/ci-gen.yml).

## Команды CLI

| Команда | Описание |
|---|---|
| `ci-gen generate` | Сгенерировать `.gitlab-ci.yml` из `ci-gen.yml` |
| `ci-gen generate -i path.yml` | Указать входной файл |
| `ci-gen generate -o out.yml` | Указать выходной файл |
| `ci-gen generate --template node\|python\|go` | Выбрать шаблон (по умолчанию `node`) |
| `ci-gen validate` | Проверить конфиг без записи файла |
| `ci-gen validate -i path.yml` | Проверить указанный файл |
| `ci-gen --verbose …` | Подробные логи с correlation id |
| `ci-gen --metrics …` | Вывести метрики в Prometheus-формате |

Код выхода: `0` при успехе, `1` при ошибке чтения, валидации, генерации или записи.

Локальные npm-скрипты:

```bash
npm run generate
npm run validate
npm test
npm run lint
npm run build
```

## Шаблоны

`nodeVersion` — версия языка выбранного шаблона.

| Шаблон | Пример | Image | Cache |
|---|---|---|---|
| `node` (дефолт) | [`examples/node.yml`](examples/node.yml) | `node:20-alpine` | `node_modules/` по `package-lock.json` |
| `python` | [`examples/python.yml`](examples/python.yml) | `python:3.12-alpine` | `.pip-cache/` |
| `go` | [`examples/go.yml`](examples/go.yml) | `golang:1.22-alpine` | `.go/pkg/mod/` |

```bash
ci-gen generate -i examples/python.yml --template python
ci-gen generate -i examples/go.yml --template go
```

Новый шаблон добавляется отдельным классом и регистрацией в `DefaultTemplateRegistry`. Существующие шаблоны не меняются.

## Архитектура

Слои и направление зависимостей:

```
cli  →  application  →  domain
            ↑
      infrastructure
```

- **domain** — типы `Config`, `Job`, `Stage`, zod-схема, ошибки (`read`, `validation`, `generation`, `write`).
- **application** — порты, use case'ы, `Result<T, E>` вместо исключений.
- **infrastructure** — YAML, zod, генератор, fs, логгер, метрики, Sentry, шаблоны.
- **cli** — Commander, composition root в `src/cli/create-app.ts` и `src/index.ts`.

Зависимости идут только внутрь. Domain не знает о файловой системе и CLI.

Паттерны:

- **Ports & Adapters** — `ConfigRepository`, `ConfigValidator`, `CiGenerator`, `FileWriter`, `Logger`, `MetricsCollector`, `ErrorReporter`, `TemplateRegistry`.
- **Template Method** — `BaseJobRenderer.render()` задаёт заголовок, stage, image, rules, script; `renderExtras` — точка расширения.
- **Strategy** — `BuildJobRenderer` (cache для `install`), `TestJobRenderer` (coverage), `DeployJobRenderer` (environment); шаблоны `node` / `python` / `go`.
- **Factory + реестр** — `RendererFactory` выбирает стратегию по `stage` без цепочки `if`. Новый тип job'а — новый класс + `factory.register`, без правки существующих рендереров.

Генератор группирует job'ы по stage и печатает их в фиксированном порядке: `build → test → deploy`. В заголовке — комментарий о генерации, `default.image` и список `stages`.

## Метрики и логирование

Уровни логов: `info`, `warn`, `error`. С `--verbose` добавляется `debug`. Каждая строка содержит **correlation id** запуска, по нему можно собрать все сообщения одной генерации.

```
[b7c1e2a0-...] info: Сгенерировано: .gitlab-ci.yml
```

`--metrics` печатает счётчики в формате Prometheus (удобно скрейпить Grafana):

```
# HELP ci_gen_files_generated_total Number of generated CI files
# TYPE ci_gen_files_generated_total counter
ci_gen_files_generated_total 1
# HELP ci_gen_errors_total Number of errors by type
# TYPE ci_gen_errors_total counter
ci_gen_errors_total{type="read"} 0
ci_gen_errors_total{type="validation"} 0
ci_gen_errors_total{type="generation"} 0
ci_gen_errors_total{type="write"} 0
```

Ошибки уходят в Sentry только если задан `SENTRY_DSN` и только при реальной ошибке (успешный прогон ничего не шлёт).

```bash
SENTRY_DSN=https://public@o0.ingest.sentry.io/1 ci-gen generate
```

## Публикация

Пакет собирается в `dist/`. В npm попадают только `files: ["dist"]`. `prepublishOnly` прогоняет `build` и `test`.

Локальная проверка артефакта:

```bash
npm pack
npm install -g ./ci-gen-1.0.0.tgz
ci-gen --help
```

Релиз 1.0.0:

1. Тег `v1.0.0` в git.
2. GitLab CI и GitHub Actions публикуют пакет по тегу (`NPM_TOKEN`).
3. `npm publish --access public`.

## CI проекта

- GitLab: `.gitlab-ci.yml` (генерируется из `ci-gen.yml`).
- GitHub Actions: `.github/workflows/ci.yml`.
- Шаги: install / lint / build / test, публикация по тегу.
- Кэш `node_modules` ключуется по `package-lock.json`.

## Лицензия

MIT
