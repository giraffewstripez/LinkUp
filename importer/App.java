import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import java.io.FileInputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;

public class App {

    public static void main(String[] args) {

        try {

            Workbook workbook = WorkbookFactory.create(
                    new FileInputStream("../events.xlsx"));

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) continue;

                String json =
                    "{" +
                    "\"eventDate\":\"" + get(row,0) + "\"," +
                    "\"name\":\"" + get(row,1) + "\"," +
                    "\"startTime\":\"" + get(row,2) + "\"," +
                    "\"endTime\":\"" + get(row,3) + "\"," +
                    "\"host\":\"" + get(row,4) + "\"," +
                    "\"category\":\"" + get(row,5) + "\"," +
                    "\"url\":\"" + get(row,6) + "\"," +
                    "\"borough\":\"" + get(row,7) + "\"," +
                    "\"location\":\"" + get(row,8) + "\"," +
                    "\"description\":\"" + get(row,9) + "\"," +
                    "\"source\":\"" + get(row,10) + "\"," +
                    "\"cost\":0," +
                    "\"weekly\":false" +
                    "}";

                send(json);
            }

            workbook.close();

            System.out.println("IMPORT COMPLETE");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    static String get(Row row, int i) {
        try {
            return row.getCell(i).toString();
        } catch (Exception e) {
            return "";
        }
    }

    static void send(String json) throws Exception {

        URL url = new URL("http://localhost:8080/events");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        OutputStream os = conn.getOutputStream();
        os.write(json.getBytes());
        os.flush();
        os.close();

        conn.getResponseCode();
        conn.disconnect();
    }
}