# 🚀 GoodText API Railway部署指南

## 📋 部署前准备

### 1. 项目文件检查
确保以下文件存在且配置正确：

- ✅ `app.py` - FastAPI应用主文件
- ✅ `requirements.txt` - Python依赖
- ✅ `railway.toml` - Railway配置文件
- ✅ `railway.json` - Railway JSON配置
- ✅ `Procfile` - 进程配置文件

### 2. 项目特点
- **纯Python FastAPI应用**
- **多语言文本清理API**
- **支持批量处理**
- **RESTful API设计**
- **健康检查端点**

## 🛠 Railway CLI部署方法

### 安装Railway CLI
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# 或者通过npm
npm install -g @railway/cli

# 验证安装
railway --version
```

### 部署步骤
```bash
# 1. 登录Railway
railway login

# 2. 初始化项目
railway init goodtext-api

# 3. 设置环境变量
railway variables set PYTHON_VERSION=3.11
railway variables set PORT=8000
railway variables set ENVIRONMENT=production
railway variables set CORS_ORIGINS="https://goodtext-ai-cleaner.netlify.app,https://*.railway.app"

# 4. 部署
railway up

# 5. 获取部署URL
railway status
```

## 🌐 Web界面部署方法

### 1. 访问Railway控制台
访问：https://railway.app/dashboard

### 2. 创建新项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 连接GitHub并选择此仓库

### 3. 配置环境变量
在Railway项目设置中添加：

```
PYTHON_VERSION = 3.11
PORT = 8000
ENVIRONMENT = production
CORS_ORIGINS = https://goodtext-ai-cleaner.netlify.app,https://*.railway.app
```

### 4. 配置部署设置
- **Build Command**: 自动检测 (Nixpacks)
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/api/health`

## 📁 项目结构说明

```
goodtext/
├── app.py              # FastAPI主应用
├── requirements.txt    # Python依赖
├── railway.toml       # Railway配置
├── railway.json       # Railway JSON配置
├── Procfile          # 进程配置
├── README.md         # 项目说明
└── DEPLOYMENT_GUIDE.md # 部署指南
```

## 🔧 关键配置文件

### railway.toml
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn app:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/api/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[env]
PYTHON_VERSION = "3.11"
PORT = "8000"
ENVIRONMENT = "production"

[variables]
CORS_ORIGINS = "https://goodtext-ai-cleaner.netlify.app,https://*.railway.app"
```

### requirements.txt
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
langdetect==1.0.9
python-multipart==0.0.6
```

## 🧪 API端点测试

部署完成后，测试以下端点：

### 健康检查
```bash
curl https://your-app.railway.app/api/health
```

### 文本清理
```bash
curl -X POST https://your-app.railway.app/api/clean \
  -H "Content-Type: application/json" \
  -d '{
    "text": "这是一个   测试文本\n\n包含多余的   空格",
    "options": {
      "remove_extra_spaces": true,
      "fix_line_breaks": true
    }
  }'
```

### 支持的语言
```bash
curl https://your-app.railway.app/api/languages
```

## 🔗 前后端集成

### 1. 获取部署URL
部署成功后，Railway会提供一个URL，类似：
`https://goodtext-api-production.railway.app`

### 2. 更新前端配置
在Netlify前端应用中更新API端点：

```javascript
// api-integration.js
const API_BASE_URL = 'https://goodtext-api-production.railway.app';

// 更新所有API调用
fetch(`${API_BASE_URL}/api/clean`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: inputText,
    options: cleaningOptions
  })
});
```

### 3. CORS配置验证
确保Railway后端的CORS设置包含Netlify域名：
```
CORS_ORIGINS = https://goodtext-ai-cleaner.netlify.app,https://*.railway.app
```

## 🐛 常见问题排查

### 1. 部署失败
- 检查 `requirements.txt` 中的依赖版本
- 验证 `railway.toml` 配置语法
- 查看Railway控制台的构建日志

### 2. 应用无法启动
- 检查端口配置 (`PORT` 环境变量)
- 验证启动命令格式
- 查看应用日志

### 3. CORS错误
- 确认CORS_ORIGINS环境变量设置
- 检查前端请求的域名是否匹配
- 验证预检请求(OPTIONS)处理

### 4. 健康检查失败
- 确认 `/api/health` 端点正常响应
- 检查健康检查超时设置
- 验证应用启动时间

## 📊 监控和维护

### 1. Railway控制台监控
- 访问Railway项目控制台
- 查看部署状态和日志
- 监控资源使用情况

### 2. 应用性能监控
- 响应时间监控
- 错误率统计
- 资源消耗分析

### 3. 定期维护
- 依赖包更新
- 安全补丁应用
- 性能优化

## 🎯 部署成功验证

部署成功后，您应该能够：

1. ✅ 访问健康检查端点
2. ✅ 调用文本清理API
3. ✅ 前端可以正常调用后端API
4. ✅ CORS配置正确，无跨域错误
5. ✅ 应用稳定运行，无重启循环

## 💡 优化建议

### 1. 性能优化
- 启用Redis缓存（可选）
- 实现请求限流
- 优化文本处理算法

### 2. 安全优化
- 添加API密钥认证
- 实现输入验证和清理
- 设置请求大小限制

### 3. 监控优化
- 集成日志聚合服务
- 添加错误追踪
- 实现性能指标收集

---

🎉 **部署完成后，您的GoodText API将具备强大的多语言文本清理能力，为前端提供可靠的后端服务支持！** 