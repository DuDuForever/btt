
export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const authorization = request.headers.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        // In a real app, you'd verify the token with Firebase Admin SDK
        // For simplicity here, we're trusting the client-side token for the session
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        cookies().set('session', idToken, { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    }
    return NextResponse.json({ status: 'success' });
}

export async function DELETE(request: NextRequest) {
    cookies().delete('session');
    return NextResponse.json({ status: 'success' });
}
