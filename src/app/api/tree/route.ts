import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProvider, detectProviderFromUrl } from '@/lib/providers';
import type { ProviderType } from '@/lib/providers';

export async function POST(req: Request) {
  try {
    const { url, providerType } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    // Determine which provider to use
    const detectedProvider = detectProviderFromUrl(url);
    const resolvedProvider = (providerType ?? detectedProvider ?? 'github') as ProviderType;

    // Get session token if available (for private repos)
    const token = session?.provider === resolvedProvider ? (session.accessToken ?? '') : '';

    const provider = getProvider(resolvedProvider);

    if (!provider.validateUrl(url)) {
      return NextResponse.json(
        { error: `Invalid ${resolvedProvider === 'github' ? 'GitHub' : 'GitLab'} repository URL` },
        { status: 400 }
      );
    }

    const { owner, repo } = provider.parseUrl(url);
    const tree = await provider.fetchTree(owner, repo, token);

    return NextResponse.json({ 
      tree, 
      provider: resolvedProvider
    });
  } catch (error) {
    console.error('[API/TREE]', error);

    const err = error as { status?: number; message?: string };
    const status = err.status ?? 500;
    const message = err.message ?? 'Failed to fetch repository structure';

    return NextResponse.json({ error: message }, { status });
  }
}
