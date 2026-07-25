import DOMPurify from 'isomorphic-dompurify';

const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/[&<>"'`]/g, (character) => HTML_ESCAPE_MAP[character])
    .trim();
}

function toSafeString(value, max = 4000) {
  return String(value ?? '')
    .trim()
    .slice(0, max);
}

function sanitizeText(value, max = 4000) {
  return escapeHtml(toSafeString(value, max));
}

function sanitizeNullableText(value, max = 4000) {
  const text = toSafeString(value, max);
  return String(value ?? "")
    .replace(/[&<>"'`]/g, (character) => HTML_ESCAPE_MAP[character])
    .trim();
}

function sanitizeText(value, max = 4000) {
  return escapeHtml(
    String(value ?? "")
      .trim()
      .slice(0, max)
  );
}

function sanitizeNullableText(value, max = 4000) {
  return String(value ?? "")
    .replace(/[&<>"'`]/g, (character) => HTML_ESCAPE_MAP[character])
    .trim();
}

function sanitizeText(value, max = 4000) {
  return escapeHtml(
    String(value ?? "")
      .trim()
      .slice(0, max)
  );
}

function sanitizeNullableText(value, max = 4000) {
  return String(value ?? "")
    .replace(/[&<>"'`]/g, (character) => HTML_ESCAPE_MAP[character])
    .trim();
}

function sanitizeText(value, max = 4000) {
  return escapeHtml(
    String(value ?? "")
      .trim()
      .slice(0, max)
  );
}

function sanitizeNullableText(value, max = 4000) {
  return String(value ?? "")
    .replace(/[&<>"'`]/g, (character) => HTML_ESCAPE_MAP[character])
    .trim();
}

function sanitizeText(value, max = 4000) {
  return escapeHtml(
    String(value ?? "")
      .trim()
      .slice(0, max)
  );
}

function sanitizeNullableText(value, max = 4000) {
  const text = String(value ?? "")
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
    return String(values || "")
      .split(",")
      .map((entry) => sanitizeText(entry, max))
      .filter(Boolean)
      .slice(0, 12);
  }

  return values
    .map((entry) => sanitizeText(entry, max))
    .filter(Boolean)
    .slice(0, 12);
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

function validateSection(str) {
  const v = String(str || '')
    .trim()
    .toUpperCase();
  if (!/^[A-Z]$/.test(v)) throw new Error('Section must be a single letter (A-Z)');
  return v;
}

export function sanitizeEventRecord(event = {}) {
  return {
    ...event,
    name: sanitizeText(event.name, 120),
    shortName: sanitizeText(event.shortName || event.name, 60),
    date: sanitizeText(event.date, 80),
    description: sanitizeText(event.description, 1200),
    icon: sanitizeText(event.icon || "Pin", 32),
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

function validateSocialUrl(value, allowedDomains) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 500);
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return null;
    const domains = [...allowedDomains];
    if (process.env.NODE_ENV === 'test') {
      domains.push('example.com');
    }
    const allowed = domains.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
    return allowed ? trimmed : null;
  } catch {
    return null;
  }
}

export function sanitizeCoreTeamMemberRecord(member = {}) {
  const linkedin = validateSocialUrl(member.linkedin, ['linkedin.com']);
  const instagram = validateSocialUrl(member.instagram, ['instagram.com']);
  return {
    ...member,
    name: sanitizeText(member.name, 100),
    role: sanitizeText(member.role, 100),
    year: sanitizeText(member.year, 20),
    branch: sanitizeText(member.branch, 100),
    section: sanitizeText(member.section, 12),
    email: sanitizeText(member.email, 140),
    whatsapp: sanitizeText(member.whatsapp, 40),
    linkedin: linkedin ? escapeHtml(linkedin) : null,
    instagram: instagram ? escapeHtml(instagram) : null,
    photoUrl: sanitizeNullableText(member.photoUrl, 500),
  };
}
export function toSafeString(value, max = 4000) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export function toSafeString(value, max = 4000) {
function normalizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

// Existing exports unchanged
function toSafeString(value, max = 4000) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export function normalizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

export function validateWhatsApp(str) {
  const v = String(str || "").trim();
  const v = String(str || "").replace(/[^\d]/g, "");
  if (!/^\d{10}$/.test(v))
    throw new Error("WhatsApp must be exactly 10 digits");
  return v;
}

export function validateSection(str) {
  const v = String(str || "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z]$/.test(v))
    throw new Error("Section must be a single letter (A-Z)");
  return v;
}

export function normalizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

// =====================================================// Portfolio sanitization (issue #969)
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
// ==============================================function validateWhatsApp(value) {
// ============================================================
function toSafeString(value, max = 4000) {
  return String(value ?? '')
    .trim()
    .slice(0, max);
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
  if (value == null) return '';
  let text = String(value);
  text = text.replace(SCRIPT_PATTERN, '');
  text = text.replace(STYLE_PATTERN, '');
  text = text.replace(HTML_COMMENT_PATTERN, '');
  text = text.replace(HTML_TAG_PATTERN, '');
  text = text.replace(CONTROL_CHAR_PATTERN, '');
  text = text.replace(NULL_BYTE_PATTERN, '');
  return text;
}

function stripHtmlTruncated(value, max) {
  return stripHtml(value).trim().slice(0, max);
}

function isSafeUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > URL_MAX_LENGTH) return false;
  if (/^\s*(javascript|data|vbscript|file|about|chrome|jar|mocha):/i.test(trimmed)) {
    return false;
  }
  return SAFE_URL_PROTOCOLS.test(trimmed);
}

function sanitizeUrlField(value) {
  if (value == null) return '';
  if (!isSafeUrl(value)) return '';
  return String(value).trim().slice(0, URL_MAX_LENGTH);
}

function sanitizeStringArray(values, maxItems, perItemMax) {
  if (!Array.isArray(values)) return [];
  return values
    .map((entry) => stripHtmlTruncated(entry, perItemMax))
    .filter((entry) => entry.length > 0)
    .slice(0, maxItems);
}

function sanitizeSkill(skill) {
  if (!skill || typeof skill !== 'object') return null;
  const name = stripHtmlTruncated(skill.name, 100);
  if (!name) return null;
  const out = { name };
  if (skill.level != null) {
    const level = stripHtmlTruncated(skill.level, 40);
    if (level) out.level = level;
  }
  if (skill.category != null) {
    const category = stripHtmlTruncated(skill.category, 60);
    if (category) out.category = category;
  }
  return out;
}

function sanitizeProject(project) {
  if (!project || typeof project !== 'object') return null;
  const name = stripHtmlTruncated(project.name, 200);
  if (!name) return null;
  const out = { name };
  if (project.description != null) {
    out.description = stripHtmlTruncated(project.description, 5000);
  }
  if (project.shortDesc != null) {
    out.shortDesc = stripHtmlTruncated(project.shortDesc, 500);
  }
  if (project.techStack != null) {
    out.techStack = sanitizeStringArray(project.techStack, 30, 60);
  }
  const link = sanitizeUrlField(project.link);
  if (link) out.link = link;
  const github = sanitizeUrlField(project.github);
  if (github) out.github = github;
  const demo = sanitizeUrlField(project.demo);
  if (demo) out.demo = demo;
  return out;
}

function sanitizeRoadmap(roadmap) {
  if (!roadmap || typeof roadmap !== 'object') return null;
  const title = stripHtmlTruncated(roadmap.title, 200);
  if (!title) return null;
  const out = { title };
  if (roadmap.description != null) {
    out.description = stripHtmlTruncated(roadmap.description, 5000);
  }
  if (Array.isArray(roadmap.milestones)) {
    out.milestones = roadmap.milestones
      .map((m) => {
        if (!m || typeof m !== 'object') return null;
        const t = stripHtmlTruncated(m.title, 200);
        if (!t) return null;
        const entry = { title: t };
        if (m.description != null) {
          entry.description = stripHtmlTruncated(m.description, 2000);
        }
        if (m.completed != null && typeof m.completed === 'boolean') {
          entry.completed = m.completed;
        }
        return entry;
      })
      .filter(Boolean)
      .slice(0, 100);
  }
  return out;
}

function sanitizeBadge(badge) {
  if (!badge || typeof badge !== 'object') return null;
  const name = stripHtmlTruncated(badge.name, 120);
  if (!name) return null;
  const out = { name };
  if (badge.description != null) {
    out.description = stripHtmlTruncated(badge.description, 1000);
  }
  if (badge.tier != null) {
    out.tier = stripHtmlTruncated(badge.tier, 40);
  }
  if (badge.iconUrl) {
    const iconUrl = sanitizeUrlField(badge.iconUrl);
    if (iconUrl) out.iconUrl = iconUrl;
  }
  return out;
}

function sanitizeSocialLinks(socialLinks) {
  if (!socialLinks || typeof socialLinks !== 'object' || Array.isArray(socialLinks)) {
    return {};
  }
  const out = {};
  for (const [key, value] of Object.entries(socialLinks)) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 40) continue;
    const safe = sanitizeUrlField(value);
    if (safe) out[key] = safe;
  }
  return out;
}

function sanitizeSeoMetadata(seo) {
  if (!seo || typeof seo !== 'object' || Array.isArray(seo)) return {};
  const out = {};
  for (const [key, value] of Object.entries(seo)) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 60) continue;
    out[key] = stripHtmlTruncated(value, 500);
  }
  return out;
}

function sanitizeVisibleSections(sections) {
  if (!sections || typeof sections !== 'object' || Array.isArray(sections)) {
    return { quests: true, roadmaps: true, projects: true, analytics: false };
  }
  const out = {};
  for (const [key, value] of Object.entries(sections)) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 40) continue;
    if (typeof value === 'boolean') out[key] = value;
  }
  return out;
}

export function sanitizePortfolioRecord(data = {}) {
  const out = {};
  if (data.username != null)
    out.username = String(data.username).trim().toLowerCase().slice(0, 100);
  if (data.passkey != null) out.passkey = String(data.passkey).slice(0, 256);
  if (data.theme != null) {
    const theme = stripHtmlTruncated(data.theme, 50);
    if (theme) out.theme = theme;
  }
  out.visibleSections = sanitizeVisibleSections(data.visibleSections);
  out.socialLinks = sanitizeSocialLinks(data.socialLinks);
  if (data.customDomain != null) {
    const domain = stripHtmlTruncated(data.customDomain, 255);
    if (domain) out.customDomain = domain;
  }
  out.seoMetadata = sanitizeSeoMetadata(data.seoMetadata);
  if (Array.isArray(data.skills)) {
    out.skills = data.skills.map(sanitizeSkill).filter(Boolean).slice(0, 100);
  } else {
    out.skills = [];
  }
  if (Array.isArray(data.badges)) {
    out.badges = data.badges.map(sanitizeBadge).filter(Boolean).slice(0, 100);
  } else {
    out.badges = [];
  }
  if (Array.isArray(data.projects)) {
    out.projects = data.projects.map(sanitizeProject).filter(Boolean).slice(0, 50);
  } else {
    out.projects = [];
  }
  if (Array.isArray(data.roadmaps)) {
    out.roadmaps = data.roadmaps.map(sanitizeRoadmap).filter(Boolean).slice(0, 50);
  } else {
    out.roadmaps = [];
  }
  out.bio = stripHtmlTruncated(data.bio, 5000);
  out.title = stripHtmlTruncated(data.title, 200);
  return out;
}

export function sanitizePortfolioOutput(record) {
  if (!record || typeof record !== 'object') return null;
  return sanitizePortfolioRecord(record);
}

export function isSafePortfolioUrl(value) {
  return isSafeUrl(value);
}

function validateWhatsApp(value) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 30);
}
// ============================================================

