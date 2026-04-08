# Autonomous Content Factory

## The Problem
Creating multi-channel marketing content, such as blog posts, social media threads, and email teasers, from raw product data is a tedious and time-consuming manual process. It typically involves significant coordination and back-and-forth between researchers, copywriters, and editors to produce high-quality, accurate assets.

## The Solution
The Autonomous Content Factory provides a streamlined, automated pipeline for content generation. Users can upload raw product documents, and the system relies on specialized AI agents (Researcher, Copywriter, and Editor) to extract relevant product information autonomously. These agents collaborate to generate, refine, and format tailored marketing copy. The application features a dynamic UI to track the working state of the AI agents and allows users to easily download the final approved marketing assets.

## Tech Stack
*   **Programming Languages:** JavaScript, HTML, CSS
*   **Frameworks & Libraries:** React (v19), Vite, Framer Motion (for animations), Zustand (for state management), and React Router DOM
*   **APIs & Third-Party Tools:** Google Gemini API (for AI agent intelligence), JSZip (for exporting files)

## Setup Instructions

Follow these steps to run the application locally:

1.  **Install dependencies:**
    Open your terminal in the project root folder and run:
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env` file in the root directory by copying the `.env.example` file.
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your Gemini API Key:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

3.  **Run the project locally:**
    Start the Vite development server by running:
    ```bash
    npm run dev
    ```
    The console will display the local URL (usually `http://localhost:5173/`). Open this URL in your web browser to view the application.

4. **Live Link**
[   https://autocontentfactory.netlify.app/
](url)   
