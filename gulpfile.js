'use strict';

let gulp = require('gulp'),
	jetpack = require('fs-jetpack'),
	babel = require('gulp-babel'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat');

let projectDir = jetpack,
	dst = projectDir.cwd('./dist');

gulp.task('clean', function(){
	return dst.dirAsync('.', {empty: true});
});

gulp.task('fonts', function(){
	return gulp.src([
		'bower_components/font-awesome/fonts/**',
		'bower_components/bootstrap/fonts/**'
	]).pipe(gulp.dest('dist/fonts'));
});

gulp.task('scripts', function(){
	return gulp.src([
		'bower_components/angular/angular.js',
		'bower_components/angular-route/angular-route.js',
		'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
		'bower_components/angular-audio/app/angular.audio.js',
		'bower_components/angular-cookies/angular-cookies.js',
		'src/js/**/*'
	]).pipe(babel({
		minified: true,
		comments: false
	})).
		on('error', function(e) {
			console.log('>>> ERROR', e.message);
			this.emit('end');
		}).
		pipe(concat('app.js')).
		pipe(gulp.dest('dist/js'));
});

gulp.task('styles', function(){
	return gulp.src('src/scss/app.scss').
		pipe(sass()).
		on('error', function(e){
			console.log('>>> ERROR', e.message);
			this.emit('end');
		}).
		pipe(gulp.dest('dist/css'));
});

gulp.task('templates', function(){
	return gulp.src('src/templates/**/*').
		pipe(gulp.dest('dist/templates'))
});

gulp.task('build', ['scripts', 'styles', 'templates']);

gulp.task('watch', function(){
	gulp.watch('src/js/**/*', ['scripts']);
	gulp.watch('src/scss/**/*', ['styles']);
	gulp.watch('src/templates/**/*', ['templates']);
});
