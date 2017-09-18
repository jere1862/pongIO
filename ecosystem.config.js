module.exports = {
  apps: [{
    name: 'pongIO',
    script: './src/bin/www'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-13-58-226-192.us-east-2.compute.amazonaws.com',
      key: '../pongio-keypair.pem',
      ref: 'origin/master',
      repo: 'git@github.com:jere1862/pongIO.git',
      path: '/home/ubuntu/pongIO',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}