import re

with open('client/lib/types/api.ts', 'r') as f:
    content = f.read()

# Add features to the existing User interface under college or user
if 'features?: Record<string, boolean>;' not in content:
    content = content.replace('collegeId: number', 'collegeId: number\n    collegeFeatures?: Record<string, boolean>')

with open('client/lib/types/api.ts', 'w') as f:
    f.write(content)

with open('server/src/modules/auth/auth.service.js', 'r') as f:
    server_auth_content = f.read()

# Add features fetching when user logs in / profile is retrieved
if 'select: { features: true }' not in server_auth_content:
    server_auth_content = server_auth_content.replace('id: user.collegeId', 'id: user.collegeId\n            },\n            select: {\n                id: true,\n                name: true,\n                features: true')
    # Note: the above regex may be fragile. Let's make sure it updates the payload correctly.

with open('server/src/modules/auth/auth.service.js', 'w') as f:
    f.write(server_auth_content)
