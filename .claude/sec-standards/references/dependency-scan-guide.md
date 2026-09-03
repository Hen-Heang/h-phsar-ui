# 의존성 취약점(CVE) 스캔 가이드 (sec-standards)

> **왜 CVE는 목록으로 굽지 않는가**: CWE/OWASP는 거의 안 변하는 "분류표"라 카탈로그에 실을 수 있지만,
> CVE는 매일 수만 건 갱신되는 "라이브 피드"라 팩에 목록을 넣는 순간 낡는다.
> 따라서 CVE는 **의존성 스캐너**가 실시간으로 잡는 영역으로 두고, 여기서는 스택별 스캐너 연결만 안내한다.
> **lazy-load**: 리뷰가 의존성 위험을 다뤄야 할 때만 Read.

---

## 스택별 스캐너

| 스택 | 스캐너 | 대표 명령 |
|------|--------|-----------|
| Node/npm | npm audit | `npm audit` / `npm audit fix` |
| Node/pnpm | pnpm audit | `pnpm audit` |
| Java/Maven·Gradle | OWASP Dependency-Check | `dependency-check --scan .` |
| Python | pip-audit | `pip-audit` |
| 언어무관(컨테이너·바이너리 포함) | Trivy | `trivy fs .` / `trivy image <img>` |
| Ruby | bundler-audit | `bundle audit check --update` |
| Go | govulncheck | `govulncheck ./...` |
| PHP/Composer | Composer audit | `composer audit` |
| .NET | dotnet list package --vulnerable | `dotnet list package --vulnerable` |

## 리뷰 시 안내 규칙

- 코드리뷰 스킬/에이전트는 CVE를 직접 열거하지 않는다. 대신 **위 스택에 맞는 스캐너 실행을 권고**한다.
- 스캐너가 보고한 CVE는 해당 CVE의 CWE 매핑을 통해 [`standards-catalog.md`](standards-catalog.md) OWASP A06(취약/구버전 컴포넌트)과 연결된다.

## 후속 과제(범위 밖 — 자리만 남김)

- **후크 자동화**: 주기 후크가 공식 OWASP/CWE 피드와 대조해 "판 바뀜/새 CWE"를 알린다.
  검사 항목: ① OWASP Top 10 판번호 변경 ② standards-catalog.md 미수록 신규 CWE ③ authoredFrom URL 접근성.
  사내 TLS(Somansa CA) 제약은 그때 fetch 이슈로 처리(NODE_EXTRA_CA_CERTS).
- 이번 구현에서는 **후크를 만들지 않는다.** 이 문단이 후크가 놓일 자리와 검사 항목의 명세다.
