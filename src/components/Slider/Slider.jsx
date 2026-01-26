import React, { useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import styles from './Slider.module.css'
import { CircleQuestionMark, ChevronLeft, ChevronRight } from 'lucide-react'

const SeeTheResultsSlider = ({ data = [], settings, handleButtonClick }) => {
  let sliderRef = React.useRef(null)
  const [activeTab, setActiveTab] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [flippedCards, setFlippedCards] = useState([])
  const safeData = Array.isArray(data) ? data : []
  const activeTabData = safeData[activeTab] || safeData[0]
  const items = activeTabData?.items ?? []
  const slidesToShow = settings?.slidesToShow
  const safeSlidesToShow = slidesToShow || 1
  const totalPages = Math.ceil(items.length / safeSlidesToShow)

  if (!safeData.length) {
    return null
  }

  const handleTabClick = (index) => {
    setActiveTab(index)
    sliderRef.slickGoTo(0)
  }

  const next = () => {
    sliderRef.slickNext()
  }

  const previous = () => {
    sliderRef.slickPrev()
  }

  const goToPage = (pageIndex) => {
    sliderRef.slickGoTo(pageIndex * safeSlidesToShow)
  }

  const handleBeforeChange = (_, newIndex) => {
    setCurrentSlide(Math.ceil(newIndex / safeSlidesToShow))
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
      <div className='border rounded-2xl border-slate-200 flex overflow-hidden gap-10 p-8'>
        <div className='flex flex-col justify-between min-w-[375px] font-main'>
          <div className='flex flex-col gap-4'>
            <p className='text-2xl font-headings font-semibold'>{activeTabData.title}</p>
            <p className='text-lg'>{activeTabData.description}</p>
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
                sliderRef = slider
              }}
              {...settings}
              className={styles.slider}
              beforeChange={handleBeforeChange}
            >
              {items.map((card, i) => (
                <>
                  <div
                    key={i}
                    className={card.backCard ? styles.card : styles.cardSingle}
                    onClick={() => card.backCard && handleCardFlip(i)}
                  >
                    <div
                      className={`${styles.frontCard} ${
                        flippedCards.includes(i) ? styles.hide : ''
                      }`}
                    >
                      <img
                        className={styles.cardImage}
                        src={card.frontCard.image}
                        alt='image'
                      />
                      <div className={styles.content}>
                        <div>
                          <p className={styles.cardTitle}>
                            {card.frontCard.title}
                          </p>
                          <p className={styles.cardDescription}>
                            {card.frontCard.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    {card.backCard && (
                      <div
                        className={`${styles.backCard} ${
                          flippedCards.includes(i) ? styles.show : ''
                        }`}
                      >
                        <img
                          className={styles.cardImage}
                          src={card.backCard.image}
                          alt='image'
                        />

                        <div className={styles.content}>
                          <div>
                            <p className={styles.cardTitle}>
                              {card.backCard.title}
                            </p>
                            <p className={styles.cardDescription}>
                              {card.backCard.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
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
