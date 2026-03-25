## ADDED Requirements

### 需求:模拟陪练场会话必须持久化到数据库
所有模拟陪练场会话数据必须存储在PostgreSQL中，禁止仅使用内存存储。

#### 场景:会话开始持久化
- **当** 用户开始新的模拟陪练会话
- **那么** 系统在 `simulation_sessions` 表中创建记录
- **并且** 在 `simulation_turns` 表中记录初始AI消息

#### 场景:对话轮次持久化
- **当** 用户发送消息并收到AI回复
- **那么** 系统在 `simulation_turns` 表中记录用户消息和AI回复
- **并且** 更新 `simulation_sessions` 的更新时间和轮次计数

#### 场景:会话重启保留历史
- **当** 用户重启当前会话
- **那么** 系统将旧会话标记为已重启
- **并且** 创建新会话记录，保留关联关系

### 需求:会话必须支持过期和清理
模拟陪练场会话在90天无活动后必须可清理。

#### 场景:过期会话清理
- **当** 会话超过90天无更新
- **那么** 系统可归档或删除该会话及其轮次数据

### 需求:必须实现Repository模式访问会话数据
系统必须通过Repository层访问数据库，禁止在Service层直接操作SQL。

#### 场景:Repository接口
- **当** 开发者需要查询会话数据
- **那么** 通过 `SimulatorRepository` 接口方法操作
- **并且** 单元测试可mock Repository

## MODIFIED Requirements

## REMOVED Requirements
