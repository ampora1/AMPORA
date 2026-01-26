package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.MessageRequestDto;
import com.ev.ampora_backend.dto.MessageResponseDto;
import com.ev.ampora_backend.entity.Message;
import com.ev.ampora_backend.entity.Role;
import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.repository.MessageRepository;
import com.ev.ampora_backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService{

    private  final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    public MessageResponseDto sendMessage(MessageRequestDto requestDto) {
        User sender = userRepository.findById(requestDto.getSenderId()).orElseThrow(() -> new EntityNotFoundException("Sender not found"));

        User receiver = userRepository.findById(requestDto.getReceiverId()).orElseThrow(() -> new EntityNotFoundException("Receiver not found"));

        if(!sender.getRole().equals(Role.OPERATOR)){
            throw new IllegalArgumentException("Only Operators Can Send Messages");
        }

        if(!receiver.getRole().equals(Role.ADMIN)){
            throw new IllegalArgumentException("Only Admin Can Receive Messages");
        }

        Message newMessage = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(requestDto.getContent())
                .subject(requestDto.getSubject())
                .build();

        Message savedMessage = messageRepository.save(newMessage);

        return mapToDto(savedMessage);
    }

    @Override
    public MessageResponseDto getMessageById(String messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(()-> new EntityNotFoundException("Message Not Found"));

        return mapToDto( message );
    }

    @Override
    public List<MessageResponseDto> getAllMessages() {
        List<Message> messageList = messageRepository.findAll();

        List<MessageResponseDto> messageResponseDtoList =new ArrayList<>();

        for (Message message:messageList){
            MessageResponseDto responseDto = mapToDto(message);

            messageResponseDtoList.add(responseDto);
        }
        return messageResponseDtoList;
    }

    @Override
    public MessageResponseDto updateMessageById(String messageId, MessageRequestDto requestDto) {
        Message existingMessage = messageRepository.findById(messageId)
                .orElseThrow(()->new EntityNotFoundException("Message not found."));

        existingMessage.setSubject(requestDto.getSubject());
        existingMessage.setContent(requestDto.getContent());

        Message updatedMessage = messageRepository.save(existingMessage);
        return mapToDto(updatedMessage) ;
    }

    @Override
    public void deleteMessage(String messageId) {
        messageRepository.deleteById(messageId);
    }

    private MessageResponseDto mapToDto(Message message){

        return MessageResponseDto.builder()
                .messageId(message.getMessageId())
                .subject(message.getSubject())
                .content(message.getContent())
                .senderName(message.getSender().getFullName())
                .receiverName(message.getReceiver().getFullName())
                .build();
    }
}
