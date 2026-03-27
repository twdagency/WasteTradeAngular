import { DEFAULT_LANGUAGE, DEFAULT_PATH } from 'app/constants/common';
import { LanguageService } from '../services/language.service';

export function addLanguagePrefix(path: string, language?: string): string {
  let finalLang: string;

  // Try to get the language service instance
  const languageService = LanguageService.getInstance();

  if (!languageService) {
    return DEFAULT_PATH;
  }

  const lang = languageService.getCurrentLanguage();
  finalLang = language || lang;

  // Remove leading slash if present
  const cleanPath = path?.startsWith('/') ? path.substring(1) : path;

  // For English (default language), return path without prefix
  if (finalLang === DEFAULT_LANGUAGE) {
    return `/${cleanPath || ''}`;
  }

  // For other languages (Spanish), add language prefix
  return `/${finalLang}/${cleanPath || ''}`;
}

export function getCurrentLanguage(): string {
  // Try to get the language service instance
  const languageService = LanguageService.getInstance();

  if (!languageService) {
    return DEFAULT_PATH;
  }

  return languageService.getCurrentLanguage();
}
