import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Navbar from '../shared/Navbar';
import ProjectsPage from '../pages/projects/ProjectsPage';
import EventsPage from '../pages/events/EventsPage';
import HistorySearchBar from '../components/history/SearchBar';
import { BookmarkProvider } from '../context/BookmarkContext';
import { searchPrompts } from '../lib/promptStore';

vi.mock('../components/NotificationBell', () => ({
  default: () => <button type="button" aria-label="Notifications" />,
}));

vi.mock('../components/common/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button" aria-label="Toggle Theme" />,
}));

vi.mock('../lib/promptStore', () => ({
  searchPrompts: vi.fn(),
}));

describe('ARIA state and control relationships', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('links bookmark toggle buttons to the bookmarks drawer state', () => {
    const onToggleBookmarks = vi.fn();

    render(
      <Navbar
        activeTab="Home"
        onTabChange={vi.fn()}
        onApply={vi.fn()}
        onJoin={vi.fn()}
        bookmarksOpen
        onToggleBookmarks={onToggleBookmarks}
      />
    );

    const bookmarkButtons = screen.getAllByRole('button', { name: /close bookmarks/i });
    expect(bookmarkButtons.length).toBeGreaterThan(0);

    bookmarkButtons.forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-controls', 'bookmarks-drawer');
    });

    fireEvent.click(bookmarkButtons[0]);
    expect(onToggleBookmarks).toHaveBeenCalledTimes(1);
  });

  it('links project category tabs to the filtered project panel', () => {
    render(<ProjectsPage onBack={vi.fn()} />);

    const allTab = screen.getByRole('tab', { name: 'All' });
    const panel = screen.getByRole('tabpanel', { name: /all projects/i });
    expect(allTab).toHaveAttribute('aria-controls', panel.id);
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: 'Mobile' }));

    expect(screen.getByRole('tab', { name: 'Mobile' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: /mobile projects/i })).toHaveAttribute(
      'id',
      panel.id
    );
  });

  it('links event view tabs to the active event view panel', () => {
    const events = [
      {
        id: 'event-1',
        name: 'NexaSphere Launch',
        date: 'May 26, 2026',
        description: 'Community launch event',
        status: 'completed',
        icon: 'Calendar',
        tags: ['Community'],
      },
    ];

    render(
      <BookmarkProvider>
        <EventsPage events={events} onBack={vi.fn()} onEventClick={vi.fn()} />
      </BookmarkProvider>
    );

    const listTab = screen.getByRole('tab', { name: /list view/i });
    const panel = screen.getByRole('tabpanel', { name: /list events/i });
    expect(listTab).toHaveAttribute('aria-controls', panel.id);
    expect(listTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: /calendar view/i }));

    expect(screen.getByRole('tab', { name: /calendar view/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tabpanel', { name: /calendar events/i })).toHaveAttribute(
      'id',
      panel.id
    );
  });

  it('exposes conversation search results through combobox ARIA state', async () => {
    vi.mocked(searchPrompts).mockResolvedValue([
      {
        id: 'prompt-1',
        userPrompt: 'React roadmap',
        botResponse: 'Start with components and state.',
      },
    ]);

    render(<HistorySearchBar onSelectPrompt={vi.fn()} workspace="default" />);

    const input = screen.getByRole('combobox', { name: /search conversation history/i });
    expect(input).toHaveAttribute('aria-expanded', 'false');

    fireEvent.change(input, { target: { value: 'react' } });

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    const listbox = screen.getByRole('listbox');
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    expect(screen.getByRole('option', { name: /react roadmap/i })).toBeInTheDocument();
  });
});
