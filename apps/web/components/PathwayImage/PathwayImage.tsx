/* eslint-disable @typescript-eslint/no-namespace */
/*eslint max-len: ["error", { "code": 100 }]*/

'use client';
import React, { useEffect, useRef, memo, useCallback, useState } from 'react';
import { defineCustomElements } from '@/packages/chemuix/dist/esm/loader';
import { usePersistentCache } from './usePersistentCache';
import { NodeType } from '@/lib/definition';
import "./PathwayImage.css";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'reaction-pathway':
            React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                width?: number;
                height?: number;
                currentReaction?: number;
                updatedKey?: string;
                "display-reaction-reference"?: string;
                "display-reaction-name"?: string;
                "display-reaction-condition"?: string;
                "display-honeycomb"?: string;
            };
        }
    }
}

type PathwayImageProps = {
    children: React.ReactNode;
    pathwayId: string;
    key: string;
    nodes: NodeType[];
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    currentReaction?: number;
    updatedAt?: number;
    updatedKey?: string;
    setHideOpen: (disable: boolean) => void;
};

type ElementType = {
    nodes: NodeType[];
    width?: number;
    height?: number;
    currentReaction?: number;
    updatedKey?: string;
    updatedAt?: number;
};

const PathwayImage: React.FC<PathwayImageProps> = ({
    pathwayId,
    nodes = [],
    key,
    children,
    style = {},
    width = window.innerWidth,
    height = window.innerHeight,
    currentReaction,
    updatedAt,
    updatedKey,
    setHideOpen
}) => {
    const pathwayRef = useRef<HTMLElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const normalizedKey = `pathway-${pathwayId}`; // Ensure consistent key
    const [cachedNodes, setCachedNodes] = usePersistentCache(normalizedKey, nodes || []);


    useEffect(() => {
        // This will now properly update cache and UI
        if (nodes) setCachedNodes(nodes); // Ensure `nodes` is not null before updating
    }, [nodes, setCachedNodes]);

    // Initialize custom elements once
    useEffect(() => {
        defineCustomElements(window);
    }, [updatedAt]);

    // Optimize pathway updates
    const updatePathwayProperties = useCallback(() => {
        const element = pathwayRef.current as unknown as ElementType | null;
        if (element) {
            element.nodes = cachedNodes || [];
            element.width = width;
            element.height = height;
            element.currentReaction = currentReaction;
            element.updatedAt = updatedAt;
            element.updatedKey = updatedKey;
        }
    }, [cachedNodes, width, height, currentReaction, updatedAt, updatedKey]);

    // Apply updates when dependencies change
    useEffect(() => {
        updatePathwayProperties();
    }, [updatePathwayProperties]);

    // Function to check for the presence of the canvas inside Shadow DOM
    const checkCanvasExists = () => {
        const pathwayElement = pathwayRef.current;
        if (!pathwayElement) {
            requestAnimationFrame(checkCanvasExists);
            return;
        }

        // Access shadowRoot
        const shadowRoot = pathwayElement.shadowRoot;
        if (!shadowRoot) {
            requestAnimationFrame(checkCanvasExists);
            return;
        }

        // Find the .container div inside shadowRoot
        const container = shadowRoot.querySelector('.container');
        if (!container) {
            requestAnimationFrame(checkCanvasExists);
            return;
        }

        // Check for the canvas inside the container
        const canvas = container.querySelector('canvas');
        if (canvas) {
            // Force canvas width to match container width
            canvas.style.width = `${width}px`; // where width is 750 or your desired value
            // Also, update the overlay div if necessary
            const overlay = container.querySelector('div');
            if (overlay) {
                overlay.style.width = `${width}px`;
            }
            setIsLoading(false); // Hide loader when canvas appears
            setHideOpen(true);
        } else {
            requestAnimationFrame(checkCanvasExists); // Keep checking
        }
    };

    useEffect(() => {
        requestAnimationFrame(checkCanvasExists);
    }, []);

    return (
        <div style={style}>
            {isLoading && <div className="skeleton-loader" />}
            <div style={{
                display: isLoading
                    ? 'none' : 'block',
            }}>

                <reaction-pathway
                    id={pathwayId}
                    ref={pathwayRef as React.RefObject<any>}
                    height={height}
                    width={width}
                    currentReaction={currentReaction}
                    updatedKey={updatedKey}
                    key={key}
                    display-reaction-reference="true"
                    display-reaction-name="true"
                    display-reaction-condition="true"
                    display-honeycomb="true"
                />
                {!isLoading && <>{children}</>}
            </div>
        </div>
    );
};

export default memo(PathwayImage);
