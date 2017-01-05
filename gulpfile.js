var gulp = require('gulp');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
var streamqueue = require('streamqueue');
var fs = require('fs');
var through = require('through2');
var del = require('del');
var gutil = require('gulp-util');

var config = {
    translations: {
        src: 'bower_components/country-list/data/*/country.json',
        dest: './src/translations'
    }
};

gulp.task('default', ['minify', 'connect', 'watch']);

gulp.task('connect', function () {
  connect.server({
    root: ['demo', './'],
    livereload: true
  });
});

gulp.task('reload', ['minify'], function () {
  gulp.src('./dist/**/*.*').pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./src/**', './demo/**'], ['reload']);
});

gulp.task('minify', function () {
  var files = JSON.parse(fs.readFileSync('sources.json', 'utf-8'));
  var stream = streamqueue({ objectMode: true },
    gulp.src(['src/templates/**/*.html']).pipe(templateCache({
      standalone: true,
      root: 'src/templates/'
    })),
    gulp.src(files)
  )
  .pipe(concat('angular-schema-form-country-select.js'))
  .pipe(gulp.dest('./dist'))
  .pipe(uglify())
  .pipe(rename('angular-schema-form-country-select.min.js'))
  .pipe(gulp.dest('./dist'));

  return stream;
});

gulp.task('clean-translations', function() {
    return del([config.translations.dest]);
});

gulp.task('translations', ['clean-translations'], function () {
    var TEMPLATE = 'angular.module(\'<%= module %>\').value(\'<%= name %>\', <%= value %>);';

    gulp
        .src([config.translations.src])
        .pipe(through.obj(function (file, encoding, callback) {


            if (!file.isNull()) {
                var countriesObject = JSON.parse(file.contents.toString('utf8'));

                var countries = [];
                for (var iso in countriesObject) {
                    countries.push({
                        iso: iso,
                        name: countriesObject[iso]
                    });
                }

                file.contents = new Buffer(gutil.template(TEMPLATE, {
                    module: 'angularSchemaFormCountrySelect',
                    name: 'angularSchemaFormCountrySelectCountries',
                    value: JSON.stringify(countries),
                    file: file
                }));
            }

            callback(null, file);
         }))
        .pipe(rename(function(path) {
            path.basename = path.dirname;
            path.dirname = '';
            path.extname = '.js';
        }))
        .pipe(gulp.dest(config.translations.dest))
    ;
});