import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy'

export default defineConfig(getBuildConfig());

function getBuildConfig() {
    let versions = [null, 44];
    return versions.map(v => genBuildConfig(v)).flat()
}

function genBuildConfig(gnomeVersion) {
    let buildDir = gnomeVersion ? `build${gnomeVersion}` : 'build';
    let distDir = gnomeVersion ? `dist${gnomeVersion}` : 'dist';
    let metadataDir = gnomeVersion ? `src/gnome/${gnomeVersion}` : 'src/gnome';

    return [
        {
            input: `${buildDir}/extension/app.js`,
            output: {
                file: `${distDir}/extension.js`,
                format: "cjs",
                esModule: false,
            },
            plugins: [
                stripExports(),
            ]
        },
        {
            input: `${buildDir}/extension/prefs_builder.js`,
            output: {
                file: `${distDir}/prefs.js`,
                format: "cjs",
                esModule: false,
            },
            plugins: [
                stripExports(),
                copy({
                    targets: [
                        { src: 'LICENSE', dest: distDir },
                        { src: `${metadataDir}/metadata.json`, dest: distDir },
                        { src: 'src/layouts-default.json', dest: distDir },
                        { src: 'src/stylesheet.css', dest: distDir },
                        { src: 'src/images', dest: distDir },
                        { src: 'src/schemas/gschemas.compiled', dest: `${distDir}/schemas` },
                        { src: 'src/schemas/org.gnome.shell.extensions.gsnap.gschema.xml', dest: `${distDir}/schemas` },
                    ]
                })
            ]
        }
    ]
}

// Cleans up the generated bundle from lines like exports.XXXX
// This trick is a compromise between using the tree-shaker and
// still have functions that must not be cleaned up (such as
// the extension's enable/disable entrypoints). To let those
// functions live in the tree-shaken bundle, simply declare them
// as exported.
function stripExports() {
    return {
        name: 'strip-exports',
        renderChunk(code) {
            const re = /^exports\.\w+.*(\n|\r\n|)/gm;
            return code.replace(re, '');
        }
    };
}