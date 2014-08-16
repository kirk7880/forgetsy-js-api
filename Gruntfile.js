module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: {
        src: [
          'cherry-api.js'
        ]
      },
      options: {
        "smarttabs": true,
        "debug": true,
        "devel": true,
        "undef": false,
        "laxcomma": true,
        "laxbreak": false,
        "jquery": true,
        "loopfunc": true,
        "sub": true
      }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: ['.', './lib/'],
          outdir: './docs/'
        }
      }
    },
    buster: {
      test: {
        config: './test/buster.js'
      }
    },
    nytd: {
      rpm: {
        build: {
          installPrefix: '',
          pre: 'rm -rf /var/nyt/cherry-api',
          files: [
            './controller',
            './node_modules/express',
            './node_modules/forgetsy-js',
            './node_modules/moment',
            './index.js',
            './lib',
            './bootstrap',
            './README.md'
          ],
          scrubsvn: false,
          target: './rpms',
          globalSettings: '%global __os_install_post %{nil}'
        }
      }
    },
    rpm: {
      options: {
          destination: 'target/rpm',
          defaultUsername: 'root',
          defaultGroupname: 'root',
          summary: '<%= pkg.description %>',
          license: 'MIT',
          group: 'Applications/Productivity'
      },
      files: [
          {src: ['lib/**/*.js'], dest: '/opt/<%= pkg.name %>'},
          {src: ['node_modules/**/*'], dest: '/opt/<%= pkg.name %>'},
          {src: ['index.js', 'package.json'], dest: '/opt/<%= pkg.name %>'}
      ],
      snapshot: {
          options: {
              release: false
          }
      },
      release: {
          options: {
              release: true
          }    
      }
    }
  });

  grunt.loadNpmTasks('grunt-rpm');
  grunt.loadNpmTasks('grunt-buster');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.registerTask('default', ['jshint', 'yuidoc', 'rpm']);

};