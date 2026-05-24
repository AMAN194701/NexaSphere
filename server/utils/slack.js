import logger from './logger.js';

async function sendSlackAlert(alertData) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn('Slack webhook URL not configured. Skipping alert.');
    return;
  }

  try {
    const payload = formatSlackMessage(alertData);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error('Failed to send Slack alert', {
        status: response.status,
        statusText: response.statusText,
      });
    } else {
      logger.info('Slack alert sent successfully', { alertType: alertData.title });
    }
  } catch (error) {
    logger.error('Error sending Slack alert', { error: error.message });
  }
}

function formatSlackMessage(data) {
  const color = data.severity === 'critical' ? 'danger' : 'warning';

  return {
    attachments: [
      {
        color: color,
        title: data.title || 'Alert',
        fields: [
          {
            title: 'Message',
            value: data.message || 'No message provided',
            short: false,
          },
          ...(data.url
            ? [
                {
                  title: 'URL',
                  value: data.url,
                  short: false,
                },
              ]
            : []),
          ...(data.method
            ? [
                {
                  title: 'Method',
                  value: data.method,
                  short: true,
                },
              ]
            : []),
          ...(data.userId
            ? [
                {
                  title: 'User ID',
                  value: data.userId,
                  short: true,
                },
              ]
            : []),
          ...(data.timestamp
            ? [
                {
                  title: 'Timestamp',
                  value: new Date(data.timestamp).toISOString(),
                  short: true,
                },
              ]
            : []),
          ...(data.stack
            ? [
                {
                  title: 'Stack Trace',
                  value: '```' + data.stack + '```',
                  short: false,
                },
              ]
            : []),
        ],
        footer: 'NexaSphere Error Monitoring',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
}

async function sendPerformanceAlert(metrics) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  try {
    const payload = {
      attachments: [
        {
          color: metrics.errorRate > 5 ? 'danger' : 'warning',
          title: 'Performance Alert',
          fields: [
            {
              title: 'Error Rate',
              value: `${metrics.errorRate.toFixed(2)}%`,
              short: true,
            },
            {
              title: 'Total Requests',
              value: metrics.totalRequests.toString(),
              short: true,
            },
            {
              title: 'Total Errors',
              value: metrics.totalErrors.toString(),
              short: true,
            },
            {
              title: 'Threshold',
              value: '5%',
              short: true,
            },
          ],
          footer: 'NexaSphere Performance Monitoring',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error('Failed to send performance alert');
    }
  } catch (error) {
    logger.error('Error sending performance alert', { error: error.message });
  }
}

async function sendErrorRateAlert(errorRate, threshold) {
  sendSlackAlert({
    title: 'Error Rate Alert',
    message: `Error rate (${errorRate.toFixed(2)}%) has exceeded threshold (${threshold}%)`,
    severity: errorRate > threshold * 2 ? 'critical' : 'warning',
  });
}

export {
  sendSlackAlert,
  formatSlackMessage,
  sendPerformanceAlert,
  sendErrorRateAlert,
};
