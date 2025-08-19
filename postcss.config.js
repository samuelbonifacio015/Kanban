export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Optimizaciones para mejorar el rendimiento
    'cssnano': process.env.NODE_ENV === 'production' ? {
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
        colormin: true,
        minifyFontValues: true,
        minifySelectors: true,
        mergeLonghand: true,
        mergeRules: true,
        reduceIdents: false, // Mantener nombres de animaciones
        reduceInitial: true,
        reduceTransforms: true,
        uniqueSelectors: true,
        zindex: false, // Mantener z-index para componentes UI
      }]
    } : false,
  },
}
