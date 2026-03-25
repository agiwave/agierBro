# 跨平台业务驱动 UI 框架 (Business-Driven UI Framework)

## 一、核心概念

### 1.1 愿景

构建一个**跨多端通用前端框架**，前端只提供通用的原生 UI 控件和渲染机制，**Server 只关心业务，不关心 UI**。

### 1.2 核心理念

**Server 只提供纯业务数据，Client 负责根据业务数据类型自动选择合适的原生控件渲染。**

```
┌─────────────────────────────────────────────────────────────┐
│                     Server (业务层)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  数据模型 + 业务规则 + 校验规则 + 状态机 + 权限规则    │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│                   纯业务数据 (JSON)                          │
│                   - Entity 定义                             │
│                   - 字段类型 + 约束                          │
│                   - 业务规则                                │
│                   - 状态流转                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Client (渲染层)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  数据类型 → UI组件 映射表 (内置规则)                   │   │
│  │  string      → 文本输入框                             │   │
│  │  number      → 数字输入框                             │   │
│  │  enum        → 下拉选择器                             │   │
│  │  date        → 日期选择器                             │   │
│  │  money       → 金额输入框                             │   │
│  │  array       → 列表编辑器                             │   │
│  │  ...                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Web    │  │ iOS App  │  │Android App│  │ Desktop  │   │
│  │(Browser) │  │ (Swift)  │  │ (Kotlin)  │  │(Win/Linux)│  │
│  │ 原生控件  │  │ 原生控件  │  │  原生控件  │  │ 原生控件  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 关键区别

| 传统 SDUI | 本方案 |
|----------|-------|
| Server 定义 UI 组件类型 | Server 只定义数据类型 |
| Server 决定布局 | Client 根据平台自动布局 |
| Server 指定按钮、输入框等 | Server 只定义字段和约束 |
| UI 变更需要改 Server | UI 变化只需改 Client 映射规则 |
| Server 需要了解前端 | Server 完全不关心前端 |

---

## 二、可行性分析

### 2.1 技术可行性 ✅

这个想法在技术上是**完全可行**的，且已有成功案例：

| 类似方案 | 说明 |
|---------|------|
| **Server-Driven UI (SDUI)** | Airbnb、Spotify、Uber 等大厂已广泛应用 |
| **JSON Schema Form** | 表单的 Schema 驱动渲染已非常成熟 |
| **SwiftUI / Flutter** | 声明式 UI 的成功证明了"描述即渲染"的可行性 |
| **Jetpack Compose** | Android 的声明式 UI 框架 |
| **HTMX / Alpine.js** | 服务端驱动的 HTML 增强方案 |

### 2.2 核心优势

| 优势 | 说明 |
|-----|------|
| **动态更新** | 无需发版即可更新 UI 布局和逻辑 |
| **一致性** | 所有平台由同一 API 驱动，保证业务逻辑一致 |
| **开发效率** | 后端专注业务，前端专注渲染，职责清晰 |
| **A/B 测试** | 后端可针对不同用户返回不同 UI Schema |
| **个性化** | 根据用户偏好动态调整界面 |
| **热修复** | Bug 修复无需重新发布 App |

### 2.3 潜在挑战与解决方案

| 挑战 | 解决方案 |
|-----|---------|
| **性能开销** | Schema 缓存 + 增量更新 + 预编译优化 |
| **离线支持** | 本地 Schema 缓存 + 数据同步机制 |
| **复杂交互** | 定义标准化的交互协议 + 前端内置常用交互组件 |
| **调试困难** | 提供 Schema 可视化编辑器 + 实时预览工具 |
| **版本兼容** | Schema 版本管理 + 向后兼容策略 |
| **学习曲线** | 提供可视化 Schema 编辑器 + 丰富的模板库 |

---

## 三、架构设计

### 3.1 业务数据协议设计

**核心理念：数据就是纯数据。`_schema` 只是数据的一个字段，可以是值，也可以是链接。**

```json
// 方式一：Schema 是 URL（推荐，减少传输）
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "_schema": "https://api.example.com/schemas/order"
}

// 方式二：Schema 内联（首次加载时）
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "_schema": {
    "type": "object",
    "properties": {
      "order_no": { "type": "string", "semantic": "code" },
      "customer_name": { "type": "string", "semantic": "name" }
    }
  }
}

// 方式三：无 Schema（前端已缓存）
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00
}
```

**关键点：**
- 数据就是普通的 JSON 对象，没有任何包装
- `_schema` 是可选字段，可以是 URL 字符串或内联对象
- 其他元数据字段都以 `_` 开头：`_permissions`、`_transitions`、`_links`
- 完全符合 RESTful 风格，数据就是资源本身

### 3.2 数据类型体系

Server 定义数据类型，Client 决定如何渲染：

```
基础类型
├── string          # 字符串
├── number          # 数字
├── integer         # 整数
├── boolean         # 布尔值
├── date            # 日期
├── datetime        # 日期时间
└── time            # 时间

