---
name: Auth and tenant lessons
description: Non-obvious authentication and workspace onboarding constraints discovered while validating HRMS access control.
---

JWTs must carry the employee relationship used by server-side attendance scoping; returning employeeId only in the login response is insufficient because protected requests are authorized from the token.

**Why:** The first isolation smoke test showed an employee receiving the full attendance list even though the login payload had an employeeId.

**How to apply:** When changing login claims or adding employee-scoped endpoints, test the protected request with a real employee token, not only the login response.