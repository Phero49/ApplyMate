# ApplyMate

ApplyMate is an AI-powered resume generator built as a browser extension. It helps users create tailored resumes, fill job application forms, save jobs, and receive reminder notifications, all while keeping their data on their own device.

## What this app is

ApplyMate is a privacy-first AI resume generator designed for job seekers who want a smarter way to build and manage resumes without relying on traditional API-based workflows. Instead of sending data through a remote API key flow, the extension opens an AI tab and communicates with that tab directly.

## What makes it special

- No API keys required
- Works by opening an AI tab and using that tab as the AI interface
- Keeps everything on the user device
- Supports bringing your own prompts
- Supports uploading your own fonts, in addition to the default bundled font
- Includes a default prompt and allows users to replace it with custom prompts tailored to their resume needs

## How it works

1. The extension opens an AI tab in the browser.
2. The app communicates with that AI tab instead of depending on an external API key flow.
3. Resume content, prompts, and related data remain on the user device.
4. The AI can help generate resume content, fill job application forms, and support other workflow tasks directly from the extension experience.

## Features

- AI resume generation
- Job form filling
- Job saving
- Reminder notifications
- Custom prompts
- Custom fonts
- Privacy-focused local-first experience

## Supported AI platforms

ApplyMate currently supports:

- ChatGPT
- DeepSeek
- Qwen

Gemini and Claude are not supported for now, but may be added in the future.

## Setup

### Install the dependencies

```bash
yarn
# or
npm install
```

### Start the browser extension in development mode

```bash
npx quasar dev -m bex -T chrome
# or
npx quasar dev -m bex -T firefox
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Build the browser extension

```bash
npx quasar build -m bex -T chrome
# or
npx quasar build -m bex -T firefox
```

### Browser extension notes

Because this project is a browser extension, the development workflow should be used to preview and test the extension in your browser. Once built, load the extension in your browser as an unpacked extension from the generated output.

## Demo video

Sample demo video placeholder:


<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Sample YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>


Replace this with your own demo video when ready.

## Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
