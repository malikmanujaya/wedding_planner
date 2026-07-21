package lk.weddingplanner.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "gift_items")
@Getter
@Setter
@NoArgsConstructor
public class GiftItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wedding_id", nullable = false)
    private Wedding wedding;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 500)
    private String storeUrl;

    @Column(precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(nullable = false, length = 8)
    private String currency = "LKR";

    @Column(nullable = false)
    private int quantityDesired = 1;

    @Column(nullable = false)
    private int quantityClaimed = 0;

    @Column(nullable = false)
    private int sortOrder = 0;

    @Column(nullable = false)
    private boolean publicVisible = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
