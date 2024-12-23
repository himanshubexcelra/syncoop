/*eslint max-len: ["error", { "code": 100 }]*/
'use client'
import { useEffect } from "react";
import { defineCustomElements } from "@/packages/chemuix/dist/esm/loader";
import { NodeType } from "@/lib/definition";

type PathwayImageProps = {
    children: React.ReactNode,
    pathwayId: string,
    nodes: NodeType[],
    style: object,
    width?: number,
    height?: number,
    currentReaction?: number,
    updatedAt?: number,
    updatedKey?: string,
}

type ElementType = {
    nodes: NodeType[],
    width?: number,
    height?: number,
    currentReaction?: number,
    updatedKey?: string,
    updatedAt?: number,
}

export default function PathwayImage({
    pathwayId,
    nodes,
    children,
    style,
    width = window?.innerWidth,
    height = window?.innerHeight,
    currentReaction,
    updatedAt,
    updatedKey
}: PathwayImageProps) {
    useEffect(() => {
        defineCustomElements(window);
    }, [updatedAt]);

    useEffect(() => {
        const element = document.querySelector("#" + pathwayId);
        if (element !== null) {
            const typedElement = element as unknown as ElementType;
            typedElement.nodes = nodes;
            typedElement.width = width;
            typedElement.height = height;
            typedElement.currentReaction = currentReaction;
            typedElement.updatedAt = updatedAt;
            typedElement.updatedKey = updatedKey;
        }
    }, [updatedAt, currentReaction, updatedKey]);

    return (
        <div style={style}>
            {
                // @ts-expect-error JSX element not recognized
                <reaction-pathway
                    id={pathwayId}
                    key={pathwayId}
                    nodes={JSON.stringify(nodes)}
                    width={width}
                    height={height}
                    currentReaction={currentReaction}
                    updatedKey={updatedKey}
                    display-reaction-reference="true"
                    display-reaction-name="true"
                    display-reaction-condition="true"
                    display-honeycomb="true" />
            }
            {children}
        </div>
    );
}