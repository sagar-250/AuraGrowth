# Prompt-Pirates


## Overview
Prompt Pirates is a submission for the development of **AuraGrowth**, an enterprise-grade software designed specifically for early-stage startups. AuraGrowth provides powerful tools to help startups scale quickly and efficiently by leveraging AI-powered solutions.

## Features
- **Content Generation**: Create compelling ads and blog content with AI-powered tools.
- **SEO Analysis**: Get comprehensive insights into your website's SEO performance and receive actionable recommendations.
- **Competitive Analysis**: Analyze your industry landscape and discover strategies to differentiate your startup.
- **Notion Integration**: Track and summarize Notion databases with AI-generated insights.
- **Customizable UI Components**: Includes reusable components like sliders, tables, and carousels.
- **AI Security Features**: Advanced AI-driven security features to analyze and mitigate risks in text data, including Unicode security scanning, phishing risk analysis, and more.
- **Email Integration**: Seamlessly integrate with Gmail to fetch, analyze, and reply to emails programmatically.
- **Email Thread Summarization**: Summarize email threads for quick understanding and context.
- **Email Replying**: Automate email replies with AI-generated responses.
- **Email Classification**: Classify emails into categories such as leads, customer queries, and internal emails.

## Tech Stack
- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Python, FastAPI
- **AI Integration**: OpenAI GPT models
- **Database**: Notion API

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/prompt-pirates.git
   cd prompt-pirates
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the required API keys and configurations (e.g., OpenAI API key, Notion API key).
4. Start the development server:
   ```bash
   pnpm dev
   ```

## Usage
- Access the application at `http://localhost:3000`.
- Explore features like content generation, SEO analysis, and competitive analysis.

## AI Security Features

The `privacy.py` file includes advanced AI-driven security features to analyze and mitigate risks in text data. Key functionalities include:

- **Unicode Security Scanning**: Detects invisible and confusable Unicode characters that may be used for phishing or spoofing.
- **Visual Confusables Detection**: Identifies visually similar character sequences that could deceive users.
- **Phishing Risk Analysis**: Leverages AI to assess text for phishing indicators, such as urgency, suspicious links, and impersonation tactics.
- **Text Normalization**: Removes directional override characters and normalizes text for secure processing.
- **Highlighting Suspicious Text**: Generates HTML with highlighted suspicious characters for better visualization.
- **Logging and Monitoring**: Logs API requests for security monitoring and auditing purposes.

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- Built with ❤️ by the Prompt Pirates team.
- Special thanks to the open-source community for their amazing tools and libraries.
- This is the submission of the team Prompt Pirates where we developed AuraGrowth [An Enterprise Grade Software for 'Vibe' Enterprises]
