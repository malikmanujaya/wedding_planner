package lk.weddingplanner.api;

import lk.weddingplanner.api.config.EarlySchemaFixListener;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ApiApplication.class);
        app.addListeners(new EarlySchemaFixListener());
        app.run(args);
    }
}
