package lk.weddingplanner.api.domain;

/** Built-in platform role codes (seeded). Custom roles use other codes. */
public final class SystemRoles {
    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    public static final String ADMIN = "ADMIN";
    public static final String USER = "USER";
    public static final String VENDOR = "VENDOR";

    private SystemRoles() {}

    public static boolean isAdminLike(String code) {
        return SUPER_ADMIN.equals(code) || ADMIN.equals(code);
    }
}
