export const getNodesStatus = () => {
  return [
    { id: 'node-us-east', region: 'US East', status: 'ONLINE', delayMs: 12, pendingChanges: 0 },
    { id: 'node-us-west', region: 'US West', status: 'ONLINE', delayMs: 45, pendingChanges: 2 },
    { id: 'node-eu-central', region: 'EU Central', status: 'DEGRADED', delayMs: 1500, pendingChanges: 120 },
    { id: 'node-ap-south', region: 'AP South', status: 'ONLINE', delayMs: 85, pendingChanges: 5 },
  ];
};

export const getMetrics = () => {
  return {
    averageDelayMs: 413,
    totalPendingChanges: 127,
    conflictingRecords: 3,
    lastSuccessfulSync: new Date(Date.now() - 5000).toISOString(),
  };
};

export const getConflicts = () => {
  return [
    { id: 'c1', table: 'users', recordId: 'usr_123', conflictType: 'UPDATE_COLLISION', resolved: false },
    { id: 'c2', table: 'events', recordId: 'evt_456', conflictType: 'DELETE_UPDATE_COLLISION', resolved: false },
    { id: 'c3', table: 'payments', recordId: 'pay_789', conflictType: 'DUPLICATE_KEY', resolved: false },
  ];
};

export const triggerForceSync = () => {
  // Simulate an asynchronous sync process
  return { success: true, message: 'Force sync initiated across all nodes.' };
};
