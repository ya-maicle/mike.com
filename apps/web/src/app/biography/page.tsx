export default function BiographyPage() {
  const paragraphs = Array.from({ length: 16 })
  return (
    <div className="space-y-8">
      {paragraphs.map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="bg-muted h-6 w-1/2 rounded" />
          <div className="bg-muted h-4 w-11/12 rounded" />
          <div className="bg-muted h-4 w-10/12 rounded" />
          <div className="bg-muted h-4 w-9/12 rounded" />
          <div className="bg-muted h-4 w-8/12 rounded" />
        </div>
      ))}
    </div>
  )
}
