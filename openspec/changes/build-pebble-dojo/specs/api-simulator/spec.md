# 模拟陪练后端 API 规范

## 概述

后端 API 为陪练场提供场景数据、会话管理和情绪分析服务，采用 BFF 架构直接服务前端。

## ADDED Requirements

### 需求:必须提供获取场景列表接口
`GET /api/scenarios` 必须返回三个预设场景的完整数据。

#### 场景:成功获取场景列表
- **当** 前端调用 `GET /api/scenarios`
- **那么** 返回 HTTP 200，响应体包含 scenarios 数组，每个场景包含 id、name、description、difficulty、context、goal、tips 字段

#### 场景:场景数据完整性检查
- **当** 检查返回的场景数据
- **那么** 必须包含且仅包含三种场景：workplace（职场越界）、relationship（亲密关系）、social（社交应对）

### 需求:必须提供会话管理接口
`POST /api/simulator` 必须支持 start、turn、restart 三种操作语义。

#### 场景:start 创建新会话
- **当** 请求体包含 scenarioId，不含 sessionId
- **那么** 创建新会话，返回 sessionId、aiResponse（开场白）、rightPanel（初始分析，可选）

#### 场景:turn 继续会话
- **当** 请求体包含 sessionId、message
- **那么** 返回同一 sessionId、aiResponse、rightPanel（包含 analysisScore、analysisLabel、analysisSummary、instantFeedback、attentionPoint）

#### 场景:restart 重启会话
- **当** 请求体包含 sessionId、action="restart"
- **那么** 结束原会话，创建新会话，返回新 sessionId、新开场白

### 需求:必须提供结束会话接口
`POST /api/simulator/[sessionId]/end` 必须返回完整会话总结。

#### 场景:成功结束会话
- **当** 调用 `POST /api/simulator/{sessionId}/end`
- **那么** 返回 HTTP 200，响应体包含 finalScore、overallFeedback、improvements、sessionDuration

#### 场景:结束已存在会话
- **当** 调用 end 接口且 sessionId 存在
- **那么** 正常返回总结数据，会话标记为已结束

#### 场景:结束不存在会话
- **当** 调用 end 接口且 sessionId 不存在或已过期
- **那么** 返回 HTTP 404，错误信息"会话不存在或已过期"

### 需求:rightPanel 字段必须稳定返回
每次 turn 响应必须包含完整的 rightPanel 对象，五个字段不可缺失。

#### 场景:rightPanel 完整性检查
- **当** 检查 turn 响应
- **那么** rightPanel 必须包含且仅包含：analysisScore（number）、analysisLabel（string）、analysisSummary（string）、instantFeedback（string）、attentionPoint（string）

### 需求:必须实现输入校验
所有接口必须对输入参数进行校验，返回清晰的错误信息。

#### 场景:缺少必需参数
- **当** 请求缺少必需参数（如 scenarioId、sessionId）
- **那么** 返回 HTTP 400，错误信息指明缺失字段

#### 场景:无效参数格式
- **当** 参数格式无效（如 sessionId 非字符串）
- **那么** 返回 HTTP 400，错误信息指明格式要求

### 需求:必须实现错误处理和 fallback
外部 AI 服务调用失败时必须返回 deterministic fallback 响应，不暴露内部错误。

#### 场景:AI 服务超时
- **当** AI 服务调用超时（>5s）
- **那么** 返回预设的友好回复，如"我理解你的感受。让我们继续练习。"

#### 场景:AI 服务异常
- **当** AI 服务返回异常
- **那么** 记录错误日志，返回 fallback 回复，不暴露原始错误

### 需求:必须实现限流保护
API 必须实现请求限流，防止滥用。

#### 场景:请求频率超限
- **当** 单个用户短时间内请求超过阈值（如 10次/分钟）
- **那么** 返回 HTTP 429，提示"请求过于频繁，请稍后再试"

### 需求:DTO 必须先定义后使用
所有请求和响应必须使用显式定义的 DTO 类型，禁止直接使用内联类型。

#### 场景:DTO 定义检查
- **当** 检查代码实现
- **那么** 存在 `SimulatorRequestDTO`、`SimulatorResponseDTO`、`EndSessionResponseDTO` 等类型定义文件
