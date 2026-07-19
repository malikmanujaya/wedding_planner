package lk.weddingplanner.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "seating_plans",
        uniqueConstraints = @UniqueConstraint(columnNames = "wedding_id"))
@Getter
@Setter
@NoArgsConstructor
public class SeatingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wedding_id", nullable = false)
    private Wedding wedding;

    @Lob
    @Column(nullable = false)
    private String planJson;

    @Column(nullable = false)
    private int version = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
