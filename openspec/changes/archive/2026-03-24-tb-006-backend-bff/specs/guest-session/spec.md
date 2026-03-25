## ADDED Requirements

### 需求:系统必须支持匿名用户会话
未登录用户必须能够使用核心功能，系统通过guest session机制识别匿名用户。

#### 场景:首次访问创建session
- **当** 未登录用户首次访问功能页面
- **那么** 系统自动创建guest session
- **并且** 通过http-only cookie返回session ID

#### 场景:已有session识别
- **当** 携带有效guest session cookie的用户发起请求
- **那么** 系统识别该session并关联用户数据

### 需求:guest session数据必须可迁移到Clerk用户
用户登录后，其guest session期间产生的数据必须能够关联到Clerk用户账号。

#### 场景:登录后数据合并
- **当** 已拥有guest session的用户登录Clerk
- **那么** 系统将该session的user_id更新为Clerk用户ID
- **并且** 保留该session期间的所有practice条目

### 需求:guest session必须有过期机制
guest session在30天无活动后必须自动过期，数据可清理。

#### 场景:session过期
- **当** guest session超过30天无活动
- **那么** 该session标记为过期
- **并且** 关联的匿名数据进入待清理状态

### 需求:session cookie必须安全配置
guest session cookie必须设置为httpOnly、secure、sameSite=strict。

#### 场景:cookie安全
- **当** 系统设置guest session cookie
- **那么** cookie属性包含httpOnly和secure
- **并且** JavaScript无法读取该cookie

## MODIFIED Requirements

## REMOVED Requirements