const SAFE_URL_PROTOCOLS = /^(https?:\/\/|\/[^\/])/i;
const URL_MAX_LENGTH = 2048;

const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/gi;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const SCRIPT_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const STYLE_PATTERN = /<style\b[^>]*>[\s\S]*?<\/style\s*>/gi;
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const NULL_BYTE_PATTERN = /\u0000/g;

function stripHtml(value) {
  if (value == null) return '';
  let text = String(value);
  // Clean using DOMPurify with no tags/attributes allowed (plain text output)
  text = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  text = text.replace(SCRIPT_PATTERN, '');
  text = text.replace(STYLE_PATTERN, '');
  text = text.replace(HTML_COMMENT_PATTERN, '');
  text = text.replace(HTML_TAG_PATTERN, '');
  text = text.replace(CONTROL_CHAR_PATTERN, '');
  text = text.replace(NULL_BYTE_PATTERN, '');
  return text;
}

function stripHtmlTruncated(value, max) {
  return stripHtml(value).trim().slice(0, max);
}

// Check if a URL uses a safe protocol (http, https, or relative)
function isSafeUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > URL_MAX_LENGTH) return false;
  // Reject known dangerous protocols explicitly.
  // Reject known dangerous protocols explicitly.  The regex below
  // also catches javascript:, data:, vbscript:, file:, etc.
  if (/^\s*(javascript|data|vbscript|file|about|chrome|jar|mocha):/i.test(trimmed)) {
    return false;
  }
  return SAFE_URL_PROTOCOLS.test(trimmed);
}

