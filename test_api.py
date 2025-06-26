#!/usr/bin/env python3
"""
GoodText API测试脚本
用于验证Railway部署的后端API功能
"""

import requests
import json
import sys
from datetime import datetime

class APITester:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'GoodText-API-Tester/1.0',
            'Content-Type': 'application/json'
        })
    
    def print_test_header(self, test_name):
        print(f"\n{'='*50}")
        print(f"🧪 {test_name}")
        print(f"{'='*50}")
    
    def print_result(self, success, message, details=None):
        status = "✅ 成功" if success else "❌ 失败"
        print(f"{status}: {message}")
        if details:
            print(f"详情: {details}")
    
    def test_health_check(self):
        """测试健康检查端点"""
        self.print_test_header("健康检查测试")
        
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.print_result(True, "健康检查通过", f"状态: {data.get('status')}")
                return True
            else:
                self.print_result(False, f"HTTP状态码: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.print_result(False, "连接失败", str(e))
            return False
    
    def test_text_cleaning(self):
        """测试文本清理功能"""
        self.print_test_header("文本清理功能测试")
        
        test_text = """这是一个   测试文本。
        
        
        包含多余的   空格和换行符。
        
        还有一些需要清理的内容。"""
        
        payload = {
            "text": test_text,
            "options": {
                "remove_extra_spaces": True,
                "fix_line_breaks": True,
                "remove_empty_lines": True
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/clean",
                json=payload,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                original_length = len(data['original_text'])
                cleaned_length = len(data['cleaned_text'])
                
                self.print_result(
                    True, 
                    "文本清理成功",
                    f"原始长度: {original_length}, 清理后: {cleaned_length}, 变化: {data['changes_made']}"
                )
                return True
            else:
                self.print_result(False, f"HTTP状态码: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.print_result(False, "请求失败", str(e))
            return False
    
    def test_batch_cleaning(self):
        """测试批量清理功能"""
        self.print_test_header("批量清理功能测试")
        
        test_texts = [
            "第一段   测试文本\n\n包含空格",
            "第二段文本   \n   也有格式问题",
            "第三段\n\n\n\n多余换行"
        ]
        
        payload = {
            "texts": test_texts,
            "options": {
                "remove_extra_spaces": True,
                "fix_line_breaks": True
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/clean/batch",
                json=payload,
                timeout=20
            )
            
            if response.status_code == 200:
                data = response.json()
                processed_count = len(data['results'])
                
                self.print_result(
                    True,
                    "批量清理成功",
                    f"处理了 {processed_count} 个文本, 总计: {data['summary']}"
                )
                return True
            else:
                self.print_result(False, f"HTTP状态码: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.print_result(False, "请求失败", str(e))
            return False
    
    def test_supported_languages(self):
        """测试支持的语言查询"""
        self.print_test_header("支持语言查询测试")
        
        try:
            response = self.session.get(f"{self.base_url}/api/languages", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                language_count = len(data.get('supported_languages', {}))
                
                self.print_result(
                    True,
                    "语言查询成功",
                    f"支持 {language_count} 种语言"
                )
                return True
            else:
                self.print_result(False, f"HTTP状态码: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.print_result(False, "请求失败", str(e))
            return False
    
    def test_cors_headers(self):
        """测试CORS配置"""
        self.print_test_header("CORS配置测试")
        
        try:
            # 发送OPTIONS预检请求
            response = self.session.options(
                f"{self.base_url}/api/clean",
                headers={
                    'Origin': 'https://goodtext-ai-cleaner.netlify.app',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                },
                timeout=10
            )
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            if response.status_code in [200, 204]:
                self.print_result(True, "CORS配置正确", f"响应头: {cors_headers}")
                return True
            else:
                self.print_result(False, f"CORS预检失败: {response.status_code}", str(cors_headers))
                return False
                
        except Exception as e:
            self.print_result(False, "CORS测试失败", str(e))
            return False
    
    def run_all_tests(self):
        """运行所有测试"""
        print(f"🚀 GoodText API 部署验证测试")
        print(f"目标URL: {self.base_url}")
        print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        tests = [
            self.test_health_check,
            self.test_text_cleaning,
            self.test_batch_cleaning,
            self.test_supported_languages,
            self.test_cors_headers
        ]
        
        results = []
        for test in tests:
            try:
                result = test()
                results.append(result)
            except Exception as e:
                print(f"❌ 测试执行异常: {e}")
                results.append(False)
        
        # 测试总结
        self.print_test_header("测试结果总结")
        passed = sum(results)
        total = len(results)
        
        print(f"通过: {passed}/{total} 个测试")
        
        if passed == total:
            print("🎉 所有测试通过！API部署成功！")
        elif passed >= total * 0.8:
            print("⚠️ 大部分测试通过，但可能需要一些调整")
        else:
            print("💥 多个测试失败，需要检查部署配置")
        
        return passed == total

def main():
    if len(sys.argv) != 2:
        print("使用方法: python test_api.py <API_BASE_URL>")
        print("例如: python test_api.py https://goodtext-api-production.railway.app")
        sys.exit(1)
    
    api_url = sys.argv[1]
    tester = APITester(api_url)
    
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 