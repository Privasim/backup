import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { AutomationExposureCard } from './automation-exposure-card';

export default {
  title: 'Components/Visualizations/AutomationExposureCard',
  component: AutomationExposureCard,
  argTypes: {
    topN: { control: 'number' },
    minExposure: { control: 'number' },
  },
} as Meta;

const Template: StoryFn = (args) => <AutomationExposureCard {...args} />;

export const WithData = Template.bind({});
WithData.args = {
  insights: {
    automationExposure: [
      { task: 'Data Entry', exposure: 95 },
      { task: 'Customer Service', exposure: 75 },
      { task: 'Bookkeeping', exposure: 85 },
      { task: 'Assembly Line Work', exposure: 90 },
      { task: 'Basic Coding', exposure: 65 },
      { task: 'Quality Control', exposure: 70 },
      { task: 'Inventory Management', exposure: 55 },
      { task: 'Basic Analysis', exposure: 60 },
      { task: 'Scheduling', exposure: 50 },
      { task: 'Simple Design', exposure: 45 },
    ],
  },
  title: 'Automation Exposure Risk',
  topN: 8,
  minExposure: 10,
};

export const EmptyState = Template.bind({});
EmptyState.args = {};

export const WithMinExposureFilter = Template.bind({});
WithMinExposureFilter.args = {
  insights: {
    automationExposure: [
      { task: 'Data Entry', exposure: 95 },
      { task: 'Customer Service', exposure: 75 },
      { task: 'Bookkeeping', exposure: 85 },
      { task: 'Assembly Line Work', exposure: 90 },
      { task: 'Basic Coding', exposure: 65 },
      { task: 'Quality Control', exposure: 70 },
      { task: 'Inventory Management', exposure: 55 },
      { task: 'Basic Analysis', exposure: 60 },
      { task: 'Scheduling', exposure: 50 },
      { task: 'Simple Design', exposure: 45 },
    ],
  },
  title: 'High Risk Automation Exposure',
  topN: 5,
  minExposure: 70,
};
