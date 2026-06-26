package com.events.controller;

import com.events.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository repo;

    @GetMapping("/events")
    public List<?> getEvents() {
        return repo.findAll();
    }
}