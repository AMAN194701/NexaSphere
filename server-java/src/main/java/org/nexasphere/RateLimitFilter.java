package org.nexasphere.filter;

import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;

@Component
public class RateLimitFilter implements Filter {

    private final Bucket bucket = Bucket.builder()
            .addLimit(limit ->
                    limit.capacity(5)
                         .refillGreedy(5, Duration.ofMinutes(1)))
            .build();

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletResponse res =
                (HttpServletResponse) response;

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            res.setStatus(429);
            res.getWriter().write("Too many requests");
        }
    }
}