/* Migration: Add Idempotency Key to Revenue Entries
   Description: Adds an idempotency_key column with a UNIQUE constraint to the
                revenue_entries table to prevent duplicate revenue records from
                concurrent or retried payment webhook deliveries (issue #3844).
   Version: 1.0.0
*/

export const up = (pgm) => {
  // Add an optional idempotency_key column.
  // Callers (webhook handlers) supply a stable key derived from the external
  // payment provider's transaction / event ID so that retried or racing
  // webhook deliveries for the same payment are deduplicated at the DB level.
  pgm.addColumn('revenue_entries', {
    idempotency_key: {
      type: 'text',
      notNull: false,
      unique: true,
      comment:
        'Externally-supplied key (e.g. payment-provider transaction ID) used to ' +
        'deduplicate concurrent or retried webhook deliveries.',
    },
  });

  pgm.createIndex('revenue_entries', 'idempotency_key', {
    name: 'idx_revenue_entries_idempotency_key',
    unique: true,
    where: 'idempotency_key IS NOT NULL',
  });
};

export const down = (pgm) => {
  pgm.dropIndex('revenue_entries', 'idempotency_key', {
    name: 'idx_revenue_entries_idempotency_key',
    ifExists: true,
  });
  pgm.dropColumn('revenue_entries', 'idempotency_key', { ifExists: true });
};
