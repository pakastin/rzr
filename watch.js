
var watch = require('@pakastin/watch');

watch('src/**/*.js', 'npm run build', true);
watch('dist/rzr.js', 'npm run uglify', true);
