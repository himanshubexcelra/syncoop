export const KetcherAPI = (ketcherInstance: any) => {
  return {
    // Accepts CTAB as string
    renderFromCtab: function (str: any) {
      ketcherInstance.setMolecule(str);
    },

    clearSelection: function () {
      ketcherInstance.editor.selection(null);
    },

    selectAll: function () {
      ketcherInstance.editor.selection("all");
    },

    // Accepts IDs of atoms as an array of integers
    selectAtomsById: function (ids: any) {
      ketcherInstance.editor.selection({ atoms: ids });
    },

    // Returns Promise<string>
    exportCtab: function () {
      console.log(ketcherInstance);
      return ketcherInstance.getMolfile();
    },

    // Returns Promise<string>
    exportSmile: function () {
      return ketcherInstance.getSmiles();
    },

    getSelectedAtomId: function () {
      const selection = ketcherInstance.editor.selection();
      if (!selection?.atoms) {
        return null;
      }

      const atoms = selection.atoms.join(", ");

      return atoms;
    },

    // Accept color as a string
    highlightSelection: function (color: any) {
      const selection = ketcherInstance.editor.selection() || {};
      const { atoms, bonds } = selection;
      ketcherInstance.editor.highlights.create({ atoms, bonds, color });

      const allHighlights =
        ketcherInstance.editor.render.ctab.molecule.highlights;
      const lastHighlightID = Array.from(allHighlights.keys()).pop();
      const lastHighlight = allHighlights.get(lastHighlightID);

      return {
        lastHighlightID,
        lastHighlight,
      };
    },

    clearHighlights: function () {
      ketcherInstance.editor.highlights.clear();
    },

    getAllHighlights: function () {
      const highlights = ketcherInstance.editor.highlights.getAll();
      return highlights;
    },
    resetMolecule: function () {
      ketcherInstance.setMolecule('');
    },
  };
};
