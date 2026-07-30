import { forumService } from '../services/forumService.js';
import {
  createThreadSchema,
  updateThreadSchema,
  createReplySchema,
  updateReplySchema,
  forumPaginationSchema,
  voteSchema,
} from '../schemas/forumSchema.js';
import { sendSuccess, sendError, sendNoContent } from '../utils/responseHelper.js';

function wrapAsync(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function wrapAsync(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export const listCategories = wrapAsync(async (req, res) => {
  const categories = await forumService.getCategories();
  return sendSuccess(res, { categories });
  return res.json({ categories });
});

export const listThreads = wrapAsync(async (req, res) => {
  const { page, limit, category, q, sort } = forumPaginationSchema.parse(req.query);
  const result = await forumService.listThreads({ page, limit, category, q, sort });
  return sendSuccess(res, {
  return res.json({
    threads: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  });
});

export const getThread = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid thread ID', 400, 'VALIDATION_ERROR');
  const thread = await forumService.getThread(id);
  if (!thread) return sendError(req, res, 'Thread not found', 404, 'NOT_FOUND');
  const repliesResult = await forumService.listReplies(id, req.query);
  return sendSuccess(res, { thread, replies: repliesResult.rows, pagination: repliesResult });
});

export const createThread = wrapAsync(async (req, res) => {
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }
  const input = createThreadSchema.parse({
    ...req.body,
    author_name: req.studentUser.name,
    author_email: req.studentUser.email,
  });
  const thread = await forumService.createThread(input);
  if (!thread) return sendError(req, res, 'Forum is in offline mode', 503, 'DEPENDENCY_ERROR');
  return sendSuccess(res, { thread }, 201);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid thread ID' });
  const thread = await forumService.getThread(id);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  const repliesResult = await forumService.listReplies(id, req.query);
  return res.json({ thread, replies: repliesResult.rows, pagination: repliesResult });
});

export const createThread = wrapAsync(async (req, res) => {
  const input = createThreadSchema.parse(req.body);
  const thread = await forumService.createThread(input);
  if (!thread) return res.status(503).json({ error: 'Forum is in offline mode' });
  return res.status(201).json({ thread });
});

export const updateThread = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid thread ID', 400, 'VALIDATION_ERROR');
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  const thread = await forumService.getThread(id);
  if (!thread) return sendError(req, res, 'Thread not found', 404, 'NOT_FOUND');

  const isAdmin = req.studentUser.role === 'admin';
  if (thread.authorEmail !== req.studentUser.email && !isAdmin) {
    return sendError(req, res, 'Forbidden: You do not own this thread', 403, 'FORBIDDEN');
  }

  const input = updateThreadSchema.parse(req.body);
  const updated = await forumService.updateThread(id, input);
  return sendSuccess(res, { thread: updated });
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid thread ID' });
  const input = updateThreadSchema.parse(req.body);
  const thread = await forumService.updateThread(id, input);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  return res.json({ thread });
});

export const deleteThread = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid thread ID', 400, 'VALIDATION_ERROR');
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  const thread = await forumService.getThread(id);
  if (!thread) return sendError(req, res, 'Thread not found', 404, 'NOT_FOUND');

  const isAdmin = req.studentUser.role === 'admin';
  if (thread.authorEmail !== req.studentUser.email && !isAdmin) {
    return sendError(req, res, 'Forbidden: You do not own this thread', 403, 'FORBIDDEN');
  }

  const deleted = await forumService.deleteThread(id);
  if (!deleted) return sendError(req, res, 'Thread not found', 404, 'NOT_FOUND');
  return sendNoContent(res);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid thread ID' });
  const deleted = await forumService.deleteThread(id);
  if (!deleted) return res.status(404).json({ error: 'Thread not found' });
  return res.status(204).send();
});

