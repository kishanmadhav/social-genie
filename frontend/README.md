# Social Genie Frontend

Modern Next.js frontend for Social Genie - a product by Agentic Genie.

Social media automation platform with AI-powered content generation.

## Features

- 🎨 AI-powered content generation with DALL-E 3 and GPT-4
- 📱 Multi-platform support (Twitter, Instagram, Facebook)
- 🔐 OAuth authentication (Google, Twitter, Facebook)
- 💜 Modern UI with Tailwind CSS
- ⚡ Built with Next.js 14 and TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on http://localhost:3000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:3001

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Project Structure

```
frontend/
├── app/              # Next.js App Router pages
│   ├── dashboard/    # Main dashboard
│   ├── generator/    # AI content generator
│   ├── analytics/    # Analytics page (coming soon)
│   ├── schedule/     # Scheduling page (coming soon)
│   └── settings/     # Settings page (coming soon)
├── components/       # Reusable React components
│   ├── Sidebar.tsx   # Navigation sidebar
│   └── Toast.tsx     # Toast notifications
├── context/          # React context providers
│   └── AuthContext.tsx # Authentication state
└── lib/             # Utility libraries
    └── api.ts       # Backend API client
```

## Features

### Dashboard
- View stats and metrics
- Quick access to AI generator
- Manage social media connections
- See all connected platforms

### AI Generator
- Generate images with DALL-E 3
- Create captions with GPT-4
- Select platform and tone
- Post directly to social media

### Social Connections
- Connect Twitter account
- Connect Facebook/Instagram account
- View connection status
- Disconnect accounts

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Context
- **HTTP Client**: Fetch API with credentials

## API Integration

The frontend communicates with the Express.js backend at `http://localhost:3000` using:

- `/api/user` - Get current user data
- `/api/generate-content` - Generate AI content
- `/api/post-generated` - Post to social media
- `/auth/google` - Google OAuth login
- `/auth/twitter` - Twitter OAuth connection
- `/auth/facebook` - Facebook OAuth connection
- `/api/unlink-twitter` - Unlink Twitter account
- `/api/unlink-facebook` - Unlink Facebook account

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
