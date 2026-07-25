import { prisma } from '../prisma';
import { calculateSignature } from './crypto';

export class WebhookDispatcher {
  /**
   * Dispatches a webhook event to all registered, active endpoints listening to the event.
   *
   * @param workspaceId - The tenant workspace context.
   * @param event - The name of the event triggered (e.g., 'post.created').
   * @param data - The payload details.
   */
  static async dispatch(workspaceId: string, event: string, data: any): Promise<void> {
    try {
      // Find all active endpoints in the workspace
      const endpoints = await prisma.webhookEndpoint.findMany({
        where: {
          workspaceId,
          active: true,
        },
      });

      // Filter endpoints that are subscribed to this event (or '*' for wildcard subscription)
      const targetEndpoints = endpoints.filter(
        (ep) => ep.events.includes(event) || ep.events.includes('*')
      );

      if (targetEndpoints.length === 0) {
        return;
      }

      // Prepare payload wrapper
      const payloadObj = {
        event,
        workspaceId,
        timestamp: new Date().toISOString(),
        data,
      };
      const payloadString = JSON.stringify(payloadObj);

      // Trigger dispatch concurrently
      await Promise.all(
        targetEndpoints.map(async (endpoint) => {
          let responseCode: number | null = null;
          let success = false;
          const attempts = 1;

          // Compute cryptographic signature
          const signature = calculateSignature(payloadString, endpoint.secret);

          try {
            const res = await fetch(endpoint.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-NexaSphere-Signature': signature,
                'X-NexaSphere-Event': event,
                'User-Agent': 'NexaSphere-WebhookDispatcher/1.0',
              },
              body: payloadString,
              // Setup a 10s timeout
              signal: AbortSignal.timeout(10000),
            });

            responseCode = res.status;
            success = res.ok;
          } catch (err: any) {
            console.error(`[Webhook Dispatch Error] Failed contacting ${endpoint.url}:`, err);
            if (err.name === 'TimeoutError') {
              responseCode = 408;
            } else {
              responseCode = 500;
            }
            success = false;
          }

          // Record delivery in the database
          try {
            await prisma.webhookDelivery.create({
              data: {
                endpointId: endpoint.id,
                payload: payloadObj as any,
                responseCode,
                success,
                attempts,
              },
            });
          } catch (dbErr) {
            console.error('[Webhook DB Log Error] Failed to write WebhookDelivery log:', dbErr);
          }
        })
      );
    } catch (err) {
      console.error('[WebhookDispatcher global error]:', err);
    }
  }
}
export default WebhookDispatcher;