export const listReplies = wrapAsync(async (req, res) => {
  const threadId = parseInt(req.params.id, 10);
  if (isNaN(threadId)) return sendError(req, res, 'Invalid thread ID', 400, 'VALIDATION_ERROR');
  const result = await forumService.listReplies(threadId, req.query);
  return sendSuccess(res, { replies: result.rows, pagination: result });
  if (isNaN(threadId)) return res.status(400).json({ error: 'Invalid thread ID' });
  const result = await forumService.listReplies(threadId, req.query);
  return res.json({ replies: result.rows, pagination: result });
});

export const createReply = wrapAsync(async (req, res) => {
  const threadId = parseInt(req.params.id, 10);
  if (isNaN(threadId)) return sendError(req, res, 'Invalid thread ID', 400, 'VALIDATION_ERROR');
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }
  const input = createReplySchema.parse({
    ...req.body,
    author_name: req.studentUser.name,
    author_email: req.studentUser.email,
  });
  const reply = await forumService.createReply(threadId, input);
  if (!reply) return sendError(req, res, 'Forum is in offline mode', 503, 'DEPENDENCY_ERROR');
  return sendSuccess(res, { reply }, 201);
  if (isNaN(threadId)) return res.status(400).json({ error: 'Invalid thread ID' });
  const input = createReplySchema.parse(req.body);
  const reply = await forumService.createReply(threadId, input);
  if (!reply) return res.status(503).json({ error: 'Forum is in offline mode' });
  return res.status(201).json({ reply });
});

export const updateReply = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.replyId, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid reply ID', 400, 'VALIDATION_ERROR');
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  const reply = await forumService.getReply(id);
  if (!reply) return sendError(req, res, 'Reply not found', 404, 'NOT_FOUND');

  const isAdmin = req.studentUser.role === 'admin';
  if (reply.authorEmail !== req.studentUser.email && !isAdmin) {
    return sendError(req, res, 'Forbidden: You do not own this reply', 403, 'FORBIDDEN');
  }

  const { content } = updateReplySchema.parse(req.body);
  const updated = await forumService.updateReply(id, content);
  return sendSuccess(res, { reply: updated });
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid reply ID' });
  const { content } = updateReplySchema.parse(req.body);
  const reply = await forumService.updateReply(id, content);
  if (!reply) return res.status(404).json({ error: 'Reply not found' });
  return res.json({ reply });
});

export const deleteReply = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.replyId, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid reply ID', 400, 'VALIDATION_ERROR');
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  const reply = await forumService.getReply(id);
  if (!reply) return sendError(req, res, 'Reply not found', 404, 'NOT_FOUND');

  const isAdmin = req.studentUser.role === 'admin';
  if (reply.authorEmail !== req.studentUser.email && !isAdmin) {
    return sendError(req, res, 'Forbidden: You do not own this reply', 403, 'FORBIDDEN');
  }

  const deleted = await forumService.deleteReply(id);
  if (!deleted) return sendError(req, res, 'Reply not found', 404, 'NOT_FOUND');
  return sendNoContent(res);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid reply ID' });
  const deleted = await forumService.deleteReply(id);
  if (!deleted) return res.status(404).json({ error: 'Reply not found' });
  return res.status(204).send();
});

export const voteThread = wrapAsync(async (req, res) => {
  const threadId = parseInt(req.params.id, 10);
  if (isNaN(threadId)) return sendError(req, res, 'Invalid thread ID', 400, 'VALIDATION_ERROR');
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }
  const voter_email = req.studentUser.email;
  const { vote_type } = req.body;
  const result = await forumService.voteThread(threadId, voter_email, vote_type || 'upvote');
  return sendSuccess(res, { result });
  if (isNaN(threadId)) return res.status(400).json({ error: 'Invalid thread ID' });
  const { voter_email, vote_type } = req.body;
  if (!voter_email) return res.status(400).json({ error: 'voter_email is required' });
  const result = await forumService.voteThread(threadId, voter_email, vote_type || 'upvote');
  return res.json({ result });
});

