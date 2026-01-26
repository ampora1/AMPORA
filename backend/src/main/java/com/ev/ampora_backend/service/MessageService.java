package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.MessageRequestDto;
import com.ev.ampora_backend.dto.MessageResponseDto;

import java.util.List;

public interface MessageService {
    MessageResponseDto sendMessage(MessageRequestDto requestDto);
    MessageResponseDto getMessageById(String messageId);
    List<MessageResponseDto> getAllMessages();
    MessageResponseDto updateMessageById(String messageId, MessageRequestDto requestDto);
    void deleteMessage(String messageId);
}