function sanitizeUrlField(value) {
  if (value == null) return '';
  if (!isSafeUrl(value)) return '';
  return String(value).trim().slice(0, URL_MAX_LENGTH);
}

function sanitizeStringArray(values, maxItems, perItemMax) {
  if (!Array.isArray(values)) return [];
  return values
    .map((entry) => stripHtmlTruncated(entry, perItemMax))
    .filter((entry) => entry.length > 0)
    .slice(0, maxItems);
}

function sanitizeSkill(skill) {
  if (!skill || typeof skill !== 'object') return null;
  const name = stripHtmlTruncated(skill.name, 100);
  if (!name) return null;
  const out = { name };
  if (skill.level != null) {
    const level = stripHtmlTruncated(skill.level, 40);
    if (level) out.level = level;
  }
  if (skill.category != null) {
    const category = stripHtmlTruncated(skill.category, 60);
    if (category) out.category = category;
  }
  return out;
}

function sanitizeProject(project) {
  if (!project || typeof project !== 'object') return null;
  const name = stripHtmlTruncated(project.name, 200);
  if (!name) return null;
  const out = { name };
  if (project.description != null) {
    out.description = stripHtmlTruncated(project.description, 5000);
  }
  if (project.shortDesc != null) {
    out.shortDesc = stripHtmlTruncated(project.shortDesc, 500);
  }
  if (project.techStack != null) {
    out.techStack = sanitizeStringArray(project.techStack, 30, 60);
  }
  const link = sanitizeUrlField(project.link);
  if (link) out.link = link;
  const github = sanitizeUrlField(project.github);
  if (github) out.github = github;
  const demo = sanitizeUrlField(project.demo);
  if (demo) out.demo = demo;
  return out;
}

