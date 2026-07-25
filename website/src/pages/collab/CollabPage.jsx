import React from 'react';

export default function CollabPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('find-team'); // 'find-team', 'skill-swap'
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamsUrl = buildUrl(getApiBase(), '/api/collab/teams');
    if (!teamsUrl) {
      setTeams(mockTeams);
      setIsDemo(true);
      setLoading(false);
      return;
    }
    fetch(teamsUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setTeams(Array.isArray(data) && data.length ? data : mockTeams);
        setIsDemo(!Array.isArray(data) || data.length === 0);
      })
      .catch(() => {
        setTeams(mockTeams);
        setIsDemo(true);
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (activeTab !== 'find-team') {
      setSearch('');
    }
  }, [activeTab]);
  const handleJoinSubmit = async (requestData) => {
    if (isDemo) {
      alert('Demo mode: Join requests are disabled.');
      return;
    }

    const requestsUrl = buildUrl(getApiBase(), '/api/collab/requests');
    if (!requestsUrl) return;

    await fetch(requestsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.vacantRoles.some((r) => r.toLowerCase().includes(search.toLowerCase())) ||
      t.techStack.some((ts) => ts.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="collab-page" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Collaboration</h1>
      <p>Collaborative workspace features coming soon.</p>
      {onBack && (
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          ← Back
        </button>
      )}
    </div>
  );
}
