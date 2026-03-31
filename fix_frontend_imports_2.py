import re

# Fix colleges page
with open('client/app/(dashboard)/superadmin/colleges/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { getBaseUrl } from "@/services/api/client"', 'import { API_BASE_URL as getBaseUrl } from "@/services/api/client"')

with open('client/app/(dashboard)/superadmin/colleges/page.tsx', 'w') as f:
    f.write(content)

# Fix features page
with open('client/app/(dashboard)/superadmin/features/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { getBaseUrl } from "@/services/api/client"', 'import { API_BASE_URL as getBaseUrl } from "@/services/api/client"')

with open('client/app/(dashboard)/superadmin/features/page.tsx', 'w') as f:
    f.write(content)
