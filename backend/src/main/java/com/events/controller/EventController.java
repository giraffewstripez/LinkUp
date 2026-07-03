package com.events.controller;

import com.events.model.Event;
import com.events.repository.EventRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository repo;

    public EventController(EventRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/")
    public String home() {
        return "LinkUp backend is running. Try /events";
    }

    @GetMapping("/events")
    public List<Event> getEvents() {
        return repo.findAll();
    }
}