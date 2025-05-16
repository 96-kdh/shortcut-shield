import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export enum SupportedLanguage {
   en = "en",
   ko = "ko",
}

// 번역 리소스 정의
const resources = {
   [SupportedLanguage.en]: {
      translation: {
         lang: "Language",
         en: "English",
         "en-us": "English",
         ko: "Korean",
         "ko-KR": "Korean",
         theme: "Theme",
         system: "System",
      },
   },
   [SupportedLanguage.ko]: {
      translation: {
         lang: "언어",
         en: "영어",
         "en-us": "영어",
         ko: "한국어",
         "ko-KR": "한국어",
         theme: "테마",
         system: "시스템",
      },
   },
};

i18n
   // 브라우저 언어 감지 플러그인 사용 (옵션)
   .use(LanguageDetector)
   // react-i18next 바인딩 적용
   .use(initReactI18next)
   .init({
      resources,
      fallbackLng: "en", // 감지 실패 시 사용할 기본 언어
      debug: true, // 개발 단계에서 콘솔에 디버그 정보를 출력 (배포 시 false)
      interpolation: {
         escapeValue: false,
      },
   });

export default i18n;
