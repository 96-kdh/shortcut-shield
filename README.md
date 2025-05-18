# shortcutShield

> Block keyboard shortcuts on specific pages or execute custom scripts
>
> Built to prevent unintended habitual (⌘+S) or (Ctrl+S) actions in AI prompt areas, and accidental Enter presses when line-breaking.

---

## 📦 Overview

* **Name**: shortcutShield
* **Description**: A Chrome Manifest V3 extension that lets you block default keyboard shortcut behaviors (Do-Nothing), run user-defined JavaScript (Custom Script), and prevent accidental rapid Enter submissions (Delay Enter).

---

## 🚀 Features

1. **Do-Nothing Rules**

    * Suppress default actions for shortcuts like `Ctrl+S`, `Alt+F`, or single-key shortcuts.

2. **Custom Script Rules**

    * Safely run user-provided JS code via the Chrome Debugger Protocol when a shortcut is triggered.

3. **Delay Enter (Extension tab)**

    * Blocks `Enter` events occurring within 500ms of the previous keystroke to avoid accidental submissions.
    * Consecutive `Enter` events are not blocked.
    * Applies to all URLs.

4. **URL Pattern Matching**

    * Enter patterns like `https://example.com/path` to match that path and its subpaths.

5. **Settings Sync**

    * Uses `chrome.storage.sync` to keep rules synchronized across devices.

6. **Dark/Light Theme**

    * Popup UI adapts to your system theme.

---

## 🛠️ Installation & Build

```bash
# Clone repository
git clone https://github.com/96-kdh/shortcut-shield.git
cd shortcut-shield

# 의존성 설치 (recommend pnpm)
npm install    # or pnpm install

# Development mode
npm run dev    # Watch build for popup and content scripts

# Production build
npm run build  # Generate publishable files in dist/
```

---

## 🔧 Load Extension

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Choose the project's `dist/` folder
5. To view the popup in a standalone web view (without an active tab), open:
   `chrome-extension://<YOUR_EXT_ID>/src/popup.html` (some features may be disabled)

---

## 🎯 Usage

### 1. Set up a Do-Nothing Rule

1. Open the **Do Nothing** tab
2. Click **+ New Command** and press your shortcut
3. Enter a URL pattern (must start with `http://` or `https://`)
4. Click **Save**

<small>Registered shortcuts will be blocked on matching pages.</small>

### 2. Set up a Custom Script Rule

1. Open the **Custom** tab
2. Click **+ New Command** and press your shortcut
3. Enter a URL pattern
4. Write your JS snippet in the code editor
5. (Optional) Add a description, then click **Save**

<small>Priority Command: **[Custom Script > Do Nothing]**</small>

```js
// Example 1: Log the page title
console.log(`Title: ${document.title}`);

// Example 2: Scroll to top smoothly
window.scrollTo({ top: 0, behavior: 'smooth' });
```

### 3. Delay Enter (Extension tab)

1. Open the **Extension** tab
2. Toggle the switch next to **Enter**

<small>Ignores Enter if pressed within 500ms of the previous key.</small>

---

## 🧩 Project Structure

```
src/
├─ manifest.json        # Extension metadata
├─ content-script.ts    # Keyboard event interception logic
├─ background.ts        # Executes custom scripts via Debugger Protocol
├─ popup.html           # Popup entry HTML
├─ popup.tsx            # React popup entry point
├─ pages/index.tsx      # Tab view routing
├─ components/          # UI components (Header, Tabs, Inputs, etc.)
├─ hooks/               # DoNothing, Custom hooks and contexts
└─ ...
```

---

## 📈 Future Plans

> Only the Enter feature is in the Extension tab so far, but we plan to let users share, validate, and download custom logic snippets in the future (no schedule yet).

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feat/your-feature`)
3. Commit and push
4. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
