# 국제 보안표준 카탈로그 (sec-standards)

> **기준판**: OWASP Top 10 2021 · CWE 엄선 부분집합. **기준일**: 2026-07.
> **출처**: OWASP <https://owasp.org/Top10/> · MITRE CWE <https://cwe.mitre.org/>.
> **용도(lazy-load)**: 코드리뷰에서 **보안축(S)** 지적이 발생할 때만 Read 한다. 세션 시작 로딩 파일 아님.
> **CVE는 여기 없음** — 라이브 피드라 [`dependency-scan-guide.md`](dependency-scan-guide.md)의 스캐너 연결로 처리.

---

## 1. OWASP Top 10 2021 (A01~A10)

> 각 항목은 대표 매핑 CWE를 동반한다. 언어팩 severity-rules 의 `표준` 열이 `OWASP-Axx:2021` 형태로 이 표를 가리킨다.

| ID | 이름 | 대표 CWE | 요지 |
|----|------|----------|------|
| A01:2021 | Broken Access Control | CWE-284, CWE-862, CWE-863, CWE-639, CWE-352 | 권한 경계 우회 — 인가 누락/부정확, IDOR, CSRF |
| A02:2021 | Cryptographic Failures | CWE-319, CWE-327, CWE-798, CWE-522 | 민감데이터 평문 전송·저장, 취약 암호, 자격증명 보호 미흡 |
| A03:2021 | Injection | CWE-79, CWE-89, CWE-78, CWE-94, CWE-95 | 신뢰불가 입력이 인터프리터로 — XSS/SQLi/OS/코드 인젝션 |
| A04:2021 | Insecure Design | CWE-209, CWE-256, CWE-522, CWE-770 | 설계 단계 결함 — 위협모델링·안전기본값 부재 |
| A05:2021 | Security Misconfiguration | CWE-16, CWE-611, CWE-732 | 잘못된 설정 — 과다권한, XXE, 불필요 기능 노출 |
| A06:2021 | Vulnerable and Outdated Components | CWE-1104, CWE-937 | 취약/구버전 컴포넌트 — 의존성 스캔 영역 |
| A07:2021 | Identification and Authentication Failures | CWE-287, CWE-306, CWE-384, CWE-798 | 인증 취약 — 세션 고정, 하드코딩 자격증명 |
| A08:2021 | Software and Data Integrity Failures | CWE-502, CWE-829, CWE-494 | 무결성 검증 없는 역직렬화·업데이트·CI/CD |
| A09:2021 | Security Logging and Monitoring Failures | CWE-117, CWE-532, CWE-778 | 로깅 부족·로그 위변조·민감정보 로그 노출 |
| A10:2021 | Server-Side Request Forgery (SSRF) | CWE-918 | 서버가 검증 없이 원격 자원 요청 |

---

## 2. CWE 엄선 표 (웹/앱 개발 관련)

> 전체 900+ 중 리뷰에서 자주 인용되는 부분집합. 언어팩 severity-rules 의 `표준` 열이 `CWE-xx` 로 이 표를 가리킨다.

| CWE | 이름 | 연관 OWASP | 축 힌트 |
|-----|------|-----------|---------|
| CWE-20 | Improper Input Validation | A03 | S |
| CWE-22 | Path Traversal | A01 | S |
| CWE-78 | OS Command Injection | A03 | S |
| CWE-79 | Cross-site Scripting (XSS) | A03 | S |
| CWE-89 | SQL Injection | A03 | S |
| CWE-94 | Code Injection | A03 | S |
| CWE-95 | Eval Injection | A03 | S |
| CWE-200 | Exposure of Sensitive Information | A01/A02 | S |
| CWE-209 | Error Message Containing Sensitive Info | A04 | S |
| CWE-269 | Improper Privilege Management | A01 | S |
| CWE-284 | Improper Access Control | A01 | S |
| CWE-287 | Improper Authentication | A07 | S |
| CWE-295 | Improper Certificate Validation | A02 | S |
| CWE-306 | Missing Authentication for Critical Function | A07 | S |
| CWE-319 | Cleartext Transmission of Sensitive Info | A02 | S |
| CWE-327 | Use of a Broken or Risky Cryptographic Algorithm | A02 | S |
| CWE-352 | Cross-Site Request Forgery (CSRF) | A01 | S |
| CWE-384 | Session Fixation | A07 | S |
| CWE-434 | Unrestricted Upload of File with Dangerous Type | A04 | S |
| CWE-502 | Deserialization of Untrusted Data | A08 | S |
| CWE-522 | Insufficiently Protected Credentials | A02/A07 | S |
| CWE-532 | Insertion of Sensitive Information into Log File | A09 | S |
| CWE-601 | URL Redirection to Untrusted Site (Open Redirect) | A01 | S |
| CWE-611 | Improper Restriction of XML External Entity (XXE) | A05 | S |
| CWE-639 | Authorization Bypass Through User-Controlled Key (IDOR) | A01 | S |
| CWE-732 | Incorrect Permission Assignment for Critical Resource | A05 | S |
| CWE-770 | Allocation of Resources Without Limits or Throttling | A04 | S |
| CWE-778 | Insufficient Logging | A09 | S |
| CWE-798 | Use of Hard-coded Credentials | A02/A07 | S |
| CWE-862 | Missing Authorization | A01 | S |
| CWE-863 | Incorrect Authorization | A01 | S |
| CWE-915 | Improperly Controlled Modification of Object Attributes (Mass Assignment) | A08 | S |
| CWE-918 | Server-Side Request Forgery (SSRF) | A10 | S |

---

## 3. 사용 규약

- **매핑 방향**: 언어팩 `severity-rules.md` 의 보안축(S) 규칙 `표준` 열 → 본 카탈로그 ID. 예: `C04(XSS) → CWE-79 / OWASP-A03:2021`.
- **출력 표기**: 리뷰 지적 시 `내부코드 + CWE + OWASP + 카탈로그 근거`를 함께 낸다. (예: `[C04] XSS — CWE-79 / OWASP-A03:2021`)
- **의존성 위험(CVE)**: 본 카탈로그가 아니라 [`dependency-scan-guide.md`](dependency-scan-guide.md) 로 안내한다.
- **갱신**: 정적 카탈로그. OWASP 개정·새 CWE 반영은 후속 후크 과제(§ pack.yaml 주석).
