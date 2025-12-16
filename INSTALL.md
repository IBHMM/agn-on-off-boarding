# Installation & Running Instructions

## Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager

## Step-by-Step Installation

### 1. Navigate to the Next.js directory

```bash
cd nextjs/nextjs
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- Axios
- React Icons
- TypeScript

### 3. Run the Development Server

```bash
npm run dev
```

The app will start on **http://localhost:3000**

### 4. Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Next.js will automatically use the next available port (3001, 3002, etc.)

### Module Not Found Errors

If you get module errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Make sure you're in the `nextjs/nextjs` directory when running commands.

## Project Structure

```
nextjs/nextjs/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── job/[id]/    # Dynamic job detail page
│   └── page.tsx     # Home page
├── components/       # React components
├── data/            # JSON data files
└── public/          # Static assets
```

## First Time Setup

1. Make sure you're in the correct directory: `nextjs/nextjs`
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:3000

That's it! The app should be running now.

