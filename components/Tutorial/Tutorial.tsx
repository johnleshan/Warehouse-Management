'use client';

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTheme } from '../ThemeProvider';

interface TutorialProps {
    run: boolean;
    setRun: (run: boolean) => void;
    mode: 'basic' | 'advanced';
    onFinish?: (status: string) => void;
}

export function Tutorial({ run, setRun, mode, onFinish }: TutorialProps) {
    const { theme } = useTheme();

    // Basic Steps
    const basicSteps: Step[] = [
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
            disableOverlayClose: true,
        },
        {
            target: '#dashboard-header',
            content: 'This is your Command Center. See critical alerts and high-level status here.',
            placement: 'bottom',
            disableOverlayClose: true,
        },
        {
            target: '#dashboard-stats',
            content: 'Real-time statistics about inventory, orders, and staff performance.',
            placement: 'bottom',
            disableOverlayClose: true,
        },
        {
            target: '#app-sidebar',
            content: 'This sidebar is your main navigation hub. Access all different modules from here.',
            placement: 'right',
            disableOverlayClose: true,
        },
        {
            target: '#theme-toggle',
            content: 'Prefer dark mode? Toggle the theme here.',
            placement: 'bottom',
            disableOverlayClose: true,
        },
    ];

    // Advanced Steps
    const advancedSteps: Step[] = [
        {
            target: '#dashboard-header',
            content: 'Advanced Tour: We will now explore each module in detail.',
            placement: 'bottom',
            disableOverlayClose: true,
            disableBeacon: true,
        },
        {
            target: '#nav-inventory',
            content: 'Inventory Hub: Manage products, stock levels, and categories.',
            placement: 'right',
            disableOverlayClose: true,
        },
        {
            target: '#nav-orders',
            content: 'Order Gateway: Track incoming and outgoing orders.',
            placement: 'right',
            disableOverlayClose: true,
        },
        {
            target: '#nav-pos',
            content: 'Retail Terminal: The Point of Sale interface for cashiers.',
            placement: 'right',
            disableOverlayClose: true,
        },
        {
            target: '#nav-reports',
            content: 'Market Analytics: View detailed reports and trends.',
            placement: 'right',
            disableOverlayClose: true,
        },
        {
            target: '#nav-users',
            content: 'Identity Manager: Manage system users and roles.',
            placement: 'right',
            disableOverlayClose: true,
        },
        {
            target: '#nav-workers',
            content: 'Staff Directory: Manage warehouse staff and performance.',
            placement: 'right',
            disableOverlayClose: true,
        },
    ];

    const steps = mode === 'basic' ? basicSteps : advancedSteps;

    // Ensure disableBeacon is true for all steps to prevent "circle" on skip
    const stepsWithBeaconDisabled = steps.map(step => ({
        ...step,
        disableBeacon: true,
    }));

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            if (onFinish) {
                onFinish(status);
            }
        }
    };

    return (
        <Joyride
            steps={stepsWithBeaconDisabled}
            run={run}
            continuous
            showSkipButton
            showProgress
            callback={handleJoyrideCallback}
            disableScrollParentFix={true} // Prevents freeze on complex layouts
            floaterProps={{
                disableAnimation: true, // Reduces animation conflicts
            }}
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
