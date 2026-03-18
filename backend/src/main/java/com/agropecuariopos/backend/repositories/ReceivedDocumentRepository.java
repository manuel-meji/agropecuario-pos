package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.ReceivedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceivedDocumentRepository extends JpaRepository<ReceivedDocument, Long> {

    Optional<ReceivedDocument> findByClave(String clave);

    boolean existsByClave(String clave);

    // Documentos pendientes de confirmación (para alertas y reminders)
    List<ReceivedDocument> findByEstadoConfirmacion(ReceivedDocument.EstadoConfirmacion estado);

    // Documentos de un período específico
    List<ReceivedDocument> findByFechaEmisionDocBetweenOrderByFechaEmisionDocDesc(
            LocalDateTime desde, LocalDateTime hasta);

    // Buscar por cédula del emisor (proveedor)
    List<ReceivedDocument> findByCedulaEmisorOrderByFechaEmisionDocDesc(String cedulaEmisor);

    // Todos los documentos ordenados por más reciente
    @Query("SELECT r FROM ReceivedDocument r ORDER BY r.fechaEmisionDoc DESC")
    List<ReceivedDocument> findAllOrderByFechaDesc();

    // Documentos pendientes con fecha anterior a un límite (para alertas de vencimiento)
    @Query("SELECT r FROM ReceivedDocument r WHERE r.estadoConfirmacion = 'PENDIENTE' AND r.fechaEmisionDoc < :limite")
    List<ReceivedDocument> findPendientesAntesDeDate(@Param("limite") LocalDateTime limite);

    // Por fecha de descarga (para exportaciones)
    @Query("SELECT r FROM ReceivedDocument r WHERE r.createdAt BETWEEN :desde AND :hasta ORDER BY r.createdAt DESC")
    List<ReceivedDocument> findByCreatedAtBetween(
            @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
