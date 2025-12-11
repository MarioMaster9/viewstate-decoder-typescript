import terser from '@rollup/plugin-terser';

export default {
    input: 'src/decoder.js',
    output: {
        file: 'build/js/main.min.js',
        format: 'iife',
        plugins: [terser()],
    },
};