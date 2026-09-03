---
name: secrets-guard
description: 운영 설정 파일(YML/YAML/properties)과 암호화 토큰의 접근·복호화를 차단하는 보안 가드. develop·code-review·qa-test 가 세션 진입 시 호출한다. 사용자 발화 트리거 없음 — 다른 스킬이 위임 호출하는 내부 마이크로 스킬.
user-invocable: false
---

# secrets-guard — blocking access to production config · secrets

> **Purpose**: declares blocking rules so production environment config files and encrypted secret values are not accidentally exposed during code work.
>
> **Invoked from**: `/develop` step 3, `/code-review` security checks, `/qa-test` test-environment verification.
>
> **Irreversible rule**: in a session where this skill is active, the rules below are **never lifted.**

---

## Blocking rules

| Rule                        | Applied patterns                                                                | Behavior                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **No config file access**   | All `*.yml`·`*.yaml`·`*.properties`·`.env` (any location) — `.claude/**` config exempt, except `config/system.yaml`·`*.local.*` (deny-listed) | No opening via any tool — Read·Edit·Write·cat·grep etc.                                             |
| **No decrypting encrypted tokens** | Encrypted token formats (defined per language pack — e.g. wrapped token patterns) | No attempts to recover/decrypt the plaintext of encrypted values. When a file containing the pattern is found, do not quote the value in output |
| **No hard-coding encryption keys** | Encryption key fields (environment-variable injection targets — e.g. encryption-key config entries) | No hard-coding in code or config files. Only environment-variable / launch-argument injection allowed |
| **No sensitive file access** | `.env`, `.env.*`, `credentials.json`, `*.pem`, `*.p12`, `id_rsa`, `id_rsa.pub` | Enforced by settings.json deny. This skill blocks bypass attempts                                    |

> Config-file blocking (yaml/yml/properties/env, Read + shell) is the `check-file-access.sh` hook's job, with a `.claude/**` whitelist. `permissions.deny` carves the harness's own secrets (`config/system.yaml`·`*.local.*`) back out and OS-level blocks non-config secrets (`.env`·keys·certificates). Hooks and scripts still read `system.yaml` — they run as OS processes, not tool calls. This skill owns the **session policy declaration and the response to detected violations**.

---

## Enforcement mapping (deterministic enforcement)

This SKILL.md contains policy declarations only. Actual blocking is handled by deterministic hooks + settings.json deny — zero LLM inference.

| Blocking rule                     | Enforcement location                         | Behavior                                                                                                                   |
| --------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **PreToolUse file-access blocking** | `.claude/hooks/check-file-access.sh`         | On Read/Write/Edit/Bash/PowerShell calls, detect yml/yaml/properties/env paths → structured deny (JSON+exit 0). Whitelists all `.claude/**`·`.we-adp/**` config. Both Read and shell. |
| **PreToolUse postgres query blocking** | `.claude/hooks/check-postgres-query.sh`      | Deny-pattern matching on `mcp__postgres__query` calls                                                                       |
| **permissions.deny static patterns** | `.claude/settings.json` `permissions.deny[]` | `.env`/`.env.*`/`credentials.json`/`*.pem`/`*.p12`/`id_rsa` + harness secrets `config/system.yaml`·`*.local.yaml`·`settings.local.json` (broad config-extension blocking is the hook's job) |
| **settings.json hook registration** | `.claude/settings.json` `hooks.PreToolUse[]` | matcher: `Read\|Write\|Edit\|Bash\|PowerShell\|shell_command\|functions\.shell_command` + `mcp__postgres__query`           |

### Automatic blocking of bypass attempts

`check-file-access.sh` scans command bodies too: a protected path (`has_direct_protected_path`), a glob over one (`has_globbed_config_path`), or a file-reading searcher (`has_file_reading_searcher` — `grep`/`rg`/`Select-String`/`findstr`) is denied unless the search carries `*.yml`·`*.yaml`·`*.properties`·`.env` excludes or targets only `.claude/**`·`.we-adp/**`.

### On policy changes

To add a new blocking pattern:

1. Register the pattern in `.claude/settings.json` `permissions.deny[]`
2. If it must also be blocked inside shell command bodies, extend the regex in `check-file-access.sh`
3. Add one row to this SKILL.md's "Blocking rules" table

---

## When a config value is needed

Do not open the YML/properties file directly — **ask the user for the value**:

```
🚫 운영 설정 파일은 secrets-guard 정책으로 접근 차단됨.
   필요한 키: {kafka.bootstrap-servers}
   사용자 응답으로 값을 받아 진행한다.
```

---

## Applies equally to reference scopes

Even a reference scope allowed via `/develop --ref-read=X` gets these blocking rules unchanged. No distinction between main scope and reference scopes.

---

## Invocation

Orchestrator skills explicitly invoke this skill once at session entry:

```
# /develop SKILL.md
3단계: 호출 → secrets-guard
       본 세션에서 차단 규칙 활성. 위반 시 사용자 경고 후 작업 중단.
```

This skill is a **policy-declaration micro skill** with no separate external interface. Users never invoke it directly. The patterns are organization-agnostic — external adoption needs no change (extra patterns go through "On policy changes" above).
