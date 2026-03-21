export default function LoadingState({
  title = 'Loading',
  message = 'Please wait while we fetch the latest data.',
  label,
  fullScreen = false,
}) {
  const copy = label || message

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'min-h-[320px]'
      }`}
    >
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <h2 className="mt-4 text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
      </div>
    </div>
  )
}
