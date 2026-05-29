import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const CarouselCatalog: React.FC = () => {
  const router = useRouter();

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#211c24',
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 400, md: 630 },
        display: 'flex',
        alignItems: 'center',
        m: 0,
        p: 0,
      }}
    >
      {/* Текст (слева) */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
          textAlign: { xs: 'center', md: 'left' },
          pl: { xs: 3, md: 20 },
          pr: { xs: 3, md: 0 },
        }}
      >
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 500,
            fontSize: '20px',
            letterSpacing: '0.5px',
            mb: 1,
          }}
        >
          Pro.Beyond.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-start' },
            mb: 2,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              color: '#fff',
              fontWeight: 100,
              fontSize: { xs: 48, md: 84 },
              letterSpacing: '-1px',
              lineHeight: 1,
              fontFamily: 'sans-serif',
            }}
          >
            IPhone 14{' '}
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: { xs: 48, md: 84 },
              letterSpacing: '-1px',
              lineHeight: 1,
              ml: { xs: 0, md: 1 },
            }}
          >
            Pro
          </Typography>
        </Box>

        <Typography
          sx={{
            color: '#717171',
            mb: 4,
            fontSize: '17px',
            fontWeight: 400,
            maxWidth: 420,
            lineHeight: 1.4,
          }}
        >
          Created to change everything for the better. For everyone
        </Typography>

        <Button
          variant="outlined"
          onClick={() => router.push('/catalog')}
          sx={{
            borderColor: '#fff',
            color: '#fff',
            fontWeight: 500,
            px: 7,
            py: 1.8,
            borderRadius: '6px',
            textTransform: 'none',
            fontSize: '16px',
            letterSpacing: '0.5px',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderColor: '#fff',
            },
          }}
        >
          Shop Now
        </Button>
      </Box>

      {/* Картинка (справа) */}
      <Box
        component="img"
        src="/images/IphoneImage.png"
        alt="IPhone 14 Pro"
        sx={{
          position: 'absolute',
          right: { xs: '0px', md: '40px' },
          bottom: '-5px',
          height: { xs: '65%', md: '95%' },
          maxHeight: '600px',
          objectFit: 'contain',
          zIndex: 1,
          display: { xs: 'none', sm: 'block' },
        }}
      />
    </Box>
  );
};

export default CarouselCatalog;



// import React from 'react';

// import Carousel from 'react-material-ui-carousel';
// import NavigateNextIcon from '@mui/icons-material/NavigateNext';
// import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
// import { Box, Typography, Button } from '@mui/material';
// import { useRouter } from 'next/navigation';
// import styles from './index.module.css';
// import { useTranslation } from 'react-i18next';

// interface BannerItem {
//   id: number;
//   image: string;
//   title?: string;
//   subtitle?: string;
//   buttonText?: string;
//   link?: string;
// }

// const CarouselCatalog: React.FC = () => {
//   const router = useRouter();
//   const { t } = useTranslation('common');

//   const banners: BannerItem[] = [
//     {
//       id: 1,
//       image:
//         'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=800&fit=crop',
//       title: `${t('carousel.banners.1.title')}`,
//       subtitle: `${t('carousel.banners.1.subtitle')}`,
//       buttonText: `${t('carousel.banners.1.button')}`,
//       link: '/catalog',
//     },
//     {
//       id: 2,
//       image:
//         'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=800&fit=crop',
//       title: `${t('carousel.banners.2.title')}`,
//       subtitle: `${t('carousel.banners.2.subtitle')}`,
//       buttonText: `${t('carousel.banners.2.button')}`,
//       link: '/catalog/Электроника',
//     },
//     {
//       id: 3,
//       image:
//         'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=800&fit=crop',
//       title: `${t('carousel.banners.3.title')}`,
//       subtitle: `${t('carousel.banners.3.subtitle')}`,
//       buttonText: `${t('carousel.banners.3.button')}`,
//       link: '/catalog/Женщинам',
//     },
//   ];

//   const handleBannerClick = (link?: string) => {
//     if (link) router.push(link);
//   };

//   return (
//     <Box sx={{ width: '100%' }}>
//       <Carousel
//         animation="fade"
//         duration={600}
//         autoPlay
//         interval={5000}
//         cycleNavigation
//         swipe
//         navButtonsProps={{
//           style: {
//             backgroundColor: 'rgba(255,255,255,0.9)',
//             color: '#667eea',
//             width: 48,
//             height: 48,
//             borderRadius: '50%',
//           },
//         }}
//         indicatorIconButtonProps={{
//           style: {
//             color: 'rgba(255,255,255,0.5)',
//           },
//         }}
//         activeIndicatorIconButtonProps={{
//           style: {
//             color: '#fff',
//           },
//         }}
//         NextIcon={<NavigateNextIcon />}
//         PrevIcon={<ArrowBackIosNewIcon />}
//       >
//         {banners.map((banner) => (
//           <Box
//             key={banner.id}
//             sx={{
//               width: '100%',
//               position: 'relative',
//               overflow: 'hidden',
//               borderRadius: { xs: 2, md: 4 },
//               aspectRatio: { xs: '16/9', md: '21/9' },
//               minHeight: { xs: 300, md: 500 },
//             }}
//           >
//             {/* Image */}
//             <Box
//               component="img"
//               src={banner.image}
//               alt={banner.title}
//               sx={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//               }}
//             />

//             {/* Overlay */}
//             <Box
//               sx={{
//                 position: 'absolute',
//                 inset: 0,
//                 background:
//                   'linear-gradient(135deg, rgba(102,126,234,0.75) 0%, rgba(118,75,162,0.75) 100%)',
//               }}
//             />

//             {/* Content */}
//             <Box
//               sx={{
//                 position: 'relative',
//                 zIndex: 2,
//                 height: '100%',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 alignItems: { xs: 'center', md: 'flex-start' },
//                 textAlign: { xs: 'center', md: 'left' },
//                 px: { xs: 3, md: 8 },
//               }}
//             >
//               {banner.title && (
//                 <Typography
//                   variant="h3"
//                   sx={{
//                     color: '#fff',
//                     fontWeight: 800,
//                     fontSize: { xs: 28, md: 56 },
//                     mb: 2,
//                   }}
//                 >
//                   {banner.title}
//                 </Typography>
//               )}

//               {banner.subtitle && (
//                 <Typography
//                   variant="h6"
//                   sx={{
//                     color: '#fff',
//                     mb: 4,
//                     fontSize: { xs: 16, md: 24 },
//                     maxWidth: 600,
//                   }}
//                 >
//                   {banner.subtitle}
//                 </Typography>
//               )}

//               {banner.buttonText && (
//                 <Button
//                   variant="contained"
//                   onClick={() => handleBannerClick(banner.link)}
//                   sx={{
//                     backgroundColor: '#fff',
//                     color: '#667eea',
//                     fontWeight: 700,
//                     px: 4,
//                     py: 1.5,
//                     borderRadius: 2,
//                     textTransform: 'none',
//                     '&:hover': {
//                       backgroundColor: '#f2f2f2',
//                     },
//                   }}
//                 >
//                   {banner.buttonText}
//                 </Button>
//               )}
//             </Box>
//           </Box>
//         ))}
//       </Carousel>
//     </Box>
//   );
// };

// export default CarouselCatalog;
