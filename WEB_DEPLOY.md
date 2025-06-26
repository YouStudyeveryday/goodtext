# 🚀 Railway Web界面部署详细步骤

## 📝 前置条件确认

✅ **已完成的配置文件：**
- `app.py` - FastAPI应用
- `requirements.txt` - Python依赖
- `railway.toml` - Railway配置
- `railway.json` - Railway JSON配置  
- `nixpacks.toml` - Nixpacks构建配置
- `Procfile` - 进程配置

## 🌐 Web界面部署步骤

### 第1步：访问Railway控制台
1. 打开浏览器访问：https://railway.app/dashboard
2. 使用GitHub账号登录Railway

### 第2步：创建新项目
1. 点击 **"New Project"** 按钮
2. 选择 **"Deploy from GitHub repo"**
3. 授权Railway访问您的GitHub账号
4. 选择包含GoodText项目的仓库

### 第3步：项目配置
1. **项目名称**：`goodtext-api`
2. **分支选择**：选择 `master` 或 `main` 分支
3. **根目录**：保持默认（项目根目录）

### 第4步：环境变量配置
在项目设置的 **Variables** 标签页中添加：

```bash
# 必需的环境变量
PYTHON_VERSION=3.11
PORT=8000
ENVIRONMENT=production

# CORS配置 - 关键！
CORS_ORIGINS=https://goodtext-ai-cleaner.netlify.app,https://*.railway.app
```

### 第5步：部署设置验证
确认以下设置：
- **Build Command**: 自动检测（Nixpacks）
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/api/health`
- **Health Check Timeout**: 60秒

### 第6步：开始部署
1. 点击 **"Deploy"** 按钮
2. 等待构建完成（通常2-5分钟）
3. 检查部署日志确认无错误

## 🔍 部署后验证

### 获取部署URL
部署成功后，Railway会分配一个URL，格式类似：
```
https://goodtext-api-production.railway.app
```

### 测试API端点

#### 1. 健康检查
```bash
curl https://your-railway-url.railway.app/api/health
```
**期望响应：**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

#### 2. 文本清理测试
```bash
curl -X POST https://your-railway-url.railway.app/api/clean \
  -H "Content-Type: application/json" \
  -d '{
    "text": "这是   测试文本\n\n包含多余空格",
    "options": {
      "remove_extra_spaces": true,
      "fix_line_breaks": true
    }
  }'
```

#### 3. 支持语言查询
```bash
curl https://your-railway-url.railway.app/api/languages
```

## 🔗 更新前端连接

### 方法1：使用Netlify代理（推荐）
更新 `_redirects` 文件：
```
/api/*  https://your-actual-railway-url.railway.app/api/:splat  200
```

### 方法2：直接更新API URL
在 `api-integration.js` 中更新：
```javascript
getApiUrl() {
    // 替换为实际的Railway URL
    return 'https://your-actual-railway-url.railway.app';
}
```

## 🐛 常见问题解决

### 1. 构建失败
**症状：** Build failed during dependency installation
**解决：** 
- 检查 `requirements.txt` 版本兼容性
- 确认Python版本设置正确

### 2. 启动失败
**症状：** Application crashed on startup
**解决：**
- 验证 `PORT` 环境变量
- 检查启动命令格式
- 查看应用日志定位错误

### 3. 健康检查失败
**症状：** Health check timeout
**解决：**
- 确认 `/api/health` 端点响应
- 增加健康检查超时时间
- 检查应用启动时间

### 4. CORS错误
**症状：** 前端无法访问API
**解决：**
- 验证 `CORS_ORIGINS` 环境变量
- 确认域名完全匹配
- 检查预检请求处理

## 📊 部署成功检查清单

- [ ] Railway项目部署成功
- [ ] 健康检查端点正常响应
- [ ] 文本清理API正常工作
- [ ] 语言支持API正常返回
- [ ] CORS配置正确，前端可访问
- [ ] Netlify代理配置更新
- [ ] 前后端集成测试通过

## 🚀 下一步优化

1. **监控设置**
   - 配置错误追踪
   - 设置性能监控
   - 启用日志聚合

2. **安全优化**
   - 添加请求限流
   - 实现API密钥认证
   - 设置输入验证

3. **性能优化**
   - 启用响应缓存
   - 优化处理算法
   - 实现异步处理

## 🎯 部署完成标志

当以下条件都满足时，部署即为成功：

✅ Railway控制台显示 "Deployed"
✅ 健康检查端点返回200状态
✅ 前端可以正常调用后端API
✅ 文本清理功能正常工作
✅ 无CORS跨域错误

---

🎉 **完成后，您的GoodText将拥有强大的多语言后端支持，大幅提升文本处理能力！** 