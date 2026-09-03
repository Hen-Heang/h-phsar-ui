# 리뷰 출력 템플릿

> code-review 스킬의 Step 5에서 참조하는 ko/en 출력 템플릿.

<Template_KO>

```
## 🔍 Claude 코드 리뷰

> **대상**: {staged|unstaged|all|HEAD~N|파일경로}
> **분석 파일**: {n}개 ({추가}/{수정}/{삭제})
> **브랜치**: {current_branch}
> **프로젝트**: {감지된 프로젝트 목록}
> **이슈**: 🔴 {n} / 🟡 {n} / 🔵 {n}
> **TRUST**: Tested {n} / Reliable {n} / Unified {n} / Secured {n} / Trackable {n}

---

### 📋 요약
{전체 변경사항 2-3줄 요약}

---

### 🔎 상세 리뷰

#### `{파일경로}`
- 🔴 **[CONC-##]** Critical: {내용} — {사고ID} 회귀 위험 / 운영 경험
- 🟡 **[DATA-##]** Warning: {내용} — {사고ID} 운영 사례 / 운영 경험
- 🔴 **[C##][축]** Critical: {내용 + 개선 예시}
- 🟡 **[W##][축]** Warning: {내용}
- 🔵 **[S##][축]** Suggestion: {내용}

> **패턴 ID 표기 우선순위**:
> 1. 운영 안티패턴 매칭 시 — 룰 ID + (incident-log 등재 시) 사고ID (예: `[CONC-01] ... — {사고ID} 회귀 위험`, `[DATA-02] ... — {사고ID} 운영 사례`, `[RES-02] ... — 운영 경험`)
> 2. severity_rules 매칭 시 — 해당 ID (예: [C01], [W07a], [S01])
> 3. 휴리스틱 판정 시 — [H]
> 4. 축 태그 `[축]` — 매핑 단일출처 = `quality-charter.md`(팩 severity-rules 의 축 컬럼)

---

### 🗄️ 쿼리 변경 검증
{XML mapper 변경 없으면 이 섹션 생략}

#### `{쿼리ID}` — {XML 파일명}

**AS-IS**
\```sql
{원문 SQL}
\```

**문제점**
- {문제점 1 — 원인 + 영향 한 줄 요약}
- {문제점 2}

**TO-BE** ← 문제점이 있는 경우에만 출력
\```sql
{개선된 SQL}
\```

**해결방안**
- {방안 1 — 적용 시 기대 효과}
- {방안 2}

> 문제점이 없으면: ✅ 최적화 포인트 없음

---

### ✅ 잘된 점
{긍정적인 부분}

---

### 📝 팀 체크리스트 ({{config.customDocs.devGuide}} + settings.custom_checklist)
- ⚠️ {위반 항목} — {위반 내용}

> 위반 항목이 없으면: ✅ 모든 항목 충족

---

### 🚨 운영 안티패턴 매칭 ({{config.customDocs.antiPatterns}} — 빈 값 시 섹션 생략)

| ID | 카테고리 | 매칭 위치 | 유래 사례 |
|----|---------|---------|---------|
| {CONC-01} | Critical — 외부호출 변경 연산 멱등성 | `{파일경로}` | {사고ID} 회귀 위험 |
| {DATA-02} | Warning — DB 슬로우쿼리 도구 미설정 | `{파일경로}` | {사고ID} 운영 사례 |

> 매칭이 없으면: ✅ 운영 안티패턴 매칭 없음
> 룰셋 출처: `{{config.customDocs.antiPatterns}}`

---

### 💬 종합 의견
{요약}
**평가**: ✅ 커밋 가능 / 🟡 수정 후 재검토 / 🔴 수정 필요

---
<sub>🤖 Reviewed by Claude · 대상: {target} · 언어: 한국어</sub>
```

</Template_KO>

<Template_EN>

```
## 🔍 Claude Code Review

> **Target**: {staged|unstaged|all|HEAD~N|file_path}
> **Files Analyzed**: {n} ({added}/{modified}/{deleted})
> **Branch**: {current_branch}
> **Projects**: {detected project list}
> **Issues**: 🔴 {n} / 🟡 {n} / 🔵 {n}
> **TRUST**: Tested {n} / Reliable {n} / Unified {n} / Secured {n} / Trackable {n}

---

### 📋 Summary
{2-3 sentence summary}

---

### 🔎 Detailed Review

#### `{file_path}`
- 🔴 **[CONC-##]** Critical: {issue} — {incidentID} regression risk / operational experience
- 🟡 **[DATA-##]** Warning: {issue} — {incidentID} operational case / operational experience
- 🔴 **[C##][axis]** Critical: {issue + fix example}
- 🟡 **[W##][axis]** Warning: {issue}
- 🔵 **[S##][axis]** Suggestion: {idea}

> **Pattern ID priority**:
> 1. Incident anti-pattern match — rule ID + (if registered in incident-log) incidentID (e.g., `[CONC-01] ... — {incidentID} regression risk`, `[DATA-02] ... — {incidentID} operational case`, `[RES-02] ... — operational experience`)
> 2. severity_rules match — corresponding ID (e.g., [C01], [W07a], [S01])
> 3. Heuristic judgment — [H]
> 4. Axis tag `[axis]` — single source of truth = `quality-charter.md` (axis column in pack severity-rules)

---

### 🗄️ Query Change Validation
{Omit this section if no XML mapper files were changed}

#### `{queryId}` — {XML filename}

**AS-IS**
\```sql
{original SQL}
\```

**Issues**
- {Issue 1 — cause + impact summary in one line}
- {Issue 2}

**TO-BE** ← Include only if issues exist
\```sql
{improved SQL}
\```

**Recommendations**
- {Recommendation 1 — expected effect when applied}
- {Recommendation 2}

> If no issues: ✅ No optimization points found

---

### ✅ What's done well
{positive highlights}

---

### 📝 Team Checklist ({{config.customDocs.devGuide}} + settings.custom_checklist)
- ⚠️ {violated item} — {details}

> If no violations: ✅ All checks passed

---

### 🚨 Incident Anti-Pattern Matches ({{config.customDocs.antiPatterns}} — omit section if empty)

| ID | Category | Match Location | Origin Case |
|----|----------|---------------|-------------|
| {CONC-01} | Critical — External call mutating operation idempotency | `{file_path}` | {incidentID} regression risk |
| {DATA-02} | Warning — DB slow query tooling missing | `{file_path}` | {incidentID} operational case |

> If no matches: ✅ No incident anti-pattern matches
> Rule set source: `{{config.customDocs.antiPatterns}}`

---

### 💬 Overall Assessment
{summary}
**Verdict**: ✅ Ready to Commit / 🟡 Request Changes / 🔴 Changes Required

---
<sub>🤖 Reviewed by Claude · Target: {target} · Language: English</sub>
```

</Template_EN>
