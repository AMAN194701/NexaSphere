import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifyTenantAccess } from '../../../../../lib/auth/rbac';

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * GET /api/developer/webhooks/[id]
 * Fetch details of a single webhook endpoint, including its delivery history.
 */
export async function GET(request: Request, { params }: Params) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const endpoint = await prisma.webhookEndpoint.findUnique({
      where: {
        id,
      },
      include: {
        deliveries: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
      },
    });

    if (!endpoint || endpoint.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    return NextResponse.json({ endpoint });
  } catch (error) {
    console.error('[API Developer Webhook Details GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/developer/webhooks/[id]
 * Update parameters (url, active status, events) of a webhook endpoint.
 */
export async function PUT(request: Request, { params }: Params) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const endpoint = await prisma.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!endpoint || endpoint.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    const body = await request.json();
    const { url, events, active } = body;

    const updatedEndpoint = await prisma.webhookEndpoint.update({
      where: { id },
      data: {
        url: url !== undefined ? url : undefined,
        events: events !== undefined ? events : undefined,
        active: active !== undefined ? active : undefined,
      },
    });

    return NextResponse.json({ endpoint: updatedEndpoint });
  } catch (error) {
    console.error('[API Developer Webhook Details PUT] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/developer/webhooks/[id]
 * Delete a webhook endpoint and all its associated delivery logs.
 */
export async function DELETE(request: Request, { params }: Params) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const endpoint = await prisma.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!endpoint || endpoint.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    await prisma.webhookEndpoint.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Webhook endpoint deleted successfully' });
  } catch (error) {
    console.error('[API Developer Webhook Details DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
