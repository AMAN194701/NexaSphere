import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import ShareHub from './ShareHub';
import { useWalkthroughStep } from '../hooks/useWalkthroughStep';

const EventCard = React.memo(function EventCard({ event, onClick, id, isFirstForWalkthrough }) {
  const [shareOpen, setShareOpen] = useState(false);
  const ref = useWalkthroughStep(isFirstForWalkthrough ? 'register_event' : null);

  function handleShareClick(e) {
    e.stopPropagation(); // don't trigger the card's onClick
    setShareOpen(true);
  }

  return (
    <>
      <div
        ref={ref}
        className="event-card"
        onClick={() => onClick(id)}
        style={{ cursor: 'pointer' }}
      >
        <h3>{event.title}</h3>
        <p>{event.date}</p>
        <div
          className="event-description-html"
          style={{
            fontSize: '0.9rem',
            marginBottom: '8px',
            color: 'var(--text2)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description || '') }}
        />
        {event.location && <p>{event.location}</p>}
        {event.category && <span className="event-category">{event.category}</span>}
        <button
          className="event-share-btn"
          onClick={handleShareClick}
          aria-label={`Share ${event.title}`}
        >
          Share
        </button>
      </div>

      <ShareHub
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        data={{
          title: event.title,
          subtitle: event.date,
          url: `${window.location.origin}/events/${id}`,
          image: event.image || null,
        }}
      />
    </>
  );
});

export default EventCard;