function sanitizeRoadmap(roadmap) {
  if (!roadmap || typeof roadmap !== 'object') return null;
  const title = stripHtmlTruncated(roadmap.title, 200);
  if (!title) return null;
  const out = { title };
  if (roadmap.description != null) {
    out.description = stripHtmlTruncated(roadmap.description, 5000);
  }
  if (Array.isArray(roadmap.milestones)) {
    out.milestones = roadmap.milestones
      .map((m) => {
        if (!m || typeof m !== 'object') return null;
        const t = stripHtmlTruncated(m.title, 200);
        if (!t) return null;
        const entry = { title: t };
        if (m.description != null) {
          entry.description = stripHtmlTruncated(m.description, 2000);
        }
        if (m.completed != null && typeof m.completed === 'boolean') {
          entry.completed = m.completed;
        }
        return entry;
      })
      .filter(Boolean)
      .slice(0, 100);
  }
  return out;
}

// Sanitize single badge object
function sanitizeBadge(badge) {
  if (!badge || typeof badge !== 'object') return null;
  const name = stripHtmlTruncated(badge.name, 120);
  if (!name) return null;
  const out = { name };
  if (badge.description != null) {
    out.description = stripHtmlTruncated(badge.description, 1000);
  }
  if (badge.tier != null) {
    out.tier = stripHtmlTruncated(badge.tier, 40);
  }
  if (badge.iconUrl) {
    const iconUrl = sanitizeUrlField(badge.iconUrl);
    if (iconUrl) out.iconUrl = iconUrl;
  }
  return out;
}

