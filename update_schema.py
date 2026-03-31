import re

with open('server/prisma/schema.prisma', 'r') as f:
    content = f.read()

# 1. Add superadmin to UserRole enum (avoid duplicates)
if 'superadmin' not in content:
    content = re.sub(r'(enum UserRole \{[^\}]+)(\})', r'\1  superadmin\n\2', content)

# 2. Add features JSON field to College model
content = re.sub(
    r'(model College \{.*?)(\n\s*@@map\("college"\)\n\})',
    r'\1\n  features  Json?    @default("{}")\2',
    content,
    flags=re.DOTALL
)

# 3. Remove requiredXp from Achievement
content = re.sub(r'\s*requiredXp\s+Decimal\s+@db\.Decimal\(10, 2\)\n', '\n', content)

with open('server/prisma/schema.prisma', 'w') as f:
    f.write(content)
