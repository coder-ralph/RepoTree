import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProvider } from '@/lib/providers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken || !session?.provider) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const provider = getProvider(session.provider);
    const repos = await provider.listRepos(session.accessToken);

    return NextResponse.json({ repos, provider: session.provider });
  } catch (error) {
    console.error('[API/REPOS]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
