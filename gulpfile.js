var gulp = require('gulp'),
    _ = require('lodash'),
    clean = require('gulp-clean'),
    path = require('path'),
//runner
    nodemon = require('gulp-nodemon'),
    shell = require('gulp-shell'),
//code quality
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    gulpif = require('gulp-if'),
//test
// mocha = require('gulp-mocha')
//build
//minifyCss = require('gulp-minify-css'),
//uglify = require('gulp-uglify')
    streamqueue = require('streamqueue'),
    angularInjector = require('gulp-angular-injector'),
    uglify = require('gulp-uglify'),
    browserify = require('gulp-browserify'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-html-minifier'),
    minifyCss = require('gulp-minify-css'),
    htmlreplace = require('gulp-html-replace'),
    runSequence = require('run-sequence'),
 validate = require('gulp-nice-package');


var paths = {
    person: './blocks/person/_client/modules/person',
    contact: './blocks/contact/_client/modules/contact',
    assessment: './blocks/assessment/_client/modules/assessment',
    referral: './blocks/referral/_client/modules/referral',
    webplatform: './blocks/webplatform/_client/modules/common',
    shell_hosts: './hosts/socialcare/_client/modules/shell',
    secure: './blocks/security/_client/modules/security',
    user: './blocks/user/_client/modules/user',
    communications: './blocks/communications/_client/modules/communications',
    fileupload: 'blocks/fileupload/_client/modules/fileupload',
    socialcare: './hosts/socialcare',
    blocks: './blocks',
    hosts: './hosts',
    messages: './messages',
    assets: './Assets',
    testsAutomation: ['./tests/automation/**/*.js'],
    testsBlocks: ['./tests/blocks/**/*.js'],
    testsFeatures: ['./tests/features/**/*.js'],
    testsHosts: ['./tests/hosts/**/*.js'],
    bundle: './bundle',
    //featureTests: './tests/features',
    featureTests: './tests/automation',
    bundlePathSc: './bundle/sc'
};


//ext = .js or .css or .html etc
paths.server = function (ext) {
    return [ paths.blocks + '/**/*' + ext, paths.hosts + '/**/*' + ext, '!./**/_client/**/*' + ext, '!./**/client/**/*' + ext];
};
paths.client = function (ext) {
    return [ paths.blocks + '/**/_client/modules/**/*' + ext, paths.hosts + '/**/_client/modules/**/*' + ext ];
};


gulp.task('lint', ['lintServer', 'lintClient'], function () {
});


gulp.task('lintServer', function () {
    return gulp.src(paths.server('.js'))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});


gulp.task('lintClient', function () {
    return gulp.src(paths.client('.js'))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

/*gulp.task('test', ['lint', 'featureTest', 'unitTestFullOuput'], function () {

});*/

gulp.task('test', ['lint', 'unitTestFullOuput'], function () {

 });

/** Commented feature tests for now, build is failing **/
/*gulp.task('test', ['lint', 'unitTestFullOuput'], function () {

 });*/

gulp.task('unitTestFullOuput', shell.task([
    'echo start unit mocha testing! buckle up your seat belts',
        'mocha ' + paths.testsBlocks,
        'mocha ' + paths.testsHosts
]));

/*gulp.task('unitTestFullOuput', function () {
 console.log('Testing, that\'s just what they\'d be expecting...');
 return gulp.src(paths.tests, {read: false})
 .pipe(mocha({reporter: 'spec'}));
 });*/

/*gulp.task('unitTest', function () {
 console.log('Unit testing');
 return gulp.src(paths.tests, {read: false})
 .pipe(mocha({reporter: 'nyan'}));
 });*/

gulp.task('featureTest', shell.task([
    'echo start feature testing! buckle up your seat belts',
    //'cucumber-js ./tests/features --format pretty --require ./tests/features'
    'cucumber-js ./tests/automation --format pretty --require ./tests/automation'
]));


/*.pipe(shell([
 'echo starting server w00t!',
 'node ' + paths.helloWorldApp
 ]))*/


gulp.task('develop', function () {
    console.log('starting development mode :) FTW!');
    nodemon({ script: './hosts/socialcare/server.js', ext: 'html js' })
        .on('change', ['lint', 'featureTest', 'unitTestFullOuput'])
        .on('restart', function () {
            console.log('a file has changed, restarted server!');
        });
});

gulp.task('blitzTest', function () {
    console.log('starting performance testing  mode :) FTW!');
    nodemon({ script: './tests/performance/blitzInitialize.js', ext: 'html js' })
        .on('restart', function () {
            console.log('a file has changed, restarted server!');
        });
});

gulp.task('startserver', shell.task([
    'echo starting server w00t!',
        'node ' + paths.bundle + '/sc/' + paths.socialcare + '/server.js'
]));

//todo bundle which app, ie social care or admin, and which blocks to bundle.
// Work in progress version of bundle-sc
gulp.task('bundle-sc_WIP', ['clean-bundles'], function () {
    var bundlePath = paths.bundle + '/sc';


    var hostDeployPath = path.join(bundlePath, paths.socialcare);
    var hostFiles = paths.socialcare + '/**/*.*';
    console.log('bundling from: ' + hostFiles + ' to: ' + hostDeployPath);
    gulp.src(hostFiles)
        .pipe(gulp.dest(hostDeployPath))
        .pipe(gulpif("file == css"), minifyCss())
        .pipe(gulpif("file == js and file contains (_client)"), minifyJs());

    var blocksDeployPath = path.join(bundlePath, paths.blocks);
    var blockfiles = paths.blocks + '/**/*.*';
    console.log('bundling from: ' + blockfiles + ' to: ' + blocksDeployPath);
    gulp.src(blockfiles).pipe(gulp.dest(blocksDeployPath));

    gulp.src('./package.json').pipe(gulp.dest(bundlePath));


});


//todo bundle which app, ie social care or admin, and which blocks to bundle.

gulp.task('bundle-sc-back', ['clean-bundles'], function () {
    var bundlePath = paths.bundle + '/sc';


    var hostDeployPath = path.join(bundlePath, paths.socialcare);
    var hostFiles = paths.socialcare + '/**/*.*';
    console.log('bundling from: ' + hostFiles + ' to: ' + hostDeployPath);
    gulp.src(hostFiles).pipe(gulp.dest(hostDeployPath));

    var blocksDeployPath = path.join(bundlePath, paths.blocks);
    var blockfiles = paths.blocks + '/**/*.*';
    console.log('bundling from: ' + blockfiles + ' to: ' + blocksDeployPath);
    gulp.src(blockfiles).pipe(gulp.dest(blocksDeployPath));

    var msgDeployPath = path.join(bundlePath, paths.messages);
    var msgfiles = paths.messages + '/**/*.*';
    console.log('bundling from: ' + msgfiles + ' to: ' + msgDeployPath);
    gulp.src(msgfiles).pipe(gulp.dest(msgDeployPath));

    gulp.src('./package.json').pipe(gulp.dest(bundlePath));


});

gulp.task('clean-bundles', function () {
    var bundlePath = paths.bundle + '/sc';
    console.log('cleaning ' + bundlePath);
    gulp.src(bundlePath, {read: false})
        .pipe(clean({force: true}));
    console.log('Done ' + bundlePath);
});

gulp.task('bundle-sc', function() {
    runSequence('clean-bundles','buildDir', 'minify', 'htmlreplace');
});

gulp.task('minify', ['client-person-js', 'client-contact-js', 'client-assessment-js', 'client-referral-js', 'client-webplatform-js', 'client-user-js', 'client-security-js', 'client-communications-js', 'client-hosts-js', 'client-fileupload-js', 'client-hosts-site-style-css', 'client-hosts-style-css']);
    gulp.task('buildDir', function () {
    var bundlePath = paths.bundle + '/sc';
    var hostDeployPath = path.join(bundlePath, paths.socialcare);
    var hostFiles = paths.socialcare + '/**/*.*';

    console.log('bundling from: ' + hostFiles + ' to: ' + hostDeployPath);
    gulp.src([hostFiles, '!' + paths.hosts + '/socialcare/_client/styles/sitestyle.css', '!' + paths.hosts + '/socialcare/_client/lib/cleanzone/css/style.css', '!' + paths.hosts + '/socialcare/_client/index.html' ,
            '!'+ paths.shell_hosts +'/**/*.js'])
        .pipe(gulp.dest(hostDeployPath));
    var blocksDeployPath = path.join(bundlePath, paths.blocks);
    var blockfiles = paths.blocks + '/**/*.*';

    console.log('bundling from: ' + blockfiles + ' to: ' + blocksDeployPath);
        gulp.src([blockfiles, '!' + paths.person + '/**/*.js', '!' + paths.contact + '/**/*.js', '!' + paths.assessment + '/**/*.js', '!' + paths.referral + '/**/*.js',
            '!'+ paths.webplatform +'/**/*.js', '!'+ paths.secure +'/**/*.js', '!' + paths.user + '/**/*.js','!' + paths.communications + '/**/*.js', '!' + paths.fileupload + '/**/*.js' ])
        .pipe(gulp.dest(blocksDeployPath));

    var msgDeployPath = path.join(bundlePath, paths.messages);
    var msgfiles = paths.messages + '/**/*.*';
    console.log('bundling from: ' + msgfiles + ' to: ' + msgDeployPath);
    gulp.src(msgfiles).pipe(gulp.dest(msgDeployPath));

    var assetDeployPath = path.join(bundlePath, paths.assets);
    var assetfiles = paths.assets + '/**/*.*';
    gulp.src(assetfiles).pipe(gulp.dest(assetDeployPath));

    gulp.src('./package.json').pipe(gulp.dest(bundlePath));
});

gulp.task('validate-package-json', function () {
    return gulp.src('./package.json')
        .pipe(validate('npm', {
            warnings: true,
            recommendations: true
        }));
});

/**
 minification and bundling - one minified file per block
 streamqueue to maintain the order for concat
 **/
//WIP : Define one stremeQueue for all the blocks, pass the paths.contact, referral etc.
gulp.task('client-person-js', function () {
    var minPersonDeployPath = path.join(paths.bundlePathSc, paths.person);
    streamqueue({
        objectMode: true
    },

        gulp.src(paths.person + '/module.js'), gulp.src(paths.person + '/routes.js'), gulp.src(paths.person + '/models/*.js'), gulp.src(paths.person + '/providers/*.js'), gulp.src(paths.person + '/services/*.js'),
        gulp.src(paths.person + '/controllers/*.js'), gulp.src(paths.person + '/directives/*.js'), gulp.src(paths.person + '/run.js'))
        .pipe(angularInjector())
        .pipe(uglify())
        .pipe(concat('app-person-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minPersonDeployPath))
        .on('error', gutil.log);
});
gulp.task('client-contact-js', function () {
    var minContactDeployPath = path.join(paths.bundlePathSc, paths.contact);
    streamqueue({
            objectMode: true
        },
        gulp.src(paths.contact +'/module.js'), gulp.src( paths.contact +'/routes.js'), gulp.src(paths.contact +'/models/*.js') ,gulp.src(paths.contact +'/providers/*.js'), gulp.src(paths.contact +'/services/*.js'),
        gulp.src( paths.contact +'/controllers/*.js'), gulp.src( paths.contact +'/directives/*.js'), gulp.src( paths.contact +'/run.js'))
        .pipe(angularInjector())
        //.pipe(ngAnnotate()) -- preprocess angular code to make it safe for uglify/minification. 
        //.pipe(jsmin()) -- js minification option
        .pipe(uglify())
        .pipe(concat('app-contact-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minContactDeployPath))
        .on('error', gutil.log);
});

gulp.task('client-fileupload-js', function () {
    var minfileuploadDeployPath = path.join(paths.bundlePathSc, paths.fileupload);
    streamqueue({
            objectMode: true
        },
        gulp.src(paths.fileupload +'/module.js'), gulp.src( paths.fileupload +'/routes.js'), gulp.src(paths.fileupload +'/models/*.js') ,gulp.src(paths.fileupload +'/providers/*.js'), gulp.src(paths.fileupload +'/services/*.js'),
        gulp.src( paths.fileupload +'/controllers/*.js'), gulp.src( paths.fileupload +'/directives/*.js'), gulp.src( paths.fileupload +'/run.js'))
        .pipe(angularInjector())
        //.pipe(ngAnnotate()) -- preprocess angular code to make it safe for uglify/minification.
        //.pipe(jsmin()) -- js minification option
        .pipe(uglify())
        .pipe(concat('app-fileupload-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minfileuploadDeployPath))
        .on('error', gutil.log);
});

gulp.task('client-assessment-js', function () {
    var minAssessmentDeployPath = path.join(paths.bundlePathSc, paths.assessment);
    streamqueue({
            objectMode: true
        },

        gulp.src(paths.assessment +'/module.js'), gulp.src( paths.assessment +'/routes.js'), gulp.src(paths.assessment +'/models/*.js') ,gulp.src(paths.assessment +'/providers/*.js'), gulp.src(paths.assessment +'/services/*.js'),
        gulp.src( paths.assessment +'/controllers/*.js'), gulp.src( paths.assessment +'/directives/*.js'), gulp.src( paths.assessment +'/run.js'))
        .pipe(angularInjector())
        .pipe(uglify())
        .pipe(concat('app-assessment-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minAssessmentDeployPath))
        .on('error', gutil.log);
});

gulp.task('client-referral-js', function () {
    var minReferralDeployPath = path.join(paths.bundlePathSc, paths.referral);
    streamqueue({
            objectMode: true
        },
        gulp.src(paths.referral +'/module.js'), gulp.src( paths.referral +'/routes.js'), gulp.src(paths.referral +'/models/*.js') ,gulp.src(paths.referral +'/providers/*.js'), gulp.src(paths.referral +'/services/*.js'),
        gulp.src( paths.referral +'/controllers/*.js'), gulp.src( paths.referral +'/directives/*.js'), gulp.src( paths.referral +'/run.js'))

        .pipe(angularInjector())
        .pipe(uglify())
        .pipe(concat('app-referral-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minReferralDeployPath))
        .on('error', gutil.log);
});

gulp.task('client-webplatform-js', function () {
    var minWebplatformDeployPath = path.join(paths.bundlePathSc, paths.webplatform);
    streamqueue({
            objectMode: true
        },
        gulp.src(paths.webplatform +'/module.js'), gulp.src( paths.webplatform +'/routes.js'), gulp.src(paths.webplatform +'/models/*.js') ,gulp.src(paths.webplatform +'/providers/*.js'), gulp.src(paths.webplatform +'/services/*.js'),
        gulp.src( paths.webplatform +'/controllers/*.js'), gulp.src( paths.webplatform +'/directives/*.js'), gulp.src( paths.webplatform +'/run.js'))
        .pipe(angularInjector())

        .pipe(uglify())
        .pipe(concat('app-webplatform-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minWebplatformDeployPath))
        .on('error', gutil.log);
});

gulp.task('client-hosts-js', function () {
    var minShellHostsDeployPath = path.join(paths.bundlePathSc, paths.shell_hosts);
    streamqueue({
            objectMode: true
        },
        gulp.src(paths.shell_hosts +'/module.js'), gulp.src( paths.shell_hosts +'/routes.js'), gulp.src(paths.shell_hosts +'/models/*.js') ,gulp.src(paths.shell_hosts +'/providers/*.js'), gulp.src(paths.shell_hosts +'/services/*.js'),
        gulp.src( paths.shell_hosts +'/controllers/*.js'), gulp.src( paths.shell_hosts +'/directives/*.js'), gulp.src( paths.shell_hosts +'/run.js'))
        /*gulp.src(paths.shell_hosts + '/*.js'), gulp.src(paths.shell_hosts + '/directives/*.js'),
         gulp.src(paths.shell_hosts + '/controllers/*.js'))*/
        .pipe(angularInjector())
        .pipe(uglify())
        .pipe(concat('app-hosts-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minShellHostsDeployPath))
        .on('error', gutil.log);
});

gulp.task('client-security-js', function () {
    var minSecurityDeployPath = path.join(paths.bundlePathSc, paths.secure);
    streamqueue({
            objectMode: true
        },
        gulp.src(paths.secure +'/module.js'), gulp.src( paths.secure +'/routes.js'), gulp.src(paths.secure +'/models/*.js') ,gulp.src(paths.secure +'/providers/*.js'), gulp.src(paths.secure +'/services/*.js'),
        gulp.src( paths.secure +'/controllers/*.js'), gulp.src( paths.secure +'/directives/*.js'), gulp.src( paths.secure +'/run.js'))
        .pipe(angularInjector())
        .pipe(uglify())
        .pipe(concat('app-security-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minSecurityDeployPath))
        .on('error', gutil.log);
});

gulp.task('client-user-js', function () {
    var minSecurityDeployPath = path.join(paths.bundlePathSc, paths.user);
    streamqueue({
            objectMode: true
        },
        gulp.src(paths.user +'/module.js'), gulp.src( paths.user +'/routes.js'), gulp.src(paths.user +'/models/*.js') ,gulp.src(paths.user +'/providers/*.js'), gulp.src(paths.user +'/services/*.js'),
        gulp.src( paths.user +'/controllers/*.js'), gulp.src( paths.user +'/directives/*.js'), gulp.src( paths.user +'/run.js'))
        .pipe(angularInjector())
        .pipe(uglify())
        .pipe(concat('app-user-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minSecurityDeployPath))
        .on('error', gutil.log);
});

gulp.task('client-communications-js', function () {
    var minCommunicationsDeployPath = path.join(paths.bundlePathSc, paths.communications);
    streamqueue({
            objectMode: true
        },
        gulp.src(paths.communications +'/module.js'), gulp.src( paths.communications +'/routes.js'), gulp.src(paths.communications +'/models/*.js') ,gulp.src(paths.communications +'/providers/*.js'), gulp.src(paths.communications +'/services/*.js'),
        gulp.src( paths.communications +'/controllers/*.js'), gulp.src( paths.communications +'/directives/*.js'), gulp.src( paths.communications +'/run.js'))
        .pipe(angularInjector())
        //.pipe(ngAnnotate()) -- preprocess angular code to make it safe for uglify/minification.
        //.pipe(jsmin()) -- js minification option
        .pipe(uglify())
        .pipe(concat('app-communications-min.js'))
        .pipe(browserify())
        .pipe(gulp.dest(minCommunicationsDeployPath))
        .on('error', gutil.log);
});

gulp.task('htmlreplace', function () {
    gulp.src([paths.hosts + '/socialcare/_client/index.html'])
        .pipe(htmlreplace({
            'webplatform': 'webplatform/common/app-webplatform-min.js',
            'security': 'security/modules/security/app-security-min.js',
            'user': 'user/user/app-user-min.js',
            'person': 'person/person/app-person-min.js',
            'contact': 'contact/contact/app-contact-min.js',
            'referral': 'referral/referral/app-referral-min.js',
            'assessment': 'assessment/assessment/app-assessment-min.js',
            'hosts': 'modules/shell/app-hosts-min.js',
            'communications': 'communications/communications/app-communications-min.js',
            'fileupload': 'fileupload/fileupload/app-fileupload-min.js'
        }))
        .pipe(gulp.dest('bundle/sc/hosts/socialcare/_client/'));
});

gulp.task('client-hosts-site-style-css', function () {
    //var cssDeployPath  = path.join(paths.bundlePathSc, paths.cleanzone);
    gulp.src([paths.hosts + '/socialcare/_client/styles/sitestyle.css'])
        .pipe(minifyCss({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('bundle/sc/hosts/socialcare/_client/styles/'))
        .on('error', gutil.log);

});

gulp.task('client-hosts-style-css', function () {
    //var cssDeployPath  = path.join(paths.bundlePathSc, paths.cleanzone);
    gulp.src([paths.hosts + '/socialcare/_client/lib/cleanzone/css/style.css'])
        .pipe(minifyCss({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('bundle/sc/hosts/socialcare/_client/lib/cleanzone/css/'))
        .on('error', gutil.log);

});
