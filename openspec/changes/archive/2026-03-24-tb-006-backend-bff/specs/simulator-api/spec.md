## ADDED Requirements

### 需求:模拟陪练场接口必须使用数据库持久化
系统的模拟陪练场接口必须使用PostgreSQL存储会话和轮次数据。

#### 场景:数据库访问
- **当** simulator接口处理请求
- **那么** 通过Repository层访问数据库
- **并且** 不再依赖内存Map存储

### 需求:模拟陪练场接口必须支持guest session
模拟陪练场接口必须支持匿名用户通过guest session使用。

#### 场景:匿名用户开始会话
- **当** 携带guest session的请求开始新会话
- **那么** 系统创建与该session关联的模拟会话

## MODIFIED Requirements

### 需求:模拟陪练场会话必须持久化到PostgreSQL
**FROM**: 会话数据存储在内存Map中，重启即丢失
**TO**: 会话数据必须持久化到 `simulation_sessions` 和 `simulation_turns` 表

#### 场景:会话持久化
- **当** 用户开始、继续或结束模拟陪练会话
- **那么** 所有状态变更都写入数据库
- **并且** 页面刷新后可恢复会话

#### 场景:轮次记录
- **当** 用户发送消息或收到AI回复
- **那么** 在 `simulation_turns` 表中创建记录
- **并且** 包含role、content、timestamp、analysis等字段

### 需求:模拟陪练场会话必须关联到用户或guest session
**FROM**: 会话不关联任何用户标识
**TO**: 会话必须关联到 user_id 或 guest_session_id

#### 场景:会话归属
- **当** 查询用户的模拟陪练历史
- **那么** 系统返回该用户或该guest session的所有会话

## REMOVED Requirements
