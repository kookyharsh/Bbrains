import re

# Update dashboard/data.ts
with open('client/features/dashboard/data.ts', 'r') as f:
    content = f.read()

if 'if (dbUser?.type === "superadmin")' not in content:
    content = content.replace('if (dbUser?.type === "admin") {', 'if (dbUser?.type === "superadmin") {\n    redirect("/superadmin/overview");\n  }\n  if (dbUser?.type === "admin") {')

with open('client/features/dashboard/data.ts', 'w') as f:
    f.write(content)

# Update auth login-form.tsx
with open('client/features/auth/components/login-form.tsx', 'r') as f:
    content = f.read()

if 'if (role === \'superadmin\')' not in content:
    content = content.replace('if (role === \'admin\') {', 'if (role === \'superadmin\') {\n            router.push(\'/superadmin/overview\')\n          } else if (role === \'admin\') {')

with open('client/features/auth/components/login-form.tsx', 'w') as f:
    f.write(content)
