# AI-Directed Engineering Workflow

> You define theory. AI plans and implements. This vault is **not** the Brent/PYX memory bank.

## The layers

| Layer | Where | Who | Purpose |
|-------|--------|-----|---------|
| **Theory** | [[010_Product_Theory]], `specs/*.md` | **You** | What the system should do |
| **Plan** | `plans/active/*.md` | **AI drafts**, you approve | How to build |
| **Build** | `app/`, `lib/`, `components/` | **AI** after approval | Implementation |
| **Record** | [[002_Memory_Bank]], [[problems/000_Problem_Index]] | **AI** after ship | What changed |

## Folder layout

```text
_System_Core/
├── 000_System_Architecture.md
├── 001_System_State.md
├── 002_Memory_Bank.md
├── 003_Fragile_Edges.md
├── 004_Dashboard_Design.md
├── 006_AI_Directed_Engineering.md
├── 010_Product_Theory.md
├── specs/
├── plans/active/ | plans/archive/
└── problems/
```

## Step-by-step

1. Write or update a spec from [[specs/TEMPLATE_Feature_Spec]].
2. Point [[001_System_State]] at that spec.
3. AI drafts `plans/active/` — you approve before large builds.
4. Implement. Append [[002_Memory_Bank]]. Archive the plan.

## Quick chat fixes

Say **"save to memory bank"** in Cursor. Log to [[002_Memory_Bank]] in **this** folder only.

See also: [[README]] · [[000_System_Architecture]]
