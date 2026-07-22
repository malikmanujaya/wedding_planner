package lk.weddingplanner.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One thank-you card design per wedding, sent to guests after the event. */
@Entity
@Table(name = "thank_you_cards")
@Getter
@Setter
@NoArgsConstructor
public class ThankYouCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wedding_id", nullable = false, unique = true)
    private Wedding wedding;

    /** FE template identifier, e.g. classic / botanical / elegant / minimal. */
    @Column(nullable = false, length = 40)
    private String templateKey = "classic";

    /** Supports the {name} placeholder for the guest name. */
    @Column(nullable = false, length = 2000)
    private String message;

    @Column(length = 160)
    private String signature;

    /** Optional photo shown on the card. */
    @Column(length = 500)
    private String imageUrl;

    /** Optional full card design from the photographer (shared by all guests). */
    @Column(length = 500)
    private String designedCardUrl;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
