import re

with open('client/lib/types/api.ts', 'r') as f:
    content = f.read()

content = content.replace('type: "student" | "teacher" | "admin" | "staff"', 'type: "student" | "teacher" | "admin" | "staff" | "superadmin"')

with open('client/lib/types/api.ts', 'w') as f:
    f.write(content)
