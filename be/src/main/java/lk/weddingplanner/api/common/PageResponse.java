package lk.weddingplanner.api.common;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages) {

    public static <T> PageResponse<T> of(List<T> all, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 1);
        long total = all.size();
        int totalPages = total == 0 ? 1 : (int) Math.ceil((double) total / safeSize);
        if (safePage > totalPages) {
            safePage = totalPages;
        }
        int from = (safePage - 1) * safeSize;
        List<T> content =
                from >= all.size() ? List.of() : all.subList(from, Math.min(from + safeSize, all.size()));
        return new PageResponse<>(List.copyOf(content), safePage, safeSize, total, totalPages);
    }

    /** Full list as a single page (for callers that need every row). */
    public static <T> PageResponse<T> all(List<T> all) {
        int total = all.size();
        int size = Math.max(total, 1);
        return new PageResponse<>(List.copyOf(all), 1, size, total, 1);
    }
}
