package com.events.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import java.io.FileInputStream;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class ImportEvents {
    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.out.println("Usage: mvn exec:java -Dexec.mainClass=com.events.service.ImportEvents -Dexec.args=\"../events.xlsx\"");
            return;
        }

        String url = System.getenv("DATABASE_URL");
        String user = System.getenv("DATABASE_USERNAME");
        String password = System.getenv("DATABASE_PASSWORD");

        if (url == null || user == null || password == null) {
            System.out.println("Set DATABASE_URL, DATABASE_USERNAME, and DATABASE_PASSWORD first.");
            return;
        }

        if (!url.startsWith("jdbc:postgresql://")) {
            System.out.println("DATABASE_URL must start with jdbc:postgresql://");
            System.out.println("Example: jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require");
            return;
        }

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            createTable(conn);
            clearTable(conn);
            int count = importFile(conn, args[0]);
            System.out.println("Import complete. Rows inserted: " + count);
        }
    }

    private static void createTable(Connection conn) throws SQLException {
        String sql = "CREATE TABLE IF NOT EXISTS events (" +
                "id BIGSERIAL PRIMARY KEY," +
                "event_date DATE NOT NULL," +
                "start_time TIME," +
                "end_time TIME," +
                "name TEXT NOT NULL," +
                "host TEXT," +
                "category TEXT," +
                "url TEXT," +
                "borough TEXT," +
                "location TEXT," +
                "description TEXT," +
                "source TEXT," +
                "cost NUMERIC(10,2) DEFAULT 0," +
                "weekly BOOLEAN DEFAULT false" +
                ")";
        try (Statement statement = conn.createStatement()) {
            statement.execute(sql);
        }
    }

    private static void clearTable(Connection conn) throws SQLException {
        try (Statement statement = conn.createStatement()) {
            statement.executeUpdate("TRUNCATE TABLE events RESTART IDENTITY");
        }
    }

    private static int importFile(Connection conn, String filePath) throws Exception {
        String insert = "INSERT INTO events (event_date,start_time,end_time,name,host,category,url,borough,location,description,source,cost,weekly) " +
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

        try (Workbook workbook = WorkbookFactory.create(new FileInputStream(filePath));
             PreparedStatement ps = conn.prepareStatement(insert)) {
            Sheet sheet = workbook.getSheetAt(0);
            validateHeader(sheet.getRow(0));
            int inserted = 0;

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isBlank(row.getCell(0)) || isBlank(row.getCell(1))) continue;

                ps.setDate(1, Date.valueOf(readDate(row.getCell(0))));
                setNullableTime(ps, 2, readTime(row.getCell(2)));
                setNullableTime(ps, 3, readTime(row.getCell(3)));
                ps.setString(4, getString(row.getCell(1)));
                ps.setString(5, getString(row.getCell(4)));
                ps.setString(6, getString(row.getCell(5)));
                ps.setString(7, getString(row.getCell(6)));
                ps.setString(8, getString(row.getCell(7)));
                ps.setString(9, getString(row.getCell(8)));
                ps.setString(10, getString(row.getCell(9)));
                ps.setString(11, getString(row.getCell(10)));
                ps.setBigDecimal(12, readMoney(row.getCell(11)));
                ps.setBoolean(13, readBoolean(row.getCell(12)));
                ps.executeUpdate();
                inserted++;
            }
            return inserted;
        }
    }

    private static void validateHeader(Row header) {
        if (header == null) throw new IllegalArgumentException("Spreadsheet is missing a header row.");

        String[] expected = {"event_date", "name", "start_time", "end_time", "host", "category", "url", "borough", "location", "description", "source", "cost", "weekly"};
        for (int i = 0; i < expected.length; i++) {
            String found = normalizeHeader(getString(header.getCell(i)));
            if (!found.equals(expected[i])) {
                throw new IllegalArgumentException("Unexpected spreadsheet header in column " + (i + 1) + ". Expected " + expected[i] + " but found " + getString(header.getCell(i)));
            }
        }
    }

    private static String normalizeHeader(String value) {
        return value.trim().toLowerCase().replace(" ", "_");
    }

    private static LocalDate readDate(Cell cell) {
        if (cell == null) throw new IllegalArgumentException("Date cell is blank.");
        if (cell.getCellType() == CellType.NUMERIC) return cell.getLocalDateTimeCellValue().toLocalDate();
        return LocalDate.parse(getString(cell));
    }

    private static LocalTime readTime(Cell cell) {
        if (isBlank(cell)) return null;
        if (cell.getCellType() == CellType.NUMERIC) return cell.getLocalDateTimeCellValue().toLocalTime();

        String value = getString(cell).toUpperCase().replace(".", "").trim();
        if (value.isEmpty()) return null;

        DateTimeFormatter[] formats = new DateTimeFormatter[] {
                DateTimeFormatter.ofPattern("H:mm"),
                DateTimeFormatter.ofPattern("HH:mm"),
                DateTimeFormatter.ofPattern("h:mm a"),
                DateTimeFormatter.ofPattern("h a")
        };
        for (DateTimeFormatter format : formats) {
            try {
                return LocalTime.parse(value, format);
            } catch (Exception ignored) { }
        }
        return null;
    }

    private static BigDecimal readMoney(Cell cell) {
        if (isBlank(cell)) return BigDecimal.ZERO;
        if (cell.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(cell.getNumericCellValue());

        String value = getString(cell).replace("$", "").replace(",", "").trim();
        if (value.equalsIgnoreCase("free") || value.equalsIgnoreCase("n/a") || value.isEmpty()) return BigDecimal.ZERO;

        try {
            return new BigDecimal(value);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private static boolean readBoolean(Cell cell) {
        if (isBlank(cell)) return false;
        if (cell.getCellType() == CellType.BOOLEAN) return cell.getBooleanCellValue();
        String value = getString(cell).toLowerCase();
        return value.equals("true") || value.equals("yes") || value.equals("y") || value.equals("weekly") || value.equals("1");
    }

    private static void setNullableTime(PreparedStatement ps, int index, LocalTime value) throws SQLException {
        if (value == null) ps.setNull(index, Types.TIME);
        else ps.setTime(index, Time.valueOf(value));
    }

    private static boolean isBlank(Cell cell) {
        return cell == null || cell.getCellType() == CellType.BLANK || getString(cell).isEmpty();
    }

    private static String getString(Cell cell) {
        if (cell == null) return "";
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }
}
