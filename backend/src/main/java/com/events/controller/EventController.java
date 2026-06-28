package com.events.controller;

import com.events.model.Event;
import com.events.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository repo;

    @GetMapping("/events")
    public List<Event> getEvents() {
        return repo.findAll();
    }

    @GetMapping("/")
    public String home() {
        return "LinkUp backend is running. Try /events";
    }
}
