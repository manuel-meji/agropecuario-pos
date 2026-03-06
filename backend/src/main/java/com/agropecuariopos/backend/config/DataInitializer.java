package com.agropecuariopos.backend.config;

import com.agropecuariopos.backend.models.Role;
import com.agropecuariopos.backend.models.User;
import com.agropecuariopos.backend.repositories.RoleRepository;
import com.agropecuariopos.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles if they don't exist
        for (Role.RoleEnum roleEnum : Role.RoleEnum.values()) {
            if (!roleRepository.findByName(roleEnum).isPresent()) {
                Role role = new Role();
                role.setName(roleEnum);
                roleRepository.save(role);
            }
        }

        // Ensure initial admin user exists and has correct password
        userRepository.findByUsername("admin").ifPresentOrElse(
                user -> {
                    // Update password if it exists to ensure we know it
                    user.setPassword(encoder.encode("admin123"));
                    if (user.getName() == null || user.getName().isBlank()) {
                        user.setName("Administrador");
                    }
                    userRepository.save(user);
                    System.out.println("Admin user password reset to: admin123");
                },
                () -> {
                    User admin = new User("admin", "Administrador", "admin@agropecuario.com", encoder.encode("admin123"));

                    Set<Role> roles = new HashSet<>();
                    Role adminRole = roleRepository.findByName(Role.RoleEnum.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(adminRole);

                    admin.setRoles(roles);
                    userRepository.save(admin);
                    System.out.println("Initial admin user created: admin / admin123");
                });
    }
}
