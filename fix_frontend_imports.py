import re

# Fix colleges page
with open('client/app/(dashboard)/superadmin/colleges/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { getBaseUrl } from "@/lib/api"', 'import { getBaseUrl } from "@/services/api/client"')
content = content.replace('import { getAuthToken } from "@/features/auth/utils"', 'import { getToken } from "@/services/api/client"')
content = content.replace('getAuthToken()', 'getToken()')

with open('client/app/(dashboard)/superadmin/colleges/page.tsx', 'w') as f:
    f.write(content)

# Fix features page
with open('client/app/(dashboard)/superadmin/features/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { getBaseUrl } from "@/lib/api"', 'import { getBaseUrl } from "@/services/api/client"')
content = content.replace('import { getAuthToken } from "@/features/auth/utils"', 'import { getToken } from "@/services/api/client"')
content = content.replace('getAuthToken()', 'getToken()')

with open('client/app/(dashboard)/superadmin/features/page.tsx', 'w') as f:
    f.write(content)
