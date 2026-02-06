import { useState, useEffect } from 'react';

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/events');
                if (!response.ok) throw new Error('Failed to fetch events');
                const data = await response.json();
                const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setEvents(sortedData);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const getUpcomingEvents = (limit = 3) => {
        return events
            .filter(event => new Date(event.date) >= new Date())
            .slice(0, limit);
    };

    return {
        events,
        loading,
        error,
        getUpcomingEvents
    };
};