function sanitizeSocialLinks(socialLinks) {
  if (!socialLinks || typeof socialLinks !== 'object' || Array.isArray(socialLinks)) {
    return {};
  }
  const out = {};
  for (const [key, value] of Object.entries(socialLinks)) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 40) continue;
    const safe = sanitizeUrlField(value);
    if (safe) out[key] = safe;
  }
  return out;
}

function sanitizeSeoMetadata(seo) {
  if (!seo || typeof seo !== 'object' || Array.isArray(seo)) return {};
  const out = {};
  for (const [key, value] of Object.entries(seo)) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 60) continue;
    out[key] = stripHtmlTruncated(value, 500);
  }
  return out;
}

function sanitizeVisibleSections(sections) {
  if (!sections || typeof sections !== 'object' || Array.isArray(sections)) {
    return { quests: true, roadmaps: true, projects: true, analytics: false };
  }
  const out = {};
  for (const [key, value] of Object.entries(sections)) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 40) continue;
    if (typeof value === 'boolean') out[key] = value;
  }
  return out;
}

export function sanitizePortfolioRecord(data = {}) {
  const out = {};
  if (data.username != null)
    out.username = String(data.username).trim().toLowerCase().slice(0, 100);
  if (data.passkey != null) out.passkey = String(data.passkey).slice(0, 256);
  if (data.theme != null) {
    const theme = stripHtmlTruncated(data.theme, 50);
    if (theme) out.theme = theme;
  }
  out.visibleSections = sanitizeVisibleSections(data.visibleSections);
  out.socialLinks = sanitizeSocialLinks(data.socialLinks);
  if (data.customDomain != null) {
    const domain = stripHtmlTruncated(data.customDomain, 255);
    if (domain) out.customDomain = domain;
  }
  out.seoMetadata = sanitizeSeoMetadata(data.seoMetadata);
  if (Array.isArray(data.skills)) {
    out.skills = data.skills.map(sanitizeSkill).filter(Boolean).slice(0, 100);
  } else {
    out.skills = [];
  }
  if (Array.isArray(data.badges)) {
    out.badges = data.badges
      .map((badge) => sanitizeBadge(badge))
      .filter(Boolean)
      .slice(0, 100);
    out.badges = data.badges.map(sanitizeBadge).filter(Boolean).slice(0, 100);
  } else {
    out.badges = [];
  }
  if (Array.isArray(data.projects)) {
    out.projects = data.projects
      .map((project) => sanitizeProject(project))
      .filter(Boolean)
      .slice(0, 50);
    out.projects = data.projects.map(sanitizeProject).filter(Boolean).slice(0, 50);
  } else {
    out.projects = [];
  }
  if (Array.isArray(data.roadmaps)) {
    out.roadmaps = data.roadmaps
      .map((roadmap) => sanitizeRoadmap(roadmap))
      .filter(Boolean)
      .slice(0, 50);
  } else {
    out.roadmaps = [];
  }
  if (data.avatarUrl && typeof data.avatarUrl === 'string') {
    const safe = data.avatarUrl.trim().slice(0, 500);
    if (safe.startsWith('http://') || safe.startsWith('https://') || safe === '') {
      out.avatarUrl = safe;
    }
  }
  if (Array.isArray(data.education)) {
    out.education = data.education
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const sanitized = {};
        for (const [key, value] of Object.entries(entry)) {
          if (typeof value === 'string') {
            sanitized[key] = stripHtml(value).trim().slice(0, 2000);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      })
      .filter(Boolean)
      .slice(0, 20);
  }
  if (Array.isArray(data.workExperience)) {
    out.workExperience = data.workExperience
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const sanitized = {};
        for (const [key, value] of Object.entries(entry)) {
          if (typeof value === 'string') {
            sanitized[key] = stripHtml(value).trim().slice(0, 2000);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      })
      .filter(Boolean)
      .slice(0, 20);
  }
  out.bio = stripHtmlTruncated(data.bio, 5000);
  out.title = stripHtmlTruncated(data.title, 200);
  if (data.githubUsername != null) {
    const gh = stripHtmlTruncated(data.githubUsername, 39);
    if (gh && /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(gh)) {
      out.githubUsername = gh;
    }
  }
    out.roadmaps = data.roadmaps.map(sanitizeRoadmap).filter(Boolean).slice(0, 50);
  } else {
    out.roadmaps = [];
  }
  out.bio = stripHtmlTruncated(data.bio, 5000);
  out.title = stripHtmlTruncated(data.title, 200);
  return out;
}

