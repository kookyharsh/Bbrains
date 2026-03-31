import re

with open('server/src/modules/superadmin/superadmin.service.js', 'r') as f:
    content = f.read()

content = content.replace("import { prisma } from '../../utils/prisma.js';", "import { prisma } from '../../utils/prisma.js';\nimport { clearFeaturesCache } from '../../utils/featureFlags.js';")
content = re.sub(r'(export const updateGlobalFeatures = async \(features\) => \{[\s\S]*?\n\s*\});', r'export const updateGlobalFeatures = async (features) => {\n    const config = await prisma.systemConfig.upsert({\n        where: { key: "global_features" },\n        update: { value: JSON.stringify(features) },\n        create: { \n            key: "global_features", \n            value: JSON.stringify(features),\n            type: "json",\n            description: "Global feature flags"\n        }\n    });\n    clearFeaturesCache();\n    return config;\n};', content)

with open('server/src/modules/superadmin/superadmin.service.js', 'w') as f:
    f.write(content)
