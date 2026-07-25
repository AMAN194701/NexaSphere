import { useState, useEffect } from 'react';
import { getApiBase } from '../../utils/runtimeConfig';
import { gamificationService } from '../../services/gamification/gamificationService';
import {
  Calendar,
  Award,
  TrendingUp,
  Download,
  Users,
  MessageSquare,
  FileText,
  Activity,
  Zap,
  ArrowRight,
  BarChart3,
  PieChart,
  ChevronRight,
  Trophy,
  Target,
  Brain,
  Lightbulb,
} from 'lucide-react';
import PrivacySettings from '../../components/profile/PrivacySettings';
import ProfileBadges from '../../components/profile/ProfileBadges';
import SkeletonCard from '../../components/SkeletonCard';

const ACHIEVEMENT_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Target,
  Trophy,
  MessageSquare,
};
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'event_registration' | 'comment' | 'post' | 'achievement';
  title: string;
  description: string;
  date: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
}

interface LeaderboardUser {
  id: string;
  userId: string;
  username: string;
  xp: number;
  level: number;
}

// Mock data used as fallback when the API is unavailable
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'event_registration',
    title: 'Tech Symposium 2026',
    description: 'You registered for Tech Symposium',
    date: new Date(),
  },
  {
    id: '2',
    type: 'comment',
    title: 'Commented on AI Workshop',
    description: 'Great insights on AI applications!',
    date: new Date(Date.now() - 2 * 86400000),
  },
  {
    id: '3',
    type: 'achievement',
    title: 'First Event Attended',
    description: 'Earned "First Step" badge',
    date: new Date(Date.now() - 5 * 86400000),
  },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'First Event',
    description: 'Attended your first event',
    icon: '🎯',
    points: 50,
  },
  {
    id: '2',
    title: 'Active Participant',
    description: 'Attended 5 events',
    icon: '🏆',
    points: 100,
  },
  {
    id: '3',
    title: 'Community Builder',
    description: 'Posted 10 comments',
    icon: '💬',
    points: 75,
  },
];

const MOCK_METRICS = {
  eventsAttended: 8,
  commentsPosted: 24,
  contributionsMade: 12,
  totalPoints: 450,
  currentStreak: 5,
  longestStreak: 12,
};

// getApiBase imported from runtimeConfig — avoids as any cast and duplicated URL logic

