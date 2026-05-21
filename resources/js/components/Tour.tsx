import React from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { TourStep } from '@/hooks/use-tour';
import { useBrand } from '@/contexts/brand-context';

interface TourProps {
  steps: TourStep[];
  run: boolean;
  stepIndex: number;
  onCallback: (data: CallBackProps) => void;
}

export default function Tour({ steps, run, stepIndex, onCallback }: TourProps) {
  const { getPrimaryColor } = useBrand();
  const primaryColor = getPrimaryColor();
  
  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={onCallback}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      scrollToFirstStep={true}
      scrollOffset={100}
      styles={{
        options: {
          primaryColor: primaryColor,
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: '#ffffff',
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: '12px',
          fontSize: '14px !important',
          padding: '20px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e7eb',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#1f2937',
        },
        tooltipContent: {
          lineHeight: '1.6',
          color: '#4b5563',
          fontSize: '14px',
        },
        buttonNext: {
          backgroundColor: primaryColor,
          color: '#ffffff',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '12px',
          backgroundColor: 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '14px',
          cursor: 'pointer',
        },
        buttonSkip: {
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer',
        },
        buttonClose: {
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}