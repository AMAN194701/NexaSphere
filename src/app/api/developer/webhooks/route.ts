import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyTenantAccess } from '../../../../lib/auth/rbac';
import { generateSigningSecret } from '../../../../lib/webhooks/crypto';

/**
 * GET /api/developer/webhooks
 * List all webhook endpoints for the current workspace.
 */
export async function GET(request: Request) {
  try {
    const workspaceId = request.headers.get('x-workspace-id');
    const userId = request.headers.get('x-user-id');

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: 'Missing tenant workspace or user identity' },
        { status: 400 }
      );
    }

    const isMember = await verifyTenantAccess(userId, workspaceId);
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Hide secrets in list view for extra safety
    const sanitizedEndpoints = endpoints.map((ep) => {
      const { secret, ...rest } = ep;
      return rest;
    });

    return NextResponse.json({ endpoints: sanitizedEndpoints });
  } catch (error) {
    console.error('[API Developer Webhooks GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/developer/webhooks
 * Register a new webhook endpoint.
 */
export async function POST(request: Request) {
  try {
    const workspaceId = request.headers.get('x-workspace-id');
    const userId = request.headers.get('x-user-id');

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: 'Missing tenant workspace or user identity' },
        { status: 400 }
      );
    }

    const isMember = await verifyTenantAccess(userId, workspaceId);
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { url, events, active } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'At least one event subscription is required' },
        { status: 400 }
      );
    }

    // Generate cryptographic signing secret
    const secret = generateSigningSecret();

    const newEndpoint = await prisma.webhookEndpoint.create({
      data: {
        workspaceId,
        url,
        secret,
        events,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ endpoint: newEndpoint }, { status: 201 });
  } catch (error) {
    console.error('[API Developer Webhooks POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
