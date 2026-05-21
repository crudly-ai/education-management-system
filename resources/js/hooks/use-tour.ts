import { useState, useCallback } from 'react';

export interface TourStep {
  target: string;
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  hideCloseButton?: boolean;
  hideFooter?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  styles?: any;
}

export const useTour = (tourKey: string) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = useCallback(() => {
    // Check if user has already seen this tour
    const hasSeenTour = localStorage.getItem(`tour-${tourKey}-completed`);
    if (!hasSeenTour) {
      setRun(true);
      setStepIndex(0);
    }
  }, [tourKey]);

  const stopTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(`tour-${tourKey}-completed`, 'true');
    setRun(false);
    setStepIndex(0);
  }, [tourKey]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(`tour-${tourKey}-completed`);
  }, [tourKey]);

  const handleJoyrideCallback = useCallback((data: any) => {
    const { action, index, status, type } = data;

    if (type === 'step:after' || type === 'target:not-found') {
      setStepIndex(index + (action === 'prev' ? -1 : 1));
    } else if (status === 'finished' || status === 'skipped') {
      completeTour();
    }
  }, [completeTour]);

  return {
    run,
    stepIndex,
    startTour,
    stopTour,
    completeTour,
    resetTour,
    handleJoyrideCallback,
  };
};