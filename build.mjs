import dts from 'bun-plugin-dts'

await Bun.build({
	entrypoints: ['./src/index.ts'],
	outdir: './dist',
	external: ['react'],
	minify: true,
	plugins: [dts()],
})
