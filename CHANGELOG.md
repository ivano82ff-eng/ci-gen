# Changelog

## 1.0.0 — 2023-11-18

Первый релиз. Писалось под GitLab, Node 18 LTS, Москва (UTC+3).

### Веха 1
- npm-пакет ESM с `bin`, `files`, `engines`.
- Чтение YAML, валидация zod, генерация `.gitlab-ci.yml`.
- Use case через `Result<T, E>`, CLI `generate -i/-o`.

### Веха 2
- Template Method + Strategy + Factory для job'ов `build` / `test` / `deploy`.
- Группировка stage в порядке build → test → deploy.
- Поля `image`, `rules`, `nodeVersion`.

### Веха 3
- Команда `validate`.
- Шаблоны `--template node|python|go`.
- Логи с уровнями и correlation id, `--verbose`, `--metrics`.
- Отправка ошибок в Sentry по `SENTRY_DSN`.
- GitLab CI (основной контур) и GitHub Actions, публикация по тегу.
