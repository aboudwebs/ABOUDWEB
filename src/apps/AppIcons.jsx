// أيقونات SVG صغيرة داخلية (بدون الاعتماد على أسماء أيقونات مكتبة خارجية).
const base = {
  viewBox: '0 0 24 24',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function DownloadIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

// سهم «رجوع» يشير لليسار (LTR)؛ يُقلب في RTL بالفئة rtl:rotate-180.
export function BackArrowIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <svg {...base} width={20} height={20} {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg {...base} width={20} height={20} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
