import re

with open('server/src/server.js', 'r') as f:
    content = f.read()

# Add import if not exists
if 'import superadminRoutes' not in content:
    content = re.sub(
        r'(import .*?\n)',
        r'\1import superadminRoutes from "./modules/superadmin/superadmin.routes.js";\n',
        content,
        count=1
    )

# Mount routes
if '/api/v1/superadmin' not in content:
    content = re.sub(
        r'(app\.use\("/api/v1/auth", authRoutes\);)',
        r'\1\napp.use("/api/v1/superadmin", superadminRoutes);',
        content
    )

with open('server/src/server.js', 'w') as f:
    f.write(content)
