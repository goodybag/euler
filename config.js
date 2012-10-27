var config = {
  dev: {
    mongoConnStr: "mongodb://127.0.0.1:1337/goodybag"
  , cookieSecret: "g00dybagr0cks!"
  , numWorkers: 4
  , port: 3004
  , validationOptions: {
      singleError: false
    }
  }
, production: {

  }
};

module.exports = config[process.env.mode || 'dev'];