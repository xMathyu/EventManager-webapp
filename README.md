# Event Management Application

A modern web application for managing events, built with Next.js 14 and TypeScript. This application allows users to create, view, edit, and delete events with a beautiful and responsive user interface.

## Features

- 📅 Create, read, update, and delete events
- 🎨 Modern UI with Shadcn components
- 🔔 Real-time notifications using Sonner
- 📱 Fully responsive design
- 🔄 Server-side pagination
- 🌤️ Weather information integration for events
- ⚡ Fast and optimized performance

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Notifications:** Sonner
- **State Management:** React Hooks
- **API Integration:** RESTful services

## Prerequisites

- Node.js 20.x or later
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd eventmanager-webapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_API_URL=your_api_url_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── events/            # Event-related pages
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── ui/               # UI components
├── services/             # API services
└── types/               # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
