import { formsService } from '../services/formsService.js';

function wrapAsync(fn) {
  return (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
    if (e && e.message === 'Invalid form submission' && e.details) {
      return res.status(400).json({ error: e.message, issues: e.details });
    }
    return res.status(500).json({ error: e?.message || 'Internal server error' });
  });
}

export function makeHandleForm(formType) {
  return wrapAsync(async (req, res) => {
    const result = await formsService.handleForm(formType, req.body || {});
    return res.json(result);
  });
}

// Allowlist of form types accepted by the parameterised route.
// These must match the keys recognised by formsService.handleForm and the
// tabMap in formsService.appendFormToSheet. Any other value is rejected
// with 400 before reaching the service layer or being written to Supabase
// or Google Sheets.
const ALLOWED_FORM_TYPES = new Set(['membership', 'recruitment', 'core_team']);

export const handleFormByParam = wrapAsync(async (req, res) => {
  const formType = req.params?.formType;
  if (!ALLOWED_FORM_TYPES.has(formType)) {
    return res.status(400).json({ error: `Unknown form type: '${formType}'. Allowed values: ${[...ALLOWED_FORM_TYPES].join(', ')}.` });
  }
  const result = await formsService.handleForm(formType, req.body || {});
  return res.json(result);
});
