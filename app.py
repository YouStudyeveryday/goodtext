from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import re
import unicodedata
import html
from typing import Optional, List, Dict
import json
import langdetect
from langdetect import detect

app = FastAPI(
    title="GoodText API",
    description="多语言文档清理和格式化API - Advanced text cleaning and formatting for multiple languages",
    version="1.0.0"
)

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class TextCleanRequest(BaseModel):
    text: str
    options: Optional[Dict[str, bool]] = None
    language: Optional[str] = None

class BatchCleanRequest(BaseModel):
    texts: List[str]
    options: Optional[Dict[str, bool]] = None
    language: Optional[str] = None

# Response models
class CleanResult(BaseModel):
    original_text: str
    cleaned_text: str
    detected_language: str
    changes_made: List[str]
    stats: Dict[str, int]

class BatchCleanResult(BaseModel):
    results: List[CleanResult]
    summary: Dict[str, int]

class AdvancedTextCleaner:
    def __init__(self):
        # 多语言标点符号映射
        self.punctuation_map = {
            # 中文标点 -> 英文标点
            '，': ',',
            '。': '.',
            '？': '?',
            '！': '!',
            '；': ';',
            '：': ':',
            '"': '"',
            '"': '"',
            ''': "'",
            ''': "'",
            '（': '(',
            '）': ')',
            '【': '[',
            '】': ']',
            '《': '<',
            '》': '>',
            '、': ',',
            
            # 法语标点
            '«': '"',
            '»': '"',
            
            # 德语标点
            '„': '"',
            '"': '"',
            
            # 西班牙语标点
            '¿': '',
            '¡': '',
        }
        
        # 多语言连字符模式
        self.hyphenation_patterns = {
            'en': r'(?<=[a-z])-\s*\n\s*(?=[a-z])',
            'zh': r'(?<=[\u4e00-\u9fff])-\s*\n\s*(?=[\u4e00-\u9fff])',
            'de': r'(?<=[a-zA-ZäöüßÄÖÜ])-\s*\n\s*(?=[a-zA-ZäöüßÄÖÜ])',
            'fr': r'(?<=[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ])-\s*\n\s*(?=[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ])',
            'es': r'(?<=[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])-\s*\n\s*(?=[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])',
            'ru': r'(?<=[а-яёА-ЯЁ])-\s*\n\s*(?=[а-яёА-ЯЁ])',
            'ja': r'(?<=[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff])-\s*\n\s*(?=[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff])',
            'ko': r'(?<=[\uac00-\ud7af])-\s*\n\s*(?=[\uac00-\ud7af])',
        }
        
        # 语言特定的换行模式
        self.line_break_patterns = {
            'zh': r'(?<=[\u4e00-\u9fff])\s*\n\s*(?=[\u4e00-\u9fff])',
            'ja': r'(?<=[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff])\s*\n\s*(?=[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff])',
            'ko': r'(?<=[\uac00-\ud7af])\s*\n\s*(?=[\uac00-\ud7af])',
            'th': r'(?<=[\u0e00-\u0e7f])\s*\n\s*(?=[\u0e00-\u0e7f])',
            'ar': r'(?<=[\u0600-\u06ff])\s*\n\s*(?=[\u0600-\u06ff])',
            'he': r'(?<=[\u0590-\u05ff])\s*\n\s*(?=[\u0590-\u05ff])',
        }

    def detect_language(self, text: str) -> str:
        """检测文本语言"""
        try:
            # 去除多余空白后检测
            clean_text = re.sub(r'\s+', ' ', text.strip())
            if len(clean_text) < 10:
                return 'unknown'
            return detect(clean_text)
        except:
            return 'unknown'

    def clean_text(self, text: str, options: Dict[str, bool] = None, language: str = None) -> CleanResult:
        """高级文本清理功能"""
        if not text.strip():
            raise ValueError("输入文本不能为空")
        
        original_text = text
        changes_made = []
        
        # 默认选项
        default_options = {
            'remove_extra_spaces': True,
            'fix_line_breaks': True,
            'remove_empty_lines': True,
            'fix_hyphenation': True,
            'normalize_punctuation': True,
            'remove_html': True,
            'remove_markdown': True,
            'fix_encoding': True,
            'normalize_quotes': True,
            'remove_duplicates': True,
            'fix_ai_artifacts': True,
            'standardize_numbers': False,
            'convert_case': False,
        }
        
        if options:
            default_options.update(options)
        
        # 检测语言
        if not language:
            language = self.detect_language(text)
        
        # 开始清理
        cleaned_text = text
        
        # 1. 修复编码问题
        if default_options.get('fix_encoding'):
            cleaned_text = self._fix_encoding(cleaned_text)
            if cleaned_text != text:
                changes_made.append("修复了文本编码问题")
        
        # 2. 清理HTML标签
        if default_options.get('remove_html'):
            old_text = cleaned_text
            cleaned_text = self._remove_html(cleaned_text)
            if cleaned_text != old_text:
                changes_made.append("移除了HTML标签")
        
        # 3. 清理Markdown标记
        if default_options.get('remove_markdown'):
            old_text = cleaned_text
            cleaned_text = self._remove_markdown(cleaned_text)
            if cleaned_text != old_text:
                changes_made.append("移除了Markdown标记")
        
        # 4. 修复连字符断行
        if default_options.get('fix_hyphenation'):
            old_text = cleaned_text
            cleaned_text = self._fix_hyphenation(cleaned_text, language)
            if cleaned_text != old_text:
                changes_made.append("修复了连字符断行")
        
        # 5. 修复换行问题
        if default_options.get('fix_line_breaks'):
            old_text = cleaned_text
            cleaned_text = self._fix_line_breaks(cleaned_text, language)
            if cleaned_text != old_text:
                changes_made.append("修复了换行问题")
        
        # 6. 移除多余空格
        if default_options.get('remove_extra_spaces'):
            old_text = cleaned_text
            cleaned_text = self._remove_extra_spaces(cleaned_text)
            if cleaned_text != old_text:
                changes_made.append("移除了多余空格")
        
        # 7. 移除空行
        if default_options.get('remove_empty_lines'):
            old_text = cleaned_text
            cleaned_text = self._remove_empty_lines(cleaned_text)
            if cleaned_text != old_text:
                changes_made.append("移除了空行")
        
        # 8. 标准化标点符号
        if default_options.get('normalize_punctuation'):
            old_text = cleaned_text
            cleaned_text = self._normalize_punctuation(cleaned_text, language)
            if cleaned_text != old_text:
                changes_made.append("标准化了标点符号")
        
        # 9. 标准化引号
        if default_options.get('normalize_quotes'):
            old_text = cleaned_text
            cleaned_text = self._normalize_quotes(cleaned_text)
            if cleaned_text != old_text:
                changes_made.append("标准化了引号")
        
        # 10. 移除重复行
        if default_options.get('remove_duplicates'):
            old_text = cleaned_text
            cleaned_text = self._remove_duplicate_lines(cleaned_text)
            if cleaned_text != old_text:
                changes_made.append("移除了重复行")
        
        # 11. 清理AI生成文本的特殊标记
        if default_options.get('fix_ai_artifacts'):
            old_text = cleaned_text
            cleaned_text = self._fix_ai_artifacts(cleaned_text)
            if cleaned_text != old_text:
                changes_made.append("清理了AI生成文本的特殊标记")
        
        # 计算统计信息
        stats = self._calculate_stats(original_text, cleaned_text)
        
        return CleanResult(
            original_text=original_text,
            cleaned_text=cleaned_text,
            detected_language=language,
            changes_made=changes_made,
            stats=stats
        )

    def _fix_encoding(self, text: str) -> str:
        """修复编码问题"""
        # 修复常见的编码问题
        text = text.replace('â€™', "'")  # 右单引号
        text = text.replace('â€œ', '"')  # 左双引号
        text = text.replace('â€', '"')   # 右双引号
        text = text.replace('â€"', '—')  # 长划线
        text = text.replace('â€"', '–')  # 短划线
        text = text.replace('Â', '')     # 非断空格问题
        
        # Unicode标准化
        text = unicodedata.normalize('NFKC', text)
        
        return text

    def _remove_html(self, text: str) -> str:
        """移除HTML标签"""
        # 先解码HTML实体
        text = html.unescape(text)
        
        # 移除HTML标签
        text = re.sub(r'<[^>]+>', '', text)
        
        # 移除HTML注释
        text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
        
        return text

    def _remove_markdown(self, text: str) -> str:
        """移除Markdown标记"""
        # 移除代码块
        text = re.sub(r'```[\s\S]*?```', '', text)
        text = re.sub(r'`[^`]*`', '', text)
        
        # 移除标题标记
        text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
        
        # 移除链接
        text = re.sub(r'\[([^\]]*)\]\([^\)]*\)', r'\1', text)
        
        # 移除图片
        text = re.sub(r'!\[([^\]]*)\]\([^\)]*\)', '', text)
        
        # 移除粗体和斜体
        text = re.sub(r'\*\*([^*]*)\*\*', r'\1', text)
        text = re.sub(r'\*([^*]*)\*', r'\1', text)
        text = re.sub(r'__([^_]*)__', r'\1', text)
        text = re.sub(r'_([^_]*)_', r'\1', text)
        
        # 移除列表标记
        text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
        
        # 移除引用标记
        text = re.sub(r'^\s*>\s*', '', text, flags=re.MULTILINE)
        
        # 移除分割线
        text = re.sub(r'^-{3,}$', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\*{3,}$', '', text, flags=re.MULTILINE)
        
        return text

    def _fix_hyphenation(self, text: str, language: str) -> str:
        """修复连字符断行问题"""
        if language in self.hyphenation_patterns:
            pattern = self.hyphenation_patterns[language]
            text = re.sub(pattern, '', text)
        else:
            # 通用连字符修复
            text = re.sub(r'(?<=[a-zA-Z])-\s*\n\s*(?=[a-zA-Z])', '', text)
        
        return text

    def _fix_line_breaks(self, text: str, language: str) -> str:
        """修复换行问题"""
        # 语言特定的换行修复
        if language in self.line_break_patterns:
            pattern = self.line_break_patterns[language]
            text = re.sub(pattern, '', text)
        
        # 修复段落间的换行
        text = re.sub(r'(?<=[.!?])\s*\n\s*(?=[A-Z\u4e00-\u9fff])', '\n\n', text)
        
        # 修复句子中间的换行
        text = re.sub(r'(?<=[^.!?\n])\s*\n\s*(?=[a-z\u4e00-\u9fff])', ' ', text)
        
        return text

    def _remove_extra_spaces(self, text: str) -> str:
        """移除多余空格"""
        # 移除行首行尾空格
        text = re.sub(r'[ \t]+$', '', text, flags=re.MULTILINE)
        text = re.sub(r'^[ \t]+', '', text, flags=re.MULTILINE)
        
        # 合并多个空格为一个
        text = re.sub(r'[ \t]+', ' ', text)
        
        # 移除制表符
        text = text.replace('\t', ' ')
        
        return text

    def _remove_empty_lines(self, text: str) -> str:
        """移除空行"""
        # 移除完全空白的行
        text = re.sub(r'\n\s*\n', '\n\n', text)
        
        # 移除超过两个的连续换行
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()

    def _normalize_punctuation(self, text: str, language: str) -> str:
        """标准化标点符号"""
        for old_punct, new_punct in self.punctuation_map.items():
            text = text.replace(old_punct, new_punct)
        
        # 修复标点符号周围的空格
        text = re.sub(r'\s+([,.!?;:])', r'\1', text)  # 移除标点前的空格
        text = re.sub(r'([,.!?;:])\s*', r'\1 ', text)  # 标点后加空格
        text = re.sub(r'\s+$', '', text, flags=re.MULTILINE)  # 移除行尾多余空格
        
        return text

    def _normalize_quotes(self, text: str) -> str:
        """标准化引号"""
        # 智能引号替换
        text = re.sub(r'["""]', '"', text)
        text = re.sub(r"[''']", "'", text)
        
        return text

    def _remove_duplicate_lines(self, text: str) -> str:
        """移除重复行"""
        lines = text.split('\n')
        unique_lines = []
        seen = set()
        
        for line in lines:
            line_stripped = line.strip()
            if line_stripped and line_stripped not in seen:
                unique_lines.append(line)
                seen.add(line_stripped)
            elif not line_stripped:
                unique_lines.append(line)
        
        return '\n'.join(unique_lines)

    def _fix_ai_artifacts(self, text: str) -> str:
        """清理AI生成文本的特殊标记"""
        # 移除常见的AI标记
        text = re.sub(r'\[Assistant\]|\[User\]|\[Human\]|\[AI\]', '', text)
        text = re.sub(r'```[\w]*\n?', '', text)  # 移除代码标记
        text = re.sub(r'\*\*Note:\*\*.*?(?=\n|$)', '', text)  # 移除Note标记
        text = re.sub(r'(?:Here\'s|Here is).*?:', '', text)  # 移除AI引导语
        
        return text

    def _calculate_stats(self, original: str, cleaned: str) -> Dict[str, int]:
        """计算清理统计"""
        return {
            'original_length': len(original),
            'cleaned_length': len(cleaned),
            'chars_removed': len(original) - len(cleaned),
            'original_lines': len(original.split('\n')),
            'cleaned_lines': len(cleaned.split('\n')),
            'original_words': len(original.split()),
            'cleaned_words': len(cleaned.split())
        }

# 创建清理器实例
cleaner = AdvancedTextCleaner()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """返回主页面"""
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="<h1>GoodText API</h1><p>API is running! Visit /docs for documentation.</p>")

