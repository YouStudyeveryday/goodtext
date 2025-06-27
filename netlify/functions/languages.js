exports.handler = async (event, context) => {
  console.log('Languages function called');
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
  
  const supportedLanguages = {
    'en': 'English',
    'zh': '中文 Chinese',
    'de': 'Deutsch German', 
    'fr': 'Français French',
    'es': 'Español Spanish',
    'ru': 'Русский Russian',
    'ja': '日本語 Japanese',
    'ko': '한국어 Korean',
    'th': 'ไทย Thai',
    'ar': 'العربية Arabic',
    'he': 'עברית Hebrew',
    'it': 'Italiano Italian',
    'pt': 'Português Portuguese',
    'nl': 'Nederlands Dutch',
    'sv': 'Svenska Swedish',
    'no': 'Norsk Norwegian',
    'da': 'Dansk Danish',
    'fi': 'Suomi Finnish',
    'pl': 'Polski Polish',
    'tr': 'Türkçe Turkish'
  };
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      supported_languages: supportedLanguages,
      total_count: Object.keys(supportedLanguages).length,
      default_language: 'auto',
      auto_detection: true
    })
  };
}; 