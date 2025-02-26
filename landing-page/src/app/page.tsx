import Image from 'next/image'
import Header from '@/components/Header'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="container mx-auto px-4 pt-10">
      {/* Hero Section */}
      <div className="mx-auto px-4">
        <div className="relative">
          {/* Main Content Box */}
          <div className="bg-[#D9D9D9] rounded-[32px] p-12 min-h-[500px] relative overflow-hidden">
            {/* Text Content */}
            <div className="max-w-2xl">
              <h1 className="text-black text-6xl font-bold leading-tight mb-8">
                thg lol nhan
                <br />
                concac
                <br />
                concac
              </h1>
              
              <button className="bg-[#3b82f6] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-900 transition flex items-center gap-2">
                ccccccccccccccccccccccccc
                <span className="text-xl">→</span>
              </button>
            </div>

            {/* Circular Button - Top Right */}
            <div className="absolute top-8 right-8">
              <button className="border-2 border-black rounded-full w-32 h-32 flex items-center justify-center text-black hover:bg-black hover:text-white transition">
                <div className="text-sm text-center">
                  УЗНАТЬ
                  <br />
                  БОЛЬШЕ
                </div>
              </button>
            </div>
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              "FIGMA",
              "PHOTOSHOP",
              "AFTER EFFECTS",
              "UX/UI",
              "ВЕБ ДИЗАЙН",
              "ГРАФИЧЕСКИЙ ДИЗАЙН",
              "3D"
            ].map((tag, index) => (
              <span
                key={index}
                className="px-6 py-2 bg-[#D9D9D9] rounded-full text-black text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12">
           concac
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: '/x-shape.png',
                title: 'АБСОЛЮТНЫЙ НОВИЧОК',
                position: 'left'
              },
              {
                image: '/cube-shape.png',
                title: 'НАЧИНАЮЩИЙ UX/UI-ДИЗАЙНЕР',
                position: 'middle'
              },
              {
                image: '/spiral-shape.png',
                title: 'ОПЫТНЫЙ ВЕБ-ДИЗАЙНЕР',
                position: 'right'
              }
            ].map((card, index) => (
              <div 
                key={index}
                className="relative bg-black border border-white/20 rounded-[32px] p-6 min-h-[400px] group hover:border-white/40 transition-all"
              >
                {/* Top Menu Dots */}
                <div className="absolute top-6 right-6 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"/>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"/>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"/>
                </div>

                {/* 3D Metallic Image */}
                <div className="w-full h-64 flex items-center justify-center p-8">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Bottom Title with Arrow */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/20">
                    {card.title}
                  </div>
                  <div className="w-10 h-10 rounded-full border border-[#e9ff7a] flex items-center justify-center">
                    <span className="text-[#e9ff7a]">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Skills Progress */}
      <h2 className="text-3xl font-bold text-white">
        cônncconconc
      </h2>
      <section className="py-5 bg-[#e7ff2e] mb-6 ">
        <div className="container mx-auto px-4">

          <Carousel>
            <CarouselContent className="flex-wrap">
              {[
                'Основы композиции',
                'Работа с цветом', 
                'Типографика',
                'UI/UX дизайн',
                'Анимация'
              ].map((skill, index) => (
                <CarouselItem key={index} className="md:basis-1/5">
                  <div className="flex-none w-full p-4">
                    <div className="bg-[#ffffff] p-4 text-center backdrop-blur-lg">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-gray-700 to-gray-900  flex items-center justify-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-transparent rounded-full "/>
                      </div>
                      <p className="text-black/80 text-sm font-medium tracking-wide">{skill}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious variant="outline" className="absolute left-4 bg-white/10 border-none md:hidden" />
            <CarouselNext variant="outline" className="absolute right-4 bg-white/10 border-none md:hidden" />
          </Carousel>
        </div>
      </section>
      </div>
    </main>
  )
}
          