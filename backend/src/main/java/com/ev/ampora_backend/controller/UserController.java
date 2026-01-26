package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.UserDTO;
import com.ev.ampora_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/userss")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }


    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @GetMapping("/search")
    public List<UserDTO> search(@RequestParam String name) {
        return userService.getUserByName(name);
    }


//    @PutMapping("/{id}")
//    public ResponseEntity<UserDTO> updateUser(
//            @PathVariable Long id,
//            @RequestBody UserDTO userDto
//    ) {
//        return ResponseEntity.ok(userService.updateUser(id, userDto));
//    }

    @PutMapping("/{id}")
    public UserDTO updateUser(@PathVariable String id, @RequestBody UserDTO userDTO) {
        return  userService.updateUser(id, userDTO);

    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }


}
