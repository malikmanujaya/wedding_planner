package lk.weddingplanner.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-expiration-ms}") long accessExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
    }

    public String generateAccessToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessExpirationMs);
        return Jwts.builder()
                .subject(principal.getEmail())
                .claim("uid", principal.getId())
                .claim("name", principal.getFullName())
                .claim("typ", "access")
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token, UserPrincipal principal) {
        Claims claims = parseClaims(token);
        String email = claims.getSubject();
        String typ = claims.get("typ", String.class);
        return email.equalsIgnoreCase(principal.getEmail())
                && !"refresh".equals(typ)
                && claims.getExpiration().after(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
