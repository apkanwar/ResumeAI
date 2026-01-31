import React, { useEffect, useMemo, useRef, useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import styles from './Slider.module.css'
import { CircleQuestionMark, ChevronLeft, ChevronRight } from 'lucide-react'

const FALLBACK_RESPONSIVE = [
  {
    breakpoint: 1000,
    settings: { slidesToShow: 1, slidesToScroll: 1 },
  },
]

function getEffectiveSlidesToShow(sliderSettings, width) {
  const baseSlidesToShow = sliderSettings?.slidesToShow || 1
  const responsive = Array.isArray(sliderSettings?.responsive) ? sliderSettings.responsive : []

  const sorted = [...responsive].sort((a, b) => (a?.breakpoint ?? 0) - (b?.breakpoint ?? 0))
  for (const entry of sorted) {
    const breakpoint = entry?.breakpoint
    if (typeof breakpoint !== 'number') continue
    if (width < breakpoint) {
      const candidate = entry?.settings?.slidesToShow
      return typeof candidate === 'number' && candidate > 0 ? candidate : baseSlidesToShow
    }
  }

  return baseSlidesToShow
}

const SeeTheResultsSlider = ({ data = [], settings, showItemTitlesList = false }) => {
  const sliderRef = useRef(null)
  const [activeTab, setActiveTab] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [flippedCards, setFlippedCards] = useState([])
  const safeData = Array.isArray(data) ? data : []
  const activeTabData = safeData[activeTab] || safeData[0]
  const items = activeTabData?.items ?? []
  const itemTitleEntries = items
    .map((card, index) => ({ index, title: card?.frontCard?.title }))
    .filter((entry) => Boolean(entry.title))

  const resolvedSettings = useMemo(() => {
    const safeSettings = settings && typeof settings === 'object' ? settings : {}
    return {
      ...safeSettings,
      responsive: Array.isArray(safeSettings.responsive)
        ? safeSettings.responsive
        : FALLBACK_RESPONSIVE,
    }
  }, [settings])

  const baseSlidesToShow = resolvedSettings?.slidesToShow || 1
  const [effectiveSlidesToShow, setEffectiveSlidesToShow] = useState(baseSlidesToShow)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const update = () => {
      setEffectiveSlidesToShow(getEffectiveSlidesToShow(resolvedSettings, window.innerWidth))
    }

    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [resolvedSettings])

  const safeSlidesToShow = effectiveSlidesToShow || baseSlidesToShow || 1
  const totalPages = Math.ceil(items.length / safeSlidesToShow)

  if (!safeData.length) {
    return null
  }

  const handleTabClick = (index) => {
    setActiveTab(index)
    setCurrentSlide(0)
    setActiveCardIndex(0)
    setFlippedCards([])
    sliderRef.current?.slickGoTo(0)
  }

  const next = () => {
    sliderRef.current?.slickNext()
  }

  const previous = () => {
    sliderRef.current?.slickPrev()
  }

  const goToPage = (pageIndex) => {
    sliderRef.current?.slickGoTo(pageIndex * safeSlidesToShow)
  }

  const handleBeforeChange = (_, newIndex) => {
    setCurrentSlide(Math.ceil(newIndex / safeSlidesToShow))
    setActiveCardIndex(newIndex)
  }

  const handleCardFlip = (index) => {
    setFlippedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <div className='flex flex-col gap-6 w-full'>
      {safeData.length > 1 && (
        <div className={styles.tabs}>
          {safeData.map((tab, i) => (
            <div
              key={i}
              className={`${i === activeTab ? styles.active : styles.notActive}`}
              onClick={() => handleTabClick(i)}
            >
              <div
                className={`${styles.tabContent} ${i === activeTab ? styles.tabContentActive : ''}`}
              >
                <CircleQuestionMark className={styles.tabIcon} aria-hidden />
                {tab.title}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className='border rounded-2xl border-slate-200 flex flex-col lg:flex-row overflow-hidden gap-6 lg:gap-10 p-4 sm:p-6 lg:p-8'>
        <div className='flex flex-col justify-between w-full lg:min-w-[375px] lg:max-w-[420px] font-main'>
          <div className='flex flex-col gap-4'>
            <p className='text-2xl font-headings font-semibold'>{activeTabData.title}</p>
            <p className='text-lg'>{activeTabData.description}</p>
            {showItemTitlesList && itemTitleEntries.length > 0 && (
              <ol className='mt-2 space-y-2'>
                {itemTitleEntries.map(({ index, title }) => {
                  const active = index === activeCardIndex
                  const base =
                    'w-full text-left rounded-xl px-4 py-2 font-semibold flex items-start gap-3'
                  const activeStyles = 'bg-top-orange/20 text-slate-900 ring-1 ring-top-orange'
                  const inactiveStyles = 'bg-white/60 text-slate-700 ring-1 ring-slate-200'

                  return (
                    <li key={`${index}-${title}`} aria-current={active ? 'step' : undefined}>
                      <div className={`${base} ${active ? activeStyles : inactiveStyles}`}>
                        <span className='w-6 shrink-0 text-sm leading-6 bg-top-orange/50 text-center rounded-full'>{index + 1}</span>
                        <span className='min-w-0 leading-snug'>{title}</span>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
          <div className={styles.bottom}>
            {items.length > safeSlidesToShow && (
              <div className={styles.navigation}>
                <div className={styles.nav}>
                  <div
                    className={`${styles.prev} ${!currentSlide ? styles.disabled : ''}`}
                    onClick={previous}
                  >
                    <ChevronLeft aria-hidden />
                  </div>
                  <div
                    className={`${styles.next} ${
                      currentSlide === totalPages - 1 ? styles.disabled : ''
                    }`}
                    onClick={next}
                  >
                    <ChevronRight aria-hidden />
                  </div>
                </div>
                <div className={styles.dots}>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <div
                      key={index}
                      className={`${styles.dot} ${
                        index === currentSlide ? styles.dotActive : ''
                      }`}
                      onClick={() => goToPage(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.sliderWrapper}>
          <div className={styles.sliderBlock}>
            <Slider
              ref={(slider) => {
                sliderRef.current = slider
              }}
              {...resolvedSettings}
              className={styles.slider}
              beforeChange={handleBeforeChange}
            >
              {items.map((card, i) => (
                <div
                  key={i}
                  className={card.backCard ? styles.card : styles.cardSingle}
                  onClick={() => card.backCard && handleCardFlip(i)}
                >
                  <div className={`${styles.frontCard} ${flippedCards.includes(i) ? styles.hide : ''}`}>
                    <img className={styles.cardImage} src={card.frontCard.image} alt='image' />
                    <div className={styles.content}>
                      <div>
                        <p className={styles.cardTitle}>{card.frontCard.title}</p>
                        <p className={styles.cardDescription}>{card.frontCard.description}</p>
                      </div>
                    </div>
                  </div>
                  {/* {card.backCard && (
                    <div className={`${styles.backCard} ${flippedCards.includes(i) ? styles.show : ''}`}>
                      <img className={styles.cardImage} src={card.backCard.image} alt='image' />
                      <div className={styles.content}>
                        <div>
                          <p className={styles.cardTitle}>{card.backCard.title}</p>
                          <p className={styles.cardDescription}>{card.backCard.description}</p>
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>
              ))}
              {items.length === 1 && <div></div>}
            </Slider>
          </div>
          <div className={styles.bottomMobile}>
            {items.length > safeSlidesToShow && (
              <div className={styles.navigation}>
                <div className={styles.nav}>
                  <div
                    className={`${styles.prev} ${!currentSlide ? styles.disabled : ''}`}
                    onClick={previous}
                  >
                    <ChevronLeft className={styles.navIcon} aria-hidden />
                  </div>
                  <div
                    className={`${styles.next} ${
                      currentSlide === totalPages - 1 ? styles.disabled : ''
                    }`}
                    onClick={next}
                  >
                    <ChevronRight className={styles.navIcon} aria-hidden />
                  </div>
                </div>
                <div className={styles.dots}>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <div
                      key={index}
                      className={`${styles.dot} ${
                        index === currentSlide ? styles.dotActive : ''
                      }`}
                      onClick={() => goToPage(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeeTheResultsSlider
