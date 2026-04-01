import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname) => {
        const session = await auth();
        
        if (!session?.user) {
          throw new Error('Signal Intercepted: Unauthorized access to protocol storage.');
        }

        // Only allow typical image formats
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {

        try {
          if (tokenPayload) {
             const { userId } = JSON.parse(tokenPayload);
             // Using a standard console.warn for allowed server-side logging in this environment
             console.warn(`[PROTOCOL_STORAGE] Blob synchronized for Node: ${userId}`, blob.url);
          }
        } catch {
           // We throw to notify Vercel Blob that the callback failed
           throw new Error('Failed to parse protocol token payload.');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
