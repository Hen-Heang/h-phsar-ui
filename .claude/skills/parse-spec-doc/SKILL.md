---
name: parse-spec-doc
description: |
  기획서 파일(PDF/PPTX/DOCX/XLSX/XLS)을 UTF-8 텍스트로 변환. PowerShell .NET → Python → LibreOffice 다단 fallback.
  변환 실패 시 OCR/수동 변환 안내 반환.
  내부 전용 — 오케스트레이터(dev-interview/dev-plan/develop)가 호출한다. 사용자 직접 호출 비권장.
user-invocable: false
---

# parse-spec-doc

Converts Office documents and PDFs to UTF-8 plain text. The conversion logic is handled by deterministic shell scripts in `scripts/`; the LLM handles only branching and failure handling.

---

## Invocation

Only formal Skill tool invocation is supported.

```
Skill(skill="parse-spec-doc",
      args="filePath=c:/docs/기획서.pdf outputDir=target/tmp/pre_exp_999/ taskNumber=999")
```

- **Standard caller**: the Explore subagent. `Agent(subagent_type="Explore", prompt="Invoke Skill(skill='parse-spec-doc', args='...') and return result. No other tool calls.")`.
- Direct invocation from the main context is possible.
- **The file-Read invocation path is unsupported** — the Skill tool is the only formal entry point.

---

## Input contract

| Key          | Required | Meaning                                        | Example                   |
| ------------ | ---- | --------------------------------------------- | ------------------------- |
| `filePath`   | ✅   | Absolute path of the file to convert           | `c:/docs/기획서.pdf`      |
| `outputDir`  | ✅   | Output directory (workspace-relative). Auto-created. | `target/tmp/pre_exp_999/` |
| `taskNumber` | ✅   | Task number (used for the output filename prefix etc.) | `999`                     |

---

## Preload

Immediately on entering this sub-skill, Read the following files (re-confirm on your own invocation even if the orchestrator already loaded them):

- `.claude/config/project.yaml` — variables such as `tempDir`
- `.claude/docs/agents/common/security-policy.md` — forbidden files · self-reference policy

> Single source for global config: `.claude/config/project.yaml`. Single source for the security policy: `.claude/docs/agents/common/security-policy.md`.

---

## Security · access constraints

The full policy has a single source: `security-policy.md`. Specific to this sub-skill:

- Workspace root is read-only (except: Writes under `outputDir` are allowed — for saving conversion results).
- Refuse if the input file matches a `security-policy.md §2` forbidden pattern.
- No output to `target/designs/` · `target/sim/` · `target/samples/`.

> Spec documents are internal documents, so they are not treated as sensitive data.

---

## Playbook

1. **Pre-check** — confirm `filePath` exists. If not, return an error (`status: error_file_not_found`).
2. **Create the output directory** — `mkdir -p "{outputDir}"`.
3. **Branch by extension**:
   - `.pdf` → `bash .claude/skills/parse-spec-doc/scripts/pdf-to-text.sh "{filePath}" "{outputDir}/parsed_doc.txt"`
   - `.pptx` / `.docx` / `.xlsx` / `.xls` → `bash .claude/skills/parse-spec-doc/scripts/convert-office.sh "{filePath}" "{outputDir}/parsed_doc.txt"`
   - Any other extension → return an error (`status: error_unsupported_format`).
4. **Fallback handling** — convert-office.sh itself tries PowerShell → Python → LibreOffice in order. If all fail, return `status: ocr_required` + a guidance message.
5. **Result verification** — if the output file exists and its size > 0, `status: success`. If the text is empty, `status: empty_text_likely_image_pdf` + OCR guidance.

---

## Reference assets

| File                         | Purpose                                                                     |
| ---------------------------- | -------------------------------------------------------------------------- |
| `scripts/convert-office.sh`  | PPTX/DOCX/XLSX conversion (PowerShell .NET → Python → LibreOffice multi-stage fallback) |
| `scripts/pdf-to-text.sh`     | PDF → UTF-8 text conversion (pdftotext wrapper)                             |
| `references/file-convert.md` | Work-request attachment handling flow + direct bash invocation reference (debugging/manual use) |

---

## Output contract

```yaml
status: success | ocr_required | empty_text_likely_image_pdf | error_file_not_found | error_unsupported_format
parsedFile: {outputDir}/parsed_doc.txt   # success/empty/ocr_required 시
sizeBytes: 12345                          # success 시
message: |
  {추가 설명 또는 fallback 안내 — 사용자에게 노출 가능한 한 문단}
nextStep: |
  {호출자가 즉시 취해야 할 행동 — 예: "OCR 또는 화면 설명 요청", "수동 텍스트 제공 요청"}
```

### nextStep examples on failure

- `ocr_required` → "이미지 기반 문서입니다. OCR 도구로 텍스트 추출 후 재호출하거나, 화면 설명을 사용자에게 직접 요청하세요."
- `error_file_not_found` → "파일 경로 정정 요청. 사용자에게 절대 경로 재확인."
- `error_unsupported_format` → "지원 확장자: pdf, pptx, docx, xlsx, xls. 다른 형식은 수동 변환 후 .txt 로 전달 요청."
