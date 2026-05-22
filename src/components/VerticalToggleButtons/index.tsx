import * as React from 'react';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import GridViewIcon from '@mui/icons-material/GridView';
interface VerticalToggleButtonsProps {
  selectOneSortPanel: () => void;
  cancelSelectedSortpanel: () => void;
}

const VerticalToggleButtons: React.FC<VerticalToggleButtonsProps> = ({
  selectOneSortPanel,
  cancelSelectedSortpanel
}) => {
  const [view, setView] = React.useState('list');

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    nextView: string
  ) => {
    setView(nextView);
  };

  return (
    <ToggleButtonGroup
      orientation='horizontal'
      value={view}
      exclusive
      onChange={handleChange}
    >
      <ToggleButton
        value='list'
        aria-label='list'
        onClick={cancelSelectedSortpanel}
      >
        <GridViewIcon />
      </ToggleButton>
      <ToggleButton
        value='module'
        aria-label='module'
        onClick={selectOneSortPanel}
      >
        <ViewModuleIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default VerticalToggleButtons;
