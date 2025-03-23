# Programmy

An AI-powered programming practice platform for Intro to Programming students, tailored to mimic topics, problems and formats seen in a student's specific class.

## Overview

Programmy helps students master programming concepts through personalized practice problems, instant feedback, and AI-powered assistance. Uses RAG techniques to tailor problems based on course content stored in the cloud. Built with Next.js and AWS Bedrock, it provides a seamless learning experience for both code writing and code tracing problems. 

## Features

- 🤖 AI-generated practice problems
- 📝 Code writing and code tracing problem
- 🎯 Difficulty-based problem generation
- 💡 Instant feedback and explanations
- 🤝 AI assistant poewred with context for debugging help
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Authentication**: Auth0
- **AI/ML**: AWS Bedrock, AWS Knowledge Base, AWS S3
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/programmy.git
   cd programmy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Auth0 and AWS credentials in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Auth0 Configuration
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='your-auth0-domain'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'

# AWS Bedrock credentials
AWS_REGION='your-aws-region'
AWS_ACCESS_KEY_ID='your-aws-access-key'
AWS_SECRET_ACCESS_KEY='your-aws-secret-key'
AWS_KNOWLEDGE_BASE_ID='your-knowledge-base-id'
```

## Project Structure

```
programmy/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # Reusable components
│   ├── context/            # React context providers
│   ├── types/              # TypeScript type definitions
│   └── config/             # Configuration files
├── public/                 # Static assets
└── package.json           # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

