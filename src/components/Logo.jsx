export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0f2744" />
      <path d="M14 40l10-18h8l-6 11h9l-4 7z" fill="#ff7a1a" />
      <path d="M36 22h14l-10 18h-8z" fill="#fff" />
    </svg>
  )
}
