package lk.weddingplanner.api.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;

/**
 * Applies H2 column fixes before Hibernate ddl-auto runs. Adding a NOT NULL column
 * to a non-empty table fails without a default; Hibernate does not supply one.
 */
public class EarlySchemaFixListener implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    private static final Logger log = LoggerFactory.getLogger(EarlySchemaFixListener.class);

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        Environment env = event.getEnvironment();
        String url = env.getProperty("spring.datasource.url");
        if (url == null || !url.contains("jdbc:h2:")) {
            return;
        }
        String username = env.getProperty("spring.datasource.username", "sa");
        String password = env.getProperty("spring.datasource.password", "");

        try {
            Class.forName("org.h2.Driver");
        } catch (ClassNotFoundException e) {
            return;
        }

        try (Connection connection = DriverManager.getConnection(url, username, password);
                Statement statement = connection.createStatement()) {
            ensureBooleanColumn(statement, "USERS", "ACTIVE", true);
            softenColumnNullability(statement, "USERS", "GLOBAL_ROLE");
        } catch (Exception ex) {
            // Fresh DB has no USERS table yet — Hibernate will create it.
            log.debug("Early schema fix skipped: {}", ex.getMessage());
        }
    }

    private void ensureBooleanColumn(
            Statement statement, String table, String column, boolean defaultValue) throws Exception {
        if (columnExists(statement, table, column)) {
            return;
        }
        String def = defaultValue ? "TRUE" : "FALSE";
        statement.execute(
                "ALTER TABLE "
                        + table
                        + " ADD COLUMN "
                        + column
                        + " BOOLEAN DEFAULT "
                        + def
                        + " NOT NULL");
        log.info("Added {}.{} with default {}", table, column, def);
    }

    private void softenColumnNullability(Statement statement, String table, String column)
            throws Exception {
        if (!columnExists(statement, table, column)) {
            return;
        }
        try {
            statement.execute("ALTER TABLE " + table + " ALTER COLUMN " + column + " SET NULL");
        } catch (Exception ignored) {
            // Already nullable or unsupported.
        }
    }

    private boolean columnExists(Statement statement, String table, String column) throws Exception {
        try (ResultSet rs =
                statement.executeQuery(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE"
                                + " UPPER(TABLE_NAME) = '"
                                + table
                                + "' AND UPPER(COLUMN_NAME) = '"
                                + column
                                + "'")) {
            rs.next();
            return rs.getInt(1) > 0;
        }
    }
}
