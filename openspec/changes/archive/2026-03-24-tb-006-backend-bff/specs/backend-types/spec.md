## ADDED Requirements

### 需求:DTO类型必须集中定义在后端类型包中
所有后端请求和响应的DTO类型必须定义在 `packages/types/src/backend.ts` 中，禁止在应用代码中重复定义。

#### 场景:类型共享
- **当** 前端需要引用后端响应类型
- **那么** 从 `packages/types` 包导入，而非自行定义

### 需求:DTO必须包含请求、响应和错误类型
每个功能模块必须提供完整的类型定义：Request DTO、Success Response DTO、Error Response DTO。

#### 场景:类型完整性检查
- **当** 开发者实现新的API端点
- **那么** 必须在 `packages/types/src/backend.ts` 中找到对应的输入输出类型

### 需求:类型必须运行时安全
所有DTO类型必须可用于Zod schema定义，支持运行时校验。

#### 场景:运行时校验
- **当** 后端接收到请求数据
- **那么** 使用Zod schema基于类型定义进行校验

## MODIFIED Requirements

## REMOVED Requirements
