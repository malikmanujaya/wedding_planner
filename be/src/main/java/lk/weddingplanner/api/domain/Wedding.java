package lk.weddingplanner.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "weddings")
@Getter
@Setter
@NoArgsConstructor
public class Wedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    private LocalDate weddingDate;

    @Column(length = 255)
    private String venue;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
