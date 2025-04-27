# ChronoMind

## Development Installation

**Prerequisites:**  
- Latest version of **Google Chrome**
- **ChronoMind extension** downloaded as a folder

**Steps to install:**

1. Open Google Chrome and click on the **three dots menu** → **Extensions** → **Manage Extensions**.
2. Enable **Developer Mode** at the top right.
3. Click **Load unpacked** and select the `chrome_extension` folder from the repository (must contain a `manifest.json`).
4. After loading, you will be prompted to **sign in** with your **Google account** (required for calendar integration).
5. Once signed in:
   - Return to the **Manage Extensions** page.
   - Click **Details** on the "ChronoMind Scheduler" extension.
   - Select **Extension options**.
6. Enter your **OpenAI API key** in the options page and **save** it.

**Done!** 🎉  
ChronoMind is now ready to use.

---

## Usage

ChronoMind adds a new entry to the **right-click context menu**:  
➡️ **"Add Event to Calendar"**

**How to use:**

- **Highlight** any text describing an event (e.g., title, date, time) on a webpage.
- **Right-click** the selection and choose **"Add Event to Calendar"**.
- You will receive a **confirmation notification** upon success.

**If something goes wrong** (e.g., missing information):
- The extension popup will open automatically.
- It will explain what is missing and how to fix it.
- Provide the necessary information and click **"Send Message"**.
- After correcting the input, you can create the event using the **"Create ICS"** button.

---

## Notes

If something doesn't work as expected, check the **Chrome extension console** (`chrome://extensions/`) for potential error messages.