@app.post("/api/clean", response_model=CleanResult)
async def clean_text(request: TextCleanRequest):
    """清理单个文本"""
    try:
        result = cleaner.clean_text(
            text=request.text,
            options=request.options,
            language=request.language
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文本处理错误: {str(e)}")

@app.post("/api/clean/batch", response_model=BatchCleanResult)
async def clean_texts_batch(request: BatchCleanRequest):
    """批量清理文本"""
    if len(request.texts) > 100:
        raise HTTPException(status_code=400, detail="批量处理最多支持100个文本")
    
    try:
        results = []
        total_chars_removed = 0
        total_lines_removed = 0
        
        for text in request.texts:
            if text.strip():  # 跳过空文本
                result = cleaner.clean_text(
                    text=text,
                    options=request.options,
                    language=request.language
                )
                results.append(result)
                total_chars_removed += result.stats['chars_removed']
                total_lines_removed += (result.stats['original_lines'] - result.stats['cleaned_lines'])
        
        summary = {
            'total_texts_processed': len(results),
            'total_chars_removed': total_chars_removed,
            'total_lines_removed': total_lines_removed
        }
        
        return BatchCleanResult(results=results, summary=summary)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量处理错误: {str(e)}")

@app.get("/api/languages")
async def get_supported_languages():
    """获取支持的语言列表"""
    return {
        "supported_languages": {
            "en": "English",
            "zh": "Chinese",
            "de": "German", 
            "fr": "French",
            "es": "Spanish",
            "ru": "Russian",
            "ja": "Japanese",
            "ko": "Korean",
            "th": "Thai",
            "ar": "Arabic",
            "he": "Hebrew"
        }
    }

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 