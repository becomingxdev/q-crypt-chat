package com.solveIT.qkdchatserver.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String idToken = header.substring(7);

        try {
            
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);

            
            if (decodedToken != null) {
                
                String uid = decodedToken.getUid();

                
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        uid, null, new ArrayList<>());

                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            
            SecurityContextHolder.clearContext();
        }

        
        filterChain.doFilter(request, response);
    }
}