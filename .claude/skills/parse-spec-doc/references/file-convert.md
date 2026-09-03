# Work-request attachment conversion — parse-spec-doc reference

> Reference document of the parse-spec-doc skill. The formal entry point is `SKILL.md` (Skill tool invocation). This document covers the **work-request attachment handling flow + direct (bash) invocation reference**.

> Apply the procedure below **only when handed a work-request file** matching these patterns:
> - `work-{숫자}.md` (e.g. `work-079.md`, `work-123.md`)
> - `task-request.md`
>
> Follow the procedure below only for files named in the `참고 기획서 및 첨부 파일` section of such a file.

---

### Handling by supported file type

| Type | Extension | Handling |
| ---- | ------ | --------- |
| Presentation | `.pptx` | Script conversion (see the procedure below) |
| Word document | `.docx` | Script conversion (see the procedure below) |
| Spreadsheet | `.xlsx` | Script conversion (see the procedure below) |
| PDF | `.pdf` | Readable directly, no conversion |
| Figma | Figma URL | Readable directly, no conversion |
| Google document | Google Docs URL | Readable directly, no conversion |

---

### Conversion script

Text extraction from Office documents (pptx, docx, xlsx) is handled by a **unified script**.

- **Script location:** `.claude/skills/parse-spec-doc/scripts/convert-office.sh`
- **Conversion priority:** PowerShell .NET → Python → LibreOffice (automatic fallback)
- **Recommended invocation:** `Skill(skill="parse-spec-doc", args="filePath=... outputDir=... taskNumber=...")` — orchestrators (dev-interview/dev-plan/develop) go via the sub-skill. The direct bash invocation below is for debugging/manual use.

#### Usage

```bash
# stdout 출력 (기본)
bash .claude/skills/parse-spec-doc/scripts/convert-office.sh {파일경로}

# 파일로 출력
bash .claude/skills/parse-spec-doc/scripts/convert-office.sh {파일경로} {출력경로}
```

#### Examples

```bash
# PPTX 텍스트 추출 → stdout
bash .claude/skills/parse-spec-doc/scripts/convert-office.sh /c/work/기획서.pptx

# DOCX 텍스트 추출 → 마크다운 파일로 저장
bash .claude/skills/parse-spec-doc/scripts/convert-office.sh /c/work/요구사항.docx /tmp/요구사항.txt

# XLSX 텍스트 추출 → stdout
bash .claude/skills/parse-spec-doc/scripts/convert-office.sh /c/work/데이터.xlsx
```

#### Exit codes

| Code | Meaning |
| ---- | ---- |
| `0` | Success |
| `1` | Argument error or file missing |
| `2` | All conversion methods failed |

---

### On conversion failure

If the script fails with exit code `2` (all conversion methods failed):

1. **Ask the user whether to install the Python packages:**

> "Office 문서 변환에 필요한 Python 패키지가 설치되어 있지 않습니다. 설치하고 진행할까요?
> ```
> pip install python-pptx python-docx openpyxl
> ```"

- If approved → install, then rerun the script
- If declined → ask the user to convert manually and resubmit

---

### Flow summary

```
작업요청서 수신
  └─ 첨부 파일 확인
       ├─ PDF / Figma URL / Google Docs URL → 직접 읽기
       └─ pptx / docx / xlsx
              └─ bash .claude/skills/parse-spec-doc/scripts/convert-office.sh <파일경로>
                   ├─ 종료 코드 0 → 추출된 텍스트로 작업 진행
                   └─ 종료 코드 2 → Python 패키지 설치 여부 질문
                                      ├─ 승인 → pip install 후 재실행
                                      └─ 거부 → 사용자에게 수동 변환 요청
```
