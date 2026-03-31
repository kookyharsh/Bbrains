import re

with open('client/features/auth/components/login-form.tsx', 'r') as f:
    content = f.read()

# Make sure we import ApiUser from somewhere, or cast role.
content = content.replace("const role = response.user.type", "const role = response.user.type as string")

with open('client/features/auth/components/login-form.tsx', 'w') as f:
    f.write(content)
