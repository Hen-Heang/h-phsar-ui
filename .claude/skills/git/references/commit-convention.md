# Commit message rules

> The commit message convention referenced by the `/git commit` subcommand.
> Extracted from base-rule.md §7 「Git Commit 메시지 컨벤션」.

---

## Commit types

| Type | Format | Auto-detection condition |
|------|------|---------------|
| `ADD` | `ADD : {메시지}` | Only new files (A) |
| `CHANGE` | `CHANGE : {메시지}` | Modified files (M) present |
| `DELETE` | `DELETE : {메시지}` | Only deleted files (D) |
| `REVERT` | `REVERT : {메시지}` | User-specified only |
| `MERGE` | `MERGE : {메시지}` | User-specified only |

---

## Auto-detection algorithm

Analyze the `git diff --staged --name-status` result:

1. **Only A (Added)** → `ADD`
2. **Only D (Deleted)** → `DELETE`
3. **M (Modified) present, or A+D mixed** → `CHANGE`
4. **R (Rename) present** → `CHANGE` (renames are classified as modifications)
5. **User explicitly specifies a type** → use that type

---

## Final format

```
{TYPE} : {메시지} (#{현재브랜치})
```

> **Use HEREDOC:** the commit message may contain special characters (quotes, `$`, etc.), so commit using the HEREDOC form:
> ```bash
> git commit -m "$(cat <<'EOF'
> {TYPE} : {메시지} (#{현재브랜치})
> EOF
> )"
> ```

### Examples

```
ADD : 회원가입 API 구현 (#feature/1001)
```

```
CHANGE : 로그인 토큰 만료 시간 수정 (#feature/1002)
```

```
DELETE : 미사용 레거시 UserHelper 클래스 제거 (#feature/1003)
```

```
REVERT : 배포 오류로 인한 이전 커밋 되돌리기 (#hotfix/2001)
```

```
MERGE : feature/1001 → develop 병합
```

---

## Message-writing rules

1. **Write in Korean**
2. **End with a verb-noun form** (e.g. "구현", "수정", "제거", "추가")
3. **50 characters or fewer** recommended (excluding the branch tag)
4. Center the message on **why rather than what**
5. The branch tag `(#{branch})` is added automatically, so the user does not type it
