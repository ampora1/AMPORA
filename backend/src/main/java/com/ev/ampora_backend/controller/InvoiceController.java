package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.InvoiceDto;
import com.ev.ampora_backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoice")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @PostMapping
    public  ResponseEntity<InvoiceDto> createInvoice(@RequestBody InvoiceDto dto){
       return ResponseEntity.ok(invoiceService.createInvoice(dto));
    }

    @PutMapping("/{id}")
    public  ResponseEntity<InvoiceDto> updateInvoice(@PathVariable String id,@RequestBody InvoiceDto dto){
        return  ResponseEntity.ok(invoiceService.updateInvoice(id,dto));
    }

    @GetMapping
    public  ResponseEntity<List<InvoiceDto>> getAllInvoices(){
        return ResponseEntity.ok(invoiceService.getAllInvoice());
    }

    @GetMapping("/{id}")
    public  ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable String id){
        return ResponseEntity.ok(invoiceService.getInvoiceByID(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteInvoice(@PathVariable String id){
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok("Deleted Successfully");
    }
}
