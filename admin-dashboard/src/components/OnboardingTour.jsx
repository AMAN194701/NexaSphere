import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../hooks/useAuth';

export function OnboardingTour() {
  const { role, isOfflineMode } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // We only want to trigger this for admins.
    // If auth state gives role or if we assume anyone in dashboard is an admin.
    const isOffline = typeof isOfflineMode === 'function' ? isOfflineMode() : false;
    // In many apps, local storage is a good way to track if a user has seen the tour
    const tourKey = 'ns_admin_tour_completed';
    const tourCompleted = localStorage.getItem(tourKey);

    // Slight delay to ensure the dashboard renders completely before starting the tour
    if (!tourCompleted) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [role, isOfflineMode]);

  const steps = [
    {
      target: '.sidebar-nav',
      content:
        'Welcome to the NexaSphere Admin Dashboard! This is your main navigation hub where you can access all features.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.tour-event-creation',
      content: 'Click here to create new events, workshops, or activities for the community.',
      placement: 'bottom',
    },
    {
      target: '.tour-analytics-overview',
      content: 'Get a quick glance at platform engagement, check-ins, and active users right here.',
      placement: 'bottom',
    },
    {
      target: '.tour-command-palette',
      content:
        'Pro tip: Press Ctrl+K (or Cmd+K) anywhere to open the global command palette and jump to any page instantly!',
      placement: 'right',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('ns_admin_tour_completed', 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#cc1111', // NexaSphere accent color
          zIndex: 10000,
        },
        buttonClose: {
          display: 'none',
        },
      }}
      locale={{
        last: 'Finish Tour',
        skip: 'Skip',
      }}
    />
  );
}
