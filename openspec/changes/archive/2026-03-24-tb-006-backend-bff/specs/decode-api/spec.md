## ADDED Requirements

### 需求:解码接口必须记录分析日志到数据库
系统在每次成功解码后，必须在 `analysis_logs` 表中记录元数据。

#### 场景:记录分析日志
- **当** 解码请求成功处理
- **那么** 系统在 `analysis_logs` 中插入记录
- **并且** 包含 attack_type、emotion_score 等关键字段
- **并且** 关联到当前 guest_session 或 user_id

### 需求:解码接口必须使用统一错误响应格式
decode接口的错误响应必须符合后端策略层定义的统一错误体结构。

#### 场景:统一错误格式
- **当** decode接口返回错误
- **那么** 响应体包含 `code`、`message`、`details` 字段
- **并且** HTTP状态码符合REST规范

## MODIFIED Requirements

### 需求:解码接口必须支持guest session识别
**FROM**: decode接口仅支持已登录用户
**TO**: decode接口必须能够从guest session cookie识别匿名用户并关联分析记录

#### 场景:匿名用户解码
- **当** 携带guest session cookie的请求访问decode接口
- **那么** 系统将分析记录关联到该guest session

#### 场景:已登录用户解码
- **当** 携带Clerk session的请求访问decode接口
- **那么** 系统将分析记录关联到该Clerk用户

## REMOVED Requirements
