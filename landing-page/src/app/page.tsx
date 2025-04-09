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


      {/* Skills Progress Section */}
      <section className="py-16 bg-[#e7ff2e]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                number: "Навык 1",
                title: "Дизайн сайтов",
                image: "/skill-1.png"
              },
              {
                number: "Навык 2",
                title: "Дизайн интерфейсов",
                image: "/skill-2.png"
              },
              {
                number: "Навык 3",
                title: "Анимация Дизайна",
                image: "/skill-3.png"
              },
              {
                number: "Навык 4",
                title: "Создание 3D объекта для сайтов и баннеров",
                image: "/skill-4.png"
              },
              {
                number: "Навык 5",
                title: "Управление временем и проектами",
                image: "/skill-5.png"
              }
            ].map((skill, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-[32px] p-6 h-[320px] flex flex-col shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Skill Number */}
                  <div className="text-black/60 text-sm mb-2">
                    {skill.number}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-black text-xl font-medium mb-6">
                    {skill.title}
                  </h3>
                  
                  {/* 3D Image */}
                  <div className="flex-1 flex items-center justify-center">
                    <Image
                      src={skill.image}
                      alt={skill.title}
                      width={160}
                      height={160}
                      className="object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Bottom Text */}
                  <div className="text-black/60 text-sm text-center mt-4">
                    Нажмите, чтобы посмотреть что входит
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </main>
  )
}
          