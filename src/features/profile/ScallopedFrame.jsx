import { useId } from 'react';

// SVG scalloped frame used around the instructor profile avatar.
// Pure presentational wrapper — anything passed as `children` is clipped
// to the scalloped path. Configurable size + border width so the same
// component works for the profile edit page, the preview modal, and
// anywhere else a yoga-style avatar frame is needed.
export default function ScallopedFrame({
  size = 200,
  borderWidth = 2,
  bumps = 12,
  bumpRatio = 0.13,
  stroke = '#3E3D38',
  className = '',
  onClick,
  children,
}) {
  const uid = useId();
  const s   = size;
  const cx  = s / 2;
  const cy  = s / 2;
  const r   = s / 2 - borderWidth;
  const bumpDepth = r * bumpRatio;

  let path = '';
  for (let i = 0; i < bumps; i++) {
    const a1 = (i / bumps) * Math.PI * 2;
    const a2 = ((i + 1) / bumps) * Math.PI * 2;
    const aMid = (a1 + a2) / 2;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xMid = cx + (r - bumpDepth) * Math.cos(aMid);
    const yMid = cy + (r - bumpDepth) * Math.sin(aMid);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    if (i === 0) path += `M ${x1} ${y1} `;
    path += `Q ${xMid} ${yMid} ${x2} ${y2} `;
  }
  path += 'Z';

  const clipId = `scallop${uid}`;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: s, height: s }}
      onClick={onClick}
    >
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        className="absolute inset-0 z-[1]"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
        <path d={path} fill="none" stroke={stroke} strokeWidth={borderWidth} />
      </svg>
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `url(#${clipId})` }}>
        {children}
      </div>
    </div>
  );
}
