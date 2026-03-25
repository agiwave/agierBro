# 数据源地址映射

**规则**（只有两条）:

```
1. /              → /api/index.json
2. /xxx           → /api/xxx.json（无论多少级）
```

**示例**:

| 前端 URL | 后端数据源 |
|---------|-----------|
| `/` | `/api/index.json` |
| `/about` | `/api/about.json` |
| `/auth/login` | `/api/auth/login.json` |
| `/editor/papers/paper-001` | `/api/editor/papers/paper-001.json` |

**使用**:

```typescript
import { mapToDataSource } from '@/services/dataSourceMapper'

const apiUrl = mapToDataSource('/users')  // /api/users.json
```

**配置**:

```typescript
import { updateMapperConfig } from '@/services/dataSourceMapper'

updateMapperConfig({
  apiBase: '/v2/api',      // API 基础路径
  extension: '.data'       // 文件扩展名
})
```

**忽略路径**: `@`, `src`, `node_modules`, `assets`
