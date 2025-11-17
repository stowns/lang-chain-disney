# LangChain Disney Agent
Example of using LangChain to develop AI Agent tools which fetch Disney info.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- An Anthropic API key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file and add your API key:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

## Running the Application

### Development mode (with tsx):
```bash
npm run dev
```

### Build and run:
```bash
npm run build
npm start
```

### Watch mode (auto-rebuild on changes):
```bash
npm run watch
```
