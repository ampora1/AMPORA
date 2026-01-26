package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.MessageRequestDto;
import com.ev.ampora_backend.dto.MessageResponseDto;
import com.ev.ampora_backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/message")
@RequiredArgsConstructor
public class MessageController {
    private  final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponseDto> createMessage(@RequestBody MessageRequestDto requestDto){
        return new ResponseEntity<>(messageService.sendMessage(requestDto), HttpStatus.CREATED);
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<MessageResponseDto> getMessageById(@PathVariable String messageId){
        return  new ResponseEntity<>(messageService.getMessageById(messageId),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<MessageResponseDto>> getAllMessages(){
        return new ResponseEntity<>(messageService.getAllMessages(), HttpStatus.OK);
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<MessageResponseDto> updateMessage(@PathVariable String messageId,@RequestBody MessageRequestDto requestDto){
        return new ResponseEntity<>(messageService.updateMessageById(messageId,requestDto), HttpStatus.OK);
    }

    @DeleteMapping("/{messageId}")
    public  ResponseEntity<Void> deleteById(@PathVariable String messageId){
        messageService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }

}
