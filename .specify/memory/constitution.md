<!--
Sync Impact Report - Constitution Update
════════════════════════════════════════
Version: 0.0.0 → 1.0.0
Rationale: Initial constitution establishment for Codex LLM UI project

Modified Principles:
  • All principles newly defined (initial version)

Added Sections:
  • Core Principles (3 principles: Quality-First Development, Developer Experience, Performance & Scalability)
  • Development Standards
  • Quality Gates
  • Governance

Removed Sections:
  • None (initial version)

Template Compatibility:
  ✅ plan-template.md - Constitution Check section present
  ✅ spec-template.md - User Scenarios & Testing aligns with Principle I
  ✅ tasks-template.md - Test-first workflow aligns with Principle I
  ✅ checklist-template.md - Compatible with quality standards
  ✅ agent-file-template.md - Compatible with documentation standards

Follow-up TODOs:
  • None - all placeholders filled

Change Summary:
  Initial constitution for Codex LLM UI, a web UI and API services project.
  Three core principles: (1) Quality-First Development with TDD, (2) Developer
  Experience through documentation and tooling, (3) Performance & Scalability
  with specific metrics.
-->

# Codex LLM UI Constitution

## Core Principles

### I. Quality-First Development (NON-NEGOTIABLE)

Test-Driven Development (TDD) is mandatory for all features. Tests MUST be written first,
reviewed and approved, verified to fail, and only then can implementation begin. The
Red-Green-Refactor cycle is strictly enforced.

**Integration Testing Requirements:**
- New API endpoint contract tests
- Frontend-backend integration tests
- State management tests for UI components
- External service integration tests

**Rationale:** For web UI + API projects, quality gates prevent regression and ensure
API contracts remain stable. TDD forces clear requirements and prevents scope creep.

### II. Developer Experience

Documentation is treated as a first-class deliverable. Every feature MUST include:
- Clear README or quickstart guide
- API documentation with request/response examples
- Inline code comments for non-obvious logic
- Architecture decision records (ADRs) for significant choices

**Tooling Requirements:**
- CLI commands for common development tasks
- Automated linting and formatting (enforced in CI/CD)
- Local development environment setup documented and scripted

**Rationale:** Web UI and API services involve multiple layers. Excellent documentation
and tooling reduce onboarding time and enable developers to move quickly across the stack.

### III. Performance & Scalability

Performance is a feature, not an afterthought. All features MUST meet defined performance
criteria before completion.

**Performance Targets:**
- API endpoints: < 200ms p95 response time
- Frontend: FCP < 1.5s, TTI < 3.5s
- Database queries: < 100ms indexed lookups, < 500ms complex joins
- Concurrent users: 1000+ without degradation

**Optimization Requirements:**
- Database query plans reviewed for N+1 problems
- Frontend bundle size monitored (< 500KB initial gzipped)
- API responses paginated for large datasets
- Caching strategy documented and implemented

**Rationale:** LLM UI applications handle real-time interactions and large payloads.
Performance directly impacts user experience and operational costs.

## Development Standards

**Technology Stack:**
- Stack decisions documented in plan.md Technical Context
- New dependencies require justification
- Breaking changes require version increment

**Code Organization:**
- Web app structure: `backend/src/` and `frontend/src/`
- Tests: `tests/contract/`, `tests/integration/`, `tests/unit/`
- Shared types/schemas in single source of truth

**Security:**
- All user inputs validated and sanitized
- Authentication/authorization at API gateway level
- Secrets via environment variables only
- OWASP Top 10 checked in reviews

## Quality Gates

All features MUST pass before merging:

1. **Constitution Compliance** - Verify alignment with core principles
2. **Test Coverage** - TDD workflow verified, all tests passing
3. **Documentation** - README/quickstart complete
4. **Performance** - Targets met or deferred with justification
5. **Security Review** - No OWASP Top 10 vulnerabilities

Bypasses require explicit approval and documentation in plan.md Complexity Tracking.

## Governance

**Amendment Procedure:**
1. Document proposed changes with rationale
2. Impact analysis on features and templates
3. Approval from project maintainers
4. Migration plan if principles change
5. Version increment per semantic versioning

**Versioning Policy:**
- MAJOR: Breaking governance changes, principle removals
- MINOR: New principles, expanded guidance
- PATCH: Clarifications, wording improvements

**Compliance Review:**
- All PRs verify constitution compliance
- Deviations justified in plan.md Complexity Tracking
- Quality gates enforced via CI/CD where possible

**Version**: 1.0.0 | **Ratified**: 2025-11-26 | **Last Amended**: 2025-11-26