import re

with open('client/features/auth/components/login-form.tsx', 'r') as f:
    content = f.read()

content = content.replace("const role = userResp.data.type", "const role = userResp.data.type as string")

with open('client/features/auth/components/login-form.tsx', 'w') as f:
    f.write(content)
