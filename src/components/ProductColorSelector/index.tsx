import React from "react";
import styles from "./index.module.css";

interface ColorOption {
  name: string;
  value: string;
}

interface RawOption {
  name?: string;
  value: string;
}

interface ProductColorSelectorProps {
  options?: RawOption[];
  onColorSelect?: (color: ColorOption) => void;
}

const colorMap: Record<string, string> = {
  черный: "#000000",
  чёрный: "#000000",
  black: "#000000",
  белый: "#FFFFFF",
  white: "#FFFFFF",
  красный: "#E10000",
  red: "#E10000",
  желтый: "#E1B000",
  yellow: "#E1B000",
  серый: "#E8E8E8",
  gray: "#E8E8E8",
  grey: "#E8E8E8",
  фиолетовый: "#781DBC",
  purple: "#781DBC",
};

const defaultColors: ColorOption[] = [
  { name: "черный", value: "#000000" },
  { name: "белый", value: "#FFFFFF" },
  { name: "серый", value: "#E8E8E8" },
];

const ProductColorSelector: React.FC<ProductColorSelectorProps> = ({
  options = [],
  onColorSelect,
}) => {
  
  const colors: ColorOption[] = React.useMemo(() => {
    if (options && options.length > 0) {
      return options.map((o) => {
        const key = (o.value || "").toLowerCase().trim();
        return {
          name: o.name || o.value,
          value: colorMap[key] || "#D3D3D3",
        };
      });
    }
    return defaultColors;
  }, [options]);

  const [selectedColor, setSelectedColor] = React.useState<ColorOption | null>(null);

  React.useEffect(() => {
    if (colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  }, [colors]);

  const handleClick = (color: ColorOption) => {
    setSelectedColor(color);
    onColorSelect?.(color);
  };

  return (
    <div className={styles.colorsContainer}>
      {colors.map((color) => {
        const isSelected = selectedColor?.value.toLowerCase() === color.value.toLowerCase();
        const isWhite = color.value.toUpperCase() === "#FFFFFF";

        const buttonClass = [
          styles.colorDot,
          isSelected ? styles.colorDotActive : "",
          isWhite ? styles.white : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={color.value + color.name}
            type="button"
            className={buttonClass}
            style={{ backgroundColor: color.value }}
            onClick={() => handleClick(color)}
            title={color.name}
          />
        );
      })}
    </div>
  );
};

export default ProductColorSelector;




// import React, { useState } from 'react';
// import { Box, Typography } from '@mui/material';
// import styles from './index.module.css';

// interface ColorOption {
//   name: string;
//   value: string; // hex color
//   image?: string;
// }

// interface ProductColorSelectorProps {
//   colors?: ColorOption[];
//   onColorSelect?: (color: ColorOption) => void;
// }

// const ProductColorSelector: React.FC<ProductColorSelectorProps> = ({
//   colors = [
//     { name: 'черный', value: '#000000' },
//     { name: 'белый', value: '#FFFFFF' },
//     { name: 'бежевый', value: '#F5F5DC' },
//     { name: 'бирюзовый', value: '#40E0D0' },
//     { name: 'светло-серый', value: '#D3D3D3' },
//     { name: 'темно-серый', value: '#696969' }
//   ],
//   onColorSelect
// }) => {
//   const [selectedColor, setSelectedColor] = useState<ColorOption | null>(colors[0] || null);

//   const handleColorClick = (color: ColorOption) => {
//     setSelectedColor(color);
//     onColorSelect?.(color);
//   };

//   return (
//     <Box className={styles.container}>
//       <Typography className={styles.label}>Цвет:</Typography>
//       <Box className={styles.colorsContainer}>
//         {colors.map((color) => {
//           const isSelected = selectedColor?.name === color.name;
//           return (
//             <Box
//               key={color.name}
//               className={`${styles.colorItem} ${isSelected ? styles.selected : ''}`}
//               onClick={() => handleColorClick(color)}
//             >
//               <Box
//                 className={styles.colorCircle}
//                 style={{ backgroundColor: color.value }}
//               />
//               <Typography className={styles.colorName}>{color.name}</Typography>
//             </Box>
//           );
//         })}
//       </Box>
//     </Box>
//   );
// };

// export default ProductColorSelector;
