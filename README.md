# ci-gen

CLI-генератор `.gitlab-ci.yml` из YAML-конфига. Сделан в 2023 году под типичный стек РФ: GitLab, Node 18 LTS, npm.

Пайплайн описывается декларативно, валидируется через zod и собирается стратегиями рендеринга.

Репозиторий: [ivano82ff-eng/ci-gen](https://github.com/ivano82ff-eng/ci-gen)

## Зачем

В командах на GitLab CE/EE руками копировать `.gitlab-ci.yml` из сервиса в сервис неудобно. `ci-gen` держит один YAML-источник и собирает пайплайн сам.

## Требования

- Node.js **18 LTS** (на 18-м и писалось)
- npm 9+

## Установка

```bash
npm install
# либо глобально, если пакет когда-нибудь окажется в npm
# npm install -g ci-gen
```

## Быстрый старт

```bash
npm install
npx ci-gen generate -i examples/ci-gen.yml -o .gitlab-ci.yml
```

Сгенерированный `.gitlab-ci.yml` руками лучше не править — правьте `ci-gen.yml` и гоняйте генератор ещё раз.

## Пример конфига

```yaml
project: my-service
nodeVersion: "18"

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

Полный пример: [`examples/ci-gen.yml`](examples/ci-gen.yml).

## Команды CLI

| Команда | Описание |
|---|---|
| `ci-gen generate` | Сгенерировать `.gitlab-ci.yml` из `ci-gen.yml` |
| `ci-gen generate -i path.yml` | Указать входной файл |
| `ci-gen generate -o out.yml` | Указать выходной файл |
| `ci-gen generate --template node\|python\|go` | Шаблон (по умолчанию `node`) |
| `ci-gen validate` | Проверить конфиг без записи файла |
| `ci-gen --verbose …` | Подробные логи с correlation id |
| `ci-gen --metrics …` | Метрики в формате Prometheus |

Код выхода: `0` ок, `1` ошибка чтения / валидации / генерации / записи.

```bash
npm run generate
npm run validate
npm test
npm run lint
npm run build
```

## Шаблоны

`nodeVersion` — версия языка шаблона. Для node в 2023 это обычно `18`.

| Шаблон | Пример | Image | Cache |
|---|---|---|---|
| `node` | [`examples/node.yml`](examples/node.yml) | `node:18-alpine` | `node_modules/` по `package-lock.json` |
| `python` | [`examples/python.yml`](examples/python.yml) | `python:3.11-alpine` | `.pip-cache/` |
| `go` | [`examples/go.yml`](examples/go.yml) | `golang:1.21-alpine` | `.go/pkg/mod/` |

## Архитектура

Слои (зависимости только внутрь):

```
cli  →  application  →  domain
            ↑
      infrastructure
```

Паттерны: Ports & Adapters, Template Method, Strategy, Factory + реестр.

Генератор печатает job'ы в порядке `build → test → deploy`.

## Метрики и логирование

Уровни: `info`, `warn`, `error`, с `--verbose` ещё `debug`. В каждой строке correlation id.

`--metrics` — счётчики Prometheus (Grafana скрейпит как обычно).

Sentry только при `SENTRY_DSN` и только на ошибке.

## Публикация

`prepublishOnly` гоняет `build` и `test`. В пакет уходит `dist/`.

Релиз 1.0.0: тег в git, GitLab CI публикует по `$CI_COMMIT_TAG` (`NPM_TOKEN`).

## CI

Основной контур — GitLab (`.gitlab-ci.yml` из `ci-gen.yml`). GitHub Actions лежит рядом, на всякий случай.

## Лицензия

MIT, 2023.
