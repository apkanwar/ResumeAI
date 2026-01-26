import Slider from '@/components/Slider/Slider'
import { useWindowSize } from 'react-use'

const helpSliderData = [
  {
    title: 'How to Get Started',
    description:
      'Smooth wrinkles, restore volume, and rejuvenate your skin with our expert injectable treatments.',
    showCta: false,
    items: [
      {
        frontCard: {
          title: 'Botox® Wrinkle Relaxer Treatment',
          description:
            'Reduces wrinkles and fine lines for a smoother, younger-looking appearance.',
          image: '/help/copilot.webp',
        }
      },
      {
        frontCard: {
          title: 'Lip Fillers and Augmentation',
          description:
            'Achieve beautifully defined, balanced lips with personalized care.',
          image: '/help/copilot.webp',
        }
      },
      {
        frontCard: {
          title: 'Dermal Fillers',
          description:
            'Enhances facial contours and adds natural volume to cheeks, lips, and more.',
          image: '/help/copilot.webp',
        }
      }
    ]
  }
]

export default function DashboardHelpSection() {
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  return (
    <div className="mx-4 xl:mx-auto max-w-5xl">
      <Slider
        data={helpSliderData}
        settings={{
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1
        }}
        handleButtonClick={() => router.push('/book-now')}
      />
    </div>
  );
}
