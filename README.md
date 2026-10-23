# 🎵 Sound Spectrum

A real-time audio visualizer that turns your microphone input into stunning visual art. Built with React, Vite, and the Web Audio API.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎤 **Real-time mic input** — Web Audio API with permission prompt
- 📊 **4 visualization modes** — Frequency bars, waveform, circular spectrum, particle burst
- 🎨 **5 color themes** — Neon, Sunset, Ocean, Monochrome, Rainbow
- 🔊 **Sensitivity & gain controls** — Fine-tune the visual response
- 🖥️ **Fullscreen mode** — Immersive experience
- 📸 **Screenshot capture** — Save visualizations as PNG
- 📱 **Responsive** — Works on desktop and mobile
- 🌀 **Idle animation** — Ambient visuals when no audio is playing
- ⌨️ **Keyboard shortcuts** — Space, arrows, F, S for quick control
- 🫥 **Auto-hiding UI** — Controls fade away for an immersive experience

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/Sanjays2402/sound-spectrum.git
cd sound-spectrum

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and click the mic button to begin.

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle microphone |
| `←` `→` | Switch visualization mode |
| `↑` `↓` | Adjust sensitivity |
| `F` | Toggle fullscreen |
| `S` | Take screenshot |

## 🎨 Themes

| Theme | Vibe |
|-------|------|
| **Neon** | Cyberpunk magentas & cyans |
| **Sunset** | Warm oranges & pinks |
| **Ocean** | Cool blues & teals |
| **Mono** | Clean black & white |
| **Rainbow** | Full spectrum colors |

## 🛠️ Tech Stack

- **React 19** — UI framework
- **Vite 6** — Build tool
- **Tailwind CSS v4** — Styling
- **Web Audio API** — Audio analysis
- **Canvas API** — 60fps rendering

## 📂 Project Structure

```
src/
├── components/
│   ├── Visualizer.jsx    # Canvas rendering loop
│   └── Controls.jsx      # UI controls overlay
├── hooks/
│   └── useAudio.js       # Web Audio API hook
├── visualizers/
│   ├── bars.js           # Frequency bar visualization
│   ├── waveform.js       # Waveform visualization
│   ├── circular.js       # Circular spectrum visualization
│   ├── particles.js      # Particle burst visualization
│   └── idle.js           # Idle animation
├── utils/
│   └── themes.js         # Color theme definitions
├── App.jsx               # Main app component
├── main.jsx              # Entry point
└── index.css             # Global styles
```

## 📄 License

MIT

## Terms & Disclaimer

By using this project you agree to the following.

- **No warranty.** This software is provided "as is", without warranty of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
- **No liability.** To the maximum extent permitted by law, the author and contributors are not liable for any claim, loss, or damage (direct, indirect, incidental, or consequential, including lost data or profits) arising from its use.
- **Your responsibility.** You use it at your own risk and are responsible for complying with the laws that apply to you.
- **Third parties.** Names, logos, APIs, and services of others belong to their owners and are used for identification only; no affiliation or endorsement is implied.
- **Your statutory rights.** Nothing here limits rights that cannot be waived by agreement, including under consumer-protection laws in the USA, Canada (including Quebec), and India (Consumer Protection Act, 2019).
- **License.** Use, copying, and distribution are governed by the [LICENSE](LICENSE) file; if anything here conflicts with it, the license controls.