export default function UserDashboard() {
  // No auth system exists yet — userId is hardcoded as a placeholder meaning
  // every user fetches the same data. isDemo is forced true below to make this
  // limitation visible. When an auth system is added, replace with the real
  // user ID from the auth context and remove the forced isDemo = true.
  const userId = 'user_123';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [metrics, setMetrics] = useState({
    eventsAttended: 0,
    commentsPosted: 0,
    contributionsMade: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profileCompletion] = useState(65);
  const [xpProgress, setXpProgress] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelTitle, setLevelTitle] = useState('Newcomer');
  const [exportMessage, setExportMessage] = useState('');

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setActivities([
        {
          id: '1',
          type: 'event_registration',
          title: 'Tech Symposium 2026',
          description: 'You registered for Tech Symposium',
          date: new Date(),
        },
        {
          id: '2',
          type: 'comment',
          title: 'Commented on AI Workshop',
          description: 'Great insights on AI applications!',
          date: new Date(Date.now() - 2 * 86400000),
        },
        {
          id: '3',
          type: 'achievement',
          title: 'First Event Attended',
          description: 'Earned "First Step" badge',
          date: new Date(Date.now() - 5 * 86400000),
        },
      ]);
      setAchievements([
        {
          id: '1',
          title: 'First Event',
          description: 'Attended your first event',
          icon: 'Target',
          icon: '🎯',
          points: 50,
        },
        {
          id: '2',
          title: 'Active Participant',
          description: 'Attended 5 events',
          icon: 'Trophy',
          icon: '🏆',
          points: 100,
        },
        {
          id: '3',
          title: 'Community Builder',
          description: 'Posted 10 comments',
          icon: 'MessageSquare',
          icon: '💬',
          points: 75,
        },
      ]);
      setMetrics({
        eventsAttended: 8,
        commentsPosted: 24,
        contributionsMade: 12,
        totalPoints: 450,
        currentStreak: 5,
        longestStreak: 12,
      });
      setLoading(false);
    }, 500);
      return;
    }

    // Force demo banner even when API is reachable — userId is still
    // hardcoded as 'user_123' so all users see identical placeholder data.
    setIsDemo(true);

    Promise.all([
      fetch(`${base}/api/dashboard/profile/${userId}`).then((r) => r.json()),
      fetch(`${base}/api/dashboard/quests/${userId}`).then((r) => r.json()),
      fetch(`${base}/api/dashboard/leaderboard`).then((r) => r.json()),
    ])
      .then(([profile, quests, leaderboard]) => {
        // isDemo stays true — userId is still hardcoded as 'user_123'

        // Map profile → metrics
        if (profile && typeof profile === 'object') {
          setMetrics({
            eventsAttended: profile.eventsAttended ?? 0,
            commentsPosted: profile.commentsPosted ?? 0,
            contributionsMade: profile.contributionsMade ?? 0,
            totalPoints: profile.xp ?? 0,
            currentStreak: profile.currentStreak ?? 0,
            longestStreak: profile.longestStreak ?? 0,
            xpProgress: profile.xpProgress ?? 0,
            xpToNextLevel: profile.xpToNextLevel ?? 0,
          });
          setLevel(profile.level ?? 1);
          setLevelTitle(profile.levelTitle ?? 'Newcomer');
          // Map badges → achievements
          if (Array.isArray(profile.badges) && profile.badges.length > 0) {
            setAchievements(
              profile.badges.map((b: string, i: number) => ({
                id: b.id || String(i), // Use actual ID if available
                title: b.title || b, // Use actual title if available, fallback to string
                description: b.description || '',
                icon: b.icon || '🏅',
                points: b.xpReward || 0,
              }))
            );
          } else {
            setAchievements(MOCK_ACHIEVEMENTS);
          }
        }

        // Map quests → activities feed
        if (Array.isArray(quests) && quests.length > 0) {
          setActivities(
            quests.map((q: Quest) => ({
              id: q.id,
              type: 'achievement' as const,
              title: q.title,
              description: q.description,
              date: new Date(),
            }))
          );
        } else {
          setActivities(MOCK_ACTIVITIES);
        }
      })
      .catch(() => {
        // API unreachable — fall back to mock data with demo banner
        setActivities(MOCK_ACTIVITIES);
        setAchievements(MOCK_ACHIEVEMENTS);
        setMetrics(MOCK_METRICS);
        setIsDemo(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const weeklyData = [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 6 },
    { day: 'Wed', count: 3 },
    { day: 'Thu', count: 8 },
    { day: 'Fri', count: 5 },
    { day: 'Sat', count: 2 },
    { day: 'Sun', count: 1 },
  ];
  const maxCount = Math.max(...weeklyData.map((d) => d.count));

  const maxCount = Math.max(...weeklyData.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="border-b border-[#1F1F1F] bg-[#0F0F0F] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">User Dashboard</h1>
              <p className="text-gray-400 mt-1">Track your engagement and achievements</p>
            </div>
            <button
              onClick={() => alert('Report exported!')}
              aria-label="Interactive element"
              onClick={() => setExportMessage('Report exported!')}
              className="flex items-center gap-2 px-4 py-2 bg-[#CC1111] text-white rounded-lg hover:bg-[#AA0E0E] transition-all"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
            {exportMessage && <span className="text-sm text-green-400">{exportMessage}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">
                Level {level}: {levelTitle}
              </span>
              <Award className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-white">{metrics.totalPoints} XP</div>
            {xpToNextLevel > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                {xpToNextLevel - metrics.totalPoints} XP to next level
              </div>
            )}
            <div className="w-full bg-[#2A2A2A] rounded-full h-1 mt-3">
              {/* Calculate progress dynamically */}
              <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} type="stat" />)
          ) : (
            <>
              <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Total Points</span>
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-white">{metrics.totalPoints}</div>
                <div className="text-xs text-green-500 mt-2">↑ 12% from last month</div>
              </div>

              <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Events Attended</span>
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-white">{metrics.eventsAttended}</div>
                <div className="text-xs text-gray-500 mt-2">Lifetime total</div>
              </div>

              <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Current Streak</span>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-white">{metrics.currentStreak} days</div>
                <div className="text-xs text-gray-500 mt-2">Best: {metrics.longestStreak} days</div>
              </div>

              <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Contributions</span>
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-white">{metrics.contributionsMade}</div>
                <div className="text-xs text-gray-500 mt-2">Posts + Comments</div>
              </div>
            </>
          )}
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">Weekly Activity</h3>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[#CC1111] rounded-t-lg transition-all hover:bg-[#DD2222]"
                  style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: '4px' }}
                  style={{
                    height: `${(item.count / maxCount) * 100}%`,
                    minHeight: '4px',
                  }}
                />
                <span className="text-xs text-gray-500">{item.day}</span>
                <span className="text-xs text-gray-400">{item.count}</span>
              </div>
            ))}
          </div>
          {loading ? (
            <div className="flex items-end gap-3 h-48">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="ns-skeleton w-full rounded-t-lg"
                    style={{ height: `${[40, 75, 120, 85, 140, 60, 100][idx % 7]}%` }}
                  />
                  <span className="text-xs text-gray-500">{day}</span>
                  <div className="ns-skeleton w-4 h-3 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {weeklyData.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-[#CC1111] rounded-t-lg transition-all hover:bg-[#DD2222]"
                    style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-500">{item.day}</span>
                  <span className="text-xs text-gray-400">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Timeline */}
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
            <div className="p-5 border-b border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
              <p className="text-sm text-gray-500 mt-1">Your recent actions</p>
            </div>
            <div className="divide-y divide-[#2A2A2A]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} type="timeline-row" />)
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-[#222222] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {activity.type === 'event_registration' && (
                          <Calendar className="h-5 w-5 text-blue-500" />
                        )}
                        {activity.type === 'comment' && (
                          <MessageSquare className="h-5 w-5 text-green-500" />
                        )}
                        {activity.type === 'achievement' && (
                          <Award className="h-5 w-5 text-yellow-500" />
                        )}
                        {activity.type === 'post' && <FileText className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{activity.title}</p>
                        <p className="text-sm text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
            <div className="p-5 border-b border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-white">Achievements</h3>
              <p className="text-sm text-gray-500 mt-1">Badges earned</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} type="achievement" />)
                ) : (
                  achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="text-center p-4 bg-[#222222] rounded-xl hover:bg-[#2A2A2A] transition-all"
                    >
                      <div className="flex justify-center mb-2 text-[#CC1111]">
                        {(() => {
                          const I = ACHIEVEMENT_ICONS[achievement.icon];
                          return I ? <I size={36} /> : null;
                        })()}
                      </div>
                      <p className="font-medium text-white text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                      <p className="text-xs text-[#CC1111] mt-2">{achievement.points} pts</p>
                    </div>
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="font-medium text-white text-sm">{achievement.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                    <p className="text-xs text-[#CC1111] mt-2">{achievement.points} pts</p>
                  </div>
                ))}
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Badges */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} type="achievement" />)}
          </div>
        ) : (
          <ProfileBadges badges={achievements} />
        )}

        {/* Profile Completion */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
              <p className="text-sm text-gray-500 mt-1">
                Complete your profile to unlock more features
              </p>
            </div>
            <div className="flex-1 max-w-md">
              {loading ? (
                <>
                  <div className="ns-skeleton w-full h-2 rounded-full" />
                  <div className="ns-skeleton w-12 h-3 mt-1 rounded float-right" />
                </>
              ) : (
                <>
                  <div className="w-full bg-[#2A2A2A] rounded-full h-2">
                    <div
                      className="bg-[#CC1111] rounded-full h-2 transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">{profileCompletion}% Complete</p>
                </>
              )}
            </div>
            <button
              aria-label="Interactive element"
              className="px-4 py-2 border border-[#CC1111] text-[#CC1111] rounded-lg hover:bg-[#CC1111] hover:text-white transition-all text-sm"
            >
              Complete Profile →
            </button>
            {loading ? (
              <div className="ns-skeleton w-32 h-10 rounded-lg" />
            ) : (
              <button className="px-4 py-2 border border-[#CC1111] text-[#CC1111] rounded-lg hover:bg-[#CC1111] hover:text-white transition-all text-sm">
                Complete Profile →
              </button>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <PrivacySettings />

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#2A2A2A] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-[#CC1111]" />
            <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
              <h4 className="font-medium text-white flex items-center gap-1">
                <Brain size={15} aria-hidden="true" /> AI Workshop
              </h4>
              <p className="text-sm text-gray-500 mt-1">Based on your interests</p>
              <button className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1">
              <h4 className="font-medium text-white">🤖 AI Workshop</h4>
              <p className="text-sm text-gray-500 mt-1">Based on your interests</p>
              <button
                aria-label="Interactive element"
                className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1"
              <div className="flex justify-between">
                <h4 className="font-medium text-white">📅 Host a Workshop</h4>
                {level < 3 && (
                  <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 rounded">
                    Lvl 3 Required
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Earn +200 XP for organizing.</p>
              <button
                disabled={level < 3}
                className={`mt-3 text-sm font-medium flex items-center gap-1 ${level < 3 ? 'text-gray-600' : 'text-[#CC1111]'}`}
              >
                Register <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
              <h4 className="font-medium text-white flex items-center gap-1">
                <FileText size={15} aria-hidden="true" /> Complete Profile
              </h4>
              <p className="text-sm text-gray-500 mt-1">Earn 50 bonus points</p>
              <button
                aria-label="Interactive element"
                className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1"
              >
                Complete <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
              <h4 className="font-medium text-white flex items-center gap-1">
                <Lightbulb size={15} aria-hidden="true" /> Share Feedback
              </h4>
              <p className="text-sm text-gray-500 mt-1">Help us improve</p>
              <button
                aria-label="Interactive element"
                className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1"
              >
                Share <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#222222] rounded-lg p-4 h-24 flex flex-col gap-2">
                  <div className="ns-skeleton w-32 h-5 rounded" />
                  <div className="ns-skeleton w-24 h-4 rounded" />
                  <div className="ns-skeleton w-16 h-4 rounded mt-auto" />
                </div>
              ))
            ) : (
              <>
                <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
                  <h4 className="font-medium text-white flex items-center gap-1">
                    <Brain size={15} aria-hidden="true" /> AI Workshop
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">Based on your interests</p>
                  <button className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1">
                    Register <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
                  <h4 className="font-medium text-white flex items-center gap-1">
                    <FileText size={15} aria-hidden="true" /> Complete Profile
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">Earn 50 bonus points</p>
                  <button className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1">
                    Complete <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
                  <h4 className="font-medium text-white flex items-center gap-1">
                    <Lightbulb size={15} aria-hidden="true" /> Share Feedback
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">Help us improve</p>
                  <button className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1">
                    Share <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
