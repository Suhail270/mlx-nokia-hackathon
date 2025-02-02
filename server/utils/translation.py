# server/utils/translation.py
from typing import Any, Dict, List, Union
from deep_translator import GoogleTranslator
from utils.logging_config import logger

class TranslationService:
    def __init__(self):
        self.translator = GoogleTranslator(source='auto', target='ar')
        
    def set_target_language(self, target_lang: str):
        """Update the target language of the translator."""
        if target_lang != self.translator.target:
            self.translator = GoogleTranslator(source='auto', target=target_lang)

    def translate_text(self, text: str, target_lang: str = 'ar') -> str:
        """Translate a single text string to the target language."""
        if not text or target_lang == 'en' or not isinstance(text, str):
            return text
            
        try:
            self.set_target_language(target_lang)
            return self.translator.translate(text)
        except Exception as e:
            logger.error(f"Translation error: {e}")
            try:
                from deep_translator import MicrosoftTranslator
                ms_translator = MicrosoftTranslator(source='auto', target=target_lang)
                return ms_translator.translate(text)
            except Exception as e2:
                logger.error(f"Fallback translation error: {e2}")
                return text

    def translate_dict(self, data: Dict[str, Any], target_lang: str = 'ar') -> Dict[str, Any]:
        """Recursively translate values in a dictionary."""
        if target_lang == 'en' or not isinstance(data, dict):
            return data
            
        translated_data = {}
        for key, value in data.items():
            # Skip translation for specific fields
            if key in ['id', 'alert_id', 'timestamp', 'latitude', 'longitude', 
                      'image', 'video_path', 'midpoint']:
                translated_data[key] = value
                continue
                
            if isinstance(value, str):
                translated_data[key] = self.translate_text(value, target_lang)
            elif isinstance(value, dict):
                translated_data[key] = self.translate_dict(value, target_lang)
            elif isinstance(value, list):
                translated_data[key] = self.translate_list(value, target_lang)
            else:
                translated_data[key] = value
        return translated_data

    def translate_list(self, data: List[Any], target_lang: str = 'ar') -> List[Any]:
        """Recursively translate values in a list."""
        if target_lang == 'en' or not isinstance(data, list):
            return data
            
        translated_data = []
        for item in data:
            if isinstance(item, str):
                translated_data.append(self.translate_text(item, target_lang))
            elif isinstance(item, dict):
                translated_data.append(self.translate_dict(item, target_lang))
            elif isinstance(item, list):
                translated_data.append(self.translate_list(item, target_lang))
            else:
                translated_data.append(item)
        return translated_data

translation_service = TranslationService()