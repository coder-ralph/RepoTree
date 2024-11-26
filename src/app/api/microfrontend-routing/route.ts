import { NextResponse } from 'next/server';

export async function GET() {
  // microfrontend routing configuration
  const config = {
    version: 1,
    routes: [
      // microfrontend routes
      { src: '/microfrontend', dest: 'https://ascii-repotree.vercel.app' },
    ],
  };

  return NextResponse.json(config);
}