复合类型
├── object          # 对象
└── array           # 数组

语义类型（前端自动选择最佳控件）
├── enum            # 枚举 → 下拉选择器
├── money           # 金额 → 金额输入框（带货币符号）
├── percentage      # 百分比 → 百分比输入框
├── email           # 邮箱 → 邮箱输入框（带校验）
├── phone           # 电话 → 电话输入框（带格式化）
├── url             # 网址 → URL输入框（带链接预览）
├── file            # 文件 → 文件上传控件
├── image           # 图片 → 图片上传/选择器
└── location        # 地理位置 → 地图选择器
```

### 3.3 语义标签

语义标签帮助前端优化渲染，但不强制指定具体控件：

```yaml
Semantic:
  # 标识类
  id                # 唯一标识 → 通常只读或隐藏
  code              # 编码 → 等宽字体显示
  slug              # URL友好标识
  
  # 个人信息
  name              # 姓名 → 突出显示
  nickname          # 昵称
  avatar            # 头像 → 圆形图片
  age               # 年龄
  gender            # 性别 → 性别选择器
  birthday          # 生日 → 日期选择器
  
  # 联系方式
  email             # 邮箱
  phone             # 电话
  address           # 地址 → 地址输入器
  
  # 内容类
  title             # 标题 → 大字体显示
  description       # 描述 → 多行文本
  content           # 内容 → 富文本编辑器
  summary           # 摘要
  
  # 商业类
  price             # 价格 → 货币格式化
  quantity          # 数量 → 数字输入器
  discount          # 折扣
  total             # 总计
  
  # 状态类
  status            # 状态 → 状态标签/徽章
  progress          # 进度 → 进度条
  priority          # 优先级 → 优先级选择器
  
  # 时间类
  created_at        # 创建时间 → 相对时间显示
  updated_at        # 更新时间
  expired_at        # 过期时间
```

### 3.4 前端渲染映射规则

Client 根据数据类型 + 语义标签 + 约束条件，自动选择最合适的原生控件：

| 数据类型 | 语义标签 | 约束条件 | 前端控件选择 |
|---------|---------|---------|-------------|
| string | - | - | 文本输入框 |
| string | - | min_length > 100 | 多行文本框 |
| string | email | - | 邮箱输入框（带校验） |
| string | phone | - | 电话输入框（带格式化） |
| string | password | - | 密码输入框（带遮罩） |
| string | address | - | 地址输入器 |
| number | - | - | 数字输入框 |
| number | money | - | 金额输入框（带货币符号） |
| number | percentage | - | 百分比输入框 |
| integer | quantity | minimum=1 | 数量选择器（带加减按钮） |
| boolean | - | - | 开关/复选框 |
| date | birthday | - | 生日选择器 |
| datetime | created_at | - | 只读时间显示 |
| enum | status | - | 状态标签（只读）/ 下拉选择器 |
| enum | - | enum_values.length < 5 | 单选按钮组 |
| enum | - | enum_values.length >= 5 | 下拉选择器 |
| array | - | - | 列表编辑器 |
| array | - | fields 定义 | 表格/卡片列表 |
| object | - | - | 分组表单 |
| file | - | - | 文件上传 |
| image | avatar | - | 头像上传（圆形裁剪） |
| image | - | - | 图片上传（带预览） |
| location | - | - | 地图选择器 |

---

## 四、前端渲染引擎设计

### 4.1 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  (平台特定代码：路由、原生模块桥接、推送通知等)                  │
├─────────────────────────────────────────────────────────────┤
│                    Runtime Engine                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Schema      │ │ Component   │ │ Layout      │           │
│  │ Parser      │ │ Registry    │ │ Engine      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ State       │ │ Event       │ │ Theme       │           │
│  │ Manager     │ │ Handler     │ │ System      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    Platform Abstraction                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Web    │ │  iOS    │ │ Android │ │ Desktop │           │
│  │ Adapter │ │ Adapter │ │ Adapter │ │ Adapter │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    Native UI Layer                           │
│  [ HTML/CSS ] [ SwiftUI ] [ Jetpack Compose ] [ Qt/Flutter ]│
└─────────────────────────────────────────────────────────────┘
```

### 4.2 组件注册机制

```typescript
// 组件注册接口定义
interface ComponentDefinition {
  type: string;
  platform: 'web' | 'ios' | 'android' | 'desktop';
  nativeComponent: any;
  propertySchema: PropertySchema;
  eventSchema: EventSchema;
}

// 示例：注册按钮组件
const ButtonComponent: ComponentDefinition = {
  type: 'button',
  platform: 'web',
  nativeComponent: HTMLButtonElement,
  propertySchema: {
    text: { type: 'string', required: true },
    variant: { type: 'enum', values: ['primary', 'secondary', 'outline'] },
    disabled: { type: 'boolean', default: false },
    loading: { type: 'boolean', default: false }
  },
  eventSchema: {
    onClick: { type: 'click' }
  }
};
```

