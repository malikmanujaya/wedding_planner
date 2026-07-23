package lk.weddingplanner.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Stable machine code, e.g. SUPER_ADMIN, USER, or CUSTOM_SALES. */
    @Column(nullable = false, unique = true, length = 60)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    /** System roles are seeded and cannot be deleted or have their code changed. */
    @Column(nullable = false)
    private boolean systemRole = false;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
