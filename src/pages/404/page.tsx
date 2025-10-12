export default function NotFoundPage() {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-6 select-none">
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-6xl font-bold text-[var(--color-text-strong)]">404</h1>
        <p>Nothing.</p>
      </div>

      <div class="relative inline-block">
        <img
          class="pointer-events-none rounded-md shadow-lg"
          src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExemg0Z2h3dmFpdXBhZm5ybnU0M3hzazZwYjR6eHFiZm0wY3I5YnZ4biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/g01ZnwAUvutuK8GIQn/giphy.gif"
          alt="confused"
          fetchpriority="high"
        />
        <div class="pointer-events-auto absolute inset-0"></div>
      </div>
    </div>
  )
}