### 4.3 主题系统

```yaml
# 主题定义
theme:
  name: "light"
  colors:
    primary: "#007AFF"
    secondary: "#5856D6"
    background: "#FFFFFF"
    surface: "#F2F2F7"
    text: "#000000"
    text_secondary: "#8E8E93"
    error: "#FF3B30"
    success: "#34C759"
  
  typography:
    heading1: { size: 32, weight: "bold" }
    heading2: { size: 24, weight: "semibold" }
    body: { size: 16, weight: "regular" }
    caption: { size: 12, weight: "regular" }
  
  spacing:
    xs: 4
    sm: 8
    md: 16
    lg: 24
    xl: 32
  
  border_radius:
    sm: 4
    md: 8
    lg: 16
    full: 9999
  
  shadows:
    sm: "0 1px 2px rgba(0,0,0,0.05)"
    md: "0 4px 6px rgba(0,0,0,0.1)"
    lg: "0 10px 15px rgba(0,0,0,0.15)"
```

---

## 五、后端 API 设计

### 5.1 核心理念

**数据就是纯数据。`_schema` 只是数据的一个字段，可以是 URL，也可以是内联对象。**

```json
// Schema 是 URL（推荐）
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "_schema": "https://api.example.com/schemas/order"
}

// Schema 内联
{
  "id": "123",
  "order_no": "ORD-20240101",
  "_schema": { "type": "object", "properties": { ... } }
}

// 无 Schema（前端已缓存）
{
  "id": "123",
  "order_no": "ORD-20240101"
}
```

### 5.2 获取数据（带 Schema URL）

```http
GET /api/orders/123

Response:
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "_schema": "https://api.example.com/schemas/order",
  "_permissions": ["read", "update"],
  "_transitions": [
    { "event": "submit", "label": "提交审核" }
  ]
}
```

### 5.3 获取数据（带内联 Schema）

```http
GET /api/orders/123?include_schema=true

Response:
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "_schema": {
    "type": "object",
    "properties": {
      "order_no": { "type": "string", "semantic": "code" },
      "customer_name": { "type": "string", "semantic": "name" },
      "status": { "type": "string", "enum": [...] },
      "total_amount": { "type": "number", "semantic": "money" }
    }
  },
  "_permissions": ["read", "update"]
}
```

### 5.4 获取数据（无 Schema）

前端已缓存 Schema 时：

```http
GET /api/orders/123?include_schema=false

Response:
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00
}
```

### 5.5 单独获取 Schema

```http
GET /api/schemas/order

Response:
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "semantic": "id" },
    "order_no": { "type": "string", "semantic": "code", "readonly": true },
    "customer_name": { "type": "string", "semantic": "name", "required": true },
    "status": {
      "type": "string",
      "semantic": "status",
      "enum": [
        { "value": "draft", "label": "草稿" },
        { "value": "pending", "label": "待审核" },
        { "value": "approved", "label": "已通过" }
      ]
    }
  }
}
```

### 5.6 创建数据

```http
POST /api/orders
Content-Type: application/json

{
  "customer_name": "张三",
  "customer_phone": "13800138000",
  "items": [...]
}

Response:
{
  "id": "125",
  "order_no": "ORD-003",
  "customer_name": "张三",
  "status": "draft",
  "_schema": "order",
  "_permissions": ["read", "update", "delete"],
  "_transitions": [
    { "event": "submit", "label": "提交审核" }
  ]
}
```

### 5.7 状态转换

```http
POST /api/orders/123/transitions
Content-Type: application/json

{
  "event": "submit"
}

Response:
{
  "id": "123",
  "status": "pending",
  "_transitions": [
    { "event": "approve", "label": "通过" },
    { "event": "reject", "label": "拒绝" }
  ]
}
```

---

## 六、开发工具链

### 6.1 Schema 编辑器

- **可视化拖拽编辑器**：所见即所得的 UI 搭建
- **Schema 预览**：实时预览各平台渲染效果
- **模板库**：常用页面模板（登录、列表、详情等）
- **版本管理**：Schema 的版本控制和回滚

### 6.2 调试工具

- **Schema Inspector**：查看当前页面的 Schema 结构
- **网络监控**：API 请求/响应监控
- **状态检查器**：查看当前页面状态
- **性能分析**：渲染性能监控

### 6.3 CLI 工具

```bash
# 创建新项目
sdui create my-app --platform web,ios,android

# 启动开发服务器
sdui dev

# 构建 Schema
sdui build

# 部署
sdui deploy --env production
```

