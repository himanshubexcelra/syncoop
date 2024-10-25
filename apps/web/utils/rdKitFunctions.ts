export const getSmileStructure = (smiles: string): string => {
    if (typeof window !== 'undefined' && window.RDKit) {
        const displayProps = {
            width: 180,
            height: 140,
            bondLineWidth: 1,
            addStereoAnnotation: true,
            backgroundColor: [0, 0, 0, 0]
        } as any;
        const mol = window.RDKit.get_mol(smiles || 'invalid');
        const svg = mol.get_svg_with_highlights(JSON.stringify(displayProps));
        mol?.delete();
        if (svg) {
            return svg;
        } else {
            return 'Image is not there';
        }
    } else {
        return 'Error in RD Kit initiation.';
    }
}