package com.skillmatch.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Oferta que un estudiante guardo como favorita.
 * Un usuario no puede guardar la misma oferta dos veces (restriccion unica).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ofertas_guardadas",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "oferta_laboral_id"}))
public class OfertaGuardada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oferta_laboral_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private OfertaLaboral ofertaLaboral;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
