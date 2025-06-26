// Netlify Serverless Function - Text Cleaning API
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    const { text, options = {} } = requestBody;

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    // Text cleaning logic
    let cleanedText = text;
    let changesMade = [];

    // Remove extra spaces
    if (options.remove_extra_spaces !== false) {
      const originalSpaces = cleanedText;
      cleanedText = cleanedText.replace(/[ \t]+/g, ' ');
      if (originalSpaces !== cleanedText) {
        changesMade.push('Removed extra spaces');
      }
    }

    // Fix line breaks
    if (options.fix_line_breaks !== false) {
      const originalBreaks = cleanedText;
      cleanedText = cleanedText.replace(/\n\s*\n\s*\n/g, '\n\n');
      if (originalBreaks !== cleanedText) {
        changesMade.push('Fixed line breaks');
      }
    }

    // Remove empty lines
    if (options.remove_empty_lines) {
      const originalEmpty = cleanedText;
      cleanedText = cleanedText.replace(/^\s*\n/gm, '');
      if (originalEmpty !== cleanedText) {
        changesMade.push('Removed empty lines');
      }
    }

    // AI text cleanup
    if (options.ai_cleanup || options.clean_ai_formatting) {
      const originalAI = cleanedText;
      // Remove AI formatting artifacts
      cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
      cleanedText = cleanedText.replace(/\*(.*?)\*/g, '$1'); // Remove italic markdown
      cleanedText = cleanedText.replace(/```[^`]*```/g, ''); // Remove code blocks
      cleanedText = cleanedText.replace(/`([^`]+)`/g, '$1'); // Remove inline code
      if (originalAI !== cleanedText) {
        changesMade.push('Cleaned AI formatting');
      }
    }

    // PDF cleanup
    if (options.pdf_cleanup || options.fix_pdf_breaks) {
      const originalPDF = cleanedText;
      // Fix common PDF issues
      cleanedText = cleanedText.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2'); // Fix hyphenated words
      cleanedText = cleanedText.replace(/([.!?])\s*\n\s*([A-Z])/g, '$1 $2'); // Fix sentence breaks
      if (originalPDF !== cleanedText) {
        changesMade.push('Fixed PDF formatting');
      }
    }

    // Markdown cleanup
    if (options.markdown_cleanup || options.remove_markdown) {
      const originalMD = cleanedText;
      cleanedText = cleanedText.replace(/#{1,6}\s*/g, ''); // Remove headers
      cleanedText = cleanedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
      cleanedText = cleanedText.replace(/!\[[^\]]*\]\([^)]+\)/g, ''); // Remove images
      cleanedText = cleanedText.replace(/>\s*/g, ''); // Remove blockquotes
      cleanedText = cleanedText.replace(/[-*+]\s+/g, ''); // Remove list markers
      if (originalMD !== cleanedText) {
        changesMade.push('Removed Markdown formatting');
      }
    }

    // Final cleanup
    cleanedText = cleanedText.trim();

    // Language detection (simple)
    const detectLanguage = (text) => {
      const chineseRegex = /[\u4e00-\u9fff]/;
      const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
      const koreanRegex = /[\uac00-\ud7af]/;
      const arabicRegex = /[\u0600-\u06ff]/;
      const russianRegex = /[\u0400-\u04ff]/;
      
      if (chineseRegex.test(text)) return 'zh';
      if (japaneseRegex.test(text)) return 'ja';
      if (koreanRegex.test(text)) return 'ko';
      if (arabicRegex.test(text)) return 'ar';
      if (russianRegex.test(text)) return 'ru';
      return 'en';
    };

    const response = {
      original_text: text,
      cleaned_text: cleanedText,
      changes_made: changesMade,
      character_count: {
        original: text.length,
        cleaned: cleanedText.length,
        saved: text.length - cleanedText.length
      },
      detected_language: detectLanguage(text),
      processing_time: Date.now(),
      success: true
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error processing text:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        success: false
      })
    };
  }
}; 