import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import Leaderboard from '../../components/dashboard/Leaderboard';
import { gamificationService } from '../../services/gamification/gamificationService';

export default function LeaderboardPage() {
  const { user } = useStudentAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await gamificationService.getLeaderboard(timeframe);
        if (mounted) {
          setLeaderboard(data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLeaderboard();

    return () => {
      mounted = false;
    };
  }, [timeframe]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(204,17,17,0.12)',
            border: '1px solid rgba(204,17,17,0.25)',
            color: 'var(--c1)',
          }}
        >
          <Trophy size={22} />
        </div>
        <div>
          <h1 style={{ margin: 0, color: 'var(--t1)', fontSize: '2rem' }}>Leaderboard</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--t2)' }}>
            See who is leading the community this{' '}
            {timeframe === 'week' ? 'week' : timeframe === 'month' ? 'month' : 'season'}.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--t2)', padding: '32px 0' }}>Loading leaderboard...</div>
      ) : (
        <Leaderboard
          users={leaderboard}
          currentUserId={user?.id || user?.email || null}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
      )}
    </div>
  );
}
