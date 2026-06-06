const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/[&<>"'`]/g, (character) => HTML_ESCAPE_MAP[character])
    .trim();
}

function sanitizeText(value, max = 4000) {
  return escapeHtml(
    String(value ?? '')
      .trim()
      .slice(0, max)
  );
}

function sanitizeNullableText(value, max = 4000) {
  const text = String(value ?? '')
    .trim()
    .slice(0, max);
  return text ? escapeHtml(text) : null;
}

function sanitizeTextArray(values, max = 40) {
  if (!Array.isArray(values)) {
    return String(values || '')
      .split(',')
      .map((entry) => sanitizeText(entry, max))
      .filter(Boolean)
      .slice(0, 12);
  }

  return values
    .map((entry) => sanitizeText(entry, max))
    .filter(Boolean)
    .slice(0, 12);
}

export function sanitizeEventRecord(event = {}) {
  return {
    ...event,
    name: sanitizeText(event.name, 120),
    shortName: sanitizeText(event.shortName || event.name, 60),
    date: sanitizeText(event.date, 80),
    description: sanitizeText(event.description, 1200),
    icon: sanitizeText(event.icon || 'Pin', 32),
    tags: sanitizeTextArray(event.tags, 40),
  };
}

export function sanitizeActivityEventRecord(event = {}) {
  const { createdBy, ...rest } = event;
  return {
    ...rest,
    name: sanitizeText(event.name, 120),
    date: sanitizeText(event.date, 80),
    tagline: sanitizeNullableText(event.tagline, 240),
    description: sanitizeText(event.description, 1200),
  };
}

export function sanitizeCoreTeamMemberRecord(member = {}) {
  return {
    ...member,
    name: sanitizeText(member.name, 100),
    role: sanitizeText(member.role, 100),
    year: sanitizeText(member.year, 20),
    branch: sanitizeText(member.branch, 100),
    section: sanitizeText(member.section, 12),
    email: sanitizeText(member.email, 140),
    whatsapp: sanitizeText(member.whatsapp, 40),
    linkedin: sanitizeNullableText(member.linkedin, 255),
    instagram: sanitizeNullableText(member.instagram, 255),
    photoUrl: sanitizeNullableText(member.photoUrl, 500),
  };
}

// ============================================================
// Portfolio sanitization (issue #969)
//
// Portfolio content is rendered to anonymous visitors at
// /p/:username, so any HTML or javascript: URL stored in the
// database becomes a stored XSS vector.  The strategy below:
//
//   * strip ALL HTML from plain-text fields (bio, title, etc.)
//   * normalize unicode whitespace and control characters
//   * validate every URL field against an https?:// allowlist
//   * apply the same rules recursively to JSONB array/object
//     fields (skills, projects, roadmaps, badges, seoMetadata)
// ============================================================
function toSafeString(value, max = 4000) {
  return String(value ?? '')
    .trim()
    .slice(0, max);
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

const SAFE_URL_PROTOCOLS = /^(https?:\/\/|\/[^\/])/i;
const URL_MAX_LENGTH = 2048;

const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/gi;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const SCRIPT_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const STYLE_PATTERN = /<style\b[^>]*>[\s\S]*?<\/style\s*>/gi;
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const NULL_BYTE_PATTERN = /\u0000/g;
function validateSection(str) {
  const v = String(str || '')
    .trim()
    .toUpperCase();
  if (!/^[A-Z]$/.test(v)) throw new Error('Section must be a single letter (A-Z)');
  return v;
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(SCRIPT_PATTERN, '')
    .replace(STYLE_PATTERN, '')
    .replace(HTML_COMMENT_PATTERN, '')
    .replace(HTML_TAG_PATTERN, '')
    .replace(CONTROL_CHAR_PATTERN, '')
    .replace(NULL_BYTE_PATTERN, '')
    .trim();
}

function stripHtmlTruncated(value, max = 4000) {
  return stripHtml(value).slice(0, max);
}

function validateWhatsApp(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return digits;
}

function safeHref(value) {
  const url = String(value ?? '')
    .trim()
    .slice(0, URL_MAX_LENGTH);
  if (!url) return '';
  if (SAFE_URL_PROTOCOLS.test(url)) return url;
  return '';
}

function sanitizeSocialLinks(links) {
  if (!links || typeof links !== 'object' || Array.isArray(links)) return {};
  const clean = {};
  for (const [key, val] of Object.entries(links)) {
    const k = toSafeString(key, 40);
    if (k) clean[k] = safeHref(val);
  }
  return clean;
}

function sanitizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .slice(0, 100)
    .map((s) => ({
      name: stripHtmlTruncated(s?.name, 100),
      ...(s?.level !== undefined ? { level: stripHtmlTruncated(s.level, 40) } : {}),
      ...(s?.category !== undefined ? { category: stripHtmlTruncated(s.category, 60) } : {}),
    }))
    .filter((s) => s.name);
}

