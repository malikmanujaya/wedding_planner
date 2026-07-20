package lk.weddingplanner.api.upload.dto;

public record UploadResponse(String id, String url, String contentType, long sizeBytes, String originalFilename) {}
