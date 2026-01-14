'use client';

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTheme } from '../ThemeProvider';

interface TutorialProps {
    run: boolean;
    setRun: (run: boolean) => void;
}

export function Tutorial({ run, setRun }: TutorialProps) {
    const { theme } = useTheme();

    // Define steps
    const steps: Step[] = [
        {
            target: 'body',
            content: (
                <div>
                    <h2 className="text-xl font-bold mb-2">Welcome to WMS!</h2>
                    <p>Let's take a quick tour of the Warehouse Management System.</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '#app-sidebar',
            content: 'This sidebar is your main navigation hub. Access all different modules from here.',
            placement: 'right',
        },
        {
            target: '#theme-toggle',
            content: 'Prefer dark mode? Toggle the theme here.',
            placement: 'bottom',
        },
        // Add more steps as we identify more IDs
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            // Verify step: Confirm persistence logic will be in parent or here
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#2563eb', // blue-600
                    zIndex: 1000,
                    textColor: theme === 'dark' ? '#fff' : '#000',
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', // slate-800 or white
                    arrowColor: theme === 'dark' ? '#1e293b' : '#fff',
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: '#2563eb',
                },
                buttonBack: {
                    color: theme === 'dark' ? '#fff' : '#2563eb',
                }
            }}
        />
    );
}
