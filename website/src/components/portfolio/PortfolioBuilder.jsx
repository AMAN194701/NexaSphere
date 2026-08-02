import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../../utils/apiClient.js';
import { getApiBase } from '../../utils/runtimeConfig';
import { projectsData } from '../../data/projectsData';
import { roadmapData } from '../../data/roadmapData';
import { RepoCardSkeleton } from '../ui/skeleton/RepoCardSkeleton';
import AdvancedCustomizer from './AdvancedCustomizer';

export default function PortfolioBuilder() {
  const [username, setUsername] = useState('');
  const [passkey, setPasskey] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('glassmorphic');
  const [isPublic, setIsPublic] = useState(true);
  const [customization, setCustomization] = useState({
    colors: { accent: '#cc1111' },
    typography: { header: 'Orbitron' },
    spacing: { radius: 12, padding: 28 },
    hero: 'centered',
  });
  const [customDomain, setCustomDomain] = useState('');

  // Section Visibilities
  const [visibleSections, setVisibleSections] = useState({
    skillsAndQuests: true,
    roadmaps: true,
    projects: true,
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    resume: '',
  });

  // SEO Metadata
  const [seoMetadata, setSeoMetadata] = useState({
    title: '',
    description: '',
  });

  // Selected Data Elements to showcase
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedRoadmaps, setSelectedRoadmaps] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [customProjects, setCustomProjects] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);

  // GitHub Fetching States
  const [ghUsername, setGhUsername] = useState('');
  const [isFetchingGh, setIsFetchingGh] = useState(false);
  const [ghRepos, setGhRepos] = useState([]);
  const [ghError, setGhError] = useState('');
  const [ghFetchAttempted, setGhFetchAttempted] = useState(false);

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Resume Parsing
  const [isParsing, setIsParsing] = useState(false);
  const resumeInputRef = useRef(null);
  // Extract all unique skills from roadmapData
  const availableSkills = Object.values(roadmapData).reduce((acc, roadmap) => {
    roadmap.nodes.forEach((node) => {
      if (node.concepts) {
        node.concepts.forEach((concept) => {
          if (!acc.includes(concept)) acc.push(concept);
        });
      }
    });
    return acc;
  }, []);

  // Extract all roadmaps domains
  const availableRoadmaps = Object.entries(roadmapData).map(([key, value]) => ({
    key,
    title: value.title,
  }));

  // Extract all available projects
  const availableProjects = projectsData.map((p) => ({
    id: p.id,
    title: p.title,
  }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubParam = params.get('github');
    if (githubParam) {
      setGhUsername(githubParam);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadControllerRef = useRef(null);
  const loadGenRef = useRef(0);

  const handleLoadConfig = async () => {
    if (!username || username.length < 3) return;
    setErrorMsg('');
    setSuccessMsg('');

    const gen = ++loadGenRef.current;
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;

    try {
      const base = getApiBase();
      const query = passkey ? `?passkey=${encodeURIComponent(passkey)}` : '';
      const url = base
        ? `${base}/api/portfolio/${username}${query}`
        : `/api/portfolio/${username}${query}`;
      const data = await apiClient(url, { signal: controller.signal });
      if (gen !== loadGenRef.current) return;
      if (data) {
        setTitle(data.title || '');
        setBio(data.bio || '');
        setTheme(data.theme || 'glassmorphic');
        setIsPublic(data.isPublic !== false);
        setCustomization(data.customization || customization);
        setCustomDomain(data.customDomain || '');
        setVisibleSections(
          data.visibleSections
            ? {
                ...data.visibleSections,
                skillsAndQuests:
                  data.visibleSections.skillsAndQuests ?? data.visibleSections.quests ?? true,
              }
            : { skillsAndQuests: true, roadmaps: true, projects: true }
        );
        setSocialLinks(data.socialLinks || { github: '', linkedin: '', twitter: '', resume: '' });
        setSeoMetadata(data.seoMetadata || { title: '', description: '' });
        setGhUsername(data.githubUsername || '');
        setSelectedSkills(data.skills || []);
        setSelectedRoadmaps(data.roadmaps || []);
        setSelectedProjects(data.projects || []);
        setCustomProjects(data.customProjects || []);
        setWorkExperience(data.workExperience || []);
        setSuccessMsg('Existing portfolio configuration found and loaded!');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (gen !== loadGenRef.current) return;
      if (err.status === 404) {
        return;
      }
      setErrorMsg(
        err.message || 'Failed to load portfolio. Please check your connection and try again.'
      );
    }
  };

  const handleSave = async (e) => {
    if (isSaving) return;
    e.preventDefault();
    if (!username || username.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (!passkey || passkey.length < 4) {
      setErrorMsg('Passkey must be at least 4 characters long.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const payload = {
        username,
        passkey,
        title,
        bio,
        isPublic,
        theme,
        customization,
        customDomain,
        visibleSections,
        socialLinks,
        seoMetadata,
        skills: selectedSkills,
        roadmaps: selectedRoadmaps,
        projects: selectedProjects,
        customProjects,
        workExperience,
        githubUsername: ghUsername.trim() || undefined,
      };

      const base = getApiBase();
      const url = base ? `${base}/api/portfolio` : `/api/portfolio`;

      await apiClient(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setSuccessMsg('Portfolio built and synchronized successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleRoadmap = (roadmapKey) => {
    setSelectedRoadmaps((prev) =>
      prev.includes(roadmapKey) ? prev.filter((r) => r !== roadmapKey) : [...prev, roadmapKey]
    );
  };

  const toggleProject = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((p) => p !== projectId) : [...prev, projectId]
    );
  };

  const ghControllerRef = useRef(null);

  const fetchGithubRepos = async () => {
    if (!ghUsername) return;
    if (isFetchingGh) return;

    const validUsername = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(
      ghUsername.trim()
    );
    if (!validUsername) {
      setGhError(
        'Invalid GitHub username format. Usernames can only contain letters, numbers, and hyphens.'
      );
      return;
    }

    if (ghControllerRef.current) {
      ghControllerRef.current.abort();
    }
    const controller = new AbortController();
    ghControllerRef.current = controller;

    setIsFetchingGh(true);
    setGhError('');
    try {
      const response = await fetch(buildGithubReposUrl(ghUsername), { signal: controller.signal });

      if (response.status === 403 || response.status === 429) {
        let errorDetail = {};
        try {
          errorDetail = await response.json();
        } catch {
          // Keep default rate-limit message below.
        }
        const resetTime = errorDetail.rateLimitReset
          ? new Date(errorDetail.rateLimitReset).toLocaleTimeString()
          : 'soon';
        setGhError(
          `GitHub rate limit reached. Too many requests from this network. Please try again after ${resetTime}.`
        );
        return;
      }

      if (response.status === 404) {
        setGhError(
          `GitHub user "${ghUsername.trim()}" not found. Please check the username and try again.`
        );
        return;
      }

      if (!response.ok) {
        let errorDetail = {};
        try {
          errorDetail = await response.json();
        } catch {
          // Keep fallback message below.
        }
        setGhError(
          errorDetail.error || `GitHub API error: ${response.status} ${response.statusText}`
        );
        return;
      }

      const data = await response.json();
      const top5 = [...data].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);
      setGhRepos(top5);
      setGhFetchAttempted(true);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setGhError('Failed to fetch repositories. Please check your connection and try again.');
    } finally {
      setIsFetchingGh(false);
    }
  };

  const toggleGithubRepo = (repo) => {
    setCustomProjects((prev) => {
      const exists = prev.find((p) => p.id === repo.id);
      if (exists) {
        return prev.filter((p) => p.id !== repo.id);
      } else {
        const customProj = {
          id: repo.id,
          title: repo.name,
          shortDesc: repo.description || 'GitHub Repository',
          category: 'Open Source',
          techStack: repo.language ? [repo.language] : [],
          github: repo.html_url,
          demo: repo.homepage || '#',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
        };
        return [...prev, customProj];
      }
    });
  };

  const handleLinkedInSync = () => {
    const base = getApiBase();
    const width = 600;
    const height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    const url = base ? `${base}/api/portfolio/linkedin/auth` : `/api/portfolio/linkedin/auth`;

    window.open(url, 'LinkedInSync', `width=${width},height=${height},top=${top},left=${left}`);
  };

  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'LINKEDIN_SUCCESS') {
        const payload = event.data.payload;
        setSuccessMsg('LinkedIn data imported successfully!');
        if (payload.socialLink) {
          setSocialLinks((prev) => ({ ...prev, linkedin: payload.socialLink }));
        }
        if (payload.skills && payload.skills.length > 0) {
          const newSkills = payload.skills.map((s) => s.name);
          setSelectedSkills((prev) => {
            const merged = new Set([...prev, ...newSkills]);
            return Array.from(merged);
          });
        }
        if (payload.workExperience) {
          setWorkExperience(payload.workExperience);
        }
      } else if (event.data?.type === 'LINKEDIN_ERROR') {
        setErrorMsg('LinkedIn Import Error: ' + event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getPortfolioUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/p/${encodeURIComponent(username)}`;
  };

  const handleCopyLink = () => {
    const url = getPortfolioUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
      .catch(err => console.error(err))