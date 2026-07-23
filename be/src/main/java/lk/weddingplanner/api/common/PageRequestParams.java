package lk.weddingplanner.api.common;

public record PageRequestParams(int page, int size, boolean paged) {

    public static PageRequestParams of(Integer page, Integer size) {
        if (page == null && size == null) {
            return new PageRequestParams(1, 0, false);
        }
        int safePage = page == null ? 1 : Math.max(page, 1);
        int safeSize = size == null ? 10 : Math.min(Math.max(size, 1), 100);
        return new PageRequestParams(safePage, safeSize, true);
    }

    public <T> PageResponse<T> paginate(java.util.List<T> all) {
        if (!paged) {
            return PageResponse.all(all);
        }
        return PageResponse.of(all, page, size);
    }
}
