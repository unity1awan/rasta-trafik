export function GoogleMapsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Maps"
    >
      <path fill="#4285F4" d="M256 12C121.6 12 12 121.6 12 256c0 61.6 22 118.8 59.2 163.6L256 500l184.8-80.4C478 374.8 500 317.6 500 256 500 121.6 390.4 12 256 12z" />
      <path fill="#EA4335" d="M256 148c-59.6 0-108 48.4-108 108s48.4 108 108 108 108-48.4 108-108-48.4-108-108-108z" />
      <circle fill="#FFFFFF" cx="256" cy="256" r="48" />
      <circle fill="#4285F4" cx="256" cy="256" r="28" />
    </svg>
  );
}
