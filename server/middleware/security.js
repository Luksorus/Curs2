const securityMiddleware = (req, res, next) => {
  // Удаляем существующие заголовки CSP
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Content-Security-Policy-Report-Only');

  // Устанавливаем новые заголовки безопасности
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' chrome-extension:",
      "style-src 'self' 'unsafe-inline' https: http:",
      "img-src 'self' data: https: http: blob:",
      "font-src 'self' data: https: http:",
      "connect-src 'self' https: http: ws: wss:",
      "media-src 'self' https: http: data: blob:",
      "object-src 'none'",
      "frame-src 'self' https: http:",
      "worker-src 'self' blob:",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'"
    ].join('; ')
  );

  // Другие заголовки безопасности
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

module.exports = securityMiddleware; 