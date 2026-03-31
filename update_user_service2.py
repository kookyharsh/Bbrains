import re

with open('server/src/modules/user/user.service.js', 'r') as f:
    content = f.read()

# Make sure we add college.features to the user fetch so the frontend receives it
content = re.sub(
    r'(type: true,[\s\S]*?)(    \},)',
    r'\1    },\n    college: {\n        select: {\n            id: true,\n            name: true,\n            features: true\n        }\n    },',
    content,
    count=1
)

with open('server/src/modules/user/user.service.js', 'w') as f:
    f.write(content)
