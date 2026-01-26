package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message , String> {

    Optional<Message> findByMessageId(String messageId);
}
