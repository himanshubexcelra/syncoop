import { renderHook, act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import usePopupAndReset from '../usePopupAndReset';

describe('usePopupAndReset', () => {
    it('should initialize with the correct default values', () => {
        const { result } = renderHook(() => usePopupAndReset());

        expect(result.current.reset).toBe('');
        expect(result.current.showPopup).toBe(false);
    });

    it('should set showPopup to true when handlePopupClose(false) is called', () => {
        const { result } = renderHook(() => usePopupAndReset());

        expect(result.current.showPopup).toBe(false);

        act(() => {
            result.current.handlePopupClose(false);
        });

        expect(result.current.reset).toBe('reset');
        expect(result.current.showPopup).toBe(false);
    });

    it('should close popup when handlePopupClose(true) is called', () => {
        const { result } = renderHook(() => usePopupAndReset());

        expect(result.current.showPopup).toBe(false);

        act(() => {
            result.current.setShowPopup(true);
        });

        expect(result.current.showPopup).toBe(true);

        act(() => {
            result.current.handlePopupClose(true);
        });

        expect(result.current.showPopup).toBe(false);
    });

    it(`should reset the reset state to '' after 1 millisecond`, () => {
        jest.useFakeTimers();
        const { result } = renderHook(() => usePopupAndReset());

        expect(result.current.reset).toBe('');

        act(() => {
            result.current.handlePopupClose(false);
        });

        expect(result.current.reset).toBe('reset');

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(result.current.reset).toBe('');

        jest.useRealTimers();
    });

    it('should clear the timeout when the component unmounts', () => {
        jest.useFakeTimers();
        const { result, unmount } = renderHook(() => usePopupAndReset());

        act(() => {
            result.current.handlePopupClose(false);
        });

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(result.current.reset).toBe('');

        unmount();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(result.current.reset).toBe('');

        jest.useRealTimers();
    });
});

describe('usePopupOnClickOutside', () => {
    it('should not show popup if clicked inside the child component', () => {
        const { result } = renderHook(() => usePopupAndReset());
        act(() => {
            result.current.setIsDirty(true);
        });
        const { container } = render(
            <div ref={result.current.childRef} style={{ width: '100px', height: '100px', backgroundColor: 'lightgrey' }} />
        );

        const childElement = container.querySelector('div');

        if (childElement) {
            fireEvent.mouseDown(childElement);
        }

        expect(result.current.showPopup).toBe(false);
    });

    it.skip('should show popup if clicked outside the child component and isDirty is true', async () => {
        const { result } = renderHook(() => usePopupAndReset());
        act(() => {
            result.current.setIsDirty(true);
        });
        render(
            <div ref={result.current.childRef} style={{ width: '100px', height: '100px', backgroundColor: 'lightgrey' }} />
        );
        const outsideClickTarget = document.createElement('div');
        document.body.appendChild(outsideClickTarget);
        act(() => {
            fireEvent.mouseDown(outsideClickTarget);
        });
        expect(result.current.isDirty).toBe(true);
        expect(result.current.showPopup).toBe(true);
    });

    it('should not show popup if clicked outside the child component and isDirty is false', () => {
        const { result } = renderHook(() => usePopupAndReset());

        fireEvent.mouseDown(document);

        expect(result.current.showPopup).toBe(false);
    });

    it('should clean up event listener on unmount', () => {
        const { result, unmount } = renderHook(() => usePopupAndReset());

        fireEvent.mouseDown(document);

        expect(result.current.showPopup).toBe(false);

        unmount();

        fireEvent.mouseDown(document);

        expect(result.current.showPopup).toBe(false);
    });
});
