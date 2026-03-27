package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.JwtResponse;
import com.agropecuariopos.backend.dto.LoginRequest;
import com.agropecuariopos.backend.dto.SignupRequest;
import com.agropecuariopos.backend.dto.UpdateProfileRequest;
import com.agropecuariopos.backend.models.Role;
import com.agropecuariopos.backend.models.User;
import com.agropecuariopos.backend.repositories.RoleRepository;
import com.agropecuariopos.backend.repositories.UserRepository;
import com.agropecuariopos.backend.security.UserDetailsImpl;
import com.agropecuariopos.backend.security.jwt.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired(required = false)
    JavaMailSender emailSender;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getName(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getName(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(Role.RoleEnum.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(Role.RoleEnum.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(Role.RoleEnum.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(Role.RoleEnum.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
             return ResponseEntity.status(401).body("Error: Usuario no autenticado.");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("Error: User is not found."));

        // Verify current password
        if (request.getCurrentPassword() == null || !encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Error: Contraseña actual incorrecta.");
        }

        boolean updated = false;

        // Update username if provided and different
        if (request.getNewUsername() != null && !request.getNewUsername().isEmpty() && !request.getNewUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getNewUsername())) {
                return ResponseEntity.badRequest().body("Error: El nombre de usuario ya está en uso.");
            }
            user.setUsername(request.getNewUsername());
            updated = true;
        }

        // Update email if provided
        if (request.getNewEmail() != null && !request.getNewEmail().isEmpty() && !request.getNewEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getNewEmail())) {
                return ResponseEntity.badRequest().body("Error: El correo electrónico ya está en uso.");
            }
            user.setEmail(request.getNewEmail());
            updated = true;
        }

        // Update password if provided
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            user.setPassword(encoder.encode(request.getNewPassword()));
            updated = true;
        }

        if (updated) {
            userRepository.save(user);
        }

        return ResponseEntity.ok("Perfil actualizado exitosamente. Por favor inicie sesión nuevamente.");
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body("Error: Usuario no autenticado");
        }
        return ResponseEntity.ok("Token es válido.");
    }

    public static class ForgotPasswordRequest {
        public String email;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.email == null || request.email.isEmpty()) {
            return ResponseEntity.badRequest().body("El correo electrónico es requerido.");
        }

        User user = null;
        List<User> users = userRepository.findAll();
        for (User u : users) {
             if (request.email.equalsIgnoreCase(u.getEmail())) {
                  user = u;
                  break;
             }
        }

        if (user == null) {
            return ResponseEntity.badRequest().body("No se encontró ningún usuario con ese correo electrónico.");
        }

        String randomPassword = generateRandomPassword(10);
        user.setPassword(encoder.encode(randomPassword));
        userRepository.save(user);

        if (emailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setSubject("Recuperación de Contraseña - Agropecuario POS");
                message.setText("Hola " + user.getName() + ",\n\nTu nueva contraseña temporal para acceder al sistema es: " + randomPassword + "\n\nPor favor, ingresa al sistema y cámbiala lo antes posible desde la sección de Configuraciones > Mi Perfil.\n\nSaludos.");
                emailSender.send(message);
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Se generó la contraseña pero ocurrió un error al enviar el correo: " + e.getMessage());
            }
        } else {
             return ResponseEntity.status(500).body("Error: El servicio de correos no está configurado, pero la nueva contraseña es: " + randomPassword);
        }

        return ResponseEntity.ok("Nueva contraseña enviada exitosamente.");
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder sb = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        for (int i=0; i < length; i++) {
             sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
