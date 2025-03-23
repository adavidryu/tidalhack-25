import { handleAuth } from '@auth0/nextjs-auth0';

export async function GET(
  request: Request,
  { params }: { params: { auth0: string } }
) {
  const handler = handleAuth();
  return handler(request, { params });
} 