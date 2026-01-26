package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.Invoice;
import com.ev.ampora_backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice,String> {
}
