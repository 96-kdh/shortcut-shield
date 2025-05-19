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

         save: "Save",
         cancel: "Cancel",
         confirm: "Confirm",
         askSure: "Are you absolutely sure?",
         askSureDesc: "This action cannot be undone. This will delete all internal URLs.",
         newCommand: "Add New Command",
         alreadyUsed: "The command is already in use.",
         alreadyUsedInCustom:
            "Commands that are already in use in Custom. \nIf the same Command is active in Custom, it will be ignored.",
         alreadyUsedInDoNothing:
            "Command already in use by Do Nothing. \nIf that command is active, commands in Do Nothing will be ignored.",
         AddURL: "Add URL",
         checkCode: "Check Code ▶",
         mustAgree: "You must agree to this.",
         placeholderScript: "// Your code…",
         fullQualifiedUrl:
            "Please enter a fully qualified URL that begins with http:// or https:// and includes a top-level domain.",
         doesNotAcceptNull: "Does not accept null values.",
         invalidValues: "There are invalid values to submit.",

         tooltipUrl:
            "Please enter a fully qualified URL that begins with <0>http://</0> or <0>https://</0> and includes a top-level domain (for example, <0>https://example.com</0>).",
         tooltipScript:
            "This script’s execution may succeed or fail depending on the browser’s current policies or recent configuration changes.",
         tooltipCommandModifier: "Allowed modifier keys: Alt, Ctrl, Command (macOS) or Windows (Win)",
         tooltipCommandSelection:
            "Key selection: Any single alphanumeric character (A–Z, a–z, 0–9) or common special symbols (e.g. . , ↑ ← Insert, Delete ...)",
         tooltipCommandSyntax: "Syntax: Must be in the form <Modifier>+<Key> (e.g. Ctrl+S, Ctrl+T)",
         tooltipCommandImportant:
            "Important: Some browser- or OS-reserved shortcuts may not be intercepted at the top level and therefore won’t be blocked by this extension. Please choose combinations that aren’t already claimed by your browser.",
         delayEnterDescription:
            "When you press Enter, it checks how much time has passed since the last keystroke.<br/>" +
            "If it's less than {{delayTime}} milliseconds, the Enter event is blocked.<br/>" +
            "After {{delayTime}} milliseconds, or if you type Enter in succession, the behavior will proceed normally.<br/>" +
            "This way, accidental fast presses are ignored, but intentional submissions after a pause still work fine.<br/>" +
            "Applies to all possible URLs.",

         term1Title: "I Wrote This Code Myself",
         term1Description:
            "I confirm that this script is entirely my own work, was not copied from anyone else, and that I fully understand what it does.",
         term2Title: "I’ve Checked for Malicious Content",
         term2Description:
            "I have reviewed the code and verified that it contains no malicious functions or hidden payloads. (If I lack the expertise to audit it myself, I will consult an AI tool or security professional before running it.)",
         term3Title: "I Accept All Risks & Liability",
         term3Description:
            "I understand the potential security and stability risks of running this code, and I accept full responsibility for any consequences.",
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

         save: "저장",
         cancel: "취소",
         confirm: "확인",
         askSure: "정말 확실하신가요?",
         askSureDesc: "이 작업은 실행 취소할 수 없습니다. 이렇게 하면 모든 내부 URL이 삭제됩니다.",
         newCommand: "새 명령",
         alreadyUsed: "이미 사용 중인 명령어.",
         alreadyUsedInCustom:
            "Custom 에서 이미 사용 중인 명령. \nCustom 에서 동일한 명령이 활성화되어 있으면 무시됩니다.",
         alreadyUsedInDoNothing:
            "Do Nothing 에서 이미 사용 중인 명령. \n해당 명령이 활성화되어 있으면 Do Nothing 에 있는 명령은 무시됩니다.",
         AddURL: "URL 추가",
         checkCode: "코드 검사 ▶",
         mustAgree: "반드시 동의해야 합니다.",
         placeholderScript: "// 여기에 코드를 입력하세요…",
         fullQualifiedUrl: "http:// 또는 https://로 시작하고 최상위 도메인을 포함하는 완전한 URL을 입력하세요.",
         doesNotAcceptNull: "null 값을 허용하지 않습니다.",
         invalidValues: "잘못된 값이 있습니다.",

         tooltipUrl:
            "<0>http://</0> 또는 <0>https://</0>로 시작하고 최상위 도메인을 포함하는 완전한 URL을 입력하세요 (예: <0>https://example.com</0>).",
         tooltipScript:
            "이 스크립트의 실행은 브라우저의 현재 정책이나 최근 구성 변경에 따라 성공하거나 실패할 수 있습니다.",

         tooltipCommandModifier: "허용된 수정 키: Alt, Ctrl, Command(macOS) 또는 Windows(Win)",
         tooltipCommandSelection: "키 선택: 영숫자(A–Z, a–z, 0–9) 또는 일반 특수 기호(예: ., ↑, ←, Insert, Delete 등)",
         tooltipCommandSyntax: "문법: <Modifier>+<Key> 형식이어야 합니다 (예: Ctrl+S, Ctrl+T)",
         tooltipCommandImportant:
            "중요: 일부 브라우저 또는 OS 예약 단축키는 최상위 레벨에서 가로채지 못할 수 있으므로 차단되지 않을 수 있습니다. 브라우저에서 이미 사용 중이지 않은 조합을 선택하세요.",
         delayEnterDescription:
            "Enter 키를 누르면 마지막 키 입력 이후 경과 시간을 확인합니다.<br/>" +
            "{{delayTime}} 밀리초 이내라면 Enter 이벤트가 차단됩니다.<br/>" +
            "{{delayTime}} 밀리초 이후 또는 연속해서 Enter 를 입력하는경우 정상적으로 동작이 진행됩니다.<br/>" +
            "이렇게 하면 실수로 빠르게 누르는 것은 무시되지만 일시 정지 후 의도적으로 제출하는 것은 여전히 정상적으로 작동합니다.<br/>" +
            "가능한 모든 URL에 적용됩니다.",

         term1Title: "이 코드는 내가 직접 작성했습니다",
         term1Description:
            "본 스크립트는 전적으로 본인의 작품이며, 다른 사람에게서 복사하지 않았으며, 스크립트의 기능을 완전히 이해하고 있음을 확인합니다.",
         term2Title: "악성 콘텐츠를 확인했습니다",
         term2Description:
            "본인은 코드를 검토하여 악성 기능이나 숨겨진 페이로드가 포함되어 있지 않음을 확인했습니다. (직접 검사할 전문 지식이 부족한 경우 실행하기 전에 AI 도구 또는 보안 전문가와 상의하겠습니다.)",
         term3Title: "본인은 모든 위험과 책임을 수락합니다",
         term3Description:
            "본인은 이 코드를 실행할 때 발생할 수 있는 보안 및 안정성 위험을 이해하고 있으며, 그 결과에 대한 모든 책임을 집니다.",
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