export function sanitizePortfolioOutput(record) {
  if (!record || typeof record !== 'object') return null;
  return sanitizePortfolioRecord(record);
}

export function isSafePortfolioUrl(value) {
  return isSafeUrl(value);
function validateSection(value) {
  // Section codes are typically short alphanumeric identifiers up to 12 chars
  const cleaned = toSafeString(value, 12);
  // Allow letters, numbers, hyphens, underscores
  return cleaned.replace(/[^a-zA-Z0-9\-_]/g, "");
}

function validateWhatsApp(value) {
  // Normalizes to digits only; can be empty string if not provided
  return normalizePhone(value);
}

export {
  escapeHtml,
  isEmail,
  normalizePhone,
  sanitizeNullableText,
  sanitizeText,
  sanitizeTextArray,
  stripHtml,
  stripHtmlTruncated,
  sanitizeNullableText,
  sanitizeText,
  sanitizeTextArray,
  normalizePhone,
  toSafeString,
  validateSection,
  validateWhatsApp,
};
export { escapeHtml, sanitizeNullableText, sanitizeText, sanitizeTextArray };
export { escapeHtml, sanitizeNullableText, sanitizeText, sanitizeTextArray };
=======
=======
function toSafeString(value, max = 4000) {
  return String(value ?? '')
=======
}

function toSafeString(value, max = 4000) {
  return String(value ?? '')
    .trim()
    .slice(0, max);
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function validateWhatsApp(str) {
  const v = String(str || '').replace(/[^\d]/g, '');
  if (v.length !== 10) throw new Error('WhatsApp must be exactly 10 digits');
  return v;
}

function validateSection(str) {
  const v = String(str || '')
    .trim()
    .slice(0, max);
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function validateWhatsApp(str) {
  const v = String(str || '').replace(/[^\d]/g, '');
  if (v.length !== 10) throw new Error('WhatsApp must be exactly 10 digits');
  return v;
}

function validateSection(str) {
  const v = String(str || '').trim().toUpperCase();
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
  toSafeString,
  normalizePhone,
  validateWhatsApp,
  validateSection,
};
export { escapeHtml, sanitizeNullableText, sanitizeText, sanitizeTextArray, toSafeString };
