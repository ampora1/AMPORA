package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.InvoiceDto;
import com.ev.ampora_backend.entity.Invoice;
import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.exception.GlobalExceptionHandler;
import com.ev.ampora_backend.repository.InvoiceRepository;
import com.ev.ampora_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.ev.ampora_backend.service.InvoiceService;


import java.util.List;

@Service
@RequiredArgsConstructor

public class InvoiceServiceImpl implements  InvoiceService {
    private final InvoiceRepository invoiceRepo;
    private final UserRepository userRepo;

    @Override
    public InvoiceDto createInvoice(InvoiceDto dto) {
        User user = userRepo.findById(dto.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
        Invoice invoice = Invoice.builder().user(user).date(dto.getDate()).totalKwh(dto.getTotalKwh()).amount(dto.getAmount()).paid(dto.isPaid()).build();
        Invoice saved= invoiceRepo.save(invoice);
        dto.setInvoiceId(saved.getInvoiceId());

        return dto;
    }

    @Override
    public InvoiceDto updateInvoice(String id, InvoiceDto dto) {
       Invoice invoice= invoiceRepo.findById(id).orElseThrow(() -> new RuntimeException("invoice not found"));
       User user=userRepo.findById(dto.getUserId()).orElseThrow(() ->  new RuntimeException("User not found"));
       invoice.setInvoiceId(id);
       invoice.setUser(user);
       invoice.setDate(dto.getDate());
       invoice.setTotalKwh(dto.getTotalKwh());
       invoice.setAmount(dto.getAmount());
       invoice.setPaid(dto.isPaid());
       Invoice saved= invoiceRepo.save(invoice);
       dto.setInvoiceId(saved.getInvoiceId());
       return  dto;
    }

    @Override
    public List<InvoiceDto> getAllInvoice() {
        return invoiceRepo.findAll().stream().map(i ->InvoiceDto.builder().invoiceId(i.getInvoiceId()).userId(i.getUser().getUserId()).date(i.getDate()).totalKwh(i.getTotalKwh()).amount(i.getAmount()).paid(i.isPaid()).build() ).toList();

    }

    @Override
    public InvoiceDto getInvoiceByID(String id) {
        Invoice i = invoiceRepo.findById(id).orElseThrow(() -> new RuntimeException("invoice not found"));
        return InvoiceDto.builder().invoiceId(i.getInvoiceId()).userId(i.getUser().getUserId()).date(i.getDate()).totalKwh(i.getTotalKwh()).amount(i.getAmount()).paid(i.isPaid()).build();
    }

    @Override
    public void deleteInvoice(String id) {
      invoiceRepo.deleteById(id);
    }
}
