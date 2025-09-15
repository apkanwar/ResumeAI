"use client";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const InfoTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#111827', // gray-900
    color: '#fff',
    borderRadius: 8,
    border: '1px solid #e5e7eb', // gray-200
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    fontSize: 14,
    lineHeight: 1.2,
    padding: '8px 10px',
    maxWidth: 260,
    fontWeight: 500,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#111827',
    '&::before': {
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
    },
  },
}));

function scoreColor(v) {
  const n = Number(v) || 0;
  if (n >= 80) return "text-green-600";
  if (n >= 60) return "text-amber-500";
  return "text-red-600";
}

function strokeColor(v) {
  const n = Number(v) || 0;
  if (n >= 80) return "#16a34a"; // green-600
  if (n >= 60) return "#f59e0b"; // amber-500
  return "#dc2626"; // red-600
}

export function ScoreRing({ value = 0, label = "", size = 120, stroke = 12, className = "" }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const dash = (pct / 100) * circ;

  const tooltips = {
    Objective: "Structural Completeness, Clarity, Required Sections.",
    Subjective: "Tone, Persuasiveness, Storytelling.",
    Design: "Layout, Readability, Scannability.",
    Employer: "Relevance to target role and industry.",
  };
  const tip = tooltips[label] || `${label} score details.`;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {label &&
        <InfoTooltip title={tip} placement="top" arrow>
          <div className="flex flex-row items-center text-lg font-bold">
            <h2 className={`${scoreColor(pct)}`}>
              {label}
              <span className="text-gray-500 font-normal"> Score</span>
            </h2>
          </div>
        </InfoTooltip>
      }

      <svg width={size} height={size} className="shrink-0 font-semibold" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb" /* gray-200 */
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor(pct)}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={Math.max(12, size * 0.22)} style={{ fill: 'currentColor' }}>
          {Math.round(pct)}
        </text>
      </svg>
    </div>
  );
}

export default ScoreRing;