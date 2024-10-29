'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-0c320a98.js');

/*
 Stencil Client Patch Browser v4.0.4 | MIT Licensed | https://stenciljs.com
 */
const patchBrowser = () => {
    const importMeta = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('chemuix.cjs.js', document.baseURI).href));
    const opts = {};
    if (importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    return index.promiseResolve(opts);
};

patchBrowser().then(options => {
  return index.bootstrapLazy([["reaction-pathway.cjs",[[1,"reaction-pathway",{"nodes":[16],"enable3D":[4,"enable-3-d"],"displayScore":[4,"display-score"],"displayHoneycomb":[4,"display-honeycomb"],"displayPathway":[4,"display-pathway"],"displayReactionReference":[4,"display-reaction-reference"],"displayReactionName":[4,"display-reaction-name"],"displayReactionCondition":[4,"display-reaction-condition"],"zoomReset":[64],"zoomIn":[64],"zoomOut":[64]},[[1,"pointerdown","handlePointerDown"],[1,"pointerup","handlePointerUp"]]]]],["reaction-pathway-test-wrapper.cjs",[[0,"reaction-pathway-test-wrapper",{"type":[1],"enable3D":[4,"enable-3-d"],"displayScore":[4,"display-score"],"displayHoneycomb":[4,"display-honeycomb"],"displayPathway":[4,"display-pathway"],"displayReactionReference":[4,"display-reaction-reference"],"displayReactionName":[4,"display-reaction-name"],"displayReactionCondition":[4,"display-reaction-condition"]}]]]], options);
});

exports.setNonce = index.setNonce;

//# sourceMappingURL=chemuix.cjs.js.map