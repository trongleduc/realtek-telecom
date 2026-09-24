import { Img } from './Img'
import { Reveal } from './reveal/Reveal'

export function Gallery({ images }: { images: unknown[] | null | undefined }) {
  const list = (images ?? []).filter((img) => img && typeof img === 'object')
  if (!list.length) return null
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {list.map((img, i) => (
        <li key={i} className={i % 5 === 0 ? 'col-span-2 row-span-2' : ''}>
          <Reveal variant="zoom" delay={(i % 3) * 90} className="h-full">
            <div
              className={`group relative overflow-hidden bg-paper ${i % 5 === 0 ? 'aspect-square md:aspect-auto md:h-full md:min-h-[420px]' : 'aspect-square'}`}
            >
              <Img
                media={img}
                size={i % 5 === 0 ? 'wide' : 'card'}
                fill
                sizes={i % 5 === 0 ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 50vw'}
                className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
              />
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
