CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    name TEXT NOT NULL,
    host TEXT,
    category TEXT,
    url TEXT,
    borough TEXT,
    location TEXT,
    description TEXT,
    source TEXT,
    cost NUMERIC(10,2) DEFAULT 0,
    weekly BOOLEAN DEFAULT false
);
