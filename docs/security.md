# CareLens AI - Security & Privacy Specification

CareLens AI handles sensitive health-related data with rigorous hackathon production security:

1. **Input Validation**: Strict MIME type checking (`image/jpeg`, `image/png`, `image/webp`) and file extension validation.
2. **File Size Enforcement**: Hard upload size limit of 10MB (`MAX_UPLOAD_SIZE_MB`).
3. **Security Headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy`
4. **Data Privacy & Image Retention**:
   - Uploaded retina images are processed in-memory for model inference and Grad-CAM generation.
   - Raw patient images are **not** persisted to server disk or database.
   - History logs store only non-sensitive metadata (reference IDs, risk levels, timestamp).
   - Users can delete their history logs at any time.
5. **No Secrets in Frontend**: Environment variables and database credentials remain secured on backend environment layers.
