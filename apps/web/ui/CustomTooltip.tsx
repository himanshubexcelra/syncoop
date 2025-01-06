import React, { ReactNode } from 'react';
import { Tooltip } from 'devextreme-react';

interface CustomTooltipProps {
    id: string;
    children: ReactNode;
}

export default function CustomTooltip({
    id,
    children
}: CustomTooltipProps) {
    const target = `#${id}`;
    return (
        <Tooltip
            target={target}
            showEvent="mouseenter"
            hideEvent="mouseleave"
            position="top"
            hideOnOutsideClick={false}
        >
            {children}
        </Tooltip>
    );
};
