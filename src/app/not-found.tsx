import NotFoundContent from './not-found-content';

export default function GlobalNotFound() {
  return (
    <html suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        <NotFoundContent />
      </body>
    </html>
  );
}
