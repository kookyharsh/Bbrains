Fix bugs in the sidebar of a Next.js 14 App Router project called Bbrains. Only touch the files listed below. Do not change any UI layout, styling, or component structure — only fix the specific issues described.

## Files to edit
- `components/sidebarData.ts` (primary)
- `hooks/use-user.ts` (secondary)

---

## Fix 1 — Stale admin route URLs

In `adminExtraItems`, three items point to old duplicate route paths that no longer exist. Update them to the correct canonical URLs:

  BEFORE → AFTER
  "/admin/manageusers"  →  "/admin/users"
  "/admin/auditlog"     →  "/admin/audit-log"
  "/admin/rolesaccess"  →  "/admin/roles"

Also remove these two redundant entries from `adminExtraItems` entirely — they overlap with the fixed "Roles & Access" entry above:
  - { title: "Permissions", url: "/admin/permissions" }
  - { title: "Quick Roles", url: "/admin/roles" }

---

## Fix 2 — Wrong URL on teacher Suggestions item

In `teacherExtraItems`, the Suggestions item incorrectly points to an admin route:

  BEFORE: { title: "Suggestions", url: "/admin/suggestions" }
  AFTER:  { title: "Suggestions", url: "/suggestions" }

---

## Fix 3 — Add Announcements to base items (all roles)

`baseSidebarItems` is missing an Announcements link even though the route exists and all roles should see it. Add it as the second item (after Dashboard, before Exam/Assignments):

  { title: "Announcements", url: "/announcements", icon: Megaphone }

The `Megaphone` icon is already imported at the top of the file.

---

## Fix 4 — Handle unresolved "staff" user type

In `resolveSidebarRole`, the `userType` block handles "admin" and "teacher" but has no branch for "staff". A staff user silently falls through to "student", which is wrong.

Add a branch for staff directly after the teacher branch:

  if (userType === "teacher") return "teacher";
  if (userType === "staff") return "teacher";   // staff shares the teacher panel

Also update the `Role` type export if "staff" needs its own entry later — for now mapping to "teacher" is sufficient.

---

## Fix 5 — Mark use-user.ts as deprecated

`hooks/use-user.ts` is unused dead code. The dashboard layout fetches the user server-side via Supabase in `app/(dashboard)/layout.tsx` and passes it down as a prop. The hook also relies on localStorage which is incompatible with SSR.

Add a JSDoc deprecation comment at the top of the file:

  /**
   * @deprecated This hook is not used anywhere in the app.
   * User data is fetched server-side in app/(dashboard)/layout.tsx
   * and passed down via props. Do not use this hook for new features.
   */

Do NOT delete the file yet — just mark it. It can be removed in a separate cleanup pass.

---

## Constraints
- Do not change any component logic in `app-sidebar.tsx` or `app/(dashboard)/layout.tsx`.
- Do not reorder any other sidebar items beyond what is specified above.
- Do not rename any exported functions or types.
- After edits, verify that `resolveSidebarRole` still returns "student" as the default fallback for unknown types.
  