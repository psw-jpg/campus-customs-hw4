// Handsome Dan — a full sitting bulldog drawn in SVG (no raster image, per class convention),
// with no surrounding circle. `animated` turns on idle motion (breathe, blink, tail wag);
// hover always makes him react (head tilt, ears lift, tail wags faster, tongue peeks out).
export default function BulldogAvatar({
  size = 44,
  animated = false,
  celebrate = false,
  thinking = false,
  hat = false,
}: {
  size?: number
  animated?: boolean
  celebrate?: boolean
  thinking?: boolean
  hat?: boolean
}) {
  const height = Math.round(size * (86 / 72))
  const cls = [
    'bulldog',
    animated && 'bulldog-animated',
    celebrate && 'bulldog-celebrate',
    thinking && 'bulldog-thinking',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls} style={{ width: size, height }} aria-hidden="true">
      <svg viewBox="0 0 72 86" width={size} height={height}>
        {/* thought bubble while thinking */}
        {thinking && (
          <g className="dan-thought">
            <circle cx="50" cy="20" r="2" fill="#ffffff" stroke="#c7c7c7" strokeWidth="0.8" />
            <circle cx="55" cy="14" r="3" fill="#ffffff" stroke="#c7c7c7" strokeWidth="0.8" />
            <ellipse cx="62" cy="7" rx="9" ry="6.5" fill="#ffffff" stroke="#c7c7c7" strokeWidth="0.8" />
            <circle className="td td1" cx="58" cy="7" r="1.3" fill="#00366b" />
            <circle className="td td2" cx="62" cy="7" r="1.3" fill="#00366b" />
            <circle className="td td3" cx="66" cy="7" r="1.3" fill="#00366b" />
          </g>
        )}
        <g className="dan">
          {/* tail */}
          <path className="dan-tail" d="M52 62 q10 -1 9 -10 q-1 -5 -6 -4 q4 3 1 7 q-3 4 -8 3 Z" fill="#cbb184" />

          {/* haunches / seated body */}
          <ellipse cx="36" cy="66" rx="25" ry="18" fill="#e2cfa4" />
          {/* front legs */}
          <rect x="21" y="56" width="12" height="26" rx="6" fill="#e2cfa4" />
          <rect x="39" y="56" width="12" height="26" rx="6" fill="#e2cfa4" />
          {/* toes */}
          <g stroke="#cbb184" strokeWidth="1.2" strokeLinecap="round">
            <line x1="24" y1="78" x2="24" y2="82" />
            <line x1="27" y1="78" x2="27" y2="82" />
            <line x1="30" y1="78" x2="30" y2="82" />
            <line x1="42" y1="78" x2="42" y2="82" />
            <line x1="45" y1="78" x2="45" y2="82" />
            <line x1="48" y1="78" x2="48" y2="82" />
          </g>
          {/* torso */}
          <path d="M20 50 q16 -10 32 0 q3 18 -4 27 q-12 7 -24 0 q-7 -9 -4 -27 Z" fill="#e8d6ad" />
          {/* blue Yale shirt with a white Y */}
          <path d="M22 51 q14 -8 28 0 q3 17 -3 27 q-11 7 -22 0 q-6 -10 -3 -27 Z" fill="#00366b" />
          {/* crew neckline */}
          <path d="M28 51 q8 6 16 0" fill="none" stroke="#0a4a86" strokeWidth="2" strokeLinecap="round" />
          <text x="36" y="70" fontSize="17" textAnchor="middle" fill="#ffffff" fontFamily="Georgia, serif" fontWeight="700">Y</text>

          {/* head */}
          <g className="dan-head">
            {/* ears */}
            <path className="dan-ear" d="M17 20 q-7 2 -6 13 q7 0 12 -6 Z" fill="#cbb184" />
            <path className="dan-ear" d="M55 20 q7 2 6 13 q-7 0 -12 -6 Z" fill="#cbb184" />
            {/* head shape */}
            <path d="M18 26 q18 -15 36 0 q5 16 -3 27 q-15 12 -30 0 q-8 -11 -3 -27 Z" fill="#e8d6ad" />
            {/* brow wrinkles */}
            <g stroke="#cbb184" strokeWidth="1.6" fill="none" strokeLinecap="round">
              <path d="M24 25 q4 -3 8 -1" />
              <path d="M40 24 q4 -2 8 1" />
              <path d="M36 19 q1 4 0 8" />
            </g>
            {/* eyes */}
            <g className="dan-eyes">
              <ellipse cx="27" cy="31" rx="3.5" ry="3.9" fill="#2a2017" />
              <ellipse cx="45" cy="31" rx="3.5" ry="3.9" fill="#2a2017" />
              <circle cx="28.2" cy="29.8" r="1.1" fill="#ffffff" />
              <circle cx="46.2" cy="29.8" r="1.1" fill="#ffffff" />
            </g>
            {/* snout */}
            <ellipse cx="36" cy="43" rx="13" ry="10" fill="#fbf6ec" />
            <path d="M24 42 q12 10 24 0" stroke="#e4d6b0" strokeWidth="1.3" fill="none" />
            {/* tongue (peeks out on hover) */}
            <path className="dan-tongue" d="M32 49 q4 8 8 0 Z" fill="#eb6d8a" />
            {/* nose */}
            <path d="M31 38 q5 -3 10 0 q0 5 -5 6 q-5 -1 -5 -6 Z" fill="#3d2b24" />
            <circle cx="33.5" cy="40" r="0.8" fill="#1d1d1d" />
            <circle cx="38.5" cy="40" r="0.8" fill="#1d1d1d" />
            {/* mouth */}
            <path d="M36 44 v3" stroke="#2a2017" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M30 47 q6 5 12 0" stroke="#2a2017" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* party hat (shown on celebration) */}
            {hat && (
              <g className="dan-hat">
                <ellipse cx="36" cy="15" rx="10" ry="2.6" fill="#00264d" />
                <path d="M36 -5 L45 15 L27 15 Z" fill="#00366b" />
                <path d="M30.5 10 L36 7 L41.5 10" fill="none" stroke="#c9a227" strokeWidth="1.6" />
                <path d="M28.5 14 L36 10.5 L43.5 14" fill="none" stroke="#c9a227" strokeWidth="1.6" />
                <circle cx="36" cy="-5" r="3" fill="#eb1256" />
              </g>
            )}
          </g>
        </g>
      </svg>
    </span>
  )
}
