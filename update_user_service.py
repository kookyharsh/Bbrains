import re

with open('server/src/modules/user/user.service.js', 'r') as f:
    content = f.read()

# Make sure we add college.features to the user fetch so the frontend receives it
# Let's see what userSummarySelect looks like
if 'college: {' not in content:
    content = content.replace(
        "college: true,",
        "college: {\n                select: {\n                    id: true,\n                    name: true,\n                    features: true\n                }\n            },"
    )

with open('server/src/modules/user/user.service.js', 'w') as f:
    f.write(content)
