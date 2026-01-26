package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.InvoiceDto;

import java.util.List;

public interface InvoiceService {
    InvoiceDto createInvoice(InvoiceDto dto);
    InvoiceDto updateInvoice(String id,InvoiceDto dto);
    List<InvoiceDto> getAllInvoice();
    InvoiceDto getInvoiceByID(String id);
    void  deleteInvoice(String id);

}