export const voteReply = wrapAsync(async (req, res) => {
  const replyId = parseInt(req.params.replyId, 10);
  if (isNaN(replyId)) return sendError(req, res, 'Invalid reply ID', 400, 'VALIDATION_ERROR');
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }
  const voter_email = req.studentUser.email;
  const { vote_type } = req.body;
  const result = await forumService.voteReply(replyId, voter_email, vote_type || 'upvote');
  return sendSuccess(res, { result });
  if (isNaN(replyId)) return res.status(400).json({ error: 'Invalid reply ID' });
  const { voter_email, vote_type } = req.body;
  if (!voter_email) return res.status(400).json({ error: 'voter_email is required' });
  const result = await forumService.voteReply(replyId, voter_email, vote_type || 'upvote');
  return res.json({ result });
});

export const acceptReply = wrapAsync(async (req, res) => {
  const threadId = parseInt(req.params.id, 10);
  const replyId = parseInt(req.params.replyId, 10);
  if (isNaN(threadId) || isNaN(replyId)) return sendError(req, res, 'Invalid IDs', 400, 'VALIDATION_ERROR');
  if (!req.studentUser) {
    return sendError(req, res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  const thread = await forumService.getThread(threadId);
  if (!thread) return sendError(req, res, 'Thread not found', 404, 'NOT_FOUND');

  const isAdmin = req.studentUser.role === 'admin';
  if (thread.authorEmail !== req.studentUser.email && !isAdmin) {
    return sendError(req, res, 'Forbidden: You do not own this thread', 403, 'FORBIDDEN');
  }

  await forumService.acceptReply(threadId, replyId);
  return sendSuccess(res, { success: true });
  if (isNaN(threadId) || isNaN(replyId)) return res.status(400).json({ error: 'Invalid IDs' });
  await forumService.acceptReply(threadId, replyId);
  return res.json({ success: true });
});

export const moderateThread = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid thread ID', 400, 'VALIDATION_ERROR');
  const { status } = req.body;
  if (!['approved', 'rejected', 'flagged'].includes(status)) {
    return sendError(req, res, 'Invalid status. Must be approved, rejected, or flagged', 400, 'VALIDATION_ERROR');
  }
  const thread = await forumService.moderateThread(id, status);
  if (!thread) return sendError(req, res, 'Thread not found', 404, 'NOT_FOUND');
  return sendSuccess(res, { thread });
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid thread ID' });
  const { status } = req.body;
  if (!['approved', 'rejected', 'flagged'].includes(status)) {
    return res
      .status(400)
      .json({ error: 'Invalid status. Must be approved, rejected, or flagged' });
  }
  const thread = await forumService.moderateThread(id, status);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  return res.json({ thread });
});

export const moderateReply = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.replyId, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid reply ID', 400, 'VALIDATION_ERROR');
  const { status } = req.body;
  if (!['approved', 'rejected', 'flagged'].includes(status)) {
    return sendError(req, res, 'Invalid status. Must be approved, rejected, or flagged', 400, 'VALIDATION_ERROR');
  }
  const reply = await forumService.moderateReply(id, status);
  if (!reply) return sendError(req, res, 'Reply not found', 404, 'NOT_FOUND');
  return sendSuccess(res, { reply });
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid reply ID' });
  const { status } = req.body;
  if (!['approved', 'rejected', 'flagged'].includes(status)) {
    return res
      .status(400)
      .json({ error: 'Invalid status. Must be approved, rejected, or flagged' });
  }
  const reply = await forumService.moderateReply(id, status);
  if (!reply) return res.status(404).json({ error: 'Reply not found' });
  return res.json({ reply });
});

export const adminListThreads = wrapAsync(async (req, res) => {
  const { page, limit, status, q } = req.query;
  const result = await forumService.adminListThreads({
    page: Math.max(1, parseInt(page, 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 50)),
    status,
    q,
  });
  return sendSuccess(res, { threads: result.rows, total: result.total });
  return res.json({ threads: result.rows, total: result.total });
});
