---
title: Security Model & Hardening
description: Scope, limits, and hardening guidance for running untrusted code with QuickJS
order: 15
---

# Security Model & Hardening

This library helps execute JavaScript/TypeScript in a controlled QuickJS WebAssembly guest runtime.  
It is designed as a **security layer**, but not as a complete security boundary by itself.

## Scope

- This project wraps and configures QuickJS for safer host/guest execution.
- It does **not** implement or patch the QuickJS engine itself.
- If a vulnerability exists in QuickJS (engine/interpreter level), remediation is primarily upstream.

Because this library embeds QuickJS, upstream engine risk can still affect deployments using this package.

## Threat Model (Practical)

Primary use case:

- Run user-provided code inside backend systems, with strict host controls, without requiring separate infrastructure per execution.

Common examples:

- user-defined data transforms in stream processing (for example IoT pipelines)
- configurable business logic plugins
- AI-generated code execution with controlled capabilities

## Defense-in-Depth Recommendations

Treat this library as one layer. Add platform-level controls around it:

1. Run untrusted execution in isolated workers/processes/containers.
2. Apply least privilege at OS/container level (seccomp/AppArmor/cgroups where available).
3. Keep `allowFetch` and `allowFs` disabled by default; enable only when required.
4. Enforce strict time and memory limits, and use external supervision/restarts.
5. Validate and sanitize host-to-guest inputs and guest-to-host outputs.
6. Restrict networking (egress allowlists, DNS/IP controls, private network blocking).
7. Monitor runtime behavior and keep dependencies/QuickJS variants updated.

## Browser vs Backend

Browsers already provide baseline sandbox constraints.  
Backend execution of untrusted code is usually the higher-risk environment and should be hardened accordingly.

## Related Docs

- [Basic Understanding](./basic-understanding.md)
- [Runtime Options](./runtime-options.md)
- [Fetch in Guest System](./fetch.md)
- [File System](./file-system.md)
