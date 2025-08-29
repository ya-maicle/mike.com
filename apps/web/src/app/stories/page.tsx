export default function StoriesPage() {
  const cards = Array.from({ length: 24 })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {cards.map((_, i) => (
        <div key={i} className="bg-muted h-48 rounded-lg border" />
      ))}
    </div>
  )
}
