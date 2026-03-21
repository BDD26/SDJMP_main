export default function PageShell({ children, className = '' }) {
  return <div className={`mx-auto max-w-7xl space-y-8 pb-12 ${className}`}>{children}</div>
}
