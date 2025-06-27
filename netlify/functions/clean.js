exports.handler = async (event, context) => {
  console.log('Clean function called with method:', event.httpMethod);
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const requestData = JSON.parse(event.body);
    console.log('Request data received:', requestData);
    
    const { text, options = {}, language = 'auto' } = requestData;
    
    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required and must be a string' })
      };
    }

    // Advanced text cleaning logic
    const cleanResult = cleanText(text, options, language);
    
    console.log('Clean result generated:', {
      originalLength: text.length,
      cleanedLength: cleanResult.cleaned_text.length
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        original_text: text,
        cleaned_text: cleanResult.cleaned_text,
        detected_language: cleanResult.detected_language,
        changes_made: cleanResult.changes_made,
        stats: cleanResult.stats
      })
    };

  } catch (error) {
    console.error('Error in clean function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      })
    };
  }
};

// Text cleaning implementation
function cleanText(text, options = {}, language = 'auto') {
  const originalLength = text.length;
  const originalLines = text.split('\n').length;
  
  let cleaned = text;
  let changes = [];
  
  // Default options
  const settings = {
    removeSpaces: true,
    fixLineBreaks: true,
    removeEmptyLines: true,
    fixHyphenation: true,
    normalizePunctuation: true,
    normalizeQuotes: true,
    removeHtml: false,
    removeMarkdown: true,
    fixAiArtifacts: true,
    ...options
  };

  // Language detection
  const detectedLang = detectLanguage(cleaned);
  
  // Apply cleaning options
  if (settings.removeSpaces) {
    const before = cleaned;
    cleaned = cleaned.replace(/[ \t]+/g, ' ').replace(/^ +| +$/gm, '');
    if (before !== cleaned) changes.push('Removed extra spaces');
  }
  
  if (settings.fixLineBreaks) {
    const before = cleaned;
    cleaned = cleaned.replace(/([a-zA-Z\u4e00-\u9fff])\n(?=[a-z\u4e00-\u9fff])/g, '$1 ');
    if (before !== cleaned) changes.push('Fixed line breaks');
  }
  
  if (settings.removeEmptyLines) {
    const before = cleaned;
    cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
    if (before !== cleaned) changes.push('Removed excessive empty lines');
  }
  
  if (settings.fixHyphenation) {
    const before = cleaned;
    cleaned = cleaned.replace(/([a-zA-Z])-\s*\n\s*([a-zA-Z])/g, '$1$2');
    if (before !== cleaned) changes.push('Fixed hyphenation breaks');
  }
  
  if (settings.removeMarkdown) {
    const before = cleaned;
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1')
                   .replace(/\*(.*?)\*/g, '$1')
                   .replace(/`(.*?)`/g, '$1')
                   .replace(/^#{1,6}\s+/gm, '')
                   .replace(/^[\s]*[-*+]\s+/gm, '');
    if (before !== cleaned) changes.push('Removed Markdown formatting');
  }
  
  if (settings.normalizeQuotes) {
    const before = cleaned;
    cleaned = cleaned.replace(/[""]/g, '"').replace(/['']/g, "'");
    if (before !== cleaned) changes.push('Normalized quotes');
  }
  
  if (settings.fixAiArtifacts) {
    const before = cleaned;
    cleaned = cleaned.replace(/\[Assistant\]|\[User\]|\[Human\]|\[AI\]/g, '')
                   .replace(/```[\w]*\n?/g, '')
                   .replace(/\*\*Note:\*\*.*?(?=\n|$)/g, '');
    if (before !== cleaned) changes.push('Removed AI artifacts');
  }
  
  // Final cleanup
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  
  const cleanedLength = cleaned.length;
  const cleanedLines = cleaned.split('\n').length;
  
  return {
    cleaned_text: cleaned,
    detected_language: detectedLang,
    changes_made: changes,
    stats: {
      original_length: originalLength,
      cleaned_length: cleanedLength,
      chars_removed: originalLength - cleanedLength,
      original_lines: originalLines,
      cleaned_lines: cleanedLines,
      original_words: text.split(/\s+/).length,
      cleaned_words: cleaned.split(/\s+/).length
    }
  };
}

function detectLanguage(text) {
  // Simple language detection
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  if (/[а-яё]/i.test(text)) return 'ru';
  if (/[ñáéíóúü]/i.test(text)) return 'es';
  if (/[àâäçéèêëïîôùûüÿ]/i.test(text)) return 'fr';
  if (/[äöüß]/i.test(text)) return 'de';
  if (/[あ-ゟ]/i.test(text)) return 'ja';
  if (/[ㄱ-ㅎ가-힣]/i.test(text)) return 'ko';
  return 'en';
} 