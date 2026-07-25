package com.nexasphere.controller;

import com.nexasphere.model.MembershipRequest;
import com.nexasphere.service.RateLimiterService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
public class MembershipController {

    private final RateLimiterService rateLimiterService;

    public MembershipController(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/membership")
    public ResponseEntity<?> submitMembership(
            @Valid @RequestBody MembershipRequest request,
            HttpServletRequest httpRequest
    ) {

        String ip = httpRequest.getRemoteAddr();
        Bucket bucket = rateLimiterService.resolveBucket(ip);

        if (!bucket.tryConsume(1)) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Too many requests. Please try again later.");

            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(response);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Membership form submitted successfully");

        return ResponseEntity.ok(response);
    }
}