package com.events.service;

import com.events.model.Event;
import com.events.repository.EventRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.annotation.PostConstruct;

@Service
public class ExcelImportService {

    @Autowired
    private EventRepository eventRepository;

    @PostConstruct
    public void init() {
        System.out.println("ExcelImportService initialized");
    }

    public List<Event> importExcel(InputStream is) {
        List<Event> events = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip header row
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row row = rows.next();

                Event event = new Event();

                event.setTitle(getCellValueAsString(row.getCell(0)));
                event.setDescription(getCellValueAsString(row.getCell(1)));
                event.setLocation(getCellValueAsString(row.getCell(2)));

                event.setStartTime(getCellValueAsDate(row.getCell(3)));
                event.setEndTime(getCellValueAsDate(row.getCell(4)));

                events.add(event);
            }

            eventRepository.saveAll(events);

        } catch (Exception e) {
            throw new RuntimeException("Failed to import Excel file", e);
        }

        return events;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;

        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue();
    }

    private LocalDateTime getCellValueAsDate(Cell cell) {
        if (cell == null) return null;

        if (DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        }

        return null;
    }
}