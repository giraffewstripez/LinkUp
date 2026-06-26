package your.package.name;

import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Properties;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;

public class App {

    public static void main(String[] args) {

        Properties properties = new Properties();

        try {
            InputStream input = App.class.getClassLoader()
                    .getResourceAsStream("application.properties");

            if (input == null) {
                System.out.println("Could not find application.properties");
                return;
            }

            properties.load(input);

            String url = properties.getProperty("db.url");
            String user = properties.getProperty("db.username");
            String password = properties.getProperty("db.password");

            Connection conn = DriverManager.getConnection(url, user, password);

            System.out.println("Connected to Neon!");

            String sql =
                    "INSERT INTO events (" +
                    "event_date," +
                    "name," +
                    "event_time," +
                    "host," +
                    "category," +
                    "url," +
                    "borough," +
                    "location," +
                    "description," +
                    "source," +
                    "cost," +
                    "weekly" +
                    ") VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";

            PreparedStatement statement = conn.prepareStatement(sql);
            Workbook workbook = WorkbookFactory.create(
                    new FileInputStream("events.xlsx"));
            Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {

            Row row = sheet.getRow(i);
            if (row == null) continue;

            // 1. DATE 
            LocalDate date =
                    row.getCell(0)
                    .getLocalDateTimeCellValue()
                    .toLocalDate();
            statement.setDate(1, Date.valueOf(date));

            // 2. NAME 
            statement.setString(2, row.getCell(1).getStringCellValue());

            // 3. START TIME 
            LocalTime start =
                    row.getCell(2)
                    .getLocalDateTimeCellValue()
                    .toLocalTime();
            statement.setTime(3, Time.valueOf(start));

            // 4. END TIME 
            LocalTime end =
                    row.getCell(3)
                    .getLocalDateTimeCellValue()
                    .toLocalTime();
            statement.setTime(4, Time.valueOf(end));

            // 5. HOST 
            statement.setString(5, row.getCell(4).getStringCellValue());

            // 6. CATEGORY 
            String[] categories =
                    row.getCell(5)
                    .getStringCellValue()
                    .split(",");

            Array categoryArray =
                    conn.createArrayOf("text", categories);

            statement.setArray(6, categoryArray);

            // 7. URL 
            statement.setString(7, row.getCell(6).getStringCellValue());

            // 8. BOROUGH 
            statement.setString(8, row.getCell(7).getStringCellValue());

            // 9. LOCATION 
            statement.setString(9, row.getCell(8).getStringCellValue());

            // 10. DESCRIPTION 
            statement.setString(10, row.getCell(9).getStringCellValue());

            // 11. SOURCE 
            statement.setString(11, row.getCell(10).getStringCellValue());

            // 12. COST 
            statement.setBigDecimal(
                    12,
                    BigDecimal.valueOf(
                            row.getCell(11).getNumericCellValue()
                    )
            );

            // 13. WEEKLY 
            statement.setBoolean(
                    13,
                    row.getCell(12).getBooleanCellValue()
            );

            statement.executeUpdate();
        }

            workbook.close();
            statement.close();
            conn.close();

            System.out.println("Import complete!");

        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}