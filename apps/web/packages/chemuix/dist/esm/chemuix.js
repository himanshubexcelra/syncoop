import { p as promiseResolve, b as bootstrapLazy } from './index-ab23c249.js';
export { s as setNonce } from './index-ab23c249.js';

/*
 Stencil Client Patch Browser v4.0.4 | MIT Licensed | https://stenciljs.com
 */
const patchBrowser = () => {
    const importMeta = import.meta.url;
    const opts = {};
    if (importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    return promiseResolve(opts);
};

patchBrowser().then(options => {
  return bootstrapLazy([["reaction-pathway",[[1,"reaction-pathway",{"nodes":[16],"enable3D":[4,"enable-3-d"],"displayScore":[4,"display-score"],"displayHoneycomb":[4,"display-honeycomb"],"displayPathway":[4,"display-pathway"],"displayReactionReference":[4,"display-reaction-reference"],"displayReactionName":[4,"display-reaction-name"],"displayReactionCondition":[4,"display-reaction-condition"],"zoomReset":[64],"zoomIn":[64],"zoomOut":[64]},[[1,"pointerdown","handlePointerDown"],[1,"pointerup","handlePointerUp"]]]]],["reaction-pathway-test-wrapper",[[0,"reaction-pathway-test-wrapper",{"type":[1],"enable3D":[4,"enable-3-d"],"displayScore":[4,"display-score"],"displayHoneycomb":[4,"display-honeycomb"],"displayPathway":[4,"display-pathway"],"displayReactionReference":[4,"display-reaction-reference"],"displayReactionName":[4,"display-reaction-name"],"displayReactionCondition":[4,"display-reaction-condition"]}]]]], options);
});

//# sourceMappingURL=chemuix.js.map