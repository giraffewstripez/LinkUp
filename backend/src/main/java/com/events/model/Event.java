package com.events.model;

import java.time.LocalDate;
import java.time.LocalTime;

public class Event {

    public Long id;

    public LocalDate eventDate;
    public LocalTime startTime;
    public LocalTime endTime;

    public String name;
    public String host;
    public String category;
    public String url;
    public String borough;
    public String location;
    public String description;
    public String source;

    public double cost;
    public boolean weekly;
}