---

## 七、实施路线图

### Phase 1: 基础框架 (MVP)
- [ ] 定义 UI Schema 协议规范
- [ ] 实现 Web 端渲染引擎
- [ ] 实现基础组件库（10-15个核心组件）
- [ ] 实现数据绑定和事件处理
- [ ] 实现主题系统

### Phase 2: 多端扩展
- [ ] 实现 iOS 端渲染引擎（SwiftUI）
- [ ] 实现 Android 端渲染引擎（Jetpack Compose）
- [ ] 实现 Desktop 端渲染引擎
- [ ] 组件库扩展（30+组件）

### Phase 3: 开发工具
- [ ] 可视化 Schema 编辑器
- [ ] 调试工具套件
- [ ] CLI 工具
- [ ] 文档和示例

### Phase 4: 高级特性
- [ ] 离线支持
- [ ] 增量更新
- [ ] A/B 测试集成
- [ ] 性能优化
- [ ] AI 辅助 Schema 生成

---

## 八、技术选型建议

### 8.1 前端技术栈

| 平台 | 推荐技术 | 原因 |
|-----|---------|------|
| Web | React / Vue 3 | 组件化成熟，生态丰富 |
| iOS | SwiftUI | 声明式 UI，原生性能 |
| Android | Jetpack Compose | 声明式 UI，官方支持 |
| Desktop | Flutter / Qt / Tauri | 跨平台，原生渲染 |

### 8.2 后端技术栈

| 组件 | 推荐技术 |
|-----|---------|
| API 框架 | FastAPI / NestJS / Go Gin |
| Schema 存储 | PostgreSQL + JSONB |
| 缓存 | Redis |
| 版本管理 | Git-like 版本控制 |

### 8.3 Schema 格式

推荐使用 **YAML** 或 **JSON**：
- YAML：可读性好，适合手写
- JSON：解析快，适合机器生成

---

## 九、与现有方案对比

| 特性 | 本方案 | Flutter | React Native | HTMX |
|-----|-------|---------|--------------|------|
| 跨平台 | ✅ 全平台 | ✅ 全平台 | ✅ 移动端优先 | ❌ 仅 Web |
| 原生控件 | ✅ | ❌ 自绘 | ⚠️ 桥接 | ❌ HTML |
| 服务端驱动 | ✅ 完全 | ❌ | ❌ | ✅ 部分 |
| 动态更新 | ✅ 无需发版 | ❌ | ❌ | ✅ |
| 离线支持 | ✅ | ✅ | ✅ | ❌ |
| 学习曲线 | 中 | 中 | 中 | 低 |

---

## 十、总结

这个**业务驱动 UI 框架**的想法是**完全可行**的，它的核心理念是：

### Server 只关心业务，Client 负责渲染

```
Server 提供                    Client 负责
─────────────────────────────────────────────
数据类型 (string/number/enum)  → 选择合适的输入控件
语义标签 (name/email/price)    → 优化控件显示方式
约束条件 (min/max/pattern)     → 配置校验规则
业务规则 (validation/computed) → 实现交互逻辑
状态机 (states/transitions)    → 渲染操作按钮
权限规则 (roles/permissions)   → 控制可见可操作
```

### 核心优势

| 优势 | 说明 |
|-----|------|
| **职责分离** | Server 专注业务逻辑，Client 专注用户体验 |
| **平台适配** | 同一业务数据，各平台选择最合适的原生控件 |
| **技术无关** | Server 不依赖任何前端框架，纯数据定义 |
| **易于维护** | 业务变更只改 Server，UI 优化只改 Client |
| **复用性强** | 同一 Schema 可用于表单、列表、详情等多种场景 |

### 与传统方案对比

| 特性 | 传统 SDUI | 本方案 |
|-----|----------|-------|
| Server 职责 | 定义 UI 组件 + 业务数据 | 只定义业务数据 |
| Server 知识 | 需要了解前端控件 | 完全不需要 |
| UI 变更 | 需要改 Server | 只需改 Client 映射规则 |
| 平台差异 | Server 需要处理 | Client 自行适配 |
| 学习成本 | Server 开发者需学 UI | Server 开发者只写业务 |

### 关键成功因素

- 📋 设计一套**完善且可扩展**的业务数据协议（参见 [SCHEMA.md](./SCHEMA.md)）
- 🎨 建立完善的**数据类型 → UI 控件映射规则**
- 🔧 提供丰富的**原生组件库**（各平台）
- 🛠️ 打造好用的**开发工具链**（Schema 编辑器、调试工具）
- 📚 建立完善的**文档和示例**

### 适用场景

- 企业级表单密集型应用（ERP、CRM、OA 等）
- 多平台一致性要求高的应用
- 业务规则频繁变化的系统
- 需要快速迭代的创业项目
