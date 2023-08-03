import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomCard, SoomCardProps } from './soom-card';
import SoomCardContent from '../soom-card-content/soom-card-content';
import SoomCardMedia from '../soom-card-media/soom-card-media';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SoomCardActions from '../soom-card-actions/soom-card-actions';
import SoomButton from '../soom-button/soom-button';

export default {
  component: SoomCard,
  title: 'Components/SoomCard'
} as Meta<typeof SoomCard>;

const handlerOnClick = () => {
  // console.log('this a button');
};

const Template: Story<SoomCardProps> = (args) => <SoomCard {...args} />;

export const CardOnlyTextAndButton = Template.bind({});
export const CardWithImage = Template.bind({});

CardOnlyTextAndButton.args = {
  widthCard: '300px',
  children: [
    <>
      <SoomCardContent>
        <p>This is the content</p>
      </SoomCardContent>
      <SoomCardActions>
        <SoomButton
          label="I'm a button"
          variant="outlined"
          handlerOnClick={handlerOnClick}
          dataTestId="btn-test"
          ariaLabel="This is a button for testing"
        ></SoomButton>
      </SoomCardActions>
    </>
  ]
};

CardWithImage.args = {
  widthCard: '300px',
  children: [
    <>
      <SoomCardMedia>
        <AddCircleOutlineIcon fontSize="large"></AddCircleOutlineIcon>
      </SoomCardMedia>
      <SoomCardContent>
        <p>This is the content</p>
      </SoomCardContent>
      <SoomCardActions>
        <SoomButton
          label="I'm a button"
          variant="outlined"
          handlerOnClick={handlerOnClick}
          dataTestId="btn-test"
          ariaLabel="This is a button for testing"
        ></SoomButton>
      </SoomCardActions>
    </>
  ]
};
