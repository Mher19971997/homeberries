const IClose = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='32'
      height='32'
      viewBox='0 0 48 48'
      fill='none'
    >
      <g filter='url(#filter0_bd_1278_6232)'>
        <rect x='8' y='8' width='32' height='32' rx='8' fill='white' />
        <path
          d='M17.1428 17.1431L30.8571 30.8574M17.1428 30.8574L30.8571 17.1431'
          stroke='black'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <filter
          id='filter0_bd_1278_6232'
          x='-32'
          y='-32'
          width='112'
          height='112'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feGaussianBlur in='BackgroundImageFix' stdDeviation='20' />
          <feComposite
            in2='SourceAlpha'
            operator='in'
            result='effect1_backgroundBlur_1278_6232'
          />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset />
          <feGaussianBlur stdDeviation='4' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'
          />
          <feBlend
            mode='normal'
            in2='effect1_backgroundBlur_1278_6232'
            result='effect2_dropShadow_1278_6232'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect2_dropShadow_1278_6232'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  );
};

export default IClose;