function sanitizeBadges(badges) {
  if (!Array.isArray(badges)) return [];
  return badges
    .slice(0, 100)
    .map((b) => ({
      name: stripHtmlTruncated(b?.name, 120),
      ...(b?.description !== undefined
        ? { description: stripHtmlTruncated(b.description, 1000) }
        : {}),
      ...(b?.tier !== undefined ? { tier: stripHtmlTruncated(b.tier, 40) } : {}),
      ...(b?.iconUrl !== undefined ? { iconUrl: safeHref(b.iconUrl) } : {}),
    }))
    .filter((b) => b.name);
}

function sanitizeProjects(projects) {
  if (!Array.isArray(projects)) return [];
  return projects
    .slice(0, 50)
    .map((p) => ({
      name: stripHtmlTruncated(p?.name, 200),
      ...(p?.description !== undefined
        ? { description: stripHtmlTruncated(p.description, 5000) }
        : {}),
      ...(p?.shortDesc !== undefined ? { shortDesc: stripHtmlTruncated(p.shortDesc, 500) } : {}),
      ...(p?.techStack !== undefined
        ? {
            techStack: Array.isArray(p.techStack)
              ? p.techStack.slice(0, 30).map((t) => stripHtmlTruncated(t, 60))
              : [],
          }
        : {}),
      ...(p?.link !== undefined ? { link: safeHref(p.link) } : {}),
      ...(p?.github !== undefined ? { github: safeHref(p.github) } : {}),
      ...(p?.demo !== undefined ? { demo: safeHref(p.demo) } : {}),
    }))
    .filter((p) => p.name);
}

function sanitizeRoadmaps(roadmaps) {
  if (!Array.isArray(roadmaps)) return [];
  return roadmaps
    .slice(0, 50)
    .map((r) => ({
      title: stripHtmlTruncated(r?.title, 200),
      ...(r?.description !== undefined
        ? { description: stripHtmlTruncated(r.description, 5000) }
        : {}),
      ...(r?.milestones !== undefined
        ? {
            milestones: Array.isArray(r.milestones)
              ? r.milestones
                  .slice(0, 100)
                  .map((m) => ({
                    title: stripHtmlTruncated(m?.title, 200),
                    ...(m?.description !== undefined
                      ? { description: stripHtmlTruncated(m.description, 2000) }
                      : {}),
                    ...(m?.completed !== undefined ? { completed: Boolean(m.completed) } : {}),
                  }))
                  .filter((m) => m.title)
              : [],
          }
        : {}),
    }))
    .filter((r) => r.title);
}

function sanitizeSeoMetadata(meta) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return {};
  return {
    ...(meta.title !== undefined ? { title: stripHtmlTruncated(meta.title, 200) } : {}),
    ...(meta.description !== undefined
      ? { description: stripHtmlTruncated(meta.description, 1000) }
      : {}),
    ...(meta.keywords !== undefined
      ? {
          keywords: Array.isArray(meta.keywords)
            ? meta.keywords.slice(0, 20).map((k) => stripHtmlTruncated(k, 60))
            : [],
        }
      : {}),
  };
}

function sanitizeVisibleSections(sections) {
  if (!sections || typeof sections !== 'object' || Array.isArray(sections)) return {};
  const clean = {};
  for (const [key, val] of Object.entries(sections)) {
    const k = toSafeString(key, 40);
    if (k) clean[k] = Boolean(val);
  }
  return clean;
}

export function sanitizePortfolioRecord(data) {
  return {
    username: toSafeString(data?.username, 100).toLowerCase(),
    passkey: toSafeString(data?.passkey, 256),
    theme: toSafeString(data?.theme || 'glassmorphic', 50),
    bio: stripHtmlTruncated(data?.bio, 5000),
    title: stripHtmlTruncated(data?.title, 200),
    customDomain: safeHref(data?.customDomain),
    visibleSections: sanitizeVisibleSections(data?.visibleSections),
    socialLinks: sanitizeSocialLinks(data?.socialLinks),
    seoMetadata: sanitizeSeoMetadata(data?.seoMetadata),
    skills: sanitizeSkills(data?.skills),
    badges: sanitizeBadges(data?.badges),
    projects: sanitizeProjects(data?.projects),
    roadmaps: sanitizeRoadmaps(data?.roadmaps),
  };
}

export function sanitizePortfolioOutput(record) {
  return {
    username: toSafeString(record?.username, 100),
    theme: toSafeString(record?.theme || 'glassmorphic', 50),
    bio: stripHtmlTruncated(record?.bio, 5000),
    title: stripHtmlTruncated(record?.title, 200),
    customDomain: safeHref(record?.customDomain),
    visibleSections: sanitizeVisibleSections(record?.visibleSections),
    socialLinks: sanitizeSocialLinks(record?.socialLinks),
    seoMetadata: sanitizeSeoMetadata(record?.seoMetadata),
    skills: sanitizeSkills(record?.skills),
    badges: sanitizeBadges(record?.badges),
    projects: sanitizeProjects(record?.projects),
    roadmaps: sanitizeRoadmaps(record?.roadmaps),
    createdAt: record?.createdAt,
    updatedAt: record?.updatedAt,
  };
}

export {
  escapeHtml,
  sanitizeNullableText,
  sanitizeText,
  sanitizeTextArray,
  stripHtml,
  stripHtmlTruncated,
  toSafeString,
  normalizePhone,
  validateWhatsApp,
  validateSection,
};
