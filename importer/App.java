java App

import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Array;
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
            "event_date,start_time,end_time,name,host,category,url," +
            "borough,location,description,source,cost,weekly" +
            ") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

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
                statement.setString(2, getString(row.getCell(1)));

                // 3. START TIME 
                LocalTime start = readTime(row.getCell(2));
                statement.setTime(3, start != null ? Time.valueOf(start) : null);

                // 4. END TIME 
                LocalTime end = readTime(row.getCell(3));
                statement.setTime(4, end != null ? Time.valueOf(end) : null);

                // 5. HOST
                statement.setString(5, getString(row.getCell(4)));

                // 6. CATEGORY 
                String[] categories =
                        getString(row.getCell(5)).split(",");

                Array categoryArray =
                        conn.createArrayOf("text", categories);

                statement.setArray(6, categoryArray);

                // 7. URL
                statement.setString(7, getString(row.getCell(6)));

                // 8. BOROUGH
                statement.setString(8, getString(row.getCell(7)));

                // 9. LOCATION
                statement.setString(9, getString(row.getCell(8)));

                // 10. DESCRIPTION
                statement.setString(10, getString(row.getCell(9)));

                // 11. SOURCE
                statement.setString(11, getString(row.getCell(10)));

                // 12. COST
                Cell costCell = row.getCell(11);
                if (costCell != null && costCell.getCellType() == CellType.NUMERIC) {
                    statement.setBigDecimal(
                            12,
                            BigDecimal.valueOf(costCell.getNumericCellValue())
                    );
                } else {
                    statement.setBigDecimal(12, BigDecimal.ZERO);
                }

                // 13. WEEKLY
                Cell weeklyCell = row.getCell(12);
                boolean weekly =
                        weeklyCell != null && weeklyCell.getBooleanCellValue();

                statement.setBoolean(13, weekly);

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

    private static LocalTime readTime(Cell cell) {
        if (cell == null) return null;

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getLocalDateTimeCellValue().toLocalTime();
            }

            String value = cell.getStringCellValue().trim();

            if (value.isEmpty()) return null;


            return LocalTime.parse(value);

        } catch (Exception e) {
            System.out.println("Invalid time format: " + cell);
            return null;
        }
    }


    private static String getString(Cell cell) {
        if (cell == null) return "";
        return cell.toString().trim();
    }
}