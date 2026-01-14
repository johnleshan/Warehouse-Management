'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TutorialSuggestionProps {
    open: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export function TutorialSuggestion({ open, onAccept, onDecline }: TutorialSuggestionProps) {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Want to learn more?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You've completed the basics! Would you like a detailed tour of all the advanced features and modules?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onDecline}>No thanks</AlertDialogCancel>
                    <AlertDialogAction onClick={onAccept}>Show me</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
