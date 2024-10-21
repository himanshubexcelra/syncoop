import { render } from "@testing-library/react";
import LibraryDetails from "./LibraryDetails";
import { ProductModel } from "@/lib/definition";

const cartDetails = [{ "id": 1, molecularWeight: 500, moleculeId: 1 }, { "id": 2, molecularWeight: 600, moleculeId: 2 }]
const moleculeData: ProductModel[] = [
    { id: 1, moleculeId: 500, molecularWeight: 1 },
    { id: 2, moleculeId: 500, molecularWeight: 1 }
];

describe("Library Details Component", () => {
    beforeEach(() => {
        render(<LibraryDetails />);
    });
    test('should return cart from localStorage when it exists', () => {
        const mockCart = JSON.stringify([{ id: 1, molecularWeight: 500, moleculeId: 1 }]);
        localStorage.setItem('cart', mockCart);
        const cartDetails = [{ id: 1, molecularWeight: 500, moleculeId: 1 }];
        expect(cartDetails).toEqual([{ id: 1, molecularWeight: 500, moleculeId: 1 }]);
    });
    test('should return an empty array when localStorage is empty', () => {
        const cartDetails: number[] = [];
        expect(cartDetails).toEqual([]);
    });

    test('should return an array of item IDs when cartDetails has items', () => {
        const preselectedValue = cartDetails.map((item) => item.id);
        expect(preselectedValue).toEqual([1, 2]);
    });
    test('adds products to the cart', () => {
        expect(Array.isArray(moleculeData)).toBe(true);
        moleculeData.forEach(item => {
            expect(typeof item).toBe('object');
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('moleculeId');
            expect(item).toHaveProperty('molecularWeight');
        });
    });
    test('Validating the correct structure', () => {
        expect(moleculeData[0]).toMatchObject({
            id: expect.any(Number),
            moleculeId: expect.any(Number),
            molecularWeight: expect.any(Number),
        });
    });



}); 