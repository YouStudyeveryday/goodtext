// Netlify Serverless Function - Supported Languages
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Supported languages
  const supportedLanguages = {
    'en': {
      name: 'English',
      native_name: 'English',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'zh': {
      name: 'Chinese',
      native_name: '中文',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'ja': {
      name: 'Japanese',
      native_name: '日本語',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup']
    },
    'ko': {
      name: 'Korean',
      native_name: '한국어',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup']
    },
    'es': {
      name: 'Spanish',
      native_name: 'Español',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'fr': {
      name: 'French',
      native_name: 'Français',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'de': {
      name: 'German',
      native_name: 'Deutsch',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'ru': {
      name: 'Russian',
      native_name: 'Русский',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup']
    },
    'ar': {
      name: 'Arabic',
      native_name: 'العربية',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup']
    },
    'pt': {
      name: 'Portuguese',
      native_name: 'Português',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'it': {
      name: 'Italian',
      native_name: 'Italiano',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'nl': {
      name: 'Dutch',
      native_name: 'Nederlands',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'sv': {
      name: 'Swedish',
      native_name: 'Svenska',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'no': {
      name: 'Norwegian',
      native_name: 'Norsk',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'da': {
      name: 'Danish',
      native_name: 'Dansk',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'fi': {
      name: 'Finnish',
      native_name: 'Suomi',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'pl': {
      name: 'Polish',
      native_name: 'Polski',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'cs': {
      name: 'Czech',
      native_name: 'Čeština',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'hu': {
      name: 'Hungarian',
      native_name: 'Magyar',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'tr': {
      name: 'Turkish',
      native_name: 'Türkçe',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup', 'markdown_cleanup']
    },
    'hi': {
      name: 'Hindi',
      native_name: 'हिन्दी',
      features: ['space_removal', 'line_breaks', 'ai_cleanup', 'pdf_cleanup']
    }
  };

  const response = {
    supported_languages: supportedLanguages,
    total_count: Object.keys(supportedLanguages).length,
    features: {
      'space_removal': 'Remove extra spaces and tabs',
      'line_breaks': 'Fix line break issues',
      'ai_cleanup': 'Clean AI-generated text formatting',
      'pdf_cleanup': 'Fix PDF copy-paste issues',
      'markdown_cleanup': 'Remove Markdown formatting'
    },
    api_version: '1.0.0',
    last_updated: '2025-01-26'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response)
  };
}; 