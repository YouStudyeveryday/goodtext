// API集成脚本 - 连接前端与FastAPI后端
class GoodTextAPI {
    constructor() {
        // 根据环境自动选择API URL
        this.apiUrl = this.getApiUrl();
        this.isOnline = navigator.onLine;
        
        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('网络已连接，现在可以使用高级功能', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('网络已断开，将使用本地基础功能', 'warning');
        });
    }
    
    getApiUrl() {
        // 使用_redirects配置的API路径
        if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com')) {
            return window.location.origin + '/api';
        }
        // 本地开发环境
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        // 默认使用API路径
        return window.location.origin + '/api';
    }
    
    async cleanText(text, options = {}, language = null) {
        // 如果网络不可用，使用本地清理功能
        if (!this.isOnline) {
            return this.fallbackClean(text, options);
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/clean`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    options: options,
                    language: language
                })
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.warn('API请求失败，使用本地处理:', error);
            return this.fallbackClean(text, options);
        }
    }
    
    async cleanTextBatch(texts, options = {}, language = null) {
        if (!this.isOnline) {
            // 批量本地处理
            const results = texts.map(text => this.fallbackClean(text, options));
            return {
                results: results,
                summary: {
                    total_texts_processed: results.length,
                    total_chars_removed: results.reduce((sum, r) => sum + r.stats.chars_removed, 0),
                    total_lines_removed: results.reduce((sum, r) => sum + (r.stats.original_lines - r.stats.cleaned_lines), 0)
                }
            };
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/clean`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    texts: texts,
                    options: options,
                    language: language
                })
            });
            
            if (!response.ok) {
                throw new Error(`批量API请求失败: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn('批量API请求失败，使用本地处理:', error);
            const results = texts.map(text => this.fallbackClean(text, options));
            return {
                results: results,
                summary: {
                    total_texts_processed: results.length,
                    total_chars_removed: results.reduce((sum, r) => sum + r.stats.chars_removed, 0),
                    total_lines_removed: results.reduce((sum, r) => sum + (r.stats.original_lines - r.stats.cleaned_lines), 0)
                }
            };
        }
    }
    
    async getSupportedLanguages() {
        try {
            const response = await fetch(`${this.apiUrl}/languages`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('无法获取支持的语言列表:', error);
        }
        
        // 返回默认支持的语言
        return {
            supported_languages: {
                "en": "English",
                "zh": "Chinese",
                "de": "German",
                "fr": "French",
                "es": "Spanish",
                "ru": "Russian",
                "ja": "Japanese",
                "ko": "Korean"
            }
        };
    }
    
    // 本地fallback清理功能（保持与原有功能兼容）
    fallbackClean(text, options = {}) {
        const originalText = text;
        let cleanedText = text;
        const changesMade = [];
        
        // 基础清理功能
        if (options.remove_extra_spaces !== false) {
            const beforeSpaces = cleanedText;
            cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
            if (beforeSpaces !== cleanedText) {
                changesMade.push('移除了多余空格');
            }
        }
        
        if (options.fix_line_breaks !== false) {
            const beforeLines = cleanedText;
            cleanedText = cleanedText.replace(/\n\s*\n\s*\n/g, '\n\n');
            if (beforeLines !== cleanedText) {
                changesMade.push('修复了换行问题');
            }
        }
        
        if (options.remove_empty_lines !== false) {
            const beforeEmpty = cleanedText;
            cleanedText = cleanedText.replace(/^\s*$/gm, '').replace(/\n{3,}/g, '\n\n');
            if (beforeEmpty !== cleanedText) {
                changesMade.push('移除了空行');
            }
        }
        
        // 计算统计信息
        const stats = {
            original_length: originalText.length,
            cleaned_length: cleanedText.length,
            chars_removed: originalText.length - cleanedText.length,
            original_lines: originalText.split('\n').length,
            cleaned_lines: cleanedText.split('\n').length,
            original_words: originalText.split(/\s+/).length,
            cleaned_words: cleanedText.split(/\s+/).length
        };
        
        return {
            original_text: originalText,
            cleaned_text: cleanedText,
            detected_language: 'unknown',
            changes_made: changesMade,
            stats: stats
        };
    }
    
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        // 根据类型设置颜色
        const colors = {
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// 创建全局API实例
window.goodTextAPI = new GoodTextAPI();

// 更新现有的cleanText函数以使用新API
async function enhancedCleanText() {
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText');
    
    if (!inputText.trim()) {
        goodTextAPI.showNotification('请输入要清理的文本', 'warning');
        return;
    }
    
    // 显示处理中状态
    outputText.value = '正在处理文本...';
    outputText.classList.add('processing-indicator');
    
    try {
        // 获取清理选项
        const options = {
            remove_extra_spaces: document.getElementById('removeSpaces')?.checked !== false,
            fix_line_breaks: document.getElementById('fixLineBreaks')?.checked !== false,
            remove_empty_lines: document.getElementById('removeEmptyLines')?.checked !== false,
            fix_hyphenation: document.getElementById('fixHyphenation')?.checked !== false,
            normalize_punctuation: document.getElementById('normalizePunctuation')?.checked !== false,
            remove_html: document.getElementById('removeHtml')?.checked !== false,
            remove_markdown: document.getElementById('removeMarkdown')?.checked !== false,
            fix_ai_artifacts: document.getElementById('fixAiArtifacts')?.checked !== false,
        };
        
        // 获取语言选择
        const language = document.getElementById('languageSelect')?.value || null;
        
        // 调用API清理文本
        const result = await goodTextAPI.cleanText(inputText, options, language);
        
        // 显示结果
        outputText.value = result.cleaned_text;
        outputText.classList.remove('processing-indicator');
        
        // 启用复制按钮
        document.getElementById('copyBtn').disabled = false;
        
        // 显示统计信息
        displayCleaningStats(result);
        
        // 显示成功通知
        if (result.changes_made.length > 0) {
            goodTextAPI.showNotification(`文本清理完成！进行了${result.changes_made.length}项改进`, 'success');
        } else {
            goodTextAPI.showNotification('文本已经很干净了！', 'info');
        }
        
    } catch (error) {
        outputText.classList.remove('processing-indicator');
        outputText.value = inputText; // 恢复原文本
        goodTextAPI.showNotification('文本处理失败，请重试', 'error');
        console.error('清理失败:', error);
    }
}

function displayCleaningStats(result) {
    // 创建或更新统计显示区域
    let statsDiv = document.getElementById('processStats');
    if (statsDiv) {
        statsDiv.style.display = 'block';
        
        const stats = result.stats;
        const changesList = result.changes_made.map(change => `<li>${change}</li>`).join('');
        
        document.getElementById('statsContent').innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div>
                    <strong>字符变化:</strong><br>
                    ${stats.original_length} → ${stats.cleaned_length}
                    ${stats.chars_removed > 0 ? `<span style="color: #28a745;">(-${stats.chars_removed})</span>` : '<span style="color: #6c757d;">(无变化)</span>'}
                </div>
                <div>
                    <strong>行数变化:</strong><br>
                    ${stats.original_lines} → ${stats.cleaned_lines}
                </div>
                <div>
                    <strong>检测语言:</strong><br>
                    ${getLanguageName(result.detected_language)}
                </div>
            </div>
            ${changesList ? `<div>
                <strong>进行的改进:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">${changesList}</ul>
            </div>` : ''}
        `;
    }
}

function getLanguageName(code) {
    const languages = {
        'en': '英语',
        'zh': '中文', 
        'de': '德语',
        'fr': '法语',
        'es': '西班牙语',
        'ru': '俄语',
        'ja': '日语',
        'ko': '韩语',
        'unknown': '未知'
    };
    return languages[code] || '未知';
} 