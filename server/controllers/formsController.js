import { formsService } from '../services/formsService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';

export function makeHandleForm(formType) {
  return wrapAsync(async (req, res) => {
    const result = await formsService.handleForm(formType, req.body || {});
    return res.json(result);
  });
}

export const handleFormByParam = wrapAsync(async (req, res) => {
  const formType = req.params?.formType;
  const result = await formsService.handleForm(formType, req.body || {});
  return res.json(result);
});
