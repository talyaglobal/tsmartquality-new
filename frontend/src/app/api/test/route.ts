import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simple API route to test frontend-backend integration
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would call the backend API
    // const apiUrl = process.env.API_URL || 'http://localhost:3000/api';
    // const response = await fetch(`${apiUrl}/health`);
    // const data = await response.json();

    // For now, we'll just return a mock response
    return NextResponse.json({
      status: 'ok',
      message: 'Frontend API is working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 500 }
    );
  }
}