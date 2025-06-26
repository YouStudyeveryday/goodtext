#!/usr/bin/env python3
"""
Railway部署脚本
GoodText AI文本清理工具后端部署
"""

import subprocess
import sys
import os
import json

def run_command(command, check=True):
    """运行命令并返回结果"""
    print(f"执行命令: {command}")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, check=check)
        if result.stdout:
            print(f"输出: {result.stdout}")
        return result
    except subprocess.CalledProcessError as e:
        print(f"命令执行失败: {e}")
        if e.stderr:
            print(f"错误: {e.stderr}")
        return None

def check_railway_cli():
    """检查Railway CLI是否安装"""
    result = run_command("railway --version", check=False)
    if result and result.returncode == 0:
        print("✅ Railway CLI已安装")
        return True
    else:
        print("❌ Railway CLI未安装")
        print("请访问 https://docs.railway.app/develop/cli 安装Railway CLI")
        return False

def login_railway():
    """登录Railway"""
    print("🔐 登录Railway...")
    result = run_command("railway login", check=False)
    if result and result.returncode == 0:
        print("✅ Railway登录成功")
        return True
    else:
        print("❌ Railway登录失败")
        return False

def create_or_link_project():
    """创建或链接Railway项目"""
    print("🚀 创建/链接Railway项目...")
    
    # 尝试链接现有项目
    result = run_command("railway status", check=False)
    if result and "No project linked" in result.stdout:
        print("未找到链接的项目，创建新项目...")
        
        # 创建新项目
        result = run_command("railway init goodtext-api", check=False)
        if result and result.returncode == 0:
            print("✅ 项目创建成功")
            return True
    else:
        print("✅ 项目已链接")
        return True
    
    return False

def deploy_to_railway():
    """部署到Railway"""
    print("🚀 开始部署到Railway...")
    
    # 部署
    result = run_command("railway up", check=False)
    if result and result.returncode == 0:
        print("✅ 部署成功!")
        
        # 获取部署URL
        result = run_command("railway status", check=False)
        if result:
            print("\n部署信息:")
            print(result.stdout)
        
        return True
    else:
        print("❌ 部署失败")
        return False

def set_environment_variables():
    """设置环境变量"""
    print("⚙️ 设置环境变量...")
    
    env_vars = {
        "PYTHON_VERSION": "3.11",
        "PORT": "8000",
        "ENVIRONMENT": "production",
        "CORS_ORIGINS": "https://goodtext-ai-cleaner.netlify.app,https://*.railway.app"
    }
    
    for key, value in env_vars.items():
        cmd = f'railway variables set {key}="{value}"'
        result = run_command(cmd, check=False)
        if result and result.returncode == 0:
            print(f"✅ 设置 {key}")
        else:
            print(f"❌ 设置 {key} 失败")

def main():
    """主函数"""
    print("🧹 GoodText API Railway部署脚本")
    print("=" * 50)
    
    # 检查Railway CLI
    if not check_railway_cli():
        return False
    
    # 登录Railway
    if not login_railway():
        return False
    
    # 创建或链接项目
    if not create_or_link_project():
        return False
    
    # 设置环境变量
    set_environment_variables()
    
    # 部署
    if deploy_to_railway():
        print("\n🎉 部署完成!")
        print("请检查Railway控制台获取部署URL")
        print("https://railway.app/dashboard")
        return True
    else:
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 