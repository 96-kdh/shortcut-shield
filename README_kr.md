# shortcutShield

> 특정 페이지에서 키보드 단축키를 차단하고, 사용자 정의 스크립트를 실행하세요  
> 
> AI 프롬프트 영역에서 의도하지않은 (⌘ + S) 또는 (Ctrl + S) 의 습관적인 실행과 줄바꿈시도시 실수로 엔터키를 누르게 되는 일을 방지하기위해 만들게되었습니다.  

---

## 📦 개요 (Overview)

* **이름**: shortcutShield
* **설명**: Chrome Manifest V3 확장 프로그램으로, 지정한 페이지에서 기본 단축키 동작을 차단하거나(Do-Nothing), 사용자 정의 JavaScript 코드를 실행(Custom Script)하고, 의도하지 않은 Enter 입력 방지 기능(Delay Enter)을 제공합니다.

---

## 🚀 주요 기능 (Features)

1. **Do-Nothing 규칙**

    * `Ctrl+S`, `Alt+F`와 같은 조합키 또는 단일키 단축키의 기본 동작을 무시합니다.

2. **Custom Script 규칙**

    * 단축키가 눌렸을 때 사용자 정의 JS 코드를 디버거 프로토콜을 통해 안전하게 실행합니다.

3. **Delay Enter (Extension 탭)**

    * 연속된 키 입력 중 500ms 이내의 `Enter` 이벤트를 차단해, 의도치 않은 빠른 제출을 방지합니다.
    * 현재 모든 URL에 적용됩니다.

4. **URL 패턴 매칭**

    * `https://example.com/path` 형태의 패턴을 입력하면 해당 경로 및 하위 경로까지 매칭합니다.

5. **설정 동기화**

    * `chrome.storage.sync`를 사용해 규칙을 여러 기기에서 자동으로 동기화합니다.

6. **다크/라이트 테마**

    * 시스템 테마를 따르는 팝업 UI 지원.

---

## 🛠️ 설치 및 빌드 (Installation & Build)

```bash
# 저장소 클론
git clone https://github.com/96-kdh/shortcut-shield.git
cd shortcut-shield

# 의존성 설치 (recommend pnpm)
npm install    # 또는 pnpm install

# 개발 모드 실행
npm run dev    # 팝업 코드 및 콘텐츠 스크립트 라이브러리 빌드 감시
## 실행 후 

# 프로덕션 빌드
npm run build  # dist/ 디렉토리에 배포용 파일 생성
```

---

## 🔧 확장 프로그램 로드 (Load Extension)

1. Chrome 주소창에 `chrome://extensions/` 입력
2. 우측 상단 **개발자 모드** 활성화
3. **압축 해제된 확장 프로그램 로드** 클릭
4. 프로젝트의 `dist/` 선택
5. 팝업이 아니라 web view 로 보고싶다면 `chrome-extension://<app ID>/src/popup.html` 경로 접속시 가능(활성화 된 탭이 없기때문에 일부 기능 이용불가)

---

## 🎯 사용법 (Usage)

### 1. Do-Nothing 규칙 설정

1. **Do Nothing** 탭 선택
2. **+ New Command** 클릭 후 단축키 입력
3. URL 패턴 등록 (`http://` 또는 `https://` 로 시작)
4. **Save** 클릭

<small>등록된 단축키는 해당 페이지에서 기본 동작이 차단됩니다.</small>

### 2. Custom Script 규칙 설정

1. **Custom** 탭 선택
2. **+ New Command** 클릭 후 단축키 입력
3. URL 패턴 등록
4. 코드 에디터에 JS 스니펫 작성
5. (선택) 설명 추가 후 **Save** 클릭

<small>커맨드 우선순위는 **[Custom Script > Do Nothing]** 입니다.</small>

```js
// 예시 1: 페이지 제목 출력
console.log(`Title: ${document.title}`);

// 예시 2: 페이지 최상단으로 스크롤
window.scrollTo({ top: 0, behavior: 'smooth' });
```

### 3. Delay Enter (Extension 탭)

1. **Extension** 탭 선택
2. **Enter** 항목의 스위치 토글

<small>연속된 키 입력 중 500ms 이내 Enter 이벤트를 무시합니다.</small>

---

## 🧩 개발 구조 (Project Structure)

```
src/
├─ manifest.json        # 확장 메타데이터
├─ content-script.ts    # 키 이벤트 가로채기 로직
├─ background.ts        # 디버거 프로토콜을 사용한 스크립트 실행
├─ popup.html           # 팝업 엔트리 HTML
├─ popup.tsx            # React 팝업 진입점
├─ pages/index.tsx      # 탭별 뷰 분기
├─ components/           # UI 컴포넌트 모음 (Header, Tabs, Inputs 등)
├─ hooks/                # DoNothing, Custom 훅 및 컨텍스트
└─ ...
```

---

## 📈 향후 계획 (Future Plans)

> Extension 페이지는 지금은 Enter 기능 하나만 삽입되어 있지만,
> 추후 사용자끼리 유용한 커스텀 로직을 안정성 검증 및 공유하며,
> 다운로드 받아 사용할 수 있게 발전계획(시기는 예정없음)이 있습니다.

---

## 🤝 기여 (Contributing)

1. 레포지토리 포크(Fork)
2. 브랜치 생성(`git checkout -b feat/your-feature`)
3. 커밋 및 푸시
4. Pull Request 생성

---

## 📜 라이선스 (License)

본 프로젝트는 [MIT License](LICENSE)를 따릅니다.
