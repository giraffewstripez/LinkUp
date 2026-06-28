package com.events.repository;

import com.events.model.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Time;
import java.util.List;

@Repository
public class EventRepository {

    @Autowired
    private JdbcTemplate jdbc;

    public List<Event> findAll() {
        return jdbc.query(
            "SELECT * FROM events ORDER BY event_date, start_time NULLS LAST, id",
            (rs, rowNum) -> {
                Event e = new Event();
                Time start = rs.getTime("start_time");
                Time end = rs.getTime("end_time");

                e.id = rs.getLong("id");
                e.eventDate = rs.getDate("event_date").toLocalDate();
                e.startTime = start == null ? null : start.toLocalTime();
                e.endTime = end == null ? null : end.toLocalTime();
                e.name = rs.getString("name");
                e.host = rs.getString("host");
                e.category = rs.getString("category");
                e.url = rs.getString("url");
                e.borough = rs.getString("borough");
                e.location = rs.getString("location");
                e.description = rs.getString("description");
                e.source = rs.getString("source");
                e.cost = rs.getDouble("cost");
                e.weekly = rs.getBoolean("weekly");
                return e;
            }
        );
    }
}
