export default function WorkPage() {
  const items = Array.from({ length: 18 })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((_, i) => (
        <div
          key={i}
          className={
            // Every 5th block spans full width on desktop to vary layout
            (i % 5 === 0 ? 'md:col-span-2 ' : '') + 'bg-muted h-40 rounded-lg border'
          }
        />
      ))}
    </div>
  )
}
