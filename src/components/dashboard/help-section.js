import Slider from '@/components/Slider/Slider'

const helpSliderData = [
  {
    title: 'How to Best Use Resume Analyzer',
    description:
      'Follow these three steps to tailor your resume to a role, understand the gaps, and ship a stronger application.',
    showCta: false,
    items: [
      {
        frontCard: {
          title: 'Helping with Job Profile',
          description:
            'Create your target job profile (title, level, skills, and preferences) so every analysis is aligned to the role you want.',
          image: '/help/profile.png',
        }
      },
      {
        frontCard: {
          title: 'Analyze',
          description:
            'Upload your resume to get a clear breakdown of strengths, missing keywords, and improvement areas.',
          image: '/help/analyze.png',
        }
      },
      {
        frontCard: {
          title: 'Results',
          description:
            'Review prioritized recommendations and apply edits to boost match score, clarity, and impact before you apply.',
          image: '/help/report.png',
        }
      }
    ]
  }
]

export default function DashboardHelpSection() {
  return (
    <div className="xl:mx-auto max-w-5xl">
      <Slider
        data={helpSliderData}
        settings={{
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1
        }}
        showItemTitlesList
      />
    </div>
  );
}
