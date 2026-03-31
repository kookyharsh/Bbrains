import re

# Fix colleges page
with open('client/app/(dashboard)/superadmin/colleges/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { API_BASE_URL as getBaseUrl } from "@/services/api/client"', 'import { getBaseUrl } from "@/services/api/client"')

with open('client/app/(dashboard)/superadmin/colleges/page.tsx', 'w') as f:
    f.write(content)

# Fix features page
with open('client/app/(dashboard)/superadmin/features/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { API_BASE_URL as getBaseUrl } from "@/services/api/client"', 'import { getBaseUrl } from "@/services/api/client"')

with open('client/app/(dashboard)/superadmin/features/page.tsx', 'w') as f:
    f.write(content)

# Fix getBaseUrl export in client.ts
with open('client/services/api/client.ts', 'r') as f:
    client_content = f.read()

if 'export const getBaseUrl =' not in client_content:
    client_content = client_content.replace('const getBaseUrl = () => {', 'export const getBaseUrl = () => {')

with open('client/services/api/client.ts', 'w') as f:
    f.write(client_content)
