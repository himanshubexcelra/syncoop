import { ExpandTextType } from "@/lib/definition";
import { useRef, useEffect, useState } from "react";

export default function TextWithToggle({ id, text, isExpanded, toggleExpanded, heading, clamp, component }: ExpandTextType) {
    const textRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);
    const height = `${clamp * 1.4}em`;

    let clampClass = `clamp-data-${clamp} max-h-[${height}`;
    const customClass = `overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-full' : clampClass}`

    useEffect(() => {
        if (textRef.current) {
            const { scrollHeight, clientHeight } = textRef.current;
            // Check if the text exceeds the height of 2 lines
            setIsTruncated(scrollHeight > clientHeight);
        }
    }, [text]);


    return (
        <div className="flex justify-between items-end">
            <div
                ref={textRef}
                className={customClass}
            >
                {heading ? `${heading}` : ''}
                <span>
                    {text}
                </span>
            </div>
            {isTruncated && (
                <button
                    className="text-themeBlueColor mb-[1px]"
                    onClick={() => toggleExpanded(id, component)}
                >
                    {isExpanded ? 'less' : 'more'}
                </button>
            )}
        </div>
    );
};